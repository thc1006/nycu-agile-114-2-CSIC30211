import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "login"
}
const styles = [
  ".login { min-height: 100vh; min-height: 100dvh; display: grid; grid-template-columns: 1.02fr 1fr; }\n  @media (max-width: 880px) { .login { grid-template-columns: 1fr; } }\n\n  /* left brand panel */\n  .login__brand { background: var(--fg); color: var(--bg); padding: clamp(32px, 5vw, 64px); display: flex; flex-direction: column; }\n  @media (max-width: 880px) { .login__brand { padding-block: var(--space-8); } }\n  .login__brand .topbar__brand { color: var(--bg); font-size: var(--text-xl); }\n  .login__brand h1 { font-size: clamp(28px, 4vw, 44px); line-height: 1.08; letter-spacing: -0.03em; margin-top: auto; max-width: 16ch; }\n  .login__brand p { color: rgba(255,255,255,.7); margin-top: var(--space-4); max-width: 40ch; }\n  .login__loop { display: flex; flex-wrap: wrap; gap: 7px; margin-top: var(--space-6); margin-bottom: auto; }\n  .login__loop span { background: rgba(255,255,255,.12); border-radius: 999px; padding: 6px 12px; font-size: var(--text-xs); font-weight: 600; }\n  @media (max-width: 880px) { .login__brand h1 { margin-top: var(--space-5); } .login__loop { display: none; } }\n\n  /* right form panel */\n  .login__form { display: grid; place-items: center; padding: clamp(32px, 5vw, 64px); }\n  .login__card { width: 100%; max-width: 400px; }\n  .login__card h2 { font-size: var(--text-2xl); letter-spacing: -0.02em; }\n  .login__card .sub { color: var(--muted); font-size: var(--text-sm); margin-top: 6px; margin-bottom: var(--space-6); }\n  .role-pick { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-3); }\n  .role-opt { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 14px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); cursor: pointer; transition: border-color var(--motion-fast), background var(--motion-fast); }\n  .role-opt input { position: absolute; opacity: 0; pointer-events: none; }\n  .role-opt .ic { width: 30px; height: 30px; display: grid; place-items: center; }\n  .role-opt .ic svg { width: 22px; height: 22px; stroke: var(--fg); stroke-width: 2; fill: none; }\n  .role-opt strong { font-size: var(--text-sm); }\n  .role-opt span { font-size: var(--text-xs); color: var(--muted); }\n  .role-opt:has(input:checked) { border-color: var(--fg); background: var(--surface-warm); box-shadow: inset 0 0 0 1px var(--fg); }\n  .role-opt:has(input:focus-visible) { outline: 2px solid var(--fg); outline-offset: 2px; }\n  .role-hint { font-size: var(--text-xs); color: var(--meta); margin-bottom: var(--space-5); line-height: 1.5; }\n  .legal { font-size: var(--text-xs); color: var(--meta); text-align: center; line-height: 1.6; margin-top: var(--space-5); }\n  .legal a { text-decoration: underline; }\n  .legal-link { background: none; border: 0; padding: 0; font: inherit; color: inherit; text-decoration: underline; cursor: pointer; }"
] as const
const scripts = [
  "// preselect the role passed from landing / register (?role=orderer|runner)\n  (function () {\n    var r = new URLSearchParams(location.search).get(\"role\");\n    if (r === \"runner\" || r === \"orderer\") {\n      var input = document.querySelector('input[name=role][value=\"' + r + '\"]');\n      if (input) input.checked = true;\n    }\n  })();\n\n  document.querySelectorAll(\"[data-legal]\").forEach(function (a) {\n    a.addEventListener(\"click\", function (e) { e.preventDefault(); toast(a.textContent.trim(), { icon: false }); });\n  });\n\n  var form = document.getElementById(\"loginForm\");\n  var continueBtn = document.getElementById(\"continueBtn\");\n  function currentRole() { var c = form.querySelector(\"input[name=role]:checked\"); return c ? c.value : \"orderer\"; }\n  function syncHref() { continueBtn.setAttribute(\"href\", CampusEats.home(currentRole())); }\n  form.querySelectorAll(\"input[name=role]\").forEach(function (r) { r.addEventListener(\"change\", syncHref); });\n  syncHref();\n\n  function validate() {\n    var ok = true;\n    [document.getElementById(\"email\"), document.getElementById(\"pw\")].forEach(function (input) {\n      var field = input.closest(\".field\");\n      var valid = input.value.trim() !== \"\" && (input.type !== \"email\" || /.+@.+\\..+/.test(input.value));\n      field.classList.toggle(\"has-error\", !valid);\n      if (!valid) ok = false;\n    });\n    return ok;\n  }\n  continueBtn.addEventListener(\"click\", function (e) {\n    if (!validate()) { e.preventDefault(); return; }\n    CampusEats.setRole(currentRole());\n    continueBtn.setAttribute(\"href\", CampusEats.home(currentRole()));\n  });\n  form.addEventListener(\"submit\", function (e) { e.preventDefault(); if (!validate()) return; CampusEats.setRole(currentRole()); continueBtn.click(); });"
] as const

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
                <p className="sub">用學校 Email 進入，選擇這次要使用的身份。</p>
        
                <form id="loginForm" noValidate>
                  <div className="field">
                    <label htmlFor="email">學校 Email<span className="req">*</span></label>
                    <input className="control" type="email" id="email" name="email" placeholder="you@campus.edu" autoComplete="email" defaultValue="student@campus.edu" />
                    <div className="field__error"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>請輸入有效的學校 Email</div>
                  </div>
                  <div className="field">
                    <label htmlFor="pw">密碼<span className="req">*</span></label>
                    <input className="control" type="password" id="pw" name="pw" placeholder="輸入密碼" autoComplete="current-password" />
                    <div className="field__error"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>請輸入密碼</div>
                  </div>
        
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "600", display: "block", marginBottom: "8px" }}>這次要進入哪一種視角？<span className="req">*</span></span>
                  <div className="role-pick" role="radiogroup" aria-label="選擇進入的視角">
                    <label className="role-opt">
                      <input type="radio" name="role" value="orderer" defaultChecked />
                      <span className="ic"><svg viewBox="0 0 24 24"><path d="M3 7h18M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M9 7V5a3 3 0 0 1 6 0v2" /></svg></span>
                      <strong>訂餐者</strong><span>發單請人帶餐</span>
                    </label>
                    <label className="role-opt">
                      <input type="radio" name="role" value="runner" />
                      <span className="ic"><svg viewBox="0 0 24 24"><path d="M13 3l-2 5h4l-3 8M5 13h4M15 13h4" /><circle cx="6.5" cy="18.5" r="2.5" /><circle cx="17.5" cy="18.5" r="2.5" /></svg></span>
                      <strong>帶餐者</strong><span>順路接單賺費</span>
                    </label>
                  </div>
                  <p className="role-hint">兩種視角是各自獨立的體驗，登入後只會看到所選身份的畫面。要換到另一種身份，回到這頁重新選擇即可。</p>
        
                  <a href="dashboard.html" id="continueBtn" role="button" className="btn btn-black btn--block btn--lg" data-no-role="" style={{ textDecoration: "none" }}>繼續</a>
                </form>
        
                <p className="legal">繼續即代表你同意 <button type="button" className="legal-link" data-legal="">服務條款</button> 與 <button type="button" className="legal-link" data-legal="">隱私政策</button>。</p>
              </div>
            </div>
          </main>
      </>
    </PageChrome>
  )
}
