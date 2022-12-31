import { AvatarService } from '$lib/api/s3';
import { parseIntOrThrowError } from '$lib/utils/asserts';
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from '../../../$types';
import type { AvatarSize } from '$lib/enums/avatar-size';
import { UserAvatar } from '$passport/bd/models/user-avatar';

const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');

export const GET: RequestHandler = async (event: RequestEvent) => {
	const userIdInParams = event.params.userId;
	const size = event.params.size as unknown as AvatarSize;
	const rest = event.params.rest;

	console.debug(`(GET) /passport/avatar/${userIdInParams}/${size}/${rest}`);

	const userId = parseIntOrThrowError(userIdInParams, invalidUserIdError);
	const userAvatar = await UserAvatar.getActiveUserAvatarByUserId({ userId });

	if (!userAvatar) {
		throw error(500, 'У пользователя нет аватаров');
	}

	throw redirect(307, AvatarService.getAvatarUrl(userAvatar.id, size));
};
