<script lang="ts">
	import PlayerPerformanceChart from '$lib/components/PlayerPerformanceChart.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import CardDescription from '$lib/components/ui/CardDescription.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import { appStore } from '$lib/stores/appStore.svelte';
	import { calculatePlayerScore } from '$lib/utils/teamSelection';
	import type { Player } from '$lib/utils/types';

	let players = $derived(appStore.players);

	let averages = $derived(calculateAverages(players));
	let sortedPlayers = $derived(
		[...players].sort((a, b) => calculatePlayerScore(b) - calculatePlayerScore(a))
	);

	function calculateAverages(players: Player[]) {
		if (players.length === 0) return { goals: 0, assists: 0, points: 0 };

		const totals = players.reduce(
			(acc, player) => ({
				goals: acc.goals + player.goalsPerMatch,
				assists: acc.assists + player.assistsPerMatch,
				points: acc.points + player.pointsPerMatch
			}),
			{ goals: 0, assists: 0, points: 0 }
		);

		return {
			goals: totals.goals / players.length,
			assists: totals.assists / players.length,
			points: totals.points / players.length
		};
	}
</script>

<div class="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
	<div class="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
		<Card class="transition-all hover:shadow-md">
			<CardHeader class="pb-3">
				<CardDescription class="text-sm font-medium">Average Goals per Match</CardDescription>
			</CardHeader>
			<CardContent>
				<CardTitle class="text-3xl font-semibold">{averages.goals.toFixed(2)}</CardTitle>
			</CardContent>
		</Card>
		<Card class="transition-all hover:shadow-md">
			<CardHeader class="pb-3">
				<CardDescription class="text-sm font-medium">Average Assists per Match</CardDescription>
			</CardHeader>
			<CardContent>
				<CardTitle class="text-3xl font-semibold">{averages.assists.toFixed(2)}</CardTitle>
			</CardContent>
		</Card>
		<Card class="transition-all hover:shadow-md">
			<CardHeader class="pb-3">
				<CardDescription class="text-sm font-medium">Average Points per Match</CardDescription>
			</CardHeader>
			<CardContent>
				<CardTitle class="text-3xl font-semibold">{averages.points.toFixed(2)}</CardTitle>
			</CardContent>
		</Card>
	</div>

	<div class="mb-12">
		<PlayerPerformanceChart players={sortedPlayers} />
	</div>

	<Card class="overflow-hidden">
		<CardHeader>
			<CardTitle>Player Statistics</CardTitle>
			<CardDescription>Complete performance breakdown for all players</CardDescription>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border bg-muted/50">
							<th class="px-6 py-4 text-left text-sm font-medium">Player</th>
							<th class="px-6 py-4 text-center text-sm font-medium">Goals/Match</th>
							<th class="px-6 py-4 text-center text-sm font-medium">Assists/Match</th>
							<th class="px-6 py-4 text-center text-sm font-medium">Points/Match</th>
							<th class="px-6 py-4 text-center text-sm font-medium">Score</th>
						</tr>
					</thead>
					<tbody>
						{#each sortedPlayers as player (player.name)}
							<tr class="border-b border-border transition-colors hover:bg-muted/50">
								<td class="px-6 py-4 font-medium">{player.name}</td>
								<td class="px-6 py-4 text-center">{player.goalsPerMatch.toFixed(2)}</td>
								<td class="px-6 py-4 text-center">{player.assistsPerMatch.toFixed(2)}</td>
								<td class="px-6 py-4 text-center">{player.pointsPerMatch.toFixed(2)}</td>
								<td class="px-6 py-4 text-center">
									<span class="font-semibold">{calculatePlayerScore(player).toFixed(2)}</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
