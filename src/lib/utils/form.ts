import { error, type RequestEvent } from '@sveltejs/kit';

async function getFormData(event: RequestEvent) {
	try {
		return await event.request.formData();
	} catch {
		throw error(401, 'Error when parsing form data');
	}
}

function mapFormDataToObject<FormObject extends Record<string, string | null>>(
	formData: FormData
): FormObject {
	const formObject: FormObject = {};

	for (const [key] of formData) {
		formObject[key] = formData.get(key);
	}

	return formObject;
}

export async function selectFormData<FormObject extends Record<string, string | null>>(
	event: RequestEvent
): Promise<FormObject> {
	const formData = await getFormData(event);
	return mapFormDataToObject<FormObject>(formData);
}
