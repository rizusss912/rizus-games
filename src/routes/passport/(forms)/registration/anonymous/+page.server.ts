import { Cookies } from '$lib/enums/cookie';
import { selectFormData } from '$lib/utils/form';
import { error } from '@sveltejs/kit';
import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../form.const';
import {
	createAccessToken,
	createRefreshToken,
	getPassportOnAuthRedirect
} from '../../../passport.utils';
import type { Actions } from './$types';
import { ACCESS_TOKEN_LIFETIME_SEC, REFRESH_TOKEN_LIFETIME_SEC } from 'src/routes/passport/consts';
import { AuthorizationService } from 'src/routes/passport/authorization.service';

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

		AuthorizationService.registration()

		throw getPassportOnAuthRedirect(event);
	}
};
