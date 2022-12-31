import type { RequestEvent, RequestHandler } from '../$types';
import { selectFormDataAndValidate } from '$lib/utils/form';
import { EndpointHandler, jsonValidationFactory, merge } from '$lib/utils/validation';
import { Required } from '$lib/utils/default-validators';
import { error } from '@sveltejs/kit';
import { AvatarService } from '$lib/api/s3';
import { auth } from '../../passport.utils';
import { parseIntOrThrowError } from '$lib/utils/asserts';
import { UserAvatar } from '$passport/bd/models/user-avatar';
import { PassportModel } from '$passport/bd/models/passport-model';

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

const { getValidator } = jsonValidationFactory<AvatarFormData>({
	avatar: merge(new Required(), new AvatarFileValidator())
});
const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');

export const POST: RequestHandler = async (event: RequestEvent) => {
	const userIdInParams = event.params.userId;

	console.debug(`(POST) /passport/avatar/${userIdInParams}`);

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

	return new Response(null, { status: 200 });
};
