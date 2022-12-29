<script>
	import Singleton from "$lib/components/singleton.svelte";
	import CrossSvg from "$lib/icons/cross-svg.svelte";
</script>

<Singleton component={CrossSvg} id="svg-cross">
    <svg width="24" height="24" viewBox="0 0 24 24">
        <use href="#svg-cross" />
    </svg>
</Singleton>
