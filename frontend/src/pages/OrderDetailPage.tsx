import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "order-detail"
}
const styles = [
  ".detail-grid { display: grid; grid-template-columns: minmax(0,1fr) 360px; gap: clamp(20px,3vw,36px); align-items: start; }\n  @media (max-width: 920px) { .detail-grid { grid-template-columns: 1fr; } }\n  .detail-rest { font-size: var(--text-2xl); letter-spacing: -0.02em; }\n  .items-box { background: var(--surface-warm); border-radius: var(--radius-md); padding: var(--space-4); }\n  .items-box .line { display: flex; justify-content: space-between; gap: var(--space-3); padding: 6px 0; }\n  .items-box .line span:last-child { color: var(--muted); }\n  .person { display: flex; align-items: center; gap: var(--space-3); }\n  .person .name { font-weight: 700; }\n  .rating-line { display: flex; align-items: center; gap: 5px; margin-top: 2px; font-size: var(--text-sm); }\n  .rating-line .star-ic { width: 15px; height: 15px; fill: var(--fg); flex: 0 0 auto; }\n  .cust-tag { flex: 0 0 auto; font-size: var(--text-xs); color: var(--muted); border: 1px solid var(--border-soft); border-radius: var(--radius-pill); padding: 3px 10px; }\n  .lockmsg { display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); color: var(--muted); }\n  .lockmsg svg { width: 16px; height: 16px; stroke: var(--muted); stroke-width: 2; fill: none; flex: 0 0 auto; }\n  .accept-card { position: sticky; top: calc(var(--topbar-h) + 20px); }"
] as const
const scripts = [
  "var btn = document.getElementById(\"acceptBtn\");\n  var note = document.getElementById(\"lockNote\");\n  btn.addEventListener(\"click\", function () {\n    if (btn.dataset.locked === \"1\") { window.location.href = \"order-tracking.html?role=runner\"; return; }\n    if (btn.disabled) return;\n    btn.disabled = true; btn.textContent = \"鎖定訂單中…\";\n    setTimeout(function () {\n      btn.dataset.locked = \"1\"; btn.disabled = false; btn.textContent = \"✓ 接單成功 · 前往購買流程\";\n      while (note.firstChild) note.removeChild(note.firstChild);\n      note.textContent = \"訂單已鎖定為你的，點按上方按鈕開始購買流程。\";\n    }, 700);\n  });"
] as const

export default function OrderDetailPage() {
  return (
    <PageChrome pageId="order-detail" title="訂單詳情 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
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
        
          <div className="wrap page wrap--narrow">
            <div className="page__head">
              <p className="crumb"><a href="feed.html">接單</a> · 訂單詳情 · <span className="num">CE-2052</span></p>
            </div>
        
            <div className="detail-grid">
              <div className="stack-5" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <div className="between">
                  <span className="badge badge--open">待接單</span>
                  <span className="meta">發布於 11:58</span>
                </div>
                <div>
                  <div className="detail-rest">研三舍餐廳</div>
                  <p className="muted" style={{ marginTop: "4px" }}>滷肉飯＋貢丸湯 · 2 項餐點</p>
                </div>
                <div className="items-box">
                  <div className="line"><span>滷肉飯（大）</span><span>×1 · 加滷蛋</span></div>
                  <div className="line"><span>貢丸湯</span><span>×1 · 不要香菜</span></div>
                </div>
                <dl style={{ margin: "0" }}>
                  <div className="kv"><dt>取餐地點</dt><dd>第二教學大樓 2F</dd></div>
                  <div className="kv"><dt>期望送達</dt><dd>12:15 前</dd></div>
                  <div className="kv"><dt>備註</dt><dd>我在 201 教室門口</dd></div>
                  <div className="kv"><dt>付款</dt><dd>面交現金（餐費另計）</dd></div>
                </dl>
                <div className="card">
                  <div className="person">
                    <span className="avatar">美</span>
                    <div className="grow">
                      <div className="name">小美</div>
                      <div className="rating-line">
                        <svg className="star-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 18.6 6.1 20.8l1.2-6.6L2.4 9l6.7-.9z" /></svg>
                        <strong>4.8</strong><span className="muted">· 18 筆訂餐</span>
                      </div>
                    </div>
                    <span className="cust-tag">訂餐者</span>
                  </div>
                </div>
              </div>
        
              <aside className="accept-card">
                <div className="card stack-4">
                  <div className="between">
                    <span className="muted">帶餐費</span>
                    <span className="fee" style={{ fontSize: "var(--text-2xl)" }}>$30</span>
                  </div>
                  <p className="lockmsg" id="lockNote"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>接單後立即鎖定，其他人無法重複接</p>
                  <button className="btn btn-black btn--block btn--lg" id="acceptBtn">接下這筆訂單 · $30</button>
                </div>
              </aside>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
