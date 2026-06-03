import { PageChrome } from './PageChrome'
import LoginForm from './LoginForm'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "login"
}
const styles = [
  ".login { min-height: 100vh; min-height: 100dvh; display: grid; grid-template-columns: 1.02fr 1fr; }\n  @media (max-width: 880px) { .login { grid-template-columns: 1fr; } }\n\n  /* left brand panel */\n  .login__brand { background: var(--fg); color: var(--bg); padding: clamp(32px, 5vw, 64px); display: flex; flex-direction: column; }\n  @media (max-width: 880px) { .login__brand { padding-block: var(--space-8); } }\n  .login__brand .topbar__brand { color: var(--bg); font-size: var(--text-xl); }\n  .login__brand h1 { font-size: clamp(28px, 4vw, 44px); line-height: 1.08; letter-spacing: -0.03em; margin-top: auto; max-width: 16ch; }\n  .login__brand p { color: rgba(255,255,255,.7); margin-top: var(--space-4); max-width: 40ch; }\n  .login__loop { display: flex; flex-wrap: wrap; gap: 7px; margin-top: var(--space-6); margin-bottom: auto; }\n  .login__loop span { background: rgba(255,255,255,.12); border-radius: 999px; padding: 6px 12px; font-size: var(--text-xs); font-weight: 600; }\n  @media (max-width: 880px) { .login__brand h1 { margin-top: var(--space-5); } .login__loop { display: none; } }\n\n  /* right form panel */\n  .login__form { display: grid; place-items: center; padding: clamp(32px, 5vw, 64px); }\n  .login__card { width: 100%; max-width: 400px; }\n  .login__card h2 { font-size: var(--text-2xl); letter-spacing: -0.02em; }\n  .login__card .sub { color: var(--muted); font-size: var(--text-sm); margin-top: 6px; margin-bottom: var(--space-6); }\n  .role-pick { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-3); }\n  .role-opt { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 14px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); cursor: pointer; transition: border-color var(--motion-fast), background var(--motion-fast); }\n  .role-opt input { position: absolute; opacity: 0; pointer-events: none; }\n  .role-opt .ic { width: 30px; height: 30px; display: grid; place-items: center; }\n  .role-opt .ic svg { width: 22px; height: 22px; stroke: var(--fg); stroke-width: 2; fill: none; }\n  .role-opt strong { font-size: var(--text-sm); }\n  .role-opt span { font-size: var(--text-xs); color: var(--muted); }\n  .role-opt:has(input:checked) { border-color: var(--fg); background: var(--surface-warm); box-shadow: inset 0 0 0 1px var(--fg); }\n  .role-opt:has(input:focus-visible) { outline: 2px solid var(--fg); outline-offset: 2px; }\n  .role-hint { font-size: var(--text-xs); color: var(--meta); margin-bottom: var(--space-5); line-height: 1.5; }\n  .legal { font-size: var(--text-xs); color: var(--meta); text-align: center; line-height: 1.6; margin-top: var(--space-5); }\n  .legal a { text-decoration: underline; }\n  .legal-link { background: none; border: 0; padding: 0; font: inherit; color: inherit; text-decoration: underline; cursor: pointer; }",
  /* form integration: reset the LoginForm fieldset so .role-pick keeps the grid look */
  ".login__card fieldset.role-pick { border: 0; margin: 0 0 var(--space-3); padding: 0; min-inline-size: 0; }\n  .login__card legend { padding: 0; font-size: var(--text-sm); font-weight: 600; margin-bottom: 8px; }\n  .login__card .form-error { color: #c0392b; font-size: var(--text-sm); margin-top: 10px; }\n  .login__card .role-hint { margin-top: 6px; margin-bottom: 0; }"
] as const
const scripts = [] as const

export default function LoginPage() {
  return (
    <PageChrome pageId="login" title="登入 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <main className="login" id="main">
            <div className="login__brand">
              <a className="topbar__brand" href="landing.html" data-brand-mark="" data-no-role="">CampusEats</a>
              <h1>校園帶餐媒合，學生幫學生。</h1>
              <p>用學校 Email 進入，選擇這次要使用的身份。訂餐者與帶餐者是各自獨立的體驗。</p>
              <div className="login__loop" aria-hidden="true">
                <span>登入</span><span>發單</span><span>接單</span><span>狀態更新</span><span>確認收餐</span><span>評價</span>
              </div>
            </div>

            <div className="login__form">
              <div className="login__card">
                <h2>登入</h2>
                <p className="sub">用學校 Email 進入，選擇這次要使用的身份。還沒有帳號？<a href="register.html">前往註冊</a></p>

                <LoginForm />

                <p className="legal">登入即代表你同意服務條款與隱私政策。</p>
              </div>
            </div>
          </main>
      </>
    </PageChrome>
  )
}
