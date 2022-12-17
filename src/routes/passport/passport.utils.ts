import { Param } from '$lib/enums/param';
import { redirect, type Redirect, type RequestEvent } from '@sveltejs/kit';

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

	return redirect(307, location);
}
