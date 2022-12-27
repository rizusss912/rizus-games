<script lang="ts" context="module">
	import { browser } from "$app/environment";
	import { writable } from "svelte/store";

    export enum ColorScheme {
        DARK = 'dark',
        LIGHT = 'light'
    }

    export const colorScheme = writable<ColorScheme>(browser && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? ColorScheme.DARK : ColorScheme.LIGHT);
    export const lastColorScheme = writable<ColorScheme | null>(null);
</script>

<script lang="ts">
    if (browser) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            $lastColorScheme = $colorScheme;
            $colorScheme = event.matches ? ColorScheme.DARK : ColorScheme.LIGHT;
        });
    }
</script>