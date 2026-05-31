import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'node_modules',
      'playwright-report',
      'test-results',
      'e2e',
    ],
  },

  // Application source — TypeScript + React.
  // react-hooks is registered manually with its classic core rules; the new
  // React-Compiler rule set in `recommended-latest` is intentionally not used
  // because this legacy-wrapper app performs imperative DOM work in effects.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Test + setup files — also allow Node globals.
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // Legacy vanilla-JS runtime — ES5-style IIFE, browser globals, and a small
  // set of intentional empty catch blocks. Linted (per issue #2) but with the
  // relaxed rules the legacy code was written against.
  {
    files: ['src/legacy/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        CampusEats: 'writable',
        toast: 'writable',
        openSheet: 'writable',
        closeSheet: 'writable',
      },
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Vendored ES5 runtime: ignore unused caught errors and unused function
      // args (e.g. defensive `catch (e) {}` and shared helper signatures).
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', vars: 'all' }],
    },
  },
)
