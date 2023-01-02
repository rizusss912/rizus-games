import { parseIntOrThrowError } from '$lib/utils/asserts';
import { selectFormDataAndValidate } from '$lib/utils/form';
import {
	jsonValidationFactory,
	merge,
	type JsonEndpointValue,
	ValidationError
} from '$lib/utils/validation';
import { auth, isUrl } from '$passport/passport.utils';
import { validators } from '$passport/validators';
import { error, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from '../$types';
import { PasswordAuth } from '$passport/bd/models/password-auth';
import { StringOnly } from '$lib/utils/default-validators';
import { Param } from '$lib/enums/param';

export type LoginFormData = {
	login: string;
	password: string;
};

export const load: PageServerLoad = async (event: RequestEvent) => {
	const userIdInParams = event.params.userId;

	console.debug(`(GET) /passport/${userIdInParams}/login`);

	const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');
	const changeableUserId = parseIntOrThrowError(userIdInParams, invalidUserIdError);
	const authData = await auth(event);

	if (changeableUserId !== authData.userData.id) {
		console.log(changeableUserId, authData.userData.id);
		throw error(403, 'недостаточно прав');
	}

	return authData;
};

class UniqueLogin extends StringOnly {
	async validate(value: JsonEndpointValue): Promise<void> {
		super.validate(value);

		if (await PasswordAuth.getAuthByLogin(value)) {
			throw new ValidationError('Пользователь с таким именем уже существует');
		}
	}
}

const { getValidator } = jsonValidationFactory<{ login: string }>({
	login: merge(...validators.login, new UniqueLogin())
});

export const actions: Actions = {
	default: async function (event) {
		const userIdInParams = event.params.userId;

		console.debug(`(POST) /passport/${userIdInParams}/login`);

		const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');
		const changeableUserId = parseIntOrThrowError(userIdInParams, invalidUserIdError);
		const authPromise = auth(event);

		try {
			const [
				{
					userData: { id }
				},
				passwordAuth,
				{ login }
			] = await Promise.all([
				authPromise,
				PasswordAuth.getAuthByUserId(changeableUserId),
				selectFormDataAndValidate(event, getValidator)
			]);

			if (!passwordAuth) {
				throw error(401, 'Пользователя не существует или он не добавил авторизацию по паролю');
			}

			if (changeableUserId !== id) {
				throw error(403, 'Недостаточно прав');
			}

			await PasswordAuth.setLoginByUserId(changeableUserId, login);
		} catch {
			await authPromise;
		}

		const initiator = event.url.searchParams.get(Param.INITIAOR);

		if (initiator && isUrl(initiator)) {
			throw redirect(307, initiator);
		}

		return { type: 'success', status: 200 };
	}
};
