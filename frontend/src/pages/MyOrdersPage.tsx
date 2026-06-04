import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "my-orders"
}
const styles = [
  ".seg-tabs { display: flex; gap: var(--space-1); border-bottom: 1px solid var(--border-soft); margin-bottom: var(--space-6); }\n  .seg-tabs button { padding: 12px 18px; border: none; background: none; font-weight: 600; font-size: var(--text-base); color: var(--meta); position: relative; }\n  .seg-tabs button.is-active { color: var(--fg); }\n  .seg-tabs button.is-active::after { content: \"\"; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--fg); }\n  .ro { font-size: var(--text-xs); color: var(--meta); }\n  .order-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-4); }"
] as const
const scripts = [
  `(function () {
    var role = CampusEats.getRole();
    document.getElementById("pageTitle").textContent = role === "runner" ? "我的帶單紀錄" : "我的訂單紀錄";
    document.title = (role === "runner" ? "我的帶單" : "我的訂單") + " · CampusEats";

    if (role === "runner") {
      document.getElementById("emptyActiveTitle").textContent = "目前沒有接的訂單";
      document.getElementById("emptyActiveSub").textContent = "到接單頁看看附近的帶餐需求，接一筆順路的吧。";
    }

    var tabs = document.getElementById("tabs");
    var panes = { active: document.getElementById("paneActive"), history: document.getElementById("paneHistory") };
    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      tabs.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      Object.keys(panes).forEach(function (k) { panes[k].hidden = k !== btn.dataset.tab; });
    });

    var STATUS = {
      OPEN: { text: "等待接單", cls: "badge--waiting", active: true },
      ACCEPTED: { text: "已接單", cls: "badge--matched", active: true },
      BUYING: { text: "購買中", cls: "badge--buying", active: true },
      DELIVERED: { text: "已送達", cls: "badge--delivering", active: true },
      COMPLETED: { text: "已完成", cls: "badge--done", active: false },
      CANCELLED: { text: "已取消", cls: "badge--cancelled", active: false }
    };

    function fmtTime(value) {
      try { return new Date(value).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
      catch (_) { return "—"; }
    }

    function clearPane(pane, emptyId) {
      Array.from(pane.querySelectorAll(".card--link")).forEach(function (node) { node.remove(); });
      var empty = document.getElementById(emptyId);
      if (empty) empty.hidden = true;
    }

    function renderCard(order) {
      var meta = STATUS[order.status] || STATUS.OPEN;
      var a = document.createElement("a");
      a.className = "card card--link";
      a.href = "order-tracking.html?id=" + encodeURIComponent(order.id) + "&role=" + role;

      var top = document.createElement("div");
      top.className = "order-card__top";

      var left = document.createElement("div");
      var rest = document.createElement("div");
      rest.className = "order-card__rest";
      rest.textContent = order.restaurant + " · " + order.meal;
      var ro = document.createElement("div");
      ro.className = "ro";
      ro.style.marginTop = "4px";
      ro.textContent = (role === "runner" ? "我接的" : "我發布") + " · " + fmtTime(order.updated_at || order.created_at) + " · " + order.id;
      left.appendChild(rest);
      left.appendChild(ro);

      var badge = document.createElement("span");
      badge.className = "badge " + meta.cls;
      badge.textContent = meta.text;

      top.appendChild(left);
      top.appendChild(badge);

      var foot = document.createElement("div");
      foot.className = "order-card__foot";
      var m = document.createElement("span");
      m.className = "meta";
      m.textContent = order.pickup_location;
      var fee = document.createElement("span");
      fee.className = "fee";
      fee.textContent = "$" + order.delivery_fee;
      foot.appendChild(m);
      foot.appendChild(fee);

      a.appendChild(top);
      a.appendChild(foot);
      return a;
    }

    async function loadOrders() {
      var activePane = document.getElementById("paneActive");
      var historyPane = document.getElementById("paneHistory");
      clearPane(activePane, "emptyActive");
      clearPane(historyPane, "emptyHistory");

      try {
        var orders = await window.CampusEatsApi.listMyOrders(role);
        var activeCount = 0, historyCount = 0;
        orders.forEach(function (order) {
          var meta = STATUS[order.status] || STATUS.OPEN;
          if (meta.active) { activePane.insertBefore(renderCard(order), document.getElementById("emptyActive")); activeCount++; }
          else { historyPane.insertBefore(renderCard(order), document.getElementById("emptyHistory")); historyCount++; }
        });
        document.getElementById("emptyActive").hidden = activeCount > 0;
        document.getElementById("emptyHistory").hidden = historyCount > 0;
      } catch (err) {
        console.error("Failed to load my orders", err);
        document.getElementById("emptyActiveTitle").textContent = "訂單紀錄載入失敗";
        document.getElementById("emptyActiveSub").textContent = "請確認已登入，且後端 API / Redis 正常運作。";
        document.getElementById("emptyActive").hidden = false;
      }
    }

    loadOrders();
  })();`
] as const

export default function MyOrdersPage() {
  return (
    <PageChrome pageId="my-orders" title="我的訂單 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="dashboard.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="orders"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions">
                <span className="role-chip" data-role-name="">訂餐者</span>
                <a className="topbar__account" href="profile.html"><span className="avatar avatar--sm">學</span><span className="nm">校園同學</span></a>
              </div>
            </div>
          </header>
        
          <div className="wrap page" role="main" id="main">
            <div className="page__head"><h1 id="pageTitle">我的訂單</h1></div>
        
            <div className="seg-tabs" id="tabs">
              <button className="is-active" data-tab="active">進行中</button>
              <button data-tab="history">歷史</button>
            </div>
        
            
            <div id="paneActive" className="order-grid">
              <div className="empty" id="emptyActive" style={{ gridColumn: "1/-1" }}>
                <div className="empty__mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4h11l3 3v13H6zM9 4v4h7" /></svg></div>
                <h3 id="emptyActiveTitle">目前沒有進行中的訂單</h3>
                <p id="emptyActiveSub">發一張帶餐需求，接單後就能在這裡追蹤進度。</p>
              </div>
            </div>
        
            
            <div id="paneHistory" className="order-grid" hidden>
              <div className="empty" id="emptyHistory" style={{ gridColumn: "1/-1" }}>
                <div className="empty__mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4h11l3 3v13H6zM9 4v4h7" /></svg></div>
                <h3>目前沒有歷史紀錄</h3>
                <p>完成或取消的訂單會顯示在這裡。</p>
              </div>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
