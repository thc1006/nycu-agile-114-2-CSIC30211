import campusRuntimeSource from '../legacy/campus-web.js?raw'

declare global {
  interface Window {
    __campusEatsInit?: () => void
    /**
     * SPA-aware navigation hook installed by PageChrome. The legacy runtime and
     * page scripts call it (via `CampusEats.go`) so imperative navigations route
     * through react-router instead of triggering a full document reload. Falls
     * back to `location.href`/`location.replace` when no hook is installed.
     */
    __campusNavigate?: (href: string, opts?: { replace?: boolean }) => void
    CampusEats?: {
      setRole?: (role: string) => void
      getRole?: () => string
      go?: (href: string, opts?: { replace?: boolean }) => void
    }
  }
}

let runtimeInstalled = false

// The vendored runtime (`campus-web.js`) is authored as a self-running IIFE that
// bootstraps on DOMContentLoaded. In the SPA we need to (a) run that bootstrap
// on every route mount, not once on load, and (b) keep the shared globals
// (CampusEats/toast/openSheet/…) installed exactly once. We do this by swapping
// the DOMContentLoaded listener for an assignment to `window.__campusEatsInit`,
// then re-balancing the IIFE tail. Both rewrites are asserted: if a future edit
// to campus-web.js changes either signature, we throw a loud, actionable error
// instead of silently shipping a no-op runtime or a syntax error (see
// legacyRuntime.test.ts for the regression coverage).
const INIT_HOOK = 'document.addEventListener("DOMContentLoaded", function () {'
const INIT_REPLACEMENT = 'window.__campusEatsInit = function () {'
const TAIL_PATTERN = /\n {2}\}\);\s*\n\}\)\(\);\s*$/
const TAIL_REPLACEMENT = '\n  };\n})();'

export function ensureCampusRuntime() {
  if (runtimeInstalled) return

  const sourceWithInit = campusRuntimeSource.replace(INIT_HOOK, INIT_REPLACEMENT)
  if (sourceWithInit === campusRuntimeSource) {
    throw new Error(
      '[campus-web] DOMContentLoaded init hook not found. The bootstrap ' +
        'signature in src/legacy/campus-web.js changed — update INIT_HOOK in ' +
        'legacyRuntime.ts to match.',
    )
  }

  if (!TAIL_PATTERN.test(sourceWithInit)) {
    throw new Error(
      '[campus-web] IIFE tail not found. The closing of ' +
        'src/legacy/campus-web.js changed — update TAIL_PATTERN in ' +
        'legacyRuntime.ts to match.',
    )
  }
  const runnableSource = sourceWithInit.replace(TAIL_PATTERN, TAIL_REPLACEMENT)

  Function(runnableSource)()
  runtimeInstalled = true
}

export function runCampusInit() {
  ensureCampusRuntime()
  window.__campusEatsInit?.()
}
