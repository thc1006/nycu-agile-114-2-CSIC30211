import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "index"
}
const styles = [
  ".head { background: var(--fg); color: var(--bg); }\n  .head .wrap { padding-block: clamp(40px, 7vw, 72px); }\n  .head .topbar__brand { color: var(--bg); font-size: var(--text-xl); }\n  .head h1 { font-size: clamp(30px, 5vw, 46px); line-height: 1.06; margin-top: var(--space-5); max-width: 20ch; letter-spacing: -0.03em; }\n  .head p { color: rgba(255,255,255,.72); margin-top: var(--space-4); max-width: 58ch; }\n  .head .btns { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }\n  .head .btn-black { background: var(--bg); color: var(--fg); }\n  .head .btn-black:hover { background: var(--accent-hover); }\n  .head .btn-out { background: transparent; color: var(--bg); border-color: rgba(255,255,255,.3); }\n  .head .btn-out:hover { background: rgba(255,255,255,.1); }\n  .loop { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: var(--space-6); }\n  .loop .node { background: rgba(255,255,255,.12); border-radius: var(--radius-sm); padding: 7px 14px; font-size: var(--text-sm); font-weight: 500; white-space: nowrap; }\n  .loop .arr { color: rgba(255,255,255,.45); }\n  section.group { padding-block: clamp(36px, 5vw, 56px); }\n  section.group + section.group { border-top: 1px solid var(--border-soft); }\n  .scards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-top: var(--space-5); }\n  @media (max-width: 880px) { .scards { grid-template-columns: repeat(2, 1fr); } }\n  @media (max-width: 560px) { .scards { grid-template-columns: 1fr; } }\n  .scard { display: flex; flex-direction: column; gap: 8px; min-height: 132px; }\n  .scard .top { display: flex; align-items: center; justify-content: space-between; }\n  .scard .no { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--meta); }\n  .scard .pri { font-family: var(--font-mono); font-size: 11px; padding: 3px 9px; border-radius: 999px; background: var(--surface-warm); color: var(--muted); font-weight: 600; }\n  .scard .pri.p0 { background: var(--fg); color: var(--bg); }\n  .scard h3 { font-size: var(--text-lg); }\n  .scard p { color: var(--muted); font-size: var(--text-sm); flex: 1; }\n  .scard .go { font-size: var(--text-sm); font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }\n  .scard .go svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; fill: none; transition: transform var(--motion-fast); }\n  .scard:hover .go svg { transform: translateX(3px); }\n  .foot { border-top: 1px solid var(--border-soft); }\n  .foot .wrap { padding-block: var(--space-8); display: flex; flex-wrap: wrap; gap: var(--space-3); justify-content: space-between; color: var(--meta); font-size: var(--text-sm); }"
] as const
const scripts = [] as const

export default function IndexPage() {
  return (
    <PageChrome pageId="index" title="CampusEats Web · 畫面總覽" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="head">
            <div className="wrap">
              <span className="topbar__brand" data-brand-mark="">CampusEats</span>
              <h1>校園帶餐媒合平台 · 網頁版</h1>
              <p>手機原型已升級為可在瀏覽器操作的響應式網頁版（桌機多欄、平板與手機自適應），維持原本的 UIUX 流程與 Uber 設計系統。訂餐者與帶餐者是兩條各自獨立的流程，在登入頁選定身份後進入專屬視角。</p>
              <div className="btns">
                <a className="btn btn-black" href="landing.html">看行銷 landing</a>
                <a className="btn btn-out" href="register.html">開始使用（選身份）</a>
              </div>
              <div className="loop" aria-label="核心交易閉環">
                <span className="node">登入</span><span className="arr">→</span>
                <span className="node">發布訂單</span><span className="arr">→</span>
                <span className="node">瀏覽待接</span><span className="arr">→</span>
                <span className="node">接單</span><span className="arr">→</span>
                <span className="node">狀態更新</span><span className="arr">→</span>
                <span className="node">確認收餐</span><span className="arr">→</span>
                <span className="node">雙向評價</span>
              </div>
            </div>
          </header>
        
          <main id="main">
          <section className="group">
            <div className="wrap">
              <p className="eyebrow">入口流程</p>
              <h2 className="h-sec">Landing → 開始使用 → 選身份 → 登入</h2>
              <div className="scards">
                <a className="card card--link scard" href="landing.html"><div className="top"><span className="no">WEB 01</span><span className="pri">行銷</span></div><h3>Landing 行銷頁</h3><p>價值主張、運作三步、兩種身份、狀態與信任，右上角「開始使用」。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="register.html"><div className="top"><span className="no">WEB 02</span><span className="pri p0">選身份</span></div><h3>註冊 · 選擇身份</h3><p>點「開始使用」後選擇訂餐者 / 帶餐者，再進入對應登入。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="login.html"><div className="top"><span className="no">WEB 03</span><span className="pri p0">登入</span></div><h3>登入</h3><p>Email 登入＋確認身份，進入該身份的專屬視角。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
              </div>
            </div>
          </section>
        
          <section className="group">
            <div className="wrap">
              <p className="eyebrow">訂餐者視角</p>
              <h2 className="h-sec">發單 → 追蹤 → 評價</h2>
              <div className="scards">
                <a className="card card--link scard" href="dashboard.html?role=orderer"><div className="top"><span className="no">WEB 04</span><span className="pri">首頁</span></div><h3>訂餐者首頁</h3><p>取餐地點、搜尋入口、進行中訂單、再發一次。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="post-order.html?role=orderer"><div className="top"><span className="no">WEB 05</span><span className="pri p0">發單</span></div><h3>發布帶餐需求</h3><p>標準化表單、必填驗證、系統計算費、確認摘要。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="order-tracking.html?role=orderer"><div className="top"><span className="no">WEB 06</span><span className="pri p0">追蹤</span></div><h3>狀態時間軸（訂餐者）</h3><p>即時進度，確認收餐後可評價帶餐者。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="my-orders.html?role=orderer"><div className="top"><span className="no">WEB 07</span><span className="pri">紀錄</span></div><h3>訂單紀錄</h3><p>進行中與歷史，含已完成與已取消。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="orderer-reviews.html?role=orderer"><div className="top"><span className="no">WEB 08</span><span className="pri">信任</span></div><h3>我收到的評價</h3><p>分數、星等分布、最常獲得的肯定與全部評論。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="profile.html?role=orderer"><div className="top"><span className="no">WEB 09</span><span className="pri">檔案</span></div><h3>個人檔案（訂餐者）</h3><p>身份統計、付款方式、常用地點、切換身份。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
              </div>
            </div>
          </section>
        
          <section className="group">
            <div className="wrap">
              <p className="eyebrow">帶餐者視角</p>
              <h2 className="h-sec">接單 → 狀態更新 → 收入</h2>
              <div className="scards">
                <a className="card card--link scard" href="feed.html?role=runner"><div className="top"><span className="no">WEB 10</span><span className="pri p0">接單</span></div><h3>帶餐者首頁 · 接單</h3><p>上線／離線、今日收入、待接列表、篩選與搜尋。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="order-detail.html?role=runner"><div className="top"><span className="no">WEB 11</span><span className="pri p0">詳情</span></div><h3>訂單詳情 · 接單</h3><p>完整餐點與地點、訂餐者評分，接單即鎖定。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="order-tracking.html?role=runner"><div className="top"><span className="no">WEB 12</span><span className="pri p0">更新</span></div><h3>狀態時間軸（帶餐者）</h3><p>逐步更新：開始購買→配送→送達，等待確認。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="my-orders.html?role=runner"><div className="top"><span className="no">WEB 13</span><span className="pri">紀錄</span></div><h3>帶單紀錄</h3><p>與訂單紀錄完全分開的接單歷史。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="runner-earnings.html?role=runner"><div className="top"><span className="no">WEB 14</span><span className="pri">收入</span></div><h3>收入明細</h3><p>本月總額、本週長條圖、組成與近期帶餐收入。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="runner-reviews.html?role=runner"><div className="top"><span className="no">WEB 15</span><span className="pri">信任</span></div><h3>帶餐評價</h3><p>分數、分布、訂餐者最常給的肯定與全部評論。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
              </div>
            </div>
          </section>
        
          <section className="group">
            <div className="wrap">
              <p className="eyebrow">共用畫面</p>
              <h2 className="h-sec">雙向評價與歷史詳情</h2>
              <div className="scards">
                <a className="card card--link scard" href="rating.html?role=orderer"><div className="top"><span className="no">WEB 16</span><span className="pri">AG-007</span></div><h3>雙向星等評價</h3><p>1–5 星＋選填標籤與評論，完成後顯示成功狀態。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
                <a className="card card--link scard" href="history-detail.html?role=orderer&id=CE-2039"><div className="top"><span className="no">WEB 17</span><span className="pri">詳情</span></div><h3>歷史訂單詳情</h3><p>狀態、內容、費用、進度與雙向評價紀錄。</p><span className="go">開啟<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>
              </div>
            </div>
          </section>
        
          </main>
          <footer className="foot">
            <div className="wrap">
              <span>CampusEats · 校園帶餐媒合平台</span>
              <span>網頁版 · 響應式</span>
            </div>
          </footer>
      </>
    </PageChrome>
  )
}
