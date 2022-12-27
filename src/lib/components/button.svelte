<script lang="ts" context="module">
    export enum ButtonType {
        a,
        button,
        input
    }

    export enum ButtonTheme {
        primary = 'primary',
        secondary = 'secondary',
        transparent = 'transparent',
    }

    export enum ButtonSize {
        none = 'none',
        m = 'm',
        s = 's',
        xs = 'xs'
    }
</script>

<script lang="ts">
	import { browser } from "$app/environment";


    export let buttonType: ButtonType = ButtonType.button;
    export let buttonTheme: ButtonTheme = ButtonTheme.primary;
    export let size: ButtonSize | null = ButtonSize.m;
    export let type: string | null = null;
    export let value: string | null = null;
    export let formaction: string | null = null;
    export let formmethod: string | null = null;
    export let href: string | null = null;

    const id = browser ? Math.random() : crypto.randomUUID();

    function getElementName(buttonType: ButtonType) {
        const elementNameMap: Record<ButtonType, string> = {
            [ButtonType.a]: 'a',
            [ButtonType.button]: 'button',
            [ButtonType.input]: 'label'
        }

        return elementNameMap[buttonType];
    }
</script>

<svelte:element this={getElementName(buttonType)} class="button {buttonTheme} {size}" {href} for={id}>
    <slot />
    {#if buttonType === ButtonType.input}
        <input {type} {value} {formmethod} {formaction} {id} />
    {/if}
</svelte:element>

<style>
    .button {
        display: flex;
        align-items: center;
        gap: 6px;

        cursor: pointer;

        text-decoration: none;
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
        box-shadow: inset 0px 0px 0px 1px var(--secondary-text-color);
        color: var(--primary-text-color);
    }

    .button.transparent {
        background: transparent;
        color: var(--secondary-text-color);
        fill: var(--secondary-text-color);
    }

    input {
        display: none;
    }
</style>