<script lang="ts">
	import Card from './ui/Card.svelte';
	import CardContent from './ui/CardContent.svelte';
	import CardHeader from './ui/CardHeader.svelte';
	import { cn, getSynergyColorClass } from '$lib/utils/cn';
	import { calculatePlayerScore } from '$lib/utils/teamSelection';
	import type { TeamStats } from '$lib/utils/teamSelectionCore';
	import type { Player } from '$lib/utils/types';

	interface Props {
		player: Player;
		teamColor: string;
		teamStats?: TeamStats;
	}

	let { player, teamColor, teamStats }: Props = $props();

	let playerScore = $derived(calculatePlayerScore(player));

	let playerSynergies = $derived(
		teamStats?.synergyDetails?.filter(
			(detail) => detail.player1 === player.name || detail.player2 === player.name
		)
	);

	let synergiesWithHistory = $derived(
		playerSynergies?.filter((s) => s.gamesTogether > 0)
	);

	let avgSynergy = $derived(
		synergiesWithHistory && synergiesWithHistory.length > 0
			? synergiesWithHistory.reduce((sum, s) => sum + s.contribution, 0) / synergiesWithHistory.length
			: null
	);
</script>

<li class="mb-4">
	<Card class="group transition-all hover:shadow-md">
		<CardHeader class="pb-4">
			<div class="flex items-start justify-between">
				<h3 class="pr-2 text-lg font-semibold text-card-foreground">
					{player.name}
				</h3>
				<div
					class="flex shrink-0 items-center justify-center rounded-md px-2 font-mono text-base font-semibold text-white shadow-sm"
					style="background-color: {teamColor}"
				>
					{playerScore.toFixed(2)}
				</div>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid grid-cols-3 gap-2">
				<div class="flex flex-col items-center rounded-md border border-border bg-muted/60 p-3 text-center transition-colors hover:bg-muted/80">
					<span class="text-xs font-medium text-muted-foreground">Goals</span>
					<div class="mt-1 flex items-baseline gap-1">
						<span class="text-lg font-semibold" style="color: {teamColor}">
							{player.goalsPerMatch.toFixed(2)}
						</span>
						<span class="text-xs text-muted-foreground">/ match</span>
					</div>
					<span class="mt-1 text-xs text-muted-foreground">Total: {player.goals}</span>
				</div>
				<div class="flex flex-col items-center rounded-md border border-border bg-muted/60 p-3 text-center transition-colors hover:bg-muted/80">
					<span class="text-xs font-medium text-muted-foreground">Assists</span>
					<div class="mt-1 flex items-baseline gap-1">
						<span class="text-lg font-semibold" style="color: {teamColor}">
							{player.assistsPerMatch.toFixed(2)}
						</span>
						<span class="text-xs text-muted-foreground">/ match</span>
					</div>
					<span class="mt-1 text-xs text-muted-foreground">Total: {player.assists}</span>
				</div>
				<div class="flex flex-col items-center rounded-md border border-border bg-muted/60 p-3 text-center transition-colors hover:bg-muted/80">
					<span class="text-xs font-medium text-muted-foreground">Points</span>
					<div class="mt-1 flex items-baseline gap-1">
						<span class="text-lg font-semibold" style="color: {teamColor}">
							{player.pointsPerMatch.toFixed(2)}
						</span>
						<span class="text-xs text-muted-foreground">/ match</span>
					</div>
					<span class="mt-1 text-xs text-muted-foreground">Total: {player.points}</span>
				</div>
			</div>

			<div class="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
				<span class="text-xs text-muted-foreground">
					<span class="mr-1">Matches:</span>
					<span class="font-medium text-foreground">{player.matches}</span>
				</span>
			</div>

			{#if synergiesWithHistory && synergiesWithHistory.length > 0}
				<div class="space-y-2 rounded-md border border-border bg-muted/30 p-3">
					<div class="flex items-center justify-between text-xs">
						<span class="font-medium text-muted-foreground">Teammate History</span>
						{#if avgSynergy !== null}
							<span class="font-mono font-semibold {getSynergyColorClass(avgSynergy)}">
								Avg: {avgSynergy > 0 ? '+' : ''}{avgSynergy.toFixed(2)}
							</span>
						{/if}
					</div>
					<div class="space-y-1">
						{#each synergiesWithHistory as synergy}
							{@const otherPlayer = synergy.player1 === player.name ? synergy.player2 : synergy.player1}
							<div class="flex items-center justify-between text-xs">
								<span class="text-muted-foreground">vs {otherPlayer}</span>
								<span class="font-mono {getSynergyColorClass(synergy.contribution)}">
									{synergy.contribution > 0 ? '+' : ''}{synergy.contribution.toFixed(2)}
									<span class="ml-1 text-muted-foreground">
										({synergy.winsTogether}W/{synergy.lossesTogether}L)
									</span>
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>
</li>
