<script lang="ts">
	import { toast } from 'svelte-sonner';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import PlayerSelection from '$lib/components/PlayerSelection.svelte';
	import TeamDisplay from '$lib/components/TeamDisplay.svelte';
	import { appStore } from '$lib/stores/appStore.svelte';
	import { buildPromptFromTeams } from '$lib/utils/promptBuilder';
	import { selectTeamsWithStats } from '$lib/utils/teamSelectionCore';
	import { parseXlsxData } from '$lib/utils/xlsxParser';
	import type { Player } from '$lib/utils/types';

	let players = $derived(appStore.players);
	let teamA = $derived(appStore.teamA);
	let teamB = $derived(appStore.teamB);
	let matchHistory = $derived(appStore.matchHistory);
	let debugInfo = $derived(appStore.debugInfo);

	let teamsRef = $state<HTMLDivElement>();

	$effect(() => {
		if (teamA.length > 0 && teamB.length > 0 && teamsRef) {
			const headerHeight = 96;
			const teamDisplayRect = teamsRef.getBoundingClientRect();
			const scrollPosition = window.scrollY + teamDisplayRect.top - headerHeight;

			window.scrollTo({
				top: scrollPosition,
				behavior: 'smooth'
			});
		}
	});

	async function handleFileUpload(file: File) {
		appStore.reset();
		const toastId = toast.loading('Processing file...');

		try {
			const { players: parsedPlayers, matches } = await parseXlsxData(file);
			appStore.setPlayers(parsedPlayers);
			appStore.setMatchHistory(matches);

			toast.success('File processed successfully!');
		} catch (error) {
			console.error('Error parsing XLSX file:', error);
			toast.error('Error processing file. Please try again.');
		} finally {
			toast.dismiss(toastId);
		}
	}

	function handleGenerateTeams(selectedPlayers: Player[]) {
		try {
			const {
				teams: [newTeamA, newTeamB],
				debugInfo: newSelectionStats
			} = selectTeamsWithStats(selectedPlayers, matchHistory);
			appStore.setTeams(newTeamA, newTeamB, newSelectionStats);
			toast.success('Teams generated successfully!');
		} catch (error) {
			console.error('Error generating teams:', error);
			toast.error('Error generating teams. Please try again.');
		}
	}

	async function handleCopyPrompt() {
		if (teamA.length === 0 || teamB.length === 0) {
			toast.error('Generate teams first');
			return;
		}

		try {
			const promptText = buildPromptFromTeams({
				teamA,
				teamB,
				matchHistory
			});
			await navigator.clipboard.writeText(promptText);
			toast.success('Prompt copied to clipboard!');
		} catch (error) {
			console.error('Error copying prompt:', error);
			toast.error('Failed to copy prompt');
		}
	}
</script>

<main class="relative">
	<div class="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-start px-4 py-8 sm:min-h-[calc(100vh-4rem)] sm:py-12">
		<FileUpload onFileUpload={handleFileUpload} />
		{#if players.length > 0}
			<PlayerSelection
				onGenerateTeams={handleGenerateTeams}
				onCopyPrompt={handleCopyPrompt}
				onResetSelection={() => appStore.resetSelection()}
			/>
		{/if}

		<div bind:this={teamsRef} class="w-full max-w-4xl">
			<TeamDisplay {teamA} {teamB} selectionStats={debugInfo} />
		</div>
	</div>
</main>
