import { test, expect } from '@playwright/test'

// Regression for the mobile phone bottom-nav. Below the desktop breakpoint the
// bottom tab-bar (mounted by the legacy runtime on <body>) is the only primary
// navigation. It must route through react-router, NOT trigger a full document
// reload. This only runs under the `mobile` (Pixel 5) project — the bottom bar
// is display:none on desktop. The unit-level companion lives in
// src/pages/hardening.test.tsx.

test.describe('mobile bottom-nav', () => {
  test('orderer bottom-nav taps stay client-side (no full reload)', async ({ page }) => {
    await page.goto('/dashboard?role=orderer')

    const bottomNav = page.locator('nav[data-topnav-bottom]')
    await expect(bottomNav).toBeVisible()

    // Stamp the JS context — a full document reload wipes it.
    await page.evaluate(() => {
      ;(window as unknown as { __noReload?: boolean }).__noReload = true
    })

    await bottomNav.getByRole('link', { name: /發單/ }).click()

    // URL is the SPA-normalised route (no `.html`) and the context survived.
    await expect(page).toHaveURL(/\/post-order\?role=orderer/)
    const survived = await page.evaluate(
      () => (window as unknown as { __noReload?: boolean }).__noReload === true,
    )
    expect(survived).toBe(true)
  })

  test('runner bottom-nav taps stay client-side (no full reload)', async ({ page }) => {
    await page.goto('/feed?role=runner')

    const bottomNav = page.locator('nav[data-topnav-bottom]')
    await expect(bottomNav).toBeVisible()
    await page.evaluate(() => {
      ;(window as unknown as { __noReload?: boolean }).__noReload = true
    })

    await bottomNav.getByRole('link', { name: /收入/ }).click()

    await expect(page).toHaveURL(/\/runner-earnings\?role=runner/)
    const survived = await page.evaluate(
      () => (window as unknown as { __noReload?: boolean }).__noReload === true,
    )
    expect(survived).toBe(true)
  })
})
