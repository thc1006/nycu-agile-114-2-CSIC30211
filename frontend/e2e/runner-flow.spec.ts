import { test, expect } from '@playwright/test'

// End-to-end runner journey: login (runner) → feed → filter → accept an order →
// order tracking. Login performs a REAL auth call (#12 wiring), stubbed at the
// network layer; the feed/detail data is still mocked in the legacy runtime.
test.describe('runner journey', () => {
  test('logs in as a runner and reaches the order feed', async ({ page }) => {
    await page.route((url) => url.pathname.endsWith('/auth/login'), (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'e2e-token', token_type: 'bearer' }),
      }),
    )
    await page.goto('/login?role=runner')
    await page.getByLabel('學校 Email').fill('runner@campus.edu')
    await page.getByLabel('密碼').fill('demo-password')
    await page.getByRole('button', { name: '登入', exact: true }).click()

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
