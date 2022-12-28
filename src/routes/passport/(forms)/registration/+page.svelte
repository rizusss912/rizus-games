<script lang="ts" context="module">
	import Button, { ButtonTheme, ButtonType } from '$lib/components/button.svelte';
	import InputText from '$lib/components/input-text.svelte';
	import {
		LOGIN_MAX_LENGTH,
		LOGIN_MIN_LENGTH,
		PASSWORD_MAX_LENGTH,
		PASSWORD_MIN_LENGTH
	} from '../form.const';
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
/>

<div class="actions">
	<Button buttonTheme={ButtonTheme.primary} buttonType={ButtonType.input} type="submit" value="Зарегистрироваться">
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