import { BasePassport } from './base-passport';
import { User } from './user';
import { UserToken } from './user-token';

export enum TokenType {
	ACCESS = 'access',
	REFRESH = 'refresh'
}

export class Token extends BasePassport {
	static tableName = 'tokens';
	static idColumn = 'id';
	static columns = {
		ID: Token.idColumn,
		TYPE: 'type'
	};

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
				relation: Token.ManyToManyRelation,
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
}
