import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../(forms)/form.const';
import { BasePassport } from './base-passport';
import { User } from './user';

export class AnonymousAuth extends BasePassport {
	static tableName = 'anonymousAuths';
	static idColumn = 'id';
	static columns = {
		ID: AnonymousAuth.idColumn,
		USER_ID: 'userId',
		LOGIN: 'login'
	};

	static jsonSchema = {
		type: 'object',
		required: Object.values(AnonymousAuth.columns),
		[AnonymousAuth.columns.ID]: {
			type: 'integer',
			unique: true
		},
		[AnonymousAuth.columns.USER_ID]: {
			type: 'integer',
			unique: true
		},
		[AnonymousAuth.columns.LOGIN]: {
			type: 'string',
			maxLength: LOGIN_MAX_LENGTH,
			minLength: LOGIN_MIN_LENGTH
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

	static async createUserWithAnonymousAuth(login: string) {
		const transaction = await AnonymousAuth.startTransaction();

		try {
			const user = await User.query(transaction).insert();
			const authData = {
				[AnonymousAuth.columns.USER_ID]: user.id,
				[AnonymousAuth.columns.LOGIN]: login
			};
			const anonymousAuth = await user
				.$relatedQuery(AnonymousAuth.tableName, transaction)
				.insert(authData);

			transaction.commit();
			return { user, anonymousAuth };
		} catch (error) {
			transaction.rollback();
			throw error;
		}
	}
}
