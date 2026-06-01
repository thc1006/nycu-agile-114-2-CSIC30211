import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { getUserRating, rateOrder } from './ratings'
import { setToken } from './client'

const API = 'http://localhost:8000'
const TOKEN = 'tok-ratings'

const isAuthed = (request: Request) => request.headers.get('Authorization') === `Bearer ${TOKEN}`

const server = setupServer(
  http.post(`${API}/orders/o_1/ratings`, async ({ request }) => {
    if (!isAuthed(request)) return new HttpResponse(null, { status: 401 })
    const body = (await request.json()) as { stars: number }
    return HttpResponse.json(
      { order_id: 'o_1', rater_id: 'u_c', ratee_id: 'u_r', stars: body.stars },
      { status: 201 },
    )
  }),
  http.get(`${API}/users/u_r/rating`, ({ request }) =>
    isAuthed(request)
      ? HttpResponse.json({ user_id: 'u_r', average: 4.5, count: 2 })
      : new HttpResponse(null, { status: 401 }),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  setToken(null)
})
afterAll(() => server.close())

describe('ratings API client', () => {
  it('submits a star rating for an order', async () => {
    setToken(TOKEN)
    const res = await rateOrder('o_1', { stars: 5 })
    expect(res).toMatchObject({ order_id: 'o_1', stars: 5 })
  })

  it('fetches a user aggregate rating', async () => {
    setToken(TOKEN)
    const agg = await getUserRating('u_r')
    expect(agg).toEqual({ user_id: 'u_r', average: 4.5, count: 2 })
  })

  it('requires authentication (no token -> 401)', async () => {
    await expect(getUserRating('u_r')).rejects.toMatchObject({ status: 401 })
  })
})
