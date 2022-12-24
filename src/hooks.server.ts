import type { HandleServerError } from '@sveltejs/kit';
import { connectPassortBD } from './routes/passport/bd/bd';
import { resetBD } from './routes/passport/bd/migrations/reset-bd';
import { BackandAppFilesService } from '$lib/api/s3';
import { sequence } from '@sveltejs/kit/hooks';
import { get, writable } from 'svelte/store';
import type { Knex } from 'knex';

const server = writable<{
	passportBd?: Knex;
	needUploadBackandAppFilesToStatic: boolean;
	uploadedBackandAppFilesToStatic: boolean;
	needToRevertBD: boolean;
	revertedBd: boolean;
}>({
	needToRevertBD: false,
	revertedBd: true,
	needUploadBackandAppFilesToStatic: process.env.NODE_ENV === 'production',
	uploadedBackandAppFilesToStatic: false
});

export const handle = sequence(
	async ({ event, resolve }) => {
		const serverState = get(server);

		if (
			serverState.needUploadBackandAppFilesToStatic &&
			!serverState.uploadedBackandAppFilesToStatic
		) {
			await BackandAppFilesService.uploadBackandAppFilesToS3();
			server.set({ ...serverState, uploadedBackandAppFilesToStatic: true });
		}

		return await resolve(event);
	},
	async ({ event, resolve }) => {
		const serverState = get(server);

		if (!serverState.passportBd) {
			const passportBd = await connectPassortBD();

			server.set({ ...serverState, passportBd });
		}

		return await resolve(event);
	},
	async ({ event, resolve }) => {
		const serverState = get(server);

		if (serverState.needToRevertBD && !serverState.revertedBd) {
			await resetBD(serverState.passportBd!);
			server.set({ ...serverState, revertedBd: true });
		}

		return await resolve(event);
	}
);

export const handleError: HandleServerError = async ({ event }) => {
	console.error(`ERROR (${event.request.method}) ${event.url.pathname}`);
};
