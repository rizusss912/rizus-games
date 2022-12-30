import { AuthType } from '$lib/enums/auth-type';
import { StringOnly } from '$lib/utils/default-validators';
import { selectFormDataAndValidate } from '$lib/utils/form';
import {
	jsonValidationFactory,
	merge,
	ValidationError,
	type JsonEndpointValue
} from '$lib/utils/validation';
import { error, type Actions } from '@sveltejs/kit';
import { AuthorizationService } from '../../authorization-service';
import { PassportModel } from '../../bd/models/passport-model';
import { PasswordAuth } from '../../bd/models/password-auth';
import { User } from '../../bd/models/user';
import { getPassportOnAuthRedirect } from '../../passport.utils';
import { validators } from '../../validators';
import type { PageServerLoad } from './$types';

export type RegistraionFormData = {
	login: string;
	password: string;
	passwordConfirm: string;
};

class UniqueLogin extends StringOnly {
	async validate(value: JsonEndpointValue): Promise<void> {
		super.validate(value);

		if (await PasswordAuth.getAuthByLogin(value)) {
			throw new ValidationError('Пользоватеель с таким именем уже существует');
		}
	}
}

export const load: PageServerLoad = async () => {
	console.debug(`(GET) /passport/registration`);
};

const { getValidator } = jsonValidationFactory<RegistraionFormData>({
	login: merge(...validators.login, new UniqueLogin()),
	password: merge(...validators.password),
	passwordConfirm: merge(...validators.password)
});

export const actions: Actions = {
	default: async function (event) {
		console.debug(`(POST) /passport/registration`);

		const { login, password } = await selectFormDataAndValidate(event, getValidator);
		const transaction = await PassportModel.startTransaction();

		//TODO(rizus): нужно зарефакторить. разнести по функциям и убрать вложнные if else
		try {
			const { accessToken, refreshToken } = await AuthorizationService.getTokens(event);
			const token = accessToken ?? refreshToken;

			if (!token) {
				const { user } = await PasswordAuth.createUserWithPasswordAuth({
					transaction,
					login,
					password
				});

				await AuthorizationService.createAndSetTokens({
					event,
					transaction,
					userId: user.id,
					passiveUserIds: []
				});
			} else {
				const { userId, passiveUserIds } = await token.getActiveAndPassiveUserIds();

				if (!userId) {
					const { user } = await PasswordAuth.createUserWithPasswordAuth({
						transaction,
						login,
						password
					});

					await AuthorizationService.createAndSetTokens({
						event,
						transaction,
						userId: user.id,
						passiveUserIds
					});
				} else {
					const auths = await User.getAuthsById(userId);

					if (auths[AuthType.PASSWORD]) {
						const { user } = await PasswordAuth.createUserWithPasswordAuth({
							transaction,
							login,
							password
						});

						await AuthorizationService.createAndSetTokens({
							event,
							transaction,
							userId: user.id,
							passiveUserIds: [...new Set([userId, ...passiveUserIds])]
						});
					} else if (auths[AuthType.ANONYMOUS]) {
						await PasswordAuth.createPasswordAuthForUser({ userId, password, login, transaction });
						await AuthorizationService.createAndSetTokens({
							event,
							transaction,
							userId,
							passiveUserIds
						});
					} else {
						throw error(500, 'Не удалось создать аккаунт из-за неизвестного типа авторизации');
					}
				}
			}
			await transaction.commit();
		} catch (err) {
			await transaction.rollback();
			throw err;
		}

		throw getPassportOnAuthRedirect(event);
	}
};
