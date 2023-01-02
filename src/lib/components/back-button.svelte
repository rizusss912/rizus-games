<script lang="ts" context="module">
	import { page } from "$app/stores";
	import { Param } from "$lib/enums/param";
</script>

<script lang="ts">
    $: href = $page.url.searchParams.get(Param.INITIAOR);
</script>

{#if href}
    <a {href}>
        назад
    </a>
{/if}

<style>
    a {
        text-decoration: none;
        color: var(--main-text-color);

        display: block;
        position: relative;

        padding: 10px 10px 10px calc(10px + 1em);

        background-color: rgb(var(--background-color));
        border-radius: calc(10px + .5em);

        overflow: hidden;

        transition: max-width, color, .3s ease-in-out;

        max-width: 100px;
    }

    a:before,
    a:after {
        display: block;
        content: '';

        position: absolute;
        left: 10px;
        top: 53%;

        height: 35%;
        width: 2px;

        transition: background-color, .3s ease-in-out;
        background-color: var(--main-text-color);
        border-radius: 1px;

        transform-origin: 50% 0;
    }

    a:after {
        transform: rotate(-50deg);
    }

    a:before {
        transform: rotate(-130deg);
    }

    a:not(:hover):not(:focus-within):not(:active):before,
    a:not(:hover):not(:focus-within):not(:active):after {
        background-color: var(--secondary-text-color);
    }

    a:not(:hover):not(:focus-within):not(:active) {
        max-width: 0;

        color: transparent;
    }
</style>