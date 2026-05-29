/* CampusEats — WEB shared interactions (no dependencies, no innerHTML for data).
 * Mirrors the archived mobile/js/campus.js model & role rules exactly; only the
 * navigation chrome changes: a web top-nav (with a phone bottom-tab mirror)
 * replaces the mobile bottom tabbar. The two roles remain separate experiences
 * chosen at login — there is no in-app role toggle. */
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  function svgIcon(viewBox, paths, opts) {
    opts = opts || {};
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", viewBox);
    s.setAttribute("fill", opts.fill || "none");
    s.setAttribute("stroke", opts.stroke || "currentColor");
    s.setAttribute("stroke-width", opts.sw || "2");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    paths.forEach(function (d) { var p = document.createElementNS(SVGNS, "path"); p.setAttribute("d", d); s.appendChild(p); });
    return s;
  }
  function svgShapes(viewBox, shapes) {
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", viewBox);
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round");
    shapes.forEach(function (sh) { var n = document.createElementNS(SVGNS, sh[0]); Object.keys(sh[1]).forEach(function (k) { n.setAttribute(k, sh[1][k]); }); s.appendChild(n); });
    return s;
  }

  var ROLE_KEY = "campuseats.role";

  var ICON = {
    home:   [["path", { d: "M3 11l9-8 9 8M5 10v10h14V10" }]],
    post:   [["path", { d: "M12 5v14M5 12h14" }]],
    orders: [["path", { d: "M6 4h11l3 3v13H6zM9 4v4h7" }]],
    feed:   [["path", { d: "M4 7h16M4 12h16M4 17h16" }]],
    earn:   [["path", { d: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }]],
    me:     [["circle", { cx: 12, cy: 8, r: 4 }], ["path", { d: "M4 21a8 8 0 0 1 16 0" }]]
  };
  var NAV = {
    orderer: [
      { key: "home",   href: "dashboard.html",       label: "首頁",   icon: ICON.home },
      { key: "post",   href: "post-order.html",       label: "發單",   icon: ICON.post },
      { key: "orders", href: "my-orders.html",        label: "訂單",   icon: ICON.orders },
      { key: "me",     href: "profile.html",          label: "我的",   icon: ICON.me }
    ],
    runner: [
      { key: "home",   href: "feed.html",             label: "接單",   icon: ICON.feed },
      { key: "orders", href: "my-orders.html",        label: "帶單",   icon: ICON.orders },
      { key: "earn",   href: "runner-earnings.html",  label: "收入",   icon: ICON.earn },
      { key: "me",     href: "profile.html",          label: "我的",   icon: ICON.me }
    ]
  };

  function normRole(r) { return r === "runner" ? "runner" : "orderer"; }
  function roleFromUrl() {
    try { var v = new URLSearchParams(location.search).get("role"); return v === "runner" || v === "orderer" ? v : null; } catch (e) { return null; }
  }

  window.CampusEats = {
    getRole: function () {
      var u = roleFromUrl();
      if (u) { this.setRole(u); return u; }
      try { return normRole(localStorage.getItem(ROLE_KEY)); } catch (e) { return "orderer"; }
    },
    setRole: function (r) { try { localStorage.setItem(ROLE_KEY, normRole(r)); } catch (e) {} },
    roleLabel: function (r) { return (r || this.getRole()) === "runner" ? "帶餐者" : "訂餐者"; },
    withRole: function (href, r) {
      r = normRole(r || this.getRole());
      if (!href || /^https?:|^#|^mailto:|^tel:/.test(href)) return href;
      return href + (href.indexOf("?") === -1 ? "?" : "&") + "role=" + r;
    },
    home: function (r) { r = normRole(r || this.getRole()); return (r === "runner" ? "feed.html" : "dashboard.html") + "?role=" + r; },
    guard: function (allowed) {
      var r = this.getRole();
      if (allowed && allowed !== "any" && r !== allowed) { location.replace(this.home(r)); return false; }
      return true;
    },

    /* fill the topbar nav (and mirror a phone bottom bar) for the active role */
    mountTopnav: function () {
      var nav = document.querySelector("nav[data-topnav]");
      if (!nav) return;
      var role = this.getRole();
      var active = nav.getAttribute("data-active");
      var items = NAV[role] || NAV.orderer;
      var withRole = this.withRole.bind(this);

      function fill(target, withLabel) {
        while (target.firstChild) target.removeChild(target.firstChild);
        items.forEach(function (t) {
          var a = document.createElement("a");
          a.href = withRole(t.href, role);
          if (t.key === active) a.setAttribute("aria-current", "page");
          a.appendChild(svgShapes("0 0 24 24", t.icon));
          var span = document.createElement("span"); span.textContent = t.label; a.appendChild(span);
          target.appendChild(a);
        });
      }
      fill(nav, true);

      // phone bottom-bar mirror
      var bottom = document.createElement("nav");
      bottom.className = "topbar__nav is-bottom";
      bottom.setAttribute("data-topnav-bottom", "");
      fill(bottom, true);
      document.body.appendChild(bottom);
      document.body.classList.add("has-bottom-nav");

      // account / role chip links carry the role too
      var roleNm = document.querySelector("[data-role-name]");
      if (roleNm) roleNm.textContent = this.roleLabel(role);
    },

    bindRoleLinks: function () {
      var role = this.getRole();
      var withRole = this.withRole.bind(this);
      Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (a) {
        if (a.hasAttribute("data-no-role")) return;
        var href = a.getAttribute("href");
        if (!href || /^https?:|^#|^mailto:|^tel:/.test(href)) return;
        if (/(^|\/)login\.html/.test(href) || /(^|\/)register\.html/.test(href) || /(^|\/)landing\.html/.test(href) || /(^|\/)index\.html/.test(href)) return;
        if (/[?&]role=/.test(href)) return;
        a.setAttribute("href", withRole(href, role));
      });
    },

    /* ---- system-calculated delivery fee (identical rate card to mobile) ---- */
    FEE_BASE: 15, FEE_PER_ITEM: 3, FEE_RUSH: 8, FEE_PEAK: 5,
    parseQty: function (text) {
      if (!text) return 1;
      var m = String(text).match(/[×xX]\s*(\d+)/g);
      if (!m) return 1;
      var sum = 0; m.forEach(function (s) { sum += parseInt(s.replace(/[^\d]/g, ""), 10) || 0; });
      return Math.max(1, Math.min(8, sum || 1));
    },
    urgencyOf: function (timeStr) {
      if (!timeStr) return "normal";
      if (/越快|30\s*分鐘|盡快|急/.test(timeStr)) return "rush";
      if (/11:30|12:00|12:30|13:00/.test(timeStr)) return "peak";
      return "normal";
    },
    fee: function (opts) {
      opts = opts || {};
      var qty = Math.max(1, Math.min(8, opts.qty || 1));
      var urgency = opts.urgency || "normal";
      var portion = (qty - 1) * this.FEE_PER_ITEM;
      var surge = urgency === "rush" ? this.FEE_RUSH : urgency === "peak" ? this.FEE_PEAK : 0;
      var parts = [{ label: "基本帶餐費", amount: this.FEE_BASE }];
      if (portion) parts.push({ label: "餐點份量（" + qty + " 份）", amount: portion });
      if (surge) parts.push({ label: urgency === "rush" ? "急件加成" : "尖峰時段加成", amount: surge });
      return { qty: qty, urgency: urgency, total: this.FEE_BASE + portion + surge, parts: parts };
    },

    REORDERS: {
      mai: { restaurant: "拉亞漢堡", items: "蛋餅 ×1（不切）、紅茶微糖少冰 ×1", spot: "圖書館 1F 大廳", time: "11:30 前", note: "" },
      wu:  { restaurant: "茶壜", items: "微糖少冰珍奶 ×1", spot: "綜合大樓 5F 實驗室", time: "14:00 前", note: "封口不要插吸管，謝謝" },
      buf: { restaurant: "阿嬤的飯桶", items: "三菜一肉便當 ×1（不要辣）", spot: "圖書館 1F 大廳", time: "12:30 前", note: "" }
    },

    /* ---- campus restaurant catalogue — 陽明交通大學 光復校區 第二餐廳實際店家 ---- */
    RESTAURANTS: [
      { name: "阿嬤的飯桶",       cat: "便當・自助餐",   hot: true,  tags: ["便當", "雞腿", "排骨", "三菜一肉", "飯", "自助餐", "飯桶"] },
      { name: "拉亞漢堡",         cat: "中西式早午餐",   hot: true,  tags: ["蛋餅", "漢堡", "鐵板麵", "蔬食堡", "早餐", "早午餐", "laya"] },
      { name: "和食軒丼飯",       cat: "日式丼飯",       hot: true,  tags: ["丼飯", "親子丼", "豬排丼", "蓋飯", "日式", "donburi"] },
      { name: "茶壜",             cat: "手搖飲",         hot: true,  tags: ["珍奶", "紅茶", "綠茶", "奶茶", "飲料", "手搖", "茶壜"] },
      { name: "漢堡王",           cat: "速食",           hot: true,  tags: ["漢堡", "華堡", "薯條", "雞塊", "burger king", "速食"] },
      { name: "SUBWAY",          cat: "潛艇堡・輕食",   hot: false, tags: ["三明治", "潛艇堡", "沙拉", "輕食", "subway"] },
      { name: "強尼兄弟健康廚房", cat: "健康餐・輕食",   hot: false, tags: ["沙拉", "雞胸", "低卡", "健康餐", "便當", "johnny"] },
      { name: "太祖魷魚羹",       cat: "羹麵・小吃",     hot: false, tags: ["魷魚羹", "肉羹", "羹麵", "米粉", "小吃"] },
      { name: "藤村屋滷味",       cat: "滷味",           hot: false, tags: ["滷味", "滷蛋", "豆干", "甜不辣", "關東煮"] },
      { name: "素怡園",           cat: "蔬食・素食",     hot: false, tags: ["素食", "蔬食", "便當", "素", "養生"] },
      { name: "這家咖啡",         cat: "咖啡",           hot: false, tags: ["咖啡", "拿鐵", "美式", "coffee", "提神"] },
      { name: "小木屋鬆餅",       cat: "點心・鬆餅",     hot: false, tags: ["鬆餅", "培根蛋", "下午茶", "點心", "計中"] },
      { name: "HERE SPACE",      cat: "輕食・早午餐",   hot: false, tags: ["輕食", "沙拉", "brunch", "早午餐", "here space", "三樓"] },
      { name: "研三舍餐廳",       cat: "義式・鴨肉飯",   hot: false, tags: ["義大利麵", "鴨肉飯", "焗烤", "燉飯", "義式", "研三舍"] },
      { name: "7-ELEVEN",        cat: "便利商店",       hot: false, tags: ["超商", "咖啡", "御飯糰", "便當", "711", "小七"] }
    ],
    searchRestaurants: function (q) {
      q = (q || "").trim().toLowerCase();
      if (!q) return this.RESTAURANTS.filter(function (r) { return r.hot; });
      var scored = [];
      this.RESTAURANTS.forEach(function (r) {
        var name = r.name.toLowerCase();
        var idx = name.indexOf(q);
        var score = -1;
        if (idx === 0) score = 100;
        else if (idx > 0) score = 70;
        else if (r.cat.toLowerCase().indexOf(q) >= 0) score = 50;
        else if ((r.tags || []).some(function (t) { return t.toLowerCase().indexOf(q) >= 0; })) score = 40;
        if (score >= 0) scored.push({ r: r, s: score });
      });
      scored.sort(function (a, b) { return b.s - a.s; });
      return scored.map(function (x) { return x.r; });
    },
    /* ---- recent searches (persisted) ---- */
    recentSearches: function () {
      try { return JSON.parse(localStorage.getItem("ce_recent_rest") || "[]"); } catch (e) { return []; }
    },
    pushRecent: function (name) {
      if (!name) return;
      var list = this.recentSearches().filter(function (n) { return n !== name; });
      list.unshift(name); list = list.slice(0, 5);
      try { localStorage.setItem("ce_recent_rest", JSON.stringify(list)); } catch (e) {}
    },
    clearRecent: function () { try { localStorage.removeItem("ce_recent_rest"); } catch (e) {} },

    ORDERS: {
      "CE-2039": { owner: "orderer", status: "done", restaurant: "拉亞漢堡", items: "蛋餅 ×1（不切）、紅茶微糖少冰 ×1", spot: "圖書館 1F 大廳", date: "昨天 10:32", deadline: "11:30 前", fee: 25, reorder: "mai", counterpart: { name: "阿翔", initial: "翔" }, timeline: ["已發布", "已接單", "已購買", "配送中", "已送達", "已完成"], you: { rated: false }, them: { rated: true, stars: 5, comment: "訂單清楚、取餐準時，給五星！" } },
      "CE-2018": { owner: "orderer", status: "cancelled", restaurant: "小木屋鬆餅", items: "培根蛋鬆餅 ×1", spot: "圖書館 1F 大廳", date: "5/27 13:05", deadline: "13:40 前", fee: 20, reorder: null, counterpart: null, cancelReason: "逾時無人接單，系統已自動取消，未產生任何費用。", timeline: ["已發布", "已取消"] },
      "CE-2031": { owner: "runner", status: "done", restaurant: "阿嬤的飯桶", items: "三菜一肉便當 ×1（不要辣）", spot: "綜合大樓 5F 實驗室", date: "昨天 12:18", deadline: "12:30 前", fee: 20, reorder: null, counterpart: { name: "阿哲", initial: "哲" }, timeline: ["已發布", "已接單", "已購買", "配送中", "已送達", "已完成"], you: { rated: true, stars: 5, tags: ["準時", "餐點正確"], comment: "" }, them: { rated: true, stars: 5, comment: "外送速度很快，謝謝！" } },
      "CE-2026": { owner: "runner", status: "done", restaurant: "茶壜", items: "半糖去冰綠茶 ×1", spot: "行政大樓 2F 辦公室", date: "昨天 09:50", deadline: "10:20 前", fee: 25, reorder: null, counterpart: { name: "小琳", initial: "琳" }, timeline: ["已發布", "已接單", "已購買", "配送中", "已送達", "已完成"], you: { rated: false }, them: { rated: false } }
    },
    getOrder: function (id) { return this.ORDERS[id] || null; }
  };

  /* ---- brand mark + favicon (shared identity, no extra asset) ---- */
  var MARK_MASK_SHAPES = [
    ["path", { d: "M20 4 C26.6 4 32 8.8 32 14.8 C32 22.5 20 35.5 20 35.5 C20 35.5 8 22.5 8 14.8 C8 8.8 13.4 4 20 4 Z", fill: "#fff" }],
    ["rect", { x: 16.4, y: 9.4, width: 1.8, height: 6.6, rx: 0.9, fill: "#000" }],
    ["rect", { x: 19.1, y: 9.4, width: 1.8, height: 6.6, rx: 0.9, fill: "#000" }],
    ["rect", { x: 21.8, y: 9.4, width: 1.8, height: 6.6, rx: 0.9, fill: "#000" }],
    ["rect", { x: 16.4, y: 14.2, width: 7.2, height: 1.9, rx: 0.95, fill: "#000" }],
    ["rect", { x: 19.1, y: 14.2, width: 1.8, height: 9.4, rx: 0.9, fill: "#000" }]
  ];
  function makeNode(name, attrs) { var n = document.createElementNS(SVGNS, name); Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }
  function injectBrandSprite() {
    if (document.getElementById("ce-mark")) return;
    var sprite = makeNode("svg", { "aria-hidden": "true" });
    sprite.style.position = "absolute"; sprite.style.width = "0"; sprite.style.height = "0"; sprite.style.overflow = "hidden";
    var symbol = makeNode("symbol", { id: "ce-mark", viewBox: "0 0 40 40" });
    var mask = makeNode("mask", { id: "ce-mark-mask" });
    MARK_MASK_SHAPES.forEach(function (s) { mask.appendChild(makeNode(s[0], s[1])); });
    symbol.appendChild(mask);
    symbol.appendChild(makeNode("rect", { width: 40, height: 40, fill: "currentColor", mask: "url(#ce-mark-mask)" }));
    sprite.appendChild(symbol);
    document.body.insertBefore(sprite, document.body.firstChild);
  }
  function mountBrandMarks() {
    document.querySelectorAll("[data-brand-mark]").forEach(function (host) {
      if (host.querySelector(".brand-ce-mark")) return;
      var svg = makeNode("svg", { class: "brand-ce-mark", viewBox: "0 0 40 40", "aria-hidden": "true" });
      var use = makeNode("use", {}); use.setAttribute("href", "#ce-mark"); svg.appendChild(use);
      host.insertBefore(svg, host.firstChild);
      host.classList.add("has-brand-mark");
    });
  }
  function injectFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#000"/><mask id="f"><path d="M20 4 C26.6 4 32 8.8 32 14.8 C32 22.5 20 35.5 20 35.5 C20 35.5 8 22.5 8 14.8 C8 8.8 13.4 4 20 4 Z" fill="#fff"/><rect x="16.4" y="9.4" width="1.8" height="6.6" rx="0.9" fill="#000"/><rect x="19.1" y="9.4" width="1.8" height="6.6" rx="0.9" fill="#000"/><rect x="21.8" y="9.4" width="1.8" height="6.6" rx="0.9" fill="#000"/><rect x="16.4" y="14.2" width="7.2" height="1.9" rx="0.95" fill="#000"/><rect x="19.1" y="14.2" width="1.8" height="9.4" rx="0.9" fill="#000"/></mask><rect width="40" height="40" fill="#fff" mask="url(#f)"/></svg>';
    var link = document.createElement("link"); link.rel = "icon"; link.type = "image/svg+xml"; link.href = "data:image/svg+xml," + encodeURIComponent(svg);
    document.head.appendChild(link);
  }
  window.CampusEats.mountBrandMarks = mountBrandMarks;

  /* ---- toast ---- */
  function ensureWrap() { var w = document.querySelector(".toast-wrap"); if (!w) { w = document.createElement("div"); w.className = "toast-wrap"; document.body.appendChild(w); } return w; }
  window.toast = function (msg, opts) {
    opts = opts || {};
    var w = ensureWrap();
    var t = document.createElement("div"); t.className = "toast";
    if (opts.icon !== false) t.appendChild(svgIcon("0 0 24 24", ["M20 6L9 17l-5-5"], { sw: "2.4" }));
    var span = document.createElement("span"); span.textContent = msg; t.appendChild(span);
    w.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-in"); });
    setTimeout(function () { t.classList.remove("is-in"); setTimeout(function () { t.remove(); }, 250); }, opts.duration || 2200);
  };

  /* ---- centered dialog (the mobile bottom-sheet, restyled by CSS) ---- */
  window.openSheet = function (id) {
    var sheet = document.getElementById(id); if (!sheet) return;
    var scrim = document.querySelector(".scrim");
    if (!scrim) { scrim = document.createElement("div"); scrim.className = "scrim"; document.body.appendChild(scrim); }
    scrim.classList.add("is-open"); sheet.classList.add("is-open");
    scrim.onclick = function () { window.closeSheet(id); };
  };
  window.closeSheet = function (id) {
    var sheet = document.getElementById(id); var scrim = document.querySelector(".scrim");
    if (sheet) sheet.classList.remove("is-open"); if (scrim) scrim.classList.remove("is-open");
  };

  /* ---- star rating widget ---- */
  function buildStars(el) {
    var max = parseInt(el.getAttribute("data-max") || "5", 10);
    var value = parseInt(el.getAttribute("data-value") || "0", 10);
    var readonly = el.hasAttribute("data-readonly");
    if (readonly) el.classList.add("stars--static");
    var STAR_D = "M12 2l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 18.2 6.1 21.3l1.2-6.6L2.5 9l6.6-.9z";
    while (el.firstChild) el.removeChild(el.firstChild);
    for (var i = 1; i <= max; i++) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "star" + (i <= value ? " is-on" : "");
      b.setAttribute("aria-label", i + " 星"); b.dataset.v = i;
      b.appendChild(svgIcon("0 0 24 24", [STAR_D], { sw: "1.5" }));
      el.appendChild(b);
    }
    if (readonly) return;
    el.addEventListener("click", function (e) {
      var btn = e.target.closest(".star"); if (!btn) return;
      value = parseInt(btn.dataset.v, 10);
      el.setAttribute("data-value", value);
      el.querySelectorAll(".star").forEach(function (s) { s.classList.toggle("is-on", parseInt(s.dataset.v, 10) <= value); });
      el.dispatchEvent(new CustomEvent("rate", { detail: value }));
    });
  }
  window.CampusEats.buildStars = buildStars;

  /* ---- restaurant search / autocomplete dropdown ---- */
  var STORE_ICON = ["M4 8l1.2-3.2a2 2 0 0 1 1.9-1.3h9.8a2 2 0 0 1 1.9 1.3L20 8M4 8h16M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8"];
  var STORE_SHAPES = [["path", { d: STORE_ICON[0] }]];
  var SEARCH_ICON = [["circle", { cx: 11, cy: 11, r: 7 }], ["path", { d: "M21 21l-4-4" }]];
  var CLOCK_ICON = [["circle", { cx: 12, cy: 12, r: 9 }], ["path", { d: "M12 7v5l3.5 2" }]];
  function mountRestaurantSearch(input, opts) {
    if (!input || input.dataset.acReady) return;
    input.dataset.acReady = "1";
    input.setAttribute("autocomplete", "off");
    opts = opts || {};
    var CE = window.CampusEats;
    var box = opts.container || input.parentNode;
    box.classList.add("rest-ac");
    var panel = document.createElement("div");
    panel.className = "rest-ac__panel"; panel.hidden = true; panel.setAttribute("role", "listbox");
    box.appendChild(panel);
    var rows = [], active = -1;

    function hl() { rows.forEach(function (r, i) { r.classList.toggle("is-active", i === active); }); }
    function pick(name) { CE.pushRecent(name); input.value = name; close(); input.dispatchEvent(new Event("input", { bubbles: true })); if (opts.onSelect) opts.onSelect(name); }
    function close() { panel.hidden = true; active = -1; }
    function row(cls) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "rest-ac__opt" + (cls ? " " + cls : ""); b.setAttribute("role", "option");
      b.addEventListener("mousedown", function (e) { e.preventDefault(); }); // keep focus until click resolves
      return b;
    }
    function makeRow(name, cat, shapes) {
      var b = row();
      b.appendChild(svgShapes("0 0 24 24", shapes || STORE_SHAPES));
      var t = document.createElement("span"); t.className = "rest-ac__t";
      var nm = document.createElement("strong"); nm.textContent = name; t.appendChild(nm);
      var ct = document.createElement("span"); ct.className = "rest-ac__cat"; ct.textContent = cat; t.appendChild(ct);
      b.appendChild(t);
      b.addEventListener("click", function () { pick(name); });
      panel.appendChild(b); rows.push(b);
    }
    function head(text, onClear) {
      var h = document.createElement("div"); h.className = "rest-ac__head";
      var s = document.createElement("span"); s.textContent = text; h.appendChild(s);
      if (onClear) {
        var c = document.createElement("button");
        c.type = "button"; c.className = "rest-ac__clear"; c.textContent = "清除";
        c.addEventListener("mousedown", function (e) { e.preventDefault(); });
        c.addEventListener("click", function () { onClear(); open(); });
        h.appendChild(c);
      }
      panel.appendChild(h);
    }
    function catOf(name) {
      var hit = CE.RESTAURANTS.filter(function (r) { return r.name === name; })[0];
      return hit ? hit.cat : "最近搜尋";
    }
    function open() {
      var q = input.value.trim();
      while (panel.firstChild) panel.removeChild(panel.firstChild); rows = []; active = -1;
      if (!q) {
        var rec = CE.recentSearches();
        if (rec.length) {
          head("最近搜尋", function () { CE.clearRecent(); });
          rec.forEach(function (name) { makeRow(name, catOf(name), CLOCK_ICON); });
        }
        head("熱門餐廳");
        CE.searchRestaurants("").forEach(function (r) { makeRow(r.name, r.cat); });
      } else {
        var list = CE.searchRestaurants(q);
        list.forEach(function (r) { makeRow(r.name, r.cat); });
        if (!list.some(function (r) { return r.name === q; })) {
          var f = row("rest-ac__opt--free");
          f.appendChild(svgShapes("0 0 24 24", SEARCH_ICON));
          var ft = document.createElement("span"); ft.className = "rest-ac__t";
          var fn = document.createElement("strong"); fn.textContent = "直接帶「" + q + "」"; ft.appendChild(fn);
          var fc = document.createElement("span"); fc.className = "rest-ac__cat"; fc.textContent = "找不到？用你輸入的店名發單"; ft.appendChild(fc);
          f.appendChild(ft);
          f.addEventListener("click", function () { pick(q); });
          panel.appendChild(f); rows.push(f);
        }
      }
      panel.hidden = rows.length === 0;
    }

    input.addEventListener("focus", open);
    input.addEventListener("input", open);
    input.addEventListener("blur", function () { setTimeout(close, 140); });
    input.addEventListener("keydown", function (e) {
      if (panel.hidden) { if (e.key === "ArrowDown") open(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, rows.length - 1); hl(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); hl(); }
      else if (e.key === "Enter" && active >= 0) { e.preventDefault(); rows[active].click(); }
      else if (e.key === "Escape") { close(); }
    });
  }
  window.CampusEats.mountRestaurantSearch = mountRestaurantSearch;
  function autoMountSearch() {
    document.querySelectorAll("[data-rest-search]").forEach(function (box) {
      var input = box.querySelector("input"); if (!input) return;
      var mode = box.getAttribute("data-rest-search");
      mountRestaurantSearch(input, {
        container: box,
        onSelect: function (name) {
          if (mode === "navigate") location.href = window.CampusEats.withRole("post-order.html?restaurant=" + encodeURIComponent(name));
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectFavicon();
    injectBrandSprite();
    mountBrandMarks();
    document.querySelectorAll("[data-stars]").forEach(buildStars);
    autoMountSearch();
    window.CampusEats.mountTopnav();
    window.CampusEats.bindRoleLinks();
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { var open = document.querySelector(".sheet.is-open"); if (open) window.closeSheet(open.id); }
    });
  });
})();
