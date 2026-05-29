/* CampusEats — shared interactions (no dependencies, no innerHTML) */
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
    paths.forEach(function (d) {
      var p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", d);
      s.appendChild(p);
    });
    return s;
  }
  /* svg builder that supports mixed shapes (path + circle + rect) */
  function svgShapes(viewBox, shapes, opts) {
    opts = opts || {};
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", viewBox);
    s.setAttribute("fill", opts.fill || "none");
    s.setAttribute("stroke", opts.stroke || "currentColor");
    s.setAttribute("stroke-width", opts.sw || "2");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    shapes.forEach(function (sh) {
      var node = document.createElementNS(SVGNS, sh[0]);
      var attrs = sh[1];
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
      s.appendChild(node);
    });
    return s;
  }

  /* ---- role state ----
   * Single account, but the two roles are *separate experiences*, picked at
   * login (mirrors Uber: the Eats app and the Driver app are distinct apps,
   * not a toggle). Switching role means returning to the login gate. There is
   * no in-app role switch. */
  var ROLE_KEY = "campuseats.role";

  /* role-specific bottom navigation — never mixed */
  var ICON = {
    home:   [["path", { d: "M3 11l9-8 9 8M5 10v10h14V10" }]],
    post:   [["path", { d: "M12 5v14M5 12h14" }]],
    orders: [["path", { d: "M6 4h11l3 3v13H6zM9 4v4h7" }]],
    feed:   [["path", { d: "M4 7h16M4 12h16M4 17h16" }]],
    me:     [["circle", { cx: 12, cy: 8, r: 4 }], ["path", { d: "M4 21a8 8 0 0 1 16 0" }]]
  };
  var TABS = {
    orderer: [
      { key: "home",   href: "dashboard.html",  label: "首頁",   icon: ICON.home },
      { key: "post",   href: "post-order.html", label: "發單",   icon: ICON.post },
      { key: "orders", href: "my-orders.html",  label: "訂單",   icon: ICON.orders },
      { key: "me",     href: "profile.html",    label: "我的",   icon: ICON.me }
    ],
    runner: [
      { key: "home",   href: "feed.html",       label: "接單",   icon: ICON.feed },
      { key: "orders", href: "my-orders.html",  label: "我接的", icon: ICON.orders },
      { key: "me",     href: "profile.html",    label: "我的",   icon: ICON.me }
    ]
  };

  function normRole(r) { return r === "runner" ? "runner" : "orderer"; }
  /* read ?role= from the current URL — survives sandboxes where localStorage
   * writes are blocked (embedded preview iframes). The URL is the source of
   * truth; localStorage is only a convenience cache. */
  function roleFromUrl() {
    try {
      var v = new URLSearchParams(location.search).get("role");
      return v === "runner" || v === "orderer" ? v : null;
    } catch (e) { return null; }
  }

  window.CampusEats = {
    getRole: function () {
      // URL param wins (login handoff carries it); persist it forward when we can.
      var u = roleFromUrl();
      if (u) { this.setRole(u); return u; }
      try { return normRole(localStorage.getItem(ROLE_KEY)); } catch (e) { return "orderer"; }
    },
    setRole: function (r) { try { localStorage.setItem(ROLE_KEY, normRole(r)); } catch (e) {} },
    roleLabel: function (r) { return (r || this.getRole()) === "runner" ? "帶餐者" : "訂餐者"; },
    /* append the active role to an in-app link so navigation never loses it,
     * even when localStorage is unavailable. */
    withRole: function (href, r) {
      r = normRole(r || this.getRole());
      if (!href || /^https?:|^#|^mailto:/.test(href)) return href;
      return href + (href.indexOf("?") === -1 ? "?" : "&") + "role=" + r;
    },
    /* home screen for the active role — carries the role in the URL */
    home: function (r) {
      r = normRole(r || this.getRole());
      return (r === "runner" ? "feed.html" : "dashboard.html") + "?role=" + r;
    },
    /* page-level guard: bounce to the role's own home if the role mismatches.
     * `allowed` = "orderer" | "runner" | "any". Uses replace() so the back
     * button can't re-enter the wrong-role screen. */
    guard: function (allowed) {
      var r = this.getRole();
      if (allowed && allowed !== "any" && r !== allowed) {
        location.replace(this.home(r));
        return false;
      }
      return true;
    },
    /* fill <nav class="tabbar" data-tabbar data-active="KEY"> with the
     * tab set for the active role. Orderer and runner never share a bar. */
    mountTabbar: function () {
      var nav = document.querySelector("nav[data-tabbar]");
      if (!nav) return;
      var role = this.getRole();
      var active = nav.getAttribute("data-active");
      var tabs = TABS[role] || TABS.orderer;
      var withRole = this.withRole.bind(this);
      while (nav.firstChild) nav.removeChild(nav.firstChild);
      tabs.forEach(function (t) {
        var a = document.createElement("a");
        a.href = withRole(t.href, role);
        if (t.key === active) a.setAttribute("aria-current", "page");
        a.appendChild(svgShapes("0 0 24 24", t.icon));
        var span = document.createElement("span");
        span.textContent = t.label;
        a.appendChild(span);
        nav.appendChild(a);
      });
    },

    /* ---- role-sticky links ----
     * The two roles are separate experiences picked at login; the active role
     * lives in the URL (?role=) so it survives sandboxes where localStorage is
     * unavailable. Static <a> links in the markup don't carry it, so a runner
     * tapping a record (我接的 → 帶單詳情) would land role-less, fall back to the
     * orderer default, and get bounced into the訂餐者 screens. This rewrites
     * every in-app link to carry the current role so navigation never crosses
     * roles. Exempt: external links, anchors, and the login gate (login.html /
     * [data-no-role]) — switching role is only ever done by logging in again. */
    bindRoleLinks: function () {
      var role = this.getRole();
      var withRole = this.withRole.bind(this);
      Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (a) {
        if (a.hasAttribute("data-no-role")) return;
        var href = a.getAttribute("href");
        if (!href || /^https?:|^#|^mailto:|^tel:/.test(href)) return;
        if (/(^|\/)login\.html/.test(href)) return;   // login gate owns role choice
        if (/[?&]role=/.test(href)) return;            // role already pinned on this link
        a.setAttribute("href", withRole(href, role));
      });
    },

    /* ---- system-calculated delivery fee ----
     * Mirrors Uber Eats: the customer never types or picks the fee — the
     * platform computes it from a fixed campus rate card and shows a
     * transparent breakdown. Inputs are signals we actually have on the
     * request: how many items (basket size) and how urgent (time slot).
     *   base       NT$15  flat campus base
     *   portion    +$3 per item beyond the first (basket size)
     *   urgency    +$8 急件 (越快越好) / +$5 尖峰 (午餐高峰) / +$0 一般
     * Returns { total, parts:[{label, amount}] } so every screen renders the
     * same number from the same rule. */
    FEE_BASE: 15,
    FEE_PER_ITEM: 3,
    FEE_RUSH: 8,
    FEE_PEAK: 5,
    parseQty: function (text) {
      if (!text) return 1;
      var m = String(text).match(/[×xX]\s*(\d+)/g);
      if (!m) return 1;
      var sum = 0;
      m.forEach(function (s) { sum += parseInt(s.replace(/[^\d]/g, ""), 10) || 0; });
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

    /* reorder presets — "再發一次" loads the previous order back into the
     * request form instead of starting blank (Uber Eats "Order again"). */
    REORDERS: {
      mai: { restaurant: "麥味登", items: "蛋餅 ×1（不切）、紅茶微糖少冰 ×1", spot: "圖書館 1F 大廳", time: "11:30 前", note: "" },
      wu:  { restaurant: "五十嵐", items: "微糖少冰珍奶 ×1", spot: "綜合大樓 5F 實驗室", time: "14:00 前", note: "封口不要插吸管，謝謝" },
      buf: { restaurant: "自助餐", items: "三菜一肉便當 ×1（不要辣）", spot: "圖書館 1F 大廳", time: "12:30 前", note: "" }
    },

    /* ---- order records (single source of truth for history detail) ----
     * Keyed by order id. `owner` is whose history this belongs to (the role
     * that posted/accepted it); the counterpart is the other party. Rating is
     * two-way (Uber Eats / Uber Driver both let each side rate the other):
     *   you   = the rating the owner gave the counterpart
     *   them  = the rating the counterpart gave the owner
     * `rated:false` means still pending → screen offers a 前往評價 CTA. */
    ORDERS: {
      "CE-2039": {
        owner: "orderer", status: "done", restaurant: "麥味登",
        items: "蛋餅 ×1（不切）、紅茶微糖少冰 ×1", spot: "圖書館 1F 大廳",
        date: "昨天 10:32", deadline: "11:30 前", fee: 25, reorder: "mai",
        counterpart: { name: "阿翔", initial: "翔" },
        timeline: ["已發布", "已接單", "已購買", "配送中", "已送達", "已完成"],
        you:  { rated: false },
        them: { rated: true, stars: 5, comment: "訂單清楚、取餐準時，給五星！" }
      },
      "CE-2018": {
        owner: "orderer", status: "cancelled", restaurant: "小木屋鬆餅",
        items: "培根蛋鬆餅 ×1", spot: "圖書館 1F 大廳",
        date: "5/27 13:05", deadline: "13:40 前", fee: 20, reorder: null,
        counterpart: null,
        cancelReason: "逾時無人接單，系統已自動取消，未產生任何費用。",
        timeline: ["已發布", "已取消"]
      },
      "CE-2031": {
        owner: "runner", status: "done", restaurant: "自助餐",
        items: "三菜一肉便當 ×1（不要辣）", spot: "綜合大樓 5F 實驗室",
        date: "昨天 12:18", deadline: "12:30 前", fee: 20, reorder: null,
        counterpart: { name: "阿哲", initial: "哲" },
        timeline: ["已發布", "已接單", "已購買", "配送中", "已送達", "已完成"],
        you:  { rated: true, stars: 5, tags: ["準時", "餐點正確"], comment: "" },
        them: { rated: true, stars: 5, comment: "外送速度很快，謝謝！" }
      },
      "CE-2026": {
        owner: "runner", status: "done", restaurant: "五十嵐",
        items: "半糖去冰綠茶 ×1", spot: "行政大樓 2F 辦公室",
        date: "昨天 09:50", deadline: "10:20 前", fee: 25, reorder: null,
        counterpart: { name: "小琳", initial: "琳" },
        timeline: ["已發布", "已接單", "已購買", "配送中", "已送達", "已完成"],
        you:  { rated: false },
        them: { rated: false }
      }
    },
    getOrder: function (id) { return this.ORDERS[id] || null; }
  };

  /* ---- brand mark ----
   * The CampusEats mark = 定位圖釘 ⊕ 餐叉鏤空. Defined once as an off-screen
   * <symbol> so every screen references the same geometry; the rect fills with
   * currentColor, so the mark is black on light app bars and flips white on
   * dark surfaces automatically. Built with createElementNS to match this
   * file's no-innerHTML convention. */
  var MARK_MASK_SHAPES = [
    ["path", { d: "M20 4 C26.6 4 32 8.8 32 14.8 C32 22.5 20 35.5 20 35.5 C20 35.5 8 22.5 8 14.8 C8 8.8 13.4 4 20 4 Z", fill: "#fff" }],
    ["rect", { x: 16.4, y: 9.4, width: 1.8, height: 6.6, rx: 0.9, fill: "#000" }],
    ["rect", { x: 19.1, y: 9.4, width: 1.8, height: 6.6, rx: 0.9, fill: "#000" }],
    ["rect", { x: 21.8, y: 9.4, width: 1.8, height: 6.6, rx: 0.9, fill: "#000" }],
    ["rect", { x: 16.4, y: 14.2, width: 7.2, height: 1.9, rx: 0.95, fill: "#000" }],
    ["rect", { x: 19.1, y: 14.2, width: 1.8, height: 9.4, rx: 0.9, fill: "#000" }]
  ];
  function makeNode(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function injectBrandSprite() {
    if (document.getElementById("ce-mark")) return;
    var sprite = makeNode("svg", { "aria-hidden": "true" });
    sprite.style.position = "absolute";
    sprite.style.width = "0";
    sprite.style.height = "0";
    sprite.style.overflow = "hidden";
    var symbol = makeNode("symbol", { id: "ce-mark", viewBox: "0 0 40 40" });
    var mask = makeNode("mask", { id: "ce-mark-mask" });
    MARK_MASK_SHAPES.forEach(function (s) { mask.appendChild(makeNode(s[0], s[1])); });
    symbol.appendChild(mask);
    symbol.appendChild(makeNode("rect", { width: 40, height: 40, fill: "currentColor", mask: "url(#ce-mark-mask)" }));
    sprite.appendChild(symbol);
    document.body.insertBefore(sprite, document.body.firstChild);
  }
  /* fill every [data-brand-mark] element by prepending the mark; CSS turns the
   * host into an inline-flex lockup so the existing wordmark sits beside it. */
  function mountBrandMarks() {
    document.querySelectorAll("[data-brand-mark]").forEach(function (host) {
      if (host.querySelector(".brand-ce-mark")) return;
      var svg = makeNode("svg", { class: "brand-ce-mark", viewBox: "0 0 40 40", "aria-hidden": "true" });
      var use = makeNode("use", {});
      use.setAttribute("href", "#ce-mark");
      svg.appendChild(use);
      host.insertBefore(svg, host.firstChild);
      host.classList.add("has-brand-mark");
    });
  }
  /* favicon: black rounded-square + white mark (the app-icon treatment), as an
   * inline data-URI so all screens share one identity with no extra asset. */
  function injectFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
      '<rect width="40" height="40" rx="9" fill="#000"/>' +
      '<mask id="f">' +
      '<path d="M20 4 C26.6 4 32 8.8 32 14.8 C32 22.5 20 35.5 20 35.5 C20 35.5 8 22.5 8 14.8 C8 8.8 13.4 4 20 4 Z" fill="#fff"/>' +
      '<rect x="16.4" y="9.4" width="1.8" height="6.6" rx="0.9" fill="#000"/>' +
      '<rect x="19.1" y="9.4" width="1.8" height="6.6" rx="0.9" fill="#000"/>' +
      '<rect x="21.8" y="9.4" width="1.8" height="6.6" rx="0.9" fill="#000"/>' +
      '<rect x="16.4" y="14.2" width="7.2" height="1.9" rx="0.95" fill="#000"/>' +
      '<rect x="19.1" y="14.2" width="1.8" height="9.4" rx="0.9" fill="#000"/>' +
      '</mask>' +
      '<rect width="40" height="40" fill="#fff" mask="url(#f)"/></svg>';
    var link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = "data:image/svg+xml," + encodeURIComponent(svg);
    document.head.appendChild(link);
  }
  window.CampusEats.injectBrandSprite = injectBrandSprite;
  window.CampusEats.mountBrandMarks = mountBrandMarks;

  /* ---- toast ---- */
  function ensureWrap() {
    var w = document.querySelector(".toast-wrap");
    if (!w) { w = document.createElement("div"); w.className = "toast-wrap"; document.body.appendChild(w); }
    return w;
  }
  window.toast = function (msg, opts) {
    opts = opts || {};
    var w = ensureWrap();
    var t = document.createElement("div");
    t.className = "toast";
    if (opts.icon !== false) t.appendChild(svgIcon("0 0 24 24", ["M20 6L9 17l-5-5"], { sw: "2.4" }));
    var span = document.createElement("span");
    span.textContent = msg;
    t.appendChild(span);
    w.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-in"); });
    setTimeout(function () {
      t.classList.remove("is-in");
      setTimeout(function () { t.remove(); }, 250);
    }, opts.duration || 2200);
  };

  /* ---- bottom sheet ---- */
  window.openSheet = function (id) {
    var sheet = document.getElementById(id);
    if (!sheet) return;
    var scrim = document.querySelector(".scrim");
    if (!scrim) { scrim = document.createElement("div"); scrim.className = "scrim"; document.body.appendChild(scrim); }
    scrim.classList.add("is-open");
    sheet.classList.add("is-open");
    scrim.onclick = function () { window.closeSheet(id); };
  };
  window.closeSheet = function (id) {
    var sheet = document.getElementById(id);
    var scrim = document.querySelector(".scrim");
    if (sheet) sheet.classList.remove("is-open");
    if (scrim) scrim.classList.remove("is-open");
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
      b.type = "button";
      b.className = "star" + (i <= value ? " is-on" : "");
      b.setAttribute("aria-label", i + " 星");
      b.dataset.v = i;
      b.appendChild(svgIcon("0 0 24 24", [STAR_D], { sw: "1.5" }));
      el.appendChild(b);
    }
    if (readonly) return;
    el.addEventListener("click", function (e) {
      var btn = e.target.closest(".star"); if (!btn) return;
      value = parseInt(btn.dataset.v, 10);
      el.setAttribute("data-value", value);
      el.querySelectorAll(".star").forEach(function (s) {
        s.classList.toggle("is-on", parseInt(s.dataset.v, 10) <= value);
      });
      el.dispatchEvent(new CustomEvent("rate", { detail: value }));
    });
  }
  window.CampusEats.buildStars = buildStars;

  document.addEventListener("DOMContentLoaded", function () {
    injectFavicon();
    injectBrandSprite();
    mountBrandMarks();
    document.querySelectorAll("[data-stars]").forEach(buildStars);
    window.CampusEats.mountTabbar();
    window.CampusEats.bindRoleLinks();
  });
})();
