import campusRuntimeSource from '../legacy/campus-web.js?raw'

declare global {
  interface Window {
    __campusEatsInit?: () => void
    CampusEats?: {
      setRole?: (role: string) => void
      getRole?: () => string
    }
  }
}

let runtimeInstalled = false

export function ensureCampusRuntime() {
  if (runtimeInstalled) return

  const initHook = 'document.addEventListener("DOMContentLoaded", function () {'
  const sourceWithInit = campusRuntimeSource.replace(
    initHook,
    'window.__campusEatsInit = function () {',
  )
  const runnableSource = sourceWithInit.replace(
    /\n {2}\}\);\s*\n\}\)\(\);\s*$/,
    '\n  };\n})();',
  )

  Function(runnableSource)()
  runtimeInstalled = true
}

export function runCampusInit() {
  ensureCampusRuntime()
  window.__campusEatsInit?.()
}
