// Shared session helpers for the API-wired pages (AG-001 auth gating).
//
// The backend has no role concept — `role` is a per-login UI mode kept in
// localStorage and the URL `?role=`. Authentication is the JWT in `ce_token`.
// These helpers let every wired page (a) bounce anonymous users to /login and
// (b) know who the current user is, so "am I the customer or the runner on this
// order?" is derived from the server's customer_id/runner_id, not the URL.

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { getToken, ApiError } from './api/client'
import { me, logout as clearToken, type CurrentUser } from './api/auth'
import type { OrderResponse } from './api/orders'

export type UiRole = 'orderer' | 'runner'

const ROLE_KEY = 'campuseats.role'

/** The current UI role from the URL (preferred) or localStorage; defaults orderer. */
export function currentRole(search?: string): UiRole {
  const fromUrl = new URLSearchParams(search ?? window.location.search).get('role')
  if (fromUrl === 'runner' || fromUrl === 'orderer') return fromUrl
  try {
    return localStorage.getItem(ROLE_KEY) === 'runner' ? 'runner' : 'orderer'
  } catch {
    return 'orderer'
  }
}

/** True if a token is present (cheap, synchronous gate before any fetch). */
export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

/** Clear the session and return to the login page. */
export function useLogout(): () => void {
  const navigate = useNavigate()
  return () => {
    clearToken()
    navigate('/login', { replace: true })
  }
}

interface AuthState {
  user: CurrentUser | null
  loading: boolean
}

/**
 * Gate a page behind a valid session. With no token, or a token the server
 * rejects (401), redirect to /login. Returns the authenticated user once known
 * so the page can personalise and compute the actor role.
 */
export function useRequireAuth(): AuthState {
  const navigate = useNavigate()
  const location = useLocation()
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    let alive = true
    if (!getToken()) {
      // Guard against re-navigating when we're already on /login. Without this,
      // a test harness that mounts a single page at path="*" would re-render the
      // same gated page at /login and loop (PageChrome re-keys its subtree on
      // each navigation, remounting this hook). In the real app /login renders
      // LoginPage, so the redirect happens exactly once.
      if (location.pathname !== '/login') navigate('/login', { replace: true })
      return
    }
    void me()
      .then((user) => {
        if (alive) setState({ user, loading: false })
      })
      .catch((err) => {
        if (!alive) return
        // An expired/invalid token is the only auth failure we redirect on; a
        // transient network error should not eject the user mid-session.
        if (err instanceof ApiError && err.status === 401) {
          clearToken()
          navigate('/login', { replace: true })
        } else {
          setState({ user: null, loading: false })
        }
      })
    return () => {
      alive = false
    }
  }, [navigate, location.pathname])

  return state
}

/** Which side of this order the given user is on (or null if not a participant). */
export function actorRoleFor(order: OrderResponse, userId: string | undefined): UiRole | null {
  if (!userId) return null
  if (order.customer_id === userId) return 'orderer'
  if (order.runner_id === userId) return 'runner'
  return null
}
