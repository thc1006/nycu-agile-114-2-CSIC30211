import { describe, it, expect, beforeEach } from 'vitest'
import { currentRole, isAuthenticated, actorRoleFor } from './session'
import { setToken } from './api/client'
import type { OrderResponse } from './api/orders'

const order = (over: Partial<OrderResponse> = {}): OrderResponse =>
  ({
    id: 'o_1',
    customer_id: 'u_buyer',
    runner_id: 'u_runner',
    restaurant: 'r',
    meal: 'm',
    pickup_location: 'p',
    expected_time: '2026-06-10T12:30:00+08:00',
    delivery_fee: 20,
    status: 'ACCEPTED',
    created_at: '2026-06-10T12:00:00+08:00',
    updated_at: '2026-06-10T12:06:00+08:00',
    ...over,
  }) as OrderResponse

beforeEach(() => {
  localStorage.clear()
})

describe('currentRole', () => {
  it('prefers the role in the query string', () => {
    expect(currentRole('?role=runner')).toBe('runner')
    expect(currentRole('?role=orderer')).toBe('orderer')
  })

  it('falls back to the stored role, then orderer', () => {
    expect(currentRole('?x=1')).toBe('orderer')
    localStorage.setItem('campuseats.role', 'runner')
    expect(currentRole('?x=1')).toBe('runner')
  })
})

describe('isAuthenticated', () => {
  it('reflects the presence of a stored token', () => {
    expect(isAuthenticated()).toBe(false)
    setToken('t')
    expect(isAuthenticated()).toBe(true)
    setToken(null)
    expect(isAuthenticated()).toBe(false)
  })
})

describe('actorRoleFor', () => {
  it('maps the user id to the side they are on', () => {
    expect(actorRoleFor(order(), 'u_buyer')).toBe('orderer')
    expect(actorRoleFor(order(), 'u_runner')).toBe('runner')
    expect(actorRoleFor(order(), 'u_other')).toBeNull()
    expect(actorRoleFor(order(), undefined)).toBeNull()
  })
})
