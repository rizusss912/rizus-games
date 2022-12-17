<script lang="ts" context="module">
	import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../form.const';
</script>

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
<input type="submit" value="Далее" accesskey="s" />
