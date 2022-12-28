import { AuthorizationService } from '$passport/authorization-service';
import { PassportModel } from '$passport/bd/models/passport-model';
import { error } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './[userId]/$types';
import { parseIntOrThrowError } from '$lib/utils/asserts';

const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');

export const POST: RequestHandler = async (event: RequestEvent) => {
	console.debug(`(POST) /passport/${event.params.userId}/checkout`);

	const newActiveUserId = parseIntOrThrowError(event.params.userId, invalidUserIdError);
	const { accessToken, refreshToken } = await AuthorizationService.getTokens(event);
	const token = accessToken ?? refreshToken;

	if (!token) {
		throw error(403, 'Не автризован');
	}

	const { userId, passiveUserIds } = await token.getActiveAndPassiveUserIds();

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

	return new Response(null, { status: 200 });
};
