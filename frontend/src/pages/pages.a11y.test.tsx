import { describe, it, expect } from 'vitest'
import type { ComponentType } from 'react'
import { renderWithRouter } from '../test/renderWithRouter'

import IndexPage from './IndexPage'
import LandingPage from './LandingPage'
import RegisterPage from './RegisterPage'
import LoginPage from './LoginPage'

// Accessibility smoke check on the public entry funnel (the pages a logged-out
// user always sees first). Uses axe-core; color-contrast is disabled in setup
// because jsdom performs no layout.
const entryPages: Array<{ name: string; Component: ComponentType; route: string }> = [
  { name: 'IndexPage', Component: IndexPage, route: '/' },
  { name: 'LandingPage', Component: LandingPage, route: '/landing' },
  { name: 'RegisterPage', Component: RegisterPage, route: '/register' },
  { name: 'LoginPage', Component: LoginPage, route: '/login' },
]

describe('entry pages have no axe accessibility violations', () => {
  it.each(entryPages)('$name', async ({ Component, route }) => {
    const { container } = renderWithRouter(<Component />, { route })
    await expect(container).toHaveNoViolations()
  })
})
