import { test, expect } from '@playwright/test'

// End-to-end runner journey: login (runner) → feed → filter → accept an order →
// order tracking. Data is mocked in the legacy runtime pending the backend.
test.describe('runner journey', () => {
  test('logs in as a runner and reaches the order feed', async ({ page }) => {
    await page.goto('/login?role=runner')
    await page.getByLabel('密碼').fill('demo-password')
    await page.getByRole('button', { name: '繼續' }).click()

    await expect(page).toHaveURL(/\/feed/)
    await expect(page.getByRole('heading', { name: '待接訂單' })).toBeVisible()
    // Runner starts online with the demo feed of 5 open orders.
    await expect(page.locator('#countN')).toHaveText('5')
  })

  test('filters the feed by category', async ({ page }) => {
    await page.goto('/feed?role=runner')
    await page.getByRole('button', { name: '飲料' }).click()
    // Two demo orders are tagged as drinks.
    await expect(page.locator('#countN')).toHaveText('2')
  })

  test('shows an empty state when a search matches nothing', async ({ page }) => {
    await page.goto('/feed?role=runner')
    await page.getByLabel('搜尋待接訂單').fill('zzzz-no-match')
    await expect(page.locator('#emptyState')).toBeVisible()
  })

  test('accepts an order and advances to tracking', async ({ page }) => {
    await page.goto('/order-detail?role=runner')

    const accept = page.getByRole('button', { name: /接下這筆訂單/ })
    await accept.click()

    // The button locks the order, then becomes a "go to purchase flow" CTA.
    const locked = page.getByRole('button', { name: /接單成功/ })
    await expect(locked).toBeVisible()
    await locked.click()

    await expect(page).toHaveURL(/order-tracking/)
  })
})
