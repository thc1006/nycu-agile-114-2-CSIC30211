// Coverage for the API-wired inner page components (the orderer/runner loop).
// The api client and the session hook are mocked (no network, no MSW worker),
// mirroring the OrderTracking.test.tsx pattern: we assert each screen renders
// its server data and fires the right call on the primary action.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
  user: { id: 'u_buyer', email: 'me@test.com', name: '我' },
  currentRole: vi.fn(() => 'orderer' as 'orderer' | 'runner'),
  logout: vi.fn(),
  listOpenOrders: vi.fn(),
  listMyOrders: vi.fn(),
  getOrder: vi.fn(),
  acceptOrder: vi.fn(),
  cancelOrder: vi.fn(),
  createOrder: vi.fn(),
  getUserRating: vi.fn(),
  rateOrder: vi.fn(),
}))

vi.mock('react-router', async (orig) => {
  const actual = await orig<typeof import('react-router')>()
  return { ...actual, useNavigate: () => h.navigate }
})
vi.mock('../lib/session', async (orig) => {
  const actual = await orig<typeof import('../lib/session')>()
  return {
    ...actual,
    useRequireAuth: () => ({ user: h.user, loading: false }),
    currentRole: h.currentRole,
    useLogout: () => h.logout,
  }
})
vi.mock('../lib/api/orders', () => ({
  listOpenOrders: h.listOpenOrders,
  listMyOrders: h.listMyOrders,
  getOrder: h.getOrder,
  acceptOrder: h.acceptOrder,
  cancelOrder: h.cancelOrder,
  createOrder: h.createOrder,
}))
vi.mock('../lib/api/ratings', () => ({
  getUserRating: h.getUserRating,
  rateOrder: h.rateOrder,
}))

import Feed from './Feed'
import OrderDetail from './OrderDetail'
import MyOrders from './MyOrders'
import Dashboard from './Dashboard'
import PostOrder from './PostOrder'
import Rating from './Rating'
import Profile from './Profile'
import RunnerEarnings from './RunnerEarnings'
import OrdererReviews from './OrdererReviews'
import RunnerReviews from './RunnerReviews'

const fullOrder = (over: Record<string, unknown> = {}) => ({
  id: 'o_1',
  customer_id: 'u_buyer',
  runner_id: 'u_runner',
  restaurant: '二餐自助餐',
  meal: '排骨便當 ×1',
  pickup_location: '資工系館 1F',
  expected_time: '2026-06-10T12:30:00+08:00',
  delivery_fee: 20,
  status: 'OPEN',
  created_at: '2026-06-10T12:00:00+08:00',
  updated_at: '2026-06-10T12:06:00+08:00',
  ...over,
})
const openItem = (over: Record<string, unknown> = {}) => ({
  id: 'o_1',
  restaurant: '麥當勞清大店',
  meal_summary: '大麥克套餐',
  pickup_location: '綜合大樓門口',
  expected_time: '2026-06-10T12:30:00+08:00',
  delivery_fee: 30,
  status: 'OPEN',
  ...over,
})

function renderAt(ui: ReactElement, route = '/') {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  h.currentRole.mockReturnValue('orderer')
  localStorage.clear()
  h.listOpenOrders.mockResolvedValue([])
  h.listMyOrders.mockResolvedValue([])
  h.getOrder.mockResolvedValue(fullOrder())
  h.getUserRating.mockResolvedValue({ user_id: 'u_buyer', average: 0, count: 0 })
})

describe('Feed (runner)', () => {
  it('lists open orders from the API', async () => {
    h.listOpenOrders.mockResolvedValue([openItem()])
    renderAt(<Feed />, '/feed?role=runner')
    expect(await screen.findByText(/麥當勞清大店/)).toBeInTheDocument()
    expect(h.listOpenOrders).toHaveBeenCalled()
  })

  it('shows the empty state with no open orders', async () => {
    h.listOpenOrders.mockResolvedValue([])
    renderAt(<Feed />, '/feed?role=runner')
    expect(await screen.findByText(/目前沒有可接訂單/)).toBeInTheDocument()
  })
})

describe('OrderDetail (runner)', () => {
  it('loads the order and accepts it', async () => {
    h.getOrder.mockResolvedValue(fullOrder({ status: 'OPEN' }))
    h.acceptOrder.mockResolvedValue(fullOrder({ status: 'ACCEPTED' }))
    renderAt(<OrderDetail />, '/order-detail?id=o_1&role=runner')

    const accept = await screen.findByRole('button', { name: /接下這筆訂單/ })
    await userEvent.click(accept)
    await waitFor(() => expect(h.acceptOrder).toHaveBeenCalledWith('o_1'))
    expect(h.navigate).toHaveBeenCalledWith(expect.stringContaining('id=o_1'))
  })

  it('shows a not-found message without an id', async () => {
    renderAt(<OrderDetail />, '/order-detail?role=runner')
    expect(await screen.findByText(/找不到訂單/)).toBeInTheDocument()
  })
})

describe('MyOrders', () => {
  it('lists the customer orders for an orderer', async () => {
    h.currentRole.mockReturnValue('orderer')
    h.listMyOrders.mockResolvedValue([fullOrder({ status: 'COMPLETED' })])
    renderAt(<MyOrders />, '/my-orders?role=orderer')
    expect(await screen.findByText(/二餐自助餐/)).toBeInTheDocument()
    expect(h.listMyOrders).toHaveBeenCalledWith('customer')
  })

  it('lists the accepted orders for a runner', async () => {
    h.currentRole.mockReturnValue('runner')
    h.listMyOrders.mockResolvedValue([fullOrder({ status: 'DELIVERED' })])
    renderAt(<MyOrders />, '/my-orders?role=runner')
    await screen.findByText(/二餐自助餐/)
    expect(h.listMyOrders).toHaveBeenCalledWith('runner')
  })
})

describe('Dashboard (orderer)', () => {
  it('shows in-progress orders and can cancel an open one', async () => {
    h.listMyOrders.mockResolvedValue([fullOrder({ status: 'OPEN' })])
    h.cancelOrder.mockResolvedValue(fullOrder({ status: 'CANCELLED' }))
    renderAt(<Dashboard />, '/dashboard?role=orderer')

    const cancel = await screen.findByRole('button', { name: /取消訂單/ })
    await userEvent.click(cancel)
    await waitFor(() => expect(h.cancelOrder).toHaveBeenCalledWith('o_1'))
  })
})

describe('PostOrder (orderer)', () => {
  it('creates an order and routes to its tracking page', async () => {
    h.createOrder.mockResolvedValue(fullOrder({ id: 'o_new' }))
    renderAt(<PostOrder />, '/post-order?role=orderer')

    await userEvent.type(screen.getByLabelText(/餐廳/), '茶壜')
    await userEvent.type(screen.getByLabelText(/餐點內容/), '珍奶 ×1')
    await userEvent.selectOptions(screen.getByLabelText(/期望送達時間/), '12:30 前')
    await userEvent.click(screen.getByRole('button', { name: /發布帶餐需求/ }))

    await waitFor(() => expect(h.createOrder).toHaveBeenCalled())
    expect(h.navigate).toHaveBeenCalledWith(expect.stringContaining('id=o_new'))
  })
})

describe('Rating', () => {
  it('submits a one-time rating for a completed order', async () => {
    h.getOrder.mockResolvedValue(fullOrder({ status: 'COMPLETED' }))
    h.rateOrder.mockResolvedValue({
      order_id: 'o_1',
      rater_id: 'u_buyer',
      ratee_id: 'u_runner',
      stars: 5,
      created_at: '2026-06-10T13:00:00+08:00',
    })
    renderAt(<Rating />, '/rating?id=o_1&role=orderer')

    await userEvent.click(await screen.findByRole('radio', { name: /5 星/ }))
    await userEvent.click(screen.getByRole('button', { name: /送出評價/ }))
    await waitFor(() => expect(h.rateOrder).toHaveBeenCalledWith('o_1', { stars: 5 }))
    expect(await screen.findByText(/已送出評價/)).toBeInTheDocument()
  })
})

describe('Profile / Reviews / Earnings', () => {
  it('Profile shows the user and logs out', async () => {
    h.getUserRating.mockResolvedValue({ user_id: 'u_buyer', average: 4.5, count: 2 })
    renderAt(<Profile />, '/profile?role=orderer')
    expect(await screen.findByText(/me@test.com/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /登出/ }))
    expect(h.logout).toHaveBeenCalled()
  })

  it('OrdererReviews shows the aggregate rating', async () => {
    h.getUserRating.mockResolvedValue({ user_id: 'u_buyer', average: 4.8, count: 9 })
    renderAt(<OrdererReviews />, '/orderer-reviews?role=orderer')
    expect(await screen.findByText(/4.8/)).toBeInTheDocument()
  })

  it('RunnerReviews shows the aggregate rating', async () => {
    h.getUserRating.mockResolvedValue({ user_id: 'u_buyer', average: 4.2, count: 5 })
    renderAt(<RunnerReviews />, '/runner-reviews?role=runner')
    expect(await screen.findByText(/4.2/)).toBeInTheDocument()
  })

  it('RunnerEarnings totals completed runs', async () => {
    h.listMyOrders.mockResolvedValue([
      fullOrder({ status: 'COMPLETED', delivery_fee: 30 }),
      fullOrder({ id: 'o_2', status: 'COMPLETED', delivery_fee: 20, restaurant: '茶壜' }),
    ])
    renderAt(<RunnerEarnings />, '/runner-earnings?role=runner')
    expect(await screen.findByText(/二餐自助餐/)).toBeInTheDocument()
    expect(h.listMyOrders).toHaveBeenCalledWith('runner')
  })
})
