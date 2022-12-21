import type { JwtPayload } from 'jsonwebtoken';
import type { Transaction } from 'objection';
import { PassportModel } from './passport-model';
import { User, type UserData } from './user';
import { UserToken } from './user-token';

export enum TokenType {
	ACCESS = 'access',
	REFRESH = 'refresh'
}

type ActiveAndPassiveUserIds = {
	userId: number | null;
	passiveUserIds: number[];
};

export type CreateTokenData = {
	userId: number;
	type: TokenType;
	passiveUserIds: number[];
	transaction: Transaction;
};
export type DeleteTokenByIdData = {
	tokenId: number;
	transaction: Transaction;
};

export type AuthResult = {
	userData: UserData;
	passiveUsersData: UserData[];
};

export interface TokenPayload extends JwtPayload {
	jti: number;
	userId: number;
	passiveUserIds: number[];
}

export class Token extends PassportModel {
	static tableName = 'tokens';
	static idColumn = 'id';
	static columns = {
		ID: Token.idColumn,
		TYPE: 'type'
	};

	public id!: number;
	public type!: TokenType;

	static jsonSchema = {
		type: 'object',
		required: Object.values([Token.columns.TYPE]),
		properties: {
			[Token.columns.ID]: {
				type: 'integer'
			},
			[Token.columns.TYPE]: {
				type: 'string',
				enum: Object.values(TokenType)
			}
		}
	};

	static get relationMappings() {
		return {
			[User.tableName]: {
				relation: User.ManyToManyRelation,
				modelClass: Token,
				join: {
					from: `${Token.tableName}.${Token.columns.ID}`,
					through: {
						from: `${UserToken.tableName}.${UserToken.columns.TOKEN_ID}`,
						to: `${UserToken.tableName}.${UserToken.columns.USER_ID}`
					},
					to: `${User.tableName}.${User.columns.ID}`
				}
			},
			[UserToken.tableName]: {
				relation: User.HasOneRelation,
				modelClass: UserToken,
				join: {
					from: `${Token.tableName}.${Token.columns.ID}`,
					to: `${UserToken.tableName}.${UserToken.columns.TOKEN_ID}`
				}
			}
		};
	}

	static async verifyTokenById(tokenId: number): Promise<Token | null> {
		console.debug(`[Token] verifyTokenById ${tokenId}`);
		return (await Token.getTokenById(tokenId)) ?? null;
	}

	static async getTokenById(tokenId: number): Promise<Token | null> {
		console.debug(`[Token] getTokenById ${tokenId}`);
		return (await Token.query().findById(tokenId)) ?? null;
	}

	static async deleteTokenById({ tokenId, transaction }: DeleteTokenByIdData) {
		console.debug(`[Token] deleteTokenById ${tokenId}`);
		await Promise.all([
			UserToken.query(transaction).delete().where(UserToken.columns.TOKEN_ID, '=', tokenId),
			Token.query(transaction).delete().where(Token.columns.ID, '=', tokenId)
		]);
	}

	static async createToken({ userId, transaction, type, passiveUserIds }: CreateTokenData) {
		console.debug(`[Token] createToken. userId: ${userId}, type: ${type}`);
		const token = await Token.query(transaction).insert({ [Token.columns.TYPE]: type });
		const generalTokenData = {
			[UserToken.columns.TOKEN_ID]: token.id
		};
		const activeUserTokenData = {
			...generalTokenData,
			[UserToken.columns.USER_ID]: userId,
			[UserToken.columns.IS_ACTIVE_USER]: true
		};
		const passiveUserTokenDataList = passiveUserIds.map((userId) => ({
			...generalTokenData,
			[UserToken.columns.USER_ID]: userId,
			[UserToken.columns.IS_ACTIVE_USER]: false
		}));

		await Promise.all(
			[activeUserTokenData, ...passiveUserTokenDataList].map((data) =>
				token.$relatedQuery(UserToken.tableName, transaction).insert(data)
			)
		);

		return token;
	}

	public async getUsersTokens(): Promise<UserToken[]> {
		console.debug(`[Token] getUsersTokens. tokenId: ${this.id}`);
		return await UserToken.query().where(UserToken.columns.TOKEN_ID, '=', this.id);
	}

	public async getActiveAndPassiveUserIds(): Promise<ActiveAndPassiveUserIds> {
		console.debug(`[Token] getActiveAndPassiveUserIds. tokenId: ${this.id}`);
		const usersTokens = await this.getUsersTokens();
		return {
			userId: usersTokens.find((userToken) => userToken.isActiveUser)?.userId ?? null,
			passiveUserIds: usersTokens
				.filter((userToken) => !userToken.isActiveUser)
				.map((userToken) => userToken.userId)
		};
	}
}
