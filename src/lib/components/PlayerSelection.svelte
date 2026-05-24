<script lang="ts">
	import { Plus, Copy, Zap, RotateCcw } from 'lucide-svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import { appStore } from '$lib/stores/appStore.svelte';
	import type { Player } from '$lib/utils/types';

	interface Props {
		onGenerateTeams: (selectedPlayers: Player[]) => void;
		onCopyPrompt: () => void;
		onResetSelection: () => void;
	}

	let { onGenerateTeams, onCopyPrompt, onResetSelection }: Props = $props();

	let newPlayerName = $state('');
	let listChanged = $state(false);

	let allPlayers = $derived(appStore.allPlayers);
	let selectedPlayers = $derived(appStore.selectedPlayers);
	let teamA = $derived(appStore.teamA);
	let teamB = $derived(appStore.teamB);

	let teamsGenerated = $derived(teamA.length > 0 && teamB.length > 0);
	let selectedCount = $derived(selectedPlayers.length);

	function togglePlayerSelection(player: Player) {
		const isSelected = selectedPlayers.some((p) => p.name === player.name);
		const newSelection = isSelected
			? selectedPlayers.filter((p) => p.name !== player.name)
			: [...selectedPlayers, player];

		appStore.setSelectedPlayers(newSelection);
		listChanged = true;
	}

	function addNewPlayer() {
		if (newPlayerName.trim()) {
			const newPlayer: Player = {
				name: newPlayerName.trim(),
				goals: 0,
				assists: 0,
				points: 0,
				matches: 1,
				goalsPerMatch: 0,
				assistsPerMatch: 0,
				pointsPerMatch: 0
			};
			appStore.setAllPlayers([...allPlayers, newPlayer]);
			appStore.setSelectedPlayers([...selectedPlayers, newPlayer]);
			newPlayerName = '';
			listChanged = true;
		}
	}

	function handleGenerateTeams() {
		onGenerateTeams(selectedPlayers);
		listChanged = false;
	}

	function handleReset() {
		appStore.setSelectedPlayers([]);
		onResetSelection();
		listChanged = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && newPlayerName.trim()) {
			addNewPlayer();
		}
	}
</script>

<div class="mb-12 w-full max-w-6xl">
	<div class="mb-8 grid grid-cols-2 gap-3 sm:mb-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each allPlayers as player}
			{@const isSelected = selectedPlayers.some((p) => p.name === player.name)}
			<Button
				variant={isSelected ? 'default' : 'outline'}
				class="w-full"
				onclick={() => togglePlayerSelection(player)}
			>
				{player.name}
			</Button>
		{/each}
	</div>
	<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
		<Input
			type="text"
			bind:value={newPlayerName}
			placeholder="New player name"
			class="w-full sm:w-auto sm:flex-1"
			onkeydown={handleKeydown}
		/>
		<div class="flex flex-col gap-2 sm:flex-row">
			<Button
				onclick={addNewPlayer}
				disabled={newPlayerName.trim() === ''}
				variant="secondary"
			>
				<Plus class="size-4" />
				Add Player
			</Button>
			<Button
				onclick={handleGenerateTeams}
				variant={listChanged && selectedCount > 5 ? 'default' : 'outline'}
				disabled={selectedCount < 6}
			>
				<Copy class="size-4" />
				Generate Teams
			</Button>
			<Button
				onclick={onCopyPrompt}
				variant={teamsGenerated ? 'default' : 'outline'}
				disabled={!teamsGenerated}
			>
				<Zap class="size-4" />
				Copy Prompt
			</Button>
			<Button
				onclick={handleReset}
				variant="ghost"
				disabled={selectedCount === 0 && teamA.length === 0 && teamB.length === 0}
			>
				<RotateCcw class="size-4" />
				Reset
			</Button>
		</div>
	</div>
</div>
