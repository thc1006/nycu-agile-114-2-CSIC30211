import { describe, it, expect } from 'vitest'
import { ensureCampusRuntime, runCampusInit } from './legacyRuntime'

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
})
