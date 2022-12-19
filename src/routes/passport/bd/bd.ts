import knex, { Knex } from 'knex';
import { BasePassport } from './models/base-passport';

let connectPassortBDPromise: Promise<Knex> | undefined;

export function connectPassortBD(): Promise<Knex> {
	if (connectPassortBDPromise) {
		return connectPassortBDPromise;
	}

	connectPassortBDPromise = new Promise<Knex>(async (resolve, reject) => {
		try {
			const passportPG = knex({
				client: 'pg',
				connection: {
					connectionString: process.env.PASSPORT_PG_CONNECTION_STRING,
					connectionTimeoutMillis: 60 * 1000,
					ssl: {
						rejectUnauthorized: false
					}
				}
			});

			BasePassport.knex(passportPG);
			resolve(passportPG);
		} catch (error) {
			reject(error);
		}
	});

	return connectPassortBDPromise;
}
