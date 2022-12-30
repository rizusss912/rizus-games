import { AuthType } from '$lib/enums/auth-type';
import type { Auth } from '$passport/bd/models/auth';
import { Avatar } from '$passport/bd/models/avatar';
import { UserAvatar } from '$passport/bd/models/user-avatar';
import { AnonymousAuth } from './anonymous-auth';
import { PassportModel } from './passport-model';
import { PasswordAuth } from './password-auth';
import { Token } from './token';
import { UserToken } from './user-token';

export type UserData = {
	id: number;
	login: string;
	authTypes: AuthType[];
};

export interface UserAuths extends Record<AuthType, Auth> {
	[AuthType.ANONYMOUS]: AnonymousAuth;
	[AuthType.PASSWORD]: PasswordAuth;
}

export class User extends PassportModel {
	static tableName = 'users';
	static idColumn = 'id';
	static columns = {
		ID: User.idColumn
	};

	public id!: number;

	static jsonSchema = {
		type: 'object',
		properties: {
			[User.columns.ID]: {
				type: 'integer'
			}
		}
	};

	static get relationMappings() {
		return {
			[Token.tableName]: {
				relation: User.ManyToManyRelation,
				modelClass: Token,
				join: {
					from: `${User.tableName}.${User.columns.ID}`,
					through: {
						from: `${UserToken.tableName}.${UserToken.columns.USER_ID}`,
						to: `${UserToken.tableName}.${UserToken.columns.TOKEN_ID}`
					},
					to: `${Token.tableName}.${Token.columns.ID}`
				}
			},
			[UserToken.tableName]: {
				relation: Avatar.HasManyRelation,
				modelClass: UserToken,
				join: {
					from: `${User.tableName}.${User.columns.ID}`,
					to: `${UserToken.tableName}.${UserToken.columns.USER_ID}`
				}
			},
			[Avatar.tableName]: {
				relation: User.ManyToManyRelation,
				modelClass: Avatar,
				join: {
					from: `${User.tableName}.${User.columns.ID}`,
					through: {
						from: `${UserAvatar.tableName}.${UserAvatar.columns.USER_ID}`,
						to: `${UserAvatar.tableName}.${UserAvatar.columns.AVATAR_ID}`
					},
					to: `${Avatar.tableName}.${Avatar.columns.ID}`
				}
			},
			[UserAvatar.tableName]: {
				relation: Avatar.HasOneRelation,
				modelClass: UserAvatar,
				join: {
					from: `${User.tableName}.${User.columns.ID}`,
					to: `${UserAvatar.tableName}.${UserAvatar.columns.USER_ID}`
				}
			},
			[AnonymousAuth.tableName]: {
				relation: User.BelongsToOneRelation,
				modelClass: AnonymousAuth,
				join: {
					from: `${User.tableName}.${User.columns.ID}`,
					to: `${AnonymousAuth.tableName}.${AnonymousAuth.columns.USER_ID}`
				}
			},
			[PasswordAuth.tableName]: {
				relation: User.BelongsToOneRelation,
				modelClass: PasswordAuth,
				join: {
					from: `${User.tableName}.${User.columns.ID}`,
					to: `${PasswordAuth.tableName}.${PasswordAuth.columns.USER_ID}`
				}
			}
		};
	}

	static async getUsersByUserIds(userIds: number[]): Promise<User[]> {
		console.debug(`[User] getUsersByUserIds. userIds: ${userIds || `[]`}`);

		return await User.query().findByIds(userIds);
	}

	public async getData(): Promise<UserData> {
		console.debug(`[User] getData. userId: ${this.id}`);

		const auths = await User.getAuthsById(this.id);
		const authTypes = Object.entries(auths)
			.filter(([_, value]) => value)
			.map(([key]) => key) as AuthType[];
		const login = auths[AuthType.PASSWORD]?.login ?? auths[AuthType.ANONYMOUS]!.login;
		return { login, id: this.id, authTypes };
	}

	public static async getAuthsById(userId: number): Promise<UserAuths> {
		console.debug(`[User] getAuthsById. userId: ${userId}`);

		const [anonymousAuth, passwordAuth] = await Promise.all([
			AnonymousAuth.getAuthByUserId(userId),
			PasswordAuth.getAuthByUserId(userId)
		]);

		return {
			[AuthType.ANONYMOUS]: anonymousAuth as AnonymousAuth,
			[AuthType.PASSWORD]: passwordAuth as PasswordAuth
		};
	}
}
