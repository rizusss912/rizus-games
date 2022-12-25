<script lang="ts">
	import 'normalize.css/normalize.css';
</script>

<slot />

<style>
	:root {
		--background-color: white;
		--main-text-color: #161617;
		--primary-color: #2077f0;
		--primary-text-color: white;

		font-family: Verdana, Geneva, Tahoma, sans-serif;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--background-color: #161617;
			--main-text-color: #e5e5e5;
		}
	}
</style>
