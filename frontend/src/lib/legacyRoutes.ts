const PAGE_IDS = [
  'dashboard',
  'feed',
  'history-detail',
  'landing',
  'login',
  'my-orders',
  'order-detail',
  'order-tracking',
  'orderer-reviews',
  'post-order',
  'profile',
  'rating',
  'register',
  'runner-earnings',
  'runner-reviews',
] as const

export type PageId = (typeof PAGE_IDS)[number]

const PAGE_ID_SET = new Set<string>(PAGE_IDS)

export function pageIdFromPath(pathname: string): PageId | null {
  // The bare root ("/") and any empty segment resolve to the landing page,
  // which is now the site entry point (the old index overview was removed).
  const last = pathname.split('/').filter(Boolean).pop() ?? 'landing'
  const id = last.replace(/\.html$/i, '') || 'landing'
  return PAGE_ID_SET.has(id) ? (id as PageId) : null
}

export function routePathForPage(pageId: PageId) {
  return pageId === 'landing' ? '/' : `/${pageId}`
}

export function clientPathFromLegacyHref(href: string) {
  if (!href || href.startsWith('#')) return null

  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) return null

  const pageId = pageIdFromPath(url.pathname)
  if (!pageId) return null

  return `${routePathForPage(pageId)}${url.search}${url.hash}`
}
