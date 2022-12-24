import { selectFormDataAndValidate } from '$lib/utils/form';
import { jsonValidationFactory, merge } from '$lib/utils/validation';
import { error } from '@sveltejs/kit';
import { AuthorizationService } from '../../authorization-service';
import { PassportModel } from '../../bd/models/passport-model';
import { PasswordAuth } from '../../bd/models/password-auth';
import { getPassportOnAuthRedirect } from '../../passport.utils';
import { validators } from '../../validators';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

export type LoginFormData = {
	login: string;
	password: string;
};
export const load: PageServerLoad = async (event: RequestEvent) => {
	console.debug(`GET /passport/login`);
};

const { getValidator } = jsonValidationFactory<LoginFormData>({
	login: merge(...validators.login),
	password: merge(...validators.password)
});

export const actions: Actions = {
	default: async function (event) {
		console.debug(`(POST) /passport/login`);
		const { login, password } = await selectFormDataAndValidate<LoginFormData>(event, getValidator);

		if (!login) {
			throw error(400, 'Отсутствует поле login');
		}

		console.debug(`[/passport/login] login: ${login}`);
		const passwordAuth = await PasswordAuth.getPasswordAuthByLogin({ login });

		if (!passwordAuth) {
			throw error(400, 'Неверный логин');
		}
		if (!passwordAuth.checkPassword(password)) {
			throw error(400, 'Неверный пароль');
		}

		const { userId } = passwordAuth;
		const { accessToken, refreshToken } = await AuthorizationService.getTokens(event);
		const token = accessToken ?? refreshToken;
		const transaction = await PassportModel.startTransaction();

		try {
			if (!token) {
				await AuthorizationService.createAndSetTokens({
					event,
					transaction,
					userId,
					passiveUserIds: []
				});
			} else {
				const lastAuthData = await token.getActiveAndPassiveUserIds();
				const passiveUserIds = lastAuthData.userId
					? [lastAuthData.userId, ...lastAuthData.passiveUserIds]
					: lastAuthData.passiveUserIds;
				await AuthorizationService.refreshTokens({
					accessToken,
					refreshToken,
					userId,
					passiveUserIds,
					transaction,
					event
				});
			}
			await transaction.commit();
		} catch (err) {
			await transaction.rollback();
			throw err;
		}

		throw getPassportOnAuthRedirect(event);
	}
};
