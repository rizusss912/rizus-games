<script lang="ts" context="module">
    import { browser } from "$app/environment";

    export enum ButtonType {
        a,
        button,
        input
    }

    export enum ButtonTheme {
        primary = 'primary',
        secondary = 'secondary',
        transparent = 'transparent',
        link = 'link',
    }

    export enum ButtonSize {
        none = 'none',
        m = 'm',
        s = 's',
        xs = 'xs'
    }
</script>

<script lang="ts">
    export let buttonType: ButtonType = ButtonType.button;
    export let buttonTheme: ButtonTheme = ButtonTheme.primary;
    export let size: ButtonSize | null = ButtonSize.m;
    export let type: 'submit' | 'file' | null = null;
    export let value: string | null = null;
    export let formaction: string | null = null;
    export let formmethod: string | null = null;
    export let href: string | null = null;
    export let disabled = false;
    export let accept: string | null = null;
    export let id: string = String(browser ? Math.random() * 1000 : crypto.randomUUID());
    export let name: string | null = null;
    export let file: File | null = null;

    let input: HTMLInputElement | null = null;

    $: fileChangeHandler(file);

    function getElementName(buttonType: ButtonType) {
        const elementNameMap: Record<ButtonType, string> = {
            [ButtonType.a]: 'a',
            [ButtonType.button]: 'button',
            [ButtonType.input]: 'label'
        }

        return elementNameMap[buttonType];
    }

    function fileChangeHandler(file: File | null) {
        if (!input) {
            return;
        }

        if (input.files?.[0] ?? null === file) {
            return;
        }

        let container = new DataTransfer();

        container.items.add(file);
        input.files = container.files;
    }

    function changeHandler(event: Event) {
        if (type !== 'file') {
            return;
        }

        file = input.files?.[0] ?? null;
    }
</script>

<svelte:element this={getElementName(buttonType)} class="button {buttonTheme} {size}" {href} for={id} {disabled}>
    {#if buttonType === ButtonType.input}
        <input {type} {value} {formmethod} {formaction} {id} {disabled} {name} on:change={changeHandler} bind:this={input} />
    {/if}
    <slot />
</svelte:element>

<style>
    .button {
        display: flex;
        align-items: center;
        gap: 6px;

        cursor: pointer;

        text-decoration: none;

        position: relative;
    }

    input {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;

        font-size: 0;
        content-visibility: hidden;
        background: transparent;
        color: transparent;
        border: none;
        border-radius: inherit;

        pointer-events: none;

        cursor: pointer;
    }

    .button.xs {
        padding: 4px 9px;
        border-radius: 4px;
    }

    .button.s {
        padding: 9px 16px;
        border-radius: 9px;
    }

    .button.m {
        padding: 12px 24px;
        border-radius: 12px;
    }

    .button.primary {
        background: var(--primary-color);
        color: var(--primary-text-color);
    }

    .button.secondary {
        background: transparent;
        box-shadow: inset 0px 0px 1px .5px var(--secondary-text-color);
        color: var(--primary-text-color);

        transition: box-shadow, .2s;
    }

    .button[disabled="true"] {
        background: var(--secondary-text-color);
        opacity: .3;
    }

    .button.secondary:hover,
    .button.secondary:active,
    .button.secondary:focus,
    .button.secondary:focus-within {
        box-shadow: inset 0px 0px 0px 1px var(--secondary-text-color);
    }

    .button.transparent {
        background: transparent;
        color: var(--secondary-text-color);
        fill: var(--secondary-text-color);
    }

    .button.link {
		text-decoration: none;
		color: #6292ff;

		transition: color, 0.2s;
	}

	.button.link:hover,
	.button.link:focus,
	.button.link:active {
		color: #a1beff;
	}
</style>