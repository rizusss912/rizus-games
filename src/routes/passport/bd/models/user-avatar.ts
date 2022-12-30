import { Avatar } from '$passport/bd/models/avatar';
import { PassportModel } from '$passport/bd/models/passport-model';
import { User } from '$passport/bd/models/user';

export class UserAvatar extends PassportModel {
	static tableName = 'usersAvatars';
	static idColumn = 'id';
	static columns = {
		ID: UserAvatar.idColumn,
		USER_ID: 'userId',
		AVATAR_ID: 'avatarId'
	};

	passwordHash!: string;

	static jsonSchema = {
		type: 'object',
		required: Object.values([UserAvatar.columns.USER_ID, UserAvatar.columns.AVATAR_ID]),
		properties: {
			[UserAvatar.columns.ID]: {
				type: 'integer'
			},
			[UserAvatar.columns.USER_ID]: {
				type: 'string'
			},
			[UserAvatar.columns.AVATAR_ID]: {
				type: 'string'
			}
		}
	};

	static get relationMappings() {
		return {
			[User.tableName]: {
				relation: UserAvatar.HasOneRelation,
				modelClass: User,
				join: {
					from: `${UserAvatar.tableName}${UserAvatar.columns.USER_ID}`,
					to: `${User.tableName}${User.columns.ID}`
				}
			},
			[Avatar.tableName]: {
				relation: UserAvatar.HasOneRelation,
				modelClass: Avatar,
				join: {
					from: `${UserAvatar.tableName}${UserAvatar.columns.AVATAR_ID}`,
					to: `${Avatar.tableName}${Avatar.columns.ID}`
				}
			}
		};
	}
}
