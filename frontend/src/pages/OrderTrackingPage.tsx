import { PageChrome } from './PageChrome'
import OrderTracking from './OrderTracking'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "order-tracking"
}
const styles = [
  ".track, .track-empty { max-width: 560px; margin-inline: auto; }\n  .track h1, .track-empty h1 { font-size: var(--text-2xl); letter-spacing: -0.02em; margin-bottom: var(--space-5); }\n  .track-empty__lead { color: var(--muted); margin-bottom: var(--space-5); line-height: 1.6; }\n  .timeline { list-style: none; margin: 0 0 var(--space-6); padding: 0; display: flex; flex-direction: column; gap: 2px; }\n  .timeline li { position: relative; padding: 12px 14px 12px 34px; border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--muted); }\n  .timeline li::before { content: \"\"; position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--border-soft); background: var(--bg); }\n  .timeline li[data-state=done] { color: var(--fg); }\n  .timeline li[data-state=done]::before { background: var(--fg); border-color: var(--fg); }\n  .timeline li[data-state=current] { color: var(--fg); font-weight: 700; background: var(--surface-warm); }\n  .timeline li[data-state=current]::before { background: var(--fg); border-color: var(--fg); box-shadow: 0 0 0 4px color-mix(in srgb, var(--fg) 18%, transparent); }\n  .track-detail { margin: 0 0 var(--space-5); }\n  .track-detail .kv { display: flex; justify-content: space-between; gap: var(--space-4); padding: 10px 0; border-bottom: 1px solid var(--border-soft); }\n  .track-detail dt { color: var(--muted); font-size: var(--text-sm); }\n  .track-detail dd { margin: 0; font-weight: 600; }\n  .track-actions { margin-top: var(--space-4); }\n  .track .ctx, .track-actions .ctx { color: var(--muted); font-size: var(--text-sm); padding: 12px 14px; background: var(--surface-warm); border-radius: var(--radius-md); }\n  .track .form-error, .track-empty .form-error { color: #c0392b; font-size: var(--text-sm); margin-bottom: var(--space-3); }"
] as const
const scripts = [] as const

export default function OrderTrackingPage() {
  return (
    <PageChrome pageId="order-tracking" title="訂單狀態 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="dashboard.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="orders"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions">
                <span className="role-chip" data-role-name="">訂餐者</span>
                <a className="topbar__account" href="profile.html"><span className="avatar avatar--sm">學</span><span className="nm">校園同學</span></a>
              </div>
            </div>
          </header>

          <div className="wrap page" role="main" id="main">
            <OrderTracking />
          </div>
      </>
    </PageChrome>
  )
}
