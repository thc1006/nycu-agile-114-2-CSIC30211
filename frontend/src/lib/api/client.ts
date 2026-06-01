// Minimal typed HTTP client for the CampusEats backend.
//
// Types come from `schema.d.ts`, which is GENERATED from docs/api/openapi.json
// (run `npm run gen:api` after the backend contract changes). We deliberately
// hand-roll the fetch layer instead of pulling a generic client lib so the code
// stays strict-typecheck-clean and dependency-light. Subsequent PRs migrate the
// legacy mock pages onto these calls (#12).

import type { components } from './schema'

/** All response/request DTOs from the OpenAPI contract. */
export type Schemas = components['schemas']

/** Base URL of the FastAPI backend; configured via Vite env, see .env.example. */
const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:8000').replace(/\/+$/, '')

const TOKEN_KEY = 'ce_token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable (e.g. private mode) — non-fatal for the request itself
  }
}

/** Thrown for any non-2xx response (or a network/CORS failure, with status 0). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(`API ${status}: ${detail}`)
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** JSON request body; serialized automatically. */
  body?: unknown
  /** Attach the stored bearer token (for authenticated endpoints). */
  auth?: boolean
  signal?: AbortSignal
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    // DNS / offline / CORS-blocked — normalize to a typed error
    throw new ApiError(0, 'network_error')
  }

  const text = await res.text()
  const data: unknown = text ? safeJson(text) : null

  if (!res.ok) {
    throw new ApiError(res.status, extractDetail(data) ?? res.statusText)
  }
  return data as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Pull a human-readable message out of FastAPI's error shapes. */
function extractDetail(data: unknown): string | null {
  if (!data || typeof data !== 'object' || !('detail' in data)) return null
  const detail = (data as { detail: unknown }).detail
  if (typeof detail === 'string') return detail
  // 422 validation errors arrive as a list of {loc, msg, type}
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    if (first && typeof first === 'object' && 'msg' in first) {
      return String((first as { msg: unknown }).msg)
    }
  }
  return null
}
