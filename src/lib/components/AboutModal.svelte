<script lang="ts">
	import Dialog from './ui/Dialog.svelte';
	import CardDescription from './ui/CardDescription.svelte';
	import { appStore } from '$lib/stores/appStore.svelte';

	let showAbout = $derived(appStore.showAbout);

	function setShowAbout(open: boolean) {
		appStore.showAbout = open;
	}
</script>

<Dialog open={showAbout} onOpenChange={setShowAbout}>
	<div class="space-y-4">
		<h2 class="text-lg font-semibold">How It Works</h2>
		<CardDescription>
			This app builds a ready-to-paste prompt for ChatGPT (or any other LLM) based on your XLSX player stats.
		</CardDescription>
		<div class="space-y-3">
			<p class="text-sm sm:text-base">
				1) Upload an XLSX file with player stats (drag & drop / click / paste).
			</p>
			<p class="text-sm sm:text-base">
				2) Select the players participating in the match.
			</p>
			<p class="text-sm sm:text-base">
				3) Click <strong>Generate Teams</strong> to create balanced teams.
			</p>
			<p class="text-sm sm:text-base">
				4) Click <strong>Copy Prompt</strong> to copy a detailed prompt for your LLM chat.
			</p>
		</div>
	</div>
</Dialog>
