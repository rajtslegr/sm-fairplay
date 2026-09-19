<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let { class: className = '', onclick, children }: Props = $props();
</script>

<button
	class={cn(
		'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	onclick={onclick}
>
	{@render children()}
</button>
