<script lang="ts" context="module"> 
	import type { AvatarSize } from "$lib/enums/avatar-size";
	import type { UserData } from "$passport/bd/models/user";
</script>

<script lang="ts">
    export let userData: UserData;
    export let size: AvatarSize;
</script>

<img
    src="/passport/{userData.id}/avatar/{size}"
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