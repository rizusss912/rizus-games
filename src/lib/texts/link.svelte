<script lang="ts">
	export let href: string;
</script>

<a {href}>
	<slot />
</a>

<style>
	a {
		text-decoration: none;
		color: #6292ff;

		transition: color, 0.2s;
	}

	a:hover,
	a:focus,
	a:active {
		color: #a1beff;
	}
</style>
