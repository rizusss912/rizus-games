<script lang="ts" context="module"> 
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

<style>
    .list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        width: 100%;
    }
</style>