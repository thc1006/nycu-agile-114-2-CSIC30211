import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { login } from '../lib/api/auth'
import { ApiError } from '../lib/api/client'

const ROLE_KEY = 'campuseats.role'
type Role = 'orderer' | 'runner'

function homePath(role: Role): string {
  return role === 'runner' ? '/feed?role=runner' : '/dashboard?role=orderer'
}

/**
 * Real, API-wired login form (replaces the legacy mock script). Authenticates
 * against the backend via the typed api client, persists the per-session role
 * (UI mode, not a DB attribute — see #12 decision), and routes to the role home.
 */
export default function LoginForm() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(params.get('role') === 'runner' ? 'runner' : 'orderer')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = /.+@.+\..+/.test(email) && password.trim() !== ''

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return // re-entrancy guard: Enter fires submit even while the button is disabled
    setError('')
    if (!canSubmit) {
      setError('請輸入有效的學校 Email 與密碼')
      return
    }
    setSubmitting(true)
    try {
      await login({ email, password }) // persists the bearer token (ce_token)
      try {
        localStorage.setItem(ROLE_KEY, role)
      } catch {
        // storage unavailable (private mode) — role still applies via the URL
      }
      navigate(homePath(role))
    } catch (err) {
      // status 0 = transport failure (network/CORS) with an internal sentinel
      // detail; show the localized fallback, surface only real backend messages.
      setError(err instanceof ApiError && err.status !== 0 ? err.detail : '登入失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form id="loginForm" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="login-email">學校 Email</label>
        <input
          id="login-email" className="control" type="email" autoComplete="email"
          placeholder="you@campus.edu" value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="login-pw">密碼</label>
        <input
          id="login-pw" className="control" type="password" autoComplete="current-password"
          placeholder="輸入密碼" value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <fieldset className="role-pick" aria-label="選擇身份">
        <label className="role-opt">
          <input type="radio" name="role" value="orderer"
            checked={role === 'orderer'} onChange={() => setRole('orderer')} />
          <strong>訂餐者</strong>
          <span>發單請人帶餐</span>
        </label>
        <label className="role-opt">
          <input type="radio" name="role" value="runner"
            checked={role === 'runner'} onChange={() => setRole('runner')} />
          <strong>帶餐者</strong>
          <span>順路接單賺費</span>
        </label>
      </fieldset>

      {error && (
        <p id="login-error" role="alert" className="form-error">{error}</p>
      )}

      <button type="submit" className="btn btn-black btn--block btn--lg" disabled={submitting}>
        {submitting ? '登入中…' : '登入'}
      </button>
    </form>
  )
}
