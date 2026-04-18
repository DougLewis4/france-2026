// ============================================================
// SECURITY: Escape helper — used for any user/dynamic data in innerHTML
// ============================================================
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// DATA: Task definitions (static — user state stored separately)
// ============================================================

const CATEGORIES = [
  {
    id: 'booked',
    emoji: '✅',
    label: 'Already Booked',
    locked: false,
    tasks: [
      {
        id: 'flight-in',
        title: 'Inbound flights: SAN → LAX → Paris CDG → Nice',
        dueDate: null,
        estimatedCost: 0,
        defaultStatus: 'done',
        hint: 'Delta DL4002 SAN→LAX 3:00–4:05pm | LAX→CDG 6:05pm overnight | CDG→NCE 3:25–5:05pm\nDelta confirmation: H32OCA'
      },
      {
        id: 'flight-out',
        title: 'Return flights: Paris CDG → London → San Diego',
        dueDate: null,
        estimatedCost: 0,
        defaultStatus: 'done',
        hint: 'AA7216 CDG→LHR 8:10am | AA6989 LHR→SAN 11:35am–2:55pm\nAmerican confirmation: QQTITZ | British Airways: CW3FML'
      }
    ]
  },
  {
    id: 'proposal',
    emoji: '✈️',
    label: 'Pre-Trip Arrangements',
    locked: true,
    tasks: [
      {
        id: 'prop-dad',
        title: 'Talk to her dad',
        dueDate: '2026-05-01',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'Do this before buying the ring so the timeline feels intentional.'
      },
      {
        id: 'prop-ring',
        title: 'Buy the ring',
        dueDate: '2026-05-15',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'Allow 4–8 weeks for custom work or resizing. Order by mid-May at the absolute latest.'
      },
      {
        id: 'prop-location',
        title: 'Choose the proposal location',
        dueDate: '2026-05-15',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'Top options:\n• Valensole lavender fields at sunset (Jul 24) — peak July bloom, most iconic\n• Porquerolles — Plage Notre-Dame (Jul 22) — secluded tropical beach\n• Les Baux de Provence (Jul 28) — medieval clifftop, sweeping valley views\n• Paris (Jul 29–31) — classic, always works'
      },
      {
        id: 'prop-photographer',
        title: 'Book surprise proposal photographer',
        dueDate: '2026-05-31',
        estimatedCost: 500,
        defaultStatus: 'not-started',
        hint: 'Search: "proposal photographer [location] Provence France"\nPhotographers hide nearby and capture the moment. Book 6–8 weeks before the trip.'
      },
      {
        id: 'prop-plan',
        title: 'Plan the exact moment',
        dueDate: '2026-06-30',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'Think through: what you\'ll say, how you get her to the spot without it seeming planned, and what happens right after.'
      },
      {
        id: 'prop-dinner',
        title: 'Book celebratory dinner for proposal evening',
        dueDate: '2026-06-30',
        estimatedCost: 300,
        defaultStatus: 'not-started',
        hint: 'Book a special restaurant near the proposal location for the celebration dinner right after.'
      }
    ]
  },
  {
    id: 'transport',
    emoji: '🚗',
    label: 'Transportation',
    locked: false,
    tasks: [
      {
        id: 'trans-car',
        title: 'Rental car: Nice Airport → Avignon (Jul 18–29)',
        dueDate: '2026-05-30',
        estimatedCost: 800,
        defaultStatus: 'not-started',
        hint: 'One-way rental, 11 days. July is peak Provence season — book by May or prices spike.\nSearch "one-way car rental Nice to Avignon" on AutoEurope, Europcar, or Hertz.'
      },
      {
        id: 'trans-tgv',
        title: 'TGV train: Avignon → Paris (Jul 29)',
        dueDate: '2026-04-30',
        estimatedCost: 120,
        defaultStatus: 'not-started',
        hint: 'Book NOW — advance tickets are much cheaper and trains fill up fast.\nBook at sncf-connect.com or Rail Europe. Avignon Centre station → Paris Gare de Lyon. ~2h 40min.'
      },
      {
        id: 'trans-ferry',
        title: 'Porquerolles ferry (Jul 22)',
        dueDate: '2026-07-01',
        estimatedCost: 40,
        defaultStatus: 'not-started',
        hint: '20-min ferry from La Tour Fondue port near Hyères.\nCheck schedule closer to date — usually no advance booking needed in summer.'
      },
      {
        id: 'trans-cdg',
        title: 'Transport to CDG airport hotel (Jul 31)',
        dueDate: '2026-06-30',
        estimatedCost: 30,
        defaultStatus: 'not-started',
        hint: 'RER B train from central Paris to CDG, or the hotel shuttle if staying at a terminal-connected hotel.'
      }
    ]
  },
  {
    id: 'hotels',
    emoji: '🏨',
    label: 'Hotels',
    locked: false,
    tasks: [
      {
        id: 'hotel-sanary',
        title: 'Sanary-sur-Mer — 4 nights (Jul 18–22)',
        dueDate: '2026-05-15',
        estimatedCost: 800,
        defaultStatus: 'not-started',
        hint: 'Near the wedding venue (Toulon area). Check with Loup about group Airbnb options.\nHotels from wedding website: Ibis Budget Toulon, OKKO Hotels, Grand Hotel Dauphine, Best Western Plus La Corniche. Group options: $59–$125/person/night.'
      },
      {
        id: 'hotel-aix',
        title: 'Aix-en-Provence — 1 night (Jul 23)',
        dueDate: '2026-06-01',
        estimatedCost: 200,
        defaultStatus: 'not-started',
        hint: 'Stay near Cours Mirabeau or in the Mazarin district for the best experience.'
      },
      {
        id: 'hotel-verdon',
        title: 'Verdon Gorge area — 2 nights (Jul 24–25)',
        dueDate: '2026-06-01',
        estimatedCost: 400,
        defaultStatus: 'not-started',
        hint: 'Stay in Moustiers-Sainte-Marie — a beautiful perched village right at the gorge entrance. Fills up fast in July.'
      },
      {
        id: 'hotel-avignon',
        title: 'Avignon — 3 nights (Jul 26–28)',
        dueDate: '2026-06-01',
        estimatedCost: 600,
        defaultStatus: 'not-started',
        hint: 'Stay inside the medieval walled city for best atmosphere.\nAvignon Theater Festival runs all July — hotels book out early!'
      },
      {
        id: 'hotel-paris',
        title: 'Paris — 2 nights (Jul 29–30)',
        dueDate: '2026-06-01',
        estimatedCost: 500,
        defaultStatus: 'not-started',
        hint: 'Central arrondissements (1st, 6th, 7th, 8th) for walkability to major sights.'
      },
      {
        id: 'hotel-cdg',
        title: 'CDG Airport hotel — 1 night (Jul 31)',
        dueDate: '2026-06-01',
        estimatedCost: 200,
        defaultStatus: 'not-started',
        hint: 'Essential — your flight departs 8:10am Aug 1, must be at terminal by ~6am.\nSheraton CDG or Pullman CDG are directly connected to Terminal 2.'
      }
    ]
  },
  {
    id: 'wedding',
    emoji: '💒',
    label: 'Wedding',
    locked: false,
    tasks: [
      {
        id: 'wed-rsvp',
        title: 'RSVP to Seb and Paula',
        dueDate: '2026-05-01',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'Check the wedding website for the RSVP deadline.'
      },
      {
        id: 'wed-boat',
        title: 'Confirm boat trip spot with Loup (Jul 21, 9am–1pm)',
        dueDate: '2026-06-01',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'Loup organized a group boat trip from Sanary on Tuesday Jul 21, 9am–1pm. Reach out directly to confirm your spot.'
      },
      {
        id: 'wed-gift',
        title: 'Wedding gift for Seb and Paula',
        dueDate: '2026-07-01',
        estimatedCost: 200,
        defaultStatus: 'not-started',
        hint: 'Consider shipping ahead to avoid carrying it on the plane. Check if they have a registry.'
      },
      {
        id: 'wed-attire',
        title: 'Wedding attire',
        dueDate: '2026-06-15',
        estimatedCost: 200,
        defaultStatus: 'not-started',
        hint: 'July in southern France averages 85–95F. Plan light, breathable formal wear.\nConfirm dress code with Seb or Loup.'
      }
    ]
  },
  {
    id: 'admin',
    emoji: '🌍',
    label: 'Trip Admin',
    locked: false,
    tasks: [
      {
        id: 'adm-passport',
        title: 'Check passport expiry date',
        dueDate: '2026-04-30',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'Must be valid at least 6 months past Aug 1, 2026 — meaning valid through February 2027.'
      },
      {
        id: 'adm-insurance',
        title: 'Travel insurance',
        dueDate: '2026-06-01',
        estimatedCost: 150,
        defaultStatus: 'not-started',
        hint: 'Covers trip cancellation, medical emergencies, and lost luggage. Compare on InsureMyTrip or Squaremouth.'
      },
      {
        id: 'adm-bank',
        title: 'Notify bank of travel dates',
        dueDate: '2026-07-10',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'Tell your bank and credit card companies you\'ll be in France Jul 17–Aug 1 to prevent fraud blocks on your card.'
      },
      {
        id: 'adm-idp',
        title: 'International Driving Permit (IDP)',
        dueDate: '2026-06-01',
        estimatedCost: 20,
        defaultStatus: 'not-started',
        hint: 'Required in France alongside your US license. Get one at any AAA office for about $20.'
      },
      {
        id: 'adm-maps',
        title: 'Download offline maps for Provence',
        dueDate: '2026-07-10',
        estimatedCost: 0,
        defaultStatus: 'not-started',
        hint: 'In Google Maps: search the Provence region, tap the 3 dots, then Download offline map. Works without signal.'
      },
      {
        id: 'adm-phone',
        title: 'Set up international phone plan',
        dueDate: '2026-07-10',
        estimatedCost: 50,
        defaultStatus: 'not-started',
        hint: 'Check with your carrier. T-Mobile includes free international data. AT&T/Verizon offer day passes (~$10/day).'
      },
      {
        id: 'adm-euros',
        title: 'Get Euros',
        dueDate: '2026-07-15',
        estimatedCost: 300,
        defaultStatus: 'not-started',
        hint: 'Small towns and markets sometimes don\'t take cards.\nBest rate: withdraw from a bank ATM in France. Avoid airport exchange booths.'
      }
    ]
  }
];

// ============================================================
// DATA: Itinerary
// ============================================================

const ITINERARY = [
  {
    date: '2026-07-17', dow: 'Friday', title: 'Departure Day', emoji: '✈️',
    activities: [
      { time: '3:00 PM',  detail: 'Depart San Diego (SAN → LAX, Delta DL4002)' },
      { time: '4:05 PM',  detail: 'Arrive Los Angeles' },
      { time: '6:05 PM',  detail: 'Depart LAX → Paris CDG (overnight flight)' }
    ]
  },
  {
    date: '2026-07-18', dow: 'Saturday', title: 'Arrival in France', emoji: '🛬',
    activities: [
      { time: '1:50 PM',  detail: 'Land Paris CDG' },
      { time: '3:25 PM',  detail: 'Connecting flight CDG → Nice' },
      { time: '5:05 PM',  detail: 'Land Nice — pick up rental car' },
      { time: '~6:30 PM', detail: 'Drive 1 hour west to Sanary-sur-Mer' },
      { time: 'Evening',  detail: 'Check in, light dinner at the harbor, rest up' }
    ]
  },
  {
    date: '2026-07-19', dow: 'Sunday', title: 'Sebastian & Paula Wedding', emoji: '💒',
    activities: [
      { time: 'Morning',   detail: 'Rest and get ready' },
      { time: 'Afternoon', detail: 'Wedding ceremony near Toulon / Le Mourillon' },
      { time: 'Evening',   detail: 'Celebrate! Cheers to Seb and Paula' }
    ]
  },
  {
    date: '2026-07-20', dow: 'Monday', title: 'Sanary Brunch + Calanques', emoji: '⛵',
    activities: [
      { time: 'Morning',      detail: 'Brunch in Sanary-sur-Mer — colorful fishing village, Provençal market by the sea' },
      { time: 'Afternoon',    detail: 'Drive to Cassis (~45 min) — pastel harbor town, seafood, famous local white wine' },
      { time: 'Late aftern.', detail: 'Explore the Calanques — secret turquoise coves between white limestone cliffs' }
    ]
  },
  {
    date: '2026-07-21', dow: 'Tuesday', title: 'Boat Trip + Calanques', emoji: '⚓',
    activities: [
      { time: '9:00 AM',   detail: 'Boat trip from Sanary (Loup\'s organized trip) — sailing the Mediterranean coast' },
      { time: '1:00 PM',   detail: 'Back in Sanary for lunch' },
      { time: 'Afternoon', detail: 'Cassis or Calanques for more swimming and exploring' },
      { time: 'Evening',   detail: 'Dinner at Sanary harbor' }
    ]
  },
  {
    date: '2026-07-22', dow: 'Wednesday', title: 'Porquerolles Island Day Trip', emoji: '🏝️',
    activities: [
      { time: 'Morning',   detail: 'Drive to La Tour Fondue port near Hyères' },
      { time: '~9:30 AM',  detail: 'Take 20-min ferry to Porquerolles (car-free island)' },
      { time: 'All day',   detail: 'Rent bikes, swim at Plage Notre-Dame (tropical white sand + turquoise water)' },
      { time: 'Afternoon', detail: 'Ferry back, drive toward Aix-en-Provence' }
    ]
  },
  {
    date: '2026-07-23', dow: 'Thursday', title: 'Le Castellet + Bandol + Aix', emoji: '🍷',
    activities: [
      { time: 'Morning',    detail: 'Le Castellet — perfectly preserved medieval hilltop village with valley views' },
      { time: 'Late morn.', detail: 'Bandol wine tasting — the rosé capital of Provence, vineyards on the sea' },
      { time: 'Afternoon',  detail: 'Drive to Aix-en-Provence (45 min)' },
      { time: 'Evening',    detail: 'Stroll Cours Mirabeau — Provence\'s grand boulevard lined with fountains and cafés' }
    ]
  },
  {
    date: '2026-07-24', dow: 'Friday', title: 'Aix + Valensole Lavender', emoji: '💜',
    activities: [
      { time: 'Morning',    detail: 'Explore Aix-en-Provence — Mazarin district, Cézanne\'s studio, morning market' },
      { time: 'Afternoon',  detail: 'Drive 1.5 hrs northeast to Valensole Plateau — peak July lavender bloom' },
      { time: 'Sunset',     detail: 'Golden hour in the lavender fields — one of the most beautiful sights in France' },
      { time: 'Evening',    detail: 'Drive to Verdon Gorge area, check in near Moustiers-Sainte-Marie' }
    ]
  },
  {
    date: '2026-07-25', dow: 'Saturday', title: 'Gorges du Verdon', emoji: '🏔️',
    activities: [
      { time: 'Morning',   detail: 'Drive the cliff-edge Route des Crêtes for dramatic gorge views' },
      { time: 'Afternoon', detail: 'Kayak or electric boat on Lac de Sainte-Croix at the gorge base' },
      { time: 'Option',    detail: 'Hike the Sentier Martel trail along the canyon floor' }
    ]
  },
  {
    date: '2026-07-26', dow: 'Sunday', title: 'Luberon + Roussillon', emoji: '🟠',
    activities: [
      { time: 'Morning',   detail: 'Drive through the Luberon — lavender and vineyard countryside' },
      { time: 'Mid-morn.', detail: 'Roussillon — village built from red and orange ochre rock, hike the Ochre Trail' },
      { time: 'Afternoon', detail: 'Continue through Luberon villages, drive to Avignon' },
      { time: 'Evening',   detail: 'Arrive Avignon (Loup\'s hometown!) — check in inside the walled city' }
    ]
  },
  {
    date: '2026-07-27', dow: 'Monday', title: 'Avignon', emoji: '🏰',
    activities: [
      { time: 'Morning',   detail: 'Palais des Papes — largest Gothic palace in Europe, where the Pope lived in the 1300s' },
      { time: 'Midday',    detail: 'Walk the Pont d\'Avignon bridge — yes, the one from the French children\'s song' },
      { time: 'Afternoon', detail: 'Explore the medieval walled city — ramparts, markets, hidden squares' },
      { time: 'Evening',   detail: 'Avignon Theater Festival runs all July — check for a show' }
    ]
  },
  {
    date: '2026-07-28', dow: 'Tuesday', title: 'Arles + Les Baux', emoji: '🏛️',
    activities: [
      { time: 'Morning',   detail: 'Arles (30 min south) — UNESCO Roman city, 2,000-year-old amphitheater still in use' },
      { time: 'Mid-morn.', detail: 'Van Gogh\'s Yellow House site, Roman Theater ruins' },
      { time: 'Afternoon', detail: 'Les Baux-de-Provence — medieval fortress on a rocky cliff, sweeping valley views' },
      { time: 'Evening',   detail: 'Return to Avignon — last night in Provence' }
    ]
  },
  {
    date: '2026-07-29', dow: 'Wednesday', title: 'TGV to Paris', emoji: '🚄',
    activities: [
      { time: 'Morning',   detail: 'Return rental car in Avignon, head to Avignon Centre train station' },
      { time: 'Train',     detail: 'TGV to Paris Gare de Lyon — ~2h 40min at 186mph' },
      { time: 'Afternoon', detail: 'Arrive Paris — check in to hotel' },
      { time: 'Evening',   detail: 'Walk along the Seine, dinner at a classic Parisian brasserie' }
    ]
  },
  {
    date: '2026-07-30', dow: 'Thursday', title: 'Paris', emoji: '🗼',
    activities: [
      { time: 'All day',  detail: 'Paris at your own pace' },
      { time: 'Option',   detail: 'Eiffel Tower, the Louvre, Musée d\'Orsay (impressionist art — great after Van Gogh country)' },
      { time: 'Option',   detail: 'Montmartre neighborhood, Sacré-Cœur, artists\' quarter' },
      { time: 'Evening',  detail: 'Last dinner in France — make it a good one' }
    ]
  },
  {
    date: '2026-07-31', dow: 'Friday', title: 'Paris → CDG Hotel', emoji: '🛏️',
    activities: [
      { time: 'Daytime',   detail: 'Any remaining sights, souvenir shopping' },
      { time: 'Afternoon', detail: 'RER B train or shuttle to Charles de Gaulle Airport area' },
      { time: 'Evening',   detail: 'Check in to CDG airport hotel (Sheraton or Pullman — connected to Terminal 2)' },
      { time: 'Note',      detail: 'You need to be at the terminal by 6am tomorrow — sleeping here is essential' }
    ]
  },
  {
    date: '2026-08-01', dow: 'Saturday', title: 'Fly Home', emoji: '🏠',
    activities: [
      { time: '8:10 AM',  detail: 'Depart Paris CDG → London Heathrow (AA7216, British Airways)' },
      { time: '8:35 AM',  detail: 'Arrive London Heathrow, short connection' },
      { time: '11:35 AM', detail: 'Depart London → San Diego (AA6989, British Airways)' },
      { time: '2:55 PM',  detail: 'Land San Diego — home with stories for a lifetime' }
    ]
  }
];

// ============================================================
// STATE
// ============================================================

const STORAGE_KEY = 'france2026_v1';
const PIN_SECRET  = '1261';
const DEPARTURE   = new Date('2026-07-17T15:00:00');

let state        = {};
let catExpanded  = {};
let itinExpanded = {};
let proposalUnlocked = sessionStorage.getItem('f26_unlocked') === '1';
let pendingUnlockCatId = null;
let pinBuffer    = '';
let openDrawerTaskId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved  = JSON.parse(raw);
      state        = saved.state        || {};
      catExpanded  = saved.catExpanded  || {};
      itinExpanded = saved.itinExpanded || {};
    }
  } catch (e) { /* ignore parse errors */ }

  // Seed defaults for tasks not yet in state
  CATEGORIES.forEach(cat => {
    if (catExpanded[cat.id] === undefined) catExpanded[cat.id] = false;
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
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, catExpanded, itinExpanded }));
}

// ============================================================
// HELPERS
// ============================================================

function getDueBadge(dueDate) {
  if (!dueDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dueDate + 'T00:00:00');
  const diff  = Math.round((due - today) / 86400000);
  const fmt   = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0)   return { cls: 'due-over', label: `Overdue · ${fmt}` };
  if (diff <= 14) return { cls: 'due-soon', label: `Due ${fmt}` };
  return { cls: 'due-ok', label: fmt };
}

function getDueDotClass(dueDate) {
  if (!dueDate) return 'ok';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dueDate + 'T00:00:00');
  const diff  = Math.round((due - today) / 86400000);
  if (diff < 0)   return 'over';
  if (diff <= 14) return 'soon';
  return 'ok';
}

function statusLabel(s) {
  const map = { 'not-started': 'Not Started', 'in-progress': 'In Progress', 'booked': 'Booked', 'done': 'Done' };
  return map[s] || s;
}

function fmtCost(n) {
  return n > 0 ? `$${n.toLocaleString()}` : '';
}

function allTasks() {
  return CATEGORIES.flatMap(c => c.tasks);
}

function incompleteTasksSortedByDue() {
  return allTasks()
    .filter(t => state[t.id]?.status !== 'done' && t.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function isProposalTask(taskId) {
  return CATEGORIES.find(c => c.id === 'proposal')?.tasks.some(t => t.id === taskId);
}

// ============================================================
// RENDER: Countdown + Stats
// ============================================================

function renderCountdown() {
  const now  = new Date();
  const diff = Math.ceil((DEPARTURE - now) / 86400000);
  const el   = document.getElementById('topbar-countdown');
  if (el) el.textContent = diff > 0 ? `${diff} days` : 'Bon voyage!';

  const statDays = document.getElementById('stat-days');
  if (statDays) {
    statDays.textContent = diff > 0 ? `${diff} days to departure` : 'Trip is here!';
  }
}

// ============================================================
// RENDER: Hero (ring + next up)
// ============================================================

function renderHero() {
  const tasks = allTasks();
  const total = tasks.length;
  const done  = tasks.filter(t => state[t.id]?.status === 'done').length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  // Animate ring
  const circumference = 2 * Math.PI * 40; // ~251.33
  const offset = circumference * (1 - pct / 100);
  const ring = document.getElementById('ring-fill');
  if (ring) ring.style.strokeDashoffset = offset;
  const pctEl = document.getElementById('ring-pct');
  const subEl = document.getElementById('ring-sub');
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (subEl) subEl.textContent = `${done} / ${total}`;

  // Next 3 upcoming tasks
  const upcoming = incompleteTasksSortedByDue().slice(0, 3);
  const listEl   = document.getElementById('next-up-list');
  if (!listEl) return;

  if (upcoming.length === 0) {
    const div = document.createElement('div');
    div.className = 'next-up-empty';
    div.textContent = 'All tasks complete!';
    listEl.replaceChildren(div);
    return;
  }

  const fragment = document.createDocumentFragment();
  upcoming.forEach(t => {
    const badge       = getDueBadge(t.dueDate);
    const dot         = getDueDotClass(t.dueDate);
    const displayName = (isProposalTask(t.id) && !proposalUnlocked) ? 'Pre-Trip item' : t.title;

    const item = document.createElement('div');
    item.className = 'next-up-item';

    const dotEl = document.createElement('div');
    dotEl.className = `next-up-dot ${dot}`;

    const textEl = document.createElement('div');
    textEl.className = 'next-up-text';

    const nameEl = document.createElement('div');
    nameEl.className = 'next-up-name';
    nameEl.textContent = displayName;

    const dateEl = document.createElement('div');
    dateEl.className = `next-up-date ${dot}`;
    dateEl.textContent = badge ? badge.label : '';

    textEl.appendChild(nameEl);
    textEl.appendChild(dateEl);
    item.appendChild(dotEl);
    item.appendChild(textEl);
    fragment.appendChild(item);
  });
  listEl.replaceChildren(fragment);
}

// ============================================================
// RENDER: Budget stats
// ============================================================

function renderBudget() {
  let totalEst = 0, totalActual = 0;
  allTasks().forEach(t => {
    totalEst    += t.estimatedCost    || 0;
    totalActual += state[t.id]?.actualCost || 0;
  });
  const el = document.getElementById('stat-budget');
  if (!el) return;
  el.textContent = '';
  if (totalActual > 0) {
    const strong = document.createElement('strong');
    strong.textContent = `$${totalActual.toLocaleString()}`;
    el.appendChild(strong);
    el.appendChild(document.createTextNode(` spent · $${totalEst.toLocaleString()} est.`));
  } else {
    const strong = document.createElement('strong');
    strong.textContent = `$${totalEst.toLocaleString()}`;
    el.appendChild(strong);
    el.appendChild(document.createTextNode(' estimated total'));
  }
}

// ============================================================
// RENDER: To-Do categories
// ============================================================

function renderCategories() {
  const container = document.getElementById('categories-list');
  if (!container) return;

  const html = CATEGORIES.map(cat => {
    const tasks     = cat.tasks;
    const doneCount = tasks.filter(t => state[t.id]?.status === 'done').length;
    const allDone   = doneCount === tasks.length;
    const isOpen    = catExpanded[cat.id];
    const isLocked  = cat.locked && !proposalUnlocked;

    const progressCls = allDone ? 'cat-progress all-done' : 'cat-progress';
    const lockSpan    = cat.locked
      ? `<span class="cat-lock">&#x1F512;</span>`
      : '';

    let bodyHtml;
    if (isLocked) {
      bodyHtml = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Tap the header to unlock this section</div>`;
    } else {
      bodyHtml = tasks.map(task => buildTaskRowHtml(task, cat.id)).join('');
    }

    return `<div class="category-card${isOpen ? ' open' : ''}" data-cat="${esc(cat.id)}">
      <div class="category-header" data-cat-toggle="${esc(cat.id)}">
        <span class="cat-emoji">${cat.emoji}</span>
        <span class="cat-name">${esc(cat.label)}</span>
        ${lockSpan}
        <span class="${progressCls}">${doneCount}/${tasks.length}</span>
        <span class="cat-chevron">&#9662;</span>
      </div>
      <div class="category-body">${bodyHtml}</div>
    </div>`;
  }).join('');

  container.innerHTML = html;
}

function buildTaskRowHtml(task, catId) {
  const s      = state[task.id] || {};
  const isDone = s.status === 'done';
  const badge  = getDueBadge(task.dueDate);

  const estCostStr = task.estimatedCost > 0 ? fmtCost(task.estimatedCost) : '';
  const actCostStr = s.actualCost > 0 ? `Paid: ${fmtCost(s.actualCost)}` : '';
  const costBadge  = actCostStr
    ? `<span class="badge-cost">${esc(actCostStr)}</span><span class="badge-cost">est. ${esc(estCostStr)}</span>`
    : estCostStr
      ? `<span class="badge-cost">${esc(estCostStr)}</span>`
      : '';

  return `<div class="task-row${isDone ? ' done-row' : ''}" data-task="${esc(task.id)}" data-cat="${esc(catId)}">
    <div class="task-check${isDone ? ' checked' : ''}" data-check="${esc(task.id)}" data-cat="${esc(catId)}"></div>
    <div class="task-main">
      <div class="task-title">${esc(task.title)}</div>
      <div class="task-meta">
        <span class="badge-status s-${esc(s.status || 'not-started')}">${esc(statusLabel(s.status || 'not-started'))}</span>
        ${badge ? `<span class="badge-due ${badge.cls}">${esc(badge.label)}</span>` : ''}
        ${costBadge}
      </div>
    </div>
    <span class="task-arrow">&#8250;</span>
  </div>`;
}

// ============================================================
// RENDER: Itinerary
// ============================================================

function renderItinerary() {
  const container = document.getElementById('itinerary-list');
  if (!container) return;

  const html = ITINERARY.map(day => {
    const d      = new Date(day.date + 'T12:00:00');
    const month  = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNum = d.getDate();
    const isOpen = itinExpanded[day.date];

    const activitiesHtml = day.activities.map(a =>
      `<div class="itin-activity">
        <span class="itin-time">${esc(a.time)}</span>
        <span class="itin-detail">${esc(a.detail)}</span>
      </div>`
    ).join('');

    return `<div class="itin-day${isOpen ? ' open' : ''}" data-itin="${esc(day.date)}">
      <div class="itin-header" data-itin-toggle="${esc(day.date)}">
        <div class="itin-date-badge">
          <span class="month">${esc(month)}</span>
          <span class="day-num">${dayNum}</span>
        </div>
        <div class="itin-info">
          <div class="itin-dow">${esc(day.dow)}</div>
          <div class="itin-title">${esc(day.title)}</div>
        </div>
        <span class="itin-emoji">${day.emoji}</span>
        <span class="itin-chevron">&#9662;</span>
      </div>
      <div class="itin-body">${activitiesHtml}</div>
    </div>`;
  }).join('');

  container.innerHTML = html;
}

// ============================================================
// RENDER: Task Detail Drawer
// ============================================================

function openDrawer(taskId) {
  const task = allTasks().find(t => t.id === taskId);
  if (!task) return;
  openDrawerTaskId = taskId;

  const s = state[taskId] || {};

  // Build drawer using DOM methods for user-controlled content
  const content = document.getElementById('drawer-content');
  content.innerHTML = '';

  // Title
  const titleEl = document.createElement('div');
  titleEl.className = 'drawer-title';
  titleEl.textContent = task.title;
  content.appendChild(titleEl);

  // Status field
  const statusField = document.createElement('div');
  statusField.className = 'drawer-field';
  statusField.innerHTML = '<div class="drawer-label">Status</div>';
  const select = document.createElement('select');
  select.className = 'drawer-select';
  select.id = 'drawer-status';
  [
    ['not-started', 'Not Started'],
    ['in-progress',  'In Progress'],
    ['booked',       'Booked'],
    ['done',         'Done ✓']
  ].forEach(([val, lbl]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = lbl;
    if (s.status === val) opt.selected = true;
    select.appendChild(opt);
  });
  statusField.appendChild(select);
  content.appendChild(statusField);

  // Cost field
  const costField = document.createElement('div');
  costField.className = 'drawer-field';
  costField.innerHTML = '<div class="drawer-label">Cost</div>';

  const costRow = document.createElement('div');
  costRow.className = 'cost-row';

  function makeCostInput(id, label, value) {
    const wrap = document.createElement('div');
    const lbl  = document.createElement('div');
    lbl.style.cssText = 'font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;';
    lbl.textContent = label;
    const inputWrap = document.createElement('div');
    inputWrap.className = 'cost-input-wrap';
    const prefix = document.createElement('span');
    prefix.className = 'cost-prefix';
    prefix.textContent = '$';
    const input = document.createElement('input');
    input.className = 'drawer-input';
    input.type = 'number';
    input.id = id;
    input.placeholder = '0';
    input.value = value;
    inputWrap.appendChild(prefix);
    inputWrap.appendChild(input);
    wrap.appendChild(lbl);
    wrap.appendChild(inputWrap);
    return wrap;
  }

  costRow.appendChild(makeCostInput('drawer-est',    'Estimated',    task.estimatedCost || 0));
  costRow.appendChild(makeCostInput('drawer-actual',  'Actual Paid',  s.actualCost || 0));
  costField.appendChild(costRow);
  content.appendChild(costField);

  // Notes field
  const notesField = document.createElement('div');
  notesField.className = 'drawer-field';
  notesField.innerHTML = '<div class="drawer-label">Notes</div>';
  const textarea = document.createElement('textarea');
  textarea.className = 'drawer-textarea';
  textarea.id = 'drawer-notes';
  textarea.placeholder = 'Confirmation numbers, links, decisions…';
  textarea.value = s.notes || '';
  notesField.appendChild(textarea);

  if (task.hint) {
    const hint = document.createElement('div');
    hint.className = 'drawer-hint';
    hint.textContent = task.hint;
    hint.style.whiteSpace = 'pre-wrap';
    notesField.appendChild(hint);
  }

  content.appendChild(notesField);

  // Save & Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'drawer-close';
  closeBtn.id = 'drawer-close-btn';
  closeBtn.textContent = 'Save & Close';
  content.appendChild(closeBtn);

  document.getElementById('drawer-overlay').classList.remove('hidden');
}

function closeDrawer() {
  if (!openDrawerTaskId) return;

  const status = document.getElementById('drawer-status')?.value;
  const estVal  = parseFloat(document.getElementById('drawer-est')?.value)    || 0;
  const actVal  = parseFloat(document.getElementById('drawer-actual')?.value) || 0;
  const notes   = document.getElementById('drawer-notes')?.value || '';

  // Persist estimated cost change for the session
  const task = allTasks().find(t => t.id === openDrawerTaskId);
  if (task) task.estimatedCost = estVal;

  state[openDrawerTaskId] = { ...state[openDrawerTaskId], status, actualCost: actVal, notes };
  saveState();

  document.getElementById('drawer-overlay').classList.add('hidden');
  openDrawerTaskId = null;
  renderAll();
}

// ============================================================
// PIN MODAL
// ============================================================

function showPinModal(catId) {
  pendingUnlockCatId = catId;
  pinBuffer = '';
  updatePinDots();
  document.getElementById('pin-error').classList.add('hidden');
  document.getElementById('pin-overlay').classList.remove('hidden');
}

function hidePinModal() {
  document.getElementById('pin-overlay').classList.add('hidden');
  pendingUnlockCatId = null;
  pinBuffer = '';
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`d${i}`);
    if (dot) dot.classList.toggle('filled', i < pinBuffer.length);
  }
}

function handlePinKey(k) {
  if (k === 'cancel') { hidePinModal(); return; }
  if (k === 'del')    { pinBuffer = pinBuffer.slice(0, -1); updatePinDots(); return; }
  if (pinBuffer.length >= 4) return;
  pinBuffer += k;
  updatePinDots();
  if (pinBuffer.length === 4) {
    setTimeout(() => {
      if (pinBuffer === PIN_SECRET) {
        proposalUnlocked = true;
        sessionStorage.setItem('f26_unlocked', '1');
        hidePinModal();
        if (pendingUnlockCatId) {
          catExpanded[pendingUnlockCatId] = true;
          saveState();
        }
        renderAll();
      } else {
        document.getElementById('pin-error').classList.remove('hidden');
        pinBuffer = '';
        updatePinDots();
      }
    }, 150);
  }
}

// ============================================================
// EVENT DELEGATION
// ============================================================

function setupEvents() {
  document.addEventListener('click', e => {
    // Category toggle
    const catToggle = e.target.closest('[data-cat-toggle]');
    if (catToggle) {
      const catId = catToggle.dataset.catToggle;
      const cat   = CATEGORIES.find(c => c.id === catId);
      if (cat?.locked && !proposalUnlocked) { showPinModal(catId); return; }
      catExpanded[catId] = !catExpanded[catId];
      saveState();
      renderCategories();
      return;
    }

    // Checkbox quick-toggle
    const checkEl = e.target.closest('[data-check]');
    if (checkEl) {
      e.stopPropagation();
      const taskId = checkEl.dataset.check;
      const catId  = checkEl.dataset.cat;
      const cat    = CATEGORIES.find(c => c.id === catId);
      if (cat?.locked && !proposalUnlocked) { showPinModal(catId); return; }
      const cur = state[taskId]?.status;
      state[taskId] = { ...state[taskId], status: cur === 'done' ? 'not-started' : 'done' };
      saveState();
      renderAll();
      return;
    }

    // Task row → open drawer
    const taskRow = e.target.closest('[data-task]');
    if (taskRow && !e.target.closest('[data-check]')) {
      const taskId = taskRow.dataset.task;
      const catId  = taskRow.dataset.cat;
      const cat    = CATEGORIES.find(c => c.id === catId);
      if (cat?.locked && !proposalUnlocked) { showPinModal(catId); return; }
      openDrawer(taskId);
      return;
    }

    // Itinerary day toggle
    const itinToggle = e.target.closest('[data-itin-toggle]');
    if (itinToggle) {
      const date = itinToggle.dataset.itinToggle;
      itinExpanded[date] = !itinExpanded[date];
      saveState();
      renderItinerary();
      return;
    }

    // Drawer close button or overlay backdrop
    if (e.target.id === 'drawer-close-btn') { closeDrawer(); return; }
    if (e.target === document.getElementById('drawer-overlay')) { closeDrawer(); return; }

    // PIN keypad
    const keyEl = e.target.closest('[data-k]');
    if (keyEl) { handlePinKey(keyEl.dataset.k); return; }

    // PIN overlay backdrop
    if (e.target === document.getElementById('pin-overlay')) { hidePinModal(); }
  });
}

// ============================================================
// RENDER ALL
// ============================================================

function renderAll() {
  renderCountdown();
  renderHero();
  renderBudget();
  renderCategories();
  renderItinerary();
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupEvents();
  renderAll();
  setInterval(renderCountdown, 60000);
});
