<script lang="ts">
	import { page } from "$app/stores";
</script>
{$page.data.userData.id}
{$page.data.userData.login}
<br />
ещё
{#each $page.data.passiveUsersData as userData}
<br />
    {userData.id}
    {userData.login}
{/each}