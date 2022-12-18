import type { Knex } from 'knex';
import { AnonymousAuth } from '../models/anonymous-auth';
import { User } from '../models/user';

async function createUserTable(knex: Knex) {
	await knex.schema.createTable(User.tableName, (user) => {
		user.increments(User.columns.ID).primary();
	});
}

async function createAnonymousAuthsTable(knex: Knex) {
	await knex.schema.createTable(AnonymousAuth.tableName, (anonymousAuth) => {
		anonymousAuth.increments(AnonymousAuth.columns.ID).primary();
		anonymousAuth.integer(AnonymousAuth.columns.USER_ID).unique();
	});
}

export async function resetBD(knex: Knex) {
	await knex.schema.dropTableIfExists(AnonymousAuth.tableName);
	await knex.schema.dropTableIfExists(User.tableName);
	await createUserTable(knex);
	await createAnonymousAuthsTable(knex);
}
