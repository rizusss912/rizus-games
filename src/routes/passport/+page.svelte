<script lang="ts" context="module">
    import { enhance } from "$app/forms";
	import { invalidate, invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import Button, { ButtonType } from "$lib/components/button.svelte";
	import LoginLabel from "$passport/login-label.svelte";
	import PassiveUsersLabelsList from "$passport/passive-users-labels-list.svelte";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { onMount } from "svelte";
    import UserAvatar from "$lib/components/user-avatar.svelte";
	import { AvatarSize } from "$lib/enums/avatar-size";
</script>


<script lang="ts">
    let jsIsActive = false;

    let askForAnAvatarAgain: () => void;

    function enhanceUserFormHandler() {
        return async () => await invalidateAll();
    }

    const enhanceAvatarHandler: SubmitFunction = ({form}: {form: HTMLFormElement}) => {
        return async () => {
            await invalidate($page.url);
            form.reset();
            askForAnAvatarAgain();
        };
    }

    const handleChangeForm: FormEventHandler<HTMLFormElement> = (event: FormDataEvent) => {
        if (event.target!.value) {
            event.currentTarget?.dispatchEvent(new CustomEvent('submit'));
        }
    }

    onMount(() => jsIsActive = true)
</script>

<div class="wrapper">
    <main>
        <form on:change={handleChangeForm} method="POST" action="passport/{$page.data.userData.id}/avatar" enctype="multipart/form-data" use:enhance={enhanceAvatarHandler}>
            <label class="avatar-label" for="avatar">
                <UserAvatar userData={$page.data.userData} size={AvatarSize.NORMAL} bind:askForAnAvatarAgain />
            </label>
            <input
                type="file"
                id="avatar"
                name="avatar"
                class="avatar-input"
                class:hide-save-button={jsIsActive}
                accept="image/*, .jpg, .jpeg, .png, .webp"
                required
                />
            <Button buttonType={ButtonType.input} type="submit" value="Сохранить аватар">Сохранить аватар</Button>
        </form>
        <form class="user-form" use:enhance={enhanceUserFormHandler} method="POST">
            <LoginLabel userData={$page.data.userData} />
            <PassiveUsersLabelsList passiveUsersData={$page.data.passiveUsersData} />
        </form>
    </main>
</div>

<style>
    .wrapper {
        display: flex;
        justify-content: center;

        height: 100%;
        min-height: 100vh;

        --avatar-offset: 120px;

        color: var(--main-text-color);
    }

    main {
        position: relative;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;


        background-color: var(--background-color);

        margin: calc(var(--avatar-offset) + 50px) 50px 50px 50px;
        padding: var(--avatar-offset) 16px 16px 16px;
        width: 100%;
        max-width: 600px;
        border-radius: 16px;
    }

    .avatar-label {
        position: absolute;
        top: 0;
        left: 50%;

        border-radius: 50%;
        width: 200px;
        height: 200px;

        transform: translate(-50%, calc(var(--avatar-offset) * -1));

        border: 16px solid var(--background-color);
        background: var(--background-color);

        cursor: pointer;
        overflow: hidden;
    }
    
    .avatar-input {
        display: none;
    }

    .avatar-input.hide-save-button ~ :global(*),
    .avatar-input:invalid ~ :global(*) {
        display: none;
    }

    .user-form {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        justify-content: space-between;
        gap: 16px;

        width: 100%;
        height: 100%;
    }
</style>