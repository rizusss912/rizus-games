<script lang="ts" context="module"> 
	import type { AvatarSize } from "$lib/enums/avatar-size";
	import type { UserData } from "$passport/bd/models/user";
</script>

<script lang="ts">
    export let userData: UserData;
    export let size: AvatarSize;

    let avatarTimestempForReloadPicture: number = Date.now();

    export function askForAnAvatarAgain() {
        avatarTimestempForReloadPicture = Date.now();
    }
</script>

<img
    src="passport/avatar/{userData.id}/{size}/{avatarTimestempForReloadPicture}"
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