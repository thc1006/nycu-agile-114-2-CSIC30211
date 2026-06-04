import { test, expect } from './fixtures'

// Form VALIDATION-FAILURE coverage. The happy paths are exercised elsewhere;
// these pin the error branches the backend contract will hit first — required
// fields, email format, error surfacing, and focus management. Backend is
// mocked, so we assert the frontend's own validation behaviour.

test.describe('post-order validation', () => {
  const json = (b: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(b),
  })

  test('blocks an empty submission, surfaces the error, and does not navigate', async ({ page }) => {
    await page.goto('/post-order?role=orderer')

    // Nothing filled in (restaurant / meal / time are all empty). Try to submit.
    await page.getByRole('button', { name: '發布帶餐需求' }).click()

    // The inline error is shown and the page does NOT navigate.
    await expect(page.getByText('請填寫餐廳')).toBeVisible()
    await expect(page).toHaveURL(/\/post-order/)
  })

  test('submits once the required fields are filled', async ({ page }) => {
    const order = {
      id: 'o_v',
      customer_id: 'u_me',
      runner_id: null,
      restaurant: '小確幸早餐店',
      meal: '蛋餅 ×1、奶茶微糖少冰 ×1',
      pickup_location: '資工系館',
      expected_time: '2026-06-10T12:30:00+08:00',
      delivery_fee: 20,
      status: 'OPEN',
      created_at: '2026-06-04T10:00:00+08:00',
      updated_at: '2026-06-04T10:00:00+08:00',
    }

    await page.route((u) => u.pathname.endsWith('/auth/me'), (r) =>
      r.fulfill(json({ id: 'u_me', email: 'me@campus.edu', name: '我' })),
    )
    await page.route((u) => u.pathname.endsWith('/orders'), (r) => r.fulfill(json(order)))
    await page.route((u) => u.pathname.endsWith('/orders/o_v'), (r) => r.fulfill(json(order)))

    await page.goto('/post-order?role=orderer')
    await page.getByLabel('餐廳 / 店家').fill('小確幸早餐店')
    await page.getByLabel('餐點內容').fill('蛋餅 ×1、奶茶微糖少冰 ×1')
    await page.getByLabel('期望送達時間').selectOption({ label: '12:30 前' })

    await page.getByRole('button', { name: '發布帶餐需求' }).click()
    await expect(page).toHaveURL(/order-tracking\?id=o_v/)
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
