import { PageChrome } from './PageChrome'

const bodyAttrs: Record<string, string> = {
  "data-od-id": "post-order"
}
const styles = [
  ".post-grid { display: grid; grid-template-columns: minmax(0,1fr) 340px; gap: clamp(20px,3vw,36px); align-items: start; }\n  @media (max-width: 920px) { .post-grid { grid-template-columns: 1fr; } }\n  .fee-calc { border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: var(--space-4); }\n  .fee-calc__rows { display: flex; flex-direction: column; gap: 8px; }\n  .fee-calc__rows .row { display: flex; align-items: center; justify-content: space-between; font-size: var(--text-sm); color: var(--muted); }\n  .fee-calc__rows .row .amt { font-family: var(--font-mono); font-variant-numeric: tabular-nums; color: var(--fg); }\n  .fee-calc__total { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--fg); font-weight: 700; }\n  .fee-note { font-size: var(--text-xs); color: var(--meta); margin-top: 6px; }\n  .reorder-banner { display: flex; align-items: center; gap: 10px; background: var(--surface-warm); border-radius: var(--radius-md); padding: 12px 14px; font-size: var(--text-sm); }\n  .reorder-banner[hidden] { display: none; }\n  .reorder-banner svg { width: 18px; height: 18px; stroke: var(--fg); stroke-width: 2; fill: none; flex: 0 0 auto; }\n  .order-error { display: flex; align-items: flex-start; gap: 10px; background: color-mix(in srgb, var(--danger) 8%, var(--bg)); border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent); border-radius: var(--radius-md); padding: 12px 14px; color: var(--danger); font-size: var(--text-sm); }\n  .order-error[hidden] { display: none; }\n  .order-error svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 2.2; fill: none; flex: 0 0 auto; margin-top: 1px; }\n  .order-error b { display: block; font-weight: 700; margin-bottom: 2px; }\n  .aside-fee { position: sticky; top: calc(var(--topbar-h) + 20px); }\n  /* menu picker */\n  .menu-pick { position: relative; }\n  .menu-pick select { cursor: pointer; }\n  .chosen-list { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }\n  .chosen-list:empty { display: none; }\n  .chosen-row { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 8px 10px 8px 14px; }\n  .chosen-row__name { font-weight: 600; font-size: var(--text-sm); flex: 1 1 auto; min-width: 0; }\n  .chosen-row__price { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: var(--text-sm); color: var(--muted); }\n  .qty { display: inline-flex; align-items: center; gap: 2px; }\n  .qty button { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border-soft); background: var(--bg); font-size: 16px; line-height: 1; display: grid; place-items: center; color: var(--fg); }\n  .qty button:active { background: var(--surface-warm); }\n  .qty span { min-width: 22px; text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; }\n  .chosen-row__del { width: 28px; height: 28px; border: none; background: none; color: var(--meta); display: grid; place-items: center; border-radius: 50%; }\n  .chosen-row__del:hover { background: var(--surface-warm); color: var(--danger); }\n  .chosen-row__del svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; fill: none; }\n  .menu-total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px; font-size: var(--text-sm); }\n  .menu-total .v { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: 700; font-size: var(--text-base); }\n  .custom-toggle { margin-top: 12px; }\n  .custom-toggle summary { cursor: pointer; font-size: var(--text-sm); color: var(--muted); list-style: none; display: inline-flex; align-items: center; gap: 6px; }\n  .custom-toggle summary::-webkit-details-marker { display: none; }\n  .custom-toggle summary::before { content: \"＋\"; font-weight: 700; }\n  .custom-toggle[open] summary::before { content: \"－\"; }\n  .custom-toggle textarea { margin-top: 8px; }\n  /* success overlay (centered card on web) */\n  .success-scrim { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 90; display: grid; place-items: center; padding: var(--gutter); animation: fade var(--motion-base); }\n  .success-scrim[hidden] { display: none; }\n  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }\n  .success-card { background: var(--bg); border-radius: var(--radius-lg); width: 100%; max-width: 480px; max-height: 88dvh; overflow-y: auto; padding: var(--space-8); box-shadow: var(--elev-raised); }\n  .success-card__check { width: 64px; height: 64px; border-radius: 50%; background: var(--fg); display: grid; place-items: center; margin-bottom: var(--space-5); animation: pop 360ms var(--ease-standard) both; }\n  @keyframes pop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }\n  .success-card__check svg { width: 34px; height: 34px; stroke: var(--bg); stroke-width: 2.6; fill: none; }\n  .success-card h2 { font-size: var(--text-2xl); margin-bottom: var(--space-2); }\n  .success-card .lead { color: var(--muted); font-size: var(--text-sm); margin-bottom: var(--space-5); }"
] as const
const scripts = [
  "var form = document.getElementById(\"orderForm\");\n  var requiredText = [\"restaurant\", \"items\", \"spot\"];\n  var feeRowsEl = document.getElementById(\"feeRows\");\n  var feeTotalEl = document.getElementById(\"feeTotal\");\n  var currentFee = CampusEats.fee({ qty: 1, urgency: \"normal\" });\n\n  function recomputeFee() {\n    var qty = CampusEats.parseQty(document.getElementById(\"items\").value);\n    var urgency = CampusEats.urgencyOf(document.getElementById(\"time\").value);\n    currentFee = CampusEats.fee({ qty: qty, urgency: urgency });\n    while (feeRowsEl.firstChild) feeRowsEl.removeChild(feeRowsEl.firstChild);\n    currentFee.parts.forEach(function (p, i) {\n      var row = document.createElement(\"div\"); row.className = \"row\";\n      var l = document.createElement(\"span\"); l.textContent = p.label;\n      var a = document.createElement(\"span\"); a.className = \"amt\"; a.textContent = (i === 0 ? \"$\" : \"+$\") + p.amount;\n      row.appendChild(l); row.appendChild(a); feeRowsEl.appendChild(row);\n    });\n    feeTotalEl.textContent = \"$\" + currentFee.total;\n  }\n\n  function validate() {\n    var ok = true, firstBad = null;\n    requiredText.forEach(function (id) {\n      var input = document.getElementById(id), field = input.closest(\".field\");\n      var valid = input.value.trim() !== \"\";\n      field.classList.toggle(\"has-error\", !valid);\n      if (!valid) { ok = false; firstBad = firstBad || field; }\n    });\n    var time = document.getElementById(\"time\"), tf = time.closest(\".field\");\n    var timeOk = time.value !== \"\";\n    tf.classList.toggle(\"has-error\", !timeOk);\n    if (!timeOk) { ok = false; firstBad = firstBad || tf; }\n    if (!ok && firstBad) firstBad.querySelector(\".control\").focus();\n    return ok;\n  }\n  function addRow(dl, label, value) {\n    var dt = document.createElement(\"dt\"); dt.textContent = label;\n    var dd = document.createElement(\"dd\"); dd.textContent = value;\n    var div = document.createElement(\"div\"); div.className = \"kv\"; div.appendChild(dt); div.appendChild(dd); dl.appendChild(div);\n  }\n\n  var orderError = document.getElementById(\"orderError\");\n\n  /* ---- restaurant-driven menu picker ---- */\n  var itemsEl = document.getElementById(\"items\");\n  var restaurantEl = document.getElementById(\"restaurant\");\n  var menuPicker = document.getElementById(\"menuPicker\");\n  var menuPick = document.getElementById(\"menuPick\");\n  var chosenItems = document.getElementById(\"chosenItems\");\n  var menuTotal = document.getElementById(\"menuTotal\");\n  var menuTotalVal = document.getElementById(\"menuTotalVal\");\n  var customToggle = document.getElementById(\"customToggle\");\n  var customItems = document.getElementById(\"customItems\");\n  var freeItems = document.getElementById(\"freeItems\");\n  var itemsHint = document.getElementById(\"itemsHint\");\n  var itemsField = document.getElementById(\"itemsField\");\n  var chosen = [], currentMenu = null, lastRest = null;\n\n  /* ---- 取餐地點 select — defaults to the home 送達地點, still editable ---- */\n  function fillSpot(selected) {\n    var spot = document.getElementById(\"spot\");\n    if (!spot) return;\n    var sel = selected || CampusEats.getDropoff();\n    var list = CampusEats.DROPOFFS.slice();\n    if (sel && list.indexOf(sel) === -1) list.unshift(sel);\n    spot.replaceChildren();\n    list.forEach(function (loc) { spot.add(new Option(loc, loc, loc === sel, loc === sel)); });\n  }\n\n  /* repopulate the menu picker from a reorder preset's structured picks */\n  function applyPicks(picks) {\n    chosen = (picks || []).map(function (p) {\n      var mi = currentMenu && currentMenu.filter(function (m) { return m.name === p.name; })[0];\n      return mi ? { name: mi.name, price: mi.price, qty: p.qty || 1 } : null;\n    }).filter(Boolean);\n  }\n\n  function renderChosen() {\n    chosenItems.replaceChildren();\n    var total = 0;\n    chosen.forEach(function (c, idx) {\n      total += c.price * c.qty;\n      var li = document.createElement(\"li\"); li.className = \"chosen-row\";\n      var nm = document.createElement(\"span\"); nm.className = \"chosen-row__name\"; nm.textContent = c.name;\n      var qty = document.createElement(\"span\"); qty.className = \"qty\";\n      var minus = document.createElement(\"button\"); minus.type = \"button\"; minus.textContent = \"−\"; minus.dataset.act = \"dec\"; minus.dataset.i = idx; minus.setAttribute(\"aria-label\", \"減少數量\");\n      var num = document.createElement(\"span\"); num.textContent = c.qty;\n      var plus = document.createElement(\"button\"); plus.type = \"button\"; plus.textContent = \"＋\"; plus.dataset.act = \"inc\"; plus.dataset.i = idx; plus.setAttribute(\"aria-label\", \"增加數量\");\n      qty.appendChild(minus); qty.appendChild(num); qty.appendChild(plus);\n      var pr = document.createElement(\"span\"); pr.className = \"chosen-row__price\"; pr.textContent = \"$\" + (c.price * c.qty);\n      var del = document.createElement(\"button\"); del.type = \"button\"; del.className = \"chosen-row__del\"; del.dataset.act = \"del\"; del.dataset.i = idx; del.textContent = \"✕\"; del.setAttribute(\"aria-label\", \"移除\");\n      li.appendChild(nm); li.appendChild(qty); li.appendChild(pr); li.appendChild(del);\n      chosenItems.appendChild(li);\n    });\n    menuTotal.hidden = chosen.length === 0;\n    menuTotalVal.textContent = \"$\" + total;\n  }\n\n  function syncItems() {\n    var lines = [];\n    if (currentMenu) {\n      chosen.forEach(function (c) { lines.push(c.name + \" ×\" + c.qty); });\n      var custom = customItems.value.trim();\n      if (custom) lines.push(custom);\n    } else {\n      var ft = freeItems.value.trim();\n      if (ft) lines.push(ft);\n    }\n    itemsEl.value = lines.join(\"、\");\n    if (itemsField.classList.contains(\"has-error\") && itemsEl.value.trim() !== \"\") itemsField.classList.remove(\"has-error\");\n    if (!orderError.hidden && !form.querySelector(\".field.has-error\")) orderError.hidden = true;\n    recomputeFee();\n  }\n\n  function applyRestaurant(name) {\n    var menu = CampusEats.getMenu(name);\n    if (menu) {\n      menuPick.length = 1; // keep placeholder\n      menu.forEach(function (m, i) { menuPick.add(new Option(m.name + \"（$\" + m.price + \"）\", String(i))); });\n      menuPicker.hidden = false; freeItems.hidden = true;\n      itemsHint.textContent = \"從「\" + name + \"」的菜單直接點餐，數量可調整，免打字。\";\n      currentMenu = menu;\n    } else {\n      menuPicker.hidden = true; freeItems.hidden = false;\n      itemsHint.textContent = name ? \"這家店尚未建立菜單，請直接描述要帶的餐點與數量。\" : \"選擇餐廳後，可直接從菜單點餐；其他店家請自行描述。\";\n      currentMenu = null;\n    }\n    renderChosen();\n    syncItems();\n  }\n\n  menuPick.addEventListener(\"change\", function () {\n    if (menuPick.value === \"\" || !currentMenu) return;\n    var item = currentMenu[parseInt(menuPick.value, 10)];\n    if (item) {\n      var ex = chosen.filter(function (c) { return c.name === item.name; })[0];\n      if (ex) { if (ex.qty < 9) ex.qty++; } else { chosen.push({ name: item.name, price: item.price, qty: 1 }); }\n      renderChosen(); syncItems();\n    }\n    menuPick.value = \"\";\n  });\n  chosenItems.addEventListener(\"click\", function (e) {\n    var b = e.target.closest(\"button\"); if (!b) return;\n    var i = parseInt(b.dataset.i, 10); var c = chosen[i]; if (!c) return;\n    if (b.dataset.act === \"inc\") { if (c.qty < 9) c.qty++; }\n    else if (b.dataset.act === \"dec\") { c.qty--; if (c.qty < 1) chosen.splice(i, 1); }\n    else if (b.dataset.act === \"del\") chosen.splice(i, 1);\n    renderChosen(); syncItems();\n  });\n  customItems.addEventListener(\"input\", syncItems);\n  freeItems.addEventListener(\"input\", syncItems);\n  restaurantEl.addEventListener(\"input\", function () {\n    var name = restaurantEl.value.trim();\n    if (name === lastRest) return;\n    lastRest = name; chosen = []; applyRestaurant(name);\n  });\n\n  function placeOrder() {\n    if (!validate()) { orderError.hidden = false; toast(\"無法訂餐\", { icon: false }); return; }\n    orderError.hidden = true;\n    recomputeFee();\n    var dl = document.getElementById(\"summary\");\n    while (dl.firstChild) dl.removeChild(dl.firstChild);\n    addRow(dl, \"餐廳\", document.getElementById(\"restaurant\").value.trim());\n    addRow(dl, \"餐點\", document.getElementById(\"items\").value.trim());\n    addRow(dl, \"取餐地點\", document.getElementById(\"spot\").value.trim());\n    addRow(dl, \"送達時間\", document.getElementById(\"time\").value);\n    var note = document.getElementById(\"note\").value.trim();\n    if (note) addRow(dl, \"備註\", note);\n    document.getElementById(\"sumFee\").textContent = \"$\" + currentFee.total;\n    document.getElementById(\"successScreen\").hidden = false;\n  }\n\n  document.getElementById(\"reviewBtn\").addEventListener(\"click\", placeOrder);\n  form.addEventListener(\"submit\", function (e) { e.preventDefault(); placeOrder(); });\n\n  document.getElementById(\"confirmBtn\").addEventListener(\"click\", function () { window.location.href = \"order-tracking.html?role=orderer\"; });\n\n  form.addEventListener(\"input\", function (e) {\n    var field = e.target.closest(\".field\");\n    if (field && field.classList.contains(\"has-error\") && e.target.value.trim() !== \"\") field.classList.remove(\"has-error\");\n    if (!orderError.hidden && !form.querySelector(\".field.has-error\")) orderError.hidden = true;\n    recomputeFee();\n  });\n  form.addEventListener(\"change\", function (e) {\n    var field = e.target.closest(\".field\");\n    if (field && field.classList.contains(\"has-error\") && e.target.value.trim() !== \"\") field.classList.remove(\"has-error\");\n    if (!orderError.hidden && !form.querySelector(\".field.has-error\")) orderError.hidden = true;\n    recomputeFee();\n  });\n\n  (function prefill() {\n    var params = new URLSearchParams(location.search);\n    var fromSearch = params.get(\"restaurant\");\n    var id = params.get(\"reorder\");\n    var preset = id && CampusEats.REORDERS[id];\n\n    fillSpot();\n\n    if (preset) {\n      restaurantEl.value = preset.restaurant;\n      // 取餐地點一律跟首頁的送達地點同步（忽略該筆舊地點），仍可手動改\n      fillSpot();\n      var timeSel = document.getElementById(\"time\");\n      var matched = Array.prototype.some.call(timeSel.options, function (o) { if (o.value === preset.time || o.textContent.trim() === preset.time) { o.selected = true; return true; } return false; });\n      if (!matched && preset.time) timeSel.add(new Option(preset.time, preset.time, true, true));\n      document.getElementById(\"note\").value = preset.note || \"\";\n      document.getElementById(\"reorderName\").textContent = preset.restaurant;\n      document.getElementById(\"reorderBanner\").hidden = false;\n      document.getElementById(\"pageTitle\").textContent = \"再發一次 · \" + preset.restaurant;\n      lastRest = preset.restaurant;\n      applyRestaurant(preset.restaurant);\n      // bring last time's order back — repopulate the menu picker from structured\n      // picks (so items show as dropdown rows), and put ONLY the客製 note in the\n      // custom field. Menu-less shops fall back to the free-text field.\n      if (currentMenu && preset.picks && preset.picks.length) {\n        applyPicks(preset.picks);\n        renderChosen();\n        if (preset.custom) { customToggle.open = true; customItems.value = preset.custom; }\n      } else if (currentMenu) {\n        customToggle.open = true; customItems.value = preset.custom || preset.items;\n      } else {\n        freeItems.value = preset.items;\n      }\n      syncItems();\n      return;\n    }\n\n    if (fromSearch) {\n      restaurantEl.value = fromSearch;\n      document.getElementById(\"pageTitle\").textContent = \"發單 · \" + fromSearch;\n      lastRest = fromSearch;\n      applyRestaurant(fromSearch);\n      setTimeout(function () { (currentMenu ? menuPick : freeItems).focus(); }, 60);\n      return;\n    }\n\n    applyRestaurant(\"\");\n  })();\n\n  /* Keep 取餐地點 in sync with the home 送達地點 even when this page is restored\n     from the back/forward cache (bfcache) — a restore does NOT re-run prefill,\n     so a home change made after this page was first opened would otherwise be\n     stale. Re-default to the current home spot on restore, unless the user has\n     manually picked a different spot on this page (then we keep their choice). */\n  (function syncSpotOnRestore() {\n    var spot = document.getElementById(\"spot\");\n    if (!spot) return;\n    var spotTouched = false;\n    spot.addEventListener(\"change\", function () { spotTouched = true; });\n    window.addEventListener(\"pageshow\", function (e) {\n      if (e.persisted && !spotTouched && spot.value !== CampusEats.getDropoff()) fillSpot();\n    });\n  })();"
] as const

export default function PostOrderPage() {
  return (
    <PageChrome pageId="post-order" title="發布帶餐需求 · CampusEats" bodyAttrs={bodyAttrs} scripts={scripts}>
      {styles.map((css, index) => <style key={index}>{css}</style>)}
      <>
        <header className="topbar">
            <div className="topbar__inner">
              <a className="topbar__brand" href="dashboard.html" data-brand-mark="">CampusEats</a>
              <nav className="topbar__nav" data-topnav="" data-active="post"></nav>
              <span className="topbar__spacer"></span>
              <div className="topbar__actions">
                <span className="role-chip" data-role-name="">訂餐者</span>
                <a className="topbar__account" href="profile.html"><span className="avatar avatar--sm">學</span><span className="nm">校園同學</span></a>
              </div>
            </div>
          </header>
        
          <div className="wrap page">
            <div className="page__head">
              <p className="crumb"><a href="dashboard.html">首頁</a> · 發布帶餐需求</p>
              <h1 id="pageTitle">發布帶餐需求</h1>
              <p>標 <span style={{ color: "var(--danger)" }}>*</span> 為必填。資訊越清楚，順路的同學越敢接單。</p>
            </div>
        
            <form className="post-grid" id="orderForm" noValidate>
              <div>
                <div className="reorder-banner" id="reorderBanner" hidden style={{ marginBottom: "var(--space-5)" }}>
                  <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
                  <span>已帶入上次「<strong id="reorderName"></strong>」的內容，確認或修改後即可再發一次。</span>
                </div>
                <div className="order-error" id="orderError" hidden role="alert" style={{ marginBottom: "var(--space-5)" }}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 7v5M12 16h.01" /></svg>
                  <span><b>無法訂餐</b>還有必填欄位未完成，請補齊標示紅色的欄位後再送出。</span>
                </div>
        
                <div className="field" data-rest-search="fill">
                  <label htmlFor="restaurant">餐廳 / 店家<span className="req">*</span></label>
                  <input className="control" id="restaurant" name="restaurant" placeholder="例：阿嬤的飯桶、拉亞漢堡、茶壜" />
                  <div className="field__error"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>請填寫餐廳或店家名稱</div>
                </div>
                <div className="field" id="itemsField">
                  <label htmlFor="menuPick">餐點內容<span className="req">*</span></label>
        
                  
                  <div id="menuPicker" hidden>
                    <div className="menu-pick">
                      <select className="control" id="menuPick" aria-label="從菜單選擇餐點">
                        <option value="">＋ 從菜單選擇餐點…</option>
                      </select>
                    </div>
                    <ul className="chosen-list" id="chosenItems"></ul>
                    <div className="menu-total" id="menuTotal" hidden><span>餐點小計</span><span className="v" id="menuTotalVal">$0</span></div>
                    <details className="custom-toggle" id="customToggle">
                      <summary>加註客製或追加品項（辣度、冰塊、加料…）</summary>
                      <textarea className="control" id="customItems" placeholder="例：雞腿便當不要辣、奶茶半糖少冰、再加一份燙青菜"></textarea>
                    </details>
                  </div>
        
                  
                  <textarea className="control" id="freeItems" placeholder="例：雞腿便當 ×1（不要辣、加滷蛋）、紅茶微糖少冰 ×1"></textarea>
        
                  
                  <textarea id="items" name="items" hidden></textarea>
                  <span className="hint" id="itemsHint">寫清楚品項、數量與客製（辣度、冰塊、加料），避免買錯。</span>
                  <div className="field__error"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>請選擇或描述要帶的餐點</div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="spot">取餐地點<span className="req">*</span></label>
                    <select className="control" id="spot" name="spot" aria-label="取餐地點"></select>
                    <span className="hint" id="spotHint">預設帶入首頁的送達地點，可改成其他取餐點。</span>
                    <div className="field__error"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>請選擇取餐地點</div>
                  </div>
                  <div className="field">
                    <label htmlFor="time">期望送達時間<span className="req">*</span></label>
                    <select className="control" id="time" name="time">
                      <option value="">選擇時間</option>
                      <option>越快越好（30 分鐘內）</option>
                      <option>11:30 前</option>
                      <option>12:00 前</option>
                      <option>12:30 前</option>
                      <option>13:00 前</option>
                      <option>14:00 前</option>
                    </select>
                    <div className="field__error"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>請選擇期望送達時間</div>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: "0" }}>
                  <label htmlFor="note">備註（選填）</label>
                  <textarea className="control" id="note" name="note" placeholder="例：我會在大廳沙發區、找不到可以打電話給我"></textarea>
                </div>
              </div>
        
              
              <aside className="aside-fee">
                <div className="card stack-4">
                  <div>
                    <label style={{ fontSize: "var(--text-sm)", fontWeight: "600" }}>帶餐費<span style={{ fontWeight: "500", color: "var(--meta)", fontSize: "var(--text-xs)", marginLeft: "6px" }}>系統自動計算</span></label>
                    <div className="fee-calc" id="feeCalc" style={{ marginTop: "8px" }}>
                      <div className="fee-calc__rows" id="feeRows"></div>
                      <div className="fee-calc__total"><span>帶餐費</span><span className="fee" id="feeTotal">$15</span></div>
                    </div>
                    <p className="fee-note">校園統一費率，訂餐者無法自訂——和 Uber Eats 一樣由系統計算，確保價格透明、帶餐者收入公平。</p>
                  </div>
                  <button className="btn btn-black btn--block btn--lg" id="reviewBtn" type="button">檢視並確認</button>
                </div>
              </aside>
            </form>
          </div>
        
          
          <div className="success-scrim" id="successScreen" hidden role="dialog" aria-modal="true" aria-labelledby="successTitle" data-od-id="order-success">
            <div className="success-card">
              <div className="success-card__check"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></div>
              <h2 id="successTitle">訂餐成功</h2>
              <p className="lead">已送出帶餐需求，將出現在帶餐者的待接列表。接單前你都可以取消。</p>
              <dl id="summary" style={{ margin: "0" }}></dl>
              <div className="between" style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--fg)" }}>
                <span style={{ fontWeight: "600" }}>帶餐費</span><span className="fee" id="sumFee">$20</span>
              </div>
              <div className="stack-3" style={{ marginTop: "var(--space-6)" }}>
                <button className="btn btn-black btn--block btn--lg" id="confirmBtn">查看訂單進度</button>
                <a className="btn btn-ghost btn--block" href="dashboard.html?role=orderer">返回首頁</a>
              </div>
            </div>
          </div>
      </>
    </PageChrome>
  )
}
