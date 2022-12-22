import knex, { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import { PassportModel } from './models/passport-model';

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
				},
				...knexSnakeCaseMappers()
			});

			passportPG.addListener('connection', () =>
				console.debug(`[connectPassortBD] connection SUSSES`)
			);

			PassportModel.knex(passportPG);
			resolve(passportPG);
		} catch (error) {
			reject(error);
		}
	});

	return connectPassortBDPromise;
}
