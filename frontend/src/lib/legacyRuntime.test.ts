import { describe, it, expect, vi, afterEach } from 'vitest'
import { ensureCampusRuntime, runCampusInit } from './legacyRuntime'

interface CampusGo {
  go: (href: string, opts?: { replace?: boolean }) => void
}

describe('legacy runtime bootstrap', () => {
  it('installs the window.CampusEats global exactly once', () => {
    ensureCampusRuntime()
    const first = window.CampusEats
    expect(first).toBeDefined()
    ensureCampusRuntime()
    // Same singleton instance after a second call (idempotent install).
    expect(window.CampusEats).toBe(first)
  })

  it('exposes the documented helper surface', () => {
    ensureCampusRuntime()
    const ce = window.CampusEats as Record<string, unknown>
    for (const fn of ['getRole', 'setRole', 'home', 'withRole', 'fee', 'mountTopnav']) {
      expect(typeof ce[fn]).toBe('function')
    }
  })

  it('runCampusInit runs the DOM bootstrap without throwing', () => {
    document.body.innerHTML = '<div data-brand-mark></div>'
    expect(() => runCampusInit()).not.toThrow()
    // Favicon injection is one observable side effect of the bootstrap.
    expect(document.querySelector('link[rel="icon"]')).not.toBeNull()
  })

  it('binds the global Escape handler only once across repeated inits', () => {
    const w = window as unknown as { __campusEatsEscBound?: boolean }
    runCampusInit()
    runCampusInit()
    expect(w.__campusEatsEscBound).toBe(true)
  })

  it('defines the deferred init hook (the source transform applied)', () => {
    ensureCampusRuntime()
    // If the init-swap transform had silently no-op'd, this would be undefined
    // (and the runtime would have auto-run on import instead).
    expect(typeof window.__campusEatsInit).toBe('function')
  })
})

describe('CampusEats.go (SPA navigation hook)', () => {
  afterEach(() => {
    delete (window as unknown as { __campusNavigate?: unknown }).__campusNavigate
  })

  it('routes through window.__campusNavigate when the SPA hook is installed', () => {
    ensureCampusRuntime()
    const nav = vi.fn()
    window.__campusNavigate = nav
    ;(window.CampusEats as unknown as CampusGo).go('feed.html?role=runner', { replace: true })
    expect(nav).toHaveBeenCalledWith('feed.html?role=runner', { replace: true })
  })
})
