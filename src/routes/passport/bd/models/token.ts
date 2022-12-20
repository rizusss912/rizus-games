import { error } from '@sveltejs/kit';
import type { JwtPayload } from 'jsonwebtoken';
import type { Transaction } from 'objection';
import { PassportModel } from './passport-model';
import { User, type UserData } from './user';
import { UserToken } from './user-token';

export enum TokenType {
	ACCESS = 'access',
	REFRESH = 'refresh'
}

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
		return (await Token.getTokenById(tokenId)) ?? null;
	}

	static async getTokenById(tokenId: number): Promise<Token | null> {
		return (await Token.query().findById(tokenId)) ?? null;
	}

	async getPayload(): Promise<TokenPayload> {
		const usersTokens = await UserToken.query()
			.select('*')
			.where(UserToken.columns.TOKEN_ID, '=', this.id);

		let activeUserId: number | undefined;
		let passiveUserIds: number[] = [];

		for (const { userId, isActiveUser } of usersTokens) {
			if (isActiveUser) {
				activeUserId = userId;
			} else {
				passiveUserIds.push(userId);
			}
		}

		if (!activeUserId) {
			throw error(500, 'не удалось получить id пользователя');
		}

		return { jti: this.id, userId: activeUserId, passiveUserIds };
	}

	static async deleteTokenById({ tokenId, transaction }: DeleteTokenByIdData) {
		await Promise.all([
			UserToken.query(transaction).delete().where(UserToken.columns.TOKEN_ID, '=', tokenId),
			Token.query(transaction).deleteById(tokenId)
		]);
	}

	static async createToken({ userId, transaction, type, passiveUserIds }: CreateTokenData) {
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
}
