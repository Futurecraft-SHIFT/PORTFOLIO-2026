const locations = [
  {
    id: 'yosemite', name: 'YOSEMITE', code: 'YOS · 95389', region: 'SIERRA NEVADA / GRANITE SIGNAL',
    description: 'Where the first line was drawn: a granite mass shaped by altitude, exposure and generations of movement.',
    group: ['north', 'wild'], accent: '#ff4f24', form: 'HALF DOME / GRANITE MASS',
    items: [
      ['Yosemite Carabiner', 'assets/yosemite-carabiner.jpg'],
      ['Chalk Bag', 'assets/yosemite-chalk-bag.jpg'],
      ['Base Camp Chair', 'assets/yosemite-camp-chair.jpg']
    ]
  },
  {
    id: 'tahoe', name: 'LAKE TAHOE', code: 'TKO · 96189', region: 'HIGH SIERRA / ALPINE SIGNAL',
    description: 'Cold blue water held inside the High Sierra—a shifting alpine basin tuned to early light and late departures.',
    group: ['north', 'wild'], accent: '#56e7ff', form: 'ALPINE BASIN / WATERLINE',
    items: [
      ['Alpine Camp Mug', 'assets/lake-tahoe-camp-mug.jpg'],
      ['Trail Cooler', 'assets/lake-tahoe-cooler.jpg'],
      ['Lucky Lake Lure', 'assets/lake-tahoe-lure.jpg']
    ]
  },
  {
    id: 'sanfrancisco', name: 'SAN FRANCISCO', code: 'SFO · 415', region: 'BAY AREA / FOG SIGNAL',
    description: 'Four seasons before lunch. A suspended city signal built from steep streets, rolling fog and a bridge in motion.',
    group: ['north', 'city'], accent: '#ff4f24', form: 'GOLDEN GATE / SUSPENSION',
    items: [
      ['Fog Ready Cup', 'assets/san-francisco-coffee-cup.jpg'],
      ['Fog Ready Poncho', 'assets/san-francisco-poncho.jpg'],
      ['Cable Car Bell', 'assets/san-francisco-bell.jpg']
    ]
  },
  {
    id: 'losangeles', name: 'LOS ANGELES', code: 'L.A. · 90015', region: 'SOUTHERN CA / STREET SIGNAL',
    description: 'A portable studio under permanent sun: vertical city rhythm, long boulevards and palms cutting through the grid.',
    group: ['south', 'city'], accent: '#1238df', form: 'CITY GRID / PALM SIGNAL',
    items: [
      ['City Film Camera', 'assets/los-angeles-camera.jpg'],
      ['Sidewalk Cassette Player', 'assets/los-angeles-cassette-player.jpg'],
      ['Boulevard Waist Pack', 'assets/los-angeles-waist-pack.jpg']
    ]
  },
  {
    id: 'joshuatree', name: 'JOSHUA TREE', code: 'JOS · 92252', region: 'HIGH DESERT / SURVIVAL SIGNAL',
    description: 'Soft light, sharp terrain. Branching desert geometry rises between boulder fields and the night-sky horizon.',
    group: ['south', 'wild'], accent: '#66a628', form: 'JOSHUA FORM / DESERT ROCK',
    items: [
      ['Desert Emergency Kit', 'assets/joshua-tree-emergency-kit.jpg'],
      ['Camp Plate', 'assets/joshua-tree-camp-plate.jpg'],
      ['Trail Shovel', 'assets/joshua-tree-shovel.jpg']
    ]
  },
  {
    id: 'palmsprings', name: 'PALM SPRINGS', code: 'PSP · 92264', region: 'COACHELLA VALLEY / LEISURE SIGNAL',
    description: 'Modernism with the heat turned up: wind fields, solar orbit and engineered leisure at the desert edge.',
    group: ['south', 'city'], accent: '#ff4c9f', form: 'WIND FIELD / SOLAR ORBIT',
    items: [
      ['Desert Cocktail Shaker', 'assets/palm-springs-shaker.jpg'],
      ['Oasis Towel', 'assets/palm-springs-towel.jpg'],
      ['Pool Float', 'assets/palm-springs-pool-float.jpg']
    ]
  }
];

let activeLocation = 0;
let activeItem = 0;
let pointCloud;

const mapPoints = {
  yosemite: [184, 219],
  tahoe: [238, 132],
  sanfrancisco: [101, 245],
  losangeles: [213, 407],
  joshuatree: [276, 395],
  palmsprings: [267, 432]
};
const visitedLocations = new Set();
const routeOrder = [];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function updateRoute() {
  const route = $('#field-route');
  const routeHead = $('#route-head');
  const status = $('#route-status');
  if (!route || !routeOrder.length) return;

  const points = routeOrder.map(id => mapPoints[id].join(',')).join(' ');
  const [headX, headY] = mapPoints[routeOrder[routeOrder.length - 1]];
  route.setAttribute('points', points);
  routeHead.setAttribute('cx', headX);
  routeHead.setAttribute('cy', headY);

  $$('.map-pin').forEach(pin => pin.classList.toggle('is-visited', visitedLocations.has(pin.dataset.location)));
  status.textContent = visitedLocations.size === locations.length
    ? 'ROUTE COMPLETE ✦'
    : `${String(visitedLocations.size).padStart(2, '0')} / 06 FOUND`;

  const length = route.getTotalLength();
  if (length > 0) {
    route.style.transition = 'none';
    route.style.strokeDasharray = `${length}`;
    route.style.strokeDashoffset = `${length}`;
    route.getBoundingClientRect();
    route.style.transition = 'stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)';
    route.style.strokeDashoffset = '0';
  }

  if (visitedLocations.size === locations.length) {
    $('.map-wrap').classList.add('route-complete');
  }
}

function markVisited(id) {
  if (visitedLocations.has(id)) return;
  visitedLocations.add(id);
  routeOrder.push(id);
  updateRoute();
}

document.body.classList.add('is-loading');
window.addEventListener('load', () => {
  window.setTimeout(() => {
    $('.boot').classList.add('is-done');
    document.body.classList.remove('is-loading');
  }, 900);
});

function renderLocation(index, itemIndex = 0) {
  activeLocation = (index + locations.length) % locations.length;
  activeItem = itemIndex;
  const location = locations[activeLocation];
  const pointStage = $('#pointcloud-stage');
  $('.map-experience').style.setProperty('--location-accent', location.accent);
  markVisited(location.id);
  pointStage.classList.add('is-changing');

  $$('.map-pin').forEach(pin => pin.classList.toggle('is-active', pin.dataset.location === location.id));

  window.setTimeout(() => {
    $('#location-index').textContent = `${String(activeLocation + 1).padStart(2, '0')} / 06`;
    $('#location-code').textContent = location.code;
    $('#location-region').textContent = location.region;
    $('#location-name').textContent = location.name;
    $('#location-description').textContent = location.description;
    $('#pointcloud-form').textContent = location.form;
    pointCloud?.setLocation(location.id, location.name);
    pointStage.classList.remove('is-changing');
  }, 170);
}

window.addEventListener('message', event => {
  if (event.data?.type === 'gramicci-location') {
    const nextIndex = Number(event.data.index);
    if (Number.isFinite(nextIndex) && nextIndex !== activeLocation) renderLocation(nextIndex);
  }
    if (event.data?.type === 'gramicci-pointer') {
      pointCloud?.setPointer(Number(event.data.x), Number(event.data.y), event.data.active !== false);
    }
    if (event.data?.type === 'gramicci-drag') {
      pointCloud?.dragBy(Number(event.data.dx) || 0, Number(event.data.dy) || 0);
    }
});

$$('.map-pin').forEach(pin => {
  const choose = () => renderLocation(locations.findIndex(location => location.id === pin.dataset.location));
  const previewLocation = locations.find(location => location.id === pin.dataset.location);
  pin.addEventListener('pointerenter', () => {
    $('.map-experience').style.setProperty('--location-accent', previewLocation.accent);
    $('.map-wrap__label span').textContent = `TUNE: ${previewLocation.code}`;
  });
  pin.addEventListener('pointerleave', () => {
    $('.map-experience').style.setProperty('--location-accent', locations[activeLocation].accent);
    $('.map-wrap__label span').textContent = 'SELECT A SIGNAL';
  });
  pin.addEventListener('click', choose);
  pin.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose();
    }
  });
});

$('#prev-location').addEventListener('click', () => renderLocation(activeLocation - 1));
$('#next-location').addEventListener('click', () => renderLocation(activeLocation + 1));

const allItems = locations.flatMap((location, locationIndex) => location.items.map((item, itemIndex) => ({
  name: item[0], image: item[1], location: location.name, code: location.code, locationIndex, itemIndex,
  groups: location.group, accent: location.accent
})));

const locationTelemetry = {
  yosemite: { coordinates: '37.8651° N / 119.5383° W', environment: 'GRANITE / HIGH WALL / CAMP' },
  tahoe: { coordinates: '39.0968° N / 120.0324° W', environment: 'ALPINE WATER / RIDGELINE / COLD' },
  sanfrancisco: { coordinates: '37.7749° N / 122.4194° W', environment: 'FOG / STEEP STREET / BAY WIND' },
  losangeles: { coordinates: '34.0522° N / 118.2437° W', environment: 'SUN / CITY GRID / SIDEWALK' },
  joshuatree: { coordinates: '34.0119° N / 116.3190° W', environment: 'DESERT / BOULDER / NIGHT SKY' },
  palmsprings: { coordinates: '33.8303° N / 116.5453° W', environment: 'HEAT / POOL / MODERNIST GRID' }
};

const itemProfiles = {
  'Yosemite Carabiner': {
    type: 'CLIMBING HARDWARE / CONNECTION OBJECT', components: ['LOAD BODY', 'SPRING GATE', 'LOCK CHANNEL'],
    mode: 'CONNECT / CARRY / SECURE', summary: 'A compact connection point translated through Yosemite’s granite field signal.',
    note: 'Built around a simple idea: essential equipment should disappear into movement.', metrics: [96, 91, 98, 82]
  },
  'Chalk Bag': {
    type: 'SOFT EQUIPMENT / ACCESS SYSTEM', components: ['STRUCTURED RIM', 'CHALK CHAMBER', 'WAIST WEBBING'],
    mode: 'ACCESS / GRIP / MOVE', summary: 'A wearable access chamber designed around rhythm, reach and the next hold.',
    note: 'The open rim keeps the object ready while the soft body stays close to the climber.', metrics: [97, 88, 91, 61]
  },
  'Base Camp Chair': {
    type: 'CAMP FURNITURE / COLLAPSIBLE SYSTEM', components: ['SEAT SLING', 'FRAME NETWORK', 'CORNER HUBS'],
    mode: 'REST / FOLD / CARRY', summary: 'A low-slung base-camp platform balancing off-grid comfort with a compact footprint.',
    note: 'A recovery object for the hours after the wall and before the next route.', metrics: [72, 84, 77, 69]
  },
  'Alpine Camp Mug': {
    type: 'DRINKWARE / TRAIL VESSEL', components: ['VESSEL BODY', 'CARABINER HANDLE', 'ROLLED RIM'],
    mode: 'POUR / CLIP / WARM', summary: 'A cold-morning vessel with an alpine profile and an integrated carry signal.',
    note: 'Lake-day utility reduced to one volume, one handle and no unnecessary gesture.', metrics: [79, 91, 88, 81]
  },
  'Trail Cooler': {
    type: 'COLD STORAGE / CAMP SYSTEM', components: ['INSULATED SHELL', 'LOCKING LID', 'CARRY HARDWARE'],
    mode: 'LOAD / HOLD / PRESERVE', summary: 'A portable cold block built for long shorelines and departures without a schedule.',
    note: 'The collection’s highest-capacity object: less about speed, more about extending the day.', metrics: [61, 96, 57, 94]
  },
  'Lucky Lake Lure': {
    type: 'FISHING HARDWARE / WATER SIGNAL', components: ['REFLECTIVE BODY', 'SPLIT RING', 'HOOK SYSTEM'],
    mode: 'CAST / FLASH / RETRIEVE', summary: 'A compact reflective signal calibrated for clear water and patient mornings.',
    note: 'Smallest object, highest visual frequency—the archive’s pocket-sized lake transmission.', metrics: [89, 83, 99, 87]
  },
  'Fog Ready Cup': {
    type: 'CITY DRINKWARE / COMMUTE VESSEL', components: ['INSULATED WALL', 'TRAVEL LID', 'GRIP BAND'],
    mode: 'FILL / WALK / REPEAT', summary: 'A portable heat source for steep streets, cold fog and the first transfer of the day.',
    note: 'Designed as a daily ritual object rather than a piece of static camp equipment.', metrics: [94, 82, 90, 84]
  },
  'Fog Ready Poncho': {
    type: 'WEATHER SHELL / PACKABLE COVER', components: ['SHELL FIELD', 'HOOD APERTURE', 'PACK SEAM'],
    mode: 'COVER / VENT / PACK', summary: 'An instant weather volume that turns the Bay Area forecast into background noise.',
    note: 'Maximum coverage with minimum structure: movement remains the dominant system.', metrics: [98, 92, 86, 99]
  },
  'Cable Car Bell': {
    type: 'CAST OBJECT / URBAN SIGNAL', components: ['BELL BODY', 'STRIKER CORE', 'CARRY TAG'],
    mode: 'RING / MARK / SIGNAL', summary: 'A portable piece of San Francisco sound culture recoded as campaign hardware.',
    note: 'Not every essential solves a problem; some announce that you arrived.', metrics: [58, 76, 73, 93]
  },
  'Desert Cocktail Shaker': {
    type: 'BARWARE / MIXING VESSEL', components: ['STEEL VESSEL', 'STRAINER CAP', 'SEAL COLLAR'],
    mode: 'LOAD / SHAKE / POUR', summary: 'Poolside equipment with the proportions of technical field hardware.',
    note: 'A social tool engineered for the temperature drop after desert sunset.', metrics: [74, 90, 76, 83]
  },
  'Oasis Towel': {
    type: 'TEXTILE / LEISURE FIELD', components: ['WOVEN FIELD', 'EDGE BINDING', 'FOLD MAP'],
    mode: 'DRY / SHADE / WRAP', summary: 'A graphic textile field sized for water, heat and the geometry of a motel pool.',
    note: 'The flattest object in the archive carries one of its largest visual signals.', metrics: [91, 80, 98, 76]
  },
  'Pool Float': {
    type: 'INFLATABLE / WATER PLATFORM', components: ['AIR CHAMBER', 'BACKREST FORM', 'VALVE PORT'],
    mode: 'INFLATE / DRIFT / RESET', summary: 'An oversized water object tuned to slow movement and high desert color.',
    note: 'A temporary architecture for doing almost nothing exceptionally well.', metrics: [63, 88, 54, 79]
  },
  'City Film Camera': {
    type: 'OPTICAL DEVICE / ANALOG CAPTURE', components: ['FOCUS LENS', 'FILM CHAMBER', 'SHUTTER BANK'],
    mode: 'FRAME / CAPTURE / ADVANCE', summary: 'A pocket image machine for translating Los Angeles light into physical frames.',
    note: 'The campaign’s memory device: deliberately finite, tactile and alert to the street.', metrics: [93, 89, 91, 68]
  },
  'Sidewalk Cassette Player': {
    type: 'AUDIO DEVICE / PORTABLE SIGNAL', components: ['TAPE DECK', 'HEADPHONE LOOP', 'CONTROL BANK'],
    mode: 'LOAD / PLAY / REWIND', summary: 'An analog soundtrack unit for long blocks, bus windows and repeated choruses.',
    note: 'Linear listening becomes a form of navigation through the city grid.', metrics: [90, 86, 84, 62]
  },
  'Boulevard Waist Pack': {
    type: 'SOFT STORAGE / BODY SYSTEM', components: ['ZIP CHAMBER', 'BODY PANEL', 'BELT SYSTEM'],
    mode: 'STORE / WEAR / ACCESS', summary: 'A close-body cargo system that keeps both hands inside the rhythm of the city.',
    note: 'Fast access, low volume and no interruption between sidewalk and trail.', metrics: [99, 94, 93, 78]
  },
  'Desert Emergency Kit': {
    type: 'FIELD STORAGE / RESPONSE SYSTEM', components: ['HARD CASE', 'MODULAR INSERT', 'SEAL CLOSURE'],
    mode: 'STORE / RESPOND / REPACK', summary: 'A compact response archive for the distance between trailhead and signal.',
    note: 'Preparedness presented as a reusable system rather than a single-use object.', metrics: [78, 98, 69, 96]
  },
  'Camp Plate': {
    type: 'CAMPWARE / STACKABLE VESSEL', components: ['SERVING BASIN', 'GRIP RIM', 'STACK FORM'],
    mode: 'SERVE / HOLD / STACK', summary: 'A simple camp surface with enough structure for fire-side and trail-side use.',
    note: 'Utility is the aesthetic: one uninterrupted form, repeated every day.', metrics: [82, 92, 94, 87]
  },
  'Trail Shovel': {
    type: 'HAND TOOL / GROUND SYSTEM', components: ['DIGGING BLADE', 'LOCK COLLAR', 'GRIP SHAFT'],
    mode: 'DIG / CLEAR / PACK', summary: 'A compact ground tool for leaving camp more considered than it was found.',
    note: 'The desert object with the most direct relationship between hand, material and terrain.', metrics: [77, 95, 81, 97]
  }
};

function openDossier(index) {
  const item = allItems[index];
  const location = locations[item.locationIndex];
  const telemetry = locationTelemetry[location.id];
  const profile = itemProfiles[item.name];
  const dialog = $('#item-dossier');
  const objectNumber = String(index + 1).padStart(2, '0');
  const signalCode = `${location.code.split('·')[0].trim().replaceAll('.', '')}-${location.code.split('·')[1].trim()}-${String(item.itemIndex + 1).padStart(2, '0')}`;

  $('#dossier-image').src = item.image;
  $('#dossier-image').alt = `${item.name}, ${item.location} campaign object`;
  ['#exploded-image-one', '#exploded-image-two', '#exploded-image-three'].forEach(selector => {
    $(selector).src = item.image;
    $(selector).alt = '';
  });
  $('#dossier-index').textContent = `OBJ. ${objectNumber} / 18`;
  $('#dossier-code').textContent = item.code;
  $('#dossier-type').textContent = profile.type;
  $('#dossier-title').textContent = item.name;
  $('#dossier-summary').textContent = profile.summary;
  $('#dossier-location').textContent = item.location;
  $('#component-one').textContent = profile.components[0];
  $('#component-two').textContent = profile.components[1];
  $('#component-three').textContent = profile.components[2];
  $('#dossier-coordinates').textContent = telemetry.coordinates;
  $('#dossier-environment').textContent = telemetry.environment;
  $('#dossier-use').textContent = profile.mode;
  $('#dossier-signal').textContent = signalCode;
  $('#dossier-note').textContent = profile.note;
  $('#dossier-footer-id').textContent = `CALIFORNIA OBJECT ARCHIVE / ${objectNumber}`;
  $('#analytics-chart').innerHTML = ['MOBILITY', 'UTILITY', 'PACKABILITY', 'FIELD RESILIENCE'].map((label, metricIndex) => `
    <div class="analytic-row">
      <div class="analytic-row__label"><span>${label}</span><strong>${profile.metrics[metricIndex]}</strong></div>
      <div class="analytic-row__track"><span class="analytic-row__fill" style="--value:${profile.metrics[metricIndex]}%"></span></div>
    </div>`).join('');

  dialog.scrollTop = 0;
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dossier-open');
}

function closeDossier() {
  const dialog = $('#item-dossier');
  if (dialog.open) dialog.close();
  document.body.classList.remove('dossier-open');
}

function renderObjects(filter = 'all') {
  const visible = allItems.filter(item => filter === 'all' || item.groups.includes(filter));
  $('#object-grid').innerHTML = visible.map((item, index) => `
    <article class="object-card" style="--accent:${item.accent}; animation-delay:${Math.min(index * 45, 350)}ms">
      <button type="button" class="object-card__link" data-object-index="${allItems.indexOf(item)}" aria-label="Open detailed dossier for ${item.name}">
        <div class="object-card__image">
          <img loading="lazy" src="${item.image}" alt="${item.name}, ${item.location} campaign artwork">
          <span class="object-card__foil" aria-hidden="true"></span>
          <span class="object-card__signal" aria-hidden="true">${item.code.split('·')[0].trim()} / SPECTRAL</span>
        </div>
        <div class="object-card__meta">
          <span>${String(allItems.indexOf(item) + 1).padStart(2, '0')}</span>
          <div><h3>${item.name}</h3><p>${item.location} / ${item.code.split('·')[1]?.trim() || item.code}</p></div>
          <i aria-hidden="true"></i>
        </div>
      </button>
    </article>`).join('');

  $$('.object-card__link').forEach(link => link.addEventListener('click', () => {
    openDossier(Number(link.dataset.objectIndex));
  }));
  bindHolographicCards();
}

function bindHolographicCards() {
  if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.object-card').forEach(card => {
    const link = $('.object-card__link', card);
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      link.style.transform = `perspective(1100px) rotateX(${(y - .5) * -8}deg) rotateY(${(x - .5) * 10}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
      link.style.transform = '';
    });
  });
}

$$('.filter').forEach(button => button.addEventListener('click', () => {
  $$('.filter').forEach(item => item.classList.remove('is-active'));
  button.classList.add('is-active');
  renderObjects(button.dataset.filter);
}));

$('#dossier-close').addEventListener('click', closeDossier);
$('#dossier-close-bottom').addEventListener('click', closeDossier);
$('#item-dossier').addEventListener('close', () => document.body.classList.remove('dossier-open'));

function seededRandom(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function generatePlacePoints(id) {
  const seeds = { yosemite: 1982, tahoe: 96189, sanfrancisco: 415, losangeles: 90015, joshuatree: 92252, palmsprings: 92264 };
  const random = seededRandom(seeds[id]);
  const points = [];
  const add = (x, y, z, size = .9, hot = false) => points.push({ x, y, z, size, hot, phase: random() * Math.PI * 2 });
  const line = (a, b, count, jitter = .008) => {
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0 : i / (count - 1);
      add(
        a[0] + (b[0] - a[0]) * t + (random() - .5) * jitter,
        a[1] + (b[1] - a[1]) * t + (random() - .5) * jitter,
        a[2] + (b[2] - a[2]) * t + (random() - .5) * jitter,
        i % 19 === 0 ? 1.5 : .85,
        i % 29 === 0
      );
    }
  };
  const ring = (cx, cy, cz, rx, ry, count, tilt = 0) => {
    for (let i = 0; i < count; i += 1) {
      const angle = i / count * Math.PI * 2;
      add(cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry, cz + Math.sin(angle) * tilt, i % 17 === 0 ? 1.5 : .8, i % 31 === 0);
    }
  };
  const groundGrid = (y, width = 1.25, depth = .8) => {
    for (let row = 0; row < 9; row += 1) {
      const z = -depth + row / 8 * depth * 2;
      line([-width, y, z], [width, y, z], 28, .004);
    }
    for (let column = 0; column < 11; column += 1) {
      const x = -width + column / 10 * width * 2;
      line([x, y, -depth], [x, y, depth], 20, .004);
    }
  };
  const insidePolygon = (x, y, polygon) => {
    let inside = false;
    for (let i = 0, previous = polygon.length - 1; i < polygon.length; previous = i, i += 1) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[previous];
      const intersects = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  };

  if (id === 'yosemite') {
    for (let i = 0; i < 760; i += 1) {
      const x = -1.12 + random() * 1.65;
      const top = .96 - .68 * Math.pow((x + .08) / 1.18, 2);
      const y = -.68 + random() * (top + .68);
      const depth = .11 + .22 * (1 - (y + .68) / Math.max(.2, top + .68));
      add(x, y, (random() - .5) * depth, random() > .96 ? 1.6 : .78, random() > .98);
    }
    for (let i = 0; i < 170; i += 1) {
      add(.53 + (random() - .5) * .035, -.62 + random() * 1.42, (random() - .5) * .23, random() > .9 ? 1.5 : .85, i % 37 === 0);
    }
    line([.53, .8, -.12], [.53, -.62, -.12], 80, .004);
    line([-1.2, -.68, -.45], [1.05, -.68, -.45], 90, .015);
    groundGrid(-.72, 1.18, .62);
  }

  if (id === 'tahoe') {
    const shoreline = [
      [-.1, 1.1], [.2, 1.04], [.4, .8], [.5, .43], [.49, .08],
      [.41, -.3], [.28, -.7], [.08, -1.04], [-.18, -.99], [-.41, -.73],
      [-.55, -.36], [-.59, .06], [-.53, .44], [-.36, .79], [-.21, 1.02]
    ];

    let waterPoints = 0;
    while (waterPoints < 900) {
      const x = -.61 + random() * 1.14;
      const y = -1.06 + random() * 2.18;
      if (!insidePolygon(x, y, shoreline)) continue;
      const z = -.12 + Math.sin(x * 12 + y * 8) * .012 + (random() - .5) * .012;
      add(x, y, z, random() > .95 ? 1.5 : .76, random() > .987);
      waterPoints += 1;
    }

    shoreline.forEach((point, index) => {
      const next = shoreline[(index + 1) % shoreline.length];
      line([point[0], point[1], -.08], [next[0], next[1], -.08], 34, .003);
    });

    [.76, .52].forEach((scaleAmount, ringIndex) => {
      shoreline.forEach((point, index) => {
        const next = shoreline[(index + 1) % shoreline.length];
        line(
          [point[0] * scaleAmount, point[1] * scaleAmount, -.17 - ringIndex * .045],
          [next[0] * scaleAmount, next[1] * scaleAmount, -.17 - ringIndex * .045],
          18,
          .002
        );
      });
    });

    [1.13, 1.27, 1.4].forEach((scaleAmount, ringIndex) => {
      shoreline.forEach((point, index) => {
        const next = shoreline[(index + 1) % shoreline.length];
        const elevation = .02 + ringIndex * .11;
        line(
          [point[0] * scaleAmount, point[1] * scaleAmount, elevation],
          [next[0] * scaleAmount, next[1] * scaleAmount, elevation],
          20,
          .008
        );
      });
    });

    for (let i = 0; i < 340; i += 1) {
      const edgeIndex = Math.floor(random() * shoreline.length);
      const current = shoreline[edgeIndex];
      const next = shoreline[(edgeIndex + 1) % shoreline.length];
      const edgeAmount = random();
      const rimScale = 1.15 + random() * .28;
      const x = (current[0] + (next[0] - current[0]) * edgeAmount) * rimScale;
      const y = (current[1] + (next[1] - current[1]) * edgeAmount) * rimScale;
      add(x, y, .05 + random() * .34, random() > .92 ? 1.55 : .82, random() > .975);
    }
  }

  if (id === 'sanfrancisco') {
    const towerXs = [-.62, .62];
    [-.13, .13].forEach(z => {
      towerXs.forEach(x => {
        line([x - .11, -.58, z], [x - .11, .78, z], 74, .004);
        line([x + .11, -.58, z], [x + .11, .78, z], 74, .004);
        line([x - .13, .28, z], [x + .13, .28, z], 28, .004);
        line([x - .13, .58, z], [x + .13, .58, z], 28, .004);
      });
      line([-1.32, -.34, z], [1.32, -.34, z], 150, .004);
      for (let i = 0; i < 170; i += 1) {
        const x = -1.34 + i / 169 * 2.68;
        const absX = Math.abs(x);
        const cableY = absX <= .62 ? .12 + .66 * Math.pow(absX / .62, 2) : .78 - .34 * ((absX - .62) / .72);
        add(x, cableY, z, i % 13 === 0 ? 1.5 : .82, i % 37 === 0);
        if (i % 10 === 0) line([x, -.32, z], [x, cableY, z], 14, .003);
      }
    });
    line([-1.35, -.39, -.2], [1.35, -.39, -.2], 130, .005);
  }

  if (id === 'losangeles') {
    const buildings = [
      [-1.08, .2, .56], [-.8, .24, .82], [-.46, .3, 1.2], [-.08, .22, .72],
      [.2, .36, 1.02], [.62, .22, .63], [.92, .3, .88]
    ];
    buildings.forEach(([x, width, height], buildingIndex) => {
      const left = x - width / 2;
      const right = x + width / 2;
      [-.08, .14].forEach(z => {
        line([left, -.65, z], [left, -.65 + height, z], 38, .004);
        line([right, -.65, z], [right, -.65 + height, z], 38, .004);
        line([left, -.65 + height, z], [right, -.65 + height, z], 22, .004);
      });
      if (buildingIndex % 2 === 0) line([x, -.65 + height, -.08], [x, -.65 + height + .16, -.08], 12, .003);
    });
    const palm = (x, z, height) => {
      for (let i = 0; i < 85; i += 1) {
        const t = i / 84;
        add(x + Math.sin(t * 1.4) * .035, -.66 + t * height, z, .82, i % 31 === 0);
      }
      const topY = -.66 + height;
      for (let branch = 0; branch < 9; branch += 1) {
        const angle = branch / 9 * Math.PI * 2;
        for (let i = 0; i < 28; i += 1) {
          const t = i / 27;
          add(x + Math.cos(angle) * t * .34, topY + Math.sin(t * Math.PI) * .12 - t * .13, z + Math.sin(angle) * t * .34, .78, i === 27);
        }
      }
    };
    palm(-1.08, -.28, .92);
    palm(1.08, .18, .78);
    groundGrid(-.68, 1.25, .65);
  }

  if (id === 'joshuatree') {
    const branches = [
      [[0, -.7, 0], [.02, .35, 0]], [[.02, -.05, 0], [-.48, .35, .02]],
      [[-.48, .35, .02], [-.62, .72, .04]], [[-.48, .35, .02], [-.2, .68, -.02]],
      [[.02, .2, 0], [.5, .5, .02]], [[.5, .5, .02], [.72, .82, .06]],
      [[.5, .5, .02], [.28, .88, -.03]], [[.02, .35, 0], [.04, .96, 0]]
    ];
    branches.forEach((segment, index) => line(segment[0], segment[1], index === 0 ? 90 : 48, .025));
    const tips = [[-.62,.72,.04],[-.2,.68,-.02],[.72,.82,.06],[.28,.88,-.03],[.04,.96,0]];
    tips.forEach(([x, y, z]) => {
      for (let spike = 0; spike < 24; spike += 1) {
        const angle = spike / 24 * Math.PI * 2;
        const length = .13 + random() * .13;
        line([x, y, z], [x + Math.cos(angle) * length, y + (random() - .25) * length, z + Math.sin(angle) * length], 8, .006);
      }
    });
    [[-.82,-.64,.22,.28],[.72,-.67,.12,.38]].forEach(([cx, cy, cz, radius]) => {
      for (let i = 0; i < 150; i += 1) {
        const theta = random() * Math.PI * 2;
        const phi = Math.acos(2 * random() - 1);
        add(cx + Math.sin(phi) * Math.cos(theta) * radius, cy + Math.cos(phi) * radius * .55, cz + Math.sin(phi) * Math.sin(theta) * radius * .7, .8, i % 47 === 0);
      }
    });
    groundGrid(-.72, 1.2, .65);
  }

  if (id === 'palmsprings') {
    const turbines = [[-.78, -.14, .72], [0, .05, .9], [.76, .18, .68]];
    turbines.forEach(([x, z, height], turbineIndex) => {
      const hubY = -.68 + height;
      line([x, -.68, z], [x, hubY, z], 76, .006);
      ring(x, hubY, z, .055, .055, 34, .015);
      for (let blade = 0; blade < 3; blade += 1) {
        const angle = blade / 3 * Math.PI * 2 + turbineIndex * .45;
        line([x, hubY, z], [x + Math.cos(angle) * .43, hubY + Math.sin(angle) * .43, z], 48, .006);
      }
    });
    ring(-.72, .72, .48, .32, .32, 170, .02);
    groundGrid(-.7, 1.2, .68);
  }

  return points;
}

function createPlacePointCloud(canvas) {
  const context = canvas.getContext('2d', { alpha: true });
  const stage = $('#pointcloud-stage');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let points = [];
  let angleY = -.42;
  let angleX = -.16;
  let fade = 0;
  let dragging = false;
  let currentId = 'yosemite';
  let previousX = 0;
  let previousY = 0;
  let pointerActive = false;
  let pointerAngleY = angleY;
  let pointerAngleX = angleX;

  const resize = () => {
    const bounds = stage.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
  };

  const spectrum = (amount, alpha) => {
    const t = Math.max(0, Math.min(1, amount));
    const start = t < .5 ? [255, 35, 0] : [255, 115, 0];
    const end = t < .5 ? [255, 115, 0] : [255, 232, 0];
    const local = t < .5 ? t * 2 : (t - .5) * 2;
    const color = start.map((channel, index) => Math.round(channel + (end[index] - channel) * local));
    return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
  };

  const draw = time => {
    requestAnimationFrame(draw);
    if (!dragging && pointerActive) {
      angleY += (pointerAngleY - angleY) * .085;
      angleX += (pointerAngleX - angleX) * .085;
    } else if (!dragging && !reduceMotion) {
      angleY += currentId === 'tahoe' ? .00135 : .0024;
    }
    fade = Math.min(1, fade + .045);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const scale = Math.min(width, height) * .3;
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
      const projected = points.map(point => {
      const rotatedX = point.x * cosY - point.z * sinY;
      const rotatedZ = point.x * sinY + point.z * cosY;
      const rotatedY = point.y * cosX - rotatedZ * sinX;
      const depth = point.y * sinX + rotatedZ * cosX;
      const perspective = 3.2 / (3.2 - depth);
      return {
        x: width / 2 + rotatedX * scale * perspective,
        y: height / 2 - rotatedY * scale * perspective,
        depth,
        perspective,
        sourceY: point.y,
        size: point.size,
        hot: point.hot,
        phase: point.phase
      };
      }).sort((a, b) => a.depth - b.depth);

      if (projected.length) {
        const bounds = projected.reduce((result, point) => ({
          minX: Math.min(result.minX, point.x),
          maxX: Math.max(result.maxX, point.x),
          minY: Math.min(result.minY, point.y),
          maxY: Math.max(result.maxY, point.y)
        }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
        const offsetX = width / 2 - (bounds.minX + bounds.maxX) / 2;
        const offsetY = height / 2 - (bounds.minY + bounds.maxY) / 2;
        projected.forEach(point => {
          point.x += offsetX;
          point.y += offsetY;
        });
      }

    context.globalCompositeOperation = 'lighter';
    projected.forEach((point, index) => {
      const depthAmount = (point.depth + 1.4) / 2.8;
      const heightAmount = (point.sourceY + .75) / 1.75;
      const colorAmount = Math.max(0, Math.min(1, heightAmount * .62 + depthAmount * .38));
      const shimmer = .82 + Math.sin(time * .002 + point.phase) * .18;
      const alpha = (.32 + point.perspective * .46) * fade * shimmer;
      const radius = Math.max(.55, point.size * point.perspective * (point.hot ? 1.65 : 1));
      context.fillStyle = spectrum(colorAmount, alpha);
      if (point.hot || index % 41 === 0) {
        context.beginPath();
        context.arc(point.x, point.y, radius * 2.4, 0, Math.PI * 2);
        context.fill();
      }
      context.fillRect(point.x - radius / 2, point.y - radius / 2, radius, radius);
    });
    context.globalCompositeOperation = 'source-over';
  };

  stage.addEventListener('pointerdown', event => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!dragging) return;
    angleY += (event.clientX - previousX) * .008;
    angleX = Math.max(-.65, Math.min(.45, angleX + (event.clientY - previousY) * .006));
    previousX = event.clientX;
    previousY = event.clientY;
  });
  const stopDragging = event => {
    dragging = false;
    if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };
  stage.addEventListener('pointerup', stopDragging);
  stage.addEventListener('pointercancel', stopDragging);

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);

  return {
      setPointer(x, y, active = true) {
      pointerActive = active && Number.isFinite(x) && Number.isFinite(y);
      if (!pointerActive) return;
      pointerAngleY = -.95 + Math.max(0, Math.min(1, x)) * 1.9;
        pointerAngleX = .34 - Math.max(0, Math.min(1, y)) * .72;
      },
      dragBy(dx, dy) {
        pointerActive = false;
        angleY += dx * .008;
        angleX = Math.max(-.65, Math.min(.45, angleX + dy * .006));
      },
    setLocation(id, name) {
      currentId = id;
      points = generatePlacePoints(id);
      fade = 0;
      angleY = id === 'tahoe' ? -.18 : -.42;
      angleX = id === 'tahoe' ? -.05 : -.16;
      canvas.setAttribute('aria-label', `Rotating holographic point-cloud representation of ${name}`);
      $('#pointcloud-count').textContent = `${String(points.length).padStart(4, '0')} PTS`;
    }
  };
}

pointCloud = createPlacePointCloud($('#location-pointcloud'));
renderObjects();
renderLocation(0);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
$$('.reveal').forEach(element => observer.observe(element));

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  $('.scroll-progress span').style.height = `${(window.scrollY / scrollable) * 100}%`;
}, { passive: true });

const cursorGlow = $('.cursor-glow');
window.addEventListener('pointermove', event => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
}, { passive: true });

if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $$('[data-tilt]').forEach(element => {
    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      const isHero = element.classList.contains('hero-object');
      const base = isHero ? 'translate(-50%, -50%) ' : '';
      element.style.transform = `${base}perspective(900px) rotateX(${y * -8}deg) rotateY(${x * 9}deg)`;
    });
    element.addEventListener('pointerleave', () => {
      element.style.transform = element.classList.contains('hero-object') ? 'translate(-50%, -50%)' : '';
    });
  });
}
