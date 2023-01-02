import { PassportModel } from '$passport/bd/models/passport-model';
import { Token } from '$passport/bd/models/token';
import { User } from '$passport/bd/models/user';

export class UserToken extends PassportModel {
	static tableName = 'usersTokens';
	static idColumn = 'id';
	static columns = {
		ID: UserToken.idColumn,
		USER_ID: 'userId',
		TOKEN_ID: 'tokenId',
		IS_ACTIVE_USER: 'isActiveUser'
	};

	userId!: number;
	tokenId!: number;
	isActiveUser!: boolean;

	static jsonSchema = {
		type: 'object',
		required: Object.values([
			UserToken.columns.IS_ACTIVE_USER,
			UserToken.columns.TOKEN_ID,
			UserToken.columns.USER_ID
		]),
		properties: {
			[UserToken.columns.ID]: {
				type: 'integer'
			},
			[UserToken.columns.USER_ID]: {
				type: 'integer'
			},
			[UserToken.columns.TOKEN_ID]: {
				type: 'integer'
			},
			[UserToken.columns.IS_ACTIVE_USER]: {
				type: 'boolean'
			}
		}
	};

	static get relationMappings() {
		return {
			[User.tableName]: {
				relation: UserToken.HasOneRelation,
				modelClass: User,
				join: {
					from: `${UserToken.tableName}${UserToken.columns.USER_ID}`,
					to: `${User.tableName}${User.columns.ID}`
				}
			},
			[Token.tableName]: {
				relation: UserToken.HasOneRelation,
				modelClass: Token,
				join: {
					from: `${UserToken.tableName}${UserToken.columns.TOKEN_ID}`,
					to: `${Token.tableName}${Token.columns.ID}`
				}
			}
		};
	}
}
