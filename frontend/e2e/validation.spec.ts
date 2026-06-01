import { test, expect } from '@playwright/test'

// Form VALIDATION-FAILURE coverage. The happy paths are exercised elsewhere;
// these pin the error branches the backend contract will hit first — required
// fields, email format, error surfacing, and focus management. Backend is
// mocked, so we assert the frontend's own validation behaviour.

test.describe('post-order validation', () => {
  test('blocks an empty submission, surfaces the error, and focuses the first bad field', async ({
    page,
  }) => {
    await page.goto('/post-order?role=orderer')

    // Nothing filled in (restaurant / items / time are all empty; 取餐地點
    // defaults to the saved dropoff). Try to continue.
    await page.getByRole('button', { name: '檢視並確認' }).click()

    // The success overlay must NOT appear...
    await expect(page.locator('#successScreen')).toBeHidden()
    // ...the error alert is shown...
    await expect(page.locator('#orderError')).toBeVisible()
    await expect(page.locator('#orderError')).toContainText('無法訂餐')
    // ...the first required field is flagged and focused...
    await expect(page.locator('.field:has(#restaurant)')).toHaveClass(/has-error/)
    await expect(page.locator('#restaurant')).toBeFocused()
    // ...and the blocking toast fired.
    await expect(page.locator('.toast-wrap')).toContainText('無法訂餐')
  })

  test('clears the error and submits once the required fields are filled', async ({ page }) => {
    await page.goto('/post-order?role=orderer')
    await page.getByRole('button', { name: '檢視並確認' }).click()
    await expect(page.locator('#orderError')).toBeVisible()

    // Fill the required fields (free-text items for a menu-less shop).
    await page.locator('#restaurant').fill('小確幸早餐店')
    await page.locator('#freeItems').fill('蛋餅 ×1、奶茶微糖少冰 ×1')
    await page.locator('#time').selectOption({ label: '12:30 前' })

    // The inline error clears as the fields become valid...
    await expect(page.locator('#orderError')).toBeHidden()

    // ...and submitting now reaches the success screen with a system fee.
    await page.getByRole('button', { name: '檢視並確認' }).click()
    await expect(page.locator('#successScreen')).toBeVisible()
    await expect(page.locator('#sumFee')).toContainText('$')
  })
})

// MOCK-STAGE (#12): "login" is a client-side nav — LoginPage.tsx validates only
// non-empty + email regex, sets a role in localStorage, and follows an <a href>.
// There is NO credential check and NO token. The "accepts ..." test below is
// therefore FALSE-GREEN: it asserts the regex passed and the link fired, not that
// the server authenticated anyone — it will keep passing after a real backend is
// wired in and rejects these exact credentials. When #12 lands, replace it with an
// assertion on an authenticated signal (token/cookie/authed-only element or a 200
// from the auth call) PLUS a negative test that wrong creds are rejected.
test.describe('login validation', () => {
  test('rejects a malformed email even with a password present', async ({ page }) => {
    await page.goto('/login?role=orderer')

    // Replace the prefilled valid email with a malformed one (no @ / domain).
    await page.locator('#email').fill('not-an-email')
    await page.locator('#pw').fill('demo-password')
    await page.getByRole('button', { name: '繼續' }).click()

    // Navigation is blocked and the email field is flagged.
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('.field:has(#email)')).toHaveClass(/has-error/)
  })

  test('rejects an empty email', async ({ page }) => {
    await page.goto('/login?role=orderer')
    await page.locator('#email').fill('')
    await page.locator('#pw').fill('demo-password')
    await page.getByRole('button', { name: '繼續' }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('.field:has(#email)')).toHaveClass(/has-error/)
  })

  // FALSE-GREEN until #12 — proves only client-side regex + navigation, not auth.
  test('accepts a well-formed email (client-side only — no real auth, see #12) and proceeds to the dashboard', async ({ page }) => {
    await page.goto('/login?role=orderer')
    await page.locator('#email').fill('student@campus.edu')
    await page.locator('#pw').fill('demo-password')
    await page.getByRole('button', { name: '繼續' }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page).toHaveURL(/role=orderer/)
  })
})
