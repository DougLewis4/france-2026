// ============================================================
// DATA: Categories + Tasks
// ============================================================
const CATEGORIES = [
  {
    id: 'booked',
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
    id: 'transport',
    label: 'Transportation',
    locked: false,
    tasks: [
      { id: 'trans-car', title: 'Rental car: Nice Airport → Avignon (Jul 18–29)', dueDate: '2026-05-30', estimatedCost: 800, defaultStatus: 'not-started', hint: 'One-way rental, 11 days. July is peak Provence season — book by May or prices spike.\nSearch "one-way car rental Nice to Avignon" on AutoEurope, Europcar, or Hertz.' },
      { id: 'trans-tgv', title: 'TGV train: Avignon → Paris (Jul 29)', dueDate: '2026-04-30', estimatedCost: 120, defaultStatus: 'not-started', hint: 'Book NOW — advance tickets are much cheaper and trains fill up fast.\nBook at sncf-connect.com or Rail Europe. Avignon Centre station → Paris Gare de Lyon. ~2h 40min.' },
      { id: 'trans-ferry', title: 'Porquerolles ferry (Jul 22)', dueDate: '2026-07-01', estimatedCost: 40, defaultStatus: 'not-started', hint: '20-min ferry from La Tour Fondue port near Hyères.\nCheck schedule closer to date — usually no advance booking needed in summer.' },
      { id: 'trans-cdg', title: 'Transport to CDG airport hotel (Jul 31)', dueDate: '2026-06-30', estimatedCost: 30, defaultStatus: 'not-started', hint: 'RER B train from central Paris to CDG, or the hotel shuttle if staying at a terminal-connected hotel.' }
    ]
  },
  {
    id: 'hotels',
    label: 'Hotels',
    locked: false,
    tasks: [
      { id: 'hotel-sanary', title: 'Sanary-sur-Mer — 4 nights (Jul 18–22)', dueDate: '2026-05-15', estimatedCost: 800, defaultStatus: 'not-started', hint: 'Near the wedding venue (Toulon area). Check with Loup about group Airbnb options.\nHotels: Ibis Budget Toulon, OKKO Hotels, Grand Hotel Dauphine, Best Western Plus La Corniche. Group options: $59–$125/person/night.' },
      { id: 'hotel-aix', title: 'Aix-en-Provence — 2 nights (Jul 22–24)', dueDate: '2026-06-01', estimatedCost: 400, defaultStatus: 'not-started', hint: 'Stay near Cours Mirabeau or in the Mazarin district for the best experience.' },
      { id: 'hotel-verdon', title: 'Verdon Gorge area — 2 nights (Jul 24–25)', dueDate: '2026-06-01', estimatedCost: 400, defaultStatus: 'not-started', hint: 'Stay in Moustiers-Sainte-Marie — a beautiful perched village right at the gorge entrance. Fills up fast in July.' },
      { id: 'hotel-avignon', title: 'Avignon — 3 nights (Jul 26–28)', dueDate: '2026-06-01', estimatedCost: 600, defaultStatus: 'not-started', hint: 'Stay inside the medieval walled city for best atmosphere.\nAvignon Theater Festival runs all July — hotels book out early!' },
      { id: 'hotel-paris', title: 'Paris — 2 nights (Jul 29–30)', dueDate: '2026-06-01', estimatedCost: 500, defaultStatus: 'not-started', hint: 'Central arrondissements (1st, 6th, 7th, 8th) for walkability to major sights.' },
      { id: 'hotel-cdg', title: 'CDG Airport hotel — 1 night (Jul 31)', dueDate: '2026-06-01', estimatedCost: 200, defaultStatus: 'not-started', hint: 'Essential — your flight departs 8:10am Aug 1, must be at terminal by ~6am.\nSheraton CDG or Pullman CDG are directly connected to Terminal 2.' }
    ]
  },
  {
    id: 'wedding',
    label: 'Wedding',
    locked: false,
    tasks: [
      { id: 'wed-rsvp', title: 'RSVP to Seb and Paula', dueDate: '2026-05-01', estimatedCost: 0, defaultStatus: 'not-started', hint: 'Check the wedding website for the RSVP deadline.' },
      { id: 'wed-boat', title: "Confirm boat trip spot with Loup (Jul 21, 9am–1pm)", dueDate: '2026-06-01', estimatedCost: 0, defaultStatus: 'not-started', hint: 'Loup organized a group boat trip from Sanary on Tuesday Jul 21, 9am–1pm. Reach out directly to confirm your spot.' },
      { id: 'wed-gift', title: 'Wedding gift for Seb and Paula', dueDate: '2026-07-01', estimatedCost: 200, defaultStatus: 'not-started', hint: 'Consider shipping ahead to avoid carrying it on the plane. Check if they have a registry.' },
      { id: 'wed-attire', title: 'Wedding attire', dueDate: '2026-06-15', estimatedCost: 200, defaultStatus: 'not-started', hint: 'July in southern France averages 85–95F. Plan light, breathable formal wear.\nConfirm dress code with Seb or Loup.' }
    ]
  },
  {
    id: 'admin',
    label: 'Trip Admin',
    locked: false,
    tasks: [
      { id: 'adm-passport', title: 'Check passport expiry date', dueDate: '2026-04-30', estimatedCost: 0, defaultStatus: 'not-started', hint: 'Must be valid at least 6 months past Aug 1, 2026 — meaning valid through February 2027.' },
      { id: 'adm-insurance', title: 'Travel insurance', dueDate: '2026-06-01', estimatedCost: 150, defaultStatus: 'not-started', hint: 'Covers trip cancellation, medical emergencies, and lost luggage. Compare on InsureMyTrip or Squaremouth.' },
      { id: 'adm-bank', title: 'Notify bank of travel dates', dueDate: '2026-07-10', estimatedCost: 0, defaultStatus: 'not-started', hint: "Tell your bank and credit card companies you'll be in France Jul 17–Aug 1 to prevent fraud blocks on your card." },
      { id: 'adm-idp', title: 'International Driving Permit (IDP)', dueDate: '2026-06-01', estimatedCost: 20, defaultStatus: 'not-started', hint: 'Required in France alongside your US license. Get one at any AAA office for about $20.' },
      { id: 'adm-maps', title: 'Download offline maps for Provence', dueDate: '2026-07-10', estimatedCost: 0, defaultStatus: 'not-started', hint: 'In Google Maps: search the Provence region, tap the 3 dots, then Download offline map. Works without signal.' },
      { id: 'adm-phone', title: 'Set up international phone plan', dueDate: '2026-07-10', estimatedCost: 50, defaultStatus: 'not-started', hint: 'Check with your carrier. T-Mobile includes free international data. AT&T/Verizon offer day passes (~$10/day).' },
      { id: 'adm-euros', title: 'Get Euros', dueDate: '2026-07-15', estimatedCost: 300, defaultStatus: 'not-started', hint: "Small towns and markets sometimes don't take cards.\nBest rate: withdraw from a bank ATM in France. Avoid airport exchange booths." }
    ]
  }
];

const ITINERARY = [
  { date: '2026-07-17', dow: 'Friday',    title: 'Departure Day',             stop: 'San Diego → Paris',     photo: 'images/san-diego.avif', activities: [
    { time: '3:00 PM',  detail: 'Depart San Diego (SAN → LAX, Delta DL4002)' },
    { time: '4:05 PM',  detail: 'Arrive Los Angeles' },
    { time: '6:05 PM',  detail: 'Depart LAX → Paris CDG (overnight flight)' }
  ]},
  { date: '2026-07-18', dow: 'Saturday',  title: 'Arrival in France',         stop: 'Nice → Sanary-sur-Mer', photo: 'images/sanary.jpg', activities: [
    { time: '1:50 PM',  detail: 'Land Paris CDG' },
    { time: '3:25 PM',  detail: 'Connecting flight CDG → Nice' },
    { time: '5:05 PM',  detail: 'Land Nice — pick up rental car' },
    { time: '~6:30 PM', detail: 'Drive 1 hour west to Sanary-sur-Mer' },
    { time: 'Evening',  detail: 'Check in, light dinner at the harbor, rest up' }
  ]},
  { date: '2026-07-19', dow: 'Sunday',    title: 'Sebastian & Paula Wedding', stop: 'Toulon area', photo: 'images/toulon.webp', activities: [
    { time: 'Morning',   detail: 'Rest and get ready' },
    { time: 'Afternoon', detail: 'Wedding ceremony near Toulon / Le Mourillon' },
    { time: 'Evening',   detail: 'Celebrate! Cheers to Seb and Paula' }
  ]},
  { date: '2026-07-20', dow: 'Monday',    title: 'Sanary Brunch + Calanques', stop: 'Cassis',      photo: 'images/cassis.jpg', activities: [
    { time: 'Morning',      detail: 'Brunch in Sanary-sur-Mer — colorful fishing village, Provençal market by the sea' },
    { time: 'Afternoon',    detail: 'Drive to Cassis (~45 min) — pastel harbor town, seafood, famous local white wine' },
    { time: 'Late aftern.', detail: 'Explore the Calanques — secret turquoise coves between white limestone cliffs' }
  ]},
  { date: '2026-07-21', dow: 'Tuesday',   title: 'Boat Trip + Calanques',     stop: 'Sanary',      photo: 'images/sanary.jpg', activities: [
    { time: '9:00 AM',   detail: "Boat trip from Sanary (Loup's organized trip) — sailing the Mediterranean coast" },
    { time: '1:00 PM',   detail: 'Back in Sanary for lunch' },
    { time: 'Afternoon', detail: 'Cassis or Calanques for more swimming and exploring' },
    { time: 'Evening',   detail: 'Dinner at Sanary harbor' }
  ]},
  { date: '2026-07-22', dow: 'Wednesday', title: 'Porquerolles + Bandol + Aix', stop: 'Porquerolles', photo: 'images/porquerolles.jpg', activities: [
    { time: 'Morning',    detail: 'Drive to La Tour Fondue port near Hyères' },
    { time: '~9:30 AM',  detail: 'Take 20-min ferry to Porquerolles (car-free island)' },
    { time: 'All day',    detail: 'Rent bikes, swim at Plage Notre-Dame (tropical white sand + turquoise water)' },
    { time: 'Late aftern.', detail: 'Ferry back — brief stop at Le Castellet, the medieval hilltop village above the Bandol vineyards' },
    { time: '~4:30 PM',  detail: 'Bandol wine tasting — the rosé capital of Provence, vineyards on the sea' },
    { time: 'Evening',    detail: 'Drive to Aix-en-Provence (~45 min), check in, evening stroll on Cours Mirabeau' }
  ]},
  { date: '2026-07-23', dow: 'Thursday',  title: 'Aix-en-Provence', stop: 'Aix-en-Provence', photo: 'images/aix-en-provence.jpg', activities: [
    { time: 'Morning',    detail: "Aix morning market — one of the best in Provence, held on Cours Mirabeau and Place Richelme" },
    { time: 'Mid-morn.',  detail: "Mazarin district — 17th-century aristocratic quarter, elegant mansions, quiet fountained squares" },
    { time: 'Afternoon',  detail: "Cézanne's studio (Atelier Cézanne) — the painter lived here and was inspired by Mont Sainte-Victoire, visible from the city" },
    { time: 'Evening',    detail: "Long dinner on Cours Mirabeau — Provence's grand boulevard lined with plane trees, fountains, and cafés" }
  ]},
  { date: '2026-07-24', dow: 'Friday',    title: 'Aix + Valensole Lavender',  stop: 'Valensole',   photo: 'images/valensole.jpg', activities: [
    { time: 'Morning',    detail: "Explore Aix-en-Provence — Mazarin district, Cézanne's studio, morning market" },
    { time: 'Afternoon',  detail: 'Drive 1.5 hrs northeast to Valensole Plateau — peak July lavender bloom' },
    { time: 'Sunset',     detail: 'Golden hour in the lavender fields — one of the most beautiful sights in France' },
    { time: 'Evening',    detail: 'Drive to Verdon Gorge area, check in near Moustiers-Sainte-Marie' }
  ]},
  { date: '2026-07-25', dow: 'Saturday',  title: 'Gorges du Verdon',          stop: 'Verdon',      photo: 'images/verdon.jpg', activities: [
    { time: 'Morning',   detail: 'Drive the cliff-edge Route des Crêtes for dramatic gorge views' },
    { time: 'Afternoon', detail: 'Kayak or electric boat on Lac de Sainte-Croix at the gorge base' },
    { time: 'Option',    detail: 'Hike the Sentier Martel trail along the canyon floor' }
  ]},
  { date: '2026-07-26', dow: 'Sunday',    title: 'Luberon + Roussillon',      stop: 'Avignon',     photo: 'images/luberon.jpg', activities: [
    { time: 'Morning',   detail: 'Drive through the Luberon — lavender and vineyard countryside' },
    { time: 'Mid-morn.', detail: 'Roussillon — village built from red and orange ochre rock, hike the Ochre Trail' },
    { time: 'Afternoon', detail: 'Continue through Luberon villages, drive to Avignon' },
    { time: 'Evening',   detail: "Arrive Avignon (Loup's hometown!) — check in inside the walled city" }
  ]},
  { date: '2026-07-27', dow: 'Monday',    title: 'Avignon',                    stop: 'Avignon',     photo: 'images/avignon.webp', activities: [
    { time: 'Morning',   detail: 'Palais des Papes — largest Gothic palace in Europe, where the Pope lived in the 1300s' },
    { time: 'Midday',    detail: "Walk the Pont d'Avignon bridge — yes, the one from the French children's song" },
    { time: 'Afternoon', detail: 'Explore the medieval walled city — ramparts, markets, hidden squares' },
    { time: 'Evening',   detail: 'Avignon Theater Festival runs all July — check for a show' }
  ]},
  { date: '2026-07-28', dow: 'Tuesday',   title: 'Arles + Les Baux',           stop: 'Avignon',     photo: 'images/les-baux.jpg', activities: [
    { time: 'Morning',   detail: 'Arles (30 min south) — UNESCO Roman city, 2,000-year-old amphitheater still in use' },
    { time: 'Mid-morn.', detail: "Van Gogh's Yellow House site, Roman Theater ruins" },
    { time: 'Afternoon', detail: 'Les Baux-de-Provence — medieval fortress on a rocky cliff, sweeping valley views' },
    { time: 'Evening',   detail: 'Return to Avignon — last night in Provence' }
  ]},
  { date: '2026-07-29', dow: 'Wednesday', title: 'TGV to Paris',               stop: 'Paris',       photo: 'images/paris.jpg', activities: [
    { time: 'Morning',   detail: 'Return rental car in Avignon, head to Avignon Centre train station' },
    { time: 'Train',     detail: 'TGV to Paris Gare de Lyon — ~2h 40min at 186mph' },
    { time: 'Afternoon', detail: 'Arrive Paris — check in to hotel' },
    { time: 'Evening',   detail: 'Walk along the Seine, dinner at a classic Parisian brasserie' }
  ]},
  { date: '2026-07-30', dow: 'Thursday',  title: 'Paris',                      stop: 'Paris',       photo: 'images/paris.jpg', activities: [
    { time: 'All day',  detail: 'Paris at your own pace' },
    { time: 'Option',   detail: "Eiffel Tower, the Louvre, Musée d'Orsay (impressionist art — great after Van Gogh country)" },
    { time: 'Option',   detail: "Montmartre neighborhood, Sacré-Cœur, artists' quarter" },
    { time: 'Evening',  detail: 'Last dinner in France — make it a good one' }
  ]},
  { date: '2026-07-31', dow: 'Friday',    title: 'Paris → CDG Hotel',          stop: 'CDG',         photo: 'images/paris.jpg', activities: [
    { time: 'Daytime',   detail: 'Any remaining sights, souvenir shopping' },
    { time: 'Afternoon', detail: 'RER B train or shuttle to Charles de Gaulle Airport area' },
    { time: 'Evening',   detail: 'Check in to CDG airport hotel (Sheraton or Pullman — connected to Terminal 2)' },
    { time: 'Note',      detail: 'You need to be at the terminal by 6am tomorrow — sleeping here is essential' }
  ]},
  { date: '2026-08-01', dow: 'Saturday',  title: 'Fly Home',                   stop: 'San Diego',   photo: 'images/san-diego.avif', activities: [
    { time: '8:10 AM',  detail: 'Depart Paris CDG → London Heathrow (AA7216, British Airways)' },
    { time: '8:35 AM',  detail: 'Arrive London Heathrow, short connection' },
    { time: '11:35 AM', detail: 'Depart London → San Diego (AA6989, British Airways)' },
    { time: '2:55 PM',  detail: 'Land San Diego — home with stories for a lifetime' }
  ]}
];

// ============================================================
// RESTAURANT STOPS  (skip Jul 17, 18, Aug 1 — travel days)
// ============================================================
const RESTAURANT_STOPS = [
  { id: 'sanary',  label: 'Sanary & The Coast',          dates: ['2026-07-19','2026-07-20','2026-07-21','2026-07-22'] },
  { id: 'aix',     label: 'Aix-en-Provence & Valensole', dates: ['2026-07-22','2026-07-23','2026-07-24'] },
  { id: 'verdon',  label: 'Gorges du Verdon',            dates: ['2026-07-25'] },
  { id: 'avignon', label: 'Avignon & Surrounds',         dates: ['2026-07-26','2026-07-27','2026-07-28'] },
  { id: 'paris',   label: 'Paris',                       dates: ['2026-07-29','2026-07-30','2026-07-31'] },
];

const MEAL_SKIP_DAYS = new Set(['2026-07-17','2026-07-18','2026-08-01']);

// ============================================================
// MAP STOPS  (France only, in route order)
// ============================================================
const MAP_STOPS = [
  { label: 'Sanary-sur-Mer',   sub: 'Jul 18–22 · Coast & Wedding',  lat: 43.1175, lng: 5.8011  },
  { label: 'Aix-en-Provence',  sub: 'Jul 23–24',                     lat: 43.5297, lng: 5.4474  },
  { label: 'Valensole',        sub: 'Jul 24 · Lavender Fields',       lat: 43.8368, lng: 6.0134  },
  { label: 'Gorges du Verdon', sub: 'Jul 25',                         lat: 43.7726, lng: 6.3494  },
  { label: 'Avignon',          sub: 'Jul 26–28',                      lat: 43.9493, lng: 4.8055  },
  { label: 'Paris',            sub: 'Jul 29–31',                      lat: 48.8566, lng: 2.3522  },
];

// ============================================================
// HOUSING STOPS
// ============================================================
const HOUSING_STOPS = [
  { id: 'sanary',  label: 'Sanary-sur-Mer',     checkIn: '2026-07-18', checkOut: '2026-07-22', nights: 4, taskId: 'hotel-sanary',
    recommendations: [
      { name: 'Hostellerie La Farandole',      tier: 'Luxury',    note: 'Right on the beach · pool · sea views · ~$250/night', url: 'https://www.hostellerielafarandole.com/en' },
      { name: 'Le Synaya',                     tier: 'Mid-range', note: 'Harbor views · great breakfast · popular with couples', url: 'https://www.hotelsynaya.com/' },
      { name: 'Adonis Grand Hôtel des Bains',  tier: 'Mid-range', note: '3★ · park setting · 2-min walk to beach · ~$106/night', url: 'https://www.adonis-sanary.com/en/adonis-sanary-sur-mer-hotel/' },
      { name: 'Best Western Plus Sanary',      tier: 'Budget',    note: 'Reliable chain · solid value for 4 nights', url: 'https://www.booking.com/hotel/fr/best-western-plus-le-moderne.html' },
    ]
  },
  { id: 'aix',     label: 'Aix-en-Provence',    checkIn: '2026-07-22', checkOut: '2026-07-24', nights: 2, taskId: 'hotel-aix',
    recommendations: [
      { name: "La Maison d'Aix",               tier: 'Luxury',    note: 'Mazarin quarter · pool & hammam · called "most romantic hotel in France"', url: 'https://www.lamaisondaix.com/en/home' },
      { name: 'Boutique Hotel Cézanne',        tier: 'Mid-range', note: 'Mazarin district · sun terrace · acclaimed breakfast · near Cours Mirabeau', url: 'https://boutiquehotelcezanne.com/en/' },
      { name: 'Hotel Les Augustins',           tier: 'Mid-range', note: 'Set inside a 12th-century convent · just off Cours Mirabeau', url: 'https://hotel-augustins.com/en/home/' },
      { name: 'Grand Hôtel Roi René MGallery', tier: 'Mid-range', note: '4★ · 5-min walk to Cours Mirabeau · outdoor heated pool', url: 'https://www.grandhotelroirene-aixenprovence.com/' },
    ]
  },
  { id: 'verdon',  label: 'Verdon / Moustiers', checkIn: '2026-07-24', checkOut: '2026-07-26', nights: 2, taskId: 'hotel-verdon',
    recommendations: [
      { name: 'La Bastide de Moustiers',       tier: 'Luxury',    note: 'Maison Ducasse hotel · 1-star Michelin restaurant · book early, fills fast', url: 'https://www.bastide-moustiers.com/en/' },
      { name: 'Hôtel Les Restanques',          tier: 'Mid-range', note: '3★ · at the gorge entrance · heated pool · Nordic bath · terraces', url: 'https://www.hotel-les-restanques.com/' },
      { name: 'La Ferme Rose',                 tier: 'Mid-range', note: 'Charming hotel de charme · 9.0 guest rating across 1,300+ reviews', url: 'https://www.lafermerose.com/' },
      { name: 'Hôtel Le Colombier',            tier: 'Budget',    note: 'Pool · spa · romantic vibe · well-reviewed for the price', url: 'https://www.hotelcolombier.com/' },
    ]
  },
  { id: 'avignon', label: 'Avignon',             checkIn: '2026-07-26', checkOut: '2026-07-29', nights: 3, taskId: 'hotel-avignon',
    recommendations: [
      { name: 'La Mirande',                    tier: 'Luxury',    note: 'Steps from Palais des Papes · Michelin restaurant · ~$400–1000/night', url: 'https://www.la-mirande.fr/en/' },
      { name: "Hôtel d'Europe",                tier: 'Luxury',    note: "Avignon's oldest hotel (16th century) · romantic courtyard restaurant", url: 'https://heurope.com/en/' },
      { name: 'Hotel Boquier',                 tier: 'Mid-range', note: 'Inside the walls · 5-min walk to Palais des Papes & train station', url: 'https://www.hotel-boquier.com/en' },
      { name: 'Le Magnan',                     tier: 'Budget',    note: '3★ · inside the ramparts · garden-view rooms · near train station', url: 'https://www.hotel-magnan.com' },
    ]
  },
  { id: 'paris',   label: 'Paris',               checkIn: '2026-07-29', checkOut: '2026-07-31', nights: 2, taskId: 'hotel-paris',
    recommendations: [
      { name: 'Le Narcisse Blanc Hôtel & Spa', tier: 'Luxury',    note: "7th arr. · between Seine & Eiffel Tower · Belle Époque mansion · spa", url: 'https://www.lenarcisseblanc.com/en' },
      { name: 'Le Grand Hôtel Cayré',          tier: 'Mid-range', note: "7th arr. · near Musée d'Orsay · Le Labo toiletries · flexible pricing", url: 'https://www.miirohotels.com/legrandhotelcayre' },
      { name: 'Hôtel Récamier',                tier: 'Mid-range', note: '6th arr. · quiet square in Saint-Germain · steps from Luxembourg Gardens', url: 'https://en.hotelrecamier.com/' },
      { name: 'Hôtel du Cadran',               tier: 'Budget',    note: '7th arr. · near Eiffel Tower · clean, well-located, great value', url: 'https://www.cadranhotel.com/' },
    ]
  },
  { id: 'cdg',     label: 'CDG Airport Hotel',   checkIn: '2026-07-31', checkOut: '2026-08-01', nights: 1, taskId: 'hotel-cdg',
    recommendations: [
      { name: 'Sheraton Paris CDG',            tier: 'Mid-range', note: 'Directly connected to Terminal 2 · walk to check-in · no shuttle needed', url: 'https://www.marriott.com/en-us/hotels/parsi-sheraton-paris-charles-de-gaulle-airport-hotel/overview/' },
      { name: 'Pullman Paris CDG',             tier: 'Mid-range', note: 'Upscale design hotel · 5-min CDGVAL shuttle to all terminals', url: 'https://www.pullmanparisroissycdg.com/en/' },
    ]
  },
];
