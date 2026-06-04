import { PageChrome } from './PageChrome'
import OrdererReviews from './OrdererReviews'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'orderer-reviews',
}
const styles = [
  ".rev-grid { display: grid; grid-template-columns: 340px minmax(0,1fr); gap: clamp(20px,3vw,40px); align-items: start; }\n  @media (max-width: 900px) { .rev-grid { grid-template-columns: 1fr; } }\n  .score-hero { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding-block: var(--space-4) var(--space-3); }\n  .score-hero .big { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 64px; font-weight: 700; line-height: 1; letter-spacing: -0.03em; }\n  .score-hero .count { font-size: var(--text-sm); color: var(--muted); }\n  .score-hero .stars--lg { display: inline-flex; gap: 4px; }\n  .star-static { font-size: 22px; line-height: 1; color: var(--border-soft); }\n  .star-static.is-on { color: var(--fg); }\n  .rev-aside { position: sticky; top: calc(var(--topbar-h) + 20px); display: flex; flex-direction: column; gap: var(--space-4); }",
] as const

export default function OrdererReviewsPage() {
  return (
    <PageChrome pageId="orderer-reviews" title="我的評價 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
      {styles.map((css, index) => (
        <style key={index}>{css}</style>
      ))}
      <>
        <header className="topbar">
          <div className="topbar__inner">
            <a className="topbar__brand" href="dashboard.html" data-brand-mark="">
              CampusEats
            </a>
            <nav className="topbar__nav" data-topnav="" data-active="me"></nav>
            <span className="topbar__spacer"></span>
            <div className="topbar__actions">
              <span className="role-chip" data-role-name="">
                訂餐者
              </span>
            </div>
          </div>
        </header>

        <div className="wrap page" role="main" id="main">
          <OrdererReviews />
        </div>
      </>
    </PageChrome>
  )
}
