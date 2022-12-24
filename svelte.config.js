import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';

//NOTE(rizus): taken here: https://cloud.yandex.ru/docs/storage/tools/aws-sdk-java
const YANDEX_CLAUD_ENDPOINT = 'https://storage.yandexcloud.net';
const BUCKET = 'risus-games-static';
const APPLICATION_FILE_FOLDER = 'backend-app';

const APP_VARSION = Date.now().toString();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		paths: {
			assets:
				process.env.NODE_ENV === 'production'
					? `${YANDEX_CLAUD_ENDPOINT}/${BUCKET}/${APPLICATION_FILE_FOLDER}/${APP_VARSION}`
					: ''
		},
		version: {
			name: APP_VARSION
		}
	}
};

export default config;
