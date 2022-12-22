import type { RequestHandler } from './$types';
import type { RequestEvent } from '../(forms)/registration/anonymous/$types';
import { AuthorizationService } from '../authorization-service';
import { PassportModel } from '../bd/models/passport-model';
import { Cookies } from '$lib/enums/cookie';

export const POST: RequestHandler = async (event: RequestEvent) => {
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

	return new Response(null, { status: 200, statusText: 'log out of all accounts' });
};
