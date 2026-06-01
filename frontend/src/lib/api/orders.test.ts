import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import {
  acceptOrder,
  confirmOrder,
  createOrder,
  deliverOrder,
  getOrder,
  listOpenOrders,
  startOrder,
} from './orders'
import { setToken } from './client'

const API = 'http://localhost:8000'
const TOKEN = 'tok-orders'

const isAuthed = (request: Request) => request.headers.get('Authorization') === `Bearer ${TOKEN}`

const ORDER = {
  id: 'o_1',
  customer_id: 'u_c',
  runner_id: null,
  restaurant: '二餐',
  meal: '雞腿便當',
  pickup_location: '資工系館',
  expected_time: '2026-06-01T12:30:00+08:00',
  delivery_fee: 20,
  status: 'OPEN',
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
}

const server = setupServer(
  http.post(`${API}/orders`, ({ request }) =>
    isAuthed(request) ? HttpResponse.json(ORDER, { status: 201 }) : new HttpResponse(null, { status: 401 }),
  ),
  http.get(`${API}/orders/open`, ({ request }) =>
    isAuthed(request)
      ? HttpResponse.json([
          {
            id: 'o_1',
            restaurant: '二餐',
            meal_summary: '雞腿便當',
            pickup_location: '資工系館',
            expected_time: ORDER.expected_time,
            delivery_fee: 20,
            status: 'OPEN',
          },
        ])
      : new HttpResponse(null, { status: 401 }),
  ),
  http.get(`${API}/orders/o_1`, ({ request }) =>
    isAuthed(request) ? HttpResponse.json(ORDER) : new HttpResponse(null, { status: 401 }),
  ),
  ...['accept', 'start', 'deliver', 'confirm'].map((action) =>
    http.post(`${API}/orders/o_1/${action}`, ({ request }) =>
      isAuthed(request) ? HttpResponse.json(ORDER) : new HttpResponse(null, { status: 401 }),
    ),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  setToken(null)
})
afterAll(() => server.close())

describe('orders API client', () => {
  it('creates an order with the bearer token', async () => {
    setToken(TOKEN)
    const res = await createOrder({
      restaurant: '二餐',
      meal: '雞腿便當',
      pickup_location: '資工系館',
      expected_time: ORDER.expected_time,
      delivery_fee: 20,
    })
    expect(res.id).toBe('o_1')
  })

  it('lists open orders (runner feed)', async () => {
    setToken(TOKEN)
    const list = await listOpenOrders()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('o_1')
  })

  it('gets a single order', async () => {
    setToken(TOKEN)
    expect((await getOrder('o_1')).id).toBe('o_1')
  })

  it('drives all four status transitions with auth', async () => {
    setToken(TOKEN)
    for (const transition of [acceptOrder, startOrder, deliverOrder, confirmOrder]) {
      expect((await transition('o_1')).id).toBe('o_1')
    }
  })

  it('requires authentication (no token -> 401)', async () => {
    await expect(listOpenOrders()).rejects.toMatchObject({ status: 401 })
  })
})
