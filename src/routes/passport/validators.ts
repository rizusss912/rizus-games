import { AccordRegExp, MaxLength, MinLength, Required, Trim } from '$lib/utils/default-validators';
import {
	LOGIN_MAX_LENGTH,
	LOGIN_MIN_LENGTH,
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH
} from './(forms)/form.const';

export const validators = {
	login: [
		new Trim(),
		new Required(),
		new MinLength(LOGIN_MIN_LENGTH),
		new MaxLength(LOGIN_MAX_LENGTH),
		new AccordRegExp(/^[A-Za-z]/, 'Должен начинаться с буквы'),
		new AccordRegExp(/[A-Za-z0-9]$/, 'Должен заканчиваться цифрой или буквой'),
		new AccordRegExp(/^[A-Za-z0-9_\.-]+$/, 'Долен содержать только латинские буквы, цифры и -_.')
	],
	password: [
		new Trim(),
		new Required(),
		new MaxLength(PASSWORD_MAX_LENGTH),
		new MinLength(PASSWORD_MIN_LENGTH)
	],
	anonymousLogin: [
		new Trim(),
		new Required(),
		new MinLength(LOGIN_MIN_LENGTH),
		new MaxLength(LOGIN_MAX_LENGTH)
	]
};
