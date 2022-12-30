import { writable } from 'svelte/store';

export type JsonEndpointValue = string | number | boolean | File;
export type ErrorsJson = Record<string, ErrorsJson | FieldValidationError | null>;
export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export class FieldValidationError extends ValidationError {
	readonly fields: string[];

	constructor(message: string, fields: string[]) {
		super(message);

		this.fields = fields;
	}

	toString() {
		return `${this.fields.join('.')}: ${this.message}`;
	}
}
export interface Validator {
	validate(value: JsonEndpointValue): Promise<void> | void;
}
export interface Formatter {
	format(value: JsonEndpointValue): JsonEndpointValue;
}
export class EndpointHandler implements Validator, Formatter {
	validate(_: JsonEndpointValue): Promise<void> | void {}

	format(value: JsonEndpointValue): JsonEndpointValue {
		return value;
	}
}
export interface JsonShema extends Record<string, JsonShema | EndpointHandler> {}
export interface Json extends Record<string, Json | JsonEndpointValue> {}
export interface ValidateErrorsJson
	extends Record<string, ValidateErrorsJson | ValidationError[]> {}

export function merge(...handlers: EndpointHandler[]): EndpointHandler {
	return new (class extends EndpointHandler {
		private handlers: EndpointHandler[];

		constructor(...handlers: EndpointHandler[]) {
			super();
			this.handlers = handlers;
		}

		format(value: JsonEndpointValue): JsonEndpointValue {
			for (const handler of this.handlers) {
				value = handler.format(value);
			}

			return value;
		}

		async validate(value: JsonEndpointValue): Promise<void> {
			await Promise.all(this.handlers.map((handler) => handler.validate(value)));
		}
	})(...handlers);
}

export function jsonValidationFactory<JSON extends Json>(shema: JsonShema) {
	return {
		getValidator(json: JSON) {
			return new JsonHandler<JSON>(shema, json);
		}
	};
}

export function formValidationFactory<JSON extends Json>(
	json: JSON,
	getValidator: (json: JSON) => JsonHandler<JSON>
) {
	const errors = writable<ErrorsJson>({});
	const hasErrors = writable<boolean>(false);
	const validator = getValidator(json);

	async function onChange() {
		validator.format();
		const out = await validator.getErrors();
		errors.set(out.errors);
		hasErrors.set(out.hasErrors);
	}

	onChange();

	return { onChange, errors, hasErrors };
}

export class JsonHandler<JSON extends Json> {
	private shema: JsonShema;
	readonly json: JSON;

	constructor(shema: JsonShema, json: JSON) {
		this.shema = shema;
		this.json = json;
	}

	public async validate(): Promise<FieldValidationError[]> {
		return await JsonHandler.recursiveValidate(this.formatedJson, [], [], this.shema);
	}

	public get formatedJson(): JSON {
		return JsonHandler.recursiveFormat(this.json, {}, this.shema) as JSON;
	}

	public format(): JSON {
		return JsonHandler.recursiveFormat(this.json, this.json, this.shema) as JSON;
	}

	public async getErrors(): Promise<{
		errors: Record<string, FieldValidationError>;
		hasErrors: boolean;
	}> {
		const hasErrors = { hasErrors: false };
		const errors = await JsonHandler.recursiveGetErrorsJson(this.json, this.shema, {}, hasErrors);
		return { errors, hasErrors: hasErrors.hasErrors };
	}

	private static async recursiveGetErrorsJson(
		json: Json,
		shema: JsonShema,
		errorsJson: ErrorsJson,
		hasErrors: { hasErrors: boolean }
	) {
		for (const [shemaKey, shemaValue] of Object.entries(shema)) {
			const value = json[shemaKey];

			if (shemaValue instanceof EndpointHandler) {
				if (!JsonHandler.isEndpoint(value)) {
					continue;
				}

				errorsJson[shemaKey] = null;

				try {
					await shemaValue.validate(value);
				} catch (error) {
					errorsJson[shemaKey] = error;
					hasErrors.hasErrors = true;
				}

				continue;
			}

			if (JsonHandler.isEndpoint(value)) {
				continue;
			}

			const nextErrorsJson: Json = {};

			await JsonHandler.recursiveGetErrorsJson(value, shemaValue, nextErrorsJson, hasErrors);

			errorsJson[shemaKey] = nextErrorsJson;
		}

		return errorsJson;
	}

	private static isEndpoint(value: JsonEndpointValue | Json): value is JsonEndpointValue {
		if (typeof value === 'function') {
			return false;
		}

		if (typeof value !== 'object') {
			return true;
		}

		if (value === null) {
			return false;
		}

		return true;
	}

	private static recursiveFormat(json: Json, outJson: Json, shema: JsonShema): Json {
		for (const [shemaKey, shemaValue] of Object.entries(shema)) {
			const value = json[shemaKey];

			if (shemaValue instanceof EndpointHandler) {
				if (!JsonHandler.isEndpoint(value)) {
					continue;
				}

				outJson[shemaKey] = shemaValue.format(value);
				continue;
			}

			if (JsonHandler.isEndpoint(value)) {
				continue;
			}

			const outJsonKey: Json = {};

			JsonHandler.recursiveFormat(value, outJsonKey, shemaValue);

			outJson[shemaKey] = outJsonKey;
		}

		return outJson;
	}

	private static async recursiveValidate(
		json: Json,
		fields: string[],
		errrs: FieldValidationError[],
		shema: JsonShema
	): Promise<FieldValidationError[]> {
		for (const [shemaKey, shemaValue] of Object.entries(shema)) {
			const value = json[shemaKey];

			if (shemaValue instanceof EndpointHandler) {
				if (!JsonHandler.isEndpoint(value)) {
					continue;
				}

				try {
					await shemaValue.validate(value);
				} catch (error) {
					errrs.push(new FieldValidationError((error as Error).message, [...fields, shemaKey]));
				}

				continue;
			}

			if (JsonHandler.isEndpoint(value)) {
				continue;
			}

			const newFields = [...fields, shemaKey];

			JsonHandler.recursiveValidate(value, newFields, errrs, shemaValue);
		}

		return errrs;
	}
}
