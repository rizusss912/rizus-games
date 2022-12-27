<script lang="ts">
	import TabNavigation from '$lib/components/tab-navigation.svelte';
import Wallpaper from '$lib/wallpapers/wallpaper.svelte';
	import 'normalize.css/normalize.css';
</script>

<slot />

<Wallpaper />
<TabNavigation />

<style>
	:root {
		--background-color: white;
		--main-text-color: #161617;
		--primary-color: #2077f0;
		--primary-text-color: white;
		--secondary-text-color: rgba(62, 62, 62, 0.8);

		font-family: Verdana, Geneva, Tahoma, sans-serif;

		min-height: 100vh;
	}

	:global(body) {
		min-height: 100vh;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--background-color: #161617;
			--main-text-color: #e5e5e5;
			--secondary-text-color: rgba(181, 181, 181, 0.8);
		}
	}
</style>
