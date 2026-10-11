/* Renders page text, extra pages, menu links and the Google map from the *-data.js files. You normally never edit this file. */
(function () {
  var C = window.ORIGO_CONTENT || {};
  var S = window.ORIGO_SITE || {};
  var P = window.ORIGO_PAGES || [];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var get = function (p) { return p.split(".").reduce(function (o, k) { return o && o[k]; }, C); };
  /* titles: new line = line break, *word* = accent/outline word */
  var fmt = function (s) { return esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/\r?\n/g, "<br>"); };
  var pad = function (i) { return String(i + 1).padStart(2, "0"); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- simple text / title / link bindings ---------- */
  qsa("[data-c]").forEach(function (el) { var v = get(el.getAttribute("data-c")); if (typeof v === "string" && v !== "") el.textContent = v; });
  qsa("[data-c-title]").forEach(function (el) { var v = get(el.getAttribute("data-c-title")); if (typeof v === "string" && v !== "") el.innerHTML = fmt(v); });
  qsa("[data-c-href]").forEach(function (el) { var v = get(el.getAttribute("data-c-href")); if (typeof v === "string" && v !== "") el.setAttribute("href", v); });

  /* ---------- repeated blocks ---------- */
  var H = C.home || {}, A = C.about || {};
  var stats = document.getElementById("home-stats");
  if (stats && H.stats && H.stats.length) stats.innerHTML = H.stats.map(function (s) { return '<div class="stat"><b>' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>"; }).join("");
  var caps = function (arr) { return arr.map(function (c, i) { return '<div class="cap"><div class="n">' + pad(i) + "</div><h3>" + esc(c.title) + "</h3><p>" + esc(c.text) + "</p></div>"; }).join(""); };
  var doEl = document.getElementById("home-do");
  if (doEl && H.doCards && H.doCards.length) doEl.innerHTML = caps(H.doCards);
  var vEl = document.getElementById("about-values");
  if (vEl && A.valuesCards && A.valuesCards.length) vEl.innerHTML = caps(A.valuesCards);
  var mEl = document.getElementById("about-meta");
  if (mEl && A.meta && A.meta.length) mEl.innerHTML = A.meta.map(function (m) { return '<div class="meta-item"><span>' + esc(m.label) + "</span><strong>" + esc(m.value) + "</strong></div>"; }).join("");

  /* ---------- extra pages: menu + footer links ---------- */
  var pages = P.filter(function (p) { return p && p.slug && p.published !== false; });
  var cur = new URLSearchParams(location.search).get("p");
  var menu = pages.filter(function (p) { return p.showInMenu; });
  if (menu.length) {
    var nav = document.querySelector(".nav-links");
    if (nav) {
      var cta = nav.querySelector("li:last-child");
      menu.forEach(function (p) {
        var li = document.createElement("li");
        li.innerHTML = '<a class="' + (cur === p.slug ? "active" : "") + '" href="page.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + "</a>";
        nav.insertBefore(li, cta);
      });
    }
    var fl = document.querySelector(".footer-links");
    if (fl) menu.forEach(function (p) { var li = document.createElement("li"); li.innerHTML = '<a href="page.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.title) + "</a>"; fl.appendChild(li); });
  }

  /* ---------- extra page renderer (page.html?p=slug) ---------- */
  var root = document.getElementById("page-root");
  if (root) {
    var pg = pages.filter(function (p) { return p.slug === cur; })[0];
    var yt = function (u) { var m = String(u || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/); return m ? m[1] : ""; };
    if (!pg) {
      document.title = "Page not found | Origo Ventures";
      root.innerHTML = '<section class="page-hero"><div class="container"><div class="eyebrow">Page</div><h1>Page not<br><em>found</em></h1><p class="lead">This page may have been moved or removed.</p><div class="btn-row" style="margin-top:34px"><a class="btn" href="index.html">Back to Home</a></div></div></section>';
    } else {
      document.title = pg.title + " | Origo Ventures";
      var out = '<section class="page-hero"><div class="container">' + (pg.eyebrow ? '<div class="eyebrow reveal">' + esc(pg.eyebrow) + "</div>" : "") +
        '<h1 class="reveal ev-title">' + fmt(pg.title) + "</h1>" + (pg.lead ? '<p class="lead reveal">' + esc(pg.lead) + "</p>" : "") + "</div></section>";
      (pg.blocks || []).forEach(function (b, bi) {
        var head = b.heading ? '<div class="section-head"><h2 class="section-title">' + fmt(b.heading) + "</h2></div>" : "";
        var top = bi === 0 ? "" : ' style="border-top:1px solid var(--line)"';
        if (b.type === "text") {
          out += '<section class="section reveal"' + top + '><div class="container">' + head + '<div class="pg-text">' + (b.body || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div></div></section>";
        } else if (b.type === "image" && b.image) {
          out += '<section class="section reveal"' + top + '><div class="container"><figure class="pg-img"><img src="' + esc(b.image) + '" alt="' + esc(b.caption || "") + '" loading="lazy">' + (b.caption ? "<figcaption>" + esc(b.caption) + "</figcaption>" : "") + "</figure></div></section>";
        } else if (b.type === "gallery") {
          out += '<section class="section reveal"' + top + '><div class="container">' + head + '<div class="gallery">' + (b.images || []).filter(function (g) { return g.image; }).map(function (g) { return '<figure class="pg-img"><img src="' + esc(g.image) + '" alt="' + esc(g.caption || "") + '" loading="lazy">' + (g.caption ? "<figcaption>" + esc(g.caption) + "</figcaption>" : "") + "</figure>"; }).join("") + "</div></div></section>";
        } else if (b.type === "cards") {
          out += '<section class="section reveal"' + top + '><div class="container">' + head + '<div class="cap-grid">' + caps(b.cards || []) + "</div></div></section>";
        } else if (b.type === "video" && yt(b.url)) {
          out += '<section class="section reveal"' + top + '><div class="container">' + head + '<div class="pg-video"><iframe src="https://www.youtube-nocookie.com/embed/' + yt(b.url) + '" title="Video" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div></div></section>';
        } else if (b.type === "button" && b.text) {
          out += '<section class="section reveal"' + top + '><div class="container"><div class="btn-row"><a class="btn' + (b.style === "ghost" ? " ghost" : "") + '" href="' + esc(b.link || "#") + '"' + (/^https?:/i.test(b.link || "") ? ' target="_blank" rel="noopener"' : "") + ">" + esc(b.text) + "</a></div></div></section>";
        }
      });
      out += '<section class="cta reveal"><div class="container"></div></section>';
      root.innerHTML = out;
    }
  }

  /* ---------- shared call-to-action block ---------- */
  var K = C.cta;
  if (K) qsa(".cta .container").forEach(function (box) {
    box.innerHTML = "<h2>" + fmt(K.title || "") + "</h2><p>" + esc(K.text || "") + '</p><div class="btn-row">' +
      (K.btn1 && K.btn1.text ? '<a class="btn" href="' + esc(K.btn1.link || "#") + '">' + esc(K.btn1.text) + "</a>" : "") +
      (K.btn2 && K.btn2.text ? '<a class="btn ghost" href="' + esc(K.btn2.link || "#") + '">' + esc(K.btn2.text) + "</a>" : "") + "</div>";
  });

  /* ---------- Google map (Contact page) ---------- */
  var wrap = document.getElementById("map-wrap");
  if (wrap) {
    var ct = S.contact || {};
    var q = String(ct.mapQuery || "").trim();
    var m = q.match(/src="([^"]+)"/i);           /* pasted <iframe ...> code */
    if (m) q = m[1];
    var src = "";
    if (/^https:\/\/www\.google\.com\/maps\/embed/i.test(q)) src = q;
    else if (q && !/^https?:\/\//i.test(q)) src = "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed";
    var link = String(ct.mapLink || "").trim();
    if (!link && q && !/^https?:\/\//i.test(q)) link = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
    if (src) {
      document.getElementById("map-frame").setAttribute("src", src);
      wrap.hidden = false;
      var open = document.getElementById("map-open");
      if (link) { open.setAttribute("href", link); open.hidden = false; }
    } else if (link) { wrap.hidden = false; document.querySelector(".map-frame").hidden = true; var o2 = document.getElementById("map-open"); o2.setAttribute("href", link); o2.hidden = false; }
  }
})();
