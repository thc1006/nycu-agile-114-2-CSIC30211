import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "register"
}
const styles = [
  ".auth-top__inner { display: flex; align-items: center; height: var(--topbar-h); }\n  .auth-main { min-height: calc(100vh - var(--topbar-h)); min-height: calc(100dvh - var(--topbar-h)); display: grid; place-items: center; padding: clamp(32px, 6vw, 72px) var(--gutter); }\n  .auth-box { width: 100%; max-width: 880px; }\n  .auth-box__head { text-align: center; max-width: 52ch; margin: 0 auto var(--space-8); }\n  .auth-box__head h1 { font-size: clamp(28px, 4.4vw, var(--text-3xl)); letter-spacing: -0.02em; }\n  .auth-box__head p { color: var(--muted); margin-top: var(--space-3); }\n  .role-cards { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); }\n  @media (max-width: 720px) { .role-cards { grid-template-columns: 1fr; } }\n  .role-card {\n    display: flex; flex-direction: column; gap: var(--space-3);\n    padding: var(--space-6); border: 1px solid var(--border-soft); border-radius: var(--radius-lg);\n    background: var(--surface); transition: border-color var(--motion-fast), box-shadow var(--motion-fast), transform var(--motion-fast);\n  }\n  .role-card:hover { box-shadow: var(--elev-raised); transform: translateY(-3px); border-color: transparent; }\n  .role-card__icon { width: 56px; height: 56px; border-radius: 50%; background: var(--surface-warm); display: grid; place-items: center; }\n  .role-card__icon svg { width: 28px; height: 28px; stroke: var(--fg); stroke-width: 2; fill: none; }\n  .role-card h2 { font-size: var(--text-xl); }\n  .role-card .k { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: .06em; text-transform: uppercase; color: var(--meta); }\n  .role-card .desc { color: var(--muted); font-size: var(--text-sm); flex: 1; }\n  .role-card .btn { margin-top: var(--space-2); }\n  .auth-note { margin-top: var(--space-6); text-align: center; font-size: var(--text-sm); color: var(--muted); max-width: 56ch; margin-inline: auto; }\n  .auth-note strong { color: var(--fg); font-weight: 700; }\n  .auth-foot { text-align: center; margin-top: var(--space-5); font-size: var(--text-sm); color: var(--meta); }\n  .auth-foot a { color: var(--fg); text-decoration: underline; }"
] as const
const scripts = [] as const

export default function RegisterPage() {
  return (
    <PageChrome pageId="register" title="選擇身份 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="wrap auth-top__inner">
              <a className="topbar__brand" href="landing.html" data-brand-mark="">CampusEats</a>
              <span className="topbar__spacer"></span>
              <a className="btn btn-ghost btn--sm" href="login.html">已經有身份？登入</a>
            </div>
          </header>
        
          <main className="auth-main" id="main">
            <div className="auth-box">
              <div className="auth-box__head">
                <p className="eyebrow" style={{ justifyContent: "center" }}>開始使用 · 選擇身份</p>
                <h1>這次想用哪一種身份進入？</h1>
                <p>CampusEats 的訂餐者與帶餐者是兩條各自獨立的流程。先選好身份，下一步用學校 Email 登入，就會進入該身份的專屬視角。</p>
              </div>
        
              <div className="role-cards">
                <div className="role-card" data-od-id="role-orderer">
                  <span className="role-card__icon"><svg viewBox="0 0 24 24"><path d="M3 7h18M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M9 7V5a3 3 0 0 1 6 0v2" /></svg></span>
                  <span className="k">訂餐者</span>
                  <h2>我要訂餐</h2>
                  <p className="desc">沒空買飯，發一張帶餐需求，請順路的同學幫你帶。可追蹤狀態、確認收餐、為帶餐者評價。</p>
                  <a className="btn btn-black btn--block btn--lg" href="login.html?role=orderer">以訂餐者身份登入 →</a>
                </div>
        
                <div className="role-card" data-od-id="role-runner">
                  <span className="role-card__icon"><svg viewBox="0 0 24 24"><path d="M13 3l-2 5h4l-3 8M5 13h4M15 13h4" /><circle cx="6.5" cy="18.5" r="2.5" /><circle cx="17.5" cy="18.5" r="2.5" /></svg></span>
                  <span className="k">帶餐者</span>
                  <h2>我要帶餐</h2>
                  <p className="desc">本來就要外出，順路接單賺帶餐費。上線後瀏覽待接、接單鎖定、更新狀態、查看收入明細。</p>
                  <a className="btn btn-white btn--block btn--lg" href="login.html?role=runner">以帶餐者身份登入 →</a>
                </div>
              </div>
        
              <p className="auth-note">兩種身份共用同一個學校帳號，但畫面與資料<strong>完全分開</strong>：帶單紀錄不會出現在訂單紀錄裡。要換身份，回到這頁重新選擇即可。</p>
              <p className="auth-foot">使用學校信箱註冊，立即開始發單或接單。<a href="login.html">已有帳號，前往登入</a></p>
            </div>
          </main>
      </>
    </PageChrome>
  )
}
