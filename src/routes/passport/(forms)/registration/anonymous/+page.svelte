<script lang="ts" context="module">
	import { page } from '$app/stores';
	import Button, { ButtonTheme, ButtonType } from '$lib/components/button.svelte';
	import InputText from '$lib/components/input-text.svelte';
	import { Required } from '$lib/utils/default-validators';
	import { formValidationFactory, jsonValidationFactory } from '$lib/utils/validation';
	import ContinueAs from '$passport/(forms)/continue-as.svelte';
	import { LOGIN_MAX_LENGTH, LOGIN_MIN_LENGTH } from '$passport/(forms)/form.const';

	const { getValidator } = jsonValidationFactory({
		login: new Required(),
	});
</script>

<script lang="ts">
	const data = {
		login: ''
	}

	const { onChange, errors, hasErrors } = formValidationFactory(data, getValidator);

	let skipped: boolean;
	let skipContinueAsLink: string;
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
		bind:value={data.login}
		error={$errors.login}
		on:input={onChange}
		/>

	<svelte:fragment slot="actions">
		{#if skipped}
			<Button buttonTheme={ButtonTheme.primary} buttonType={ButtonType.input} type="submit" value="Далее" disabled={$hasErrors}>
				Далее
			</Button>
		{:else}
			<Button buttonTheme={ButtonTheme.primary} buttonType={ButtonType.a} href={skipContinueAsLink} value="Создать новый">
				Создать новый
			</Button>
		{/if}
	</svelte:fragment>
</ContinueAs>
