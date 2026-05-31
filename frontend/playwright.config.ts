import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config. The webServer builds the app and serves the production bundle on
 * :4173 (Vite preview does SPA history fallback, so legacy `.html` deep links
 * resolve through React Router).
 *
 * Projects:
 *  - `desktop` — functional + a11y journeys at Desktop Chrome.
 *  - `mobile`  — the same journeys + the phone bottom-nav regression at a Pixel 5
 *    viewport. Mobile is the app's primary form factor and was previously
 *    untested, which let a mobile-only full-reload nav bug ship; this project
 *    closes that blind spot. (axe is desktop-only to keep the suite fast.)
 *  - `visual`  — screenshot regression for key pages at desktop + mobile widths.
 *    Baselines are platform-specific; they are generated/committed on the dev
 *    machine and run locally via `npm run test:e2e:visual` (NOT in CI, where the
 *    Linux renderer would diff against the committed macOS baselines). Regenerate
 *    with `npm run test:e2e:visual:update`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  expect: {
    // Screenshot stability: freeze animations/caret and tolerate sub-pixel
    // antialiasing so the visual gate flags real layout changes, not noise.
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.02 },
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
      // Visual specs run under their own project; mobile-nav only makes sense at
      // a phone viewport (the bottom bar is display:none on desktop).
      testIgnore: [/visual\.spec\.ts/, /mobile-nav\.spec\.ts/],
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
      // Re-run the journeys + the bottom-nav regression at a phone viewport.
      // axe (a11y.spec) stays desktop-only; visual has its own project.
      testIgnore: [/visual\.spec\.ts/, /a11y\.spec\.ts/],
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /visual\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
