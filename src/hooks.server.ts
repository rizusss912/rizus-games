import type { Handle } from '@sveltejs/kit';
import { connectPassortBD } from './routes/passport/bd/bd';
import { resetBD } from './routes/passport/bd/migrations/reset-bd';

const passportBd = await connectPassortBD();

export const handle: Handle = async ({ event, resolve }) => {
	//await resetBD(passportBd);
	return await resolve(event);
};
