<script lang="ts" context="module">
	import Form from "$lib/form/form.svelte";
	import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../form.const";
</script>

<Form>
    <input
        type="text"
        name="login"
        id="login"
        placeholder="Логин"
        autocomplete="username"
        required
        minlength={LOGIN_MIN_LENGTH}
        maxlength={LOGIN_MAX_LENGTH}
        autofocus
        />
    <input
        type="password"
        name="password"
        id="password"
        placeholder="Пароль"
        autocomplete="new-password"
        minlength={PASSWORD_MIN_LENGTH}
        maxlength={PASSWORD_MAX_LENGTH}
        required
        />
    <input
        type="password"
        name="password-confirm"
        id="password-confirm"
        placeholder="Повторите пароль"
        autocomplete="new-password"
        minlength={PASSWORD_MIN_LENGTH}
        maxlength={PASSWORD_MAX_LENGTH}
        required
        />
    <input type="submit" value="Зарегистрироваться" accesskey="s">
</Form>