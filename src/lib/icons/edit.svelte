<script>
	import Singleton from "$lib/components/singleton.svelte";
	import EditSvg from "$lib/icons/edit-svg.svelte";
</script>

<Singleton component={EditSvg} id="svg-edit">
    <svg width="24" height="24" viewBox="0 0 24 24">
        <use href="#svg-edit" />
    </svg>
</Singleton>
