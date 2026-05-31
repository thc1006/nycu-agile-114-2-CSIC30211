import { describe, it, expect, vi, afterEach } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithRouter } from '../test/renderWithRouter'
import { PageChrome } from './PageChrome'
import DashboardPage from './DashboardPage'
import ProfilePage from './ProfilePage'
import RatingPage from './RatingPage'
import PostOrderPage from './PostOrderPage'
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

  it('builds the rating widget as a keyboard radiogroup', () => {
    const { container } = renderWithRouter(<RatingPage />, {
      route: '/rating?role=orderer',
    })
    const group = container.querySelector('#starWidget')
    expect(group?.getAttribute('role')).toBe('radiogroup')
    const radios = group?.querySelectorAll('[role="radio"]')
    expect(radios?.length).toBe(5)
    expect(radios?.[0]?.getAttribute('aria-checked')).toBe('false')
  })

  it('wires the restaurant search as a combobox', () => {
    const { container } = renderWithRouter(<DashboardPage />, {
      route: '/dashboard?role=orderer',
    })
    const input = container.querySelector('#restSearch')
    expect(input?.getAttribute('role')).toBe('combobox')
    expect(input?.getAttribute('aria-expanded')).toBe('false')
    expect(input?.getAttribute('aria-controls')).toBeTruthy()
  })

  it('exposes toasts as an aria-live status region', () => {
    runCampusInit()
    w().toast('已上線')
    const wrap = document.querySelector('.toast-wrap')
    expect(wrap?.getAttribute('role')).toBe('status')
    expect(wrap?.getAttribute('aria-live')).toBe('polite')
  })

  it('moves focus into a dialog and restores it to the trigger on close', () => {
    const { container } = renderWithRouter(<DashboardPage />, {
      route: '/dashboard?role=orderer',
    })
    const trigger = container.querySelector('#locBtn') as HTMLElement
    trigger.focus()
    w().openSheet('locSheet')
    const sheet = document.getElementById('locSheet')!
    expect(sheet.contains(document.activeElement)).toBe(true)
    w().closeSheet('locSheet')
    expect(document.activeElement).toBe(trigger)
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

// ── Bug-fix regressions ────────────────────────────────────────────────────────
describe('regressions', () => {
  it('caps a menu line quantity at 8 (matches the fee rate card ceiling)', () => {
    const { container } = renderWithRouter(<PostOrderPage />, {
      route: '/post-order?role=orderer',
    })
    // Pick a restaurant with a menu so the menu picker appears, then add the same
    // item 12 times — the line qty must never exceed 8 (the fee/parseQty clamp).
    const restaurant = container.querySelector('#restaurant') as HTMLInputElement
    fireEvent.input(restaurant, { target: { value: '拉亞漢堡' } })
    const menuPick = container.querySelector('#menuPick') as HTMLSelectElement
    expect(menuPick).not.toBeNull()
    for (let i = 0; i < 12; i++) {
      menuPick.value = '0'
      fireEvent.change(menuPick)
    }
    const qty = container.querySelector('.chosen-row .qty span')
    expect(qty?.textContent).toBe('8')
  })

  it('profile pickup reflects the shared dropoff location store', () => {
    localStorage.setItem('campuseats.dropoff', '工學院 3F 走廊')
    const { container } = renderWithRouter(<ProfilePage />, {
      route: '/profile?role=orderer',
    })
    expect(container.querySelector('#pickupValOrderer')?.textContent).toBe('工學院 3F 走廊')
  })
})
