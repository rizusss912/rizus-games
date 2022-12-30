import { DefaultAvatar } from '$passport/bd/models/default-avatars';
import { PassportModel } from '$passport/bd/models/passport-model';
import { User } from '$passport/bd/models/user';
import { UserAvatar } from '$passport/bd/models/user-avatar';

export class Avatar extends PassportModel {
	static tableName = 'avatars';
	static idColumn = 'id';
	static columns = {
		ID: Avatar.idColumn,
		ORIGINAL_NAME: 'originalName'
	};

	passwordHash!: string;

	static jsonSchema = {
		type: 'object',
		required: Object.values([Avatar.columns.ORIGINAL_NAME]),
		properties: {
			[Avatar.columns.ID]: {
				type: 'integer'
			},
			[Avatar.columns.ORIGINAL_NAME]: {
				type: 'string'
			}
		}
	};

	static get relationMappings() {
		return {
			[User.tableName]: {
				relation: Avatar.ManyToManyRelation,
				modelClass: User,
				join: {
					from: `${Avatar.tableName}.${Avatar.columns.ID}`,
					through: {
						from: `${UserAvatar.tableName}.${UserAvatar.columns.AVATAR_ID}`,
						to: `${UserAvatar.tableName}.${UserAvatar.columns.USER_ID}`
					},
					to: `${User.tableName}.${User.columns.ID}`
				}
			},
			[UserAvatar.tableName]: {
				relation: Avatar.HasOneRelation,
				modelClass: UserAvatar,
				join: {
					from: `${Avatar.tableName}.${Avatar.columns.ID}`,
					to: `${UserAvatar.tableName}.${UserAvatar.columns.AVATAR_ID}`
				}
			},
			[DefaultAvatar.tableName]: {
				relation: DefaultAvatar.HasOneRelation,
				modelClass: Avatar,
				join: {
					from: `${Avatar.tableName}.${Avatar.columns.ID}`,
					to: `${DefaultAvatar.tableName}.${DefaultAvatar.columns.AVATAR_ID}`
				}
			}
		};
	}
}
