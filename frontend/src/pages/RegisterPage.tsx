import { PageChrome } from './PageChrome'
import RegisterForm from './RegisterForm'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "register"
}
const styles = [
  ".auth-top__inner { display: flex; align-items: center; height: var(--topbar-h); }\n  .auth-main { min-height: calc(100vh - var(--topbar-h)); min-height: calc(100dvh - var(--topbar-h)); display: grid; place-items: center; padding: clamp(32px, 6vw, 72px) var(--gutter); }\n  .auth-box { width: 100%; max-width: 440px; }\n  .auth-box__head { text-align: center; margin: 0 auto var(--space-6); }\n  .auth-box__head h1 { font-size: clamp(26px, 4vw, var(--text-2xl)); letter-spacing: -0.02em; }\n  .auth-box__head p { color: var(--muted); margin-top: var(--space-3); font-size: var(--text-sm); line-height: 1.6; }\n  .auth-card { border: 1px solid var(--border-soft); border-radius: var(--radius-lg); background: var(--surface); padding: var(--space-6); }\n  .auth-card .form-error { color: #c0392b; font-size: var(--text-sm); margin-top: 10px; }\n  .auth-note { margin-top: var(--space-5); text-align: center; font-size: var(--text-xs); color: var(--meta); line-height: 1.6; max-width: 52ch; margin-inline: auto; }\n  .auth-note strong { color: var(--fg); font-weight: 700; }\n  .auth-foot { text-align: center; margin-top: var(--space-4); font-size: var(--text-sm); color: var(--meta); }\n  .auth-foot a { color: var(--fg); text-decoration: underline; }"
] as const
const scripts = [] as const

export default function RegisterPage() {
  return (
    <PageChrome pageId="register" title="註冊 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="wrap auth-top__inner">
              <a className="topbar__brand" href="landing.html" data-brand-mark="">CampusEats</a>
              <span className="topbar__spacer"></span>
              <a className="btn btn-ghost btn--sm" href="login.html">已經有帳號？登入</a>
            </div>
          </header>

          <main className="auth-main" id="main">
            <div className="auth-box">
              <div className="auth-box__head">
                <p className="eyebrow" style={{ justifyContent: "center" }}>開始使用 · 建立帳號</p>
                <h1>建立你的 CampusEats 帳號</h1>
                <p>用學校 Email 註冊即可開始使用。系統不會寄驗證信,密碼至少 6 碼。身份(訂餐者 / 帶餐者)於每次登入時選擇,兩種視角共用同一個帳號。</p>
              </div>

              <div className="auth-card">
                <RegisterForm />
              </div>

              <p className="auth-note">註冊完成後會引導你前往登入。兩種身份共用同一個學校帳號,但畫面與資料<strong>完全分開</strong>。</p>
              <p className="auth-foot"><a href="login.html">已有帳號,前往登入</a></p>
            </div>
          </main>
      </>
    </PageChrome>
  )
}
