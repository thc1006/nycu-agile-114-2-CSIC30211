import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "feed"
}
const styles = [
  ".status { background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: var(--space-5); display: flex; align-items: center; gap: var(--space-4); }\n  .status__dot { width: 10px; height: 10px; border-radius: 50%; flex: 0 0 auto; background: var(--meta); transition: background var(--motion-fast), box-shadow var(--motion-fast); }\n  .status.is-online .status__dot { background: var(--success); box-shadow: 0 0 0 4px color-mix(in srgb, var(--success) 25%, transparent); }\n  .status__txt { flex: 1; min-width: 0; }\n  .status__txt strong { display: block; font-size: var(--text-lg); letter-spacing: -0.01em; }\n  .status__txt span { font-size: var(--text-sm); color: var(--muted); }\n  .status-switch { flex: 0 0 auto; display: flex; gap: 2px; padding: 3px; background: var(--surface-warm); border-radius: 999px; }\n  .status-switch__opt { border: none; background: transparent; color: var(--muted); font-size: var(--text-sm); font-weight: 600; white-space: nowrap; padding: 8px 16px; border-radius: 999px; transition: background var(--motion-fast), color var(--motion-fast); }\n  .status-switch__opt[aria-pressed=\"true\"] { background: var(--fg); color: var(--bg); }\n  .feed-search { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; background: var(--surface-warm); border: none; border-radius: var(--radius-sm); }\n  .feed-search svg { width: 18px; height: 18px; stroke: var(--muted); stroke-width: 2; fill: none; flex: 0 0 auto; }\n  .feed-search input { flex: 1; min-width: 0; border: none; background: transparent; outline: none; font: inherit; color: var(--fg); }\n  .feed-search input::placeholder { color: var(--meta); }\n  .count { font-size: var(--text-sm); color: var(--muted); }\n  .order-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-4); }\n  /* earnings glance */\n  .earn-hero { text-align: center; padding: var(--space-2) 0 var(--space-4); }\n  .earn-hero .amt { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: clamp(40px, 9vw, 52px); line-height: 1; font-weight: 700; letter-spacing: -0.03em; }\n  .earn-hero .cap { font-size: var(--text-sm); color: var(--muted); margin-top: var(--space-2); }\n  .earn-split { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--border-soft); }\n  .earn-split > div { text-align: center; padding: var(--space-4) 0 var(--space-1); }\n  .earn-split > div + div { border-left: 1px solid var(--border-soft); }\n  .earn-split .n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-2xl); font-weight: 700; letter-spacing: -0.02em; }\n  .earn-split .l { font-size: var(--text-xs); color: var(--muted); margin-top: 2px; }\n  .tips { font-size: var(--text-sm); color: var(--muted); line-height: 1.6; }\n  .tips li { margin-bottom: 8px; }"
] as const
const scripts = [
  "CampusEats.guard(\"runner\");\n\n  var cards = Array.prototype.slice.call(document.querySelectorAll(\"#orderList .card\"));\n  var countN = document.getElementById(\"countN\");\n  var empty = document.getElementById(\"emptyState\");\n  var list = document.getElementById(\"orderList\");\n  var filters = document.getElementById(\"filters\");\n  var searchInput = document.getElementById(\"searchInput\");\n  var activeFilter = \"all\";\n\n  function apply() {\n    var q = (searchInput.value || \"\").trim().toLowerCase();\n    var shown = 0;\n    cards.forEach(function (c) {\n      var tagOk = activeFilter === \"all\" || (c.dataset.tags || \"\").split(\" \").indexOf(activeFilter) > -1;\n      var qOk = !q || (c.dataset.hay || \"\").toLowerCase().indexOf(q) > -1 || c.textContent.toLowerCase().indexOf(q) > -1;\n      var match = tagOk && qOk;\n      c.hidden = !match;\n      if (match) shown++;\n    });\n    countN.textContent = shown;\n    empty.hidden = shown !== 0;\n    list.hidden = shown === 0;\n  }\n  filters.addEventListener(\"click\", function (e) {\n    var btn = e.target.closest(\".chip\"); if (!btn) return;\n    filters.querySelectorAll(\".chip\").forEach(function (c) { c.classList.remove(\"is-active\"); });\n    btn.classList.add(\"is-active\");\n    activeFilter = btn.dataset.filter; apply();\n  });\n  searchInput.addEventListener(\"input\", apply);\n  document.getElementById(\"resetFilter\").addEventListener(\"click\", function () {\n    searchInput.value = \"\"; filters.querySelector('[data-filter=\"all\"]').click();\n  });\n\n  /* online / offline */\n  var statusEl = document.getElementById(\"status\");\n  var statusSwitch = document.getElementById(\"statusSwitch\");\n  var switchOpts = Array.prototype.slice.call(statusSwitch.querySelectorAll(\".status-switch__opt\"));\n  var statusTitle = document.getElementById(\"statusTitle\");\n  var statusSub = document.getElementById(\"statusSub\");\n  var onlineBlock = document.getElementById(\"onlineBlock\");\n  var offlineBlock = document.getElementById(\"offlineBlock\");\n  var online = true;\n  function renderStatus() {\n    statusEl.classList.toggle(\"is-online\", online);\n    switchOpts.forEach(function (b) { b.setAttribute(\"aria-pressed\", String((b.dataset.online === \"true\") === online)); });\n    statusTitle.textContent = online ? \"已上線 · 開始接單\" : \"已離線\";\n    statusSub.textContent = online ? \"附近的帶餐需求會即時出現在下方\" : \"上線後才會看到可接的訂單\";\n    onlineBlock.hidden = !online;\n    offlineBlock.hidden = online;\n  }\n  function setOnline(v, announce) { online = v; renderStatus(); if (announce) toast(online ? \"已上線，開始接收附近訂單\" : \"已離線，暫停接單\"); }\n  statusSwitch.addEventListener(\"click\", function (e) { var b = e.target.closest(\".status-switch__opt\"); if (!b) return; setOnline(b.dataset.online === \"true\", true); });\n  document.getElementById(\"goOnline\").addEventListener(\"click\", function () { setOnline(true, true); });\n  renderStatus();"
] as const

export default function FeedPage() {
  return (
    <PageChrome pageId="feed" title="接單 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="feed.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="home"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions">
                <span className="role-chip" data-role-name="">帶餐者</span>
                <a className="topbar__account" href="profile.html"><span className="avatar avatar--sm">學</span><span className="nm">校園同學</span></a>
              </div>
            </div>
          </header>
        
          <div className="wrap page">
            <div className="page__head">
              <h1>待接訂單</h1>
              <p>上線後，附近的帶餐需求會即時出現。挑一筆順路的接下吧。</p>
            </div>
        
            <div className="split split--wide-aside">
              
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <div className="status is-online" id="status">
                  <span className="status__dot"></span>
                  <span className="status__txt">
                    <strong id="statusTitle">已上線 · 開始接單</strong>
                    <span id="statusSub">附近的帶餐需求會即時出現在下方</span>
                  </span>
                  <div className="status-switch" id="statusSwitch" role="group" aria-label="上線 / 下線">
                    <button type="button" className="status-switch__opt" data-online="true" aria-pressed="true">上線</button>
                    <button type="button" className="status-switch__opt" data-online="false" aria-pressed="false">下線</button>
                  </div>
                </div>
        
                <div id="onlineBlock" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <label className="feed-search">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                    <input id="searchInput" type="search" placeholder="搜尋店家、餐點、地點或單號" aria-label="搜尋待接訂單" />
                  </label>
        
                  <div className="chip-row" id="filters" role="tablist" aria-label="篩選">
                    <button className="chip is-active" data-filter="all">全部</button>
                    <button className="chip" data-filter="near">順路</button>
                    <button className="chip" data-filter="canteen">學餐</button>
                    <button className="chip" data-filter="drink">飲料</button>
                    <button className="chip" data-filter="high">報酬高</button>
                  </div>
                  <p className="count"><strong id="countN" className="num">5</strong> 筆待接 · 依取餐截止時間排序</p>
        
                  <div className="order-grid" id="orderList">
                    <a className="card card--link" href="order-detail.html" data-tags="near drink" data-hay="拉亞漢堡 蛋餅 紅茶 順路 工學院 ce-2051 飲料" data-od-id="o1">
                      <div className="order-card__top"><div><div className="order-card__rest">拉亞漢堡 · 蛋餅＋紅茶</div><div className="meta" style={{ marginTop: "4px" }}>200m · 順路</div></div><span className="fee">$25<small>/單</small></span></div>
                      <div className="order-card__meta">
                        <div className="order-line"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>工學院 3F 走廊</div>
                        <div className="order-line"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>10:40 前 · 還有 18 分鐘</div>
                      </div>
                      <div className="order-card__foot"><span className="tag">1 項餐點</span><span className="meta">CE-2051</span></div>
                    </a>
                    <a className="card card--link" href="order-detail.html" data-tags="near canteen high" data-hay="研三舍餐廳 滷肉飯 貢丸湯 學餐 便當 不繞路 第二教學大樓 ce-2052 報酬高" data-od-id="o2">
                      <div className="order-card__top"><div><div className="order-card__rest">研三舍餐廳 · 滷肉飯＋貢丸湯</div><div className="meta" style={{ marginTop: "4px" }}>同棟 · 不繞路</div></div><span className="fee">$30<small>/單</small></span></div>
                      <div className="order-card__meta">
                        <div className="order-line"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>第二教學大樓 2F</div>
                        <div className="order-line"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>12:15 前 · 尖峰時段</div>
                      </div>
                      <div className="order-card__foot"><span className="tag">2 項餐點</span><span className="meta">CE-2052</span></div>
                    </a>
                    <a className="card card--link" href="order-detail.html" data-tags="drink high" data-hay="茶壜 珍奶 珍珠奶茶 飲料 手搖 校門口 綜合大樓 ce-2053 報酬高" data-od-id="o3">
                      <div className="order-card__top"><div><div className="order-card__rest">茶壜 · 微糖少冰珍奶 ×2</div><div className="meta" style={{ marginTop: "4px" }}>450m · 校門口</div></div><span className="fee">$35<small>/單</small></span></div>
                      <div className="order-card__meta">
                        <div className="order-line"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>綜合大樓 5F 實驗室</div>
                        <div className="order-line"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>14:00 前 · 較寬鬆</div>
                      </div>
                      <div className="order-card__foot"><span className="tag">2 杯飲料</span><span className="meta">CE-2053</span></div>
                    </a>
                    <a className="card card--link" href="order-detail.html" data-tags="canteen" data-hay="小木屋鬆餅 培根蛋鬆餅 學餐 宿舍 ce-2054" data-od-id="o4">
                      <div className="order-card__top"><div><div className="order-card__rest">小木屋鬆餅 · 培根蛋鬆餅</div><div className="meta" style={{ marginTop: "4px" }}>300m</div></div><span className="fee">$20<small>/單</small></span></div>
                      <div className="order-card__meta">
                        <div className="order-line"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>學生宿舍 A 棟交誼廳</div>
                        <div className="order-line"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>13:30 前</div>
                      </div>
                      <div className="order-card__foot"><span className="tag">1 項餐點</span><span className="meta">CE-2054</span></div>
                    </a>
                    <a className="card card--link" href="order-detail.html" data-tags="near canteen" data-hay="阿嬤的飯桶 三菜一肉便當 學餐 順路 圖書館 ce-2055" data-od-id="o5">
                      <div className="order-card__top"><div><div className="order-card__rest">阿嬤的飯桶 · 三菜一肉便當</div><div className="meta" style={{ marginTop: "4px" }}>150m · 順路</div></div><span className="fee">$20<small>/單</small></span></div>
                      <div className="order-card__meta">
                        <div className="order-line"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>圖書館 1F 大廳</div>
                        <div className="order-line"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>12:30 前 · 尖峰時段</div>
                      </div>
                      <div className="order-card__foot"><span className="tag">1 項餐點</span><span className="meta">CE-2055</span></div>
                    </a>
                  </div>
        
                  <div className="empty" id="emptyState" hidden data-od-id="feed-empty">
                    <div className="empty__mark"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg></div>
                    <h3>這個條件目前沒有訂單</h3>
                    <p>試著放寬篩選或清除搜尋。尖峰時段（11:30–13:00）通常最多單。</p>
                    <button className="btn btn-white btn--sm" id="resetFilter">看全部待接</button>
                  </div>
                </div>
        
                <div className="empty" id="offlineBlock" hidden data-od-id="feed-offline">
                  <div className="empty__mark"><svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" /></svg></div>
                  <h3>你目前離線中</h3>
                  <p>上線後才會收到附近的帶餐需求。準備好順路帶餐了嗎？</p>
                  <button className="btn btn-black btn--sm" id="goOnline">立即上線</button>
                </div>
              </div>
        
              
              <aside className="aside">
                <div className="card" data-od-id="runner-earnings">
                  <div className="between" style={{ marginBottom: "var(--space-1)" }}>
                    <span className="meta">今天的帶餐收入</span>
                    <a href="runner-earnings.html" style={{ color: "var(--muted)", fontSize: "var(--text-sm)", fontWeight: "600" }}>查看明細</a>
                  </div>
                  <div className="earn-hero"><div className="amt">$60</div><div className="cap">今日帶餐費</div></div>
                  <div className="earn-split">
                    <div><div className="n">2</div><div className="l">已完成</div></div>
                    <div><div className="n">4.9</div><div className="l">評分</div></div>
                  </div>
                </div>
                <div className="card">
                  <p className="sec-label">接單小提示</p>
                  <ul className="tips" style={{ listStyle: "none", padding: "0", margin: "0" }}>
                    <li>· 先看「順路」與「同棟」的單，幾乎不繞路。</li>
                    <li>· 報酬由系統依份量與時段計算，公開透明。</li>
                    <li>· 接單即鎖定，記得每階段更新狀態。</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
