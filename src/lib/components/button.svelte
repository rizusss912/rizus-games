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
    }
</script>

<script lang="ts">
    export let buttonType: ButtonType = ButtonType.button;
    export let buttonTheme: ButtonTheme = ButtonTheme.primary;
    export let size: ButtonSize | null = ButtonSize.m;
    export let type: string | null = null;
    export let value: string | null = null;
    export let formaction: string | null = null;
    export let formmethod: string | null = null;

    function getElementName(buttonType: ButtonType) {
        const elementNameMap: Record<ButtonType, string> = {
            [ButtonType.a]: 'a',
            [ButtonType.button]: 'button',
            [ButtonType.input]: 'label'
        }

        return elementNameMap[buttonType];
    }
</script>

<svelte:element this={getElementName(buttonType)} class="button {buttonTheme} {size}">
    <slot />
    {#if buttonType === ButtonType.input}
        <input {type} {value} {formmethod} {formaction} />
    {/if}
</svelte:element>

<style>
    .button {
        display: flex;
        align-items: center;
        gap: 6px;

        cursor: pointer;
    }

    .button.m {
        padding: 12px 24px;
        border-radius: 12px;
    }

    .button.primary {
        background: var(--primary-color);
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