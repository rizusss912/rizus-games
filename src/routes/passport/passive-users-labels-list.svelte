<script lang="ts" context="module"> 
	import Button, { ButtonTheme, ButtonType } from "$lib/components/button.svelte";
	import Exit from "$lib/icons/exit.svelte";
	import type { UserData } from "$passport/bd/models/user";
    import PassiveUserLabel from "$passport/passive-user-label.svelte";
</script>

<script lang="ts">
    export let passiveUsersData: UserData[];
</script>


<div class="list">
    {#each passiveUsersData as userData}
        <PassiveUserLabel {userData}/>
    {/each}
</div>

<Button buttonType={ButtonType.input} buttonTheme={ButtonTheme.transparent} type="submit" value="выйти из всех" formaction="passport/loginout">
    <Exit />
    {#if passiveUsersData.length}
        выйти из всех
    {:else}
        выйти
    {/if}
</Button>

<style>
    .list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        width: 100%;
    }
</style>