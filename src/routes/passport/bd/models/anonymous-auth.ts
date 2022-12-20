import type { Transaction } from 'objection';
import { Auth } from './auth';
import { User } from './user';

type CreateUserWithAnonymousAuthData = {
	transaction: Transaction;
	login: string;
};

export class AnonymousAuth extends Auth {
	static tableName = 'anonymousAuths';
	static idColumn = 'id';
	static columns = {
		ID: AnonymousAuth.idColumn,
		...Auth.columns
	};

	static jsonSchema = {
		type: 'object',
		required: [...Auth.jsonSchema.required],
		properties: {
			[AnonymousAuth.columns.ID]: {
				type: 'integer'
			},
			...Auth.jsonSchema.properties
		}
	};

	static get relationMappings() {
		return {
			[User.tableName]: {
				relation: AnonymousAuth.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: `${AnonymousAuth.tableName}${Auth.columns.USER_ID}`,
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
			[Auth.columns.USER_ID]: user.id,
			[Auth.columns.LOGIN]: login
		};

		const anonymousAuth = await AnonymousAuth.query(transaction).insert(authData);

		return { user, anonymousAuth };
	}

	static async getAuthByUserId(userId: number): Promise<Auth | null> {
		return (await AnonymousAuth.query().findOne(AnonymousAuth.columns.USER_ID, '=', userId)) ?? null;
	}
}
