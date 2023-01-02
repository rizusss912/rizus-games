import { error, type Actions } from '@sveltejs/kit';
import { AuthorizationService } from '$passport/authorization-service';
import { PassportModel } from '$passport/bd/models/passport-model';
import { parseIntOrThrowError } from '$lib/utils/asserts';

//TODO(rizus): Можно удалять только запись в UserToken, пока не знаю как лучше
export const actions: Actions = {
	default: async function (event) {
		const userIdInParams = event.params.userId;

		console.debug(`(POST) /passport/${userIdInParams}`);

		const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');
		const removableUserId = parseIntOrThrowError(userIdInParams, invalidUserIdError);
		const { accessToken, refreshToken } = await AuthorizationService.getTokens(event);
		const token = accessToken ?? refreshToken;

		if (!token) {
			console.debug(`[/passport/loginout/${userIdInParams}] was no login to the account anyway`);

			return { susses: true, status: 200 };
		}

		const { userId, passiveUserIds } = await token.getActiveAndPassiveUserIds();

		if (userId !== removableUserId && !passiveUserIds.includes(removableUserId)) {
			console.debug(`[/passport/loginout/${userIdInParams}] was no login to the account anyway`);

			return { susses: true, status: 208 };
		}

		const transaction = await PassportModel.startTransaction();

		try {
			if (passiveUserIds.length === 0) {
				await AuthorizationService.removeActiveTokens({ event, transaction });
				await transaction.commit();

				console.debug(`[/passport/loginout/${userIdInParams}] log out of the last account`);

				return { susses: true, status: 200 };
			}

			if (userId === removableUserId) {
				const newUserId = passiveUserIds.shift()!;

				await AuthorizationService.removeAndCreateTokens({
					userId: newUserId,
					event,
					transaction,
					passiveUserIds
				});
				await transaction.commit();

				console.debug(`[/passport/loginout/${userIdInParams}] log out of a single account`);

				return { susses: true, status: 200 };
			}

			await AuthorizationService.removeAndCreateTokens({
				userId: userId!,
				event,
				transaction,
				passiveUserIds: passiveUserIds.filter((id) => id !== removableUserId)
			});
			await transaction.commit();

			console.debug(`[/passport/loginout/${userIdInParams}] log out of a passive account`);

			return { susses: true, status: 200 };
		} catch (error) {
			await transaction.rollback();

			throw error;
		}
	}
};
