import { describe, it, expect, beforeEach } from 'vitest'
import { ensureCampusRuntime } from './legacyRuntime'

// Minimal typed view of the parts of window.CampusEats we exercise here.
interface FeePart {
  label: string
  amount: number
}
interface FeeResult {
  qty: number
  urgency: string
  total: number
  parts: FeePart[]
}
interface Restaurant {
  name: string
  cat: string
  hot: boolean
}
interface CampusEatsRuntime {
  getRole(): 'orderer' | 'runner'
  setRole(role: string): void
  roleLabel(role?: string): string
  home(role?: string): string
  withRole(href: string, role?: string): string
  fee(opts: { qty?: number; urgency?: string }): FeeResult
  parseQty(text: string): number
  urgencyOf(timeStr: string): string
  searchRestaurants(q: string): Restaurant[]
  getMenu(name: string): FeePart[] | null
  recentSearches(): string[]
  pushRecent(name: string): void
  clearRecent(): void
}

function ce(): CampusEatsRuntime {
  ensureCampusRuntime()
  return (window as unknown as { CampusEats: CampusEatsRuntime }).CampusEats
}

describe('fee calculation (the rate card handles money — highest priority)', () => {
  it('charges the base fee for a single item with no urgency', () => {
    const result = ce().fee({ qty: 1, urgency: 'normal' })
    expect(result.total).toBe(15)
    expect(result.parts).toEqual([{ label: '基本帶餐費', amount: 15 }])
  })

  it('adds NT$3 per extra item', () => {
    const result = ce().fee({ qty: 3, urgency: 'normal' })
    // 15 base + (3-1)*3 portion
    expect(result.total).toBe(21)
    expect(result.parts.some((p) => p.amount === 6)).toBe(true)
  })

  it('adds the rush surcharge (NT$8)', () => {
    expect(ce().fee({ qty: 1, urgency: 'rush' }).total).toBe(23)
  })

  it('adds the peak surcharge (NT$5)', () => {
    expect(ce().fee({ qty: 1, urgency: 'peak' }).total).toBe(20)
  })

  it('stacks portion and surge: qty 2 at peak = 15 + 3 + 5', () => {
    expect(ce().fee({ qty: 2, urgency: 'peak' }).total).toBe(23)
  })

  it('clamps quantity to the 1–8 range', () => {
    expect(ce().fee({ qty: 0 }).qty).toBe(1)
    expect(ce().fee({ qty: 99 }).qty).toBe(8)
  })
})

describe('parseQty', () => {
  it('defaults to 1 for empty input', () => {
    expect(ce().parseQty('')).toBe(1)
  })

  it('sums ×N multipliers across items', () => {
    expect(ce().parseQty('原味蛋餅 ×1、奶茶（中）×1')).toBe(2)
    expect(ce().parseQty('便當 ×3')).toBe(3)
  })

  it('clamps the parsed quantity to a maximum of 8', () => {
    expect(ce().parseQty('湯 ×20')).toBe(8)
  })
})

describe('urgencyOf', () => {
  it('classifies "越快越好" / 30-minute windows as rush', () => {
    expect(ce().urgencyOf('越快越好（30 分鐘內）')).toBe('rush')
  })

  it('classifies peak lunch windows as peak', () => {
    expect(ce().urgencyOf('11:30 前')).toBe('peak')
    expect(ce().urgencyOf('12:30 前')).toBe('peak')
  })

  it('classifies everything else as normal', () => {
    expect(ce().urgencyOf('14:00 前')).toBe('normal')
    expect(ce().urgencyOf('')).toBe('normal')
  })
})

describe('role helpers (orderer / runner separation)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and normalizes the active role', () => {
    const c = ce()
    c.setRole('runner')
    expect(c.getRole()).toBe('runner')
    c.setRole('garbage')
    expect(c.getRole()).toBe('orderer')
  })

  it('returns the correct home page per role', () => {
    const c = ce()
    expect(c.home('runner')).toBe('feed.html?role=runner')
    expect(c.home('orderer')).toBe('dashboard.html?role=orderer')
  })

  it('labels roles in Chinese', () => {
    const c = ce()
    expect(c.roleLabel('runner')).toBe('帶餐者')
    expect(c.roleLabel('orderer')).toBe('訂餐者')
  })

  it('appends the role to internal links but leaves external/anchor links alone', () => {
    const c = ce()
    expect(c.withRole('post-order.html', 'orderer')).toBe('post-order.html?role=orderer')
    expect(c.withRole('my-orders.html?tab=1', 'runner')).toBe('my-orders.html?tab=1&role=runner')
    expect(c.withRole('https://example.com', 'runner')).toBe('https://example.com')
    expect(c.withRole('#top', 'runner')).toBe('#top')
  })
})

describe('restaurant search + menus', () => {
  it('returns only hot restaurants for an empty query', () => {
    const hot = ce().searchRestaurants('')
    expect(hot.length).toBeGreaterThan(0)
    expect(hot.every((r) => r.hot)).toBe(true)
  })

  it('ranks a name prefix match first', () => {
    expect(ce().searchRestaurants('拉亞')[0].name).toBe('拉亞漢堡')
  })

  it('returns a menu for hot restaurants and null otherwise', () => {
    const c = ce()
    expect(Array.isArray(c.getMenu('拉亞漢堡'))).toBe(true)
    expect(c.getMenu('SUBWAY')).toBeNull()
    expect(c.getMenu('')).toBeNull()
  })
})

describe('recent searches persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores most-recent-first, de-duplicates, and clears', () => {
    const c = ce()
    expect(c.recentSearches()).toEqual([])
    c.pushRecent('茶壜')
    c.pushRecent('漢堡王')
    c.pushRecent('茶壜')
    expect(c.recentSearches()).toEqual(['茶壜', '漢堡王'])
    c.clearRecent()
    expect(c.recentSearches()).toEqual([])
  })
})
