<script lang="ts" context="module">
    const PASSWORD_MIN_LENGTH = 6;
    const PASSWORD_MAX_LENGTH = 100;
</script>

<form>
    <input
        type="text"
        name="login"
        id="login"
        placeholder="Логин"
        autocomplete="username"
        required
        minlength="5"
        maxlength="50"
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
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 300px;
    }
</style>