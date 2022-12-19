import type { Transaction } from 'objection';
import { BasePassport } from './base-passport';
import { User } from './user';
import { UserToken } from './user-token';

export enum TokenType {
	ACCESS = 'access',
	REFRESH = 'refresh'
}

export type CreateTokenData = {
	user: User;
	transaction: Transaction;
	type: TokenType;
	passiveUserIds: number[];
};

export class Token extends BasePassport {
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
		required: Object.values(Token.columns),
		[Token.columns.ID]: {
			type: 'integer',
			unique: true
		},
		[Token.columns.TYPE]: {
			type: 'sting',
			enum: Object.values(TokenType)
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
			}
		};
	}

	static async createToken({ user, transaction, type, passiveUserIds }: CreateTokenData) {
		const token = await Token.query(transaction).insert({ [Token.columns.TYPE]: type });
		const generalTokenData = {
			[UserToken.columns.TOKEN_ID]: token.id
		};
		const activeUserTokenData = {
			...generalTokenData,
			[UserToken.columns.USER_ID]: user.id,
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
