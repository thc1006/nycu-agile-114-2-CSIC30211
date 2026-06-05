import { PageChrome } from './PageChrome'
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  APP_VERSION,
  COURSE,
  LICENSE,
  LIVE_URL,
  REPO_URL,
} from '../lib/appInfo'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'about',
}

const styles = [
  ".about { max-width: 880px; }\n  .about__hero { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }\n  .about__ver { font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; letter-spacing: .04em; border: 1px solid var(--border-soft); border-radius: 999px; padding: 4px 10px; color: var(--muted); }\n  .about__lead { color: var(--muted); font-size: var(--text-lg); margin-top: var(--space-4); max-width: 60ch; }\n  .about section { margin-top: var(--space-7); }\n  .about section > h2 { font-size: var(--text-xl); letter-spacing: -0.01em; margin-bottom: var(--space-3); }\n  .about__loop { display: flex; flex-wrap: wrap; gap: 7px; }\n  .about__loop span { background: var(--surface-warm); border: 1px solid var(--border-soft); border-radius: 999px; padding: 6px 12px; font-size: var(--text-sm); font-weight: 600; }\n  .about__cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }\n  @media (max-width: 720px) { .about__cols { grid-template-columns: 1fr; } }\n  .about__cols .card { padding: var(--space-5); }\n  .about__cols .card .role-k { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: .06em; text-transform: uppercase; color: var(--meta); }\n  .about__cols .card h3 { font-size: var(--text-lg); margin-top: 6px; }\n  .about__cols .card p { color: var(--muted); font-size: var(--text-sm); margin-top: 8px; }\n  .about__meta { list-style: none; padding: 0; margin: 0; border: 1px solid var(--border-soft); border-radius: var(--radius-md); }\n  .about__meta li { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: 14px var(--space-4); }\n  .about__meta li + li { border-top: 1px solid var(--border-soft); }\n  .about__meta .k { color: var(--meta); font-size: var(--text-sm); }\n  .about__meta .v { font-weight: 600; text-align: right; }\n  .about__meta .v a { text-decoration: underline; text-underline-offset: 2px; }\n  .about__cta { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }",
] as const

export default function AboutPage() {
  return (
    <PageChrome pageId="about" title="關於 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
      {styles.map((css, index) => (
        <style key={index}>{css}</style>
      ))}
      <>
        <header className="topbar">
          <div className="topbar__inner">
            <a className="topbar__brand" href="landing.html" data-brand-mark="" data-no-role="">
              {APP_NAME}
            </a>
            <span className="topbar__spacer"></span>
            <div className="topbar__actions">
              <a className="btn btn-white btn--sm" href="login.html">
                登入
              </a>
            </div>
          </div>
        </header>

        <div className="wrap page" role="main" id="main">
          <div className="about">
            <div className="page__head">
              <div className="about__hero">
                <h1>關於 {APP_NAME}</h1>
                <span className="about__ver">v{APP_VERSION}</span>
              </div>
              <p className="about__lead">{APP_DESCRIPTION}</p>
            </div>

            <section aria-labelledby="about-loop">
              <h2 id="about-loop">怎麼運作</h2>
              <p className="muted" style={{ marginBottom: 'var(--space-3)' }}>
                {APP_TAGLINE}。一筆訂單從發出到完成，會走過這條閉環：
              </p>
              <div className="about__loop" aria-hidden="true">
                <span>註冊 / 登入</span>
                <span>發單</span>
                <span>瀏覽待接</span>
                <span>接單</span>
                <span>開始購買</span>
                <span>已送達</span>
                <span>確認收餐</span>
                <span>雙向評價</span>
              </div>
            </section>

            <section aria-labelledby="about-roles">
              <h2 id="about-roles">兩種身份</h2>
              <div className="about__cols">
                <div className="card">
                  <div className="role-k">Orderer</div>
                  <h3>訂餐者</h3>
                  <p>發出帶餐需求、設定取餐地點與時間，追蹤狀態並在收到後確認、評價。</p>
                </div>
                <div className="card">
                  <div className="role-k">Runner</div>
                  <h3>帶餐者</h3>
                  <p>瀏覽附近順路的待接訂單，接單後更新「購買中 / 已送達」，完成後賺取帶餐費。</p>
                </div>
              </div>
              <p className="muted" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                身份是每次登入時選擇的「使用模式」，不是綁定帳號的屬性 —— 同一個帳號兩種身份都能用。
              </p>
            </section>

            <section aria-labelledby="about-tech">
              <h2 id="about-tech">技術架構</h2>
              <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>
                前端 React + Vite + TypeScript（react-router 單頁應用）；後端 FastAPI + Redis，JWT
                驗證、訂單狀態機與每筆訂單的接單鎖；跨角色狀態以輪詢（4–5 秒）近即時同步。整套以
                Docker 容器化，部署於 Kubernetes（campuseat.hsuan.app）。
              </p>
            </section>

            <section aria-labelledby="about-meta">
              <h2 id="about-meta">專案資訊</h2>
              <ul className="about__meta">
                <li>
                  <span className="k">版本</span>
                  <span className="v">v{APP_VERSION} (MVP)</span>
                </li>
                <li>
                  <span className="k">課程</span>
                  <span className="v">{COURSE}</span>
                </li>
                <li>
                  <span className="k">授權</span>
                  <span className="v">{LICENSE}</span>
                </li>
                <li>
                  <span className="k">原始碼</span>
                  <span className="v">
                    <a href={REPO_URL} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  </span>
                </li>
                <li>
                  <span className="k">線上服務</span>
                  <span className="v">
                    <a href={LIVE_URL} target="_blank" rel="noreferrer">
                      campuseat.hsuan.app
                    </a>
                  </span>
                </li>
              </ul>

              <div className="about__cta">
                <a className="btn btn-black btn--lg" href="register.html">
                  開始使用
                </a>
                <a className="btn btn-white btn--lg" href={REPO_URL} target="_blank" rel="noreferrer">
                  在 GitHub 上查看
                </a>
              </div>
            </section>
          </div>
        </div>
      </>
    </PageChrome>
  )
}
