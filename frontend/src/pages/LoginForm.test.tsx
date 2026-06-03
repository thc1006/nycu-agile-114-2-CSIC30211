// TDD (RED first): the real wired login form. Drives LoginForm's contract —
// submit -> api login() -> persist session role -> navigate to the role home;
// surface a typed ApiError without navigating. The api client is mocked here
// (unit/component tier); the live client↔backend path is covered by
// src/lib/api/integration.live.test.ts.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ApiError } from '../lib/api/client'

const { navigate, loginFn, registerFn } = vi.hoisted(() => ({
  navigate: vi.fn(),
  loginFn: vi.fn(),
  registerFn: vi.fn(),
}))

vi.mock('react-router', async (orig) => {
  const actual = await orig<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigate }
})
vi.mock('../lib/api/auth', () => ({
  login: loginFn,
  register: registerFn,
  me: vi.fn(),
  logout: vi.fn(),
}))

import LoginForm from './LoginForm'

function renderForm(role?: 'orderer' | 'runner') {
  const path = role ? `/login?role=${role}` : '/login'
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LoginForm />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  navigate.mockClear()
  loginFn.mockReset()
  registerFn.mockReset()
  localStorage.clear()
})

describe('LoginForm — wired to the real API', () => {
  it('submits credentials to login() and routes to the orderer home', async () => {
    loginFn.mockResolvedValue({ access_token: 't', token_type: 'bearer' })
    renderForm('orderer')
    await userEvent.type(screen.getByLabelText(/email/i), 'ada@campus.edu')
    await userEvent.type(screen.getByLabelText(/密碼/), 'secret6')
    await userEvent.click(screen.getByRole('button', { name: /登入/ }))

    expect(loginFn).toHaveBeenCalledWith({ email: 'ada@campus.edu', password: 'secret6' })
    expect(localStorage.getItem('campuseats.role')).toBe('orderer')
    expect(navigate).toHaveBeenCalledWith('/dashboard?role=orderer')
  })

  it('routes to the runner home when the runner role is chosen', async () => {
    loginFn.mockResolvedValue({ access_token: 't', token_type: 'bearer' })
    renderForm('runner')
    await userEvent.type(screen.getByLabelText(/email/i), 'sam@campus.edu')
    await userEvent.type(screen.getByLabelText(/密碼/), 'secret6')
    await userEvent.click(screen.getByRole('button', { name: /登入/ }))

    expect(localStorage.getItem('campuseats.role')).toBe('runner')
    expect(navigate).toHaveBeenCalledWith('/feed?role=runner')
  })

  it('shows the API error detail and does NOT navigate on a 401', async () => {
    loginFn.mockRejectedValue(new ApiError(401, 'Invalid email or password'))
    renderForm('orderer')
    await userEvent.type(screen.getByLabelText(/email/i), 'ada@campus.edu')
    await userEvent.type(screen.getByLabelText(/密碼/), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /登入/ }))

    expect(await screen.findByText(/Invalid email or password/)).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('does not call login() when email/password are empty (client validation)', async () => {
    renderForm('orderer')
    await userEvent.click(screen.getByRole('button', { name: /登入/ }))
    expect(loginFn).not.toHaveBeenCalled()
    expect(await screen.findByText(/請輸入有效的學校 Email/)).toBeInTheDocument()
  })

  // Demo quick-login (course-demo convenience): ensure a shared demo account
  // exists (register, tolerating 409) then log in with the selected role.
  it('demo quick-login: ensures the demo account then logs in and routes by role', async () => {
    registerFn.mockResolvedValue({ id: 'u_demo', email: 'demo@campuseats.app', name: 'Demo 同學' })
    loginFn.mockResolvedValue({ access_token: 't', token_type: 'bearer' })
    renderForm('runner')
    await userEvent.click(screen.getByRole('button', { name: /使用測試帳號/ }))

    expect(loginFn).toHaveBeenCalledWith({ email: 'demo@campuseats.app', password: 'demo1234' })
    expect(localStorage.getItem('campuseats.role')).toBe('runner')
    expect(navigate).toHaveBeenCalledWith('/feed?role=runner')
  })

  it('demo quick-login tolerates an already-registered demo account (409)', async () => {
    registerFn.mockRejectedValue(new ApiError(409, 'Email already registered'))
    loginFn.mockResolvedValue({ access_token: 't', token_type: 'bearer' })
    renderForm('orderer')
    await userEvent.click(screen.getByRole('button', { name: /使用測試帳號/ }))

    expect(loginFn).toHaveBeenCalled() // 409 on register is swallowed; login still proceeds
    expect(navigate).toHaveBeenCalledWith('/dashboard?role=orderer')
  })
})
