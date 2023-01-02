<script lang="ts" context="module">
	import Button, { ButtonTheme, ButtonType } from '$lib/components/button.svelte';
	import InputText from '$lib/components/input-text.svelte';
	import { fetchOrGetIsAlreadyBusyLogin, loginIsAlreadyBusyLoginMap, type LoginIsAlreadyBusyLoginMap } from '$lib/fetch/fetch-is-already-busy-login';
	import { FieldValidationError, formValidationFactory, jsonValidationFactory, merge } from '$lib/utils/validation';
	import { validators } from '$passport/validators';
	import {
		LOGIN_MAX_LENGTH,
		LOGIN_MIN_LENGTH,
	} from '$passport/(forms)/form.const';
	import { page } from '$app/stores';

	const { getValidator } = jsonValidationFactory({
		login: merge(...validators.login),
	});
</script>

<script lang="ts">
	const data = {
		login: $page.data.userData.login,
	}

	const { onChange, errors, hasErrors } = formValidationFactory(data, getValidator);

	function getLoginError(login: string, error: FieldValidationError | null, loginIsAlreadyBusyLoginMap: LoginIsAlreadyBusyLoginMap) {
		if (error) {
			return error;
		}

		if (login === $page.data.userData.login) {
			return new FieldValidationError('совпадает с текущим', ['login']);
		}

		fetchOrGetIsAlreadyBusyLogin(login);

		if (loginIsAlreadyBusyLoginMap[login]) {
			return new FieldValidationError('уже занят', ['login']);
		}

		return  null;
	}
</script>

<InputText
	type="text"
	name="login"
	id="login"
	placeholder="новый логин"
	autocomplete="username"
	required
	minlength={LOGIN_MIN_LENGTH}
	maxlength={LOGIN_MAX_LENGTH}
	error={getLoginError(data.login, $errors.login, $loginIsAlreadyBusyLoginMap)}
	bind:value={data.login}
	on:change={onChange}
	on:input={onChange}
	/>

<div class="actions">
	<Button
		buttonTheme={ButtonTheme.primary}
		buttonType={ButtonType.input}
		type="submit"
		value="Войти"
		formaction="?{$page.url.searchParams.toString()}"
		disabled={$hasErrors || Boolean(getLoginError(data.login, $errors.login, $loginIsAlreadyBusyLoginMap))}
		>
		Сохранить
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