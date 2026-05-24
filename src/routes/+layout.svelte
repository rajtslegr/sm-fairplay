<script lang="ts">
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import '../app.css';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import { appStore } from '$lib/stores/appStore.svelte';
	import { themeStore } from '$lib/stores/themeStore.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	let players = $derived(appStore.players);
	let fileUploaded = $derived(players.length > 0);
	let currentPath = $derived(page.url.pathname);

	onMount(() => {
		// Initialize theme
		themeStore.initializeTheme();

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			themeStore.handleSystemChange(e.matches);
		};
		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});
</script>

<div class="flex min-h-screen flex-col bg-background font-inter text-foreground">
	<header class="fixed z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-8">
				<img
					src="/stemmark-logo.png"
					alt="STEM/MARK logo"
					class="h-8 w-auto transition-opacity hover:opacity-80"
				/>
				<nav class="hidden gap-6 sm:flex">
					<a
						href="/"
						class="text-sm font-medium transition-colors hover:text-foreground {currentPath === '/' ? 'text-foreground' : 'text-muted-foreground'}"
					>
						Fair Play
					</a>
					{#if fileUploaded}
						<a
							href="/score"
							class="text-sm font-medium transition-colors hover:text-foreground {currentPath === '/score' ? 'text-foreground' : 'text-muted-foreground'}"
						>
							Score
						</a>
					{/if}
				</nav>
			</div>
			<div class="flex items-center gap-4">
				<ThemeToggle />
				<button
					onclick={() => (appStore.showAbout = true)}
					class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					About
				</button>
				<a
					href="https://github.com/rajtslegr/sm-fairplay"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					GitHub
				</a>
			</div>
		</div>
	</header>
	<div class="relative z-10 pt-20">
		{@render children()}
	</div>
</div>

<AboutModal />
<Toaster />
