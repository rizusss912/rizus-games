import { selectFormData } from '$lib/utils/form';
import { redirect, type ActionResult, type Actions } from '@sveltejs/kit';
import { AuthorizationService } from '../../authorization-service';
import { PassportModel } from '../../bd/models/passport-model';
import { getPassportOnAuthRedirect } from '../../passport.utils';

type RegistraionFormData = {
	login: string;
	password: string;
};

export const actions: Actions = {
	default: async function (event) {
		const registrationData = await selectFormData<RegistraionFormData>(event);

		const transaction = await PassportModel.startTransaction();

		try {
			await AuthorizationService.registrationByPassword({
				login: registrationData.login!,
				password: registrationData.password,
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
