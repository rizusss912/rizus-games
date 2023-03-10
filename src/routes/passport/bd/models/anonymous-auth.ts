import type { Transaction } from 'objection';
import { Auth } from '$passport/bd/models/auth';
import { User } from '$passport/bd/models/user';

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
		console.debug(`[AnonymousAuth] createUserWithAnonymousAuth. login: ${login}`);
		const user = await User.query(transaction).insert({});
		const authData = {
			[Auth.columns.USER_ID]: user.id,
			[Auth.columns.LOGIN]: login
		};

		const anonymousAuth = await AnonymousAuth.query(transaction).insert(authData);

		return { user, anonymousAuth };
	}

	static async getAuthByLogin(login: string): Promise<Auth | null> {
		console.debug(`[AnonymousAuth] getAuthByLogin. login: ${login}`);
		return (await AnonymousAuth.query().findOne(AnonymousAuth.columns.LOGIN, '=', login)) ?? null;
	}

	static async getAuthByUserId(userId: number): Promise<Auth | null> {
		console.debug(`[AnonymousAuth] getAuthByUserId. userId: ${userId}`);
		return (
			(await AnonymousAuth.query().findOne(AnonymousAuth.columns.USER_ID, '=', userId)) ?? null
		);
	}
}
