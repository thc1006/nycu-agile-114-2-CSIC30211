import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "landing"
}
const styles = [
  "/* landing-only chrome ----------------------------------------------------- */\n  .lnav__inner { display: flex; align-items: center; height: var(--topbar-h); }\n  .lnav__links { display: flex; gap: var(--space-2); margin-left: var(--space-8); }\n  .lnav__links a { padding: 9px 14px; border-radius: var(--radius-sm); font-size: var(--text-sm); font-weight: 600; color: var(--muted); transition: background var(--motion-fast), color var(--motion-fast); }\n  .lnav__links a:hover { color: var(--fg); background: var(--surface-warm); }\n  @media (max-width: 820px) { .lnav__links { display: none; } }\n\n  /* hero -------------------------------------------------------------------- */\n  .hero { background: var(--fg); color: var(--bg); }\n  .hero__inner { display: grid; grid-template-columns: 1.05fr .95fr; gap: clamp(32px, 5vw, 72px); align-items: center; padding-block: clamp(56px, 9vw, 116px); }\n  @media (max-width: 940px) { .hero__inner { grid-template-columns: 1fr; gap: var(--space-8); } }\n  .hero h1 { font-size: clamp(40px, 6.4vw, 64px); line-height: 1.03; letter-spacing: -0.035em; }\n  .hero .lead { color: rgba(255,255,255,.74); font-size: clamp(16px, 2.1vw, var(--text-lg)); margin-top: var(--space-5); max-width: 46ch; }\n  .hero__cta { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }\n  .hero .btn-black { background: var(--bg); color: var(--fg); }\n  .hero .btn-black:hover { background: var(--accent-hover); }\n  .hero .btn-line { background: transparent; color: var(--bg); border-color: rgba(255,255,255,.32); }\n  .hero .btn-line:hover { background: rgba(255,255,255,.1); }\n  .hero__note { margin-top: var(--space-5); font-size: var(--text-sm); color: rgba(255,255,255,.55); }\n\n  /* browser-framed product preview ----------------------------------------- */\n  .browser { background: var(--bg); color: var(--fg); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,.4); justify-self: center; width: 100%; max-width: 460px; }\n  .browser__bar { display: flex; align-items: center; gap: 7px; padding: 12px 14px; background: var(--surface-warm); border-bottom: 1px solid var(--border-soft); }\n  .browser__bar i { width: 11px; height: 11px; border-radius: 50%; background: color-mix(in srgb, var(--fg) 16%, transparent); display: block; }\n  .browser__url { margin-left: 10px; flex: 1; background: var(--bg); border-radius: 999px; padding: 6px 14px; font-family: var(--font-mono); font-size: 12px; color: var(--meta); }\n  .browser__body { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }\n  .pv-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }\n  .pv-head b { font-size: var(--text-lg); }\n  .pv-card { border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: var(--space-4); }\n  .pv-card .r { font-weight: 700; }\n  .pv-card .m { font-size: var(--text-sm); color: var(--muted); margin-top: 4px; }\n  .pv-card .f { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-3); }\n\n  /* sections ---------------------------------------------------------------- */\n  .block { padding-block: clamp(56px, 8vw, 104px); }\n  .block + .block { border-top: 1px solid var(--border-soft); }\n  .block h2 { font-size: clamp(28px, 4vw, var(--text-3xl)); letter-spacing: -0.02em; max-width: 22ch; }\n  .lead2 { color: var(--muted); font-size: var(--text-lg); margin-top: var(--space-4); max-width: 56ch; }\n\n  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); margin-top: var(--space-8); }\n  @media (max-width: 820px) { .steps { grid-template-columns: 1fr; gap: var(--space-5); } }\n  .step { border-top: 2px solid var(--fg); padding-top: var(--space-4); }\n  .step .no { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--muted); }\n  .step h3 { font-size: var(--text-lg); margin-top: var(--space-3); }\n  .step p { color: var(--muted); font-size: var(--text-sm); margin-top: 8px; }\n\n  .duo { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); margin-top: var(--space-8); }\n  @media (max-width: 820px) { .duo { grid-template-columns: 1fr; } }\n  .duo .card { padding: var(--space-6); }\n  .duo .card h3 { font-size: var(--text-xl); }\n  .duo .card .role-k { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: .06em; text-transform: uppercase; color: var(--meta); }\n  .duo .card ul { list-style: none; padding: 0; margin: var(--space-4) 0 var(--space-5); display: flex; flex-direction: column; gap: 12px; }\n  .duo .card li { display: flex; gap: 10px; font-size: var(--text-sm); color: var(--muted); }\n  .duo .card li svg { width: 18px; height: 18px; stroke: var(--fg); stroke-width: 2; fill: none; flex: 0 0 auto; margin-top: 1px; }\n\n  .trust { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 72px); align-items: center; margin-top: var(--space-6); }\n  @media (max-width: 880px) { .trust { grid-template-columns: 1fr; gap: var(--space-6); } }\n  .mini-tl { list-style: none; padding: 0; margin: 0; }\n  .mini-tl li { position: relative; padding: 0 0 22px 28px; }\n  .mini-tl li::before { content: \"\"; position: absolute; left: 7px; top: 18px; bottom: -4px; width: 2px; background: var(--border-soft); }\n  .mini-tl li:last-child::before { display: none; }\n  .mini-tl li::after { content: \"\"; position: absolute; left: 0; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: var(--fg); }\n  .mini-tl li.up::after { background: var(--bg); border: 2px solid var(--border-soft); }\n  .mini-tl b { display: block; }\n  .mini-tl span { font-size: var(--text-sm); color: var(--muted); }\n\n  .cta { background: var(--fg); color: var(--bg); text-align: center; }\n  .cta h2 { color: var(--bg); margin-inline: auto; }\n  .cta p { color: rgba(255,255,255,.72); margin: var(--space-4) auto 0; max-width: 44ch; }\n  .cta .btn { margin-top: var(--space-6); background: var(--bg); color: var(--fg); }\n  .cta .btn:hover { background: var(--accent-hover); }\n\n  .foot { background: var(--fg); color: var(--bg); }\n  .foot__inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); padding-block: var(--space-8); }\n  .foot a, .foot span { color: rgba(255,255,255,.6); font-size: var(--text-sm); }\n  .foot a:hover { color: var(--bg); }\n  .foot .topbar__brand { color: var(--bg); }"
] as const
const scripts = [] as const

export default function LandingPage() {
  return (
    <PageChrome pageId="landing" title="CampusEats · 校園帶餐媒合" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar" data-od-id="lnav">
            <div className="wrap lnav__inner">
              <a className="topbar__brand" href="landing.html" data-brand-mark="">CampusEats</a>
              <nav className="lnav__links">
                <a href="#how">怎麼運作</a>
                <a href="#roles">兩種身份</a>
                <a href="#trust">狀態與信任</a>
              </nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions">
                <a className="btn btn-ghost btn--sm" href="login.html">登入</a>
                <a className="btn btn-black btn--sm" href="register.html">開始使用</a>
              </div>
            </div>
          </header>
        
          <section className="hero" data-od-id="hero">
            <div className="wrap hero__inner">
              <div>
                <h1>沒空買飯，<br />就交給順路的同學。</h1>
                <p className="lead">CampusEats 把校園裡分散在群組的「幫忙帶餐」需求集中起來：清楚發單、即時接單、全程狀態追蹤、雙向評價。學生幫學生的互助帶餐，現在能直接在瀏覽器裡操作。</p>
                <div className="hero__cta">
                  <a className="btn btn-black btn--lg" href="register.html">開始使用</a>
                  <a className="btn btn-line btn--lg" href="#how">看怎麼運作</a>
                </div>
                <p className="hero__note">免下載 · 用學校 Email 登入 · 訂餐者與帶餐者各自獨立的體驗</p>
              </div>
              <div className="browser" aria-hidden="true">
                <div className="browser__bar"><i></i><i></i><i></i><span className="browser__url">campuseats.app/feed</span></div>
                <div className="browser__body">
                  <div className="pv-head"><b>待接訂單</b><span className="badge badge--open">5 筆</span></div>
                  <div className="pv-card">
                    <div className="r">研三舍餐廳 · 滷肉飯＋貢丸湯</div>
                    <div className="m">第二教學大樓 2F · 12:15 前 · 同棟不繞路</div>
                    <div className="f"><span className="badge badge--open">待接單</span><span className="fee">$30<small>/單</small></span></div>
                  </div>
                  <div className="pv-card">
                    <div className="r">茶壜 · 微糖少冰珍奶 ×2</div>
                    <div className="m">綜合大樓 5F · 14:00 前 · 校門口</div>
                    <div className="f"><span className="badge badge--matched">已接單</span><span className="fee">$35<small>/單</small></span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        
          <section className="block" id="how" data-od-id="how">
            <div className="wrap">
              <p className="eyebrow">怎麼運作</p>
              <h2>從發單到收餐，一條清楚的路。</h2>
              <div className="steps">
                <div className="step"><div className="no">01</div><h3>發布需求</h3><p>填寫餐廳、餐點、取餐地點與期望時間。必填驗證＋確認摘要，帶餐費由系統依份量與時段自動計算。</p></div>
                <div className="step"><div className="no">02</div><h3>順路接單</h3><p>帶餐者上線後瀏覽待接列表，判斷順不順路、報酬合不合理，接單後立即鎖定，不怕重複接。</p></div>
                <div className="step"><div className="no">03</div><h3>追蹤與評價</h3><p>狀態即時更新，訂餐者確認收餐，雙方互相給星等，慢慢累積校園裡誰值得信任。</p></div>
              </div>
            </div>
          </section>
        
          <section className="block" id="roles" data-od-id="roles">
            <div className="wrap">
              <p className="eyebrow">兩種身份 · 各自獨立</p>
              <h2>你今天是要訂餐，還是要帶餐？</h2>
              <p className="lead2">登入時選定身份，就進入專屬視角——就像 Uber Eats 與 Uber Driver 是兩個獨立 App。要切換身份，回到登入頁重新選擇即可。</p>
              <div className="duo">
                <div className="card">
                  <span className="role-k">訂餐者</span>
                  <h3 style={{ marginTop: "6px" }}>我要訂餐</h3>
                  <ul>
                    <li><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>不離開教室或實驗室也能取得餐點</li>
                    <li><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>標準化表單，餐點與客製寫清楚</li>
                    <li><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>狀態時間軸，不必一直私訊問進度</li>
                  </ul>
                  <a className="btn btn-black btn--block" href="login.html?role=orderer">以訂餐者開始</a>
                </div>
                <div className="card">
                  <span className="role-k">帶餐者</span>
                  <h3 style={{ marginTop: "6px" }}>我要帶餐</h3>
                  <ul>
                    <li><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>在原本的路線上順手賺小額帶餐費</li>
                    <li><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>接單前看清餐廳、地點、時間、報酬</li>
                    <li><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>接單即鎖定，收入明細一目了然</li>
                  </ul>
                  <a className="btn btn-white btn--block" href="login.html?role=runner">以帶餐者開始</a>
                </div>
              </div>
            </div>
          </section>
        
          <section className="block" id="trust" data-od-id="trust">
            <div className="wrap">
              <div className="trust">
                <div>
                  <p className="eyebrow">狀態與信任</p>
                  <h2>每一步都看得見，等待不再焦慮。</h2>
                  <p className="lead2">用手動狀態更新取代複雜的即時定位：帶餐者每推進一步，訂餐者就同步看到。交易完成後雙向星等評價，慢慢累積誰值得信任。</p>
                </div>
                <ul className="mini-tl">
                  <li><b>已發布</b><span>進入待接列表</span></li>
                  <li><b>已接單</b><span>帶餐者鎖定訂單</span></li>
                  <li><b>購買中</b><span>正在店家購買</span></li>
                  <li className="up"><b>已送達</b><span>抵達取餐點，訂餐者確認收餐</span></li>
                  <li className="up"><b>已完成</b><span>雙方互相評價</span></li>
                </ul>
              </div>
            </div>
          </section>
        
          <section className="block cta" data-od-id="cta">
            <div className="wrap">
              <h2>下一餐，找個順路的同學。</h2>
              <p>登入後選擇身份，三十秒內就能發出第一張帶餐需求。</p>
              <a className="btn btn--lg" href="register.html">開始使用 CampusEats</a>
            </div>
          </section>
        
          <footer className="foot" data-od-id="footer">
            <div className="wrap foot__inner">
              <span className="topbar__brand" data-brand-mark="">CampusEats</span>
              <span>校園帶餐媒合平台</span>
              <a href="register.html">開始使用 →</a>
            </div>
          </footer>
      </>
    </PageChrome>
  )
}
