import { describe, it, expect } from 'vitest'
import type { ComponentType } from 'react'
import { renderWithRouter } from '../test/renderWithRouter'

import LandingPage from './LandingPage'
import RegisterPage from './RegisterPage'
import LoginPage from './LoginPage'

// Fast jsdom axe smoke on the public entry funnel (the pages a logged-out user
// always sees first). color-contrast is disabled in setup because jsdom performs
// no layout. NOTE: comprehensive full-page a11y across ALL authenticated screens
// runs in the real browser via Playwright + axe-core (see e2e/a11y.spec.ts) —
// jsdom axe is too slow on the heavy legacy DOM of the interior pages and can't
// evaluate layout-dependent rules anyway, so that coverage lives at the e2e tier.
const entryPages: Array<{ name: string; Component: ComponentType; route: string }> = [
  { name: 'LandingPage', Component: LandingPage, route: '/' },
  { name: 'RegisterPage', Component: RegisterPage, route: '/register' },
  { name: 'LoginPage', Component: LoginPage, route: '/login' },
]

describe('entry pages have no axe accessibility violations', () => {
  it.each(entryPages)('$name', async ({ Component, route }) => {
    const { container } = renderWithRouter(<Component />, { route })
    await expect(container).toHaveNoViolations()
  })
})
