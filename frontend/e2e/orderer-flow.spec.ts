import { test, expect } from '@playwright/test'

// End-to-end orderer journey: login (orderer) → dashboard → post a re-order →
// system fee + confirmation. Backend is mocked, so we assert the frontend
// behaviour (validation, fee calc, success state) the backend will later wire up.
test.describe('orderer journey', () => {
  test('logs in as an orderer and reaches the dashboard', async ({ page }) => {
    await page.goto('/login?role=orderer')
    await page.getByLabel('密碼').fill('demo-password')
    await page.getByRole('button', { name: '繼續' }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page).toHaveURL(/role=orderer/)
  })

  test('blocks continuing past login without a password', async ({ page }) => {
    await page.goto('/login?role=orderer')
    // Password is intentionally empty (no prefilled credentials).
    await page.getByRole('button', { name: '繼續' }).click()
    await expect(page).toHaveURL(/\/login/)
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
