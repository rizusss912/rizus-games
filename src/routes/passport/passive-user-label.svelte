<script lang="ts" context="module"> 
	import type { UserData } from "$passport/bd/models/user";
    import Button, { ButtonSize, ButtonTheme, ButtonType } from "$lib/components/button.svelte";
	import Exit from "$lib/icons/exit.svelte";
    import UserAvatar from "$lib/components/user-avatar.svelte";
	import { AvatarSize } from "$lib/enums/avatar-size";
</script>

<script lang="ts">
    export let userData: UserData;
</script>


<li class="main-wrapper">
    <Button
        buttonTheme={ButtonTheme.secondary}
        buttonType={ButtonType.input}
        size={ButtonSize.m}
        type="submit"
        formaction="/passport/{userData.id}/checkout"
        >
        <div class="wrapper">
            <div class="main-info">
                <UserAvatar {userData} size={AvatarSize.m} />
                {userData.login}
            </div>

            <div class="actions">
                <Button
                    buttonType={ButtonType.input}
                    buttonTheme={ButtonTheme.transparent}
                    size={ButtonSize.none}
                    type="submit"
                    value="выйти"
                    formaction="/passport/loginout/{userData.id}"
                    >
                    <Exit />
                </Button>
            </div>
        </div>
    </Button>
</li>

<style>
    .wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        width: 100%;

        color: var(--main-text-color);

        border-radius: 12px;
    }

    .main-wrapper {
        list-style-type: none;
    }

    .wrapper:hover > .actions,
    .wrapper:active > .actions,
    .wrapper:focus > .actions,
    .wrapper:focus-within > .actions,
    .main-wrapper:hover .actions,
    .main-wrapper:active .actions,
    .main-wrapper:focus .actions,
    .main-wrapper:focus-within .actions {
        opacity: 1;
    }

    .actions {
        display: flex;
        flex-direction: row;
        gap: 8px;
        opacity: 0;

        transition: opacity, .2s;
    }

    .main-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
</style>