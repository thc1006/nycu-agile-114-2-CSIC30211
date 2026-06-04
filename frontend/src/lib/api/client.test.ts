// Token persistence: sessionStorage is per-tab and wins on read so two roles can
// run in two tabs of the same browser without clobbering one shared token; the
// localStorage mirror keeps the user logged in across reloads / fresh tabs.
import { describe, it, expect } from 'vitest'
import { getToken, setToken } from './client'

describe('token storage (per-tab session)', () => {
  it('writes the token to both sessionStorage and localStorage', () => {
    setToken('tok')
    expect(sessionStorage.getItem('ce_token')).toBe('tok')
    expect(localStorage.getItem('ce_token')).toBe('tok')
  })

  it('prefers this tab’s sessionStorage token over the shared localStorage one', () => {
    localStorage.setItem('ce_token', 'other-tab')
    sessionStorage.setItem('ce_token', 'this-tab')
    expect(getToken()).toBe('this-tab')
  })

  it('falls back to localStorage when this tab has no session token', () => {
    localStorage.setItem('ce_token', 'resumed')
    expect(getToken()).toBe('resumed')
  })

  it('clears both stores on logout', () => {
    setToken('tok')
    setToken(null)
    expect(getToken()).toBeNull()
    expect(sessionStorage.getItem('ce_token')).toBeNull()
    expect(localStorage.getItem('ce_token')).toBeNull()
  })
})
