<script lang="ts" context="module">
	import Button, { ButtonTheme, ButtonType } from '$lib/components/button.svelte';
	import InputText from '$lib/components/input-text.svelte';
	import { formValidationFactory, jsonValidationFactory, merge } from '$lib/utils/validation';
	import { validators } from '$passport/validators';
	import {
		LOGIN_MAX_LENGTH,
		LOGIN_MIN_LENGTH,
		PASSWORD_MAX_LENGTH,
		PASSWORD_MIN_LENGTH
	} from '../form.const';

	const { getValidator } = jsonValidationFactory({
		login: merge(...validators.login),
		password: merge(...validators.password)
	});
</script>

<script lang="ts">
	const data = {
		login: '',
		password: ''
	}

	const { onChange, errors, hasErrors } = formValidationFactory(data, getValidator);
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
	error={$errors.login}
	bind:value={data.login}
	on:change={onChange}
	on:input={onChange}
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
	error={$errors.password}
	bind:value={data.password}
	on:change={onChange}
	on:input={onChange}
	/>

<div class="actions">
	<Button buttonTheme={ButtonTheme.primary} buttonType={ButtonType.input} type="submit" value="Войти" disabled={$hasErrors}>
		Войти
	</Button>
	<Button buttonTheme={ButtonTheme.link} buttonType={ButtonType.a} href="./registration">
		Зарегистрироваться
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