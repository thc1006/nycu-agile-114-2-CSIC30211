import { test, expect } from './fixtures'

// End-to-end runner journey: login (runner) → feed → accept an order → order
// tracking. Login performs a REAL auth call (#12 wiring); the feed/detail pages
// now call same-origin /api and gate behind useRequireAuth. Everything is
// stubbed at the network layer so the suite stays hermetic.
test.describe('runner journey', () => {
  const json = (b: unknown) => ({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(b),
  })
  const me = { id: 'u_me', email: 'me@campus.edu', name: '我' }
  const openItems = [
    {
      id: 'o_1',
      restaurant: '二餐自助',
      meal_summary: '雞腿便當 ×1',
      pickup_location: '資工系館',
      expected_time: '2026-06-10T12:30:00+08:00',
      delivery_fee: 20,
      status: 'OPEN',
    },
    {
      id: 'o_2',
      restaurant: '茶壜',
      meal_summary: '珍奶 ×2',
      pickup_location: '小福樓',
      expected_time: '2026-06-10T12:45:00+08:00',
      delivery_fee: 15,
      status: 'OPEN',
    },
    {
      id: 'o_3',
      restaurant: '麥味登',
      meal_summary: '蛋餅 ×1',
      pickup_location: '管院',
      expected_time: '2026-06-10T13:00:00+08:00',
      delivery_fee: 25,
      status: 'OPEN',
    },
  ]

  test('logs in as a runner and reaches the order feed', async ({ page }) => {
    await page.route((u) => u.pathname.endsWith('/auth/login'), (r) =>
      r.fulfill(json({ access_token: 'e2e-token', token_type: 'bearer' })),
    )
    await page.route((u) => u.pathname.endsWith('/auth/me'), (r) => r.fulfill(json(me)))
    await page.route((u) => u.pathname.endsWith('/orders/open'), (r) => r.fulfill(json(openItems)))

    await page.goto('/login?role=runner')
    await page.getByLabel('學校 Email').fill('runner@campus.edu')
    await page.getByLabel('密碼').fill('demo-password')
    await page.getByRole('button', { name: '登入', exact: true }).click()

    await expect(page).toHaveURL(/\/feed/)
    await expect(page.getByRole('heading', { name: '待接訂單' })).toBeVisible()
    // The count text reflects the stubbed open-order list (3 items).
    await expect(page.getByText(/筆待接/)).toContainText('3')
  })

  test('renders a real open order from the feed', async ({ page }) => {
    await page.route((u) => u.pathname.endsWith('/auth/me'), (r) => r.fulfill(json(me)))
    await page.route((u) => u.pathname.endsWith('/orders/open'), (r) => r.fulfill(json(openItems)))

    await page.goto('/feed?role=runner')
    await expect(page.getByRole('heading', { name: '待接訂單' })).toBeVisible()
    // A real open order's restaurant is shown on its card.
    await expect(page.getByText('二餐自助')).toBeVisible()
  })

  test('shows an empty state when there are no open orders', async ({ page }) => {
    await page.route((u) => u.pathname.endsWith('/auth/me'), (r) => r.fulfill(json(me)))
    await page.route((u) => u.pathname.endsWith('/orders/open'), (r) => r.fulfill(json([])))

    await page.goto('/feed?role=runner')
    await expect(page.getByRole('heading', { name: '目前沒有可接訂單' })).toBeVisible()
  })

  test('accepts an order and advances to tracking', async ({ page }) => {
    let status = 'OPEN'
    const order = () => ({
      id: 'o_x',
      customer_id: 'u_buyer',
      runner_id: status === 'OPEN' ? null : 'u_me',
      restaurant: '二餐自助',
      meal: '雞腿便當 ×1',
      pickup_location: '資工系館',
      expected_time: '2026-06-10T12:30:00+08:00',
      delivery_fee: 20,
      status,
      created_at: '2026-06-04T10:00:00+08:00',
      updated_at: '2026-06-04T10:00:00+08:00',
    })

    await page.route((u) => u.pathname.endsWith('/auth/me'), (r) => r.fulfill(json(me)))
    await page.route((u) => u.pathname.endsWith('/orders/o_x'), (r) => r.fulfill(json(order())))
    await page.route((u) => u.pathname.endsWith('/orders/o_x/accept'), (r) => {
      status = 'ACCEPTED'
      return r.fulfill(json(order()))
    })

    await page.goto('/order-detail?id=o_x&role=runner')
    await page.getByRole('button', { name: /接下這筆訂單/ }).click()

    await expect(page).toHaveURL(/order-tracking\?id=o_x/)
  })
})
