<script lang="ts" context="module"> 
	import type { AvatarSize } from "$lib/enums/avatar-size";
	import type { UserData } from "$passport/bd/models/user";
</script>

<script lang="ts">
    export let userData: UserData;
    export let size: AvatarSize;

    let avatarTimestempForReloadPicture: number = 0;

    export function askForAnAvatarAgain() {
        avatarTimestempForReloadPicture = Date.now();

        setTimeout(() => avatarTimestempForReloadPicture = Date.now(), 200);
        setTimeout(() => avatarTimestempForReloadPicture = Date.now(), 1000);
        setTimeout(() => avatarTimestempForReloadPicture = Date.now(), 2000);
        setTimeout(() => avatarTimestempForReloadPicture = Date.now(), 5000);
        setTimeout(() => avatarTimestempForReloadPicture = Date.now(), 10000);
    }
</script>

<img
    src="passport/{userData.id}/avatar/{size}/{avatarTimestempForReloadPicture}"
    width={size}
    height={size}
    alt="{userData.login} avatar"
    />

<style>
    img {
        pointer-events: none;
        border-radius: 50%;
    }
</style>