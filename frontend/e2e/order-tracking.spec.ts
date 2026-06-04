import { test, expect } from '@playwright/test'

// Wired order-tracking: the page reads ?id=, calls the real getOrder + FSM
// action endpoints, and polls for near-real-time updates. The backend is stubbed
// at the network layer (same-origin /api → no CORS preflight, so page.route can
// intercept). This proves the status really advances on the server, not just in
// a local variable like the old mock.
test.describe('order tracking (wired)', () => {
  test('a runner advances a real order: ACCEPTED → 開始購買 → 標記已送達', async ({ page }) => {
    let status = 'ACCEPTED'
    const order = () => ({
      id: 'o_x',
      customer_id: 'u_buyer',
      runner_id: 'u_runner',
      restaurant: '二餐自助',
      meal: '雞腿便當 ×1',
      pickup_location: '資工系館',
      expected_time: '2026-06-10T12:30:00+08:00',
      delivery_fee: 20,
      status,
      created_at: '',
      updated_at: '',
    })
    const json = (body: unknown) => ({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })

    // GET /orders/o_x (also served to the poll) — reflects the current status.
    await page.route((u) => u.pathname.endsWith('/orders/o_x'), (r) => r.fulfill(json(order())))
    // POST /orders/o_x/start advances the server state (ACCEPTED → BUYING).
    await page.route((u) => u.pathname.endsWith('/orders/o_x/start'), (r) => {
      status = 'BUYING'
      return r.fulfill(json(order()))
    })

    await page.goto('/order-tracking?id=o_x&role=runner')
    await expect(page.getByText('二餐自助')).toBeVisible()

    await page.getByRole('button', { name: '開始購買' }).click()
    // Status advanced on the server → the next runner action appears (and the
    // 4s poll keeps returning BUYING, so it does not revert).
    await expect(page.getByRole('button', { name: '標記已送達' })).toBeVisible()
  })

  test('with no order id, offers a self-contained demo order', async ({ page }) => {
    await page.goto('/order-tracking?role=orderer')
    await expect(page.getByRole('heading', { name: '即時進度' })).toBeVisible()
    await expect(page.getByRole('button', { name: /建立示範訂單/ })).toBeVisible()
  })
})
