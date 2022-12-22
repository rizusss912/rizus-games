<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";

    function enhanceHandler() {
        return async () => await invalidateAll();
    }
</script>
<form use:enhance={enhanceHandler} method="POST">
{$page.data.userData.id}
{$page.data.userData.login}
<input type="submit" value="выйти" formaction="passport/loginout/{$page.data.userData.id}"/>
<br />
ещё:
{#each $page.data.passiveUsersData as userData}
<br />
    {userData.id}
    {userData.login}
    <input type="submit" value="выйти" formaction="passport/loginout/{userData.id}"/>
{/each}
<br />
<input type="submit" value="выйти из всех" formaction="passport/loginout"/>
</form>