<script lang="ts" context="module">
	import Singleton from "$lib/components/singleton.svelte";
	import DownloadSvg from "$lib/icons/download-svg.svelte";
</script>

<script lang="ts">
    export let size: number = 24;
</script>

<Singleton component={DownloadSvg} id="svg-download" {size}>
    <svg width={size} height={size} viewBox="0 0 24 24">
        <use href="#svg-download" />
    </svg>
</Singleton>
