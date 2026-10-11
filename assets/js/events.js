/* Renders events from assets/js/events-data.js. You normally never edit this file. */
(function () {
  const EV = (window.ORIGO_EVENTS || []).filter(e => e && e.id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ext = u => /^https?:/i.test(u || "");
  const buttons = e => `<div class="btn-row ev-btns">${e.ticketLink ? `<a class="btn" href="${esc(e.ticketLink)}"${ext(e.ticketLink) ? ' target="_blank" rel="noopener"' : ""}>Get Ticket</a>` : ""}<a class="btn ghost" href="contact.html">Contact</a></div>`;
  const where = e => (e.time || e.venue) ? `<div class="ev-where">${esc([e.time, e.venue].filter(Boolean).join(" · "))}</div>` : "";
  const num = i => String(i + 1).padStart(2, "0");

  /* If a photo file is missing, swap in the placeholder box automatically */
  window.__ph = (img, label) => { const d = document.createElement("div"); d.className = "ph"; d.textContent = label; img.replaceWith(d); };
  /* Photo = e.image if set, otherwise assets/images/events/event-<position>.jpg (event-1.jpg = first event) */
  const photo = (src, alt, label) => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="__ph(this,'${label}')">`;
  const media = (e, i) => photo(e.image || `assets/images/events/event-${i + 1}.jpg`, e.title, num(i));
  const tags = e => (e.tags && e.tags.length) ? `<div class="tags">${e.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : "";
  const stats = e => (e.stats && e.stats.length) ? `<div class="mini-stats">${e.stats.slice(0, 3).map(s => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("")}</div>` : "";

  const block = (e, i, featured) => `
    <article class="work-item">
      <div class="work-media">${media(e, i)}</div>
      <div class="work-body">
        <div class="work-meta">${esc(e.date)} <span>/ ${esc(e.status || e.category || "Event")}</span></div>
        <h2>${esc(e.title)}</h2>
        ${where(e)}
        <p>${esc(e.tagline || (e.description && e.description[0]) || "")}</p>
        ${tags(e)}${stats(e)}
        <div style="margin-top:30px">${buttons(e)}</div>
      </div>
    </article>`;

  /* HOME: first event only */
  const home = document.getElementById("featured-event");
  if (home) {
    home.innerHTML = EV.length ? block(EV[0], 0, true) : "";
    if (!EV.length) { const s = home.closest("section"); if (s) s.hidden = true; }
  }

  /* EVENTS PAGE: 1st = current event, 2nd and later = upcoming */
  const cur = document.getElementById("events-current");
  const up = document.getElementById("events-upcoming");
  if (cur || up) {
    if (cur) {
      cur.innerHTML = EV.length ? block(EV[0], 0, true)
        : `<p class="lead">No events right now. Please check back soon.</p>`;
    }
    if (up) {
      const rest = EV.slice(1);
      up.innerHTML = rest.map((e, k) => `
        <div class="up-card">
          <div class="work-media up-media">${media(e, k + 1)}</div>
          <div class="up-body">
            <div class="work-meta">${esc(e.date)} <span>/ ${esc(e.category || "Event")}</span></div>
            <h3>${esc(e.title)}</h3>
            ${where(e)}
            <p>${esc(e.tagline || "")}</p>
            ${buttons(e)}
          </div>
        </div>`).join("");
      if (!rest.length) { const w = document.getElementById("upcoming-wrap"); if (w) w.hidden = true; }
    }
  }


  /* NDA — Never Dream Alone: listed events as blocks */
  const nda = document.getElementById("nda-events");
  if (nda) {
    const N = window.ORIGO_NDA || { events: [] };
    const t = document.getElementById("nda-title"); if (t && N.title) t.textContent = N.title;
    const st = document.getElementById("nda-subtitle"); if (st && N.subtitle) st.textContent = N.subtitle;
    const it = document.getElementById("nda-intro"); if (it && N.intro) it.textContent = N.intro;
    nda.innerHTML = (N.events || []).map((e, i) => {
      const inner = `
        <div class="work-media nda-media">${photo(e.image || `assets/images/nda/nda-${num(i)}.jpg`, e.name, num(i))}</div>
        <div class="nda-body">
          <div class="work-meta">${num(i)} <span>/ ${esc(N.title || "NDA")}</span></div>
          <h3>${esc(e.name)}</h3>
          ${e.tagline ? `<p>${esc(e.tagline)}</p>` : ""}
          ${e.link ? `<span class="up-link">View ↗</span>` : ""}
        </div>`;
      return e.link ? `<a class="nda-card" href="${esc(e.link)}">${inner}</a>` : `<div class="nda-card">${inner}</div>`;
    }).join("");
    if (!(N.events || []).length) { const w = document.getElementById("nda-wrap"); if (w) w.hidden = true; }
  }

})();
