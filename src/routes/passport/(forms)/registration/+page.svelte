<script lang="ts" context="module">
	import Button, { ButtonTheme, ButtonType } from '$lib/components/button.svelte';
	import InputText from '$lib/components/input-text.svelte';
	import { fetchIsAlreadyBusyLogin } from '$lib/fetch/fetch-is-already-busy-login';
	import { FieldValidationError, formValidationFactory, jsonValidationFactory, merge } from '$lib/utils/validation';
	import type { RegistraionFormData } from '$passport/(forms)/registration/+page.server';
	import { validators } from '$passport/validators';
	import { writable } from 'svelte/store';
	import {
		LOGIN_MAX_LENGTH,
		LOGIN_MIN_LENGTH,
		PASSWORD_MAX_LENGTH,
		PASSWORD_MIN_LENGTH
	} from '../form.const';

	type LoginIsAlreadyBusyLoginPromiseMap = Record<string, Promise<boolean>>;
	type LoginIsAlreadyBusyLoginMap = Record<string, boolean>;

	const { getValidator } = jsonValidationFactory<RegistraionFormData>({
		login: merge(...validators.login),
		password: merge(...validators.password),
		passwordConfirm: merge(...validators.password)
	});
</script>

<script lang="ts">
	const data = {
		login: '',
		password: '',
		passwordConfirm: ''
	}

	let passwordsMustMatchError: FieldValidationError | null = null;

	const loginIsAlreadyBusyLoginMap = writable<LoginIsAlreadyBusyLoginMap>({});
	const loginIsAlreadyBusyLoginPromiseMap = writable<LoginIsAlreadyBusyLoginPromiseMap>({});

	const { onChange, errors, hasErrors } = formValidationFactory(data, getValidator);

	function getLoginError(login: string, error: FieldValidationError | null, loginIsAlreadyBusyLoginMap: LoginIsAlreadyBusyLoginMap) {
		if (error) {
			return error;
		}

		if (!Boolean($loginIsAlreadyBusyLoginPromiseMap[login]) && login) {
			$loginIsAlreadyBusyLoginPromiseMap[login] = fetchIsAlreadyBusyLogin(login);
			$loginIsAlreadyBusyLoginPromiseMap[login].then(isAlreadyBusy => $loginIsAlreadyBusyLoginMap[login] = isAlreadyBusy);
		}

		if (loginIsAlreadyBusyLoginMap[login]) {
			return new FieldValidationError('уже занят', ['login']);
		}

		return  null;
	}

	function getPasswordsMustMatchError(password: string, passwordConfirm: string) {
		if (password === passwordConfirm) {
			return null;
		}

		return new FieldValidationError('пароли дожны совпадать', ['login']);
	}

	async function customOnChange() {
		await onChange();
		passwordsMustMatchError = getPasswordsMustMatchError(data.password, data.passwordConfirm)
	}
</script>

<InputText
	type="text"
	name="login"
	id="login"
	placeholder="Логин"
	autocomplete="username"
	required
	minlength={LOGIN_MIN_LENGTH}
	maxlength={LOGIN_MAX_LENGTH}
	error={getLoginError(data.login, $errors.login, $loginIsAlreadyBusyLoginMap)}
	bind:value={data.login}
	on:input={customOnChange}
/>
<InputText
	type="password"
	name="password"
	id="password"
	placeholder="Пароль"
	autocomplete="new-password"
	minlength={PASSWORD_MIN_LENGTH}
	maxlength={PASSWORD_MAX_LENGTH}
	required
	error={$errors.password || passwordsMustMatchError}
	bind:value={data.password}
	on:input={customOnChange}
/>
<InputText
	type="password"
	name="passwordConfirm"
	id="passwordConfirm"
	placeholder="Повторите пароль"
	autocomplete="new-password"
	minlength={PASSWORD_MIN_LENGTH}
	maxlength={PASSWORD_MAX_LENGTH}
	required
	error={$errors.passwordConfirm || passwordsMustMatchError}
	bind:value={data.passwordConfirm}
	on:input={customOnChange}
/>

<div class="actions">
	<Button
		buttonTheme={ButtonTheme.primary}
		buttonType={ButtonType.input}
		type="submit"
		value="Зарегистрироваться"
		disabled={Boolean($hasErrors || passwordsMustMatchError || getLoginError(data.login, $errors.login, $loginIsAlreadyBusyLoginMap))}
		>
		Зарегистрироваться
	</Button>
	<Button buttonTheme={ButtonTheme.link} buttonType={ButtonType.a} href="./login">
		Войти
	</Button>
</div>

<style>
	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;

		margin-top: 12px;
	}
</style>