/* Renders events from assets/js/events-data.js. You normally never edit this file. */
(function () {
  const EV = (window.ORIGO_EVENTS || []).filter(e => e && e.id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ext = u => /^https?:/i.test(u || "");
  const buttons = e => `<div class="btn-row ev-btns">${e.ticketLink ? `<a class="btn" href="${esc(e.ticketLink)}"${ext(e.ticketLink) ? ' target="_blank" rel="noopener"' : ""}>Get Ticket</a>` : ""}<a class="btn ghost" href="contact.html">Contact</a></div>`;
  const where = e => (e.time || e.venue) ? `<div class="ev-where">${esc([e.time, e.venue].filter(Boolean).join(" · "))}</div>` : "";
  const num = i => String(i + 1).padStart(2, "0");

  /* ---- dates: Current / Upcoming / Past are worked out from "dateISO" (YYYY-MM-DD) when it is set ---- */
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const showDate = e => e.date || (/^\d{4}-\d{2}-\d{2}$/.test(e.dateISO || "") ? (+e.dateISO.slice(8, 10)) + " " + MONTHS[+e.dateISO.slice(5, 7) - 1] + " " + e.dateISO.slice(0, 4) : "");
  function partition(list) {
    const t = todayISO(), dated = [], undated = [], past = [];
    list.forEach((e, i) => { const o = { e, i }; if (/^\d{4}-\d{2}-\d{2}$/.test(e.dateISO || "")) (e.dateISO < t ? past : dated).push(o); else undated.push(o); });
    dated.sort((a, b) => a.e.dateISO < b.e.dateISO ? -1 : a.e.dateISO > b.e.dateISO ? 1 : a.i - b.i);
    past.sort((a, b) => a.e.dateISO < b.e.dateISO ? 1 : a.e.dateISO > b.e.dateISO ? -1 : a.i - b.i);
    return { active: dated.concat(undated), past };
  }
  const PT = partition(EV);


  /* If a photo file is missing, swap in the placeholder box automatically */
  window.__ph = (img, label) => { const d = document.createElement("div"); d.className = "ph"; d.textContent = label; img.replaceWith(d); };
  /* Photo = e.image if set, otherwise assets/images/events/event-<position>.jpg (event-1.jpg = first event) */
  const photo = (src, alt, label) => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="__ph(this,'${label}')">`;
  const media = (e, i) => photo(e.image || `assets/images/events/event-${i + 1}.jpg`, e.title, num(i));
  const tags = e => (e.tags && e.tags.length) ? `<div class="tags">${e.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : "";
  const stats = e => (e.stats && e.stats.length) ? `<div class="mini-stats">${e.stats.slice(0, 3).map(s => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("")}</div>` : "";

  const block = (e, i, label) => `
    <article class="work-item">
      <div class="work-media">${media(e, i)}</div>
      <div class="work-body">
        <div class="work-meta">${esc(showDate(e))} <span>/ ${esc(label || e.category || "Event")}</span></div>
        <h2>${esc(e.title)}</h2>
        ${where(e)}
        <p>${esc(e.tagline || (e.description && e.description[0]) || "")}</p>
        ${tags(e)}${stats(e)}
        <div style="margin-top:30px">${buttons(e)}</div>
      </div>
    </article>`;

  /* HOME: the current event (nearest upcoming) */
  const home = document.getElementById("featured-event");
  if (home) {
    const f = PT.active[0];
    home.innerHTML = f ? block(f.e, f.i, "Current") : "";
    if (!f) { const sec = home.closest("section"); if (sec) sec.hidden = true; }
  }

  /* EVENTS PAGE: current (first active), upcoming (rest), past */
  const cur = document.getElementById("events-current");
  const up = document.getElementById("events-upcoming");
  const card = (o, withButtons, k) => `
        <div class="up-card${withButtons ? "" : " past"}">
          <div class="work-media up-media">${media(o.e, o.i)}</div>
          <div class="up-body">
            <div class="work-meta">${esc(showDate(o.e))} <span>/ ${esc(o.e.category || "Event")}</span></div>
            <h3>${esc(o.e.title)}</h3>
            ${where(o.e)}
            <p>${esc(o.e.tagline || "")}</p>
            ${withButtons ? buttons(o.e) : ""}
          </div>
        </div>`;
  if (cur) {
    const f = PT.active[0];
    cur.innerHTML = f ? block(f.e, f.i, "Current") : `<p class="lead">No upcoming events right now. Please check back soon.</p>`;
  }
  if (up) {
    const rest = PT.active.slice(1);
    up.innerHTML = rest.map((o, k) => card(o, true, k)).join("");
    if (!rest.length) { const w = document.getElementById("upcoming-wrap"); if (w) w.hidden = true; }
  }
  const pastBox = document.getElementById("events-past");
  if (pastBox) {
    pastBox.innerHTML = PT.past.map((o, k) => card(o, false, k)).join("");
    const pw = document.getElementById("past-wrap"); if (pw) pw.hidden = !PT.past.length;
  }

  /* NDA — Never Dream Alone: listed events as blocks */
  const nda = document.getElementById("nda-events");
  if (nda) {
    const N = window.ORIGO_NDA || { events: [] };
    const t = document.getElementById("nda-title"); if (t && N.title) t.textContent = N.title;
    const st = document.getElementById("nda-subtitle"); if (st && N.subtitle) st.textContent = N.subtitle;
    const lg = document.getElementById("nda-logo");
    const logoSrc = (N.logo === undefined) ? "assets/images/nda/nda-logo.png" : N.logo;
    if (lg && logoSrc) { lg.onerror = () => { lg.hidden = true; }; lg.onload = () => { lg.hidden = false; }; lg.src = logoSrc; }
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
