import { selectFormDataAndValidate } from '$lib/utils/form';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { auth, getPassportOnAuthRedirect } from '$passport/passport.utils';
import type { Actions } from './$types';
import { PassportModel } from '$passport/bd/models/passport-model';
import { AuthType } from '$lib/enums/auth-type';
import type { PageServerLoad } from './$types';
import { AnonymousAuth } from '$passport/bd/models/anonymous-auth';
import { AuthorizationService } from '$passport/authorization-service';
import { jsonValidationFactory, merge, type Json } from '$lib/utils/validation';
import { validators } from '$passport/validators';

interface AnonymousFormData extends Json {
	login: string;
}

async function redirectToPasswordAuthIfHasAuth(event: RequestEvent) {
	let authData;

	try {
		authData = await auth(event);
	} catch {
		return;
	}

	if (authData.userData.authTypes.includes(AuthType.PASSWORD)) {
		console.debug(`user has password auth. redirect to /passport/registration`);

		throw redirect(307, '/passport/registration');
	}
}

export const load: PageServerLoad = async (event: RequestEvent) => {
	console.debug(`GET /passport/registration/anonymous`);

	await redirectToPasswordAuthIfHasAuth(event);
};

const { getValidator } = jsonValidationFactory<AnonymousFormData>({
	login: merge(...validators.anonymousLogin)
});

export const actions: Actions = {
	default: async function (event) {
		console.debug(`(POST) /passport/registration/anonymous`);

		await redirectToPasswordAuthIfHasAuth(event);

		const { login } = await selectFormDataAndValidate<AnonymousFormData>(event, getValidator);
		const transaction = await PassportModel.startTransaction();

		try {
			const { user } = await AnonymousAuth.createUserWithAnonymousAuth({
				login,
				transaction
			});

			await AuthorizationService.removeAndCreateTokens({
				event,
				transaction,
				userId: user.id,
				passiveUserIds: []
			});
			await transaction.commit();
		} catch (err) {
			await transaction.rollback();
			throw err;
		}

		throw getPassportOnAuthRedirect(event);
	}
};
