import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { clientPathFromLegacyHref, routePathForPage, type PageId } from '../lib/legacyRoutes'
import { runCampusInit } from '../lib/legacyRuntime'

const ROLE_KEY = 'campuseats.role'
type Role = 'orderer' | 'runner'

const pageRoleGuard: Partial<Record<PageId, Role>> = {
  dashboard: 'orderer',
  'post-order': 'orderer',
  'orderer-reviews': 'orderer',
  feed: 'runner',
  'order-detail': 'runner',
  'runner-earnings': 'runner',
  'runner-reviews': 'runner',
}

// The landing page already renders its own <footer class="foot">. Adding the
// shared app footer there would create a second contentinfo landmark, so it
// opts out and the rest of the app gets the shared footer.
const pagesWithOwnFooter = new Set<PageId>(['landing'])

function normalizeRole(value: string | null): Role {
  return value === 'runner' ? 'runner' : 'orderer'
}

function syncRoleFromLocation(search: string): Role {
  const params = new URLSearchParams(search)
  const roleFromUrl = params.get('role')

  // localStorage can throw (Safari private mode, disabled storage, quota). The
  // legacy runtime guards every access; mirror that here so the guard effect
  // never crashes the page over an unavailable store.
  let stored: string | null = null
  try {
    stored = localStorage.getItem(ROLE_KEY)
  } catch {
    stored = null
  }

  const role = normalizeRole(roleFromUrl ?? stored)

  if (roleFromUrl === 'runner' || roleFromUrl === 'orderer') {
    try {
      localStorage.setItem(ROLE_KEY, role)
    } catch {
      // Storage unavailable — role still resolves for this navigation.
    }
  }

  return role
}

function homePath(role: Role) {
  return role === 'runner' ? '/feed?role=runner' : '/dashboard?role=orderer'
}

function removeLegacyChrome() {
  document.querySelectorAll('[data-topnav-bottom], .toast-wrap, .scrim').forEach((node) => {
    node.remove()
  })
  document.body.classList.remove('has-bottom-nav')
}

function applyBodyAttributes(bodyAttrs: Record<string, string>) {
  document.body.removeAttribute('data-od-id')
  Object.entries(bodyAttrs).forEach(([name, value]) => {
    document.body.setAttribute(name, value)
  })
}

function executeInlineScripts(pageId: PageId, scripts: readonly string[]) {
  scripts.forEach((script, index) => {
    Function(`${script}\n//# sourceURL=${pageId}-effect-${index}.js`)()
  })
}

function useLegacyLinks(rootRef: RefObject<HTMLElement | null>, resetKey: string) {
  const navigate = useNavigate()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const anchor = (event.target as Element | null)?.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute('download')) return

      const clientPath = clientPathFromLegacyHref(anchor.getAttribute('href') ?? '')
      if (!clientPath) return

      event.preventDefault()
      navigate(clientPath)
    }

    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [navigate, resetKey, rootRef])
}

interface PageChromeProps {
  pageId: PageId
  title: string
  bodyAttrs: Record<string, string>
  scripts?: readonly string[]
  children: ReactNode
}

export function PageChrome({ pageId, title, bodyAttrs, scripts = [], children }: PageChromeProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const scriptsRanForKey = useRef<string | null>(null)
  const renderKey = useMemo(() => `${pageId}:${location.key}:${location.search}`, [location.key, location.search, pageId])

  useLegacyLinks(rootRef, renderKey)

  useEffect(() => {
    // Install the SPA navigation hook before any legacy code runs so imperative
    // navigations (CampusEats.go / guard / search-select / page CTAs) route
    // through react-router instead of forcing a full document reload.
    window.__campusNavigate = (href, opts) => {
      const clientPath = clientPathFromLegacyHref(href)
      if (clientPath) {
        navigate(clientPath, opts?.replace ? { replace: true } : undefined)
      } else if (opts?.replace) {
        window.location.replace(href)
      } else {
        window.location.href = href
      }
    }

    const role = syncRoleFromLocation(location.search)
    const requiredRole = pageRoleGuard[pageId]

    if (requiredRole && role !== requiredRole) {
      navigate(homePath(role), { replace: true })
      return
    }

    document.title = title
    applyBodyAttributes(bodyAttrs)
    removeLegacyChrome()

    // The legacy runtime and each page's inline scripts run via Function(). A
    // throw here (e.g. a renamed element id, storage failure) must not blank the
    // whole SPA — the JSX is already rendered, so we degrade to static content
    // and surface the error rather than letting it escape the effect.
    try {
      runCampusInit()
    } catch (err) {
      console.error(`[CampusEats] runtime init failed on "${pageId}":`, err)
    }

    // Execute each page's legacy inline scripts exactly once per mounted route
    // instance (keyed by renderKey, which the root <div> below is also keyed on).
    // React StrictMode double-invokes effects in development, and a hash-only
    // navigation re-runs this effect without remounting the route container.
    // Without this guard, append-style scripts (timeline steps, rating tags,
    // reputation cells) would duplicate their injected DOM and stack listeners.
    // The key is marked BEFORE executing so a throwing script is never retried
    // (which would duplicate the side effects it ran before the throw).
    if (scriptsRanForKey.current !== renderKey) {
      scriptsRanForKey.current = renderKey
      try {
        executeInlineScripts(pageId, scripts)
      } catch (err) {
        console.error(`[CampusEats] inline script failed on "${pageId}":`, err)
      }
    }

    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      target?.scrollIntoView()
    } else {
      window.scrollTo({ top: 0, left: 0 })
    }

    return removeLegacyChrome
  }, [bodyAttrs, location.hash, location.key, location.search, navigate, pageId, renderKey, scripts, title])

  return (
    <div key={renderKey} ref={rootRef} className="app-shell" data-react-route={routePathForPage(pageId)}>
      <a className="skip-link" href="#main">跳到主要內容</a>
      {children}
      {!pagesWithOwnFooter.has(pageId) && (
        <footer className="site-footer">
          <div className="site-footer__inner">
            <div className="site-footer__brand">
              <span className="site-footer__mark">CampusEats</span>
              <span className="site-footer__tag">校園帶餐媒合 · 順路的同學幫你帶</span>
            </div>
            <nav className="site-footer__nav" aria-label="頁尾連結">
              <button type="button" onClick={(event) => event.preventDefault()}>關於我們</button>
              <button type="button" onClick={(event) => event.preventDefault()}>使用條款</button>
              <button type="button" onClick={(event) => event.preventDefault()}>隱私權政策</button>
              <button type="button" onClick={(event) => event.preventDefault()}>意見回饋</button>
            </nav>
            <div className="site-footer__copy">© 2026 CampusEats</div>
          </div>
        </footer>
      )}
    </div>
  )
}
