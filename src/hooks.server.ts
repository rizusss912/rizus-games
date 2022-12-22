import type { Handle, HandleServerError } from '@sveltejs/kit';
import { connectPassortBD } from './routes/passport/bd/bd';
import { resetBD } from './routes/passport/bd/migrations/reset-bd';

const passportBd = await connectPassortBD();

export const handle: Handle = async ({ event, resolve }) => {
	//await resetBD(passportBd);
	return await resolve(event);
};

export const handleError: HandleServerError = async ({ event }) => {
	console.error(`ERROR (${event.request.method}) ${event.url.pathname}`);
};
