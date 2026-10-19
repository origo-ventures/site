/* Renders page text, extra pages (block builder), event projects, menu links, forms and maps.
   Data comes from the *-data.js files. You normally never edit this file. */
(function () {
  var C = window.ORIGO_CONTENT || {};
  var S = window.ORIGO_SITE || {};
  var P = window.ORIGO_PAGES || [];
  var PR = window.ORIGO_PROJECTS || [];
  var EV = window.ORIGO_EVENTS || [];
  var DEFAULT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzWEK0_boPNIbnAYGWoI3m1Ni8wXFN_PMl_RwRF1SdgxU9YOf-5F1YeCtstzMm-QmtV/exec";
  var IMGMAP = {};        /* preview only: new photos not uploaded yet */
  var uid = 0;

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var get = function (p) { return p.split(".").reduce(function (o, k) { return o && o[k]; }, C); };
  /* titles: new line = line break, *word* = accent/outline word */
  var fmt = function (s) { return esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/\r?\n/g, "<br>"); };
  var pad = function (i) { return String(i + 1).padStart(2, "0"); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var src = function (p) { return IMGMAP[p] || p; };
  var isExt = function (u) { return /^https?:/i.test(u || ""); };
  var one = function (a) { return Array.isArray(a) ? a : []; };
  var colN = function (v, d) { var n = Number(String(v == null ? "" : v).replace(/\D/g, "")); return [2, 3, 4].indexOf(n) > -1 ? n : (d || 3); };
  window.__ph = window.__ph || function (img, label) { var d = document.createElement("div"); d.className = "ph"; d.textContent = label; img.replaceWith(d); };

  /* ---------- simple text / title / link bindings ---------- */
  qsa("[data-c]").forEach(function (el) { var v = get(el.getAttribute("data-c")); if (typeof v === "string" && v !== "") el.textContent = v; });
  qsa("[data-c-title]").forEach(function (el) { var v = get(el.getAttribute("data-c-title")); if (typeof v === "string" && v !== "") el.innerHTML = fmt(v); });
  qsa("[data-c-href]").forEach(function (el) { var v = get(el.getAttribute("data-c-href")); if (typeof v === "string" && v !== "") el.setAttribute("href", v); });

  /* ---------- repeated blocks on the main pages ---------- */
  var H = C.home || {}, A = C.about || {};
  var stats = document.getElementById("home-stats");
  if (stats && H.stats && H.stats.length) stats.innerHTML = H.stats.map(function (s) { return '<div class="stat"><b>' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>"; }).join("");
  var capsHTML = function (arr) { return arr.map(function (c, i) { return '<div class="cap"><div class="n">' + pad(i) + "</div><h3>" + esc(c.title) + "</h3><p>" + esc(c.text) + "</p></div>"; }).join(""); };
  var doEl = document.getElementById("home-do");
  if (doEl && H.doCards && H.doCards.length) doEl.innerHTML = capsHTML(H.doCards);
  var vEl = document.getElementById("about-values");
  if (vEl && A.valuesCards && A.valuesCards.length) vEl.innerHTML = capsHTML(A.valuesCards);
  var mEl = document.getElementById("about-meta");
  if (mEl && A.meta && A.meta.length) mEl.innerHTML = A.meta.map(function (m) { return '<div class="meta-item"><span>' + esc(m.label) + "</span><strong>" + esc(m.value) + "</strong></div>"; }).join("");

  /* ---------- shared pieces ---------- */
  function photo(path, alt, label, cls) {
    if (!path) return '<div class="ph">' + esc(label) + "</div>";
    return '<img' + (cls ? ' class="' + cls + '"' : "") + ' src="' + esc(src(path)) + '" alt="' + esc(alt || "") + '" loading="lazy" onerror="__ph(this,\'' + esc(label) + '\')">';
  }
  function btn(b, ghost) {
    if (!b || !b.text) return "";
    return '<a class="btn' + (ghost ? " ghost" : "") + '" href="' + esc(b.link || "#") + '"' + (isExt(b.link) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(b.text) + "</a>";
  }
  function btns(b1, b2, mt) { var h = btn(b1, false) + btn(b2, true); return h ? '<div class="btn-row"' + (mt ? ' style="margin-top:' + mt + 'px"' : "") + ">" + h + "</div>" : ""; }
  function tagsHTML(t) { t = one(t); return t.length ? '<div class="tags">' + t.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>" : ""; }
  function yt(u) { var m = String(u || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/); return m ? m[1] : ""; }
  function mapInfo(query, linkIn) {
    var q = String(query || "").trim(), m = q.match(/src="([^"]+)"/i);
    if (m) q = m[1];
    var s = "";
    if (/^https:\/\/www\.google\.com\/maps\/embed/i.test(q)) s = q;
    else if (q && !/^https?:\/\//i.test(q)) s = "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed";
    var link = String(linkIn || "").trim();
    if (!link && q && !/^https?:\/\//i.test(q)) link = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
    return { src: s, link: link };
  }
  function ctaHTML(o) {
    var K = C.cta || {}; o = o || {};
    var title = o.title || K.title || "", text = o.text || K.text || "";
    var b1 = (o.btn1 && o.btn1.text) ? o.btn1 : K.btn1, b2 = (o.btn2 && o.btn2.text) ? o.btn2 : K.btn2;
    return "<h2>" + fmt(title) + "</h2><p>" + esc(text) + "</p>" + btns(b1, b2);
  }

  /* ---------- event projects (NDA, Collab ...) ---------- */
  function projectHTML(p) {
    var cols = colN(p.cols, 3);
    var logo = p.logo ? '<img class="nda-logo" src="' + esc(src(p.logo)) + '" alt="' + esc(p.title) + ' logo" onerror="this.hidden=true">' : "";
    var cards = one(p.events).filter(function (e) { return e && e.name; }).map(function (e, i) {
      var inner = '<div class="work-media nda-media">' + photo(e.image, e.name, pad(i)) + '</div><div class="nda-body"><div class="work-meta">' +
        (p.numbers === false ? "" : pad(i) + " ") + "<span>" + (p.numbers === false ? "" : "/ ") + esc(p.title) + "</span></div><h3>" + esc(e.name) + "</h3>" +
        (e.tagline ? "<p>" + esc(e.tagline) + "</p>" : "") + (e.link ? '<span class="up-link">View ↗</span>' : "") + "</div>";
      return e.link ? '<a class="nda-card" href="' + esc(e.link) + '"' + (isExt(e.link) ? ' target="_blank" rel="noopener"' : "") + ">" + inner + "</a>" : '<div class="nda-card">' + inner + "</div>";
    }).join("");
    return '<section class="section proj"><div class="container"><div class="section-head"><div class="nda-head">' + logo +
      "<div>" + (p.subtitle ? '<div class="eyebrow">' + esc(p.subtitle) + "</div>" : "") + '<h2 class="section-title">' + fmt(p.title || "") + "</h2></div></div>" +
      (p.intro ? '<p class="lead">' + esc(p.intro) + "</p>" : "") + '</div><div class="nda-grid c' + cols + '">' + cards + "</div></div></section>";
  }
  var projRoot = document.getElementById("projects-root");
  if (projRoot) {
    var prj = PR.filter(function (p) { return p && p.title; });
    if (prj.length) {
      projRoot.innerHTML = prj.map(function (p) { return projectHTML(p); }).join("");
      var oldNda = document.getElementById("nda-wrap"); if (oldNda) oldNda.hidden = true;
    }
  }

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function showDate(e) { return e.date || (/^\d{4}-\d{2}-\d{2}$/.test(e.dateISO || "") ? (+e.dateISO.slice(8, 10)) + " " + MONTHS[+e.dateISO.slice(5, 7) - 1] + " " + e.dateISO.slice(0, 4) : ""); }
  function partitionEvents(list) {
    var t = todayISO(), dated = [], undated = [], past = [];
    list.forEach(function (e, i) { var o = { e: e, i: i }; if (/^\d{4}-\d{2}-\d{2}$/.test(e.dateISO || "")) (e.dateISO < t ? past : dated).push(o); else undated.push(o); });
    dated.sort(function (a, b) { return a.e.dateISO < b.e.dateISO ? -1 : a.e.dateISO > b.e.dateISO ? 1 : a.i - b.i; });
    past.sort(function (a, b) { return a.e.dateISO < b.e.dateISO ? 1 : a.e.dateISO > b.e.dateISO ? -1 : a.i - b.i; });
    return { active: dated.concat(undated), past: past };
  }

  /* ---------- page blocks ---------- */
  function eventCard(e, i) {
    var ext = isExt(e.ticketLink);
    var b = '<div class="btn-row ev-btns">' + (e.ticketLink ? '<a class="btn" href="' + esc(e.ticketLink) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">Get Ticket</a>" : "") + '<a class="btn ghost" href="contact.html">Contact</a></div>';
    var where = (e.time || e.venue) ? '<div class="ev-where">' + esc([e.time, e.venue].filter(Boolean).join(" · ")) + "</div>" : "";
    return '<div class="up-card"><div class="work-media up-media">' + photo(e.image || ("assets/images/events/event-" + (i + 1) + ".jpg"), e.title, pad(i)) + '</div><div class="up-body"><div class="work-meta">' + esc(showDate(e)) + " <span>/ " + esc(e.category || "Event") + "</span></div><h3>" + esc(e.title) + "</h3>" + where + "<p>" + esc(e.tagline || "") + "</p>" + b + "</div></div>";
  }
  function head(b) { return b.heading ? '<div class="section-head"><h2 class="section-title">' + fmt(b.heading) + "</h2></div>" : ""; }
  var R = {
    hero: function (b) {
      var bg = b.image ? ' style="background-image:linear-gradient(rgba(8,8,8,.72),rgba(8,8,8,.92)),url(\'' + esc(src(b.image)) + '\');background-size:cover;background-position:center"' : "";
      return '<section class="page-hero blk hero-blk al-' + (b.align === "center" ? "center" : "left") + ' reveal"' + bg + '><div class="container">' + (b.eyebrow ? '<div class="eyebrow">' + esc(b.eyebrow) + "</div>" : "") +
        '<h1 class="ev-title">' + fmt(b.title || "") + "</h1>" + (b.text ? '<p class="lead">' + esc(b.text) + "</p>" : "") + btns(b.btn1, b.btn2, 34) + "</div></section>";
    },
    text: function (b) { return '<div class="container">' + head(b) + '<div class="pg-text' + (b.width === "wide" ? " wide" : "") + '">' + one(b.body).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div></div>"; },
    imagetext: function (b) {
      return '<div class="container"><div class="split' + (b.imagePos === "right" ? " rev" : "") + '"><div class="work-media">' + photo(b.image, b.heading, "IMG") + '</div><div class="split-body">' +
        (b.heading ? '<h2 class="section-title sm">' + fmt(b.heading) + "</h2>" : "") + one(b.body).map(function (p) { return '<p class="pg-p">' + esc(p) + "</p>"; }).join("") + btns(b.button, null, 26) + "</div></div></div>";
    },
    rows: function (b) {
      return '<div class="container">' + head(b) + one(b.items).map(function (it, i) {
        return '<article class="work-item co-item"><div class="work-media co-media">' + photo(it.image, it.title, pad(i)) + '</div><div class="work-body"><div class="co-num">' + pad(i) + "</div><h2>" + esc(it.title) + "</h2>" + tagsHTML(it.tags) +
          (it.text ? String(it.text).split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") : "") + (it.buttonText ? '<div class="btn-row" style="margin-top:28px">' + btn({ text: it.buttonText, link: it.link }, false) + "</div>" : "") + "</div></article>";
      }).join("") + "</div>";
    },
    cards: function (b) {
      var n = colN(b.cols, 3);
      return '<div class="container">' + head(b) + '<div class="cap-grid c' + n + '">' + one(b.cards).map(function (c, i) {
        var inner = (c.image ? '<img class="cap-img" src="' + esc(src(c.image)) + '" alt="' + esc(c.title || "") + '" loading="lazy">' : "") + (b.numbers === false ? "" : '<div class="n">' + pad(i) + "</div>") + "<h3>" + esc(c.title) + "</h3><p>" + esc(c.text) + "</p>";
        return c.link ? '<a class="cap" href="' + esc(c.link) + '"' + (isExt(c.link) ? ' target="_blank" rel="noopener"' : "") + ">" + inner + "</a>" : '<div class="cap">' + inner + "</div>";
      }).join("") + "</div></div>";
    },
    stats: function (b) { var it = one(b.items).slice(0, 6); return '<div class="stats n' + it.length + '">' + it.map(function (s) { return '<div class="stat"><b>' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>"; }).join("") + "</div>"; },
    gallery: function (b) {
      var n = colN(b.cols, 3);
      return '<div class="container">' + head(b) + '<div class="gallery c' + n + '">' + one(b.images).map(function (g, i) { return '<figure class="pg-img">' + (g.image ? '<img src="' + esc(src(g.image)) + '" alt="' + esc(g.caption || "") + '" loading="lazy">' : '<div class="work-media gal-ph">' + photo("", "", pad(i)) + "</div>") + (g.caption ? "<figcaption>" + esc(g.caption) + "</figcaption>" : "") + "</figure>"; }).join("") + "</div></div>";
    },
    image: function (b) { return b.image ? '<div class="container"><figure class="pg-img' + (b.size === "narrow" ? " narrow" : "") + '"><img src="' + esc(src(b.image)) + '" alt="' + esc(b.caption || "") + '" loading="lazy">' + (b.caption ? "<figcaption>" + esc(b.caption) + "</figcaption>" : "") + "</figure></div>" : ""; },
    video: function (b) { return yt(b.url) ? '<div class="container">' + head(b) + '<div class="pg-video"><iframe src="https://www.youtube-nocookie.com/embed/' + yt(b.url) + '" title="Video" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div></div>' : ""; },
    quote: function (b) { return '<div class="container"><blockquote class="pg-quote"><p>' + esc(b.text) + "</p>" + ((b.name || b.role) ? "<footer>" + esc(b.name || "") + (b.role ? " <span>" + esc(b.role) + "</span>" : "") + "</footer>" : "") + "</blockquote></div>"; },
    faq: function (b) { return '<div class="container">' + head(b) + '<div class="faq">' + one(b.items).map(function (q) { return "<details><summary>" + esc(q.q) + "</summary><p>" + esc(q.a) + "</p></details>"; }).join("") + "</div></div>"; },
    steps: function (b) { return '<div class="container">' + head(b) + '<div class="steps">' + one(b.items).map(function (s, i) { return '<div class="step"><div class="n">' + pad(i) + "</div><div><h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></div></div>"; }).join("") + "</div></div>"; },
    team: function (b) {
      var n = colN(b.cols, 3);
      return '<div class="container">' + head(b) + '<div class="team-grid c' + n + '">' + one(b.members).map(function (m, i) {
        var inner = '<div class="work-media team-photo">' + photo(m.photo, m.name, pad(i)) + "</div><h3>" + esc(m.name) + "</h3>" + (m.role ? "<p>" + esc(m.role) + "</p>" : "");
        return m.link ? '<a class="team-card" href="' + esc(m.link) + '"' + (isExt(m.link) ? ' target="_blank" rel="noopener"' : "") + ">" + inner + "</a>" : '<div class="team-card">' + inner + "</div>";
      }).join("") + "</div></div>";
    },
    logos: function (b) { return '<div class="container">' + head(b) + '<div class="logo-strip">' + one(b.items).filter(function (l) { return l.image; }).map(function (l) { var im = '<img src="' + esc(src(l.image)) + '" alt="' + esc(l.name || "") + '" loading="lazy">'; return l.link ? '<a href="' + esc(l.link) + '" target="_blank" rel="noopener">' + im + "</a>" : "<span>" + im + "</span>"; }).join("") + "</div></div>"; },
    map: function (b) {
      var ct = S.contact || {}, m = mapInfo(b.query || ct.mapQuery, b.link || ct.mapLink);
      if (!m.src && !m.link) return "";
      return '<div class="container"><div class="section-head">' + (b.heading ? '<h2 class="section-title">' + fmt(b.heading) + "</h2>" : "<span></span>") + (m.link ? '<a class="btn ghost" href="' + esc(m.link) + '" target="_blank" rel="noopener">Open in Google Maps</a>' : "") + "</div>" + (m.src ? '<div class="map-frame"><iframe src="' + esc(m.src) + '" title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>' : "") + "</div>";
    },
    form: function (b) {
      var id = "f" + (++uid);
      return '<div class="container"><div class="blk-form-wrap">' + head(b) + (b.text ? '<p class="pg-p">' + esc(b.text) + "</p>" : "") +
        '<form class="contact-form blk-form" novalidate><div class="hp-field" aria-hidden="true"><label for="' + id + 'w">Leave this field empty</label><input id="' + id + 'w" name="website" type="text" tabindex="-1" autocomplete="off"></div>' +
        '<div class="field"><label for="' + id + 'n">Full Name *</label><input id="' + id + 'n" name="name" type="text" required maxlength="150" autocomplete="name" placeholder="Enter your name"></div>' +
        '<div class="field"><label for="' + id + 'e">Email Address *</label><input id="' + id + 'e" name="email" type="email" required maxlength="254" autocomplete="email" placeholder="you@example.com"></div>' +
        '<div class="field"><label for="' + id + 'p">Phone Number</label><input id="' + id + 'p" name="phone" type="tel" maxlength="40" autocomplete="tel" placeholder="+880..."></div>' +
        '<div class="field"><label for="' + id + 's">Subject</label><input id="' + id + 's" name="subject" type="text" maxlength="200" placeholder="How can we help?"></div>' +
        '<div class="field"><label for="' + id + 'm">Your Message *</label><textarea id="' + id + 'm" name="message" rows="5" required maxlength="5000" placeholder="Write your message here..."></textarea></div>' +
        '<button class="btn" type="submit">' + esc(b.button || "Send Message") + '</button><p class="form-status" role="status" aria-live="polite"></p></form></div></div>';
    },
    button: function (b) { return b.text ? '<div class="container"><div class="btn-row">' + btn({ text: b.text, link: b.link }, b.style === "ghost") + "</div></div>" : ""; },
    cta: function (b) { return '<div class="container cta-in">' + ctaHTML(b) + "</div>"; },
    divider: function (b) { return '<div class="container"><div class="divider ' + (b.line === "space" ? "sp" : "ln") + " " + (["sm", "md", "lg"].indexOf(b.size) > -1 ? b.size : "md") + '"></div></div>'; },
    events: function (b) {
      var all = EV.filter(function (e) { return e && e.title; }), pt = partitionEvents(all), mode = b.mode || "upcoming", list;
      if (mode === "current") list = pt.active.slice(0, 1); else if (mode === "upcoming") list = pt.active.slice(1); else if (mode === "past") list = pt.past; else list = pt.active.concat(pt.past);
      var lim = Number(b.limit) || 0; if (lim > 0) list = list.slice(0, lim);
      return '<div class="container">' + head(b) + '<div class="up-grid">' + list.map(function (o) { return eventCard(o.e, o.i); }).join("") + "</div></div>";
    },
    project: function (b) {
      var p = PR.filter(function (x) { return x && (x.id === b.project || x.title === b.project); })[0];
      return p ? projectHTML(p).replace(/^<section[^>]*>/, "").replace(/<\/section>$/, "") : "";
    }
  };
  var SELFWRAP = { hero: 1 };
  function blockHTML(b) {
    var fn = R[b.type]; if (!fn) return "";
    var inner = fn(b); if (!inner) return "";
    if (SELFWRAP[b.type]) return inner;
    var bg = ["dark", "light", "accent"].indexOf(b.bg) > -1 ? b.bg : "dark";
    var al = b.align === "center" ? "center" : "left";
    var sp = ["compact", "large"].indexOf(b.space) > -1 ? b.space : "normal";
    var cls = "section blk t-" + b.type + " bg-" + bg + " al-" + al + " sp-" + sp + (b.type === "cta" ? " cta" : "") + " reveal";
    return '<section class="' + cls + '">' + inner + "</section>";
  }
  function pageHTML(pg) {
    var hs = pg.heroStyle || "left", out = "";
    if (hs !== "none") {
      out += '<section class="page-hero al-' + (hs === "center" ? "center" : "left") + '"><div class="container">' + (pg.eyebrow ? '<div class="eyebrow reveal">' + esc(pg.eyebrow) + "</div>" : "") +
        '<h1 class="reveal ev-title">' + fmt(pg.title || "") + "</h1>" + (pg.lead ? '<p class="lead reveal">' + esc(pg.lead) + "</p>" : "") + "</div></section>";
    }
    one(pg.blocks).forEach(function (b) { out += blockHTML(b); });
    if (pg.showCta !== false) out += '<section class="cta reveal"><div class="container">' + ctaHTML() + "</div></section>";
    return out;
  }

  /* ---------- forms inside pages ---------- */
  function bindForms(scope) {
    qsa("form.blk-form", scope).forEach(function (form) {
      if (form.getAttribute("data-bound")) return; form.setAttribute("data-bound", "1");
      var ct = S.contact || {}, ENDPOINT = ct.formEndpoint || DEFAULT_ENDPOINT, MAIL = ct.email || "", PHONE = ct.phone || "";
      var btnEl = form.querySelector("button[type=submit]"), box = form.querySelector(".form-status"), label = btnEl.textContent;
      var say = function (t, type, html) { if (html) box.innerHTML = t; else box.textContent = t; box.className = "form-status" + (type ? " " + type : ""); };
      var fallback = function () { return "We could not confirm that your message was delivered. Please try again" + (MAIL ? ', or contact us directly at <a href="mailto:' + esc(MAIL) + '">' + esc(MAIL) + "</a>" : "") + (PHONE ? ' or <a href="tel:' + esc(PHONE.replace(/[^\d+]/g, "")) + '">' + esc(PHONE) + "</a>" : "") + "."; };
      var done = function () { btnEl.disabled = false; btnEl.textContent = label; };
      form.addEventListener("submit", function (e) {
        e.preventDefault(); if (!form.reportValidity()) return;
        var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
        btnEl.disabled = true; btnEl.textContent = "Sending..."; say("Please wait while we send your message.", "");
        var ctrl = window.AbortController ? new AbortController() : null, timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 30000);
        var fail = function (why) { clearTimeout(timer); console.error("[form] " + why); say(fallback(), "err", true); done(); };
        fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data), signal: ctrl ? ctrl.signal : undefined })
          .then(function (r) { return r.text().then(function (txt) {
            var res = null; try { res = JSON.parse(txt); } catch (err) { fail("not JSON (HTTP " + r.status + ")"); return; }
            clearTimeout(timer);
            if (res && res.success === true) { form.reset(); say(res.message || "Thank you! Your message has been sent.", "ok"); }
            else if (res && res.success === false) { say(res.message || "Your message could not be sent.", "err"); }
            else { fail("unexpected answer"); return; }
            done();
          }); })
          .catch(function (err) { fail((err && err.name) + ": " + (err && err.message)); });
      });
    });
  }

  /* ---------- extra pages: menu + footer links ---------- */
  var pages = P.filter(function (p) { return p && p.slug && p.published !== false; });
  var q = new URLSearchParams(location.search), cur = q.get("p");
  var menu = pages.filter(function (p) { return p.showInMenu; });
  if (menu.length) {
    var nav = document.querySelector(".nav-links");
    if (nav) {
      var cta = nav.querySelector("li:last-child");
      menu.forEach(function (p) {
        var li = document.createElement("li");
        li.innerHTML = '<a class="' + (cur === p.slug ? "active" : "") + '" href="page.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.menuName || p.title) + "</a>";
        nav.insertBefore(li, cta);
      });
    }
    var fl = document.querySelector(".footer-links");
    if (fl) menu.forEach(function (p) { var li = document.createElement("li"); li.innerHTML = '<a href="page.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.menuName || p.title) + "</a>"; fl.appendChild(li); });
  }

  /* ---------- page.html?p=slug  (and ?p=__preview for the control panel) ---------- */
  var root = document.getElementById("page-root");
  function setMeta(pg) {
    document.title = (pg.seoTitle || pg.title) + " | Origo Ventures";
    if (pg.seoDescription) { var m = document.querySelector('meta[name="description"]'); if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); } m.setAttribute("content", pg.seoDescription); }
  }
  function mount(pg, late) {
    setMeta(pg);
    root.innerHTML = pageHTML(pg);
    bindForms(root);
    if (late) qsa(".reveal", root).forEach(function (e) { e.classList.add("visible"); });
  }
  if (root) {
    if (cur === "__preview") {
      root.innerHTML = '<section class="page-hero"><div class="container"><p class="lead">Preview loading…</p></div></section>';
      window.addEventListener("message", function (e) {
        var d = e.data;
        if (!d || d.type !== "origo-preview" || e.source !== window.parent) return;
        IMGMAP = d.images || {};
        if (d.site) S = d.site;
        if (d.events) EV = d.events;
        if (d.projects) PR = d.projects;
        mount(d.page || {}, true);
      });
      try { window.parent.postMessage({ type: "origo-preview-ready" }, "*"); } catch (err) { /* ignore */ }
    } else {
      var pg = pages.filter(function (p) { return p.slug === cur; })[0];
      if (!pg) {
        document.title = "Page not found | Origo Ventures";
        root.innerHTML = '<section class="page-hero"><div class="container"><div class="eyebrow">Page</div><h1>Page not<br><em>found</em></h1><p class="lead">This page may have been moved or removed.</p><div class="btn-row" style="margin-top:34px"><a class="btn" href="index.html">Back to Home</a></div></div></section>';
      } else { mount(pg, false); }
    }
  }

  /* ---------- shared call-to-action block on the fixed pages ---------- */
  if (C.cta && !root) qsa(".cta .container").forEach(function (box) { box.innerHTML = ctaHTML(); });

  /* ---------- Google map (Contact page) ---------- */
  var wrap = document.getElementById("map-wrap");
  if (wrap) {
    var ct2 = S.contact || {}, mi = mapInfo(ct2.mapQuery, ct2.mapLink);
    if (mi.src) {
      document.getElementById("map-frame").setAttribute("src", mi.src);
      wrap.hidden = false;
      var open = document.getElementById("map-open");
      if (mi.link) { open.setAttribute("href", mi.link); open.hidden = false; }
    } else if (mi.link) { wrap.hidden = false; document.querySelector(".map-frame").hidden = true; var o2 = document.getElementById("map-open"); o2.setAttribute("href", mi.link); o2.hidden = false; }
  }
})();
