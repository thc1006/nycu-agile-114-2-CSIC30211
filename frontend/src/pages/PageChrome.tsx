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

function normalizeRole(value: string | null): Role {
  return value === 'runner' ? 'runner' : 'orderer'
}

function syncRoleFromLocation(search: string): Role {
  const params = new URLSearchParams(search)
  const roleFromUrl = params.get('role')
  const role = normalizeRole(roleFromUrl ?? localStorage.getItem(ROLE_KEY))

  if (roleFromUrl === 'runner' || roleFromUrl === 'orderer') {
    localStorage.setItem(ROLE_KEY, role)
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
    const role = syncRoleFromLocation(location.search)
    const requiredRole = pageRoleGuard[pageId]

    if (requiredRole && role !== requiredRole) {
      navigate(homePath(role), { replace: true })
      return
    }

    document.title = title
    applyBodyAttributes(bodyAttrs)
    removeLegacyChrome()
    runCampusInit()

    // Execute each page's legacy inline scripts exactly once per mounted route
    // instance (keyed by renderKey, which the root <div> below is also keyed on).
    // React StrictMode double-invokes effects in development, and a hash-only
    // navigation re-runs this effect without remounting the route container.
    // Without this guard, append-style scripts (timeline steps, rating tags,
    // reputation cells) would duplicate their injected DOM and stack listeners.
    if (scriptsRanForKey.current !== renderKey) {
      executeInlineScripts(pageId, scripts)
      scriptsRanForKey.current = renderKey
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
    <div key={renderKey} ref={rootRef} data-react-route={routePathForPage(pageId)}>
      {children}
    </div>
  )
}
