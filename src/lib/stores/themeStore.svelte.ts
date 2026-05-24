// Theme store using Svelte 5 runes with localStorage persistence
type Theme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'theme-storage';

function getSystemTheme(): 'dark' | 'light' {
	if (typeof window === 'undefined') return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: 'dark' | 'light') {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	root.classList.remove('light', 'dark');
	root.classList.add(theme);
}

function loadTheme(): Theme {
	if (typeof window === 'undefined') return 'system';
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (['dark', 'light', 'system'].includes(parsed.theme)) {
				return parsed.theme as Theme;
			}
		}
	} catch {
		// ignore
	}
	return 'system';
}

class ThemeStore {
	theme = $state<Theme>(loadTheme());
	resolvedTheme = $state<'dark' | 'light'>('dark');

	constructor() {
		this.initializeTheme();
	}

	setTheme(theme: Theme) {
		this.theme = theme;
		const resolved = theme === 'system' ? getSystemTheme() : theme;
		this.resolvedTheme = resolved;
		applyTheme(resolved);
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme }));
			} catch {
				// ignore
			}
		}
	}

	initializeTheme() {
		const resolved = this.theme === 'system' ? getSystemTheme() : this.theme;
		this.resolvedTheme = resolved;
		applyTheme(resolved);
	}

	handleSystemChange(matches: boolean) {
		if (this.theme === 'system') {
			const resolved = matches ? 'dark' : 'light';
			this.resolvedTheme = resolved;
			applyTheme(resolved);
		}
	}
}

export const themeStore = new ThemeStore();
