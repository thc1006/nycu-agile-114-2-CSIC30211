import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "my-orders"
}
const styles = [
  ".seg-tabs { display: flex; gap: var(--space-1); border-bottom: 1px solid var(--border-soft); margin-bottom: var(--space-6); }\n  .seg-tabs button { padding: 12px 18px; border: none; background: none; font-weight: 600; font-size: var(--text-base); color: var(--meta); position: relative; }\n  .seg-tabs button.is-active { color: var(--fg); }\n  .seg-tabs button.is-active::after { content: \"\"; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--fg); }\n  .ro { font-size: var(--text-xs); color: var(--meta); }\n  .order-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-4); }"
] as const
const scripts = [
  "var role = CampusEats.getRole();\n  document.getElementById(\"pageTitle\").textContent = role === \"runner\" ? \"我的帶單紀錄\" : \"我的訂單紀錄\";\n  document.title = (role === \"runner\" ? \"我的帶單\" : \"我的訂單\") + \" · CampusEats\";\n\n  document.querySelectorAll(\"[data-owner]\").forEach(function (el) { if (el.getAttribute(\"data-owner\") !== role) el.hidden = true; });\n\n  if (role === \"runner\") {\n    document.getElementById(\"emptyActiveTitle\").textContent = \"目前沒有接的訂單\";\n    document.getElementById(\"emptyActiveSub\").textContent = \"到接單頁看看附近的帶餐需求，接一筆順路的吧。\";\n  }\n  function refreshEmpty() {\n    var anyActive = Array.prototype.some.call(document.querySelectorAll('#paneActive [data-owner]'), function (el) { return !el.hidden; });\n    document.getElementById(\"emptyActive\").hidden = anyActive;\n  }\n  refreshEmpty();\n\n  var tabs = document.getElementById(\"tabs\");\n  var panes = { active: document.getElementById(\"paneActive\"), history: document.getElementById(\"paneHistory\") };\n  tabs.addEventListener(\"click\", function (e) {\n    var btn = e.target.closest(\"button\"); if (!btn) return;\n    tabs.querySelectorAll(\"button\").forEach(function (b) { b.classList.remove(\"is-active\"); });\n    btn.classList.add(\"is-active\");\n    Object.keys(panes).forEach(function (k) { panes[k].hidden = k !== btn.dataset.tab; });\n  });"
] as const

export default function MyOrdersPage() {
  return (
    <PageChrome pageId="my-orders" title="我的訂單 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
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
        
          <div className="wrap page">
            <div className="page__head"><h1 id="pageTitle">我的訂單</h1></div>
        
            <div className="seg-tabs" id="tabs">
              <button className="is-active" data-tab="active">進行中</button>
              <button data-tab="history">歷史</button>
            </div>
        
            
            <div id="paneActive" className="order-grid">
              <a className="card card--link" href="order-tracking.html?id=CE-2056" data-owner="orderer" data-od-id="active-3">
                <div className="order-card__top"><div><div className="order-card__rest">拉亞漢堡 · 蛋餅＋奶茶</div><div className="ro" style={{ marginTop: "4px" }}>我發布 · CE-2056</div></div><span className="badge badge--delivering">配送中</span></div>
                <div className="order-card__foot"><span className="meta">帶餐者 阿哲 · 正在送來</span><span className="fee">$23</span></div>
              </a>
              <a className="card card--link" href="order-tracking.html?id=CE-2048" data-owner="orderer" data-od-id="active-1">
                <div className="order-card__top"><div><div className="order-card__rest">阿嬤的飯桶 · 招牌炸雞腿便當</div><div className="ro" style={{ marginTop: "4px" }}>我發布 · CE-2048</div></div><span className="badge badge--buying">購買中</span></div>
                <div className="order-card__foot"><span className="meta">帶餐者 阿翔</span><span className="fee">$20</span></div>
              </a>
              <a className="card card--link" href="order-tracking.html?id=CE-2051" data-owner="orderer" data-od-id="active-4">
                <div className="order-card__top"><div><div className="order-card__rest">漢堡王 · 華堡套餐</div><div className="ro" style={{ marginTop: "4px" }}>我發布 · CE-2051</div></div><span className="badge badge--matched">已接單</span></div>
                <div className="order-card__foot"><span className="meta">帶餐者 小妤 · 準備前往購買</span><span className="fee">$26</span></div>
              </a>
              <a className="card card--link" href="order-tracking.html?role=runner" data-owner="runner" data-od-id="active-2">
                <div className="order-card__top"><div><div className="order-card__rest">茶壜 · 微糖少冰珍奶 ×2</div><div className="ro" style={{ marginTop: "4px" }}>我接的 · CE-2053</div></div><span className="badge badge--matched">已接單</span></div>
                <div className="order-card__foot"><span className="meta">訂餐者 阿哲</span><span className="fee">$35</span></div>
              </a>
              <div className="empty" id="emptyActive" hidden style={{ gridColumn: "1/-1" }}>
                <div className="empty__mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4h11l3 3v13H6zM9 4v4h7" /></svg></div>
                <h3 id="emptyActiveTitle">目前沒有進行中的訂單</h3>
                <p id="emptyActiveSub">發一張帶餐需求，接單後就能在這裡追蹤進度。</p>
              </div>
            </div>
        
            
            <div id="paneHistory" className="order-grid" hidden>
              <a className="card card--link" href="history-detail.html?id=CE-2039" data-owner="orderer" data-od-id="hist-1">
                <div className="order-card__top"><div><div className="order-card__rest">拉亞漢堡 · 蛋餅＋紅茶</div><div className="ro" style={{ marginTop: "4px" }}>我發布 · 昨天 10:32 · CE-2039</div></div><span className="badge badge--done">已完成</span></div>
                <div className="order-card__foot"><span className="meta">待評價帶餐者</span><span className="fee">$25</span></div>
              </a>
              <a className="card card--link" href="history-detail.html?id=CE-2018" data-owner="orderer" data-od-id="hist-3">
                <div className="order-card__top"><div><div className="order-card__rest">小木屋鬆餅 · 培根蛋鬆餅</div><div className="ro" style={{ marginTop: "4px" }}>我發布 · 5/27 13:05 · CE-2018</div></div><span className="badge badge--cancelled">已取消</span></div>
                <div className="order-card__foot"><span className="meta">逾時無人接單，已自動取消</span><span className="fee">$20</span></div>
              </a>
              <a className="card card--link" href="history-detail.html?id=CE-2031" data-owner="runner" data-od-id="hist-2">
                <div className="order-card__top"><div><div className="order-card__rest">阿嬤的飯桶 · 三菜一肉便當</div><div className="ro" style={{ marginTop: "4px" }}>我接的 · 昨天 12:18 · CE-2031</div></div><span className="badge badge--done">已完成</span></div>
                <div className="order-card__foot"><span className="rowflex"><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span><span className="ro">你給了 5 星</span></span><span className="fee">$20</span></div>
              </a>
              <a className="card card--link" href="history-detail.html?id=CE-2026" data-owner="runner" data-od-id="hist-4">
                <div className="order-card__top"><div><div className="order-card__rest">茶壜 · 半糖去冰綠茶</div><div className="ro" style={{ marginTop: "4px" }}>我接的 · 昨天 09:50 · CE-2026</div></div><span className="badge badge--done">已完成</span></div>
                <div className="order-card__foot"><span className="meta">待評價訂餐者</span><span className="fee">$25</span></div>
              </a>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
