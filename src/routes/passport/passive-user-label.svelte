<script lang="ts" context="module"> 
	import type { UserData } from "$passport/bd/models/user";
</script>

<script lang="ts">
	import Button, { ButtonSize, ButtonTheme, ButtonType } from "$lib/components/button.svelte";

    export let userData: UserData;
</script>


<Button buttonTheme={ButtonTheme.secondary} buttonType={ButtonType.input} size={ButtonSize.xs}>
    <div class="wrapper">
    {userData.login}
</div>
</Button>

<style>
    .wrapper {
        display: block;
        width: 100%;
        background-color: brown;
    }
</style>