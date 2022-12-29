<script lang="ts" context="module"> 
	import Button, { ButtonSize, ButtonTheme, ButtonType } from "$lib/components/button.svelte";
	import type { UserData } from "$passport/bd/models/user";
    import Exit from "$lib/icons/exit.svelte";
	import Edit from "$lib/icons/edit.svelte";
	import { page } from "$app/stores";
    import InputText from "$lib/components/input-text.svelte";
	import Cross from "$lib/icons/cross.svelte";
	import Checkmark from "$lib/icons/checkmark.svelte";
	import { goto, invalidateAll } from "$app/navigation";
	import { enhance } from "$app/forms";
</script>

<script lang="ts">
    export let userData: UserData;

    function getOpenEditHref(url: URL): string {
        url.searchParams.set('edit-login', 'true');

        return url.toString();
    }

    function isOpenLoginEditor(url: URL): boolean {
        return url.searchParams.has('edit-login');
    }

    function getCloseEditHref(url: URL): string {
        url.searchParams.delete('edit-login');

        return url.toString();
    }

    function enhanceLoginFormHandler() {
        return async () => {
            await invalidateAll();
            await closeLoginEditor();
        }
    }

    export async function closeLoginEditor() {
        $page.url.searchParams.delete('edit-login');

        await goto($page.url);
    }
</script>

<form class="login" use:enhance={enhanceLoginFormHandler} method="POST">
    {#if isOpenLoginEditor($page.url)}
        <InputText id="login" name="login" value={userData.login} placeholder="Новый логин" />
        <div class="actions">
            <Button buttonType={ButtonType.input} buttonTheme={ButtonTheme.transparent} size={ButtonSize.none} type="submit" value="сохранить" formaction="passport/login/{userData.id}">
                <Checkmark />
            </Button>
            <Button buttonType={ButtonType.a} buttonTheme={ButtonTheme.transparent} size={ButtonSize.none} href={getCloseEditHref($page.url)}>
                <Cross />
            </Button>
        </div>
    {:else}
        <h2>{userData.login}</h2>
        <div class="actions">
            <Button buttonType={ButtonType.a} buttonTheme={ButtonTheme.transparent} size={ButtonSize.none} href={getOpenEditHref($page.url)}>
                <Edit />
            </Button>
            <Button buttonType={ButtonType.input} buttonTheme={ButtonTheme.transparent} size={ButtonSize.none} type="submit" value="выйти" formaction="passport/loginout/{userData.id}">
                <Exit />
            </Button>
        </div>
    {/if}
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