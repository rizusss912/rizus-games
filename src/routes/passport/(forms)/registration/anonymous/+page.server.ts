import { Cookies } from '$lib/enums/cookie';
import { selectFormData } from '$lib/utils/form';
import { error } from '@sveltejs/kit';
import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../form.const';
import { getPassportOnAuthRedirect } from '../../../passport.utils';
import type { Actions } from './$types';

interface AnonymousFormData extends Record<string, string | null> {
	login: string | null;
}

function validateData({ login }: AnonymousFormData) {
	if (!login) {
		throw error(400, 'Login is required');
	}

	if (login.length > LOGIN_MAX_LENGTH) {
		throw error(400, `Login must be shorter than ${LOGIN_MAX_LENGTH} characters`);
	}

	if (login.length < LOGIN_MIN_LENGTH) {
		throw error(400, `Login must be more than ${LOGIN_MIN_LENGTH} characters`);
	}
}

export const actions: Actions = {
	default: async function (event) {
		const anonymousData = await selectFormData<AnonymousFormData>(event);

		validateData(anonymousData);

		const anonymousId = crypto.randomUUID();
		event.cookies.set(Cookies.ANONYMOUS_ID, anonymousId, {
			httpOnly: true,
			secure: true,
			maxAge: 90 * 24 * 60 * 60, // 90 дней
			path: '/'
		});

		throw getPassportOnAuthRedirect(event);
	}
};
