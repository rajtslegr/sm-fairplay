import { useEffect } from 'react';

import { useThemeStore } from '@store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'dark' | 'light' | 'system';
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { initializeTheme, handleSystemChange } = useThemeStore();

  useEffect(() => {
    initializeTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      handleSystemChange(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [initializeTheme, handleSystemChange]);

  return <>{children}</>;
}
