// Integration-tier tests for the API client: the network boundary is mocked with
// MSW (handlers shaped to the real OpenAPI contract), so these exercise request
// building, token persistence, and error handling WITHOUT a running backend — the
// layer the PR-review flagged as missing. When the real backend is reachable in
// CI, a thin smoke suite can run the same flows against it.

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { login, register, me, logout } from './auth'
import { getToken, setToken } from './client'

const API = 'http://localhost:8000' // matches the client's default VITE_API_BASE

const server = setupServer(
  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string; name: string }
    return HttpResponse.json({ id: 'u1', email: body.email, name: body.name }, { status: 201 })
  }),
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.password === 'correct-horse') {
      return HttpResponse.json({ access_token: 'tok-123', token_type: 'bearer' })
    }
    return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 })
  }),
  http.get(`${API}/auth/me`, ({ request }) => {
    return request.headers.get('Authorization') === 'Bearer tok-123'
      ? HttpResponse.json({ id: 'u1', email: 'ada@campus.edu', name: 'Ada' })
      : HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  logout()
})
afterAll(() => server.close())

describe('auth API client', () => {
  it('registers a user and returns the created profile', async () => {
    const user = await register({ email: 'new@campus.edu', password: 'secret6', name: 'New' })
    expect(user).toEqual({ id: 'u1', email: 'new@campus.edu', name: 'New' })
  })

  it('logs in and persists the access token', async () => {
    const res = await login({ email: 'ada@campus.edu', password: 'correct-horse' })
    expect(res.access_token).toBe('tok-123')
    expect(getToken()).toBe('tok-123')
  })

  it('surfaces a wrong-password failure as a typed 401 ApiError and stores no token', async () => {
    await expect(login({ email: 'ada@campus.edu', password: 'wrong' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      detail: 'Invalid credentials',
    })
    expect(getToken()).toBeNull()
  })

  it('sends the stored bearer token on authenticated calls (/auth/me)', async () => {
    await login({ email: 'ada@campus.edu', password: 'correct-horse' })
    const user = await me()
    expect(user.email).toBe('ada@campus.edu')
  })

  it('rejects /auth/me with no token (401)', async () => {
    await expect(me()).rejects.toMatchObject({ status: 401 })
  })

  it('extracts the first message from a 422 validation error list', async () => {
    server.use(
      http.post(`${API}/auth/register`, () =>
        HttpResponse.json(
          { detail: [{ loc: ['body', 'password'], msg: 'String should have at least 6 characters', type: 'value_error' }] },
          { status: 422 },
        ),
      ),
    )
    await expect(
      register({ email: 'x@campus.edu', password: 'short', name: 'X' }),
    ).rejects.toMatchObject({ status: 422, detail: 'String should have at least 6 characters' })
  })

  it('normalizes a network/CORS failure to ApiError status 0', async () => {
    server.use(http.get(`${API}/auth/me`, () => HttpResponse.error()))
    logout()
    setToken('tok-123-present-so-request-fires')
    await expect(me()).rejects.toMatchObject({ name: 'ApiError', status: 0, detail: 'network_error' })
  })
})
