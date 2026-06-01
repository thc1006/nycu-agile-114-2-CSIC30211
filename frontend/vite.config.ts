/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // NOTE: coverage measures the React/adapter shell only. The legacy runtime
      // src/legacy/campus-web.js (which holds the bulk of the business logic and
      // mock data) is intentionally excluded, so the headline % reflects the
      // wrapper — NOT the whole app. Do not quote it as overall app coverage.
      // Re-including the legacy file is tracked with the de-eval work in #13.
      include: ['src/lib/**', 'src/pages/**'],
      exclude: ['src/legacy/**', 'src/main.tsx', '**/*.test.*', '**/*.spec.*'],
      // Thresholds are a ratchet (raise only). branches raised 60→75 to match the
      // real branch coverage of the validation/error paths; statements/functions/
      // lines stay at 80. perFile is deferred until PageChrome/DashboardPage are
      // lifted above 80 per-file (currently 76%/66% functions) so the gate stays green.
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
})
