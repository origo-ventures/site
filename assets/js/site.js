/* Fills contact info, founder and home ventures from assets/js/site-data.js. You normally never edit this file. */
(function () {
  var S = window.ORIGO_SITE || {};
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var get = function (p) { return p.split(".").reduce(function (o, k) { return o && o[k]; }, S); };
  window.__ph = window.__ph || function (img, label) { var d = document.createElement("div"); d.className = "ph"; d.textContent = label; img.replaceWith(d); };

  /* contact info (footer on every page + contact page) */
  document.querySelectorAll("[data-site],[data-site-href]").forEach(function (el) {
    var tk = el.getAttribute("data-site"), hk = el.getAttribute("data-site-href");
    var tv = tk ? get(tk) : "", hv = hk ? get(hk) : "";
    if (tk && tv) el.textContent = tv;
    if (hk && hv) {
      var pre = el.getAttribute("data-prefix") || "";
      var val = pre === "tel:" ? String(hv).replace(/[^\d+]/g, "") : hv;
      el.setAttribute("href", pre + val);
      if (/^https?:/i.test(hv)) { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }
    }
    var empty = (tk && !tv) || (!tk && hk && !hv);
    if (empty && el.hasAttribute("data-hide-empty")) { var box = el.closest("li,.contact-block") || el; box.hidden = true; }
  });

  /* founder (About page) */
  var F = S.founder || {};
  var fi = document.getElementById("founder-img");
  if (fi) { fi.setAttribute("src", F.photo || fi.getAttribute("data-fallback")); fi.setAttribute("alt", (F.name ? F.name + " — " : "") + (F.role || "Founder")); }
  var qi = document.getElementById("qr-img");
  if (qi) { qi.setAttribute("src", F.qr || qi.getAttribute("data-fallback")); }
  var fr = document.getElementById("founder-role");
  if (fr && F.role) fr.innerHTML = esc(F.role) + " <span>/ Origo Ventures</span>";

  /* home: selected ventures */
  var intro = document.getElementById("ventures-intro");
  if (intro && S.venturesIntro != null) intro.textContent = S.venturesIntro;
  var hv = document.getElementById("home-ventures");
  if (hv) {
    var V = S.ventures || [];
    hv.innerHTML = V.map(function (v, i) {
      var n = String(i + 1).padStart(2, "0");
      var src = v.image || ("assets/images/companies/company-" + (i + 1) + ".jpg");
      var tags = (v.tags && v.tags.length) ? '<div class="tags">' + v.tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" : "";
      var stats = (v.stats && v.stats.length) ? '<div class="mini-stats">' + v.stats.slice(0, 3).map(function (s) { return "<div><b>" + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>"; }).join("") + "</div>" : "";
      var meta = esc(v.year || "") + (v.category ? " <span>/ " + esc(v.category) + "</span>" : "");
      return '<div class="work-item"><div class="work-media"><img src="' + esc(src) + '" alt="' + esc(v.name) + '" loading="lazy" onerror="__ph(this,\'' + n + '\')"></div>' +
        '<div class="work-body"><div class="work-meta">' + meta + "</div><h2>" + esc(v.name) + "</h2><p>" + esc(v.description || "") + "</p>" + tags + stats + "</div></div>";
    }).join("");
    if (!V.length) { var sec = hv.closest("section"); if (sec) sec.hidden = true; }
  }

  /* WhatsApp chat button + optional Google Analytics (set in the control panel > Contact info) */
  (function () {
    var ct = S.contact || {};
    if (ct.showWhatsapp !== false && document.querySelector(".site-header")) {
      var d = String(ct.whatsapp || ct.phone || "").replace(/[^\d]/g, "");
      if (/^0\d{10}$/.test(d)) d = "880" + d.slice(1);
      if (d.length >= 8) {
        var a = document.createElement("a");
        a.className = "wa-float"; a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", "Chat on WhatsApp");
        a.href = "https://wa.me/" + d + "?text=" + encodeURIComponent(ct.whatsappText || "Hello Origo Ventures, I would like to know more.");
        a.innerHTML = '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="#fff" d="M16.04 3C9.4 3 4 8.38 4 15c0 2.3.65 4.45 1.78 6.28L4 29l7.9-1.74A12.05 12.05 0 0 0 16.04 27C22.66 27 28 21.62 28 15S22.66 3 16.04 3zm0 21.9c-1.78 0-3.46-.5-4.88-1.36l-.35-.2-4.68 1.03 1-4.55-.23-.37A9.8 9.8 0 0 1 6.2 15c0-5.42 4.42-9.83 9.84-9.83 5.4 0 9.8 4.4 9.8 9.83 0 5.43-4.4 9.9-9.8 9.9zm5.4-7.36c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.7.3 1.26.5 1.7.62.72.23 1.37.2 1.88.12.57-.08 1.75-.72 2-1.4.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>';
        document.body.appendChild(a);
      }
    }
    if (/^G-[A-Z0-9]{6,}$/.test(ct.analyticsId || "")) {
      var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + ct.analyticsId; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", ct.analyticsId);
    }
  })();
})();
