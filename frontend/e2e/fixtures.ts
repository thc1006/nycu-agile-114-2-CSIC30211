import { test as base, expect } from '@playwright/test'

// Shared e2e harness. Every interior page calls GET /auth/me on mount
// (useRequireAuth). With the seeded storageState token but no real backend, the
// static preview returns 401 for /api/auth/me, which the app reads as an expired
// session and bounces to /login. Stub a valid current user so the journeys land
// on the real gated pages. A spec that needs a specific user can still register
// its own /auth/me route — the later registration wins.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(
      (u) => u.pathname.endsWith('/auth/me'),
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'u_me', email: 'me@campus.edu', name: '我' }),
        }),
    )
    await use(page)
  },
})

export { expect }
