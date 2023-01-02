import type { PageServerLoad } from './$types';
import { auth } from '$passport/passport.utils';

export const load: PageServerLoad = async (event) => {
	console.debug(`(GET) /passport`);
	return await auth(event);
};
