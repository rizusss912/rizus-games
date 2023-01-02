import knex, { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import { PassportModel } from '$passport/bd/models/passport-model';
import { env } from '$env/dynamic/private';

let connectPassortBDPromise: Promise<Knex> | undefined;

export function connectPassortBD(): Promise<Knex> {
	if (connectPassortBDPromise) {
		return connectPassortBDPromise;
	}

	connectPassortBDPromise = new Promise<Knex>((resolve, reject) => {
		try {
			const passportPG = knex({
				client: 'pg',
				connection: {
					connectionString: env.PASSPORT_PG_CONNECTION_STRING,
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
			passportPG.addListener('uncaughtException', (err) => {
				console.error(`[connectPassortBD] ERROR`, err);
			});

			PassportModel.knex(passportPG);
			resolve(passportPG);
		} catch (error) {
			reject(error);
		}
	});

	return connectPassortBDPromise;
}
