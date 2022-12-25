import { Param } from '$lib/enums/param';
import { error, redirect, type Redirect, type RequestEvent } from '@sveltejs/kit';
import type { AuthResult } from './bd/models/token';
import cookieParser from 'set-cookie-parser';

const DEFAULT_PASSPORT_REDIRECT = '/passport';

function isUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function getPassportOnAuthRedirect(event: RequestEvent): Redirect {
	const initiator = event.url.searchParams.get(Param.INITIAOR);
	const isInitiatorValid = !!initiator && isUrl(initiator);
	const location = isInitiatorValid ? initiator : DEFAULT_PASSPORT_REDIRECT;

	console.debug(
		`[getPassportOnAuthRedirect] on auth redirect to: ${initiator ?? 'default passport page'}`
	);
	return redirect(307, location);
}

export async function auth({
	fetch,
	request: { headers },
	cookies
}: RequestEvent): Promise<AuthResult> {
	const authResponse = await fetch('/passport/auth', { headers });
	const cookie = authResponse.headers.get('Set-Cookie');

	if (cookie) {
		const authcookies = cookieParser.splitCookiesString(cookie);
		for (const cookieStr of authcookies) {
			const cookie = cookieParser.parseString(cookieStr);

			cookies.set(cookie.name, cookie.value, { ...cookie, secure: cookie.secure ?? false });
		}
	}

	if (authResponse.ok) {
		return await authResponse.json();
	}

	if (authResponse.status === 403) {
		console.debug(`[auth] ERROR 403. redirect to /passport/login`);
		throw redirect(307, '/passport/login');
	}

	throw error(authResponse.status, authResponse.statusText);
}
