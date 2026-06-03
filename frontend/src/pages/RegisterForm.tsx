import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { register } from '../lib/api/auth'
import { ApiError } from '../lib/api/client'

/**
 * Real, API-wired registration form (replaces the legacy role-picker links).
 * Creates an account in the backend via the typed api client, then routes to
 * login. Role is NOT collected here — it is a per-session UI choice made at
 * login (see #12 decision), not a stored account attribute.
 */
export default function RegisterForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = name.trim() !== '' && /.+@.+\..+/.test(email) && password.length >= 6

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!canSubmit) {
      setError('請填寫姓名、有效的學校 Email,密碼至少 6 碼')
      return
    }
    setSubmitting(true)
    try {
      await register({ email, password, name })
      navigate('/login')
    } catch (err) {
      // status 0 = transport failure (network/CORS) with an internal sentinel
      // detail; show the localized fallback, surface only real backend messages.
      setError(err instanceof ApiError && err.status !== 0 ? err.detail : '註冊失敗,請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form id="registerForm" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="reg-name">姓名</label>
        <input
          id="reg-name" className="control" autoComplete="name"
          value={name} onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="reg-email">學校 Email</label>
        <input
          id="reg-email" className="control" type="email" autoComplete="email"
          placeholder="you@campus.edu" value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="reg-pw">密碼</label>
        <input
          id="reg-pw" className="control" type="password" autoComplete="new-password"
          placeholder="至少 6 碼" value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p id="register-error" role="alert" className="form-error">{error}</p>
      )}

      <button type="submit" className="btn btn-black btn--block btn--lg" disabled={submitting}>
        {submitting ? '建立中…' : '註冊'}
      </button>
    </form>
  )
}
