import { error } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';
import { PasswordAuth } from '$passport/bd/models/password-auth';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const { login } = event.params;

	console.debug(`(GET) /passport/login/check/${login}`);

	if (!login) {
		return error(400, 'Пустой логин');
	}

	const passwordAuth = await PasswordAuth.getAuthByLogin(login);

	return new Response(JSON.stringify({ isAlreadyBusy: Boolean(passwordAuth) }), { status: 200 });
};
