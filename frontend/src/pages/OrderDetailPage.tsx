import { PageChrome } from './PageChrome'
import OrderDetail from './OrderDetail'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'order-detail',
}
const styles = [
  ".detail-grid { display: grid; grid-template-columns: minmax(0,1fr) 360px; gap: clamp(20px,3vw,36px); align-items: start; }\n  @media (max-width: 920px) { .detail-grid { grid-template-columns: 1fr; } }\n  .detail-rest { font-size: var(--text-2xl); letter-spacing: -0.02em; }\n  .lockmsg { display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); color: var(--muted); }\n  .lockmsg svg { width: 16px; height: 16px; stroke: var(--muted); stroke-width: 2; fill: none; flex: 0 0 auto; }\n  .accept-card { position: sticky; top: calc(var(--topbar-h) + 20px); }",
] as const

export default function OrderDetailPage() {
  return (
    <PageChrome pageId="order-detail" title="訂單詳情 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
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

        <div className="wrap page wrap--narrow" role="main" id="main">
          <div className="page__head">
            <p className="crumb">
              <a href="feed.html?role=runner">接單</a> · 訂單詳情
            </p>
            <h1 className="sr-only">訂單詳情</h1>
          </div>

          <OrderDetail />
        </div>
      </>
    </PageChrome>
  )
}
