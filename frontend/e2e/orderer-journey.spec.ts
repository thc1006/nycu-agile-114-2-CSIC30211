import { test, expect } from './fixtures'

// Full orderer lifecycle, end to end through the browser. The loop is now REALLY
// wired: post-order creates an actual order via POST /orders and lands on live
// tracking for that id, and the rating page submits via POST /orders/{id}/ratings
// against the wired components. The backend is stubbed at the network layer
// (same-origin /api) so the journey stays hermetic, but it exercises the real
// create → track and complete → rate transitions rather than the old mock.
test.describe('orderer lifecycle', () => {
  const json = (b: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(b),
  })
  const me = { id: 'u_me', email: 'me@campus.edu', name: '我' }

  test('creates an order and lands on live tracking', async ({ page }) => {
    const order = {
      id: 'o_j1',
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

    await page.route((u) => u.pathname.endsWith('/auth/me'), (r) => r.fulfill(json(me)))
    await page.route((u) => u.pathname.endsWith('/orders'), (r) => r.fulfill(json(order)))
    await page.route((u) => u.pathname.endsWith('/orders/o_j1'), (r) => r.fulfill(json(order)))

    await page.goto('/post-order?role=orderer')
    await page.getByLabel('餐廳 / 店家').fill('小確幸早餐店')
    await page.getByLabel('餐點內容').fill('蛋餅 ×1、奶茶微糖少冰 ×1')
    await page.getByLabel('期望送達時間').selectOption({ label: '12:30 前' })
    await page.getByRole('button', { name: '發布帶餐需求' }).click()

    await expect(page).toHaveURL(/order-tracking\?id=o_j1/)
    await expect(page.getByText('小確幸早餐店')).toBeVisible()
  })

  test('submits a star rating and sees the completion state', async ({ page }) => {
    const order = {
      id: 'o_j2',
      customer_id: 'u_me',
      runner_id: 'u_runner',
      restaurant: '茶壜',
      meal: '珍奶 ×1',
      pickup_location: '資工系館',
      expected_time: '2026-06-10T12:30:00+08:00',
      delivery_fee: 20,
      status: 'COMPLETED',
      created_at: '2026-06-04T10:00:00+08:00',
      updated_at: '2026-06-04T13:00:00+08:00',
    }

    await page.route((u) => u.pathname.endsWith('/auth/me'), (r) => r.fulfill(json(me)))
    await page.route((u) => u.pathname.endsWith('/orders/o_j2'), (r) => r.fulfill(json(order)))
    await page.route((u) => u.pathname.endsWith('/orders/o_j2/ratings'), (r) =>
      r.fulfill(json({ id: 'r_1', order_id: 'o_j2', score: 5 })),
    )

    await page.goto('/rating?id=o_j2&role=orderer')
    await page.getByRole('radio', { name: /5 星/ }).click()
    await page.getByRole('button', { name: '送出評價' }).click()

    await expect(page.getByText('已送出評價')).toBeVisible()
  })
})
