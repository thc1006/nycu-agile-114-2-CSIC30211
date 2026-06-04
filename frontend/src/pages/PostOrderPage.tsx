import { PageChrome } from './PageChrome'
import PostOrder from './PostOrder'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'post-order',
}
const styles = [
  ".post-grid { display: grid; grid-template-columns: minmax(0,1fr) 340px; gap: clamp(20px,3vw,36px); align-items: start; }\n  @media (max-width: 920px) { .post-grid { grid-template-columns: 1fr; } }\n  .fee-calc { border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: var(--space-4); }\n  .fee-calc__rows { display: flex; flex-direction: column; gap: 8px; }\n  .fee-calc__rows .row { display: flex; align-items: center; justify-content: space-between; font-size: var(--text-sm); color: var(--muted); }\n  .fee-calc__rows .row .amt { font-family: var(--font-mono); font-variant-numeric: tabular-nums; color: var(--fg); }\n  .fee-calc__total { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--fg); font-weight: 700; }\n  .fee-note { font-size: var(--text-xs); color: var(--meta); margin-top: 6px; }\n  .aside-fee { position: sticky; top: calc(var(--topbar-h) + 20px); }\n  .po-error { display: flex; align-items: flex-start; gap: 10px; background: color-mix(in srgb, var(--danger) 8%, var(--bg)); border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent); border-radius: var(--radius-md); padding: 12px 14px; color: var(--danger); font-size: var(--text-sm); }\n  .po-loading { color: var(--muted); }",
] as const

export default function PostOrderPage() {
  return (
    <PageChrome pageId="post-order" title="發布帶餐需求 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
      {styles.map((css, index) => (
        <style key={index}>{css}</style>
      ))}
      <>
        <header className="topbar">
          <div className="topbar__inner">
            <a className="topbar__brand" href="dashboard.html" data-brand-mark="">
              CampusEats
            </a>
            <nav className="topbar__nav" data-topnav="" data-active="post"></nav>
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
          <PostOrder />
        </div>
      </>
    </PageChrome>
  )
}
