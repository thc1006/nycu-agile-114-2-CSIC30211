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

// #12 (wiring) LANDED: login now performs a REAL auth call via the typed api
// client (LoginForm.tsx) — client-side validation gates the submit, then login()
// hits POST /auth/login and only navigates on success. The auth endpoint is
// stubbed at the network layer so these stay hermetic. This covers both the
// client-validation branches AND a real success/failure signal (200 → navigate,
// 401 → error + no navigate), replacing the previous false-green nav-only test.
test.describe('login validation', () => {
  test('rejects a malformed email even with a password present', async ({ page }) => {
    await page.goto('/login?role=orderer')

    await page.getByLabel('學校 Email').fill('not-an-email')
    await page.getByLabel('密碼').fill('demo-password')
    await page.getByRole('button', { name: '登入', exact: true }).click()

    // Client validation blocks the submit: no navigation, error surfaced.
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('請輸入有效的學校 Email 與密碼')).toBeVisible()
  })

  test('rejects an empty email', async ({ page }) => {
    await page.goto('/login?role=orderer')
    await page.getByLabel('密碼').fill('demo-password')
    await page.getByRole('button', { name: '登入', exact: true }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('請輸入有效的學校 Email 與密碼')).toBeVisible()
  })

  test('a valid email + password authenticates and proceeds to the dashboard', async ({ page }) => {
    await page.route((url) => url.pathname.endsWith('/auth/login'), (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'e2e-token', token_type: 'bearer' }),
      }),
    )
    await page.goto('/login?role=orderer')
    await page.getByLabel('學校 Email').fill('student@campus.edu')
    await page.getByLabel('密碼').fill('demo-password')
    await page.getByRole('button', { name: '登入', exact: true }).click()

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page).toHaveURL(/role=orderer/)
  })

  test('rejects wrong credentials with the server error and stays on login', async ({ page }) => {
    await page.route((url) => url.pathname.endsWith('/auth/login'), (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Invalid email or password' }),
      }),
    )
    await page.goto('/login?role=orderer')
    await page.getByLabel('學校 Email').fill('student@campus.edu')
    await page.getByLabel('密碼').fill('wrong-password')
    await page.getByRole('button', { name: '登入', exact: true }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Invalid email or password')).toBeVisible()
  })
})
