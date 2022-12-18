import { BasePassport } from './base-passport.model';

export class User extends BasePassport {
	static tableName = 'users';
	static idColumn = 'id';
	static columns = {
		ID: User.idColumn
	};

	static jsonSchema = {
		type: 'object',
		required: [User.columns.ID],
		[User.columns.ID]: {
			type: 'integer'
		}
	};
}
