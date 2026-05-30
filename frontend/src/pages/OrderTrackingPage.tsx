import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "order-tracking"
}
const styles = [
  ".track-grid { display: grid; grid-template-columns: minmax(0,1fr) 360px; gap: clamp(20px,3vw,36px); align-items: start; }\n  @media (max-width: 920px) { .track-grid { grid-template-columns: 1fr; } }\n  .track-hero { background: var(--surface-warm); border-radius: var(--radius-lg); padding: var(--space-5); }\n  .track-hero .rest { font-size: var(--text-xl); font-weight: 700; letter-spacing: -0.01em; }\n  .track-eta { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: var(--text-sm); color: var(--muted); }\n  .track-eta svg { width: 16px; height: 16px; stroke: var(--fg); stroke-width: 2; fill: none; }\n  .partner { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4) 0; border-bottom: 1px solid var(--border-soft); }\n  .partner .name { font-weight: 700; }\n  .partner .sub { font-size: var(--text-sm); color: var(--muted); }\n  .partner .call { margin-left: auto; width: 44px; height: 44px; display: grid; place-items: center; border: none; background: var(--surface-warm); border-radius: 50%; }\n  .partner .call svg { width: 20px; height: 20px; stroke: var(--fg); stroke-width: 2; fill: none; }\n  .ctx { font-size: var(--text-sm); color: var(--muted); text-align: center; padding: var(--space-3) 0; }\n  .sec-label--lg { font-size: var(--text-lg); letter-spacing: 0; text-transform: none; color: var(--fg); }\n  .fee-big { display: block; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; font-size: var(--text-2xl); }\n  .act-card { position: sticky; top: calc(var(--topbar-h) + 20px); display: flex; flex-direction: column; gap: var(--space-4); }\n  .more-row { display: flex; gap: var(--space-2); flex-wrap: wrap; }"
] as const
const scripts = [
  "var params = new URLSearchParams(location.search);\n  var role = params.get(\"role\") || CampusEats.getRole();\n  var live = CampusEats.getLive(params.get(\"id\"));\n  var steps = document.querySelectorAll(\"#timeline .tl-step\");\n  var ctx = document.getElementById(\"ctxNote\");\n  var bar = document.getElementById(\"actionbar\");\n  var state, times, partnerNm;\n\n  if (live) {\n    role = \"orderer\";\n    state = live.state;\n    times = live.times.slice();\n    var oid = String(params.get(\"id\")).trim();\n    partnerNm = live.partner.name;\n    document.getElementById(\"orderNo\").textContent = oid;\n    document.getElementById(\"tkId\").textContent = oid;\n    document.getElementById(\"tkHero\").textContent = live.restaurant + \" · \" + live.dish;\n    document.getElementById(\"tkEtaSpot\").textContent = live.spot;\n    document.getElementById(\"tkEtaTime\").textContent = live.deadline;\n    document.getElementById(\"tkItems\").textContent = live.items;\n    document.getElementById(\"tkSpot\").textContent = live.spot;\n    document.getElementById(\"tkDeadline\").textContent = live.deadline;\n    document.getElementById(\"partnerAvatar\").textContent = live.partner.initial;\n    document.getElementById(\"partnerName\").textContent = \"帶餐者 \" + live.partner.name;\n    document.getElementById(\"partnerSub\").textContent = live.partner.rating + \" ★ · \" + live.partner.count + \" 筆帶餐\";\n    // timeline notes that reference the partner / restaurant\n    steps[1].querySelector(\".tl-note\").textContent = live.partner.name + \" 接下了你的訂單\";\n    steps[2].querySelector(\".tl-note\").textContent = \"正在 \" + live.restaurant + \" 幫你購買\";\n  } else {\n    state = role === \"runner\" ? 1 : 2;\n    times = [\"12:02\", \"12:06\", \"12:11\", null, null, null];\n    partnerNm = \"阿翔\";\n  }\n\n  var tkItems = document.getElementById(\"tkItems\").textContent;\n  var tkDeadline = document.getElementById(\"tkDeadline\").textContent;\n  var tkFee = CampusEats.fee({ qty: CampusEats.parseQty(tkItems), urgency: CampusEats.urgencyOf(tkDeadline) });\n  document.getElementById(\"tkFee\").textContent = \"$\" + tkFee.total;\n\n  document.getElementById(\"callBtn\").addEventListener(\"click\", function () {\n    toast(\"正在為你聯絡 \" + document.getElementById(\"partnerName\").textContent.trim() + \"…\");\n  });\n  var orderNo = document.getElementById(\"orderNo\").textContent.trim();\n  document.getElementById(\"helpBtn\").addEventListener(\"click\", function () { toast(\"客服已收到你的訊息，將盡快回覆\"); });\n  document.getElementById(\"shareBtn\").addEventListener(\"click\", function () { toast(\"已複製訂單編號 \" + orderNo); });\n  document.getElementById(\"cancelOrderBtn\").addEventListener(\"click\", function () { toast(\"接單後無法直接取消，請透過客服協助\"); });\n\n  function nowStamp() { var d = new Date(); return (\"0\" + d.getHours()).slice(-2) + \":\" + (\"0\" + d.getMinutes()).slice(-2); }\n\n  function render() {\n    var buyTitle = steps[2] && steps[2].querySelector(\".tl-title\");\n    if (buyTitle) buyTitle.textContent = state > 2 ? \"已購買\" : \"購買中\";\n    steps.forEach(function (el, i) {\n      el.classList.remove(\"is-done\", \"is-current\", \"is-upcoming\");\n      el.classList.add(i < state ? \"is-done\" : i === state ? \"is-current\" : \"is-upcoming\");\n      var t = el.querySelector(\".tl-time\");\n      t.textContent = times[i] || (i <= state ? nowStamp() : \"尚未開始\");\n    });\n    bar.replaceChildren();\n    var label = \"\", next = null, info = \"\";\n    if (role === \"runner\") {\n      if (state === 1) { label = \"開始購買\"; next = 2; }\n      else if (state === 2) { label = \"完成購買・開始配送\"; next = 3; }\n      else if (state === 3) { label = \"標記已送達\"; next = 4; }\n      else if (state === 4) { info = \"已送達，等待訂餐者確認收餐…\"; }\n      else if (state >= 5) { label = \"評價訂餐者\"; }\n      ctx.textContent = state < 4 ? \"記得在每個階段更新狀態，訂餐者才能安心等待。\" : \"\";\n    } else {\n      if (state < 4) {\n        info = state === 1 ? partnerNm + \" 已接下你的訂單，準備前往購買。\"\n             : state === 2 ? partnerNm + \" 正在幫你購買，預計幾分鐘內送達。\"\n             : state === 3 ? partnerNm + \" 已買好餐點，正在送往取餐地點。\"\n             : \"帶餐者處理中…\";\n      }\n      else if (state === 4) { label = \"確認收餐\"; next = 5; }\n      else if (state >= 5) { label = \"評價帶餐者\"; }\n      ctx.textContent = state < 4 ? \"狀態會即時更新，不用一直私訊問進度。\" : \"\";\n    }\n    if (label) {\n      var btn = document.createElement(\"button\");\n      btn.className = \"btn btn-black btn--block btn--lg\"; btn.textContent = label;\n      btn.addEventListener(\"click\", function () {\n        if (next != null) { times[next] = nowStamp(); state = next; toast(steps[next].querySelector(\".tl-title\").textContent + (next === 5 ? \" · 交易完成\" : \"\")); render(); }\n        else { CampusEats.go(\"rating.html?role=\" + role); }\n      });\n      bar.appendChild(btn);\n    } else if (info) {\n      var div = document.createElement(\"div\"); div.className = \"ctx\"; div.style.padding = \"12px 16px\"; div.style.textAlign = \"left\"; div.textContent = info; bar.appendChild(div);\n    }\n  }\n  render();"
] as const

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
            <div className="page__head">
              <p className="crumb"><a href="my-orders.html">訂單紀錄</a> · 訂單狀態 · <span className="num" id="orderNo">CE-2048</span></p>
              <h1>即時進度</h1>
            </div>
        
            <div className="track-grid">
              
              <div className="stack-5" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <div className="partner">
                  <span className="avatar avatar--sm" id="partnerAvatar">翔</span>
                  <div>
                    <div className="name" id="partnerName">帶餐者 阿翔</div>
                    <div className="sub" id="partnerSub"><span className="num">4.9</span> ★ · 32 筆帶餐</div>
                  </div>
                  <button className="call" id="callBtn" aria-label="聯絡"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg></button>
                </div>
        
                <div className="timeline" id="timeline">
                  <div className="tl-step" data-step="0"><span className="tl-dot"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></span><div className="tl-title">已發布</div><div className="tl-time" data-time="12:02"></div><div className="tl-note">訂單進入待接列表</div></div>
                  <div className="tl-step" data-step="1"><span className="tl-dot"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></span><div className="tl-title">已接單</div><div className="tl-time" data-time="12:06"></div><div className="tl-note">阿翔接下了你的訂單</div></div>
                  <div className="tl-step" data-step="2"><span className="tl-dot"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></span><div className="tl-title">購買中</div><div className="tl-time" data-time="12:11"></div><div className="tl-note">正在阿嬤的飯桶幫你購買</div></div>
                  <div className="tl-step" data-step="3"><span className="tl-dot"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></span><div className="tl-title">配送中</div><div className="tl-time" data-time="--:--"></div><div className="tl-note">已買好餐點，正在送往取餐地點</div></div>
                  <div className="tl-step" data-step="4"><span className="tl-dot"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></span><div className="tl-title">已送達</div><div className="tl-time" data-time="--:--"></div><div className="tl-note">已抵達取餐地點，請取餐</div></div>
                  <div className="tl-step" data-step="5"><span className="tl-dot"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></span><div className="tl-title">已完成</div><div className="tl-time" data-time="--:--"></div><div className="tl-note">交易完成，可互相評價</div></div>
                </div>
                <p className="ctx" id="ctxNote"></p>
              </div>
        
              
              <aside className="act-card">
                <div className="track-hero">
                  <div className="rest" id="tkHero">阿嬤的飯桶 · 招牌炸雞腿便當</div>
                  <div className="track-eta"><svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>送達 <span id="tkEtaSpot">圖書館 1F 大廳</span> · <span id="tkEtaTime">希望 12:30 前</span></div>
                </div>
                <div className="card">
                  <p className="sec-label sec-label--lg">訂單內容</p>
                  <dl style={{ margin: "0" }}>
                    <div className="kv"><dt>餐點品項</dt><dd id="tkItems">招牌炸雞腿便當 ×1</dd></div>
                    <div className="kv"><dt>取餐地點</dt><dd id="tkSpot">圖書館 1F 大廳</dd></div>
                    <div className="kv"><dt>取餐時間</dt><dd id="tkDeadline">希望 12:30 前</dd></div>
                    <div className="kv"><dt>訂單編號</dt><dd className="num" id="tkId">CE-2048</dd></div>
                  </dl>
                </div>
                <div className="card">
                  <p className="sec-label sec-label--lg">系統計算帶餐費</p>
                  <span className="fee-big" id="tkFee">$0</span>
                  <p className="body-sm" style={{ marginTop: "var(--space-2)" }}>由系統依距離、餐點份量與時段固定計算，下單前已確認，雙方不另議價。</p>
                </div>
                <div id="actionbar"></div>
                <div className="more-row">
                  <button className="btn btn-white btn--sm" type="button" id="helpBtn">聯絡客服</button>
                  <button className="btn btn-white btn--sm" type="button" id="shareBtn">分享單號</button>
                  <button className="btn btn-danger btn--sm" type="button" id="cancelOrderBtn">取消訂單</button>
                </div>
              </aside>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
