import type { RequestEvent, RequestHandler } from './$types';
import { selectFormDataAndValidate } from '$lib/utils/form';
import { jsonValidationFactory } from '$lib/utils/validation';
import { Required } from '$lib/utils/default-validators';
import { error } from '@sveltejs/kit';
import { UserAvatarService } from '$lib/api/s3';
import { auth } from '../../passport.utils';
import { parseIntOrThrowError } from '$lib/utils/asserts';

type AvatarFormData = {
	avatar: File;
};

const { getValidator } = jsonValidationFactory<AvatarFormData>({
	avatar: new Required()
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
		console.log(err);
	}

	return new Response(null, { status: 200 });
};
