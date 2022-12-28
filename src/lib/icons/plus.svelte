<script>
	import Singleton from "$lib/components/singleton.svelte";
    import PlusSvg from "$lib/icons/plus-svg.svelte";
</script>

<Singleton component={PlusSvg} id="svg-plus">
    <svg width="24" height="24" viewBox="0 0 24 24">
        <use href="#svg-plus" />
    </svg>
</Singleton>
