import '@testing-library/jest-dom/vitest'
import { afterEach, expect, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import axe from 'axe-core'

// jsdom does not implement scrolling; the legacy runtime and PageChrome call
// these on every navigation. Stub them so tests don't emit "Not implemented".
window.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

// Keep tests isolated: unmount React trees and clear the persisted state the
// legacy runtime writes (role / dropoff / recent searches live in localStorage).
afterEach(() => {
  cleanup()
  localStorage.clear()
  document.body.removeAttribute('data-od-id')
  document.body.className = ''
})

// Lightweight accessibility matcher backed by axe-core. (The dedicated
// `vitest-axe` wrapper is effectively unmaintained, so we call axe directly.)
// color-contrast is disabled because jsdom does not perform layout/painting.
expect.extend({
  async toHaveNoViolations(received: Element | Document) {
    const results = await axe.run(received, {
      rules: { 'color-contrast': { enabled: false } },
    })
    const pass = results.violations.length === 0
    return {
      pass,
      message: () =>
        pass
          ? 'expected accessibility violations, but none were found'
          : results.violations
              .map(
                (v) =>
                  `[${v.impact ?? 'n/a'}] ${v.id}: ${v.help}\n  ` +
                  v.nodes.map((n) => n.target.join(' ')).join('\n  '),
              )
              .join('\n\n'),
    }
  },
})
