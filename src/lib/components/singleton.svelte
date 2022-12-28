<script lang="ts" context="module">
    import { onDestroy, type SvelteComponent } from "svelte";

    const countersMap = new Map();

    export function resetForSsr() {
        countersMap.clear();
    }
</script>

<script lang="ts">
    export let component: SvelteComponent;
    export let id: string;

    let lastId: string | null = null;

    let isFirst = onChangeId(id);

    function onChangeId(id: string) {
        const counter: number = countersMap.get(id) ?? 0;
        countersMap.set(id, counter + 1);

        if (lastId) {
            countersMap.set(lastId, countersMap.get(lastId) - 1);
        }

        lastId = id;

        return counter === 0;
    }

    function dropId() {
        const counter: number = countersMap.get(id);

        countersMap.set(id, counter - 1);
    }

    onDestroy(dropId);
</script>

{#if isFirst}
    <svelte:component this={component} {id} />
{:else}
    <slot />
{/if}