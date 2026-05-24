<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		class?: string;
		children: Snippet;
	}

	let { open, onOpenChange, class: className = '', children }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onOpenChange(false);
		}
	}

	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onOpenChange(false);
		}
	}

	function handleContentKeydown(e: KeyboardEvent) {
		e.stopPropagation();
	}
</script>

<svelte:window onkeydown={handleBackdropKeydown} />

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleBackdropKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_no_static_element_interactions -->
		<div
			class={cn(
				'relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg animate-in sm:max-w-2xl',
				className
			)}
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleContentKeydown}
			role="document"
		>
			<button
				class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				onclick={() => onOpenChange(false)}
			>
				<X class="size-4" />
				<span class="sr-only">Close</span>
			</button>
			{@render children()}
		</div>
	</div>
{/if}
