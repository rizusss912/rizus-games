<script lang="ts" context="module">
	import { page } from "$app/stores";
	import Button, { ButtonSize, ButtonTheme, ButtonType } from "$lib/components/button.svelte";
	import UserAvatar from "$lib/components/user-avatar.svelte";
	import { AvatarSize } from "$lib/enums/avatar-size";
    import FileDrop from "$lib/components/file-drop.svelte";
    import Download from "$lib/icons/download.svelte";
</script>

<script lang="ts">
    let file: File | null;
    let previewSrc: string | null;

    $: fileChangeHandler(file);

    function fileChangeHandler(file: File | null) {
        if (!file) {
            previewSrc = null;
            return;
        }

        previewSrc = URL.createObjectURL(file);
    }
</script>

<FileDrop bind:file />

<form method="POST" enctype="multipart/form-data">
    <label class="avatar" for="avatar">
        <UserAvatar userData={$page.data.userData} size={AvatarSize.xl} />
        {#if file}
            <img class="preview" src={previewSrc} alt="avatar preview" width={AvatarSize.xl} height={AvatarSize.xl}>
        {/if}
        <div class="blackout">
            <Download size={AvatarSize.xl / 2} />
        </div>
    </label>
    <p class="file-selector">
        <Button
            buttonTheme={ButtonTheme.link}
            buttonType={ButtonType.input}
            size={ButtonSize.none}
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*, .jpg, .jpeg, .png, .webp"
            bind:file
            >
            выберите файл
        </Button>
        или перетащите его сюда
    </p>
    <Button disabled={!file} buttonType={ButtonType.input} type="submit" value="Сохранить аватар">
        Сохранить аватар
    </Button>
</form>

<style>
    form {
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    .avatar {
        position: relative;

        border-radius: 50%;
        overflow: hidden;

        cursor: pointer;
    }

    .blackout {
        background-color: transparent;
        opacity: 0;
        transition: background-color, opacity, .3s ease-in-out;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar:hover > .blackout,
    .avatar:focus-within > .blackout,
    .avatar:active > .blackout {
        opacity: 1;
        background-color: rgba(var(--background-color), .7);
    }

    .blackout,
    .preview {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;

        pointer-events: none;
    }

    .preview {
        object-fit: cover;
    }

    .file-selector {
        color: var(--main-text-color);
        text-align: center;
    }

    .file-selector > :global(*) {
        display: inline-block;
    }
</style>