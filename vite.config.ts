/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), [tsconfigPaths()]],
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e'],
  },
});
