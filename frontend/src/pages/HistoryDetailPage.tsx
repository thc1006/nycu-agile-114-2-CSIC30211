import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "history-detail"
}
const styles = [
  ".hd-grid { display: grid; grid-template-columns: minmax(0,1fr) 360px; gap: clamp(20px,3vw,36px); align-items: start; }\n  @media (max-width: 920px) { .hd-grid { grid-template-columns: 1fr; } }\n  .hd-aside { position: sticky; top: calc(var(--topbar-h) + 20px); display: flex; flex-direction: column; gap: var(--space-4); }\n  .hd-hero .hd-rest { font-size: var(--text-2xl); font-weight: 700; letter-spacing: -0.02em; margin-top: var(--space-2); }\n  .hd-hero .hd-meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--meta); letter-spacing: .04em; text-transform: uppercase; }\n  .party { display: flex; align-items: center; gap: var(--space-3); }\n  .party .who { font-weight: 700; font-size: var(--text-base); }\n  .party .role { font-size: var(--text-xs); color: var(--meta); margin-top: 2px; }\n  .sec-label--lg { font-size: var(--text-lg); letter-spacing: 0; text-transform: none; color: var(--fg); }\n  .fee-big { display: block; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; font-size: var(--text-2xl); }\n  .tl-step.is-cancel .tl-dot { background: var(--danger); border-color: var(--danger); }\n  .tl-step.is-cancel .tl-dot svg { opacity: 1; }\n  .tl-step.is-cancel::before { background: var(--danger); }\n  .tl-step.is-cancel .tl-title { color: var(--danger); }\n  .rate-block + .rate-block { margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border-soft); }\n  .rate-block .rb-head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-2); }\n  .rate-block .rb-who { font-size: var(--text-sm); font-weight: 600; }\n  .rate-block .rb-comment { font-size: var(--text-sm); color: var(--muted); margin-top: 6px; }\n  .rate-block .rb-pending { font-size: var(--text-sm); color: var(--meta); }\n  .rb-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n  .rb-tags .tag { font-size: var(--text-xs); }\n  .link-cta { font-size: var(--text-sm); font-weight: 600; color: var(--fg); text-decoration: underline; white-space: nowrap; }"
] as const
const scripts = [
  "(function () {\n    var role = CampusEats.getRole();\n    var params = new URLSearchParams(location.search);\n    var id = params.get(\"id\");\n    var order = id && CampusEats.getOrder(id);\n    if (!order || order.owner !== role) { location.replace(CampusEats.withRole(\"my-orders.html\", role)); return; }\n\n    var $ = function (i) { return document.getElementById(i); };\n    var cp = order.counterpart;\n    var counterRole = role === \"orderer\" ? \"帶餐者\" : \"訂餐者\";\n\n    $(\"backLink\").textContent = role === \"runner\" ? \"帶單紀錄\" : \"訂單紀錄\";\n    $(\"hdId\").textContent = id; $(\"hdId2\").textContent = id;\n    $(\"hdRest\").textContent = order.restaurant;\n    $(\"hdDate\").textContent = \"發布於 \" + order.date;\n    $(\"hdItems\").textContent = order.items;\n    $(\"hdSpot\").textContent = order.spot;\n    $(\"hdDeadline\").textContent = order.deadline;\n    $(\"hdFee\").textContent = \"$\" + order.fee;\n\n    var BADGE = { done: { text: \"已完成\", cls: \"badge--done\" }, cancelled: { text: \"已取消\", cls: \"badge--cancelled\" } };\n    var b = BADGE[order.status] || BADGE.done;\n    var badge = $(\"hdBadge\"); badge.textContent = b.text; badge.classList.add(b.cls);\n\n    if (cp) {\n      $(\"hdPartyLabel\").textContent = counterRole;\n      $(\"hdAvatar\").textContent = cp.initial;\n      $(\"hdPartyName\").textContent = counterRole + \" \" + cp.name;\n      $(\"hdPartyRole\").textContent = role === \"orderer\" ? \"為你帶這份餐\" : \"你為對方帶餐\";\n    } else { $(\"hdPartyWrap\").hidden = true; }\n\n    var CHECK = \"M20 6L9 17l-5-5\", XMARK = \"M18 6L6 18M6 6l12 12\";\n    var tl = $(\"hdTimeline\");\n    order.timeline.forEach(function (title) {\n      var cancel = title === \"已取消\";\n      var step = document.createElement(\"div\"); step.className = \"tl-step is-done\" + (cancel ? \" is-cancel\" : \"\");\n      var dot = document.createElement(\"div\"); dot.className = \"tl-dot\";\n      var svg = document.createElementNS(\"http://www.w3.org/2000/svg\", \"svg\"); svg.setAttribute(\"viewBox\", \"0 0 24 24\");\n      var path = document.createElementNS(\"http://www.w3.org/2000/svg\", \"path\"); path.setAttribute(\"d\", cancel ? XMARK : CHECK);\n      svg.appendChild(path); dot.appendChild(svg);\n      var t = document.createElement(\"div\"); t.className = \"tl-title\"; t.textContent = title;\n      step.appendChild(dot); step.appendChild(t); tl.appendChild(step);\n    });\n\n    if (order.status === \"cancelled\") {\n      $(\"hdCancelWrap\").hidden = false;\n      $(\"hdCancelReason\").textContent = order.cancelReason || \"訂單已取消。\";\n    } else {\n      $(\"hdRatingsWrap\").hidden = false;\n      $(\"hdYouLabel\").textContent = \"你給\" + counterRole + \"的評價\";\n      $(\"hdThemLabel\").textContent = counterRole + \"給你的評價\";\n      if (order.you && order.you.rated) {\n        $(\"hdYouRated\").hidden = false;\n        $(\"hdYouStars\").setAttribute(\"data-value\", String(order.you.stars));\n        if (order.you.tags && order.you.tags.length) { var tagWrap = $(\"hdYouTags\"); tagWrap.hidden = false; order.you.tags.forEach(function (tg) { var s = document.createElement(\"span\"); s.className = \"tag\"; s.textContent = tg; tagWrap.appendChild(s); }); }\n        if (order.you.comment) { $(\"hdYouComment\").hidden = false; $(\"hdYouComment\").textContent = \"「\" + order.you.comment + \"」\"; }\n      } else {\n        $(\"hdYouPending\").hidden = false;\n        var youCta = $(\"hdYouCta\"); youCta.hidden = false; youCta.href = \"rating.html?role=\" + role + \"&id=\" + id;\n      }\n      if (order.them && order.them.rated) {\n        $(\"hdThemRated\").hidden = false;\n        $(\"hdThemStars\").setAttribute(\"data-value\", String(order.them.stars));\n        if (order.them.comment) { $(\"hdThemComment\").hidden = false; $(\"hdThemComment\").textContent = \"「\" + order.them.comment + \"」\"; }\n      } else { $(\"hdThemPending\").hidden = false; }\n    }\n\n    var bar = $(\"hdActionbar\"), act = $(\"hdAction\");\n    if (order.status === \"done\" && order.you && !order.you.rated) {\n      bar.hidden = false; act.textContent = \"前往評價 \" + counterRole; act.href = \"rating.html?role=\" + role + \"&id=\" + id;\n    } else if (role === \"orderer\" && order.reorder) {\n      bar.hidden = false; act.textContent = \"再發一次\"; act.href = \"post-order.html?reorder=\" + order.reorder;\n    }\n    // re-run stars now that data-value is set\n    document.querySelectorAll(\"#hdYouStars, #hdThemStars\").forEach(CampusEats.buildStars);\n  })();"
] as const

export default function HistoryDetailPage() {
  return (
    <PageChrome pageId="history-detail" title="訂單詳情 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
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
            <div className="page__head"><p className="crumb"><a href="my-orders.html" id="backLink">紀錄</a> · 訂單詳情</p><h1>訂單詳情</h1></div>
        
            <div className="hd-grid">
              
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <div data-od-id="hd-party" id="hdPartyWrap">
                  <p className="sec-label" id="hdPartyLabel">帶餐者</p>
                  <div className="card party">
                    <span className="avatar" id="hdAvatar">—</span>
                    <div><div className="who" id="hdPartyName">—</div><div className="role" id="hdPartyRole">—</div></div>
                  </div>
                </div>
        
                <div data-od-id="hd-timeline">
                  <p className="sec-label">訂單進度</p>
                  <div className="card"><div className="timeline" id="hdTimeline"></div></div>
                </div>
        
                <div data-od-id="hd-cancel" id="hdCancelWrap" hidden>
                  <p className="sec-label">取消原因</p>
                  <div className="card"><p className="body-sm" id="hdCancelReason" style={{ color: "var(--muted)" }}>—</p></div>
                </div>
        
                <div data-od-id="hd-ratings" id="hdRatingsWrap" hidden>
                  <p className="sec-label">評價紀錄</p>
                  <div className="card">
                    <div className="rate-block">
                      <div className="rb-head"><span className="rb-who" id="hdYouLabel">你給對方的評價</span><a className="link-cta" id="hdYouCta" hidden href="rating.html">前往評價</a></div>
                      <div id="hdYouRated" hidden>
                        <span className="stars stars--static" data-stars="" data-readonly="" data-value="0" data-max="5" id="hdYouStars"></span>
                        <div className="rb-tags" id="hdYouTags" hidden></div>
                        <p className="rb-comment" id="hdYouComment" hidden></p>
                      </div>
                      <p className="rb-pending" id="hdYouPending" hidden>這筆訂單你尚未評價對方。</p>
                    </div>
                    <div className="rate-block">
                      <div className="rb-head"><span className="rb-who" id="hdThemLabel">對方給你的評價</span></div>
                      <div id="hdThemRated" hidden>
                        <span className="stars stars--static" data-stars="" data-readonly="" data-value="0" data-max="5" id="hdThemStars"></span>
                        <p className="rb-comment" id="hdThemComment" hidden></p>
                      </div>
                      <p className="rb-pending" id="hdThemPending" hidden>對方尚未給出評價。</p>
                    </div>
                  </div>
                </div>
              </div>
        
              
              <aside className="hd-aside">
                <div className="card hd-hero" data-od-id="hd-status">
                  <div className="between"><span className="hd-meta" id="hdId">CE-0000</span><span className="badge" id="hdBadge">—</span></div>
                  <div className="hd-rest" id="hdRest">—</div>
                  <div className="hd-meta" id="hdDate" style={{ marginTop: "6px" }}>—</div>
                </div>
                <div className="card" data-od-id="hd-content">
                  <p className="sec-label sec-label--lg">訂單內容</p>
                  <dl style={{ margin: "0" }}>
                    <div className="kv"><dt>餐點品項</dt><dd id="hdItems">—</dd></div>
                    <div className="kv"><dt>取餐地點</dt><dd id="hdSpot">—</dd></div>
                    <div className="kv"><dt>取餐時間</dt><dd id="hdDeadline">—</dd></div>
                    <div className="kv"><dt>訂單編號</dt><dd className="num" id="hdId2">—</dd></div>
                  </dl>
                </div>
                <div className="card" data-od-id="hd-fee">
                  <p className="sec-label sec-label--lg">系統計算帶餐費</p>
                  <span className="fee-big" id="hdFee">$0</span>
                  <p className="body-sm" style={{ marginTop: "var(--space-2)" }}>由系統依距離、餐點份量與時段固定計算，下單前已確認，雙方不另議價。</p>
                </div>
                <div id="hdActionbar" hidden><a className="btn btn-black btn--block btn--lg" id="hdAction" href="rating.html">—</a></div>
              </aside>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
