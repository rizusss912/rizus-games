import type { RequestEvent } from './$types';
import { AuthorizationService } from '$passport/authorization-service';
import { PassportModel } from '$passport/bd/models/passport-model';
import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event: RequestEvent) => {
	console.debug(`(GET) /passport/auth`);
	const { accessToken, refreshToken } = await AuthorizationService.getTokens(event);

	if (accessToken) {
		const { userId, passiveUserIds } = await accessToken.getActiveAndPassiveUserIds();

		//NOTE(rizus): если нет активного юзера, то редиректим на login, чтобы пользователь сам выбрал его
		if (!userId) {
			console.debug(`[/passport/auth] ERROR 403. Has not active user`);
			throw error(403, 'Has not active user');
		}

		const authData = await AuthorizationService.getAuthResult({ userId, passiveUserIds });
		return new Response(JSON.stringify(authData));
	}

	//NOTE(rizus): если нет токенов, то просим войти
	if (!refreshToken) {
		console.debug(`[/passport/auth] ERROR 403. Has not valid tokens`);
		throw error(403, 'Has not valid tokens');
	}
	const { userId, passiveUserIds } = await refreshToken.getActiveAndPassiveUserIds();

	//NOTE(rizus): если нет активного юзера, то редиректим на login, чтобы пользователь сам выбрал его
	if (!userId) {
		console.debug(`[/passport/auth] ERROR 403. Has not active user`);
		throw error(403, 'Has not active user');
	}

	const transaction = await PassportModel.startTransaction();
	try {
		await AuthorizationService.refreshTokens({
			accessToken,
			refreshToken,
			transaction,
			event,
			userId,
			passiveUserIds
		});

		const authData = await AuthorizationService.getAuthResult({ userId, passiveUserIds });

		await transaction.commit();
		return new Response(JSON.stringify(authData));
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
};
