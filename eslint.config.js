import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import tailwindcss from 'eslint-plugin-tailwindcss';
import testingLibrary from 'eslint-plugin-testing-library';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'dist',
      'dist-ssr',
      'coverage',
      'test-results',
      'playwright-report',
      'storybook-static',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      jsxA11y.flatConfigs.recommended,
      tailwindcss.configs.recommended,
      prettierRecommended,
    ],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: 'detect' },
      tailwindcss: { cssConfigPath: 'src/index.css' },
    },
    rules: {
      'no-console': ['error', { allow: ['error'] }],
      // TypeScript already validates module resolution, including path aliases
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal'],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: '@vitejs/*', group: 'external' },
            { pattern: '@testing-library/*', group: 'external' },
            { pattern: '@*/**', group: 'internal' },
            { pattern: './**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'jsx-a11y/anchor-is-valid': 'off',
      'react/prop-types': 'off',
      'tailwindcss/classnames-order': 'error',
      'tailwindcss/no-custom-classname': 'off',
      // unused-imports supersedes the base rule and can auto-remove imports
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Vendored shadcn/ui primitives receive heading content via props spread
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'jsx-a11y/heading-has-content': 'off',
    },
  },
  {
    files: ['src/**/*.{spec,test}.{ts,tsx}'],
    extends: [testingLibrary.configs['flat/react']],
    languageOptions: {
      globals: { ...globals.vitest },
    },
  },
  {
    files: ['e2e/**/*.{spec,test}.ts'],
    extends: [playwright.configs['flat/recommended']],
  },
  ...storybook.configs['flat/recommended'],
);
