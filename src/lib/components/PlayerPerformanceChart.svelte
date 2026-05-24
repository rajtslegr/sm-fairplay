<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Chart,
		BarElement,
		CategoryScale,
		LinearScale,
		Legend,
		Tooltip,
		BarController
	} from 'chart.js';
	import Card from './ui/Card.svelte';
	import CardContent from './ui/CardContent.svelte';
	import type { Player } from '$lib/utils/types';

	Chart.register(BarController, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

	interface Props {
		players: Player[];
	}

	let { players }: Props = $props();

	let canvasRef = $state<HTMLCanvasElement>();
	let chartInstance: Chart | null = null;

	function createChart() {
		if (!canvasRef || players.length === 0) return;

		if (chartInstance) {
			chartInstance.destroy();
		}

		const isDark = document.documentElement.classList.contains('dark');
		const textColor = isDark ? 'hsl(0 0% 63.9%)' : 'hsl(0 0% 45.1%)';
		const gridColor = isDark ? 'hsl(0 0% 17.5%)' : 'hsl(0 0% 89.8%)';

		chartInstance = new Chart(canvasRef, {
			type: 'bar',
			data: {
				labels: players.map((p) => p.name),
				datasets: [
					{
						label: 'Goals/Match',
						data: players.map((p) => Number(p.goalsPerMatch.toFixed(2))),
						backgroundColor: 'hsl(142 71% 45%)',
						borderRadius: 4
					},
					{
						label: 'Assists/Match',
						data: players.map((p) => Number(p.assistsPerMatch.toFixed(2))),
						backgroundColor: 'hsl(0 72% 50%)',
						borderRadius: 4
					},
					{
						label: 'Points/Match',
						data: players.map((p) => Number(p.pointsPerMatch.toFixed(2))),
						backgroundColor: textColor,
						borderRadius: 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'top',
						labels: {
							color: textColor
						}
					},
					tooltip: {
						callbacks: {
							label: (context: any) => {
								return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
							}
						}
					}
				},
				scales: {
					x: {
						ticks: {
							maxRotation: -45,
							minRotation: -45,
							color: textColor
						},
						grid: {
							display: false
						}
					},
					y: {
						ticks: {
							color: textColor,
							callback: (value: any) => value.toFixed(2)
						},
						grid: {
							color: gridColor
						}
					}
				}
			}
		});
	}

	$effect(() => {
		// Re-create chart when players change
		if (players.length > 0) {
			// Use tick to ensure canvas is in DOM
			queueMicrotask(() => createChart());
		}
		return () => {
			if (chartInstance) {
				chartInstance.destroy();
				chartInstance = null;
			}
		};
	});
</script>

<Card>
	<CardContent class="h-[400px] p-4">
		<canvas bind:this={canvasRef}></canvas>
	</CardContent>
</Card>
