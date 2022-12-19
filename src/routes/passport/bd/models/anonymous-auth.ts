import type { Transaction } from 'objection';
import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../(forms)/form.const';
import { PassportModel } from './passport-model';
import { User } from './user';

type CreateUserWithAnonymousAuthData = {
	transaction: Transaction;
	login: string;
};

export class AnonymousAuth extends PassportModel {
	static tableName = 'anonymousAuths';
	static idColumn = 'id';
	static columns = {
		ID: AnonymousAuth.idColumn,
		USER_ID: 'userId',
		LOGIN: 'login'
	};

	static jsonSchema = {
		type: 'object',
		required: Object.values([AnonymousAuth.columns.LOGIN, AnonymousAuth.columns.USER_ID]),
		properties: {
			[AnonymousAuth.columns.ID]: {
				type: 'integer'
			},
			[AnonymousAuth.columns.USER_ID]: {
				type: 'integer'
			},
			[AnonymousAuth.columns.LOGIN]: {
				type: 'string',
				maxLength: LOGIN_MAX_LENGTH,
				minLength: LOGIN_MIN_LENGTH
			}
		}
	};

	static get relationMappings() {
		return {
			[User.tableName]: {
				relation: AnonymousAuth.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: `${AnonymousAuth.tableName}${AnonymousAuth.columns.ID}`,
					to: `${User.tableName}${User.columns.ID}`
				}
			}
		};
	}

	static async createUserWithAnonymousAuth({
		login,
		transaction
	}: CreateUserWithAnonymousAuthData) {
		const user = await User.query(transaction).insert({});
		const authData = {
			[AnonymousAuth.columns.USER_ID]: user.id,
			[AnonymousAuth.columns.LOGIN]: login
		};

		const anonymousAuth = await AnonymousAuth.query(transaction).insert(authData);

		return { user, anonymousAuth };
	}
}
