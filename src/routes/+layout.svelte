<script lang="ts">
    import 'normalize.css/normalize.css';
</script>

<slot />

<style>
    :root {
        --background-color: white;
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --background-color: #161617;
        }
    }
</style>