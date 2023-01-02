<script lang="ts" context="module">
    import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import Button, { ButtonSize, ButtonTheme, ButtonType } from "$lib/components/button.svelte";
	import LoginLabel from "$passport/login-label.svelte";
	import PassiveUsersLabelsList from "$passport/passive-users-labels-list.svelte";
    import UserAvatar from "$lib/components/user-avatar.svelte";
	import { AvatarSize } from "$lib/enums/avatar-size";
	import Exit from "$lib/icons/exit.svelte";
    import Plus from "$lib/icons/plus.svelte";
	import { Param } from "$lib/enums/param";
    import Swap from "$lib/icons/swap.svelte";
</script>

<script lang="ts">
    function enhanceUserFormHandler() {
        return async () => await invalidateAll();
    }

    function getAvatarChangeHref(userId: number, url: URL) {
        const searchParams = new URLSearchParams({ [Param.INITIAOR]: url.toString() });

        return `/passport/${userId}/avatar?${searchParams.toString()}`;
    }
</script>

<div class="wrapper">
    <main>
        <div class="avatar">
            <Button buttonType={ButtonType.a} buttonTheme={ButtonTheme.link} size={ButtonSize.none} href={getAvatarChangeHref($page.data.userData.id, $page.url)}>
                <UserAvatar userData={$page.data.userData} size={AvatarSize.xl} />
                <div class="blackout">
                    <Swap size={AvatarSize.xl / 2} />
                </div>
            </Button>
        </div>
        <form class="user-form" use:enhance={enhanceUserFormHandler} method="POST">
            <LoginLabel userData={$page.data.userData} />
            <PassiveUsersLabelsList passiveUsersData={$page.data.passiveUsersData} />

            <div class="actions">
                <Button
                buttonType={ButtonType.a}
                buttonTheme={ButtonTheme.transparent}
                href="passport/login"
                >
                    <Plus />
                    добавить аккаунт
                </Button>
            <Button buttonType={ButtonType.input} buttonTheme={ButtonTheme.transparent} type="submit" value="выйти из всех" formaction="passport/loginout">
                <Exit />
                {#if $page.data.passiveUsersData.length}
                    выйти из всех
                {:else}
                    выйти
                {/if}
            </Button>
            </div>
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

        background-color: rgba(var(--background-color));

        margin: calc(var(--avatar-offset) + 50px) 50px 50px 50px;
        padding: var(--avatar-offset) 16px 16px 16px;
        width: 100%;
        max-width: 600px;
        border-radius: 16px;
    }

    .avatar {
        position: absolute;
        top: 0;
        left: 50%;

        border-radius: 50%;
        width: 200px;
        height: 200px;

        transform: translate(-50%, calc(var(--avatar-offset) * -1));

        border: 16px solid rgba(var(--background-color));
        background: rgba(var(--background-color));

        cursor: pointer;
        overflow: hidden;
    }

    .blackout {
        background-color: transparent;
        opacity: 0;
        transition: background-color, opacity, .3s ease-in-out;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar:hover .blackout,
    .avatar:focus-within .blackout,
    .avatar:active .blackout {
        opacity: 1;
        background-color: rgba(var(--background-color), .7);
    }

    .blackout {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;

        pointer-events: none;
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

    .actions {
        display: flex;
        justify-content: space-between;

        width: 100%;
    }
</style>