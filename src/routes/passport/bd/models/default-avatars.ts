import { Avatar } from '$passport/bd/models/avatar';
import { PassportModel } from '$passport/bd/models/passport-model';

export class DefaultAvatar extends PassportModel {
	static tableName = 'defaultAvatars';
	static idColumn = 'id';
	static columns = {
		ID: DefaultAvatar.idColumn,
		AVATAR_ID: 'avatarId'
	};

	id!: number;
	avatarId!: number;

	static jsonSchema = {
		type: 'object',
		required: Object.values([DefaultAvatar.columns.AVATAR_ID]),
		properties: {
			[DefaultAvatar.columns.ID]: {
				type: 'integer'
			},
			[DefaultAvatar.columns.AVATAR_ID]: {
				type: 'integer'
			}
		}
	};

	static get relationMappings() {
		return {
			[DefaultAvatar.tableName]: {
				relation: DefaultAvatar.HasOneRelation,
				modelClass: Avatar,
				join: {
					from: `${DefaultAvatar.tableName}.${DefaultAvatar.columns.AVATAR_ID}`,
					to: `${Avatar.tableName}.${Avatar.columns.ID}`
				}
			}
		};
	}

	public static async getRundomDefaultAvatar(): Promise<DefaultAvatar | null> {
		const allDefaultAvatars = await DefaultAvatar.getAllDefaultAvatars();

		if (allDefaultAvatars.length === 0) {
			return null;
		}

		return allDefaultAvatars[Math.floor(Math.random() * allDefaultAvatars.length)];
	}

	public static async getAllDefaultAvatars(): Promise<DefaultAvatar[]> {
		return await DefaultAvatar.query();
	}
}
