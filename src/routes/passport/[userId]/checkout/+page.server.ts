import { AuthorizationService } from '$passport/authorization-service';
import { PassportModel } from '$passport/bd/models/passport-model';
import { error, type Actions } from '@sveltejs/kit';
import { parseIntOrThrowError } from '$lib/utils/asserts';
import { getPassportOnAuthRedirect } from '$passport/passport.utils';

const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');

export const actions: Actions = {
	default: async function (event) {
		console.debug(`(POST) /passport/${event.params.userId}/checkout`);

		const newActiveUserId = parseIntOrThrowError(event.params.userId, invalidUserIdError);
		const { accessToken, refreshToken } = await AuthorizationService.getTokens(event);
		const token = accessToken ?? refreshToken;

		if (!token) {
			throw error(403, 'Не автризован');
		}

		const { userId, passiveUserIds } = await token.getActiveAndPassiveUserIds();

		if (userId === newActiveUserId) {
			throw getPassportOnAuthRedirect(event);
		}

		if (!passiveUserIds.includes(newActiveUserId)) {
			throw error(403, 'Не автризован');
		}

		const newPassiveUserIds = passiveUserIds
			.filter((id) => id !== newActiveUserId)
			.concat(userId ? [userId] : []);
		const transaction = await PassportModel.startTransaction();

		try {
			await AuthorizationService.refreshTokens({
				userId: newActiveUserId,
				passiveUserIds: newPassiveUserIds,
				event,
				transaction,
				accessToken,
				refreshToken
			});

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();

			throw error;
		}

		console.debug(`(POST) /passport/${event.params.userId}/checkout SUCCESS`);

		throw getPassportOnAuthRedirect(event);
	}
};
