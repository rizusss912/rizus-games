<main>
    <slot />
</main>

<style>
    :root {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: 100%;
        min-height: 100vh;

        background-image: url(./default-light-background.jpeg);
    }

    main {
        padding: 32px;
        border-radius: 12px;

        background-color: var(--background-color);
    }

    @media (prefers-color-scheme: dark) {
        :root {
            background-image: url(./default-dark-background.jpeg);
        }
    }
</style>