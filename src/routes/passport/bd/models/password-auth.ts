import type { Transaction } from 'objection';
import bcryptjs from 'bcryptjs';
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

	passwordHash!: string;
	checkPassword(password: string): boolean {
		return bcryptjs.compareSync(password, this.passwordHash);
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

	static async getAuthByLogin(login: string): Promise<Auth | null> {
		console.debug(`[PasswordAuth] getAuthByLogin. login: ${login}`);
		return (await PasswordAuth.query().findOne(PasswordAuth.columns.LOGIN, '=', login)) ?? null;
	}

	static async getAuthByUserId(userId: number): Promise<Auth | null> {
		console.debug(`[PasswordAuth] getAuthByUserId. userId: ${userId}`);
		return (await PasswordAuth.query().findOne(PasswordAuth.columns.USER_ID, '=', userId)) ?? null;
	}

	static async getAuthsByUserIds(userIds: number[]): Promise<Auth[]> {
		console.debug(`[PasswordAuth] getAuthsByUserIds. userIds: ${userIds.toString() || '[]'}`);
		return await PasswordAuth.query().whereIn(PasswordAuth.columns.USER_ID, userIds);
	}

	static async createUserWithPasswordAuth(data: AddPasswordAuthForUserData) {
		console.debug(
			`[PasswordAuth] createUserWithPasswordAuth. login: ${data.login}, password: ${data.password}`
		);
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
		console.debug(
			`[PasswordAuth] createPasswordAuthForUser. userId: ${userId}, login: ${login}, password: ${password}`
		);
		const authData = {
			[Auth.columns.USER_ID]: userId,
			[Auth.columns.LOGIN]: login,
			[PasswordAuth.columns.PASSWORD_HASH]: bcryptjs.hashSync(password, 10)
		};

		return await PasswordAuth.query(transaction).insert(authData);
	}

	public static async getPasswordAuthByLogin({
		login
	}: {
		login: string;
	}): Promise<PasswordAuth | null> {
		console.debug(`[PasswordAuth] getPasswordAuthByLogin. login: ${login}`);
		return (await PasswordAuth.query().findOne(PasswordAuth.columns.LOGIN, '=', login)) ?? null;
	}
}
