import { PageChrome } from './PageChrome'
import Feed from './Feed'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'feed',
}
const styles = [
  ".count { font-size: var(--text-sm); color: var(--muted); }\n  .order-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-4); }",
] as const

export default function FeedPage() {
  return (
    <PageChrome pageId="feed" title="接單 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
      {styles.map((css, index) => (
        <style key={index}>{css}</style>
      ))}
      <>
        <header className="topbar">
          <div className="topbar__inner">
            <a className="topbar__brand" href="feed.html" data-brand-mark="">
              CampusEats
            </a>
            <nav className="topbar__nav" data-topnav="" data-active="home"></nav>
            <span className="topbar__spacer"></span>
            <div className="topbar__actions">
              <span className="role-chip" data-role-name="">
                帶餐者
              </span>
              <a className="topbar__account" href="profile.html">
                <span className="avatar avatar--sm">學</span>
                <span className="nm">校園同學</span>
              </a>
            </div>
          </div>
        </header>

        <div className="wrap page" role="main" id="main">
          <div className="page__head">
            <h1>待接訂單</h1>
            <p>附近的帶餐需求會即時出現。挑一筆順路的接下吧。</p>
          </div>

          <Feed />
        </div>
      </>
    </PageChrome>
  )
}
