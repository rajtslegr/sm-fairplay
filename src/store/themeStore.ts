import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
  handleSystemChange: (matches: boolean) => void;
}

const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const applyTheme = (theme: 'dark' | 'light'): void => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
};

export const useThemeStore = create(
  persist<ThemeState>(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'dark',

      setTheme: (theme: Theme) => {
        const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });
      },

      initializeTheme: () => {
        const { theme } = get();
        const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(resolvedTheme);
        set({ resolvedTheme });
      },

      handleSystemChange: (matches: boolean) => {
        const { theme } = get();
        if (theme === 'system') {
          const resolvedTheme = matches ? 'dark' : 'light';
          applyTheme(resolvedTheme);
          set({ resolvedTheme });
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) =>
        ({
          theme: state.theme,
        }) as ThemeState,
    },
  ) as StateCreator<ThemeState>,
);
