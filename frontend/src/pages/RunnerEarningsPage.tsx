import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "runner-earnings"
}
const styles = [
  ".earn-grid { display: grid; grid-template-columns: 340px minmax(0,1fr); gap: clamp(20px,3vw,40px); align-items: start; }\n  @media (max-width: 900px) { .earn-grid { grid-template-columns: 1fr; } }\n  .earn-aside { position: sticky; top: calc(var(--topbar-h) + 20px); display: flex; flex-direction: column; gap: var(--space-4); }\n  .earn-hero { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; padding-block: var(--space-5) var(--space-4); }\n  .earn-hero .period { font-size: var(--text-sm); color: var(--muted); }\n  .earn-hero .big { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 60px; font-weight: 700; line-height: 1; letter-spacing: -0.03em; }\n  .earn-hero .sub { font-size: var(--text-sm); color: var(--meta); }\n  .week { display: grid; grid-template-columns: repeat(7,1fr); gap: var(--space-2); align-items: end; height: 140px; }\n  .week .bar-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 8px; height: 100%; }\n  .week .bar { width: 60%; max-width: 28px; border-radius: var(--radius-sm); background: var(--surface-warm); }\n  .week .bar.on { background: var(--fg); }\n  .week .day { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-xs); color: var(--meta); }\n  .week .day.today { color: var(--fg); font-weight: 700; }\n  .mini { display: grid; grid-template-columns: repeat(3,1fr); text-align: center; margin-top: var(--space-4); border-top: 1px solid var(--border-soft); }\n  .mini > div { padding: var(--space-3) 0; }\n  .mini > div + div { border-left: 1px solid var(--border-soft); }\n  .mini .n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; font-size: var(--text-lg); }\n  .mini .l { font-size: var(--text-xs); color: var(--meta); margin-top: 2px; }\n  .brk-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) 0; border-bottom: 1px solid var(--border-soft); }\n  .brk-row:last-of-type { border-bottom: none; }\n  .brk-row .lbl { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); }\n  .brk-row .val { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 600; }\n  .brk-total { display: flex; align-items: center; justify-content: space-between; padding-top: var(--space-3); margin-top: var(--space-1); border-top: 1.5px solid var(--fg); }\n  .brk-total .lbl { font-weight: 700; }\n  .brk-total .val { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; font-size: var(--text-xl); }\n  .trip { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--border-soft); }\n  .trip:last-child { border-bottom: none; }\n  .trip .meta-l { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }\n  .trip .tdot { width: 36px; height: 36px; flex: none; border-radius: var(--radius-md); background: var(--surface-warm); display: grid; place-items: center; }\n  .trip .tdot svg { width: 16px; height: 16px; stroke: var(--fg); fill: none; stroke-width: 2; }\n  .trip .store { font-weight: 600; font-size: var(--text-sm); }\n  .trip .when { font-size: var(--text-xs); color: var(--meta); margin-top: 2px; }\n  .trip .amt { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; }"
] as const
const scripts = [] as const

export default function RunnerEarningsPage() {
  return (
    <PageChrome pageId="runner-earnings" title="收入明細 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="feed.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="earn"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions"><span className="role-chip" data-role-name="">帶餐者</span></div>
            </div>
          </header>
        
          <div className="wrap page">
            <div className="page__head"><p className="crumb"><a href="profile.html">我的</a> · 收入明細</p><h1>收入明細</h1></div>
        
            <div className="earn-grid">
              <aside className="earn-aside">
                <div className="card">
                  <div className="earn-hero">
                    <div className="period">本月帶餐收入</div>
                    <div className="big">$640</div>
                    <div className="sub">5 月 1 日 – 5 月 29 日 · 32 趟</div>
                  </div>
                </div>
                <div className="card">
                  <p className="sec-label">本月收入組成</p>
                  <div className="brk-row"><span className="lbl"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4" /></svg></span>帶餐費</span><span className="val">$512</span></div>
                  <div className="brk-row"><span className="lbl"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg></span>距離加給</span><span className="val">$48</span></div>
                  <div className="brk-row"><span className="lbl"><span className="rowlink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 18.2 6.1 21.3l1.2-6.6L2.5 9l6.6-.9z" /></svg></span>訂餐者感謝金</span><span className="val">$80</span></div>
                  <div className="brk-total"><span className="lbl">合計</span><span className="val">$640</span></div>
                  <p className="body-sm" style={{ marginTop: "var(--space-3)" }}>收款方式：面交現金 · 每週結算</p>
                </div>
              </aside>
        
              <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <div className="card">
                  <p className="sec-label">本週 · $185</p>
                  <div className="week">
                    <div className="bar-col"><span className="bar" style={{ height: "30%" }}></span><span className="day">一</span></div>
                    <div className="bar-col"><span className="bar" style={{ height: "55%" }}></span><span className="day">二</span></div>
                    <div className="bar-col"><span className="bar" style={{ height: "20%" }}></span><span className="day">三</span></div>
                    <div className="bar-col"><span className="bar on" style={{ height: "80%" }}></span><span className="day">四</span></div>
                    <div className="bar-col"><span className="bar on" style={{ height: "100%" }}></span><span className="day today">五</span></div>
                    <div className="bar-col"><span className="bar" style={{ height: "0%" }}></span><span className="day">六</span></div>
                    <div className="bar-col"><span className="bar" style={{ height: "0%" }}></span><span className="day">日</span></div>
                  </div>
                  <div className="mini">
                    <div><div className="n">$60</div><div className="l">今日</div></div>
                    <div><div className="n">2</div><div className="l">今日趟數</div></div>
                    <div><div className="n">$20</div><div className="l">平均單趟</div></div>
                  </div>
                </div>
        
                <div className="card">
                  <p className="sec-label">近期帶餐收入</p>
                  <div className="trip"><div className="meta-l"><span className="tdot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11h18l-1.5 9h-15zM7 11V8a5 5 0 0 1 10 0v3" /></svg></span><div><div className="store">阿嬤的飯桶</div><div className="when">今天 12:30 · 圖書館 1F</div></div></div><span className="amt">+$30</span></div>
                  <div className="trip"><div className="meta-l"><span className="tdot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11h18l-1.5 9h-15zM7 11V8a5 5 0 0 1 10 0v3" /></svg></span><div><div className="store">茶壜</div><div className="when">今天 10:15 · 工學院</div></div></div><span className="amt">+$30</span></div>
                  <div className="trip"><div className="meta-l"><span className="tdot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11h18l-1.5 9h-15zM7 11V8a5 5 0 0 1 10 0v3" /></svg></span><div><div className="store">拉亞漢堡</div><div className="when">昨天 11:45 · 宿舍 B 棟</div></div></div><span className="amt">+$25</span></div>
                  <div className="trip"><div className="meta-l"><span className="tdot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11h18l-1.5 9h-15zM7 11V8a5 5 0 0 1 10 0v3" /></svg></span><div><div className="store">小木屋鬆餅</div><div className="when">5/27 10:20 · 圖書館 1F</div></div></div><span className="amt">+$20</span></div>
                  <div className="trip"><div className="meta-l"><span className="tdot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11h18l-1.5 9h-15zM7 11V8a5 5 0 0 1 10 0v3" /></svg></span><div><div className="store">茶壜</div><div className="when">5/26 14:00 · 工學院</div></div></div><span className="amt">+$30</span></div>
                </div>
              </section>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
