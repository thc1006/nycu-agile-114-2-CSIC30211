// TDD (RED first): the real wired registration form. Drives RegisterForm's
// contract — submit name/email/password -> api register() -> on success route
// to the login page; surface a 409 duplicate-email error without navigating. api client mocked.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ApiError } from '../lib/api/client'

const { navigate, registerFn } = vi.hoisted(() => ({ navigate: vi.fn(), registerFn: vi.fn() }))

vi.mock('react-router', async (orig) => {
  const actual = await orig<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigate }
})
vi.mock('../lib/api/auth', () => ({
  register: registerFn,
  login: vi.fn(),
  me: vi.fn(),
  logout: vi.fn(),
}))

import RegisterForm from './RegisterForm'

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterForm />
    </MemoryRouter>,
  )
}

async function fillValid() {
  await userEvent.type(screen.getByLabelText(/姓名/), '小美')
  await userEvent.type(screen.getByLabelText(/email/i), 'mei@campus.edu')
  await userEvent.type(screen.getByLabelText(/密碼/), 'secret6')
}

beforeEach(() => {
  navigate.mockClear()
  registerFn.mockReset()
  localStorage.clear()
})

describe('RegisterForm — wired to the real API', () => {
  it('submits name/email/password to register() and routes to login on success', async () => {
    registerFn.mockResolvedValue({ id: 'u_1', email: 'mei@campus.edu', name: '小美' })
    renderForm()
    await fillValid()
    await userEvent.click(screen.getByRole('button', { name: /註冊|建立帳號/ }))

    expect(registerFn).toHaveBeenCalledWith({ email: 'mei@campus.edu', password: 'secret6', name: '小美' })
    expect(navigate).toHaveBeenCalledWith('/login')
  })

  it('shows the 409 duplicate-email error and does NOT navigate', async () => {
    registerFn.mockRejectedValue(new ApiError(409, 'Email already registered'))
    renderForm()
    await fillValid()
    await userEvent.click(screen.getByRole('button', { name: /註冊|建立帳號/ }))

    expect(await screen.findByText(/Email already registered/)).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('does not submit when required fields are empty', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /註冊|建立帳號/ }))
    expect(registerFn).not.toHaveBeenCalled()
    expect(await screen.findByText(/請填寫姓名/)).toBeInTheDocument()
  })
})
