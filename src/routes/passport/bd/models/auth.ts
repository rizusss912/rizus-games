import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '$passport/(forms)/form.const';
import { PassportModel } from '$passport/bd/models/passport-model';

export class Auth extends PassportModel {
	static columns = {
		USER_ID: 'userId',
		LOGIN: 'login'
	};

	public login!: string;
	public userId!: number;

	static jsonSchema = {
		type: 'object',
		required: Object.values([Auth.columns.LOGIN, Auth.columns.USER_ID]),
		properties: {
			[Auth.columns.USER_ID]: {
				type: 'integer'
			},
			[Auth.columns.LOGIN]: {
				type: 'string',
				maxLength: LOGIN_MAX_LENGTH,
				minLength: LOGIN_MIN_LENGTH
			}
		}
	};

	static async getAuthByUserId(userId: number): Promise<Auth | null> {
		throw Error('must be implemented in heirs');
	}

	static async getAuthByLogin(login: string): Promise<Auth | null> {
		throw Error('must be implemented in heirs');
	}
}
