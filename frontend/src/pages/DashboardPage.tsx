import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "dashboard"
}
const styles = [
  ".loc { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; padding: 0; font: inherit; }\n  .loc svg { width: 18px; height: 18px; stroke: var(--fg); stroke-width: 2; fill: none; flex: 0 0 auto; }\n  .loc__txt { font-weight: 700; }\n  .loc__chev { width: 15px; height: 15px; stroke: var(--muted); stroke-width: 2.4; fill: none; }\n  .searchbar { display: flex; align-items: center; gap: 10px; width: 100%; max-width: 560px; padding: 14px 18px; background: var(--surface-warm); border: none; border-radius: var(--radius-sm); color: var(--muted); font-size: var(--text-base); text-align: left; margin-top: var(--space-4); }\n  .searchbar svg { width: 20px; height: 20px; stroke: var(--muted); stroke-width: 2; fill: none; flex: 0 0 auto; }\n  .searchbar:hover { background: var(--accent-hover); }\n  .hero-action { background: var(--fg); color: var(--bg); border-radius: var(--radius-lg); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }\n  .hero-action h2 { font-size: var(--text-xl); }\n  .hero-action p { color: rgba(255,255,255,.72); font-size: var(--text-sm); }\n  .hero-action .btn-white { align-self: flex-start; }\n  .reorder-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }\n  @media (max-width: 600px) { .reorder-grid { grid-template-columns: 1fr; } }\n  .reorder { padding: var(--space-4); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 6px; }\n  .reorder .r-rest { font-weight: 700; }\n  .reorder .r-item { font-size: var(--text-sm); color: var(--muted); flex: 1; }\n  .reorder .r-foot { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); margin-top: var(--space-2); }\n  .reorder .r-again { font-size: var(--text-sm); font-weight: 600; display: inline-flex; align-items: center; gap: 5px; padding: 7px 13px; border-radius: var(--radius-sm); background: var(--surface-warm); color: var(--fg); transition: background var(--motion-fast), color var(--motion-fast), transform var(--motion-fast); }\n  .reorder .r-again:hover { background: var(--fg); color: var(--bg); transform: translateY(-2px); }\n  .reorder .r-again svg { width: 15px; height: 15px; stroke: currentColor; stroke-width: 2; fill: none; }\n  .track-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--radius-sm); color: var(--fg); font-size: var(--text-sm); font-weight: 600; background: var(--surface-warm); transition: background var(--motion-fast), color var(--motion-fast); }\n  .track-link:hover { background: var(--fg); color: var(--bg); }\n  .track-link svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; fill: none; }\n  .ministat { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); overflow: hidden; }\n  .ministat > div { padding: var(--space-4) var(--space-2); text-align: center; }\n  .ministat > div + div { border-left: 1px solid var(--border-soft); }\n  .ministat .n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-xl); font-weight: 700; }\n  .ministat .l { font-size: var(--text-xs); color: var(--muted); margin-top: 2px; }\n  #locList .rowlink { padding: 14px 12px; border-radius: var(--radius-md); }\n  #locList .rowlink__chev svg { stroke: var(--fg); }"
] as const
const scripts = [
  "CampusEats.guard(\"orderer\");\n\n  var locTxt = document.getElementById(\"locTxt\");\n\n  // restore the saved 送達地點 so the home anchor + 發單 default stay in sync\n  function paintLoc(name) {\n    locTxt.textContent = \"送到 · \" + name;\n    document.querySelectorAll(\"#locList [data-loc]\").forEach(function (row) {\n      var chk = row.querySelector(\"[data-check]\");\n      if (chk) chk.hidden = row.getAttribute(\"data-loc\") !== name;\n    });\n  }\n  paintLoc(CampusEats.getDropoff());\n\n  document.getElementById(\"locBtn\").addEventListener(\"click\", function () { openSheet(\"locSheet\"); });\n  document.getElementById(\"locList\").addEventListener(\"click\", function (e) {\n    var row = e.target.closest(\"[data-loc]\"); if (!row) return;\n    var name = row.getAttribute(\"data-loc\");\n    CampusEats.setDropoff(name);\n    paintLoc(name);\n    closeSheet(\"locSheet\");\n    toast(\"取餐地點已更新為 \" + name);\n  });\n\n  document.querySelectorAll(\".reorder[data-reorder]\").forEach(function (card) {\n    var p = CampusEats.REORDERS[card.getAttribute(\"data-reorder\")]; if (!p) return;\n    var fee = CampusEats.fee({ qty: CampusEats.parseQty(p.items), urgency: CampusEats.urgencyOf(p.time) });\n    var el = card.querySelector(\".r-fee\"); if (el) el.textContent = \"$\" + fee.total;\n  });"
] as const

export default function DashboardPage() {
  return (
    <PageChrome pageId="dashboard" title="訂餐 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="dashboard.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="home"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions">
                <span className="role-chip" data-role-name="">訂餐者</span>
                <a className="topbar__account" href="profile.html"><span className="avatar avatar--sm">學</span><span className="nm">校園同學</span></a>
              </div>
            </div>
          </header>
        
          <div className="wrap page">
            <div className="page__head">
              <button className="loc" id="locBtn" aria-label="變更取餐地點">
                <svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                <span className="loc__txt" id="locTxt">送到 · 圖書館 1F 大廳</span>
                <svg className="loc__chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <h1 style={{ marginTop: "var(--space-3)" }}>嗨，校園同學 👋 今天想找人帶什麼？</h1>
              <form className="searchbar searchbar--live" role="search" data-rest-search="navigate" onSubmit={(event) => event.preventDefault()}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                <input className="searchbar__input" id="restSearch" name="restSearch" type="text" placeholder="想找人幫你帶什麼？例：阿嬤的飯桶、拉亞漢堡、茶壜…" aria-label="搜尋餐廳 / 店家" />
              </form>
            </div>
        
            <div className="split split--wide-aside">
              
              <div className="stack-5" style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
                <section data-od-id="active-order-block">
                  <div className="sec-head"><h2 className="h-sec">進行中</h2><a href="my-orders.html">全部訂單</a></div>
                  <div className="card" data-od-id="active-order">
                    <div className="order-card__top">
                      <div>
                        <div className="order-card__rest">阿嬤的飯桶 · 招牌炸雞腿便當</div>
                        <div className="meta" style={{ marginTop: "4px" }}>訂單 #CE-2048</div>
                      </div>
                      <span className="badge badge--buying">購買中</span>
                    </div>
                    <div className="order-card__meta">
                      <div className="order-line"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>圖書館 1F 大廳</div>
                      <div className="order-line"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>希望 12:30 前送達 · 帶餐者 阿翔</div>
                    </div>
                    <div className="order-card__foot">
                      <span className="meta">帶餐費 $20</span>
                      <a className="track-link" href="order-tracking.html?id=CE-2048">查看狀態時間軸<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg></a>
                    </div>
                  </div>
                </section>
        
                <section data-od-id="reorder-block">
                  <div className="sec-head"><h2 className="h-sec">再發一次</h2><a href="my-orders.html">歷史紀錄</a></div>
                  <div className="reorder-grid">
                    <div className="reorder" data-reorder="mai">
                      <div className="r-rest">拉亞漢堡</div>
                      <div className="r-item">原味蛋餅＋奶茶（微糖少冰）</div>
                      <div className="r-foot"><span className="fee r-fee" style={{ fontSize: "var(--text-base)" }}>$23</span><a className="r-again" href="post-order.html?reorder=mai">再發一次<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg></a></div>
                    </div>
                    <div className="reorder" data-reorder="wu">
                      <div className="r-rest">茶壜</div>
                      <div className="r-item">珍珠奶茶（微糖少冰）×1</div>
                      <div className="r-foot"><span className="fee r-fee" style={{ fontSize: "var(--text-base)" }}>$15</span><a className="r-again" href="post-order.html?reorder=wu">再發一次<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg></a></div>
                    </div>
                    <div className="reorder" data-reorder="buf">
                      <div className="r-rest">阿嬤的飯桶</div>
                      <div className="r-item">三菜一肉自助餐（不要辣）</div>
                      <div className="r-foot"><span className="fee r-fee" style={{ fontSize: "var(--text-base)" }}>$20</span><a className="r-again" href="post-order.html?reorder=buf">再發一次<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg></a></div>
                    </div>
                  </div>
                </section>
              </div>
        
              
              <aside className="aside">
                <div className="hero-action" data-od-id="orderer-cta">
                  <div>
                    <h2>沒空買飯？<br />發一張帶餐需求</h2>
                    <p>填好餐廳、餐點、取餐地點與時間，順路的同學就能接單。帶餐費由系統依份量與時段自動計算。</p>
                  </div>
                  <a className="btn btn-white" href="post-order.html">＋ 發布帶餐需求</a>
                </div>
                <div className="ministat">
                  <div><div className="n">18</div><div className="l">訂餐次數</div></div>
                  <div><div className="n">6</div><div className="l">本月訂餐</div></div>
                  <div><div className="n">4.9</div><div className="l">平均評分</div></div>
                </div>
              </aside>
            </div>
          </div>
        
          
          <div className="sheet" id="locSheet" role="dialog" aria-modal="true" aria-labelledby="locSheetTitle">
            <h3 id="locSheetTitle">選擇取餐地點</h3>
            <p className="body-sm" style={{ marginBottom: "var(--space-3)" }}>這是發單時預設帶入的取餐地點，每張需求仍可單獨修改。</p>
            <div id="locList">
              <button className="rowlink" type="button" data-loc="圖書館 1F 大廳">
                <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg></span>圖書館 1F 大廳</span>
                <span className="rowlink__chev" data-check=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span>
              </button>
              <button className="rowlink" type="button" data-loc="工學院 3F 走廊">
                <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg></span>工學院 3F 走廊</span>
                <span className="rowlink__chev" data-check="" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span>
              </button>
              <button className="rowlink" type="button" data-loc="綜合大樓 5F 實驗室">
                <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg></span>綜合大樓 5F 實驗室</span>
                <span className="rowlink__chev" data-check="" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span>
              </button>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
