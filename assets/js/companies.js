/* Renders companies from assets/js/companies-data.js. You normally never edit this file. */
(function () {
  const root = document.getElementById("companies-list");
  if (!root) return;
  const C = window.ORIGO_COMPANIES || [];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  root.innerHTML = C.map((c, i) => {
    const n = String(i + 1).padStart(2, "0");
    const ext = /^https?:/i.test(c.website || "");
    window.__ph = window.__ph || ((img, label) => { const d = document.createElement("div"); d.className = "ph"; d.textContent = label; img.replaceWith(d); });
    const src = c.image || `assets/images/companies/company-${i + 1}.jpg`;
    const media = `<img class="${c.imageFit === "contain" ? "fit-contain" : ""}" src="${esc(src)}" alt="${esc(c.name)}" loading="lazy" onerror="__ph(this,'${n}')">`;
    return `
    <article class="work-item co-item reveal">
      <div class="work-media co-media">${media}</div>
      <div class="work-body">
        <div class="co-num">${n}</div>
        <h2>${esc(c.name)}</h2>
        ${(c.tags && c.tags.length) ? `<div class="tags">${c.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
        ${c.highlight ? `<p class="co-highlight"><b>${esc(c.highlight.label)}:</b> ${esc(c.highlight.value)}</p>` : ""}
        ${(c.description || []).map(p => `<p>${esc(p)}</p>`).join("")}
        <div class="btn-row" style="margin-top:28px"><a class="btn" href="${esc(c.website || "#")}"${ext ? ' target="_blank" rel="noopener"' : ""}>${esc(c.buttonText || "Visit Website")}</a></div>
      </div>
    </article>`;
  }).join("") || '<p class="lead">Companies coming soon.</p>';
})();
