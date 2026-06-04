import { PageChrome } from './PageChrome'
import MyOrders from './MyOrders'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'my-orders',
}
const styles = [
  ".seg-tabs { display: flex; gap: var(--space-1); border-bottom: 1px solid var(--border-soft); margin-bottom: var(--space-6); }\n  .seg-tabs button { padding: 12px 18px; border: none; background: none; font-weight: 600; font-size: var(--text-base); color: var(--meta); position: relative; cursor: pointer; }\n  .seg-tabs button.is-active { color: var(--fg); }\n  .seg-tabs button.is-active::after { content: \"\"; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--fg); }\n  .ro { font-size: var(--text-xs); color: var(--meta); }\n  .order-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-4); }\n  .mo-loading { color: var(--muted); }\n  .mo-error { display: flex; align-items: flex-start; gap: 10px; background: color-mix(in srgb, var(--danger) 8%, var(--bg)); border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent); border-radius: var(--radius-md); padding: 12px 14px; color: #8c1d12; font-size: var(--text-sm); margin-bottom: var(--space-4); }",
] as const

export default function MyOrdersPage() {
  return (
    <PageChrome pageId="my-orders" title="我的訂單 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
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
          <MyOrders />
        </div>
      </>
    </PageChrome>
  )
}
