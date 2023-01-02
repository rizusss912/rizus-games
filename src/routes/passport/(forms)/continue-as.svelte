<script lang="ts" context="module">
	import { page } from "$app/stores";
	import { Param } from "$lib/enums/param";
    import type { AuthResult } from "$passport/bd/models/token";
    import PassiveUsersLabelsList from "$passport/passive-users-labels-list.svelte";
</script>

<script lang="ts">
    export let authResult: AuthResult | null;
    export let skipped = getSkipped($page.url);
    export let skipContinueAsLink = getSkipContinueAsLink($page.url);

    $: skipped = getSkipped($page.url);
    $: skipContinueAsLink = getSkipContinueAsLink($page.url);

    export function getSkipped(url: URL) {
        if (!authResult) {
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

{#if !skipped && authResult}
    <p> продолжить как: </p>
    <PassiveUsersLabelsList passiveUsersData={[authResult.userData, ...authResult.passiveUsersData]} />
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