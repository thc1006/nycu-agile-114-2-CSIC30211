// Auth API surface (AG-001) — typed against the generated OpenAPI contract.
// These are the first real endpoints the UI will call; the legacy mock login
// (LoginPage.tsx) is replaced by `login()` here during the #12 migration.

import { apiFetch, setToken, type Schemas } from './client'

export type RegisterRequest = Schemas['RegisterRequest']
export type LoginRequest = Schemas['LoginRequest']
export type UserResponse = Schemas['UserResponse']
export type TokenResponse = Schemas['TokenResponse']
export type CurrentUser = Schemas['CurrentUserResponse']

/** POST /auth/register — create an account. */
export function register(input: RegisterRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>('/auth/register', { method: 'POST', body: input })
}

/** POST /auth/login — authenticate and persist the access token. */
export async function login(input: LoginRequest): Promise<TokenResponse> {
  const token = await apiFetch<TokenResponse>('/auth/login', { method: 'POST', body: input })
  setToken(token.access_token)
  return token
}

/** GET /auth/me — the authenticated user (requires a stored token). */
export function me(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>('/auth/me', { auth: true })
}

/** Clear the persisted session. */
export function logout(): void {
  setToken(null)
}
