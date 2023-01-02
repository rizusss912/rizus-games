import { AuthorizationService } from '$passport/authorization-service';
import { PassportModel } from '$passport/bd/models/passport-model';
import { Cookies } from '$lib/enums/cookie';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async function (event) {
		console.debug(`(POST) /passport/loginout`);

		const transaction = await PassportModel.startTransaction();

		try {
			await AuthorizationService.removeActiveTokens({ event, transaction });

			event.cookies.delete(Cookies.ACCESS_TOKEN, { path: '/' });
			event.cookies.delete(Cookies.REFRESH_TOKEN, { path: '/' });

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();

			throw error;
		}

		console.debug(`[/passport/loginout] SUCCESS log out of all accounts`);

		return { susses: true };
	}
};
