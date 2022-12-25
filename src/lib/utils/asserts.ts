import type { HttpError } from '@sveltejs/kit';

export function parseIntOrThrowError(string: string, error?: HttpError): number {
	try {
		return parseInt(string, 10);
	} catch (err) {
		throw error ?? err;
	}
}
