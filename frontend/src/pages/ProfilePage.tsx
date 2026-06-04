import { PageChrome } from './PageChrome'
import Profile from './Profile'

const bodyAttrs: Record<string, string> = {
  'data-od-id': 'profile',
}
const styles = [
  ".prof-grid { display: grid; grid-template-columns: 360px minmax(0,1fr); gap: clamp(20px,3vw,40px); align-items: start; }\n  @media (max-width: 900px) { .prof-grid { grid-template-columns: 1fr; } }\n  .prof-head { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-6) var(--space-5); }\n  .prof-head .name { font-size: var(--text-xl); font-weight: 700; }\n  .prof-head .email { font-size: var(--text-sm); color: var(--muted); }\n  .ro { font-size: var(--text-sm); color: var(--meta); }\n  .prof-section { margin-bottom: var(--space-6); }\n  .prof-section h2 { margin-bottom: var(--space-2); }",
] as const

export default function ProfilePage() {
  return (
    <PageChrome pageId="profile" title="我的 · CampusEats" bodyAttrs={bodyAttrs} scripts={[]}>
      {styles.map((css, index) => (
        <style key={index}>{css}</style>
      ))}
      <>
        <header className="topbar">
          <div className="topbar__inner">
            <a className="topbar__brand" href="dashboard.html" data-brand-mark="">
              CampusEats
            </a>
            <nav className="topbar__nav" data-topnav="" data-active="me"></nav>
            <span className="topbar__spacer"></span>
            <div className="topbar__actions">
              <span className="role-chip" data-role-name="">
                訂餐者
              </span>
            </div>
          </div>
        </header>

        <div className="wrap page" role="main" id="main">
          <Profile />
        </div>
      </>
    </PageChrome>
  )
}
