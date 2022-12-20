import type { Transaction } from 'objection';
import { hashSync, compareSync } from 'bcryptjs';
import { Auth } from './auth';
import { User } from './user';

type CreatePasswordAuthForUserData = {
	transaction: Transaction;
	login: string;
	password: string;
	userId: number;
};

type AddPasswordAuthForUserData = {
	transaction: Transaction;
	login: string;
	password: string;
};

export class PasswordAuth extends Auth {
	static tableName = 'passwordsAuths';
	static idColumn = 'id';
	static columns = {
		ID: PasswordAuth.idColumn,
		...Auth.columns,
		PASSWORD_HASH: 'passwordHash'
	};

	static passwordHash: string;
	static checkPassword(password: string): boolean {
		return compareSync(password, this.passwordHash);
	}

	static jsonSchema = {
		type: 'object',
		required: [...Auth.jsonSchema.required],
		properties: {
			[PasswordAuth.columns.ID]: {
				type: 'integer'
			},
			...Auth.jsonSchema.properties
		}
	};

	static get relationMappings() {
		return {
			[User.tableName]: {
				relation: PasswordAuth.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: `${PasswordAuth.tableName}${Auth.columns.USER_ID}`,
					to: `${User.tableName}${User.columns.ID}`
				}
			}
		};
	}

	static async getAuthByUserId(userId: number): Promise<Auth | null> {
		return (await PasswordAuth.query().findOne(PasswordAuth.columns.USER_ID, '=', userId)) ?? null;
	}

	static async createUserWithPasswordAuth(data: AddPasswordAuthForUserData) {
		const user = await User.query(data.transaction).insert({});
		const passwordAuth = await PasswordAuth.createPasswordAuthForUser({ ...data, userId: user.id });

		return { user, passwordAuth };
	}

	static async createPasswordAuthForUser({
		userId,
		login,
		password,
		transaction
	}: CreatePasswordAuthForUserData) {
		const authData = {
			[Auth.columns.USER_ID]: userId,
			[Auth.columns.LOGIN]: login,
			[PasswordAuth.columns.PASSWORD_HASH]: hashSync(password, 10)
		};

		return await PasswordAuth.query(transaction).insert(authData);
	}
}
