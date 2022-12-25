import { version } from '$app/environment';
import { env } from '$env/dynamic/private';
import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import sharp, { type FormatEnum } from 'sharp';
import fs from 'node:fs';
import path from 'path';
import { AvatarSize } from '$lib/enums/avatar-size';

const __dirname = path.resolve();

//NOTE(rizus): taken here: https://cloud.yandex.ru/docs/storage/tools/aws-sdk-java
const YANDEX_CLAUD_S3_REGION = 'ru-central1';
const YANDEX_CLAUD_ENDPOINT = 'https://storage.yandexcloud.net';
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

enum BucketFolder {
	BACKEND_APP = 'backend-app',
	PASSPORT = 'passport'
}

enum PassportFolder {
	USER = 'user'
}

export class StaticFilesService {
	private static get BUCKET_LINK(): string {
		return `${YANDEX_CLAUD_ENDPOINT}/${BUCKET}`;
	}

	protected static getUrlByPath(path: string): string {
		return `${StaticFilesService.BUCKET_LINK}/${path}`;
	}

	protected static async upload(path: string, body: string | Buffer): Promise<StaticFile> {
		const uploader = new Upload({
			client: s3Client,
			params: { Bucket: BUCKET, Key: path, Body: body }
		});
		const { Key } = await uploader.done();
		const url = StaticFilesService.getUrlByPath(Key);

		return { url };
	}
}

export class BackandAppFilesService extends StaticFilesService {
	public static async uploadBackandAppFilesToS3(): Promise<StaticFile[]> {
		const localFilesDir = `${__dirname}/build/client`;
		const bucketFilesFolder = `${BucketFolder.BACKEND_APP}/${version}`;
		const files = getFilesInDir(localFilesDir);

		const uploadPromices = files.map((file) => {
			const path = file.replace(localFilesDir, bucketFilesFolder);
			const body = fs.readFileSync(file);

			return StaticFilesService.upload(path, body);
		});

		return await Promise.all(uploadPromices);
	}
}

export class UserAvatarService extends StaticFilesService {
	private static AVATAR_FORMAT: keyof FormatEnum = 'webp';
	private static VALID_AVATARS_FILE_FORMATS: Array<keyof FormatEnum> = [
		'jpeg',
		'jpg',
		'png',
		'webp'
	];

	public static async uploadUserAvatar(userId: number, avatar: File): Promise<StaticFile[]> {
		const originPath = UserAvatarService.getOriginUserAvatarPath(userId, avatar.name);
		const avatarAsBuffer = await UserAvatarService.getAvatarAsBuffer(avatar);
		const formatedAvatarsPromices = Object.values(AvatarSize)
			.filter((size) => typeof size === 'number')
			.map(async (size) => {
				const path = UserAvatarService.getPathToUserAvatar(userId, size as AvatarSize);
				const formatedAvatar = await UserAvatarService.formattingAvatar(
					avatarAsBuffer,
					size as AvatarSize
				);

				return StaticFilesService.upload(path, formatedAvatar);
			});

		return Promise.all([
			StaticFilesService.upload(originPath, avatarAsBuffer),
			...formatedAvatarsPromices
		]);
	}

	public static getUserAvatarUrl(userId: number, size: AvatarSize): string {
		return StaticFilesService.getUrlByPath(UserAvatarService.getPathToUserAvatar(userId, size));
	}

	public static async getValidAvatarError(avatar: File): Promise<string | null> {
		const avatarAsBuffer = await UserAvatarService.getAvatarAsBuffer(avatar);
		const { size, format } = await sharp(avatarAsBuffer).metadata();

		if (!format) {
			return 'не удалось определить формат файла';
		}

		if (!UserAvatarService.VALID_AVATARS_FILE_FORMATS.includes(format)) {
			return `формат файла должен быть ${UserAvatarService.VALID_AVATARS_FILE_FORMATS.join(', ')}`;
		}

		if (!size) {
			return 'не удалось определить размер';
		}

		if (size > 1024 * 1024) {
			return 'Размер файла должен быть меньше 1МБ';
		}

		return null;
	}

	private static getPathToUserAvatarFolder(userId: number) {
		return `${BucketFolder.PASSPORT}/${PassportFolder.USER}/${userId}/avatar`;
	}

	private static getPathToUserAvatar(userId: number, size: AvatarSize): string {
		const pathToAvatarFolder = UserAvatarService.getPathToUserAvatarFolder(userId);

		return `${pathToAvatarFolder}/${size}.${UserAvatarService.AVATAR_FORMAT}`;
	}

	private static getOriginUserAvatarPath(userId: number, originName: string): string {
		const name = `${crypto.randomUUID()}-${originName}`;
		const pathToAvatarFolder = UserAvatarService.getPathToUserAvatarFolder(userId);

		return `${pathToAvatarFolder}/origin/${name}`;
	}

	private static formattingAvatar(avatar: Buffer, size: AvatarSize): Promise<Buffer> {
		return sharp(avatar).resize(size, size).toFormat(UserAvatarService.AVATAR_FORMAT).toBuffer();
	}

	private static async getAvatarAsBuffer(avatar: File): Promise<Buffer> {
		return Buffer.from(await avatar.arrayBuffer());
	}
}
