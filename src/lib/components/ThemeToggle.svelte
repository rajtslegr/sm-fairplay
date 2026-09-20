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
		<DropdownMenuItem onclick={() => themeStore.setTheme('light')}>
			<span class="flex size-4 shrink-0 items-center justify-center"><Sun class="size-4" /></span>
			Light
			{#if theme === 'light'}
				<span class="ml-auto size-2 rounded-full bg-primary"></span>
			{/if}
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => themeStore.setTheme('dark')}>
			<span class="flex size-4 shrink-0 items-center justify-center"><Moon class="size-4" /></span>
			Dark
			{#if theme === 'dark'}
				<span class="ml-auto size-2 rounded-full bg-primary"></span>
			{/if}
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => themeStore.setTheme('system')}>
			<span class="flex size-4 shrink-0 items-center justify-center"><Monitor class="size-4" /></span>
			System
			{#if theme === 'system'}
				<span class="ml-auto size-2 rounded-full bg-primary"></span>
			{/if}
		</DropdownMenuItem>
</DropdownMenu>
