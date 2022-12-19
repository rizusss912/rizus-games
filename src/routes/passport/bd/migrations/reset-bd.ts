import type { Knex } from 'knex';
import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../(forms)/form.const';
import { AnonymousAuth } from '../models/anonymous-auth';
import { Token, TokenType } from '../models/token';
import { User } from '../models/user';
import { UserToken } from '../models/user-token';

async function createUserTable(knex: Knex) {
	await knex.schema.createTable(User.tableName, (user) => {
		user.increments(User.columns.ID).primary();
	});
}

async function createAnonymousAuthsTable(knex: Knex) {
	await knex.schema.createTable(AnonymousAuth.tableName, (anonymousAuth) => {
		anonymousAuth.increments(AnonymousAuth.columns.ID).primary();
		anonymousAuth
			.integer(AnonymousAuth.columns.USER_ID)
			.unique()
			.notNullable()
			.references(User.columns.ID)
			.inTable(User.tableName);
		anonymousAuth
			.string(AnonymousAuth.columns.LOGIN)
			.notNullable()
			.checkLength('>=', LOGIN_MIN_LENGTH)
			.checkLength('<=', LOGIN_MAX_LENGTH);
	});
}

async function createTokenTable(knex: Knex) {
	await knex.schema.createTable(Token.tableName, (token) => {
		token.increments(Token.columns.ID).primary();
		token.string(Token.columns.TYPE).notNullable().checkIn(Object.values(TokenType));
	});
}

async function createUserTokenTable(knex: Knex) {
	await knex.schema.createTable(UserToken.tableName, (token) => {
		token.increments(UserToken.columns.ID).primary();
		token.boolean(UserToken.columns.IS_ACTIVE_USER).notNullable();
		token
			.integer(UserToken.columns.TOKEN_ID)
			.notNullable()
			.references(Token.columns.ID)
			.inTable(Token.tableName);
		token
			.integer(UserToken.columns.USER_ID)
			.notNullable()
			.references(User.columns.ID)
			.inTable(User.tableName);
	});
}

export async function resetBD(knex: Knex) {
	await knex.schema.dropTableIfExists(UserToken.tableName);
	await knex.schema.dropTableIfExists(Token.tableName);
	await knex.schema.dropTableIfExists(AnonymousAuth.tableName);
	await knex.schema.dropTableIfExists(User.tableName);
	await createUserTable(knex);
	await createAnonymousAuthsTable(knex);
	await createTokenTable(knex);
	await createUserTokenTable(knex);
}
