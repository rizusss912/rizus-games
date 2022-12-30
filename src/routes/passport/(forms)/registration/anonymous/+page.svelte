<script lang="ts" context="module">
	import Button, { ButtonTheme, ButtonType } from '$lib/components/button.svelte';
	import InputText from '$lib/components/input-text.svelte';
	import { Required } from '$lib/utils/default-validators';
	import { formValidationFactory, jsonValidationFactory } from '$lib/utils/validation';
	import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '../../form.const';

	const { getValidator } = jsonValidationFactory({
		login: new Required(),
	});
</script>

<script lang="ts">
	const data = {
		login: ''
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
	bind:value={data.login}
	error={$errors.login}
	on:input={onChange}
	/>

<div class="actions">
	<Button buttonTheme={ButtonTheme.primary} buttonType={ButtonType.input} type="submit" value="Далее" disabled={$hasErrors}>
		Далее
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