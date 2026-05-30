import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "rating"
}
const styles = [
  ".rate-wrap { max-width: 560px; margin-inline: auto; }\n  .rate-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-8) var(--space-6); }\n  .rate-card .who { font-size: var(--text-xl); font-weight: 700; }\n  .rate-card .sub { font-size: var(--text-sm); color: var(--muted); }\n  .rate-val { font-size: var(--text-sm); color: var(--muted); min-height: 20px; }\n  .quick-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: center; }\n  .qt { padding: 8px 14px; border: 1px solid var(--border-soft); border-radius: var(--radius-sm); font-size: var(--text-sm); background: var(--bg); transition: background var(--motion-fast), border-color var(--motion-fast); }\n  .qt.is-on { background: var(--fg); color: var(--bg); border-color: var(--fg); }\n  .done-mark { width: 72px; height: 72px; border-radius: 50%; background: var(--fg); display: grid; place-items: center; margin: 0 auto; }\n  .done-mark svg { width: 34px; height: 34px; stroke: var(--bg); stroke-width: 2.6; fill: none; }"
] as const
const scripts = [
  "var params = new URLSearchParams(location.search);\n  var role = params.get(\"role\") || CampusEats.getRole();\n  if (role === \"runner\") { document.getElementById(\"targetName\").textContent = \"訂餐者 阿哲\"; document.getElementById(\"targetAvatar\").textContent = \"哲\"; }\n\n  var TAGS = role === \"runner\"\n    ? [\"準時取餐\", \"備註清楚\", \"付款乾脆\", \"友善有禮\", \"好溝通\", \"取餐方便\", \"耐心等候\", \"體諒辛勞\"]\n    : [\"準時送達\", \"餐點正確\", \"溝通清楚\", \"包裝完整\", \"態度親切\", \"路線快速\", \"細心保溫\", \"主動回報\"];\n  document.getElementById(\"tagsHint\").textContent = \"想給\" + (role === \"runner\" ? \"訂餐者\" : \"帶餐者\") + \"什麼肯定？（可複選）\";\n  var tagWrap = document.getElementById(\"quickTags\");\n  TAGS.forEach(function (t) { var b = document.createElement(\"button\"); b.type = \"button\"; b.className = \"qt\"; b.textContent = t; tagWrap.appendChild(b); });\n  document.getElementById(\"homeBtn\").href = CampusEats.home(role);\n\n  var widget = document.getElementById(\"starWidget\");\n  var rateVal = document.getElementById(\"rateVal\");\n  var submitBtn = document.getElementById(\"submitBtn\");\n  var LABELS = { 1: \"需要改進\", 2: \"普通\", 3: \"還可以\", 4: \"很好\", 5: \"非常滿意\" };\n  var current = 0;\n  widget.addEventListener(\"rate\", function (e) { current = e.detail; rateVal.textContent = current + \" 星 · \" + LABELS[current]; submitBtn.disabled = current === 0; });\n  document.getElementById(\"quickTags\").addEventListener(\"click\", function (e) { var qt = e.target.closest(\".qt\"); if (!qt) return; qt.classList.toggle(\"is-on\"); });\n  submitBtn.addEventListener(\"click\", function () {\n    if (current === 0) return;\n    document.getElementById(\"ratePane\").hidden = true;\n    document.getElementById(\"donePane\").hidden = false;\n    toast(\"已送出 \" + current + \" 星評價\");\n    window.scrollTo({ top: 0, behavior: \"smooth\" });\n  });\n  document.getElementById(\"skipBtn\").addEventListener(\"click\", function () { window.location.href = CampusEats.home(role); });"
] as const

export default function RatingPage() {
  return (
    <PageChrome pageId="rating" title="評價 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="dashboard.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="orders"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions">
                <button className="btn btn-ghost btn--sm" id="skipBtn" type="button">略過</button>
              </div>
            </div>
          </header>
        
          <div className="wrap page">
            <div className="rate-wrap">
              <div id="ratePane" className="stack-5" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <p className="meta center" style={{ margin: "0" }}>CE-2039 · 拉亞漢堡 蛋餅＋紅茶</p>
                <div className="card rate-card">
                  <span className="avatar avatar--lg" id="targetAvatar">翔</span>
                  <div>
                    <div className="who" id="targetName">帶餐者 阿翔</div>
                    <div className="sub">交易已完成 · 為這次合作打個分數</div>
                  </div>
                  <div className="stars stars--lg" data-stars="" data-value="0" data-max="5" id="starWidget" style={{ marginTop: "var(--space-2)" }}></div>
                  <div className="rate-val" id="rateVal">點選星等</div>
                </div>
                <div>
                  <p className="body-sm center" id="tagsHint" style={{ marginBottom: "var(--space-3)" }}>想補充什麼？（選填）</p>
                  <div className="quick-tags" id="quickTags"></div>
                </div>
                <div className="field" style={{ marginBottom: "0" }}>
                  <textarea className="control" id="comment" placeholder="留下一句話（選填）"></textarea>
                  <span className="hint">以星等為主，文字評論為選填。</span>
                </div>
                <button className="btn btn-black btn--block btn--lg" id="submitBtn" disabled>送出評價</button>
              </div>
        
              <div id="donePane" hidden className="center stack-4" style={{ paddingBlock: "var(--space-12)" }}>
                <div className="done-mark"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></div>
                <h2 className="h-page">評價完成</h2>
                <p className="muted">謝謝你！雙向評價能讓校園帶餐更值得信任。</p>
                <div className="stack-3" style={{ maxWidth: "360px", marginInline: "auto", marginTop: "var(--space-4)" }}>
                  <a className="btn btn-black btn--block btn--lg" id="homeBtn" href="dashboard.html">回到首頁</a>
                  <a className="btn btn-ghost btn--block" href="my-orders.html">查看訂單紀錄</a>
                </div>
              </div>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
