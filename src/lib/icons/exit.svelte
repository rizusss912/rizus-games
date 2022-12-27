<script>
	import Singleton from "$lib/components/singleton.svelte";
	import ExitSvg from "$lib/icons/exit-svg.svelte";
</script>

<Singleton component={ExitSvg} id="svg-exit">
    <svg width="24" height="24" viewBox="0 0 24 24">
        <use href="#svg-exit" />
    </svg>
</Singleton>
