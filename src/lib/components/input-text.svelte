<script lang="ts">
	export let name: string;
 	export let id: string;
	export let placeholder: string | null = null;
	export let type: 'password' | 'text' = 'text';
	export let autocomplete: 'username' | 'new-password' | null = null;
	export let required: boolean = false;
	export let minlength: number | null = null;
	export let maxlength: number | null = null;
	export let value: string | null = null;
	
	$: placeholderInInput = !value;

	function typeAction(node: HTMLInputElement) {
        node.type = type;
    }
</script>


<label for={id}>
	<input use:typeAction {name} {id} {placeholder} {autocomplete} {required} {minlength} {maxlength} bind:value />
	<span class="placeholder" class:in-input={placeholderInInput}>{placeholder}</span>
</label>

<style>
	label {
		position: relative;

		display: flex;
		flex-direction: column-reverse;
		gap: 4px;

		width: 100%;
	}

	.placeholder {
		color: var(--secondary-text-color);
		font-size: 14px;

		max-height: 12px;

		transition: font-size, opacity, .2s ease-in-out;
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

	label:after {
		width: 0;
		transition: width .4s ease-in-out;

		background: var(--primary-color);
	}
</style>