<script lang="ts" context="module">
</script>

<script lang="ts">
    export let file: File | null = null;

    let isDragedFile: boolean = false;

    function getDragenterHandler(isDragedFilePreset: boolean) {
        return (event: DragEvent) => {
            isDragedFile = isDragedFilePreset;

            if (!event.dataTransfer?.files[0]) {
                return;
            }

            file = event.dataTransfer.files[0];
        }
    }
</script>

<svelte:body
    on:drop|preventDefault={getDragenterHandler(false)}
    on:dragover|preventDefault={getDragenterHandler(true)}
    on:dragenter|preventDefault={getDragenterHandler(true)}
    on:dragleave|preventDefault={getDragenterHandler(false)}
    />

<div class="drop-zone" class:hidden={!isDragedFile} />

<style>
    .drop-zone {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;

        z-index: 1000;
        pointer-events: none;

        background-color: rgba(var(--background-color), .5);
        transition: background-color, .2s ease-in-out;
    }

    .drop-zone.hidden {
        opacity: 0;
    }
</style>