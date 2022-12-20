import { selectFormData } from '$lib/utils/form';
import { AuthorizationService } from '../../authorization-service';
import { PassportModel } from '../../bd/models/passport-model';
import { getPassportOnAuthRedirect } from '../../passport.utils';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

export type LoginFormData = {
	login: string;
	password: string;
};
export const load: PageServerLoad = async (event: RequestEvent) => {};

export const actions: Actions = {
	default: async function (event) {
		const loginData = await selectFormData<LoginFormData>(event);

		const transaction = await PassportModel.startTransaction();

		try {
			await AuthorizationService.login({
				login: loginData.login!,
				password: loginData.password,
				event,
				transaction
			});
			await transaction.commit();
		} catch (err) {
			await transaction.rollback();
			throw err;
		}

		throw getPassportOnAuthRedirect(event);
	}
};
