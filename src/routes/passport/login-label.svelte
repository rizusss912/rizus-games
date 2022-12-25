<script lang="ts" context="module"> 
	import Button, { ButtonSize, ButtonTheme, ButtonType } from "$lib/components/button.svelte";
	import type { UserData } from "$passport/bd/models/user";
    import Exit from "$lib/icons/exit.svelte";
</script>

<script lang="ts">
    export let userData: UserData;
</script>

<div class="login-label">
    <div class="login">
        <h2>{userData.login}</h2>
        <div class="actions">
            <Button buttonType={ButtonType.input} buttonTheme={ButtonTheme.transparent} size={ButtonSize.none} type="submit" value="выйти" formaction="passport/loginout/{userData.id}">
                <Exit />
            </Button>
        </div>
    </div>
</div>

<style>
    h2 {
        margin: 0;
    }

    .login-label {
        display: flex;
        gap: 8px;

        align-items: center;
    }

    .login {
        position: relative;
        padding: 10px;
    }

    .login:hover > .actions {
        display: block;
        animation: ani .2s forwards ease-in-out;
    }

    .actions {
        display: none;

        position: absolute;
        left: 100%;
        top: 50%;

        transform: translateY(-50%);
    }

    @keyframes ani {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .exit-icon {
        width: 24px;
        height: 24px;
    }
</style>