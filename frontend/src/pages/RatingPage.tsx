import { PageChrome } from './PageChrome'
import Rating from './Rating'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'rating',
}
const styles = [
  ".rate-wrap { max-width: 560px; margin-inline: auto; }\n  .rate-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-8) var(--space-6); }\n  .rate-card .who { font-size: var(--text-xl); font-weight: 700; }\n  .rate-card .sub { font-size: var(--text-sm); color: var(--muted); }\n  .rate-val { font-size: var(--text-sm); color: var(--muted); min-height: 20px; }\n  .stars--lg { display: inline-flex; gap: 6px; }\n  .star-btn { background: none; border: none; padding: 2px; cursor: pointer; font-size: 34px; line-height: 1; color: var(--border-soft); transition: color var(--motion-fast); }\n  .star-btn.is-on { color: var(--fg); }\n  .star-btn:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; border-radius: var(--radius-sm); }\n  .star-static { font-size: 28px; line-height: 1; color: var(--border-soft); }\n  .star-static.is-on { color: var(--fg); }\n  .done-mark { width: 72px; height: 72px; border-radius: 50%; background: var(--fg); display: grid; place-items: center; margin: 0 auto; }\n  .done-mark svg { width: 34px; height: 34px; stroke: var(--bg); stroke-width: 2.6; fill: none; }",
] as const

export default function RatingPage() {
  return (
    <PageChrome pageId="rating" title="評價 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
      {styles.map((css, index) => (
        <style key={index}>{css}</style>
      ))}
      <>
        <header className="topbar">
          <div className="topbar__inner">
            <a className="topbar__brand" href="dashboard.html" data-brand-mark="">
              CampusEats
            </a>
            <nav className="topbar__nav" data-topnav="" data-active="orders"></nav>
            <span className="topbar__spacer"></span>
            <div className="topbar__actions">
              <a className="btn btn-ghost btn--sm" href="my-orders.html">
                略過
              </a>
            </div>
          </div>
        </header>

        <div className="wrap page" role="main" id="main">
          <Rating />
        </div>
      </>
    </PageChrome>
  )
}
