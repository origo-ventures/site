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
  if (fi) { fi.setAttribute("src", F.photo || fi.getAttribute("data-fallback")); }
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
})();
