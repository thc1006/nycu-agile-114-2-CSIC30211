import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "profile"
}
const styles = [
  ".prof-grid { display: grid; grid-template-columns: 360px minmax(0,1fr); gap: clamp(20px,3vw,40px); align-items: start; }\n  @media (max-width: 900px) { .prof-grid { grid-template-columns: 1fr; } }\n  .prof-head { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-6) var(--space-5); }\n  .prof-head .name { font-size: var(--text-xl); font-weight: 700; }\n  .prof-head .email { font-size: var(--text-sm); color: var(--muted); }\n  .rep { display: grid; grid-template-columns: repeat(3,1fr); border-top: 1px solid var(--border-soft); }\n  .rep > div { padding: var(--space-4) var(--space-2); text-align: center; }\n  .rep > div + div { border-left: 1px solid var(--border-soft); }\n  .rep .n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-xl); font-weight: 700; }\n  .rep .l { font-size: var(--text-xs); color: var(--muted); margin-top: 2px; }\n  .ro { font-size: var(--text-sm); color: var(--meta); }\n  .prof-section { margin-bottom: var(--space-6); }\n  .prof-section h2 { margin-bottom: var(--space-2); }"
] as const
const scripts = [
  "var role = CampusEats.getRole();\n  document.getElementById(\"ordererView\").hidden = role === \"runner\";\n  document.getElementById(\"runnerView\").hidden = role !== \"runner\";\n  document.getElementById(\"switchHint\").textContent = role === \"runner\" ? \"改用訂餐者視角\" : \"改用帶餐者視角\";\n  document.getElementById(\"recordsLabel\").textContent = role === \"runner\" ? \"帶單紀錄\" : \"訂單紀錄\";\n  document.getElementById(\"repCaption\").textContent = role === \"runner\" ? \"· 訂餐者給你的評價\" : \"· 帶餐者給你的評價\";\n\n  // role-distinct reputation stats\n  var rep = document.getElementById(\"repStats\");\n  var stats = role === \"runner\"\n    ? [[\"32\", \"帶餐次數\"], [\"$640\", \"本月收入\"], [\"98%\", \"準時率\"]]\n    : [[\"18\", \"訂餐次數\"], [\"6\", \"本月訂餐\"], [\"4.9\", \"平均評分\"]];\n  stats.forEach(function (s) { var d = document.createElement(\"div\"); var n = document.createElement(\"div\"); n.className = \"n\"; n.textContent = s[0]; var l = document.createElement(\"div\"); l.className = \"l\"; l.textContent = s[1]; d.appendChild(n); d.appendChild(l); rep.appendChild(d); });\n\n  function setupPay(roleKey, btnId, valId, sheetId, listId) {\n    var btn = document.getElementById(btnId); var val = document.getElementById(valId); if (!btn || !val) return;\n    var STORE = \"campuseats.pay.\" + roleKey;\n    var label = function (name) { return name + (name === \"面交現金\" ? \" · 預設\" : \"\"); };\n    function apply(name) { val.textContent = label(name); document.querySelectorAll(\"#\" + listId + \" [data-check]\").forEach(function (c) { c.hidden = c.closest(\"[data-pay]\").getAttribute(\"data-pay\") !== name; }); }\n    var saved; try { saved = localStorage.getItem(STORE); } catch (e) {} if (saved) apply(saved);\n    btn.addEventListener(\"click\", function () { openSheet(sheetId); });\n    document.getElementById(listId).addEventListener(\"click\", function (e) {\n      var row = e.target.closest(\"[data-pay]\"); if (!row) return;\n      var name = row.getAttribute(\"data-pay\"); apply(name);\n      try { localStorage.setItem(STORE, name); } catch (e) {}\n      closeSheet(sheetId); toast((roleKey === \"runner\" ? \"收款方式\" : \"付款方式\") + \"已更新為 \" + name);\n    });\n  }\n  setupPay(\"orderer\", \"payBtnOrderer\", \"payValOrderer\", \"paySheetOrderer\", \"payListOrderer\");\n  setupPay(\"runner\", \"payBtnRunner\", \"payValRunner\", \"paySheetRunner\", \"payListRunner\");\n\n  // ── editable 常用取餐地點 (free text, persisted) ──────────────────\n  function setupPickup(btnId, valId, sheetId, inputId, saveId) {\n    var btn = document.getElementById(btnId), val = document.getElementById(valId),\n        input = document.getElementById(inputId), save = document.getElementById(saveId);\n    if (!btn || !val) return;\n    var STORE = \"campuseats.pickup\";\n    var saved; try { saved = localStorage.getItem(STORE); } catch (e) {}\n    if (saved) val.textContent = saved;\n    btn.addEventListener(\"click\", function () { input.value = val.textContent.trim(); openSheet(sheetId); setTimeout(function () { input.focus(); }, 60); });\n    function commit() {\n      var v = input.value.trim(); if (!v) { input.focus(); return; }\n      val.textContent = v; try { localStorage.setItem(STORE, v); } catch (e) {}\n      closeSheet(sheetId); toast(\"常用取餐地點已更新為 \" + v);\n    }\n    save.addEventListener(\"click\", commit);\n    input.addEventListener(\"keydown\", function (e) { if (e.key === \"Enter\") { e.preventDefault(); commit(); } });\n  }\n  setupPickup(\"pickupBtnOrderer\", \"pickupValOrderer\", \"pickupSheetOrderer\", \"pickupInputOrderer\", \"pickupSaveOrderer\");"
] as const

export default function ProfilePage() {
  return (
    <PageChrome pageId="profile" title="我的 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="dashboard.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="me"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions">
                <span className="role-chip" data-role-name="">訂餐者</span>
              </div>
            </div>
          </header>
        
          <div className="wrap page">
            <div className="page__head"><h1>我的</h1></div>
        
            <div className="prof-grid">
              
              <aside>
                <div className="card" style={{ padding: "0", overflow: "hidden" }}>
                  <div className="prof-head">
                    <span className="avatar avatar--lg">學</span>
                    <div><div className="name">校園同學</div><div className="email">student@campus.edu</div></div>
                    <div className="rowflex" style={{ justifyContent: "center", flexWrap: "wrap" }}>
                      <span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span>
                      <span className="num" style={{ fontWeight: "700" }}>4.9</span>
                      <span className="ro" id="repCaption" style={{ whiteSpace: "nowrap" }}>· 帶餐者給你的評價</span>
                    </div>
                  </div>
                  <div className="rep" id="repStats"></div>
                </div>
                <a className="btn btn-white btn--block" href="login.html" style={{ marginTop: "var(--space-4)" }} data-no-role="">登出</a>
              </aside>
        
              
              <div>
                
                <section className="prof-section" id="ordererView" hidden data-od-id="profile-orderer">
                  <h2 className="h-card">帳戶</h2>
                  <div>
                    <a className="rowlink" href="orderer-reviews.html">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 18.2 6.1 21.3l1.2-6.6L2.5 9l6.6-.9z" /></svg></span>收到的評價</span>
                      <span className="rowflex"><span className="ro">4.9 · 18 則</span><span className="rowlink__chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg></span></span>
                    </a>
                    <button className="rowlink" type="button" id="payBtnOrderer">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg></span>付款方式</span>
                      <span className="rowflex"><span className="ro" id="payValOrderer">面交現金 · 預設</span><span className="rowlink__chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg></span></span>
                    </button>
                    <button className="rowlink" type="button" id="pickupBtnOrderer">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg></span>常用取餐地點</span>
                      <span className="rowflex"><span className="ro" id="pickupValOrderer">圖書館 1F</span><span className="rowlink__chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg></span></span>
                    </button>
                  </div>
                </section>
        
                
                <section className="prof-section" id="runnerView" hidden data-od-id="profile-runner">
                  <h2 className="h-card">帶餐</h2>
                  <div>
                    <a className="rowlink" href="runner-earnings.html">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></span>收入明細</span>
                      <span className="rowflex"><span className="ro">本月 $640</span><span className="rowlink__chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg></span></span>
                    </a>
                    <a className="rowlink" href="runner-reviews.html">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 18.2 6.1 21.3l1.2-6.6L2.5 9l6.6-.9z" /></svg></span>收到的評價</span>
                      <span className="rowflex"><span className="ro">4.9 · 32 則</span><span className="rowlink__chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg></span></span>
                    </a>
                    <button className="rowlink" type="button" id="payBtnRunner">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg></span>收款方式</span>
                      <span className="rowflex"><span className="ro" id="payValRunner">面交現金 · 預設</span><span className="rowlink__chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg></span></span>
                    </button>
                  </div>
                </section>
        
                
                <section className="prof-section">
                  <h2 className="h-card">設定</h2>
                  <div>
                    <a className="rowlink" href="my-orders.html">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4h11l3 3v13H6zM9 4v4h7" /></svg></span><span id="recordsLabel">訂單紀錄</span></span>
                      <span className="rowlink__chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg></span>
                    </a>
                    <div className="rowlink">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /></svg></span>通知</span>
                      <span className="ro">站內 · 已開啟</span>
                    </div>
                    <a className="rowlink" href="login.html" id="switchRole" data-no-role="">
                      <span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></svg></span>切換身份</span>
                      <span className="ro" id="switchHint">改用帶餐者視角</span>
                    </a>
                  </div>
                </section>
              </div>
            </div>
          </div>
        
          
          <div className="sheet" id="paySheetOrderer" role="dialog" aria-modal="true" aria-labelledby="paySheetOrdererTitle">
            <h3 id="paySheetOrdererTitle">選擇付款方式</h3>
            <p className="body-sm" style={{ marginBottom: "var(--space-3)" }}>這是你付款給帶餐者的方式，每筆交易仍可於面交時確認。</p>
            <div id="payListOrderer">
              <button className="rowlink" type="button" data-pay="面交現金"><span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></svg></span>面交現金</span><span className="rowlink__chev" data-check=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span></button>
              <button className="rowlink" type="button" data-pay="校園一卡通"><span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 14h4" /></svg></span>校園一卡通</span><span className="rowlink__chev" data-check="" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span></button>
              <button className="rowlink" type="button" data-pay="LINE Pay"><span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="4" /><path d="M8 10v4M8 14h2.5M14 10v4M17 10v4M14 12h3" /></svg></span>LINE Pay</span><span className="rowlink__chev" data-check="" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span></button>
              <button className="rowlink" type="button" data-pay="街口支付"><span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h6M12 11v6M9 17h6" /></svg></span>街口支付</span><span className="rowlink__chev" data-check="" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span></button>
            </div>
          </div>
        
          
          <div className="sheet" id="paySheetRunner" role="dialog" aria-modal="true" aria-labelledby="paySheetRunnerTitle">
            <h3 id="paySheetRunnerTitle">選擇收款方式</h3>
            <p className="body-sm" style={{ marginBottom: "var(--space-3)" }}>這是訂餐者付款給你的方式，作為你帶餐後收款的預設。</p>
            <div id="payListRunner">
              <button className="rowlink" type="button" data-pay="面交現金"><span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></svg></span>面交現金</span><span className="rowlink__chev" data-check=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span></button>
              <button className="rowlink" type="button" data-pay="街口支付"><span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h6M12 11v6M9 17h6" /></svg></span>街口支付</span><span className="rowlink__chev" data-check="" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span></button>
              <button className="rowlink" type="button" data-pay="LINE Pay"><span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="4" /><path d="M8 10v4M8 14h2.5M14 10v4M17 10v4M14 12h3" /></svg></span>LINE Pay</span><span className="rowlink__chev" data-check="" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span></button>
              <button className="rowlink" type="button" data-pay="銀行轉帳"><span className="rowflex"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-5 9 5M5 9v8m4-8v8m6-8v8m4-8v8M3 21h18" /></svg></span>銀行轉帳</span><span className="rowlink__chev" data-check="" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg></span></button>
            </div>
          </div>
        
          
          <div className="sheet" id="pickupSheetOrderer" role="dialog" aria-modal="true" aria-labelledby="pickupSheetOrdererTitle">
            <h3 id="pickupSheetOrdererTitle">常用取餐地點</h3>
            <p className="body-sm" style={{ marginBottom: "var(--space-3)" }}>設定你最常拿餐的地點，發單時會自動帶入，每筆訂單仍可逐筆修改。</p>
            <div className="field">
              <label htmlFor="pickupInputOrderer">地點名稱</label>
              <input className="control" type="text" id="pickupInputOrderer" placeholder="例如：圖書館 1F 大廳、工學院 A 棟" autoComplete="off" />
            </div>
            <button className="btn btn-black btn--block" type="button" id="pickupSaveOrderer" style={{ marginTop: "var(--space-4)" }}>儲存</button>
          </div>
      </>
    </PageChrome>
  )
}
