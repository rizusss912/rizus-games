import { error } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';
import { parseIntOrThrowError } from '$lib/utils/asserts';
import { auth } from '$passport/passport.utils';
import { PasswordAuth } from '$passport/bd/models/password-auth';
import { selectFormDataAndValidate } from '$lib/utils/form';
import {
	ValidationError,
	type JsonEndpointValue,
	jsonValidationFactory,
	merge
} from '$lib/utils/validation';
import { StringOnly } from '$lib/utils/default-validators';
import { validators } from '$passport/validators';

class UniqueLogin extends StringOnly {
	async validate(value: JsonEndpointValue): Promise<void> {
		super.validate(value);

		if (await PasswordAuth.getAuthByLogin(value)) {
			throw new ValidationError('Пользоватеель с таким именем уже существует');
		}
	}
}

const { getValidator } = jsonValidationFactory<{ login: string }>({
	login: merge(...validators.login, new UniqueLogin())
});

export const POST: RequestHandler = async (event: RequestEvent) => {
	const userIdInParams = event.params.userId;

	console.debug(`(GET) /passport/login/${userIdInParams}`);

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

		if (!login) {
			throw error(401, 'login: обязательное поле');
		}

		if (await PasswordAuth.getAuthByLogin(login)) {
			throw error(401, 'login занят');
		}

		await PasswordAuth.setLoginByUserId(changeableUserId, login);
	} catch {
		await authPromise;
	}

	return new Response(null, { status: 200 });
};
