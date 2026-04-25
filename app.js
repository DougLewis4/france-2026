// ============================================================
// France 2026 — Redesigned app logic
// ============================================================

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const STORAGE_KEY = 'france2026_v2';
const DEPARTURE   = new Date('2026-07-17T15:00:00');

let state          = {};
let itinExpanded   = {};
let housingData    = {};
let restaurantData = [];
let openDrawerTaskId = null;
let currentFilter = 'all';  // all | open | booked | done
let currentPane   = 'checklist'; // for tabbed layout

// ============================================================
// STATE
// ============================================================
const FB_PATH = 'france2026';

async function loadState() {
  let saved = null;

  // Try Firebase first
  try {
    const snapshot = await firebase.database().ref(FB_PATH).get();
    if (snapshot.exists()) {
      saved = snapshot.val();
    }
  } catch (e) {}

  // Fall back to localStorage (also migrates old data up to Firebase)
  if (!saved) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('france2026_v1');
      if (raw) {
        saved = JSON.parse(raw);
        try { firebase.database().ref(FB_PATH).set(saved); } catch(e) {}
      }
    } catch (e) {}
  }

  if (saved) {
    state          = saved.state          || {};
    itinExpanded   = saved.itinExpanded   || {};
    housingData    = saved.housingData    || {};
    restaurantData = saved.restaurantData || [];
  }

  CATEGORIES.forEach(cat => {
    cat.tasks.forEach(task => {
      if (!state[task.id]) {
        state[task.id] = {
          status:     task.defaultStatus || 'not-started',
          actualCost: 0,
          notes:      task.hint || ''
        };
      }
    });
  });

  HOUSING_STOPS.forEach(stop => {
    if (!housingData[stop.id]) housingData[stop.id] = { options: [], selectedId: null };
  });
}

function saveState() {
  const data = { state, itinExpanded, housingData, restaurantData };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  try { firebase.database().ref(FB_PATH).set(data); } catch(e) {}
}

// ============================================================
// HELPERS
// ============================================================
function allTasks() {
  return CATEGORIES.flatMap(c => c.tasks.map(t => ({ ...t, catId: c.id, catLabel: c.label })));
}
function dueInfo(dueDate) {
  if (!dueDate) return { cls: 'none', label: '—', diff: Infinity };
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(dueDate + 'T00:00:00');
  const diff  = Math.round((due - today) / 86400000);
  const fmt   = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0)   return { cls: 'over', label: `Overdue · ${fmt}`, diff };
  if (diff <= 14) return { cls: 'soon', label: `Due ${fmt}`,       diff };
  return { cls: 'ok', label: fmt, diff };
}
function statusLabel(s) {
  const map = { 'not-started': 'To do', 'in-progress': 'In progress', 'booked': 'Booked', 'done': 'Done' };
  return map[s] || s;
}
function fmtCost(n) { return n > 0 ? `$${n.toLocaleString()}` : ''; }
function parseDateParts(iso) {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return {
    day:   d.getDate(),
    mon:   d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    year:  d.getFullYear()
  };
}

// ============================================================
// RENDER: Countdown / Hero
// ============================================================
function renderHero() {
  const now  = new Date();
  const diff = Math.ceil((DEPARTURE - now) / 86400000);
  const daysEl = document.getElementById('hero-days');
  if (daysEl) daysEl.textContent = diff > 0 ? diff : '0';
  const label = document.getElementById('hero-days-label');
  if (label) label.textContent = diff > 0 ? 'days to departure' : 'bon voyage!';

  // Ring
  const tasks = allTasks();
  const total = tasks.length;
  const done  = tasks.filter(t => state[t.id]?.status === 'done').length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
  const circumference = 2 * Math.PI * 60;
  const ring = document.getElementById('ring-fill');
  if (ring) {
    ring.setAttribute('stroke-dasharray', circumference);
    ring.style.strokeDashoffset = circumference * (1 - pct / 100);
  }
  const pctEl = document.getElementById('ring-pct');
  const subEl = document.getElementById('ring-sub');
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (subEl) subEl.textContent = `${done} of ${total} done`;

  // Meta
  const budget = totalBudget();
  const budgetEl = document.getElementById('hero-budget');
  if (budgetEl) budgetEl.textContent = `$${budget.est.toLocaleString()}`;

  const trip = document.getElementById('hero-trip');
  if (trip) trip.textContent = '16 days';
}

function totalBudget() {
  let est = 0, actual = 0;
  allTasks().forEach(t => {
    est    += t.estimatedCost    || 0;
    actual += state[t.id]?.actualCost || 0;
  });
  return { est, actual };
}

// ============================================================
// RENDER: Next Up
// ============================================================
function renderNextUp() {
  const upcoming = allTasks()
    .filter(t => state[t.id]?.status !== 'done' && t.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const listEl = document.getElementById('nextup-list');
  if (!listEl) return;

  if (upcoming.length === 0) {
    listEl.innerHTML = `<div class="nextup-empty">Nothing pressing — enjoy the wine.</div>`;
    return;
  }

  listEl.innerHTML = upcoming.map(t => {
    const info = dueInfo(t.dueDate);
    const p = parseDateParts(t.dueDate);
    return `<div class="nextup-item" data-task="${esc(t.id)}" data-cat="${esc(t.catId)}" style="cursor:pointer">
      <div class="nextup-marker">
        <span class="day">${p.day}</span>
        <span class="mon">${p.mon}</span>
      </div>
      <div class="nextup-text">
        <div class="nextup-title">${esc(t.title)}</div>
      </div>
      <span class="nextup-badge ${info.cls}">${esc(info.label.replace(/^Overdue · /, 'Over ').replace(/^Due /, ''))}</span>
    </div>`;
  }).join('');
}

// ============================================================
// RENDER: Budget
// ============================================================
function renderBudget() {
  const { est, actual } = totalBudget();
  const estEl = document.getElementById('budget-est');
  const actEl = document.getElementById('budget-actual');
  const barEl = document.getElementById('budget-bar');
  if (estEl) estEl.textContent = `$${est.toLocaleString()}`;
  if (actEl) actEl.textContent = `$${Math.round(actual).toLocaleString()}`;
  if (barEl) barEl.style.width = est > 0 ? `${Math.min(100, (actual / est) * 100)}%` : '0%';
}

// ============================================================
// RENDER: Checklist — flat, sorted by due date
// ============================================================
function filterPass(t) {
  const s = state[t.id]?.status || 'not-started';
  if (currentFilter === 'all')    return true;
  if (currentFilter === 'open')   return s !== 'done';
  if (currentFilter === 'booked') return s === 'booked' || s === 'in-progress';
  if (currentFilter === 'done')   return s === 'done';
  return true;
}

function sortByDue(a, b) {
  const ai = a.dueDate ? 0 : 1;
  const bi = b.dueDate ? 0 : 1;
  if (ai !== bi) return ai - bi;
  if (!a.dueDate) return 0;
  return a.dueDate.localeCompare(b.dueDate);
}

function urgencyGroup(t) {
  const s = state[t.id]?.status;
  if (s === 'done') return 'done';
  const info = dueInfo(t.dueDate);
  if (info.cls === 'over') return 'overdue';
  if (info.cls === 'soon') return 'soon';
  if (!t.dueDate) return 'undated';
  return 'later';
}

const GROUP_ORDER = ['overdue', 'soon', 'later', 'undated', 'done'];
const GROUP_LABELS = {
  overdue: 'Overdue',
  soon:    'Coming up · 14 days',
  later:   'Later',
  undated: 'No date set',
  done:    'Completed'
};

function renderChecklist() {
  const wrap = document.getElementById('checklist-wrap');
  if (!wrap) return;

  const tasks = allTasks()
    .filter(filterPass)
    .sort(sortByDue);

  // Group by urgency
  const groups = {};
  tasks.forEach(t => {
    const g = urgencyGroup(t);
    (groups[g] = groups[g] || []).push(t);
  });

  if (tasks.length === 0) {
    wrap.innerHTML = `<div class="checklist"><div style="padding:40px 20px;text-align:center;color:var(--ink-muted);font-style:italic;">No tasks match this filter.</div></div>`;
    return;
  }

  const html = `<div class="checklist">${
    GROUP_ORDER.filter(g => groups[g]).map(g => `
      <div class="checklist-group">
        <div class="checklist-group-head">
          <span class="checklist-group-label">${GROUP_LABELS[g]}</span>
          <span class="checklist-group-count">${groups[g].length}</span>
        </div>
        ${groups[g].map(renderTaskRow).join('')}
      </div>
    `).join('')
  }</div>`;
  wrap.innerHTML = html;
}

function renderTaskRow(t) {
  const s      = state[t.id] || {};
  const isDone = s.status === 'done';
  const info   = dueInfo(t.dueDate);
  const p      = parseDateParts(t.dueDate);

  const dateCell = p
    ? `<div class="task-date ${info.cls}"><span class="d">${p.day}</span><span class="m">${p.mon}</span></div>`
    : `<div class="task-date no-date"><span class="d">Anytime</span></div>`;

  const costStr = s.actualCost > 0
    ? `<span class="cost-chip">Paid ${fmtCost(s.actualCost)}</span>`
    : t.estimatedCost > 0
      ? `<span class="cost-chip">Est. ${fmtCost(t.estimatedCost)}</span>`
      : '';

  return `<div class="task ${isDone ? 'done' : ''}" data-task="${esc(t.id)}" data-cat="${esc(t.catId)}">
    <div class="task-check ${isDone ? 'checked' : ''}" data-check="${esc(t.id)}" data-cat="${esc(t.catId)}" role="button" aria-label="Toggle done"></div>
    ${dateCell}
    <div class="task-body">
      <div class="task-title">${esc(t.title)}</div>
      <div class="task-meta">
        <span class="task-category">${esc(t.catLabel)}</span>
        <span class="dot"></span>
        <span class="status-chip s-${esc(s.status || 'not-started')}">${esc(statusLabel(s.status || 'not-started'))}</span>
        ${costStr}
      </div>
    </div>
    <span class="task-arrow">›</span>
  </div>`;
}


// ============================================================
// RENDER: Itinerary
// ============================================================
function renderItinerary() {
  const wrap = document.getElementById('itinerary-wrap');
  if (!wrap) return;

  wrap.innerHTML = ITINERARY.map(day => {
    const p = parseDateParts(day.date);
    const isOpen = itinExpanded[day.date];
    return `<article class="itin-day ${isOpen ? 'open' : ''}" data-itin="${esc(day.date)}">
      <div class="itin-head" data-itin-toggle="${esc(day.date)}">
        <div class="postmark">
          <div class="mon">${p.mon}</div>
          <div class="day">${p.day}</div>
          <div class="yr">${p.year}</div>
        </div>
        <div class="itin-info">
          <div class="itin-dow">${esc(day.dow)}</div>
          <div class="itin-title">${esc(day.title)}</div>
          <div class="itin-stop">${esc(day.stop)}</div>
        </div>
        <span class="itin-chev">▾</span>
      </div>
      <div class="itin-body">
        <div class="itin-body-inner">
          <figure class="itin-thumb${day.photo ? '' : ' missing'}">
            ${day.photo ? `<img src="${esc(day.photo)}" alt="" class="itin-thumb-img" onerror="this.parentElement.classList.add('missing')"/>` : ''}
            <figcaption class="itin-thumb-cap">
              <span class="itin-thumb-stop">${esc(day.stop)}</span>
            </figcaption>
          </figure>
          <div class="itin-acts">
            ${day.activities.map(a => `
              <div class="itin-act">
                <div class="itin-time">${esc(a.time)}</div>
                <div class="itin-detail">${esc(a.detail)}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ${renderDayFooter(day.date)}
      </div>
    </article>`;
  }).join('');
}

// ============================================================
// DRAWER (task detail)
// ============================================================
function openDrawer(taskId) {
  const task = allTasks().find(t => t.id === taskId);
  if (!task) return;
  openDrawerTaskId = taskId;
  const s = state[taskId] || {};
  const info = dueInfo(task.dueDate);

  const content = document.getElementById('drawer-content');
  content.innerHTML = `
    <div class="drawer-eyebrow">${esc(task.catLabel)}${task.dueDate ? ' · ' + esc(info.label) : ''}</div>
    <div class="drawer-title">${esc(task.title)}</div>

    <div class="drawer-field">
      <div class="drawer-label">Status</div>
      <select class="drawer-select" id="drawer-status">
        <option value="not-started" ${s.status==='not-started'?'selected':''}>To do</option>
        <option value="in-progress" ${s.status==='in-progress'?'selected':''}>In progress</option>
        <option value="booked"      ${s.status==='booked'     ?'selected':''}>Booked</option>
        <option value="done"        ${s.status==='done'       ?'selected':''}>Done ✓</option>
      </select>
    </div>

    <div class="drawer-field">
      <div class="drawer-label">Cost</div>
      <div class="cost-row">
        <div>
          <div class="cost-sublabel">Estimated</div>
          <div class="cost-input-wrap">
            <span class="cost-prefix">$</span>
            <input type="number" class="drawer-input" id="drawer-est" value="${task.estimatedCost || 0}" placeholder="0"/>
          </div>
        </div>
        <div>
          <div class="cost-sublabel">Actual paid</div>
          <div class="cost-input-wrap">
            <span class="cost-prefix">$</span>
            <input type="number" class="drawer-input" id="drawer-actual" value="${s.actualCost || 0}" placeholder="0"/>
          </div>
        </div>
      </div>
    </div>

    <div class="drawer-field">
      <div class="drawer-label">Notes</div>
      <textarea class="drawer-textarea" id="drawer-notes" placeholder="Confirmation numbers, links, decisions…">${esc(s.notes || '')}</textarea>
      ${task.hint ? `<div class="drawer-hint">${esc(task.hint)}</div>` : ''}
    </div>

    <button class="drawer-close" id="drawer-close-btn">Save &amp; close</button>
  `;
  document.getElementById('drawer-overlay').classList.remove('hidden');
}
function closeDrawer() {
  if (!openDrawerTaskId) {
    document.getElementById('drawer-overlay').classList.add('hidden');
    return;
  }
  const status = document.getElementById('drawer-status')?.value;
  const estVal = parseFloat(document.getElementById('drawer-est')?.value) || 0;
  const actVal = parseFloat(document.getElementById('drawer-actual')?.value) || 0;
  const notes  = document.getElementById('drawer-notes')?.value || '';

  const task = allTasks().find(t => t.id === openDrawerTaskId);
  if (task) {
    // Mutate the live category tasks so est persists
    CATEGORIES.forEach(c => c.tasks.forEach(t => { if (t.id === openDrawerTaskId) t.estimatedCost = estVal; }));
  }
  state[openDrawerTaskId] = { ...state[openDrawerTaskId], status, actualCost: actVal, notes };
  saveState();

  document.getElementById('drawer-overlay').classList.add('hidden');
  openDrawerTaskId = null;
  renderAll();
}


// ============================================================
// LAYOUT / THEME (fixed settings — no tweaks panel)
// ============================================================
function applyTweaks() {
  const root = document.documentElement;
  root.setAttribute('data-theme',   'navy');
  root.setAttribute('data-layout',  'tabbed');
  root.setAttribute('data-hero',    'full');
  root.setAttribute('data-density', 'spacious');
  // data-type omitted → mixed (default)

  const chk = document.querySelector('.pane-checklist');
  const itn = document.querySelector('.pane-itinerary');
  const hou = document.querySelector('.pane-housing');
  const rst = document.querySelector('.pane-restaurants');
  if (chk) chk.classList.toggle('is-hidden', currentPane !== 'checklist');
  if (itn) itn.classList.toggle('is-hidden', currentPane !== 'itinerary');
  if (hou) hou.classList.toggle('is-hidden', currentPane !== 'housing');
  if (rst) rst.classList.toggle('is-hidden', currentPane !== 'restaurants');

  document.querySelectorAll('.pane-switch button').forEach(b => {
    b.classList.toggle('active', b.dataset.pane === currentPane);
  });
}

function setupTweaksListener() {}

// ============================================================
// MAP
// ============================================================
let tripMap = null;

function initTripMap() {
  const el = document.getElementById('trip-map');
  if (!el) return;

  if (tripMap) {
    tripMap.invalidateSize();
    return;
  }

  const latlngs = MAP_STOPS.map(s => [s.lat, s.lng]);

  tripMap = L.map('trip-map', { scrollWheelZoom: false, zoomControl: true });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(tripMap);

  L.polyline(latlngs, { color: '#1a3550', weight: 2, opacity: 0.45, dashArray: '6 9' }).addTo(tripMap);

  MAP_STOPS.forEach((stop, i) => {
    const icon = L.divIcon({
      html: `<div class="map-pin"><span>${i + 1}</span></div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -18],
    });
    L.marker([stop.lat, stop.lng], { icon })
      .addTo(tripMap)
      .bindPopup(`<div class="map-popup-inner"><strong>${esc(stop.label)}</strong><span>${esc(stop.sub)}</span></div>`, { closeButton: false });
  });

  tripMap.fitBounds(latlngs, { padding: [32, 32] });
}

// ============================================================
// EVENTS
// ============================================================
function setupEvents() {
  document.addEventListener('click', e => {
    // Checkbox
    const check = e.target.closest('[data-check]');
    if (check) {
      e.stopPropagation();
      const taskId = check.dataset.check;
      const cur = state[taskId]?.status;
      state[taskId] = { ...state[taskId], status: cur === 'done' ? 'not-started' : 'done' };
      saveState();
      renderAll();
      return;
    }

    // Task row
    const row = e.target.closest('[data-task]');
    if (row) {
      openDrawer(row.dataset.task);
      return;
    }

    // Filter bar
    const fbtn = e.target.closest('[data-filter]');
    if (fbtn) {
      currentFilter = fbtn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === fbtn));
      renderChecklist();
      renderProposal();
      return;
    }

    // Pane switch (tabbed)
    const pbtn = e.target.closest('[data-pane]');
    if (pbtn) {
      currentPane = pbtn.dataset.pane;
      applyTweaks();
      if (currentPane === 'itinerary') setTimeout(initTripMap, 60);
      return;
    }

    // Itinerary toggle
    const itinHead = e.target.closest('[data-itin-toggle]');
    if (itinHead) {
      const date = itinHead.dataset.itinToggle;
      itinExpanded[date] = !itinExpanded[date];
      saveState();
      renderItinerary();
      return;
    }

    // Drawer close
    if (e.target.id === 'drawer-close-btn') { closeDrawer(); return; }
    if (e.target.id === 'drawer-overlay')   { closeDrawer(); return; }

    // Housing: show URL input
    const addBtn = e.target.closest('[data-housing-add]');
    if (addBtn) {
      const sid = addBtn.dataset.housingAdd;
      document.getElementById(`url-wrap-${sid}`).style.display = 'flex';
      addBtn.style.display = 'none';
      document.getElementById(`url-input-${sid}`).focus();
      return;
    }

    // Housing: cancel URL input
    const cancelBtn = e.target.closest('[data-housing-cancel]');
    if (cancelBtn) {
      const sid = cancelBtn.dataset.housingCancel;
      document.getElementById(`url-wrap-${sid}`).style.display = 'none';
      document.getElementById(`add-btn-${sid}`).style.display  = '';
      document.getElementById(`url-input-${sid}`).value = '';
      return;
    }

    // Housing: submit URL
    const submitBtn = e.target.closest('[data-housing-submit]');
    if (submitBtn) { submitHousingUrl(submitBtn.dataset.housingSubmit); return; }

    // Housing: select option
    const selBtn = e.target.closest('[data-housing-select]');
    if (selBtn) { selectHousingOption(selBtn.dataset.housingSelect, selBtn.dataset.option); return; }

    // Housing: delete option
    const delBtn = e.target.closest('[data-housing-delete]');
    if (delBtn) { deleteHousingOption(delBtn.dataset.housingDelete, delBtn.dataset.option); return; }

    // Restaurant: show add form
    const restAddBtn = e.target.closest('[data-restaurant-add]');
    if (restAddBtn) {
      const sid = restAddBtn.dataset.restaurantAdd;
      document.getElementById(`rest-form-wrap-${sid}`).style.display = '';
      restAddBtn.style.display = 'none';
      return;
    }

    // Restaurant: cancel form
    const restCancel = e.target.closest('[data-rf-cancel]');
    if (restCancel) {
      const sid = restCancel.dataset.rfCancel;
      document.getElementById(`rest-form-wrap-${sid}`).style.display = 'none';
      document.getElementById(`rest-add-btn-${sid}`).style.display = '';
      return;
    }

    // Restaurant: save form
    const restSave = e.target.closest('[data-rf-save]');
    if (restSave) {
      const sid = restSave.dataset.rfSave;
      const form = document.querySelector(`.restaurant-form[data-stop="${sid}"]`);
      if (!form) return;
      const url   = form.querySelector('[data-rf-url]').value.trim();
      const name  = form.querySelector('[data-rf-name]').value.trim();
      const meal  = form.querySelector('[data-rf-meal]').value;
      const date  = form.querySelector('[data-rf-date]').value;
      const notes = form.querySelector('[data-rf-notes]').value.trim();
      if (!name && !url) {
        form.querySelector('[data-rf-name]').focus();
        return;
      }
      restaurantData.push({ id: 'r_' + Date.now(), stopId: sid, url, name: name || 'View on Maps', meal, date, notes });
      saveState();
      renderRestaurants();
      renderItinerary();
      return;
    }

    // Restaurant: delete card
    const restDel = e.target.closest('[data-restaurant-delete]');
    if (restDel) {
      restaurantData = restaurantData.filter(r => r.id !== restDel.dataset.restaurantDelete);
      saveState();
      renderRestaurants();
      renderItinerary();
      return;
    }

  });

  // Housing: auto-save fields on blur; Enter submits URL input
  document.addEventListener('focusout', e => {
    const field = e.target.closest('[data-housing-field]');
    if (field) updateHousingOption(field.dataset.stop, field.dataset.option, field.dataset.housingField, field.value);
  });

  document.addEventListener('input', e => {
    const urlInput = e.target.closest('[data-rf-url]');
    if (urlInput) {
      const parsed = parseGoogleMapsUrl(urlInput.value.trim());
      if (parsed.valid && parsed.name) {
        const form = urlInput.closest('.restaurant-form');
        const nameInput = form && form.querySelector('[data-rf-name]');
        if (nameInput && !nameInput.value) nameInput.value = parsed.name;
      }
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('housing-url-input')) {
      submitHousingUrl(e.target.dataset.stop);
    }
  });
}

// ============================================================
// HOUSING
// ============================================================
function parseListingUrl(url) {
  try {
    const u = new URL(url);
    const airbnb = url.match(/airbnb\.[a-z.]+\/rooms\/(\d+)/);
    if (airbnb) return { valid: true, site: 'Airbnb', listingId: airbnb[1] };
    if (u.hostname) return { valid: true, site: u.hostname.replace('www.', ''), listingId: null };
    return { valid: false };
  } catch (e) { return { valid: false }; }
}

function addHousingOption(stopId, url) {
  const parsed = parseListingUrl(url.trim());
  if (!parsed.valid) return false;
  housingData[stopId].options.push({
    id: 'h_' + Date.now(),
    url: url.trim(),
    site: parsed.site,
    listingId: parsed.listingId,
    name: '', price: '', notes: ''
  });
  saveState();
  return true;
}

function submitHousingUrl(stopId) {
  const input = document.getElementById(`url-input-${stopId}`);
  if (!input) return;
  const ok = addHousingOption(stopId, input.value);
  if (ok) {
    document.getElementById(`url-wrap-${stopId}`).style.display = 'none';
    document.getElementById(`add-btn-${stopId}`).style.display  = '';
    input.value = '';
    renderHousing();
  } else {
    input.style.outline = '2px solid var(--urg-over)';
    input.placeholder   = 'Please paste a valid URL';
    setTimeout(() => { input.style.outline = ''; input.placeholder = 'Paste Airbnb URL…'; }, 2000);
  }
}

function selectHousingOption(stopId, optionId) {
  const h = housingData[stopId];
  const hs = HOUSING_STOPS.find(s => s.id === stopId);
  if (h.selectedId === optionId) {
    h.selectedId = null;
    if (hs && state[hs.taskId]) state[hs.taskId] = { ...state[hs.taskId], status: 'not-started', actualCost: 0 };
  } else {
    h.selectedId = optionId;
    const opt = h.options.find(o => o.id === optionId);
    const totalCost = opt ? (parseFloat(opt.price) || 0) * hs.nights : 0;
    if (hs && state[hs.taskId]) state[hs.taskId] = { ...state[hs.taskId], status: 'booked', actualCost: totalCost };
  }
  saveState();
  renderAll();
}

function deleteHousingOption(stopId, optionId) {
  const h = housingData[stopId];
  if (h.selectedId === optionId) {
    h.selectedId = null;
    const hs = HOUSING_STOPS.find(s => s.id === stopId);
    if (hs && state[hs.taskId]) state[hs.taskId] = { ...state[hs.taskId], status: 'not-started' };
  }
  h.options = h.options.filter(o => o.id !== optionId);
  saveState();
  renderAll();
}

function updateHousingOption(stopId, optionId, field, value) {
  const opt = housingData[stopId]?.options.find(o => o.id === optionId);
  if (!opt) return;
  opt[field] = value;
  // If price changes on the selected option, sync to task actual cost
  if (field === 'price' && housingData[stopId].selectedId === optionId) {
    const hs = HOUSING_STOPS.find(s => s.id === stopId);
    if (hs && state[hs.taskId]) state[hs.taskId] = { ...state[hs.taskId], actualCost: (parseFloat(value) || 0) * hs.nights };
  }
  saveState();
}

function renderHousingOption(stopId, opt, selectedId) {
  const isSel = opt.id === selectedId;
  const display = opt.listingId ? `${esc(opt.site)} #${esc(opt.listingId)}` : esc(opt.site);
  return `<div class="housing-option ${isSel ? 'is-selected' : ''}">
    <div class="housing-opt-top">
      <a class="housing-opt-link" href="${esc(opt.url)}" target="_blank" rel="noopener">${display} ↗</a>
      <button class="housing-opt-del" data-housing-delete="${esc(stopId)}" data-option="${esc(opt.id)}" title="Remove">✕</button>
    </div>
    <div class="housing-opt-fields">
      <input class="housing-field" placeholder="Nickname (e.g. Sunny terrace apt)"
        value="${esc(opt.name)}"
        data-housing-field="name" data-stop="${esc(stopId)}" data-option="${esc(opt.id)}"/>
      <div class="housing-price-row">
        <span class="housing-price-pre">$</span>
        <input class="housing-field housing-field-price" type="number" placeholder="0"
          value="${esc(opt.price)}"
          data-housing-field="price" data-stop="${esc(stopId)}" data-option="${esc(opt.id)}"/>
        <span class="housing-price-suf">/ night</span>
      </div>
      <textarea class="housing-field housing-field-notes" placeholder="Notes — beds, location, vibe…"
        data-housing-field="notes" data-stop="${esc(stopId)}" data-option="${esc(opt.id)}">${esc(opt.notes)}</textarea>
    </div>
    <button class="housing-select-btn ${isSel ? 'selected' : ''}"
      data-housing-select="${esc(stopId)}" data-option="${esc(opt.id)}">
      ${isSel ? 'Booked ✓' : 'Select this one'}
    </button>
  </div>`;
}

function renderHousing() {
  const wrap = document.getElementById('housing-wrap');
  if (!wrap) return;

  wrap.innerHTML = HOUSING_STOPS.map(stop => {
    const h = housingData[stop.id] || { options: [], selectedId: null };
    const p1 = parseDateParts(stop.checkIn);
    const p2 = parseDateParts(stop.checkOut);
    const range = p1 && p2 ? `${p1.mon} ${p1.day} – ${p2.mon} ${p2.day}` : '';
    const isBooked = !!h.selectedId;

    if (isBooked) {
      const opt = h.options.find(o => o.id === h.selectedId);
      const display = opt.listingId ? `${esc(opt.site)} #${esc(opt.listingId)}` : esc(opt.site);
      return `<div class="housing-stop is-booked">
        <div class="housing-stop-head">
          <div>
            <div class="housing-stop-label">${esc(stop.label)}</div>
            <div class="housing-stop-meta">${esc(range)} · ${stop.nights} night${stop.nights > 1 ? 's' : ''}</div>
          </div>
          <span class="housing-booked-pill">Booked ✓</span>
        </div>
        <div class="housing-booked-summary">
          <a class="housing-opt-link" href="${esc(opt.url)}" target="_blank" rel="noopener">${display} ↗</a>
          ${opt.name  ? `<div class="housing-booked-name">${esc(opt.name)}</div>` : ''}
          ${opt.price ? `<div class="housing-booked-price">$${esc(opt.price)} / night</div>` : ''}
          ${opt.notes ? `<div class="housing-booked-notes">${esc(opt.notes)}</div>` : ''}
          <button class="housing-change-btn" data-housing-select="${esc(stop.id)}" data-option="${esc(opt.id)}">Change booking</button>
        </div>
      </div>`;
    }

    const optionsHtml = h.options.length === 0
      ? `<p class="housing-empty">No options added yet — paste a link below to compare.</p>`
      : `<div class="housing-options">${h.options.map(o => renderHousingOption(stop.id, o, h.selectedId)).join('')}</div>`;

    const recsHtml = stop.recommendations && stop.recommendations.length > 0
      ? `<div class="housing-recs">
          <div class="housing-recs-head">Recommended Hotels</div>
          <div class="housing-recs-list">
            ${stop.recommendations.map(r => `
              <a class="housing-rec-card housing-rec-${esc(r.tier.toLowerCase().replace('-',''))}" href="${esc(r.url)}" target="_blank" rel="noopener">
                <div class="housing-rec-top">
                  <span class="housing-rec-name">${esc(r.name)}</span>
                  <span class="housing-rec-tier">${esc(r.tier)}</span>
                </div>
                <div class="housing-rec-note">${esc(r.note)}</div>
              </a>
            `).join('')}
          </div>
        </div>`
      : '';

    return `<div class="housing-stop">
      <div class="housing-stop-head">
        <div>
          <div class="housing-stop-label">${esc(stop.label)}</div>
          <div class="housing-stop-meta">${esc(range)} · ${stop.nights} night${stop.nights > 1 ? 's' : ''}</div>
        </div>
      </div>
      ${recsHtml}
      ${optionsHtml}
      <div class="housing-add-row">
        <div class="housing-url-row" id="url-wrap-${esc(stop.id)}" style="display:none">
          <input class="housing-url-input" id="url-input-${esc(stop.id)}"
            placeholder="Paste Airbnb URL…" type="url" data-stop="${esc(stop.id)}"/>
          <button class="housing-url-add" data-housing-submit="${esc(stop.id)}">Add</button>
          <button class="housing-url-cancel" data-housing-cancel="${esc(stop.id)}">✕</button>
        </div>
        <button class="housing-add-btn" id="add-btn-${esc(stop.id)}" data-housing-add="${esc(stop.id)}">+ Add option</button>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// RESTAURANTS
// ============================================================
function parseGoogleMapsUrl(url) {
  try {
    const m = url.match(/\/maps\/place\/([^/@?]+)/);
    if (m) return { valid: true, name: decodeURIComponent(m[1].replace(/\+/g, ' ')) };
    if (url.includes('google.com/maps') || url.includes('maps.app.goo.gl') || url.includes('goo.gl'))
      return { valid: true, name: '' };
    return { valid: false };
  } catch(e) { return { valid: false }; }
}

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner'];
const MEAL_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

function getHousingForDate(date) {
  const stop = HOUSING_STOPS.find(s => s.checkIn <= date && date < s.checkOut);
  if (!stop) return null;
  const h = housingData[stop.id];
  const opt = h?.selectedId ? h.options.find(o => o.id === h.selectedId) : null;
  return { stop, opt };
}

function renderDayFooter(date) {
  const skipDining = MEAL_SKIP_DAYS.has(date);
  const housing = getHousingForDate(date);
  if (skipDining && !housing) return '';

  const diningHtml = skipDining ? '' : (() => {
    const dayRests = restaurantData.filter(r => r.date === date);
    const rows = MEAL_ORDER.map(meal => {
      const r = dayRests.find(r => r.meal === meal);
      if (r) {
        return `<div class="itin-meal-row">
          <span class="itin-meal-type meal-${esc(meal)}">${MEAL_LABEL[meal]}</span>
          <a class="itin-meal-link" href="${esc(r.url || '#')}" target="_blank" rel="noopener">${esc(r.name || 'View on Maps')} ↗</a>
          ${r.notes ? `<span class="itin-meal-notes">${esc(r.notes)}</span>` : ''}
        </div>`;
      }
      return `<div class="itin-meal-row itin-meal-empty">
        <span class="itin-meal-type">${MEAL_LABEL[meal]}</span>
        <span class="itin-meal-blank">—</span>
      </div>`;
    }).join('');
    return `<div class="itin-footer-col">
      <div class="itin-footer-head">Dining</div>
      ${rows}
    </div>`;
  })();

  const housingHtml = housing ? (() => {
    const { stop, opt } = housing;
    const display = opt?.listingId ? `${esc(opt.site)} #${esc(opt.listingId)}` : opt ? esc(opt.site) : '';
    return `<div class="itin-footer-col">
      <div class="itin-footer-head">Stay · ${esc(stop.label)}</div>
      ${opt
        ? `<a class="itin-stay-link" href="${esc(opt.url)}" target="_blank" rel="noopener">${display} ↗</a>
           ${opt.name  ? `<div class="itin-stay-name">${esc(opt.name)}</div>` : ''}
           ${opt.notes ? `<div class="itin-stay-notes">${esc(opt.notes)}</div>` : ''}`
        : `<div class="itin-stay-empty">Not booked yet</div>`}
    </div>`;
  })() : '';

  return `<div class="itin-footer ${!diningHtml || !housingHtml ? 'itin-footer-single' : ''}">
    ${diningHtml}${housingHtml}
  </div>`;
}

function renderRestaurantCard(r) {
  const p = parseDateParts(r.date);
  const dayData = ITINERARY.find(d => d.date === r.date);
  const dateLabel = p ? `${dayData?.dow || ''}, ${p.mon} ${p.day}` : '';
  return `<div class="rest-card">
    <div class="rest-card-top">
      <span class="rest-meal-chip meal-${esc(r.meal)}">${MEAL_LABEL[r.meal]}</span>
      <a class="rest-card-name" href="${esc(r.url || '#')}" target="_blank" rel="noopener">${esc(r.name || 'View on Maps')} ↗</a>
      <button class="rest-card-del" data-restaurant-delete="${esc(r.id)}" title="Remove">✕</button>
    </div>
    <div class="rest-card-date">${esc(dateLabel)}</div>
    ${r.notes ? `<div class="rest-card-notes">${esc(r.notes)}</div>` : ''}
  </div>`;
}

function renderRestaurantForm(stop) {
  const dateOpts = stop.dates.map(d => {
    const dayData = ITINERARY.find(x => x.date === d);
    const p = parseDateParts(d);
    const label = dayData ? `${dayData.dow}, ${p.mon} ${p.day} — ${dayData.title}` : `${p.mon} ${p.day}`;
    return `<option value="${esc(d)}">${esc(label)}</option>`;
  }).join('');
  return `<div class="restaurant-form" data-stop="${esc(stop.id)}">
    <div class="rest-form-row">
      <label class="rest-form-label">Google Maps URL</label>
      <input class="rest-form-input" type="url" data-rf-url data-stop="${esc(stop.id)}" placeholder="Paste link…"/>
    </div>
    <div class="rest-form-row">
      <label class="rest-form-label">Name</label>
      <input class="rest-form-input" type="text" data-rf-name data-stop="${esc(stop.id)}" placeholder="Restaurant name"/>
    </div>
    <div class="rest-form-row rest-form-2col">
      <div>
        <label class="rest-form-label">Meal</label>
        <select class="rest-form-select" data-rf-meal data-stop="${esc(stop.id)}">
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner" selected>Dinner</option>
        </select>
      </div>
      <div>
        <label class="rest-form-label">Date</label>
        <select class="rest-form-select" data-rf-date data-stop="${esc(stop.id)}">${dateOpts}</select>
      </div>
    </div>
    <div class="rest-form-row">
      <label class="rest-form-label">Notes</label>
      <textarea class="rest-form-input rest-form-ta" data-rf-notes data-stop="${esc(stop.id)}" placeholder="Reservation info, must-try dishes…"></textarea>
    </div>
    <div class="rest-form-actions">
      <button class="rest-form-save" data-rf-save="${esc(stop.id)}">Save restaurant</button>
      <button class="rest-form-cancel" data-rf-cancel="${esc(stop.id)}">Cancel</button>
    </div>
  </div>`;
}

function renderRestaurants() {
  const wrap = document.getElementById('restaurants-wrap');
  if (!wrap) return;

  wrap.innerHTML = RESTAURANT_STOPS.map(stop => {
    const p1 = parseDateParts(stop.dates[0]);
    const p2 = parseDateParts(stop.dates[stop.dates.length - 1]);
    const range = stop.dates.length === 1
      ? `${p1.mon} ${p1.day}`
      : `${p1.mon} ${p1.day} – ${p2.mon} ${p2.day}`;

    const daysHtml = stop.dates.map(date => {
      const dayData = ITINERARY.find(d => d.date === date);
      const p = parseDateParts(date);
      const entries = restaurantData
        .filter(r => r.date === date)
        .sort((a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal));
      return `<div class="rest-day-group">
        <div class="rest-day-head">
          <span class="rest-day-dow">${esc(dayData?.dow || '')}</span>
          <span class="rest-day-date">${p.mon} ${p.day}</span>
          <span class="rest-day-title">${esc(dayData?.title || '')}</span>
        </div>
        ${entries.length === 0
          ? `<p class="rest-day-empty">No restaurants added yet</p>`
          : entries.map(renderRestaurantCard).join('')}
      </div>`;
    }).join('');

    return `<div class="rest-stop">
      <div class="rest-stop-head">
        <div class="rest-stop-label">${esc(stop.label)}</div>
        <div class="rest-stop-meta">${esc(range)} · ${stop.dates.length} day${stop.dates.length > 1 ? 's' : ''}</div>
      </div>
      <div class="rest-stop-body">${daysHtml}</div>
      <div class="rest-add-row">
        <div id="rest-form-wrap-${esc(stop.id)}" style="display:none">${renderRestaurantForm(stop)}</div>
        <button class="rest-add-btn" id="rest-add-btn-${esc(stop.id)}" data-restaurant-add="${esc(stop.id)}">+ Add restaurant</button>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// RENDER ALL
// ============================================================
function renderAll() {
  renderHero();
  renderNextUp();
  renderBudget();
  renderChecklist();
  renderItinerary();
  renderHousing();
  renderRestaurants();
  applyTweaks();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  setupTweaksListener();
  setupEvents();
  renderAll();
  setInterval(renderHero, 60000);
});
