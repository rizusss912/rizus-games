import { AnonymousAuth } from './anonymous-auth';
import { PassportModel } from './passport-model';
import { Token } from './token';
import { UserToken } from './user-token';

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
			}
		};
	}
}
