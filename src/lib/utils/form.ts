import { error, type RequestEvent } from '@sveltejs/kit';
import type { Json, JsonHandler } from './validation';

async function getFormData(event: RequestEvent) {
	try {
		return await event.request.formData();
	} catch {
		throw error(401, 'Error when parsing form data');
	}
}

function mapFormDataToObject<FormObject extends Json>(formData: FormData): FormObject {
	const formObject: FormObject = {};

	for (const [key] of formData) {
		formObject[key] = formData.get(key);
	}

	return formObject;
}

export async function selectFormData<FormObject extends Json>(
	event: RequestEvent
): Promise<FormObject> {
	const formData = await getFormData(event);
	return mapFormDataToObject<FormObject>(formData);
}

export async function selectFormDataAndValidate<FormObject extends Json>(
	event: RequestEvent,
	getValidation: (json: FormObject) => JsonHandler<FormObject>
): Promise<FormObject> {
	const validation = getValidation(await selectFormData<FormObject>(event));

	const validationErrors = await validation.validate();

	for (const validationError of validationErrors) {
		throw error(401, validationError.toString());
	}

	return validation.formatedJson;
}
