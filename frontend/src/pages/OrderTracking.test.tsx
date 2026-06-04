// TDD (RED first): the real wired order-tracking view. Drives OrderTracking's
// contract — load the order by ?id= via getOrder(), render a status timeline,
// and let the right party advance the FSM (runner: accept/start/deliver,
// orderer: confirm) with a re-fetch; with no id, offer a self-contained demo
// order. The api client is mocked here; the live path is the integration test.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

const { navigate, getOrderFn, createOrderFn, acceptFn, startFn, deliverFn, confirmFn } = vi.hoisted(() => ({
  navigate: vi.fn(),
  getOrderFn: vi.fn(),
  createOrderFn: vi.fn(),
  acceptFn: vi.fn(),
  startFn: vi.fn(),
  deliverFn: vi.fn(),
  confirmFn: vi.fn(),
}))

vi.mock('react-router', async (orig) => {
  const actual = await orig<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigate }
})
vi.mock('../lib/api/orders', () => ({
  getOrder: getOrderFn,
  createOrder: createOrderFn,
  acceptOrder: acceptFn,
  startOrder: startFn,
  deliverOrder: deliverFn,
  confirmOrder: confirmFn,
}))

import OrderTracking from './OrderTracking'

function renderTracking(query: string) {
  return render(
    <MemoryRouter initialEntries={[`/order-tracking${query}`]}>
      <OrderTracking />
    </MemoryRouter>,
  )
}

const makeOrder = (over: Record<string, unknown> = {}) => ({
  id: 'o_1',
  customer_id: 'u_buyer',
  runner_id: 'u_runner',
  restaurant: '二餐自助',
  meal: '雞腿便當 ×1',
  pickup_location: '資工系館',
  expected_time: '2026-06-10T12:30:00+08:00',
  delivery_fee: 20,
  status: 'ACCEPTED',
  created_at: '2026-06-10T12:00:00+08:00',
  updated_at: '2026-06-10T12:06:00+08:00',
  ...over,
})

beforeEach(() => {
  navigate.mockClear()
  getOrderFn.mockReset()
  createOrderFn.mockReset()
  acceptFn.mockReset()
  startFn.mockReset()
  deliverFn.mockReset()
  confirmFn.mockReset()
  localStorage.clear()
})

describe('OrderTracking — wired to the real API', () => {
  it('loads the order by id and shows its details + a role-appropriate action', async () => {
    getOrderFn.mockResolvedValue(makeOrder({ status: 'ACCEPTED' }))
    renderTracking('?id=o_1&role=runner')

    await waitFor(() => expect(getOrderFn).toHaveBeenCalledWith('o_1'))
    expect(await screen.findByText('二餐自助')).toBeInTheDocument()
    // runner at ACCEPTED can begin buying
    expect(screen.getByRole('button', { name: '開始購買' })).toBeInTheDocument()
  })

  it('runner advances the status (start buying) and re-fetches', async () => {
    getOrderFn.mockResolvedValue(makeOrder({ status: 'ACCEPTED' }))
    startFn.mockResolvedValue(makeOrder({ status: 'BUYING' }))
    renderTracking('?id=o_1&role=runner')

    await userEvent.click(await screen.findByRole('button', { name: '開始購買' }))
    await waitFor(() => expect(startFn).toHaveBeenCalledWith('o_1'))
    // after BUYING the next runner action is "標記已送達"
    expect(await screen.findByRole('button', { name: '標記已送達' })).toBeInTheDocument()
  })

  it('orderer confirms receipt once the order is delivered', async () => {
    getOrderFn.mockResolvedValue(makeOrder({ status: 'DELIVERED' }))
    confirmFn.mockResolvedValue(makeOrder({ status: 'COMPLETED' }))
    renderTracking('?id=o_1&role=orderer')

    await userEvent.click(await screen.findByRole('button', { name: '確認收餐' }))
    await waitFor(() => expect(confirmFn).toHaveBeenCalledWith('o_1'))
  })

  it('with no id, creating a demo order routes to its own tracking url', async () => {
    createOrderFn.mockResolvedValue(makeOrder({ id: 'o_new', status: 'OPEN' }))
    renderTracking('?role=orderer')

    await userEvent.click(await screen.findByRole('button', { name: /建立示範訂單/ }))
    await waitFor(() => expect(createOrderFn).toHaveBeenCalled())
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('id=o_new')))
    expect(getOrderFn).not.toHaveBeenCalled() // no id on this render → no fetch
  })
})
