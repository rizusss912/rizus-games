import type { Knex } from 'knex';
import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../(forms)/form.const';
import { AnonymousAuth } from '../models/anonymous-auth';
import { Auth } from '../models/auth';
import { PasswordAuth } from '../models/password-auth';
import { Token, TokenType } from '../models/token';
import { User } from '../models/user';
import { UserToken } from '../models/user-token';
import { Avatar } from '$passport/bd/models/avatar';
import { UserAvatar } from '$passport/bd/models/user-avatar';
import { DefaultAvatar } from '$passport/bd/models/default-avatars';

async function createUserTable(knex: Knex) {
	await knex.schema.createTable(User.tableName, (user) => {
		user.increments(User.columns.ID).primary();
		user.timestamps();
	});
}

async function createUserAvatarTable(knex: Knex) {
	await knex.schema.createTable(UserAvatar.tableName, (avatar) => {
		avatar.increments(UserAvatar.columns.ID).primary();
		avatar.integer(UserAvatar.columns.AVATAR_ID).notNullable();
		avatar.integer(UserAvatar.columns.USER_ID).notNullable();
		avatar.timestamps();
	});
}

async function createAvatarTable(knex: Knex) {
	await knex.schema.createTable(Avatar.tableName, (avatar) => {
		avatar.increments(Avatar.columns.ID).primary();
		avatar.string(Avatar.columns.ORIGINAL_NAME).notNullable();
		avatar.timestamps();
	});
}

async function createDefaultAvatarTable(knex: Knex) {
	await knex.schema.createTable(DefaultAvatar.tableName, (defaultAvatar) => {
		defaultAvatar.increments(DefaultAvatar.columns.ID).primary();
		defaultAvatar
			.integer(DefaultAvatar.columns.AVATAR_ID)
			.notNullable()
			.references(Avatar.columns.ID)
			.inTable(Avatar.tableName);

		defaultAvatar.timestamps();
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
		anonymousAuth.timestamps();
	});
}

async function createPasswordAuthsTable(knex: Knex) {
	await knex.schema.createTable(PasswordAuth.tableName, (passwordAuth) => {
		passwordAuth.increments(PasswordAuth.columns.ID).primary();
		passwordAuth
			.integer(Auth.columns.USER_ID)
			.unique()
			.notNullable()
			.references(User.columns.ID)
			.inTable(User.tableName);
		passwordAuth
			.string(Auth.columns.LOGIN)
			.notNullable()
			.checkLength('>=', LOGIN_MIN_LENGTH)
			.checkLength('<=', LOGIN_MAX_LENGTH)
			.unique();
		passwordAuth.string(PasswordAuth.columns.PASSWORD_HASH).notNullable();
		passwordAuth.timestamps();
	});
}

async function createTokenTable(knex: Knex) {
	await knex.schema.createTable(Token.tableName, (token) => {
		token.increments(Token.columns.ID).primary();
		token.string(Token.columns.TYPE).notNullable().checkIn(Object.values(TokenType));
		token.timestamps();
	});
}

async function createUserTokenTable(knex: Knex) {
	await knex.schema.createTable(UserToken.tableName, (userToken) => {
		userToken.increments(UserToken.columns.ID).primary();
		userToken.boolean(UserToken.columns.IS_ACTIVE_USER).notNullable();
		userToken
			.integer(UserToken.columns.TOKEN_ID)
			.notNullable()
			.references(Token.columns.ID)
			.inTable(Token.tableName);
		userToken
			.integer(UserToken.columns.USER_ID)
			.notNullable()
			.references(User.columns.ID)
			.inTable(User.tableName);
		userToken.timestamps();
	});
}

export async function resetBD(knex: Knex) {
	await knex.schema.dropTableIfExists(UserToken.tableName);
	await knex.schema.dropTableIfExists(Token.tableName);
	await knex.schema.dropTableIfExists(AnonymousAuth.tableName);
	await knex.schema.dropTableIfExists(PasswordAuth.tableName);
	await knex.schema.dropTableIfExists(UserAvatar.tableName);
	await knex.schema.dropTableIfExists(DefaultAvatar.tableName);
	await knex.schema.dropTableIfExists(User.tableName);
	await knex.schema.dropTableIfExists(Avatar.tableName);

	await createUserTable(knex);
	await createAvatarTable(knex);
	await createUserAvatarTable(knex);
	await createDefaultAvatarTable(knex);
	await createAnonymousAuthsTable(knex);
	await createPasswordAuthsTable(knex);
	await createTokenTable(knex);
	await createUserTokenTable(knex);
}
