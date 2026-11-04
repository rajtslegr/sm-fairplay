<script lang="ts">
	import { Copy } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import Button from './ui/Button.svelte';
	import Card from './ui/Card.svelte';
	import CardHeader from './ui/CardHeader.svelte';
	import CardTitle from './ui/CardTitle.svelte';
	import PlayerCard from './PlayerCard.svelte';
	import { calculateTeamScore } from '$lib/utils/teamSelection';
	import type { SelectionStats } from '$lib/utils/teamSelectionCore';
	import type { Player } from '$lib/utils/types';

	interface Props {
		teamA: Player[];
		teamB: Player[];
		selectionStats?: SelectionStats | null;
	}

	let { teamA, teamB, selectionStats }: Props = $props();

	let teamAScore = $derived(calculateTeamScore(teamA));
	let teamBScore = $derived(calculateTeamScore(teamB));
	let teamASynergy = $derived(selectionStats?.teamA.synergy);
	let teamBSynergy = $derived(selectionStats?.teamB.synergy);

	function formatTeamsForEmail(): string {
		const formatPlayerStats = (player: Player): string => {
			const stats = [
				`Score: ${calculateTeamScore([player]).toFixed(2)}`,
				`Goals: ${player.goalsPerMatch.toFixed(2)}`,
				`Assists: ${player.assistsPerMatch.toFixed(2)}`,
				`Points: ${player.pointsPerMatch.toFixed(2)}`
			];
			return stats.join(' | ');
		};

		const formatTeam = (players: Player[]): string =>
			players.map((player) => `• ${player.name}\n  ${formatPlayerStats(player)}`).join('\n\n');

		return `🟢 Team A - Total Score: ${teamAScore.toFixed(2)}\n\n${formatTeam(teamA)}\n\n🔴 Team B - Total Score: ${teamBScore.toFixed(2)}\n\n${formatTeam(teamB)}`;
	}

	async function handleCopyToClipboard() {
		try {
			await navigator.clipboard.writeText(formatTeamsForEmail());
			toast.success('Teams copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy teams:', error);
			toast.error('Failed to copy teams to clipboard');
		}
	}
</script>

{#if teamA.length > 0 && teamB.length > 0}
	<div class="w-full max-w-6xl">
		<div class="flex flex-col gap-8 sm:flex-row">
			<!-- Team A -->
			<div class="w-full sm:w-1/2">
				<Card class="mb-6 border-secondary/30 bg-secondary/15 shadow-sm">
					<CardHeader class="px-6 py-4">
						<CardTitle class="text-center text-2xl font-semibold text-secondary dark:text-secondary-foreground sm:text-3xl">
							{teamAScore.toFixed(2)}
						</CardTitle>
						{#if teamASynergy !== undefined && teamASynergy !== 0}
							<div class="mt-2 text-center text-sm font-medium {teamASynergy > 0 ? 'text-green-600' : 'text-red-600'}">
								Synergy: {teamASynergy > 0 ? '+' : ''}{teamASynergy.toFixed(3)}
							</div>
						{/if}
					</CardHeader>
				</Card>
				<ul class="space-y-4">
					{#each teamA as player (player.name)}
						<PlayerCard {player} teamColor="hsl(var(--secondary))" teamStats={selectionStats?.teamA} />
					{/each}
				</ul>
			</div>

			<!-- Team B -->
			<div class="w-full sm:w-1/2">
				<Card class="mb-6 border-red-500/30 bg-red-500/15 shadow-sm">
					<CardHeader class="px-6 py-4">
						<CardTitle class="text-center text-2xl font-semibold text-red-600 dark:text-red-400 sm:text-3xl">
							{teamBScore.toFixed(2)}
						</CardTitle>
						{#if teamBSynergy !== undefined && teamBSynergy !== 0}
							<div class="mt-2 text-center text-sm font-medium {teamBSynergy > 0 ? 'text-green-600' : 'text-red-600'}">
								Synergy: {teamBSynergy > 0 ? '+' : ''}{teamBSynergy.toFixed(3)}
							</div>
						{/if}
					</CardHeader>
				</Card>
				<ul class="space-y-4">
					{#each teamB as player (player.name)}
						<PlayerCard {player} teamColor="hsl(0 72% 50%)" teamStats={selectionStats?.teamB} />
					{/each}
				</ul>
			</div>
		</div>

		<div class="mt-6 flex justify-center">
			<Button onclick={handleCopyToClipboard}>
				<Copy class="size-4" />
				Copy Teams
			</Button>
		</div>
	</div>
{/if}
