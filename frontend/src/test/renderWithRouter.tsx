import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import type { ReactElement } from 'react'

interface RenderOptions {
  /** Initial URL (including any `?role=` / `#hash`). */
  route?: string
  /** Route path pattern the element is mounted under (defaults to a wildcard). */
  path?: string
}

/**
 * Render a page component inside a MemoryRouter so react-router hooks
 * (useNavigate / useLocation) and the PageChrome wrapper work in tests.
 */
export function renderWithRouter(
  ui: ReactElement,
  { route = '/', path = '*' }: RenderOptions = {},
) {
  // Legacy inline scripts (and campus-web.js) read the REAL `window.location`,
  // which MemoryRouter does not control. Mirror the route onto window.location so
  // those scripts see the same `?role=`/`?id=` they would in the browser — without
  // this, e.g. HistoryDetailPage's owner-guard sees no id, redirects, and (under
  // the wildcard `path="*"`) re-mounts itself in an infinite navigation loop.
  window.history.replaceState({}, '', route)
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>,
  )
}
