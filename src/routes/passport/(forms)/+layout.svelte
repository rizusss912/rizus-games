<div class="wrapper">
	<main>
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

	main {
		padding: 32px;
		border-radius: 12px;

		background-color: rgba(var(--background-color));
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 300px;
	}

</style>
