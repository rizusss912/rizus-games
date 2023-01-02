<script lang="ts" context="module">
	import { page } from "$app/stores";
	import { Param } from "$lib/enums/param";
    import type { AuthResult } from "$passport/bd/models/token";
	import type { UserData } from "$passport/bd/models/user";
    import PassiveUsersLabelsList from "$passport/passive-users-labels-list.svelte";
</script>

<script lang="ts">
    export let authResult: Partial<AuthResult>;
    export let skipContinueAsLink = getSkipContinueAsLink($page.url);
    export let skipped = getSkipped($page.url, getUsersData(authResult));

    $: skipContinueAsLink = getSkipContinueAsLink($page.url);
    $: usersData = getUsersData(authResult);
    $: skipped = getSkipped($page.url, usersData);

    export function getUsersData({passiveUsersData, userData}: Partial<AuthResult>) {
        if (!passiveUsersData?.length && !userData) {
            return null;
        }

        return (userData ? [userData] : []).concat(passiveUsersData ?? []);
    }

    export function getSkipped(url: URL, usersData: UserData[] | null) {
        if (!usersData) {
            return true;
        }

        return url.searchParams.get(Param.CONTINUE_AS) === 'skipped';
    }

    export function getSkipContinueAsLink(url: URL) {
        const newUrl = new URL(url);
        newUrl.searchParams.set(Param.CONTINUE_AS, 'skipped');

        return newUrl.toString();
    }
</script>

{#if !skipped && usersData}
    <p> продолжить как: </p>
    <PassiveUsersLabelsList passiveUsersData={usersData} />
{:else}
    <slot />
{/if}

<div class="actions">
    <slot name="actions" />
</div>

<style>
    p {
        color: var(--main-text-color);
    }

	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;

		margin-top: 12px;
	}
</style>