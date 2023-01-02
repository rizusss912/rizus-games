import { AvatarService } from '$lib/api/s3';
import { parseIntOrThrowError } from '$lib/utils/asserts';
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';
import type { AvatarSize } from '$lib/enums/avatar-size';
import { UserAvatar } from '$passport/bd/models/user-avatar';
import { DefaultAvatar } from '$passport/bd/models/default-avatars';
import { PassportModel } from '$passport/bd/models/passport-model';

const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');

export const GET: RequestHandler = async (event: RequestEvent) => {
	const userIdInParams = event.params.userId;
	const size = event.params.size as unknown as AvatarSize;

	console.debug(`(GET) /passport/${userIdInParams}/avatar/${size}`);

	const userId = parseIntOrThrowError(userIdInParams, invalidUserIdError);
	const userAvatar = await UserAvatar.getActiveUserAvatarByUserId({ userId });

	if (userAvatar) {
		throw redirect(307, AvatarService.getAvatarUrl(userAvatar.id, size));
	}

	const defaultAvatar = await DefaultAvatar.getRundomDefaultAvatar();

	if (!defaultAvatar) {
		throw error(500, 'Нет аватара и аватаров по умолчанию');
	}

	const transaction = await PassportModel.startTransaction();

	try {
		const userAvatar = await UserAvatar.addAvatarToUserById({
			userId,
			avatarId: defaultAvatar?.avatarId,
			transaction
		});

		await transaction.commit();

		throw redirect(307, AvatarService.getAvatarUrl(userAvatar.id, size));
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
};
