import { test, expect } from '@playwright/test'

// End-to-end orderer journey: login (orderer) → dashboard → post a re-order →
// system fee + confirmation. Login now performs a REAL auth call via the typed
// api client (#12 wiring); the auth endpoint is stubbed at the network layer so
// the suite stays hermetic. Interior pages still render mock data.
test.describe('orderer journey', () => {
  test('logs in as an orderer and reaches the dashboard', async ({ page }) => {
    await page.route((url) => url.pathname.endsWith('/auth/login'), (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'e2e-token', token_type: 'bearer' }),
      }),
    )
    await page.goto('/login?role=orderer')
    await page.getByLabel('學校 Email').fill('orderer@campus.edu')
    await page.getByLabel('密碼').fill('demo-password')
    await page.getByRole('button', { name: '登入', exact: true }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page).toHaveURL(/role=orderer/)
  })

  test('blocks continuing past login without valid credentials', async ({ page }) => {
    await page.goto('/login?role=orderer')
    // Nothing filled in — client validation must block the submit (no nav).
    await page.getByRole('button', { name: '登入', exact: true }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('請輸入有效的學校 Email 與密碼')).toBeVisible()
  })

  test('posts a re-order and sees the system-calculated fee + success screen', async ({ page }) => {
    await page.goto('/post-order?reorder=mai&role=orderer')

    // The "mai" preset prefills 拉亞漢堡 and its menu picks.
    await expect(page.locator('#restaurant')).toHaveValue('拉亞漢堡')
    // Fee is computed by the system and shown before confirming.
    await expect(page.locator('#feeTotal')).toContainText('$')

    await page.getByRole('button', { name: '檢視並確認' }).click()

    const success = page.locator('#successScreen')
    await expect(success).toBeVisible()
    await expect(success.getByText('訂餐成功')).toBeVisible()
    await expect(page.locator('#sumFee')).toContainText('$')
  })
})
