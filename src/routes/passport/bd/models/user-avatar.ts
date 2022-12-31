import { Avatar } from '$passport/bd/models/avatar';
import { PassportModel } from '$passport/bd/models/passport-model';
import { User } from '$passport/bd/models/user';
import type { Transaction } from 'objection';

type AddAvatarToUserData = {
	userId: number;
	avatar: File;
	transaction: Transaction;
};

type AddAvatarToUserByIdData = {
	userId: number;
	avatarId: number;
	transaction: Transaction;
};

export class UserAvatar extends PassportModel {
	static tableName = 'usersAvatars';
	static idColumn = 'id';
	static columns = {
		ID: UserAvatar.idColumn,
		USER_ID: 'userId',
		AVATAR_ID: 'avatarId'
	};

	id!: number;
	userId!: number;
	avatarId!: number;

	static jsonSchema = {
		type: 'object',
		required: Object.values([UserAvatar.columns.USER_ID, UserAvatar.columns.AVATAR_ID]),
		properties: {
			[UserAvatar.columns.ID]: {
				type: 'integer'
			},
			[UserAvatar.columns.USER_ID]: {
				type: 'integer'
			},
			[UserAvatar.columns.AVATAR_ID]: {
				type: 'integer'
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

	public static async addAvatarToUserById({
		userId,
		avatarId,
		transaction
	}: AddAvatarToUserByIdData): Promise<UserAvatar> {
		return UserAvatar.query(transaction).insert({ userId, avatarId });
	}

	public static async addAvatarToUser({ userId, avatar, transaction }: AddAvatarToUserData) {
		console.debug(`[UserAvatar] addAvatarToUser. userId: ${userId}, avatar.name: ${avatar.name}`);

		const createAvatarResult = await Avatar.createAvatar({ avatar, transaction });
		const userAvatar = await UserAvatar.query(transaction).insert({
			[UserAvatar.columns.AVATAR_ID]: createAvatarResult.avatar.id,
			[UserAvatar.columns.USER_ID]: userId
		});

		return { avatar: createAvatarResult.avatar, userAvatar };
	}

	public static async getActiveUserAvatarByUserId({
		userId
	}: {
		userId: number;
	}): Promise<UserAvatar | null> {
		console.debug(`[UserAvatar] getActiveUserAvatarByUserId. userId: ${userId}`);

		const usersAvatars = await UserAvatar.getUserAvatarByUserId({ userId });
		const sortedByCreatedAtUsersAvatars = usersAvatars.sort(
			(userAvatarOne, userAvatarTwo) => userAvatarTwo.createdAtTime - userAvatarOne.createdAtTime
		);

		return sortedByCreatedAtUsersAvatars[0] ?? null;
	}

	private static async getUserAvatarByUserId({
		userId
	}: {
		userId: number;
	}): Promise<UserAvatar[]> {
		console.debug(`[UserAvatar] getUserAvatarByUserId. userId: ${userId}`);

		return await UserAvatar.query().where(UserAvatar.columns.USER_ID, '=', userId);
	}
}
