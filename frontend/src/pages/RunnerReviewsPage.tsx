import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "runner-reviews"
}
const styles = [
  ".rev-grid { display: grid; grid-template-columns: 340px minmax(0,1fr); gap: clamp(20px,3vw,40px); align-items: start; }\n  @media (max-width: 900px) { .rev-grid { grid-template-columns: 1fr; } }\n  .score-hero { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding-block: var(--space-4) var(--space-3); }\n  .score-hero .big { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 64px; font-weight: 700; line-height: 1; letter-spacing: -0.03em; }\n  .score-hero .count { font-size: var(--text-sm); color: var(--muted); }\n  .dist { display: flex; flex-direction: column; gap: 8px; }\n  .dist-row { display: grid; grid-template-columns: 28px 1fr 36px; align-items: center; gap: var(--space-3); }\n  .dist-row .star-n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-sm); color: var(--muted); text-align: right; }\n  .dist-row .track { height: 6px; border-radius: var(--radius-sm); background: var(--surface-warm); overflow: hidden; }\n  .dist-row .fill { height: 100%; border-radius: var(--radius-sm); background: var(--fg); }\n  .dist-row .pct { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-xs); color: var(--meta); text-align: right; }\n  .compliments { display: flex; flex-wrap: wrap; gap: 8px; }\n  .compliments .tag { font-size: var(--text-sm); }\n  .compliments .tag b { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; color: var(--fg); margin-left: 6px; }\n  .review { padding: var(--space-4) 0; border-bottom: 1px solid var(--border-soft); }\n  .review:last-child { border-bottom: none; }\n  .review .top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }\n  .review .who { font-weight: 600; font-size: var(--text-sm); }\n  .review .date { font-size: var(--text-xs); color: var(--meta); margin-top: 2px; }\n  .review p { font-size: var(--text-sm); color: var(--muted); margin-top: 8px; }\n  .review .rb-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n  .rev-aside { position: sticky; top: calc(var(--topbar-h) + 20px); display: flex; flex-direction: column; gap: var(--space-4); }"
] as const
const scripts = [] as const

export default function RunnerReviewsPage() {
  return (
    <PageChrome pageId="runner-reviews" title="帶餐評價 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="feed.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="me"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions"><span className="role-chip" data-role-name="">帶餐者</span></div>
            </div>
          </header>
        
          <div className="wrap page">
            <div className="page__head"><p className="crumb"><a href="profile.html">我的</a> · 帶餐評價</p><h1>帶餐評價</h1></div>
        
            <div className="rev-grid">
              <aside className="rev-aside">
                <div className="card">
                  <div className="score-hero">
                    <div className="big">4.9</div>
                    <span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span>
                    <div className="count">來自 32 次帶餐 · 28 則文字評價</div>
                  </div>
                  <hr className="hr" />
                  <div className="dist">
                    <div className="dist-row"><span className="star-n">5★</span><span className="track"><span className="fill" style={{ width: "90%" }}></span></span><span className="pct">90%</span></div>
                    <div className="dist-row"><span className="star-n">4★</span><span className="track"><span className="fill" style={{ width: "8%" }}></span></span><span className="pct">8%</span></div>
                    <div className="dist-row"><span className="star-n">3★</span><span className="track"><span className="fill" style={{ width: "2%" }}></span></span><span className="pct">2%</span></div>
                    <div className="dist-row"><span className="star-n">2★</span><span className="track"><span className="fill" style={{ width: "0%" }}></span></span><span className="pct">0%</span></div>
                    <div className="dist-row"><span className="star-n">1★</span><span className="track"><span className="fill" style={{ width: "0%" }}></span></span><span className="pct">0%</span></div>
                  </div>
                </div>
                <div className="card">
                  <p className="sec-label">訂餐者最常給你的肯定</p>
                  <div className="compliments">
                    <span className="tag">準時送達<b>28</b></span><span className="tag">餐點正確<b>25</b></span><span className="tag">溝通清楚<b>19</b></span><span className="tag">包裝完整<b>12</b></span><span className="tag">態度親切<b>11</b></span><span className="tag">路線快速<b>9</b></span><span className="tag">細心保溫<b>7</b></span><span className="tag">主動回報<b>6</b></span>
                  </div>
                </div>
              </aside>
        
              <section>
                <p className="sec-label">全部評價</p>
                <div className="card">
                  <div className="review"><div className="top"><div><div className="who">阿哲（訂餐者）</div><div className="date">昨天 12:30 · 阿嬤的飯桶</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>準時又有先問清楚冰塊甜度，很安心，下次還要找他帶。</p><div className="rb-tags"><span className="tag">準時送達</span><span className="tag">溝通清楚</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">小美（訂餐者）</div><div className="date">前天 11:45 · 拉亞漢堡</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>餐點完全正確，送到圖書館門口還傳訊息提醒。</p><div className="rb-tags"><span className="tag">餐點正確</span><span className="tag">包裝完整</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">阿翔（訂餐者）</div><div className="date">5/27 10:20 · 茶壜</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="4" data-max="5"></span></div><p>取餐很準時，溝通清楚，給好評。</p><div className="rb-tags"><span className="tag">準時送達</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">小琳（訂餐者）</div><div className="date">5/26 14:00 · 茶壜</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>飲料封口很牢、完全沒灑出來，還幫忙多拿了一根吸管，超貼心。</p><div className="rb-tags"><span className="tag">包裝完整</span><span className="tag">態度親切</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">小宇（訂餐者）</div><div className="date">5/25 12:15 · 阿嬤的飯桶</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>便當還是熱的，配菜也照我備註不要辣，完全正確。</p><div className="rb-tags"><span className="tag">餐點正確</span><span className="tag">準時送達</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">阿仁（訂餐者）</div><div className="date">5/24 09:50 · 小木屋鬆餅</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>提早五分鐘到，等我下課很有耐心，謝謝！</p><div className="rb-tags"><span className="tag">態度親切</span><span className="tag">溝通清楚</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">家瑜（訂餐者）</div><div className="date">5/23 13:10 · 拉亞漢堡</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>第一次找他帶就很順利，下單到拿到餐不到半小時。</p><div className="rb-tags"><span className="tag">準時送達</span></div></div>
                </div>
              </section>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
