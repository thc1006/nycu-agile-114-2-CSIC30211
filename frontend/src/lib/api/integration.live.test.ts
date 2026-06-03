// LIVE system-integration test: runs the ACTUAL api client modules against a
// REAL running backend (FastAPI + Redis), exercising the full transaction loop.
//
// Opt-in only: skipped unless LIVE_API is set, so the normal (MSW) suite and CI
// stay hermetic. Run against a real backend with:
//   LIVE_API=1 VITE_API_BASE=http://<backend>:8000 npx vitest run src/lib/api/integration.live.test.ts
// (When the backend shares the test container's network namespace, the client's
//  default base http://localhost:8000 already resolves to it — no VITE_API_BASE needed.)

import { describe, it, expect } from 'vitest'
import { register, login, me } from './auth'
import {
  createOrder, listOpenOrders, getOrder,
  acceptOrder, startOrder, deliverOrder, confirmOrder,
} from './orders'
import { rateOrder, getUserRating } from './ratings'
import { ApiError } from './client'

// This file runs under Node (vitest), where `process` exists at runtime. The
// app tsconfig omits @types/node (browser app), so declare just what we touch.
declare const process: { env: Record<string, string | undefined> }

const RUN = !!process.env.LIVE_API
const ts = Date.now()
const buyer = { email: `it-buyer-${ts}@example.com`, password: 'demo123', name: '小美' }
const runner = { email: `it-runner-${ts}@example.com`, password: 'demo123', name: '阿翔' }
const stranger = { email: `it-stranger-${ts}@example.com`, password: 'demo123', name: '路人' }

describe.skipIf(!RUN)('LIVE integration — full transaction loop against the real backend', () => {
  let buyerId = ''
  let runnerId = ''
  let orderId = ''

  it('AG-001 register both participants', async () => {
    buyerId = (await register(buyer)).id
    runnerId = (await register(runner)).id
    expect(buyerId).toMatch(/^u_/)
    expect(runnerId).toMatch(/^u_/)
  })

  it('AG-001 buyer logs in, /me round-trips the identity', async () => {
    await login(buyer)
    const who = await me()
    expect(who.id).toBe(buyerId)
    expect(who.email).toBe(buyer.email)
  })

  it('AG-002 buyer posts an order (status OPEN)', async () => {
    await login(buyer) // setup.ts clears localStorage between tests; re-auth
    const order = await createOrder({
      restaurant: '二餐', meal: '雞腿便當', pickup_location: '資工系館',
      expected_time: '2026-06-10T12:30:00+08:00', delivery_fee: 20,
    })
    orderId = order.id
    expect(order.status).toBe('OPEN')
    expect(order.customer_id).toBe(buyerId)
    expect(order.runner_id).toBeNull()
  })

  it('AG-003/004/005 runner sees it in the feed, then accept → start → deliver', async () => {
    await login(runner)
    const open = await listOpenOrders()
    expect(open.some((o) => o.id === orderId)).toBe(true)
    expect((await acceptOrder(orderId)).status).toBe('ACCEPTED')
    expect((await startOrder(orderId)).status).toBe('BUYING')
    expect((await deliverOrder(orderId)).status).toBe('DELIVERED')
  })

  it('IDOR (#10/#24): a non-participant cannot read the order', async () => {
    await register(stranger)
    await login(stranger)
    const err = await getOrder(orderId).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect([403, 404]).toContain((err as ApiError).status)
  })

  it('AG-006/007 orderer confirms receipt → COMPLETED, then both rate', async () => {
    await login(buyer)
    expect((await confirmOrder(orderId)).status).toBe('COMPLETED')
    const byBuyer = await rateOrder(orderId, { stars: 5 })
    expect(byBuyer.ratee_id).toBe(runnerId)
    expect(byBuyer.stars).toBe(5)
    await login(runner)
    const byRunner = await rateOrder(orderId, { stars: 4 })
    expect(byRunner.ratee_id).toBe(buyerId)
  })

  it('AG-007 per-user aggregates reflect the ratings', async () => {
    await login(buyer) // re-auth (token cleared between tests)
    const runnerAgg = await getUserRating(runnerId)
    expect(runnerAgg.count).toBe(1)
    expect(runnerAgg.average).toBe(5)
    const buyerAgg = await getUserRating(buyerId)
    expect(buyerAgg.count).toBe(1)
    expect(buyerAgg.average).toBe(4)
  })

  it('AG-007 the same user cannot rate the same order twice (409)', async () => {
    await login(runner)
    const err = await rateOrder(orderId, { stars: 3 }).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(409)
  })
})
