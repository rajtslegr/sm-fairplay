<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		trigger: Snippet;
		children: Snippet;
	}

	let { class: className = '', trigger, children }: Props = $props();

	let open = $state(false);
	let containerRef = $state<HTMLElement>();

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	function handleClickOutside(e: MouseEvent) {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			close();
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside, true);
			return () => document.removeEventListener('click', handleClickOutside, true);
		}
	});
</script>

<div class="relative inline-block" bind:this={containerRef}>
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div onclick={toggle} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggle()}>
		{@render trigger()}
	</div>

	{#if open}
		<div
			class={cn(
				'absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in',
				className
			)}
		>
			{@render children()}
		</div>
	{/if}
</div>
