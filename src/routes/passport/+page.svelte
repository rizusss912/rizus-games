<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import Button, { ButtonType } from "$lib/components/button.svelte";
	import { AvatarSize } from "$lib/enums/avatar-size";

    function enhanceHandler() {
        return async () => await invalidateAll();
    }
</script>

<div class="wrapper">
    <main>
        <form method="POST" action="passport/{$page.data.userData.id}/avatar" enctype="multipart/form-data">
            <label class="avatar-label" for="avatar">
                <img
                    class="avatar-img"
                    src="passport/{$page.data.userData.id}/avatar/{AvatarSize.NORMAL}"
                    width="{AvatarSize.NORMAL}"
                    height="{AvatarSize.NORMAL}"
                    alt="{$page.data.userData.login} avatar"
                    />
            </label>
            <input
                type="file"
                id="avatar"
                name="avatar"
                class="avatar-input"
                accept="image/*, .jpg, .jpeg, .png, .webp"
                required
                />
            <Button buttonType={ButtonType.input} type="submit" value="Сохранить аватар">Сохранить аватар</Button>
        </form>

        <form class="user-form" use:enhance={enhanceHandler} method="POST">
        {$page.data.userData.login}
        <Button buttonType={ButtonType.input}  type="submit" value="выйти" formaction="passport/loginout/{$page.data.userData.id}">выйти</Button>
        ещё:
        {#each $page.data.passiveUsersData as userData}
        <br />
            {userData.id}
            {userData.login}
            <Button buttonType={ButtonType.input} type="submit" value="выйти" formaction="passport/loginout/{userData.id}">выйти</Button>
        {/each}
        <br />

        <Button buttonType={ButtonType.input} type="submit" value="выйти из всех" formaction="passport/loginout">выйти из всех</Button>
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

    .avatar-img {
        pointer-events: none;
    }
    
    .avatar-input {
        display: none;
    }

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