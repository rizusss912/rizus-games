import { BasePassport } from './base-passport.model';
import { User } from './user';

export class AnonymousAuth extends BasePassport {
	static tableName = 'anonymousAuths';
	static idColumn = 'id';
	static columns = {
		ID: AnonymousAuth.idColumn,
		USER_ID: 'userId'
	};

	static jsonSchema = {
		type: 'object',
		required: [AnonymousAuth.columns.ID, AnonymousAuth.columns.USER_ID],
		[AnonymousAuth.columns.ID]: {
			type: 'integer'
		},
		[AnonymousAuth.columns.USER_ID]: {
			type: 'integer',
			unique: true
		}
	};

	static get relationMappings() {
		return {
			[User.tableName]: {
				relation: AnonymousAuth.HasOneRelation,
				modelClass: User,
				join: {
					from: `${AnonymousAuth.tableName}${AnonymousAuth.columns.ID}`,
					to: `${User.tableName}${User.columns.ID}`
				}
			}
		};
	}
}
