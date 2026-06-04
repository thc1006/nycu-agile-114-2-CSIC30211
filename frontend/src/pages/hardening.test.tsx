import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderWithRouter } from '../test/renderWithRouter'
import { PageChrome } from './PageChrome'
import DashboardPage from './DashboardPage'
import { runCampusInit } from '../lib/legacyRuntime'

type SheetApi = {
  openSheet: (id: string) => void
  closeSheet: (id: string) => void
  toast: (msg: string, opts?: unknown) => void
}
const w = () => window as unknown as SheetApi & { __campusNavigate?: unknown }

// ── Wrapper robustness (regressions for the Function()-based runtime) ──────────
describe('wrapper resilience', () => {
  it('keeps static content rendered when an inline script throws', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = renderWithRouter(
      <PageChrome
        pageId="my-orders"
        title="測試 · CampusEats"
        bodyAttrs={{}}
        scripts={["throw new Error('boom')"]}
      >
        <div data-testid="content">內容</div>
      </PageChrome>,
      { route: '/my-orders?role=orderer' },
    )
    // The page degrades gracefully: content + route marker survive the throw.
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
    expect(container.querySelector('[data-react-route]')).not.toBeNull()
    expect(err).toHaveBeenCalled()
    err.mockRestore()
  })

  it('does not crash when localStorage throws (private mode / disabled storage)', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('SecurityError')
      })
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('SecurityError')
      })
    const { container } = renderWithRouter(<DashboardPage />, {
      route: '/dashboard?role=orderer',
    })
    expect(container.querySelector('[data-react-route]')).not.toBeNull()
    getItem.mockRestore()
    setItem.mockRestore()
  })

  it('installs the SPA navigation hook on mount', () => {
    renderWithRouter(<DashboardPage />, { route: '/dashboard?role=orderer' })
    expect(typeof w().__campusNavigate).toBe('function')
  })
})

// ── Accessibility behaviours added in this pass ────────────────────────────────
describe('accessibility interactions', () => {
  afterEach(() => {
    document.querySelectorAll('.toast-wrap, .scrim').forEach((n) => n.remove())
  })

  it('exposes toasts as an aria-live status region', () => {
    runCampusInit()
    w().toast('已上線')
    const wrap = document.querySelector('.toast-wrap')
    expect(wrap?.getAttribute('role')).toBe('status')
    expect(wrap?.getAttribute('aria-live')).toBe('polite')
  })

  it('renders a skip link pointing at the page main landmark', () => {
    const { container } = renderWithRouter(<DashboardPage />, {
      route: '/dashboard?role=orderer',
    })
    const skip = container.querySelector('.skip-link')
    expect(skip?.getAttribute('href')).toBe('#main')
    expect(container.querySelector('#main')).not.toBeNull()
  })
})

// ── SPA navigation chrome ──────────────────────────────────────────────────────
describe('SPA navigation chrome', () => {
  afterEach(() => {
    document.querySelectorAll('[data-topnav-bottom]').forEach((n) => n.remove())
  })

  it('intercepts the body-mounted phone bottom-nav so mobile taps stay client-side', () => {
    renderWithRouter(<DashboardPage />, { route: '/dashboard?role=orderer' })

    // The legacy runtime mirrors the role nav as a phone bottom-bar appended to
    // <body> (a SIBLING of .app-shell), shown below the desktop breakpoint where
    // it is the only primary navigation. A root-scoped click listener never sees
    // it, so its taps used to trigger a full document reload instead of an SPA
    // transition. The interceptor is delegated on `document` to fix that.
    const bottomNav = document.querySelector('[data-topnav-bottom]')
    expect(bottomNav).not.toBeNull()
    expect(bottomNav?.parentElement).toBe(document.body)

    const link = bottomNav?.querySelector('a[href*="post-order"]') as HTMLAnchorElement
    expect(link).not.toBeNull()

    // A plain primary click must be intercepted (preventDefault) and handed to
    // react-router — NOT left to fall through to a full document navigation.
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})
