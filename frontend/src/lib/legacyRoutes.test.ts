import { describe, it, expect } from 'vitest'
import {
  pageIdFromPath,
  routePathForPage,
  clientPathFromLegacyHref,
} from './legacyRoutes'

describe('pageIdFromPath', () => {
  it('maps "/" to the landing page', () => {
    expect(pageIdFromPath('/')).toBe('landing')
  })

  it('strips the .html suffix from legacy paths', () => {
    expect(pageIdFromPath('/dashboard.html')).toBe('dashboard')
    expect(pageIdFromPath('/post-order.html')).toBe('post-order')
  })

  it('resolves clean (extension-less) paths', () => {
    expect(pageIdFromPath('/feed')).toBe('feed')
    expect(pageIdFromPath('/order-tracking')).toBe('order-tracking')
  })

  it('strips the .html suffix case-insensitively', () => {
    expect(pageIdFromPath('/login.HTML')).toBe('login')
  })

  it('returns null for unknown pages', () => {
    expect(pageIdFromPath('/not-a-page')).toBeNull()
    expect(pageIdFromPath('/admin.html')).toBeNull()
  })
})

describe('routePathForPage', () => {
  it('renders the landing page at the root', () => {
    expect(routePathForPage('landing')).toBe('/')
  })

  it('renders other pages at /<id>', () => {
    expect(routePathForPage('dashboard')).toBe('/dashboard')
    expect(routePathForPage('runner-earnings')).toBe('/runner-earnings')
  })
})

describe('clientPathFromLegacyHref', () => {
  it('rewrites a legacy .html link to a client route, preserving query + hash', () => {
    expect(clientPathFromLegacyHref('dashboard.html?role=orderer')).toBe(
      '/dashboard?role=orderer',
    )
    expect(clientPathFromLegacyHref('feed.html?role=runner#top')).toBe(
      '/feed?role=runner#top',
    )
  })

  it('returns null for pure hash anchors', () => {
    expect(clientPathFromLegacyHref('#section')).toBeNull()
  })

  it('returns null for empty hrefs', () => {
    expect(clientPathFromLegacyHref('')).toBeNull()
  })

  it('returns null for cross-origin links', () => {
    expect(clientPathFromLegacyHref('https://example.com/feed.html')).toBeNull()
  })

  it('returns null for unknown internal pages', () => {
    expect(clientPathFromLegacyHref('mystery.html')).toBeNull()
  })
})
