<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { AvatarSize } from "$lib/enums/avatar-size";

    function enhanceHandler() {
        return async () => await invalidateAll();
    }
</script>

<img src="passport/{$page.data.userData.id}/avatar/{AvatarSize.NORMAL}" alt="{$page.data.userData.login} avatar" />

<form method="POST" action="passport/{$page.data.userData.id}/avatar" enctype="multipart/form-data">
    <input type="file" id="avatar" name="avatar" accept="image/*, .jpg, .jpeg, .png, .webp" />
    <input type="submit" value="Сохранить">
</form>

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