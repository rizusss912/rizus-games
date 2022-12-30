import { UserAvatarService } from '$lib/api/s3';
import { parseIntOrThrowError } from '$lib/utils/asserts';
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from '../../../$types';
import type { AvatarSize } from '$lib/enums/avatar-size';

const invalidUserIdError = error(404, 'Неверный идентификатор пользователя');

export const GET: RequestHandler = async (event: RequestEvent) => {
	const userIdInParams = event.params.userId;
	const size = event.params.size as unknown as AvatarSize;
	const rest = event.params.rest;

	console.debug(`(GET) /passport/user/${userIdInParams}/avatar/${size}/${rest}`);

	const userId = parseIntOrThrowError(userIdInParams, invalidUserIdError);

	throw redirect(307, UserAvatarService.getUserAvatarUrl(userId, size));
};
