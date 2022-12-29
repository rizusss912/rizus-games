<script>
	import Singleton from "$lib/components/singleton.svelte";
	import CheckmarkSvg from "$lib/icons/checkmark-svg.svelte";
</script>

<Singleton component={CheckmarkSvg} id="svg-checkmark">
    <svg width="24" height="24" viewBox="0 0 24 24">
        <use href="#svg-checkmark" />
    </svg>
</Singleton>
