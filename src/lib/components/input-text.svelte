<script lang="ts">
	import type { FieldValidationError } from "$lib/utils/validation";
	import { createEventDispatcher } from "svelte";

	export let name: string;
 	export let id: string;
	export let placeholder: string | null = null;
	export let type: 'password' | 'text' = 'text';
	export let autocomplete: 'username' | 'new-password' | null = null;
	export let required: boolean = false;
	export let minlength: number | null = null;
	export let maxlength: number | null = null;
	export let value: string | null = null;
	export let autofocus: boolean = false;
	export let error: FieldValidationError | null = null;

	const dispatch = createEventDispatcher();

	let touched = false;
	let focused = false;
	
	$: placeholderInInput = !value;
	$: touched = getIsTouched(value);

	function getIsTouched(_: string | null) {
		if (focused) {
			return true;
		}

		return touched;
	}

	function typeAction(node: HTMLInputElement) {
        node.type = type;
    }

	function blurHandler(event: FocusEvent) {
		touched = true;
		focused = false;
		dispatch('blur', event);
	}

	function focusHandler(event: FocusEvent) {
		focused = true;
		dispatch('focus', event);
	}
</script>


<div class="wrapper">
	<label for={id} class:has-error={Boolean(error)} class:touched={touched}>
		<input
			use:typeAction
			{name}
			{id}
			{placeholder}
			{autocomplete}
			{required}
			{minlength}
			{maxlength}
			{autofocus}
			bind:value
			on:focus={focusHandler}
			on:focusout
			on:blur={blurHandler}
			on:change
			on:input
			/>
		<span class="placeholder" class:in-input={placeholderInInput}>{placeholder}</span>
	</label>
	<span class="error">{error?.message ?? ''}</span>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;

		width: 100%;
	}

	label {
		position: relative;

		display: flex;
		flex-direction: column-reverse;
		gap: 4px;

		width: 100%;
	}

	label:not(:focus-within).has-error.touched > .placeholder {
		opacity: 1;
		color: red;
	}

	.placeholder {
		color: var(--secondary-text-color);
		font-size: 14px;

		max-height: 12px;

		transition: font-size, opacity, color, .2s ease-in-out;
		opacity: .5;
	}

	input {
		outline: none;
		border: none;

		background-color: var(--background-color);
		color: var(--main-text-color);

		padding: 10px 0;
	}

	input:focus ~ .placeholder {
		opacity: 1;
	}

	input:not(:focus) ~ .placeholder.in-input {
		font-size: inherit;
		opacity: 1;

		transform: translate(0, calc(100% + 10px));
	}

	input::placeholder {
		color: transparent;
	}

	label:focus-within:after {
		width: 100%;
	}

	label:focus-within + .error {
		color: var(--secondary-text-color);
	}

	label:before,
	label:after {
		display: block;
		content: ' ';

		position: absolute;
		top: 100%;
		bottom: 0;

		height: 4px;
	}

	label:before {
		background: rgba(120, 120, 120, .2);
		width: 100%;
	}

	label.has-error.touched:before {
		background: red;
		width: 100%;
	}

	label:after {
		width: 0;
		transition: width .4s ease-in-out;

		background: var(--primary-color);
	}

	.error {
		transition: color, .4s ease-in-out;
		color: red;

		font-size: 12px;
		min-height: 14px;
	}

	label:not(.touched) ~ .error {
		opacity: 0;
	}
</style>