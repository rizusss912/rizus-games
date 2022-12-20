import type { RequestHandler } from './$types';
import type { RequestEvent } from '../(forms)/registration/anonymous/$types';
import { AuthorizationService } from '../authorization-service';
import { PassportModel } from '../bd/models/passport-model';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const transaction = await PassportModel.startTransaction();
	try {
		const authData = await AuthorizationService.auth({ event, transaction });
		await transaction.commit();
		return new Response(JSON.stringify(authData));
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
};
