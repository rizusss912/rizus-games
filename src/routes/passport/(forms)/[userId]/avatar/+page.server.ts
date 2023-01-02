import type { PageServerLoad, RequestEvent } from './$types';
import { selectFormDataAndValidate } from '$lib/utils/form';
import { EndpointHandler, jsonValidationFactory, merge } from '$lib/utils/validation';
import { Required } from '$lib/utils/default-validators';
import { error, type Actions, type ActionResult, redirect } from '@sveltejs/kit';
import { AvatarService } from '$lib/api/s3';
import { parseIntOrThrowError } from '$lib/utils/asserts';
import { UserAvatar } from '$passport/bd/models/user-avatar';
import { PassportModel } from '$passport/bd/models/passport-model';
import { auth } from '$passport/passport.utils';
import { Param } from '$lib/enums/param';

type AvatarFormData = {
	avatar: File;
};

class AvatarFileValidator extends EndpointHandler {
	async validate(value: File): Promise<void> {
		let validationErrorText: string | null;

		if (!value.size) {
			throw new Error('отсутствует файл');
		}

		try {
			validationErrorText = await AvatarService.getValidAvatarError(value);
		} catch (cause) {
			throw new Error('не удалось прочитать файл', { cause });
		}

		if (validationErrorText) {
			throw new Error(validationErrorText);
		}
	}
}

const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');

export const load: PageServerLoad = async (event: RequestEvent) => {
	const userIdInParams = event.params.userId;

	console.debug(`(GET) /passport/${userIdInParams}/avatar`);

	const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');
	const changeableUserId = parseIntOrThrowError(userIdInParams, invalidUserIdError);
	const authData = await auth(event);

	if (changeableUserId !== authData.userData.id) {
		console.log(changeableUserId, authData.userData.id);
		throw error(403, 'недостаточно прав');
	}

	return authData;
};

const { getValidator } = jsonValidationFactory<AvatarFormData>({
	avatar: merge(new Required(), new AvatarFileValidator())
});

export const actions: Actions = {
	default: async function (event: RequestEvent): Promise<ActionResult> {
		const userIdInParams = event.params.userId;

		console.debug(`(POST) /passport/${userIdInParams}/avatar`);

		const userId = parseIntOrThrowError(userIdInParams, invalidUserIdError);
		const {
			userData: { id }
		} = await auth(event);

		if (userId !== id) {
			throw error(403, 'недостаточно прав');
		}

		const { avatar } = await selectFormDataAndValidate<AvatarFormData>(event, getValidator);
		const transaction = await PassportModel.startTransaction();
		try {
			await UserAvatar.addAvatarToUser({ userId, avatar, transaction });
			await transaction.commit();
		} catch (err) {
			await transaction.rollback();
			throw error(500, 'не удалось изменить аватар');
		}

		const initiator = event.url.searchParams.get(Param.INITIAOR);

		if (initiator) {
			throw redirect(307, initiator);
		}

		return { type: 'success', status: 200 };
	}
};
