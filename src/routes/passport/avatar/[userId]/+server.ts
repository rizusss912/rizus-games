import type { RequestEvent, RequestHandler } from '../$types';
import { selectFormDataAndValidate } from '$lib/utils/form';
import { EndpointHandler, jsonValidationFactory, merge } from '$lib/utils/validation';
import { Required } from '$lib/utils/default-validators';
import { error } from '@sveltejs/kit';
import { UserAvatarService } from '$lib/api/s3';
import { auth } from '../../passport.utils';
import { parseIntOrThrowError } from '$lib/utils/asserts';

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
			validationErrorText = await UserAvatarService.getValidAvatarError(value);
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

	console.debug(`(POST) /passport/user/${userIdInParams}/avatar`);

	const userId = parseIntOrThrowError(userIdInParams, invalidUserIdError);
	const {
		userData: { id }
	} = await auth(event);

	if (userId !== id) {
		throw error(403, 'недостаточно прав');
	}

	const { avatar } = await selectFormDataAndValidate<AvatarFormData>(event, getValidator);

	try {
		await UserAvatarService.uploadUserAvatar(userId, avatar);
	} catch (err) {
		throw error(500, 'не удалось изменить аватар');
	}

	return new Response(null, { status: 200 });
};
