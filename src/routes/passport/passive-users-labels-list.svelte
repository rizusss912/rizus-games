<script lang="ts" context="module"> 
	import type { UserData } from "$passport/bd/models/user";
    import PassiveUserLabel from "$passport/passive-user-label.svelte";
</script>

<script lang="ts">
    export let passiveUsersData: UserData[];
</script>


<ul class="list">
    {#each passiveUsersData as userData}
        <PassiveUserLabel {userData}/>
    {/each}
</ul>

<style>
    .list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        padding: 0;

        width: 100%;
    }
</style>