import { describe, it, expect, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App'

function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

function activeRoute(container: HTMLElement): string | null {
  return container.querySelector('[data-react-route]')?.getAttribute('data-react-route') ?? null
}

describe('App routing', () => {
  beforeEach(() => localStorage.clear())

  it('renders the index page at "/"', () => {
    const { container } = renderApp('/')
    expect(activeRoute(container)).toBe('/')
  })

  it('resolves legacy .html URLs to the same client route', async () => {
    const { container } = renderApp('/feed.html?role=runner')
    await waitFor(() => expect(activeRoute(container)).toBe('/feed'))
  })

  it('redirects unknown paths back to the index', async () => {
    const { container } = renderApp('/does-not-exist')
    await waitFor(() => expect(activeRoute(container)).toBe('/'))
  })
})

describe('App role guards (orderer / runner separation)', () => {
  beforeEach(() => localStorage.clear())

  it('lets a runner view the runner feed', async () => {
    const { container } = renderApp('/feed?role=runner')
    await waitFor(() => expect(activeRoute(container)).toBe('/feed'))
  })

  it('redirects an orderer away from the runner feed to their dashboard', async () => {
    const { container } = renderApp('/feed?role=orderer')
    await waitFor(() => expect(activeRoute(container)).toBe('/dashboard'))
  })

  it('redirects a runner away from the orderer dashboard to their feed', async () => {
    const { container } = renderApp('/dashboard?role=runner')
    await waitFor(() => expect(activeRoute(container)).toBe('/feed'))
  })

  it('lets an orderer view the post-order page', async () => {
    const { container } = renderApp('/post-order?role=orderer')
    await waitFor(() => expect(activeRoute(container)).toBe('/post-order'))
  })
})

describe('client-side link interception', () => {
  beforeEach(() => localStorage.clear())

  it('intercepts a legacy .html anchor and navigates within the SPA', async () => {
    const user = userEvent.setup()
    const { container } = renderApp('/')
    expect(activeRoute(container)).toBe('/')

    // The index page links to register.html; clicking it should route to
    // /register client-side (PageChrome.useLegacyLinks), not reload the page.
    const link = container.querySelector('a[href="register.html"]')
    expect(link).not.toBeNull()
    await user.click(link as Element)

    await waitFor(() => expect(activeRoute(container)).toBe('/register'))
  })
})
