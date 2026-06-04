import { PageChrome } from './PageChrome'
import RunnerEarnings from './RunnerEarnings'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'runner-earnings',
}
const styles = [
  ".earn-grid { display: grid; grid-template-columns: 340px minmax(0,1fr); gap: clamp(20px,3vw,40px); align-items: start; }\n  @media (max-width: 900px) { .earn-grid { grid-template-columns: 1fr; } }\n  .earn-aside { position: sticky; top: calc(var(--topbar-h) + 20px); display: flex; flex-direction: column; gap: var(--space-4); }\n  .earn-hero { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; padding-block: var(--space-5) var(--space-4); }\n  .earn-hero .period { font-size: var(--text-sm); color: var(--muted); }\n  .earn-hero .big { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 60px; font-weight: 700; line-height: 1; letter-spacing: -0.03em; }\n  .earn-hero .sub { font-size: var(--text-sm); color: var(--meta); }\n  .mini { display: grid; grid-template-columns: repeat(3,1fr); text-align: center; margin-top: var(--space-4); border-top: 1px solid var(--border-soft); }\n  .mini > div { padding: var(--space-3) 0; }\n  .mini > div + div { border-left: 1px solid var(--border-soft); }\n  .mini .n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; font-size: var(--text-lg); }\n  .mini .l { font-size: var(--text-xs); color: var(--meta); margin-top: 2px; }\n  .trip { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--border-soft); }\n  .trip:last-child { border-bottom: none; }\n  .trip .meta-l { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }\n  .trip .tdot { width: 36px; height: 36px; flex: none; border-radius: var(--radius-md); background: var(--surface-warm); display: grid; place-items: center; }\n  .trip .tdot svg { width: 16px; height: 16px; stroke: var(--fg); fill: none; stroke-width: 2; }\n  .trip .store { font-weight: 600; font-size: var(--text-sm); }\n  .trip .when { font-size: var(--text-xs); color: var(--meta); margin-top: 2px; }\n  .trip .amt { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; }",
] as const

export default function RunnerEarningsPage() {
  return (
    <PageChrome pageId="runner-earnings" title="收入明細 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
      {styles.map((css, index) => (
        <style key={index}>{css}</style>
      ))}
      <>
        <header className="topbar">
          <div className="topbar__inner">
            <a className="topbar__brand" href="feed.html" data-brand-mark="">
              CampusEats
            </a>
            <nav className="topbar__nav" data-topnav="" data-active="earn"></nav>
            <span className="topbar__spacer"></span>
            <div className="topbar__actions">
              <span className="role-chip" data-role-name="">
                帶餐者
              </span>
            </div>
          </div>
        </header>

        <div className="wrap page" role="main" id="main">
          <RunnerEarnings />
        </div>
      </>
    </PageChrome>
  )
}
