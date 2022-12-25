import { EndpointHandler, ValidationError, type JsonEndpointValue } from './validation';

export class StringOnly extends EndpointHandler {
	validate(value: JsonEndpointValue): asserts value is string {
		if (typeof value !== 'string') {
			throw new ValidationError('должно быть строкой');
		}
	}
}

export class Trim extends EndpointHandler {
	format(value: JsonEndpointValue) {
		if (typeof value === 'string') {
			return value.trim();
		}

		return value;
	}
}

export class Required extends EndpointHandler {
	validate(value: JsonEndpointValue) {
		super.validate(value);

		if (!value) {
			throw new ValidationError('обязательное поле');
		}
	}
}

export class AccordRegExp extends StringOnly {
	private regexp: RegExp;
	private message: string;

	constructor(regexp: RegExp, message: string) {
		super();

		this.regexp = regexp;
		this.message = message;
	}

	validate(value: JsonEndpointValue) {
		super.validate(value);

		if (!this.regexp.test(value)) {
			throw new ValidationError(this.message);
		}
	}
}

export class MaxLength extends StringOnly {
	private maxLength: number;

	constructor(maxLength: number) {
		super();

		this.maxLength = maxLength;
	}

	validate(value: JsonEndpointValue) {
		super.validate(value);

		if (value.length > this.maxLength) {
			throw new ValidationError(`ограничение по колличеству символов: ${this.maxLength}`);
		}
	}
}

export class MinLength extends StringOnly {
	private minLength: number;

	constructor(minLength: number) {
		super();

		this.minLength = minLength;
	}

	validate(value: JsonEndpointValue) {
		super.validate(value);

		if (value.length < this.minLength) {
			throw new ValidationError(`должно быть не меньше ${this.minLength}`);
		}
	}
}
