import { AuthType } from '$lib/enums/auth-type';
import { AnonymousAuth } from './anonymous-auth';
import { Auth } from './auth';
import { PassportModel } from './passport-model';
import { PasswordAuth } from './password-auth';
import { Token, type AuthResult } from './token';
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
				relation: Token.ManyToManyRelation,
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
			[AnonymousAuth.tableName]: {
				relation: AnonymousAuth.BelongsToOneRelation,
				modelClass: AnonymousAuth,
				join: {
					from: `${User.tableName}.${User.columns.ID}`,
					to: `${AnonymousAuth.tableName}.${AnonymousAuth.columns.USER_ID}`
				}
			},
			[PasswordAuth.tableName]: {
				relation: AnonymousAuth.BelongsToOneRelation,
				modelClass: PasswordAuth,
				join: {
					from: `${User.tableName}.${User.columns.ID}`,
					to: `${PasswordAuth.tableName}.${PasswordAuth.columns.USER_ID}`
				}
			}
		};
	}

	static async getUsersByUserIds(userIds: number[]): Promise<User[]> {
		return await User.query().findByIds(userIds);
	}

	public async getData(): Promise<UserData> {
		const auths = await User.getAuthsById(this.id);
		const authTypes = Object.entries(auths)
			.filter(([_, value]) => value)
			.map(([key]) => key) as AuthType[];
		const login = auths[AuthType.PASSWORD]?.login ?? auths[AuthType.ANONYMOUS]!.login;
		return { login, id: this.id, authTypes };
	}

	public static async getAuthsById(userId: number): Promise<UserAuths> {
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
