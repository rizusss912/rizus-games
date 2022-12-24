import { version } from '$app/environment';
import { env } from '$env/dynamic/private';
import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'node:fs';
import path from 'path';

const __dirname = path.resolve();

//NOTE(rizus): taken here: https://cloud.yandex.ru/docs/storage/tools/aws-sdk-java
const YANDEX_CLAUD_S3_REGION = 'ru-central1';
const YANDEX_CLAUD_ENDPOINT = 'https://storage.yandexcloud.net';
const APPLICATION_FILE_FOLDER = 'backend-app';
const BUCKET = 'risus-games-static';

//NOTE(rizus): documentation on how to generate keys in yandex qloud: https://cloud.yandex.ru/docs/iam/operations/sa/create-access-key
const ACCESS_KEY_ID = env.ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = env.SECRET_ACCESS_KEY!;

/**
 * Documentation for [S3ClientConfig](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/s3clientconfig.html)
 */
const s3ClientConfig: S3ClientConfig = {
	region: YANDEX_CLAUD_S3_REGION,
	endpoint: YANDEX_CLAUD_ENDPOINT,
	credentials: {
		accessKeyId: ACCESS_KEY_ID,
		secretAccessKey: SECRET_ACCESS_KEY
	}
};

/**
 * [Documentation for S3Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html)
 *
 * How to use AWS SDK for java, go, php, c++ - [yandex cloud documentation](https://cloud.yandex.ru/docs/storage/tools/aws-sdk-java).
 */
const s3Client = new S3Client(s3ClientConfig);

export interface StaticFile {
	url: string;
}

function getFilesInDir(dir: string, files_?: string[]) {
	files_ = files_ || [];
	const files = fs.readdirSync(dir);
	for (const file in files) {
		const name = dir + '/' + files[file];

		if (fs.statSync(name).isDirectory()) {
			getFilesInDir(name, files_);
		} else {
			files_.push(name);
		}
	}
	return files_;
}

export class StaticFilesService {
	private static async upload(path: string, body: string | Buffer): Promise<StaticFile> {
		const uploader = new Upload({
			client: s3Client,
			params: { Bucket: BUCKET, Key: path, Body: body }
		});

		const { Key } = await uploader.done().catch(console.error);
		const url = `https://${BUCKET}.${YANDEX_CLAUD_ENDPOINT}/${Key}`;

		return { url };
	}

	public static async uploadBackandAppFilesToS3(): Promise<StaticFile[]> {
		const localFilesDir = `${__dirname}/build/client`;
		const bucketFilesFolder = `${APPLICATION_FILE_FOLDER}/${version}`;
		const files = getFilesInDir(localFilesDir);

		const uploadPromices = files.map((file) => {
			const path = file.replace(localFilesDir, bucketFilesFolder);
			const body = fs.readFileSync(file);

			return StaticFilesService.upload(path, body);
		});

		return await Promise.all(uploadPromices);
	}
}
