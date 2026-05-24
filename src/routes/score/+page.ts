import { redirect } from '@sveltejs/kit';
import { appStore } from '$lib/stores/appStore.svelte';

export function load() {
	if (appStore.players.length === 0) {
		throw redirect(307, '/');
	}
}
