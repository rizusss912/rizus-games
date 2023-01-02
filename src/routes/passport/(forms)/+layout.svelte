<script lang="ts" context="module">
	import BackButton from "$lib/components/back-button.svelte";
</script>

<div class="wrapper">
	<main>
		<div class="back-button">
			<BackButton />
		</div>
		<form method="POST">
			<slot />
		</form>
	</main>
</div>

<style>
	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 100%;
		height: 100%;

		min-height: 100vh;
	}

	.back-button {
		position: absolute;
		left: 15px;
		top: 30px;

		transform: translate(-100%);
	}

	main {
		padding: 32px;
		border-radius: 12px;

		background-color: rgba(var(--background-color));

		position: relative;
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 300px;
	}

</style>
