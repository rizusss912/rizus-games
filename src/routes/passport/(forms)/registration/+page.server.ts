import { AuthType } from '$lib/enums/auth-type';
import { selectFormData } from '$lib/utils/form';
import { error, redirect, type ActionResult, type Actions } from '@sveltejs/kit';
import { AuthorizationService } from '../../authorization-service';
import { PassportModel } from '../../bd/models/passport-model';
import { PasswordAuth } from '../../bd/models/password-auth';
import { User } from '../../bd/models/user';
import { getPassportOnAuthRedirect } from '../../passport.utils';
import type { PageServerLoad } from './$types';

type RegistraionFormData = {
	login: string;
	password: string;
};

export const load: PageServerLoad = async (event) => {
	console.debug(`(GET) /passport/registration`);
};

export const actions: Actions = {
	default: async function (event) {
		console.debug(`(POST) /passport/registration`);
		const registrationData = await selectFormData<RegistraionFormData>(event);

		//TODO(rizus): нужна валидация
		const { login, password } = registrationData;

		const transaction = await PassportModel.startTransaction();
		const userWithLogin = await PasswordAuth.getAuthByLogin(login);

		if (userWithLogin) {
			throw error(401, 'Пользоватеель с таким именем уже существует');
		}

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
						throw error(500, 'Не удалось создать акаунт из-за неизвестной авторизации');
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
