import { test, expect } from './fixtures'

// End-to-end orderer journey: login (orderer) → dashboard → post a re-order →
// real order created + live tracking. Login performs a REAL auth call via the
// typed api client (#12 wiring); the auth endpoint is stubbed at the network
// layer so the suite stays hermetic. The interior pages now call same-origin
// /api and gate behind useRequireAuth, so /auth/me is stubbed where data needs
// to render.
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

  test('posts a re-order and lands on live tracking for the created order', async ({ page }) => {
    const json = (b: unknown) => ({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(b),
    })
    const order = {
      id: 'o_new',
      customer_id: 'u_me',
      runner_id: null,
      restaurant: '茶壜',
      meal: '珍奶 ×1',
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
    // POST /orders creates the order; GET /orders/o_new serves the tracking page.
    await page.route((u) => u.pathname.endsWith('/orders'), (r) => r.fulfill(json(order)))
    await page.route((u) => u.pathname.endsWith('/orders/o_new'), (r) => r.fulfill(json(order)))

    await page.goto('/post-order?role=orderer')
    await page.getByLabel('餐廳 / 店家').fill('茶壜')
    await page.getByLabel('餐點內容').fill('珍奶 ×1')
    await page.getByLabel('期望送達時間').selectOption({ label: '12:30 前' })
    await page.getByRole('button', { name: '發布帶餐需求' }).click()

    await expect(page).toHaveURL(/order-tracking\?id=o_new/)
    await expect(page.getByText('茶壜')).toBeVisible()
  })
})
