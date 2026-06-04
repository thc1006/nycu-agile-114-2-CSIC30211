import { PageChrome } from './PageChrome'
import Dashboard from './Dashboard'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'dashboard',
}
const styles = [
  ".hero-action { background: var(--fg); color: var(--bg); border-radius: var(--radius-lg); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }\n  .hero-action h2 { font-size: var(--text-xl); }\n  .hero-action p { color: rgba(255,255,255,.72); font-size: var(--text-sm); }\n  .hero-action .btn-white { align-self: flex-start; }\n  .track-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--radius-sm); color: var(--fg); font-size: var(--text-sm); font-weight: 600; background: var(--surface-warm); transition: background var(--motion-fast), color var(--motion-fast); }\n  .track-link:hover { background: var(--fg); color: var(--bg); }\n  .track-link svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; fill: none; }\n  .ministat { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); overflow: hidden; margin-top: var(--space-4); }\n  .ministat > div { padding: var(--space-4) var(--space-2); text-align: center; }\n  .ministat > div + div { border-left: 1px solid var(--border-soft); }\n  .ministat .n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-xl); font-weight: 700; }\n  .ministat .l { font-size: var(--text-xs); color: var(--muted); margin-top: 2px; }\n  .db-loading { color: var(--muted); }\n  .db-error { display: flex; align-items: flex-start; gap: 10px; background: color-mix(in srgb, var(--danger) 8%, var(--bg)); border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent); border-radius: var(--radius-md); padding: 12px 14px; color: #8c1d12; font-size: var(--text-sm); margin-bottom: var(--space-4); }",
] as const

export default function DashboardPage() {
  return (
    <PageChrome pageId="dashboard" title="訂餐 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
      {styles.map((css, index) => (
        <style key={index}>{css}</style>
      ))}
      <>
        <header className="topbar">
          <div className="topbar__inner">
            <a className="topbar__brand" href="dashboard.html" data-brand-mark="">
              CampusEats
            </a>
            <nav className="topbar__nav" data-topnav="" data-active="home"></nav>
            <span className="topbar__spacer"></span>
            <div className="topbar__actions">
              <span className="role-chip" data-role-name="">
                訂餐者
              </span>
              <a className="topbar__account" href="profile.html">
                <span className="avatar avatar--sm">學</span>
                <span className="nm">校園同學</span>
              </a>
            </div>
          </div>
        </header>

        <div className="wrap page" role="main" id="main">
          <Dashboard />
        </div>
      </>
    </PageChrome>
  )
}
