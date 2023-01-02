<script lang="ts" context="module"> 
	import Button, { ButtonSize, ButtonTheme, ButtonType } from "$lib/components/button.svelte";
	import type { UserData } from "$passport/bd/models/user";
    import Exit from "$lib/icons/exit.svelte";
	import Edit from "$lib/icons/edit.svelte";
	import { enhance } from "$app/forms";
	import { Param } from "$lib/enums/param";
	import { page } from "$app/stores";
</script>

<script lang="ts">
    export let userData: UserData;

    function getChangeLoginHref(userId: number, url: URL) {
        const actionSeachParams = new URLSearchParams({ [Param.INITIAOR]: url.toString() });

        return `passport/${userId}/login?${actionSeachParams.toString()}`;
    }
</script>

<form class="login" use:enhance method="POST">
        <h2>{userData.login}</h2>
        <div class="actions">
            <Button buttonType={ButtonType.a} buttonTheme={ButtonTheme.transparent} size={ButtonSize.none} href="{getChangeLoginHref(userData.id, $page.url)}">
                <Edit />
            </Button>
            <Button buttonType={ButtonType.input} buttonTheme={ButtonTheme.transparent} size={ButtonSize.none} type="submit" value="выйти" formaction="passport/loginout/{userData.id}">
                <Exit />
            </Button>
        </div>
</form>

<style>
    h2 {
        margin: 0;
    }

    .login {
        position: relative;
        padding: 10px;

        display: flex;
        gap: 8px;

        align-items: center;
    }

    .login:hover > .actions,
    .login:active > .actions,
    .login:focus > .actions,
    .login:focus-within > .actions {
        opacity: 1;
    }

    .actions {
        display: flex;
        flex-direction: row;
        gap: 8px;

        opacity: 0;
        transition: .2s;

        position: absolute;
        left: 100%;
        top: 50%;

        transform: translateY(-50%);
    }
</style>