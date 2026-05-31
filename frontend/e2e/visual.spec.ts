import { test, expect } from '@playwright/test'

// Visual-regression baselines for the key screens at desktop and mobile widths.
// Runs only under the `visual` project (npm run test:e2e:visual). Baselines are
// platform-specific (committed from the dev machine); regenerate after an
// intentional visual change with `npm run test:e2e:visual:update`.
//
// Pages with mocked, static data are deterministic; we still wait for fonts +
// the route shell before shooting, and freeze animations/caret via the config.

const DESKTOP = { width: 1280, height: 900 }
const MOBILE = { width: 390, height: 844 }

async function settle(page: import('@playwright/test').Page, url: string) {
  await page.goto(url)
  // The route shell + legacy chrome are mounted in effects; wait for both.
  await expect(page.locator('[data-react-route]')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}

const screens: Array<{ name: string; url: string }> = [
  { name: 'landing', url: '/' },
  { name: 'dashboard', url: '/dashboard?role=orderer' },
  { name: 'feed', url: '/feed?role=runner' },
  { name: 'post-order', url: '/post-order?role=orderer' },
]

test.describe('visual — desktop', () => {
  test.use({ viewport: DESKTOP })
  for (const s of screens) {
    test(`${s.name} matches the desktop baseline`, async ({ page }) => {
      await settle(page, s.url)
      await expect(page).toHaveScreenshot(`${s.name}-desktop.png`, { fullPage: true })
    })
  }
})

test.describe('visual — mobile', () => {
  test.use({ viewport: MOBILE })
  for (const s of screens.filter((s) => s.name !== 'post-order')) {
    test(`${s.name} matches the mobile baseline`, async ({ page }) => {
      await settle(page, s.url)
      await expect(page).toHaveScreenshot(`${s.name}-mobile.png`, { fullPage: true })
    })
  }
})
