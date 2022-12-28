<script lang="ts" context="module">
	import InputText from '$lib/components/input-text.svelte';
	import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../form.const';
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

<div class="actions">
	<input type="submit" value="Далее" accesskey="s" />
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