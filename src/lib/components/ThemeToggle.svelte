<script lang="ts">
	import { Moon, Sun, Monitor } from 'lucide-svelte';
	import Button from './ui/Button.svelte';
	import DropdownMenu from './ui/DropdownMenu.svelte';
	import DropdownMenuItem from './ui/DropdownMenuItem.svelte';
	import { themeStore } from '$lib/stores/themeStore.svelte';

	let theme = $derived(themeStore.theme);
	let resolvedTheme = $derived(themeStore.resolvedTheme);
</script>

<DropdownMenu>
	{#snippet trigger()}
		<Button variant="ghost" size="icon" class="size-9">
			<Sun class="size-[1.2rem] rotate-0 scale-100 transition-all {resolvedTheme === 'dark' ? '-rotate-90 scale-0' : ''}" />
			<Moon class="size-[1.2rem] rotate-90 scale-0 transition-all {resolvedTheme === 'dark' ? 'rotate-0 scale-100' : ''}" />
			<span class="sr-only">Toggle theme</span>
		</Button>
	{/snippet}
	{#snippet children()}
		<DropdownMenuItem onclick={() => themeStore.setTheme('light')}>
			<Sun class="mr-2 size-4" />
			Light
			{#if theme === 'light'}
				<span class="ml-auto text-xs text-primary">●</span>
			{/if}
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => themeStore.setTheme('dark')}>
			<Moon class="mr-2 size-4" />
			Dark
			{#if theme === 'dark'}
				<span class="ml-auto text-xs text-primary">●</span>
			{/if}
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => themeStore.setTheme('system')}>
			<Monitor class="mr-2 size-4" />
			System
			{#if theme === 'system'}
				<span class="ml-auto text-xs text-primary">●</span>
			{/if}
		</DropdownMenuItem>
	{/snippet}
</DropdownMenu>
