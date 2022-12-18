import type { Handle } from '@sveltejs/kit';
import { connectPassortBD } from './routes/passport/bd/bd';
import { resetBD } from './routes/passport/bd/migrations/reset-bd';

export const handle: Handle = async ({ event, resolve }) => {
	await resetBD(await connectPassortBD());
	return await resolve(event);
};
