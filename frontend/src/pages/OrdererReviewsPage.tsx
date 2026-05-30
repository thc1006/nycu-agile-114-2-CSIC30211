import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "orderer-reviews"
}
const styles = [
  ".rev-grid { display: grid; grid-template-columns: 340px minmax(0,1fr); gap: clamp(20px,3vw,40px); align-items: start; }\n  @media (max-width: 900px) { .rev-grid { grid-template-columns: 1fr; } }\n  .score-hero { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding-block: var(--space-4) var(--space-3); }\n  .score-hero .big { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 64px; font-weight: 700; line-height: 1; letter-spacing: -0.03em; }\n  .score-hero .count { font-size: var(--text-sm); color: var(--muted); }\n  .dist { display: flex; flex-direction: column; gap: 8px; }\n  .dist-row { display: grid; grid-template-columns: 28px 1fr 36px; align-items: center; gap: var(--space-3); }\n  .dist-row .star-n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-sm); color: var(--muted); text-align: right; }\n  .dist-row .track { height: 6px; border-radius: var(--radius-sm); background: var(--surface-warm); overflow: hidden; }\n  .dist-row .fill { height: 100%; border-radius: var(--radius-sm); background: var(--fg); }\n  .dist-row .pct { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-xs); color: var(--meta); text-align: right; }\n  .compliments { display: flex; flex-wrap: wrap; gap: 8px; }\n  .compliments .tag { font-size: var(--text-sm); }\n  .compliments .tag b { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; color: var(--fg); margin-left: 6px; }\n  .review { padding: var(--space-4) 0; border-bottom: 1px solid var(--border-soft); }\n  .review:last-child { border-bottom: none; }\n  .review .top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }\n  .review .who { font-weight: 600; font-size: var(--text-sm); }\n  .review .date { font-size: var(--text-xs); color: var(--meta); margin-top: 2px; }\n  .review p { font-size: var(--text-sm); color: var(--muted); margin-top: 8px; }\n  .review .rb-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n  .rev-aside { position: sticky; top: calc(var(--topbar-h) + 20px); display: flex; flex-direction: column; gap: var(--space-4); }"
] as const
const scripts = [] as const

export default function OrdererReviewsPage() {
  return (
    <PageChrome pageId="orderer-reviews" title="我的評價 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="dashboard.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="me"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions"><span className="role-chip" data-role-name="">訂餐者</span></div>
            </div>
          </header>
        
          <div className="wrap page">
            <div className="page__head"><p className="crumb"><a href="profile.html">我的</a> · 我的評價</p><h1>我的評價</h1></div>
        
            <div className="rev-grid">
              <aside className="rev-aside">
                <div className="card">
                  <div className="score-hero">
                    <div className="big">4.9</div>
                    <span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span>
                    <div className="count">來自 18 次訂餐 · 15 則文字評價</div>
                  </div>
                  <hr className="hr" />
                  <div className="dist">
                    <div className="dist-row"><span className="star-n">5★</span><span className="track"><span className="fill" style={{ width: "89%" }}></span></span><span className="pct">89%</span></div>
                    <div className="dist-row"><span className="star-n">4★</span><span className="track"><span className="fill" style={{ width: "11%" }}></span></span><span className="pct">11%</span></div>
                    <div className="dist-row"><span className="star-n">3★</span><span className="track"><span className="fill" style={{ width: "0%" }}></span></span><span className="pct">0%</span></div>
                    <div className="dist-row"><span className="star-n">2★</span><span className="track"><span className="fill" style={{ width: "0%" }}></span></span><span className="pct">0%</span></div>
                    <div className="dist-row"><span className="star-n">1★</span><span className="track"><span className="fill" style={{ width: "0%" }}></span></span><span className="pct">0%</span></div>
                  </div>
                </div>
                <div className="card">
                  <p className="sec-label">帶餐者最常給你的肯定</p>
                  <div className="compliments">
                    <span className="tag">準時取餐<b>16</b></span><span className="tag">備註清楚<b>14</b></span><span className="tag">付款乾脆<b>13</b></span><span className="tag">友善有禮<b>11</b></span><span className="tag">好溝通<b>9</b></span><span className="tag">取餐方便<b>8</b></span><span className="tag">耐心等候<b>6</b></span><span className="tag">體諒辛勞<b>5</b></span>
                  </div>
                </div>
              </aside>
        
              <section>
                <p className="sec-label">全部評價</p>
                <div className="card">
                  <div className="review"><div className="top"><div><div className="who">阿翔（帶餐者）</div><div className="date">昨天 12:35 · 拉亞漢堡</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>備註寫得很清楚，到圖書館門口馬上就現身，現金也準備好零錢，超好帶。</p><div className="rb-tags"><span className="tag">備註清楚</span><span className="tag">準時取餐</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">小美（帶餐者）</div><div className="date">前天 11:50 · 茶壜</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>下單後馬上回訊息確認甜度，取餐很乾脆，付款也很快。</p><div className="rb-tags"><span className="tag">好溝通</span><span className="tag">付款乾脆</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">阿哲（帶餐者）</div><div className="date">5/27 10:25 · 阿嬤的飯桶</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="4" data-max="5"></span></div><p>準時到取餐點，態度也客氣，整體很順利。</p><div className="rb-tags"><span className="tag">準時取餐</span><span className="tag">友善有禮</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">小琳（帶餐者）</div><div className="date">5/26 14:05 · 小木屋鬆餅</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>取餐地點寫得很精準，不用找人，謝謝你還說了一聲辛苦了。</p><div className="rb-tags"><span className="tag">備註清楚</span><span className="tag">友善有禮</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">小宇（帶餐者）</div><div className="date">5/25 12:20 · 拉亞漢堡</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>現金剛好不用找零，溝通也很快，下次有單還想接你的。</p><div className="rb-tags"><span className="tag">付款乾脆</span><span className="tag">好溝通</span></div></div>
                  <div className="review"><div className="top"><div><div className="who">阿仁（帶餐者）</div><div className="date">5/24 09:55 · 茶壜</div></div><span className="stars stars--static" data-stars="" data-readonly="" data-value="5" data-max="5"></span></div><p>備註有寫不要香菜，取餐也準時，很好配合。</p><div className="rb-tags"><span className="tag">備註清楚</span><span className="tag">準時取餐</span></div></div>
                </div>
              </section>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
