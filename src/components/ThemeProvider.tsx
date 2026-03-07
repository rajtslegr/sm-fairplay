import { useEffect, useRef } from 'react';

import { useThemeStore } from '@store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'dark' | 'light' | 'system';
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { initializeTheme, handleSystemChange } = useThemeStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      initializeTheme();

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        handleSystemChange(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, [initializeTheme, handleSystemChange]);

  return <>{children}</>;
}
