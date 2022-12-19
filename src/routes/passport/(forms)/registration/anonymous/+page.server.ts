import { selectFormData } from '$lib/utils/form';
import { error } from '@sveltejs/kit';
import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../form.const';
import { getPassportOnAuthRedirect } from '../../../passport.utils';
import type { Actions } from './$types';
import { AuthorizationService } from '../../../authorization-service';
import { PassportModel } from '../../../bd/models/passport-model';

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

		const transaction = await PassportModel.startTransaction();

		try {
			await AuthorizationService.registrationAnonimus({
				login: anonymousData.login!,
				event,
				transaction
			});
			await transaction.commit();
		} catch (err) {
			await transaction.rollback();
			throw error(500, 'Не удалось зарегистрировать пользователя');
		}

		throw getPassportOnAuthRedirect(event);
	}
};
