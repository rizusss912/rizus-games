<script lang="ts" context="module">
	import Singleton from "$lib/components/singleton.svelte";
	import SwapSvg from "$lib/icons/swap-svg.svelte";
</script>

<script lang="ts">
    export let size: number = 24;
</script>

<Singleton component={SwapSvg} id="svg-swap" {size}>
    <svg width={size} height={size} viewBox="0 0 24 24">
        <use href="#svg-swap" />
    </svg>
</Singleton>
