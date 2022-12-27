<script lang="ts" context="module"> 
	import type { UserData } from "$passport/bd/models/user";
    import Button, { ButtonSize, ButtonTheme, ButtonType } from "$lib/components/button.svelte";
	import Exit from "$lib/icons/exit.svelte";
</script>

<script lang="ts">
    export let userData: UserData;
</script>


<Button
    buttonTheme={ButtonTheme.secondary}
    buttonType={ButtonType.input}
    size={ButtonSize.m}
    formaction="passport/loginout/{userData.id}"
    formmethod="POST"
    >
    <div class="wrapper">
        {userData.login}

        <div class="actions">
            <Button
                buttonType={ButtonType.input}
                buttonTheme={ButtonTheme.transparent}
                size={ButtonSize.none}
                type="submit"
                value="выйти"
                formaction="passport/loginout/{userData.id}"
                >
                <Exit />
            </Button>
        </div>
    </div>
</Button>

<style>
    .wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        width: 100%;

        color: var(--primary-text-color);

        border-radius: 12px;
    }

    .wrapper:hover > .actions,
    .wrapper:active > .actions,
    .wrapper:focus > .actions {
        opacity: 1;
    }

    .actions {
        display: flex;
        flex-direction: row;
        gap: 8px;
        opacity: 0;
    }
</style>