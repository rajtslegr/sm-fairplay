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

	function formatTeamsForEmailWithSynergy(): string {
		const stats = selectionStats!;

		const formatPlayerStats = (player: Player, team: 'A' | 'B'): string => {
			const playerScore = calculateTeamScore([player]).toFixed(2);
			const playerBreakdown = stats.sortedPlayers.find((p) => p.name === player.name);

			const lines = [
				`Score: ${playerScore}`,
				`  Goals: ${player.goalsPerMatch.toFixed(2)}`,
				`  Assists: ${player.assistsPerMatch.toFixed(2)}`,
				`  Points: ${player.pointsPerMatch.toFixed(2)}`
			];

			if (playerBreakdown) {
				lines.push(
					`  └ G:${playerBreakdown.goalsContribution.toFixed(1)} A:${playerBreakdown.assistsContribution.toFixed(1)} P:${playerBreakdown.pointsContribution.toFixed(1)}`
				);
			}

			const teamStats = team === 'A' ? stats.teamA : stats.teamB;
			const teamPlayerNames = new Set((team === 'A' ? teamA : teamB).map((p) => p.name));

			const synergies = teamStats.synergyDetails?.filter(
				(detail) =>
					(detail.player1 === player.name && teamPlayerNames.has(detail.player2)) ||
					(detail.player2 === player.name && teamPlayerNames.has(detail.player1))
			);

			if (synergies && synergies.length > 0) {
				const synergyWithHistory = synergies.filter((s) => s.gamesTogether > 0);
				if (synergyWithHistory.length > 0) {
					lines.push('');
					lines.push('  Synergy with teammates:');
					synergyWithHistory.forEach((s) => {
						const otherPlayer = s.player1 === player.name ? s.player2 : s.player1;
						const sign = s.contribution > 0 ? '+' : '';
						lines.push(
							`  • ${otherPlayer}: ${sign}${s.contribution.toFixed(2)} (${s.winsTogether}W/${s.lossesTogether}L/${s.gamesTogether}G)`
						);
					});
				}
			}

			return lines.join('\n');
		};

		const formatTeam = (players: Player[], team: 'A' | 'B'): string =>
			players.map((player) => `• ${player.name}\n  ${formatPlayerStats(player, team)}`).join('\n\n');

		let result = '          🏆 TEAM GENERATION RESULTS 🏆\n';
		result += `${'═'.repeat(50)}\n\n`;

		result += '🟢 TEAM A\n';
		result += `Total Score: ${teamAScore.toFixed(2)}`;
		if (teamASynergy !== undefined) {
			result += ` | Synergy: ${teamASynergy > 0 ? '+' : ''}${teamASynergy.toFixed(3)}`;
		}
		result += `\n\n${formatTeam(teamA, 'A')}\n\n`;

		result += '🔴 TEAM B\n';
		result += `Total Score: ${teamBScore.toFixed(2)}`;
		if (teamBSynergy !== undefined) {
			result += ` | Synergy: ${teamBSynergy > 0 ? '+' : ''}${teamBSynergy.toFixed(3)}`;
		}
		result += `\n\n${formatTeam(teamB, 'B')}\n\n`;

		if (stats.algorithm === 'skill-and-synergy') {
			result += '📊 Algorithm: Skill + Synergy\n';
			result += `Skill Weight: ${(stats.skillWeight * 100).toFixed(0)}% | `;
			result += `Synergy Weight: ${(stats.synergyWeight * 100).toFixed(0)}%\n`;
		} else {
			result += '📊 Algorithm: Skill Only\n';
		}

		if (stats.matchHistoryStats) {
			result += `\n📈 Match History: ${stats.matchHistoryStats.matchesWithPlayerData} matches with player data`;
			result += `, ${stats.matchHistoryStats.uniquePlayerPairs} unique pairs\n`;
		}

		return result;
	}

	let formattedTeams = $derived(
		selectionStats
			? formatTeamsForEmailWithSynergy()
			: formatTeamsForEmail()
	);

	async function handleCopyToClipboard() {
		try {
			await navigator.clipboard.writeText(formattedTeams);
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
				<Card class="mb-6 border-primary/30 bg-primary/15 shadow-sm">
					<CardHeader class="px-6 py-4">
						<CardTitle class="text-center text-2xl font-semibold text-primary dark:text-primary-foreground sm:text-3xl">
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
						<PlayerCard {player} teamColor="hsl(var(--primary))" teamStats={selectionStats?.teamB} />
					{/each}
				</ul>
			</div>
		</div>

		<div class="mt-10 flex justify-center">
			<Button onclick={handleCopyToClipboard} size="lg">
				<Copy class="size-4" />
				Copy Teams
			</Button>
		</div>
	</div>
{/if}
