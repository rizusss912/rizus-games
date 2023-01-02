<script lang="ts" context="module">
	import { page } from "$app/stores";
	import ContinueAs from "$passport/(forms)/continue-as.svelte";
	import Button, { ButtonTheme, ButtonType } from '$lib/components/button.svelte';
	import InputText from '$lib/components/input-text.svelte';
	import { fetchOrGetIsAlreadyBusyLogin, loginIsAlreadyBusyLoginMap, type LoginIsAlreadyBusyLoginMap } from '$lib/fetch/fetch-is-already-busy-login';
	import { FieldValidationError, formValidationFactory, jsonValidationFactory, merge } from '$lib/utils/validation';
	import type { RegistraionFormData } from '$passport/(forms)/registration/+page.server';
	import { validators } from '$passport/validators';
	import {
		LOGIN_MAX_LENGTH,
		LOGIN_MIN_LENGTH,
		PASSWORD_MAX_LENGTH,
		PASSWORD_MIN_LENGTH
	} from '$passport/(forms)/form.const';

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
	let skipContinueAsLink: string;
	let skipped: boolean;

	const { onChange, errors, hasErrors } = formValidationFactory(data, getValidator);

	function getLoginError(login: string, error: FieldValidationError | null, loginIsAlreadyBusyLoginMap: LoginIsAlreadyBusyLoginMap) {
		if (error) {
			return error;
		}

		fetchOrGetIsAlreadyBusyLogin(login);

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

<ContinueAs authResult={$page.data} bind:skipContinueAsLink bind:skipped>
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
	<svelte:fragment slot="actions">
		{#if skipped}
			<Button
				buttonTheme={ButtonTheme.primary}
				buttonType={ButtonType.input}
				type="submit"
				value="Зарегистрироваться"
				disabled={Boolean($hasErrors || passwordsMustMatchError || getLoginError(data.login, $errors.login, $loginIsAlreadyBusyLoginMap))}
				>
				Зарегистрироваться
			</Button>
		{:else}
			<Button buttonTheme={ButtonTheme.primary} buttonType={ButtonType.a} href={skipContinueAsLink} value="Создать новый">
				Создать новый
			</Button>
		{/if}
		<Button buttonTheme={ButtonTheme.link} buttonType={ButtonType.a} href="./login?{$page.url.searchParams.toString()}">
			Войти
		</Button>
	</svelte:fragment>
</ContinueAs>
