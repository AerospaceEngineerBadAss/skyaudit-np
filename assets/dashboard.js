/* ============================================================
   SkyAudit NP v2 — Dashboard Logic
   Nepal Airlines Annual Report FY 2079/80
   Drukair Annual Report 2023
   ============================================================ */
'use strict';

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];

/* ── DATA ── */
const DATA = {
  nepal: {
    name: 'Nepal Airlines Corporation',
    short: 'NAC',
    country: 'Nepal',
    flag: '🇳🇵',
    fleet: 'A320 / A330',
    founded: 1958,
    hub: 'Tribhuvan Intl (KTM)',
    otp:         [68,61,60,59,54,54,53,53,50,44,44,40],
    seat_factor: [82,83,78,82,80,82,82,85,85,81,74,76],
    load_factor: [69,74,71,58,63,69,64,71,72,62,71,68],
    reliability: [98,98,99,100,100,100,100,100,74,96,96,95],
    flights:     [290,277,252,308,318,303,311,335,357,373,353,291],
    cancellation:[2,2,1,0,0,0,0,0,26,4,4,5],
    delay_causes: {
      'Immigration':  33,
      'Crew / Subsistence': 30,
      'Marketing / Pax': 14,
      'ATC (KTM)':    7,
      'Engineering':  7,
      'Operations':   3,
      'Weather':      2,
      'Other':        4
    },
    adu: { 'A320 (AKW)': 13.6, 'A320 (AKX)': 14.0, 'A330 (ALY)': 11.4, 'A330 (ALZ)': 11.1 },
    total_pax: 629147,
    total_freight_kg: 4416092,
    fleet_size: 4,
    market_share: 16.56,
    safety_incidents: 0,
    avg_delay_min: 68,
    year: 'FY 2079/80 (2022–23)',
    color: '#E8253D',
    colorDim: 'rgba(232,37,61,0.15)'
  },
  druk: {
    name: 'Drukair Corporation Limited',
    short: 'KB',
    country: 'Bhutan',
    flag: '🇧🇹',
    fleet: 'A319 / ATR 42-600',
    founded: 1981,
    hub: 'Paro Intl (PBH)',
    otp:         [76,79,81,82,78,77,75,80,83,82,80,77],
    seat_factor: [62,65,68,72,69,65,63,68,72,74,71,68],
    load_factor: [60,63,66,70,67,63,61,66,70,72,69,66],
    reliability: [95,96,97,98,97,96,95,97,98,97,96,95],
    flights:     [285,298,312,356,342,318,310,340,372,380,358,325],
    cancellation:[5,4,3,2,3,4,5,3,2,3,4,5],
    delay_causes: {
      'Weather': 28,
      'ATC':     18,
      'Engineering': 12,
      'Operations':  15,
      'Catering':     8,
      'Passenger':   12,
      'Other':        7
    },
    adu: { 'A319': 4.36, 'ATR 42-600': 3.2 },
    total_pax: 201979,
    total_flights: 3996,
    total_freight_mt: 532,
    fleet_size: 5,
    market_share: 83,
    safety_incidents: 1,
    avg_delay_min: 34,
    year: 'FY 2023',
    color: '#1DAB9F',
    colorDim: 'rgba(29,171,159,0.15)'
  }
};

/* ── ROUTE DATA ── */
const ROUTES = [
  { route:'KTM — DEL', full:'Kathmandu — Delhi',     nepal_otp:58, druk_otp:82, nepal_delay:72, druk_delay:28 },
  { route:'KTM — KUL', full:'Kathmandu — Kuala Lumpur', nepal_otp:52, druk_otp:null, nepal_delay:85, druk_delay:null },
  { route:'KTM — DOH', full:'Kathmandu — Doha',      nepal_otp:49, druk_otp:null, nepal_delay:91, druk_delay:null },
  { route:'KTM — DXB', full:'Kathmandu — Dubai',     nepal_otp:51, druk_otp:null, nepal_delay:78, druk_delay:null },
  { route:'KTM — BKK', full:'Kathmandu — Bangkok',   nepal_otp:56, druk_otp:78,   nepal_delay:64, druk_delay:32 },
  { route:'KTM — HKG', full:'Kathmandu — Hong Kong', nepal_otp:54, druk_otp:null, nepal_delay:70, druk_delay:null },
  { route:'KTM — BOM', full:'Kathmandu — Mumbai',    nepal_otp:45, druk_otp:null, nepal_delay:95, druk_delay:null },
];

const ROUTE_MAP_SIZE = { width: 960, height: 420 };
const ROUTE_MAP_BOUNDS = { minLon: 42, maxLon: 146, maxLat: 42, minLat: -2 };
const EMBEDDED_ROUTE_TABLE = `airline,origin_iata,destination_iata,route_type,service_pattern,via_iata,seasonal,status_note
Drukair,PBH,DXB,International,Direct,,No,Current destination
Drukair,PBH,DEL,International,Direct,,No,Current destination
Drukair,PBH,KTM,International,Direct,,No,Current destination
Drukair,PBH,IXB,International,Direct,,No,Current destination
Drukair,PBH,GAY,International,Direct,,Yes,Seasonal destination
Drukair,PBH,CCU,International,Direct,,No,Current destination
Drukair,PBH,GAU,International,Direct,,No,Current destination
Drukair,PBH,DAC,International,Direct,,No,Current destination
Drukair,PBH,BKK,International,Via/varies,"GAU|IXB|GAY",No,Current destination
Drukair,PBH,SIN,International,Via,GAU,No,Current destination
Nepal Airlines,KTM,DEL,International,Direct,,No,Current destination
Nepal Airlines,KTM,BKK,International,Direct,,No,Current destination
Nepal Airlines,KTM,KUL,International,Direct,,No,Current destination
Nepal Airlines,KTM,BLR,International,Direct,,No,Current destination
Nepal Airlines,KTM,HKG,International,Direct,,No,Current destination
Nepal Airlines,KTM,DOH,International,Direct,,No,Current destination
Nepal Airlines,KTM,NRT,International,Direct,,No,Current destination
Nepal Airlines,KTM,DXB,International,Direct,,No,Current destination
Nepal Airlines,KTM,BOM,International,Direct,,No,Current destination
Nepal Airlines,KTM,DMM,International,Direct,,No,Current destination
Nepal Airlines,KTM,CAN,International,Direct,,No,Current destination
Nepal Airlines,KTM,RUH,International,Unknown,,No,Unconfirmed on current schedule`;

const AIRPORT_COORDS = {
  PBH: { lon: 89.4246, lat: 27.4032, name: 'Paro', country: 'Bhutan' },
  DXB: { lon: 55.3644, lat: 25.2532, name: 'Dubai', country: 'United Arab Emirates' },
  DEL: { lon: 77.1031, lat: 28.5562, name: 'Delhi', country: 'India' },
  KTM: { lon: 85.3591, lat: 27.6966, name: 'Kathmandu', country: 'Nepal' },
  IXB: { lon: 88.3297, lat: 26.6812, name: 'Bagdogra', country: 'India' },
  GAY: { lon: 84.9512, lat: 24.7443, name: 'Gaya', country: 'India' },
  CCU: { lon: 88.4467, lat: 22.6547, name: 'Kolkata', country: 'India' },
  GAU: { lon: 91.5859, lat: 26.1061, name: 'Guwahati', country: 'India' },
  DAC: { lon: 90.3978, lat: 23.8433, name: 'Dhaka', country: 'Bangladesh' },
  BKK: { lon: 100.7501, lat: 13.69, name: 'Bangkok', country: 'Thailand' },
  SIN: { lon: 103.994, lat: 1.3644, name: 'Singapore', country: 'Singapore' },
  KUL: { lon: 101.7099, lat: 2.7456, name: 'Kuala Lumpur', country: 'Malaysia' },
  BLR: { lon: 77.7063, lat: 13.1986, name: 'Bengaluru', country: 'India' },
  HKG: { lon: 113.9185, lat: 22.308, name: 'Hong Kong', country: 'Hong Kong' },
  DOH: { lon: 51.6081, lat: 25.2731, name: 'Doha', country: 'Qatar' },
  NRT: { lon: 140.3874, lat: 35.773, name: 'Tokyo Narita', country: 'Japan' },
  BOM: { lon: 72.874, lat: 19.0896, name: 'Mumbai', country: 'India' },
  DMM: { lon: 49.7979, lat: 26.4712, name: 'Dammam', country: 'Saudi Arabia' },
  CAN: { lon: 113.2988, lat: 23.3924, name: 'Guangzhou', country: 'China' },
  RUH: { lon: 46.6988, lat: 24.9576, name: 'Riyadh', country: 'Saudi Arabia' },
};

const AIRPORT_LABEL_OFFSETS = {
  KTM: { x: 10, y: -12 },
  PBH: { x: 10, y: 16 },
  DEL: { x: -12, y: -10, anchor: 'end' },
  IXB: { x: 10, y: -10 },
  GAY: { x: -10, y: 14, anchor: 'end' },
  CCU: { x: -12, y: 16, anchor: 'end' },
  GAU: { x: 10, y: 14 },
  DAC: { x: 10, y: 14 },
  BKK: { x: 10, y: -10 },
  SIN: { x: 10, y: 14 },
  KUL: { x: -10, y: 14, anchor: 'end' },
  CAN: { x: 10, y: 14 },
  HKG: { x: 10, y: -10 },
  DOH: { x: -10, y: -10, anchor: 'end' },
  DXB: { x: -10, y: 16, anchor: 'end' },
  DMM: { x: -10, y: 14, anchor: 'end' },
  RUH: { x: -10, y: -10, anchor: 'end' },
  BOM: { x: -10, y: 14, anchor: 'end' },
  NRT: { x: 10, y: -10 },
  BLR: { x: 10, y: 14 }
};

const ROUTE_AIRLINE_META = {
  nepal: { key: 'nepal', label: 'Nepal Airlines', color: '#E8253D' },
  druk: { key: 'druk', label: 'Drukair', color: '#1DAB9F' }
};

const routeMapState = {
  filter: 'both',
  routes: [],
  initialized: false,
  map: null,
  layerGroups: null
};
/* ── COMPARISON TABLE ROWS ── */
const TABLE_ROWS = [
  { cat: '✈️  OPERATIONS' },
  {
    metric: 'Total Flights Operated',
    hint: 'Fixed-wing scheduled + charter flights',
    nepal: '3,468', druk: '3,996',
    nepal_bar: 87, druk_bar: 100, unit: '',
    verdict: 'druk', verdict_txt: 'Druk +15%'
  },
  {
    metric: 'Total Passengers Carried',
    hint: 'International + domestic combined',
    nepal: '629,147', druk: '201,979',
    nepal_bar: 100, druk_bar: 32, unit: '',
    verdict: 'nepal', verdict_txt: 'Nepal 3.1×'
  },
  {
    metric: 'Fleet Size',
    hint: 'Number of fixed-wing aircraft in service',
    nepal: '4 aircraft', druk: '5 aircraft',
    nepal_bar: 80, druk_bar: 100, unit: '',
    verdict: 'tie', verdict_txt: 'Similar'
  },
  {
    metric: 'Market Share (Competitive Routes)',
    hint: 'Share of pax on jointly operated routes',
    nepal: '16.6%', druk: '83%',
    nepal_bar: 20, druk_bar: 100, unit: '%',
    verdict: 'druk', verdict_txt: 'Druk 5×'
  },

  { cat: '⏱️  PUNCTUALITY' },
  {
    metric: 'On-Time Performance (avg)',
    hint: '% of flights departing within 15 min of schedule',
    nepal: '53%', druk: '79%',
    nepal_bar: 53, druk_bar: 79, unit: '%',
    verdict: 'druk', verdict_txt: '−26 pts'
  },
  {
    metric: 'Best Month OTP',
    hint: 'Peak punctuality month in the reporting year',
    nepal: '68% (Jul)', druk: '83% (Mar)',
    nepal_bar: 68, druk_bar: 83, unit: '%',
    verdict: 'druk', verdict_txt: 'Druk ahead'
  },
  {
    metric: 'Worst Month OTP',
    hint: 'Lowest punctuality month in the year',
    nepal: '40% (Jun)', druk: '75% (Jan)',
    nepal_bar: 40, druk_bar: 75, unit: '%',
    verdict: 'druk', verdict_txt: 'Critical gap'
  },
  {
    metric: 'OTP Trend',
    hint: 'Direction of change across the year',
    nepal: 'Declining ↘', druk: 'Stable →',
    nepal_bar: 30, druk_bar: 75, unit: '',
    verdict: 'warn', verdict_txt: 'Worsening'
  },

  { cat: '🛫  CAPACITY & LOAD' },
  {
    metric: 'Passenger Seat Factor (avg)',
    hint: '% of seats filled — international routes',
    nepal: '81%', druk: '67%',
    nepal_bar: 81, druk_bar: 67, unit: '%',
    verdict: 'nepal', verdict_txt: 'Nepal +14 pts'
  },
  {
    metric: 'Passenger Load Factor (avg)',
    hint: 'Revenue passenger km ÷ available seat km',
    nepal: '68%', druk: '67%',
    nepal_bar: 68, druk_bar: 67, unit: '%',
    verdict: 'tie', verdict_txt: 'Equivalent'
  },
  {
    metric: 'Available Seat-KM (ASK)',
    hint: 'Total capacity offered to market',
    nepal: '~2.1B', druk: '435M',
    nepal_bar: 100, druk_bar: 21, unit: '',
    verdict: 'nepal', verdict_txt: 'Nepal 4.8× larger'
  },

  { cat: '🔧  FLEET & UTILIZATION' },
  {
    metric: 'A320 Daily Utilization',
    hint: 'Avg flight hours per A320 aircraft per day',
    nepal: '13.8 hrs', druk: '4.4 hrs',
    nepal_bar: 100, druk_bar: 32, unit: '',
    verdict: 'nepal', verdict_txt: 'Nepal 3.1× more'
  },
  {
    metric: 'Schedule Reliability',
    hint: '% of planned flights that operated (not cancelled)',
    nepal: '96%', druk: '97%',
    nepal_bar: 96, druk_bar: 97, unit: '%',
    verdict: 'tie', verdict_txt: 'Similar'
  },
  {
    metric: 'Avg Delay When Delayed',
    hint: 'Average minutes late for flights that were delayed',
    nepal: '68 min', druk: '34 min',
    nepal_bar: 100, druk_bar: 50, unit: '',
    verdict: 'druk', verdict_txt: 'Nepal 2× longer'
  },

  { cat: '⚠️  DELAYS & CANCELLATIONS' },
  {
    metric: 'Top Delay Cause',
    hint: 'Single largest category of delay by % share',
    nepal: 'Immigration (33%)', druk: 'Weather (28%)',
    nepal_bar: 33, druk_bar: 28, unit: '',
    verdict: 'warn', verdict_txt: 'Systemic issue'
  },
  {
    metric: 'Airline-Controllable Delays',
    hint: 'Ops + engineering delays (within airline control)',
    nepal: '10%', druk: '27%',
    nepal_bar: 10, druk_bar: 27, unit: '%',
    verdict: 'nepal', verdict_txt: 'Nepal better'
  },
  {
    metric: 'Domestic Cancellation Causes',
    hint: 'Primary reason flights cancelled domestically',
    nepal: 'Weather 83%, Tech 13%', druk: 'Weather 60%, Ops 25%',
    nepal_bar: 83, druk_bar: 60, unit: '',
    verdict: 'tie', verdict_txt: 'Both weather-driven'
  },

  { cat: '🛡️  SAFETY' },
  {
    metric: 'Safety Incidents (Fixed Wing)',
    hint: 'Serious safety events on scheduled aircraft',
    nepal: '0 incidents', druk: '0 incidents',
    nepal_bar: 100, druk_bar: 100, unit: '',
    verdict: 'tie', verdict_txt: 'Both clean'
  },
  {
    metric: 'Other Safety Events',
    hint: 'Incidents across all operations including rotary',
    nepal: 'None reported', druk: '1 helicopter crash',
    nepal_bar: 100, druk_bar: 80, unit: '',
    verdict: 'nepal', verdict_txt: 'Nepal safer'
  },
];

/* ── HELPERS ── */
const avg = arr => arr.reduce((a,b) => a+b, 0) / arr.length;

/* ── CHART DEFAULTS ── */
const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color:'#7888A8', font:{ family:'DM Sans', size:11 }, boxWidth:10, padding:12 } },
    tooltip: { backgroundColor:'#1A2338', borderColor:'#1E2A44', borderWidth:1,
      titleColor:'#EDF1FF', bodyColor:'#7888A8', padding:10, cornerRadius:6 }
  },
  scales: {
    x: { grid:{ color:'rgba(30,42,68,0.5)' }, ticks:{ color:'#7888A8', font:{ family:'DM Sans', size:10 } } },
    y: { grid:{ color:'rgba(30,42,68,0.5)' }, ticks:{ color:'#7888A8', font:{ family:'DM Sans', size:10 } } }
  }
};

const charts = {};

/* ── RENDER TABLE ── */
function renderTable() {
  const tbody = document.getElementById('compare-tbody');
  if (!tbody) return;

  tbody.innerHTML = TABLE_ROWS.map(r => {
    if (r.cat) {
      return `<tr class="cat-row"><td colspan="5">${r.cat}</td></tr>`;
    }

    const verdictClass = { nepal:'v-nepal', druk:'v-druk', tie:'v-tie', warn:'v-warn' }[r.verdict] || 'v-tie';
    const verdictIcon  = { nepal:'🇳🇵', druk:'🇧🇹', tie:'—', warn:'⚠️' }[r.verdict] || '—';

    const barHtml = (r.nepal_bar != null && r.druk_bar != null) ? `
      <div class="bar-pair">
        <div class="bar-row">
          <div class="bar-track"><div class="bar-fill bar-fill-nepal" style="width:${r.nepal_bar}%"></div></div>
          <span class="bar-pct bar-pct-nepal">${r.nepal_bar}${r.unit}</span>
        </div>
        <div class="bar-row">
          <div class="bar-track"><div class="bar-fill bar-fill-druk" style="width:${r.druk_bar}%"></div></div>
          <span class="bar-pct bar-pct-druk">${r.druk_bar}${r.unit}</span>
        </div>
      </div>` : '—';

    return `<tr>
      <td>
        <div class="metric-name">${r.metric}</div>
        <div class="metric-hint">${r.hint}</div>
      </td>
      <td class="cell-nepal">${r.nepal}</td>
      <td class="cell-druk">${r.druk}</td>
      <td>${barHtml}</td>
      <td><span class="verdict ${verdictClass}">${verdictIcon} ${r.verdict_txt}</span></td>
    </tr>`;
  }).join('');
}

/* ── RENDER OTP CHART ── */
function renderOTPChart() {
  const ctx = document.getElementById('chart-otp');
  if (!ctx) return;
  if (charts.otp) charts.otp.destroy();

  charts.otp = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: '🇳🇵 Nepal Airlines',
          data: DATA.nepal.otp,
          borderColor: '#E8253D',
          backgroundColor: 'rgba(232,37,61,0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointBackgroundColor: '#E8253D',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '🇧🇹 Druk Air',
          data: DATA.druk.otp,
          borderColor: '#1DAB9F',
          backgroundColor: 'rgba(29,171,159,0.06)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointBackgroundColor: '#1DAB9F',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '80% Industry Target',
          data: Array(12).fill(80),
          borderColor: 'rgba(245,166,35,0.4)',
          borderDash: [6,4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0
        }
      ]
    },
    options: {
      ...CHART_OPTS,
      plugins: {
        ...CHART_OPTS.plugins,
        tooltip: {
          ...CHART_OPTS.plugins.tooltip,
          callbacks: {
            afterBody: items => {
              const v = items[0]?.raw;
              if (!v) return '';
              return v >= 80 ? '✅ Meets target' : v >= 65 ? '⚠️ Below standard' : '🔴 Critical';
            }
          }
        }
      },
      scales: {
        x: CHART_OPTS.scales.x,
        y: { ...CHART_OPTS.scales.y, min:30, max:95, ticks:{ ...CHART_OPTS.scales.y.ticks, callback: v => v+'%' } }
      }
    }
  });
}

/* ── RENDER LOAD FACTOR CHART ── */
function renderLoadChart() {
  const ctx = document.getElementById('chart-load');
  if (!ctx) return;
  if (charts.load) charts.load.destroy();

  charts.load = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [
        { label:'🇳🇵 Nepal', data: DATA.nepal.load_factor, backgroundColor:'rgba(232,37,61,0.7)', borderColor:'#E8253D', borderWidth:1, borderRadius:3 },
        { label:'🇧🇹 Druk',  data: DATA.druk.load_factor,  backgroundColor:'rgba(29,171,159,0.7)', borderColor:'#1DAB9F', borderWidth:1, borderRadius:3 }
      ]
    },
    options: {
      ...CHART_OPTS,
      scales: {
        x: CHART_OPTS.scales.x,
        y: { ...CHART_OPTS.scales.y, min:40, max:85, ticks:{ ...CHART_OPTS.scales.y.ticks, callback: v=>v+'%' } }
      }
    }
  });
}

/* ── RENDER DELAY BREAKDOWN ── */
function renderDelayChart() {
  const container = document.getElementById('delay-breakdown');
  if (!container) return;

  const nepal_causes = DATA.nepal.delay_causes;
  const druk_causes  = DATA.druk.delay_causes;

  // Unified categories
  const cats = [
    { key: 'Immigration / Pax', nepal: (nepal_causes['Immigration']||0) + (nepal_causes['Marketing / Pax']||0), druk: (druk_causes['Passenger']||0) + (druk_causes['Catering']||0) },
    { key: 'Crew / Subsistence', nepal: nepal_causes['Crew / Subsistence']||0, druk: 0 },
    { key: 'ATC', nepal: nepal_causes['ATC (KTM)']||0, druk: druk_causes['ATC']||0 },
    { key: 'Engineering', nepal: nepal_causes['Engineering']||0, druk: druk_causes['Engineering']||0 },
    { key: 'Operations', nepal: nepal_causes['Operations']||0, druk: druk_causes['Operations']||0 },
    { key: 'Weather', nepal: nepal_causes['Weather']||0, druk: druk_causes['Weather']||0 },
    { key: 'Other', nepal: nepal_causes['Other']||0, druk: druk_causes['Other']||0 },
  ];

  const maxVal = Math.max(...cats.flatMap(c => [c.nepal, c.druk]));

  container.innerHTML = cats.map(c => `
    <div class="delay-item">
      <div class="delay-head">
        <span class="delay-name">${c.key}</span>
        <span style="font-size:0.68rem;color:#7888A8">${c.nepal ? `🇳🇵 ${c.nepal}%` : ''} ${c.druk ? `&nbsp;🇧🇹 ${c.druk}%` : ''}</span>
      </div>
      <div class="delay-track" style="height:18px;background:rgba(255,255,255,0.04);border-radius:6px;overflow:hidden;display:flex;">
        ${c.nepal ? `<div style="width:${(c.nepal/maxVal)*100}%;background:#E8253D;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;font-size:0.6rem;font-weight:700;color:rgba(255,255,255,0.9);transition:width 0.6s">${c.nepal}%</div>` : ''}
      </div>
      <div class="delay-track" style="height:18px;background:rgba(255,255,255,0.04);border-radius:6px;overflow:hidden;display:flex;margin-top:3px">
        ${c.druk ? `<div style="width:${(c.druk/maxVal)*100}%;background:#1DAB9F;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;font-size:0.6rem;font-weight:700;color:rgba(255,255,255,0.9);transition:width 0.6s">${c.druk}%</div>` : ''}
      </div>
    </div>
  `).join('');
}

/* ── WORLD MAP (SVG + Route Arcs) ── */
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function normalizeAirlineKey(airline) {
  const value = (airline || '').trim().toLowerCase();
  if (value.includes('nepal')) return 'nepal';
  if (value.includes('druk')) return 'druk';
  return '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseRouteTable(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = headers.reduce((acc, header, headerIndex) => {
      acc[header] = (values[headerIndex] || '').trim();
      return acc;
    }, {});

    const airlineKey = normalizeAirlineKey(row.airline);
    const viaList = row.via_iata
      ? row.via_iata.split('|').map(code => code.trim()).filter(Boolean)
      : [];

    return {
      ...row,
      airlineKey,
      origin_iata: row.origin_iata,
      destination_iata: row.destination_iata,
      via_iata_list: viaList,
      seasonal: /^yes$/i.test(row.seasonal),
      isSpecial: viaList.length > 0 || /unknown/i.test(row.service_pattern) || /unconfirmed|seasonal|special/i.test(row.status_note),
      id: `${airlineKey}-${row.origin_iata}-${row.destination_iata}-${index}`
    };
  }).filter(route => route.airlineKey && route.origin_iata && route.destination_iata);
}

async function loadRouteMapData() {
  if (routeMapState.routes.length) return routeMapState.routes;
  const routes = parseRouteTable(EMBEDDED_ROUTE_TABLE).filter(route => /international/i.test(route.route_type));
  const missingCodes = [...new Set(routes
    .flatMap(route => [route.origin_iata, route.destination_iata, ...route.via_iata_list])
    .filter(code => code && !AIRPORT_COORDS[code]))];

  if (missingCodes.length) {
    console.warn('Missing airport coordinates for route map:', missingCodes);
  }

  routeMapState.routes = routes;
  return routes;
}

function initializeRouteMap() {
  const mapEl = document.getElementById('route-map');
  const shell = document.querySelector('.route-map-shell');
  if (!mapEl || routeMapState.map) return routeMapState.map;
  if (!window.L) throw new Error('Leaflet failed to load for the route map.');

  const bounds = [
    [ROUTE_MAP_BOUNDS.minLat, ROUTE_MAP_BOUNDS.minLon],
    [ROUTE_MAP_BOUNDS.maxLat, ROUTE_MAP_BOUNDS.maxLon]
  ];

  const map = L.map(mapEl, {
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    dragging: true,
    boxZoom: false,
    keyboard: false,
    preferCanvas: true,
    attributionControl: true,
    minZoom: 4,
    maxZoom: 7,
    maxBounds: [[-8, 34], [48, 154]],
    maxBoundsViscosity: 0.85
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: 'abc',
    minZoom: 3,
    maxZoom: 7,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.fitBounds(bounds, { padding: [30, 30] });
  map.setMinZoom(4);
  map.setMaxZoom(7);

  map.createPane('routeLines');
  map.getPane('routeLines').style.zIndex = 430;
  map.createPane('routeMarkers');
  map.getPane('routeMarkers').style.zIndex = 620;
  map.createPane('routeLabels');
  map.getPane('routeLabels').style.zIndex = 640;
  map.getPane('routeLabels').style.pointerEvents = 'none';

  routeMapState.layerGroups = {
    lines: L.layerGroup().addTo(map),
    markers: L.layerGroup().addTo(map),
    labels: L.layerGroup().addTo(map)
  };
  routeMapState.map = map;
  shell?.classList.add('has-live-map');
  window.setTimeout(() => map.invalidateSize(), 0);

  return map;
}

function buildRouteLatLngs(origin, destination, curvature = 0.16) {
  const startLat = origin.lat;
  const startLon = origin.lon;
  const endLat = destination.lat;
  const endLon = destination.lon;
  const lonDelta = endLon - startLon;
  const latDelta = endLat - startLat;
  const distance = Math.hypot(lonDelta, latDelta);
  const arcLift = Math.max(1.1, Math.min(7.5, distance * curvature * 0.42));
  const controlLat = ((startLat + endLat) / 2) + arcLift;
  const controlLon = ((startLon + endLon) / 2) - (lonDelta * 0.04);
  const points = [];

  for (let step = 0; step <= 24; step += 1) {
    const t = step / 24;
    const lat = ((1 - t) ** 2 * startLat) + (2 * (1 - t) * t * controlLat) + ((t ** 2) * endLat);
    const lon = ((1 - t) ** 2 * startLon) + (2 * (1 - t) * t * controlLon) + ((t ** 2) * endLon);
    points.push([lat, lon]);
  }

  return points;
}

function getActiveRoutes(routes, filter) {
  if (filter === 'both') return routes;
  return routes.filter(route => route.airlineKey === filter);
}

function getSharedDestinations(routes) {
  const destinationMap = new Map();
  routes.forEach(route => {
    const airlines = destinationMap.get(route.destination_iata) || new Set();
    airlines.add(route.airlineKey);
    destinationMap.set(route.destination_iata, airlines);
  });

  return new Set([...destinationMap.entries()]
    .filter(([, airlines]) => airlines.size > 1)
    .map(([code]) => code));
}

function showRouteTooltipAt(point, html) {
  const tooltip = document.getElementById('route-map-tooltip');
  const shell = document.querySelector('.route-map-shell');
  if (!tooltip || !shell) return;

  tooltip.innerHTML = html;
  const bounds = shell.getBoundingClientRect();
  const offsetX = Math.max(12, Math.min(point.x + 16, bounds.width - 250));
  const offsetY = Math.max(12, Math.min(point.y + 16, bounds.height - 130));
  tooltip.style.left = `${offsetX}px`;
  tooltip.style.top = `${offsetY}px`;
  tooltip.classList.add('is-visible');
  tooltip.setAttribute('aria-hidden', 'false');
}

function hideRouteTooltip() {
  const tooltip = document.getElementById('route-map-tooltip');
  if (!tooltip) return;
  tooltip.classList.remove('is-visible');
  tooltip.setAttribute('aria-hidden', 'true');
}

function buildRouteTooltipHtml(route) {
  const airline = ROUTE_AIRLINE_META[route.airlineKey];
  const viaText = route.via_iata_list.length ? `<div class="route-tooltip-meta">Via: ${escapeHtml(route.via_iata_list.join(', '))}</div>` : '';
  const seasonalText = route.seasonal ? '<div class="route-tooltip-meta">Seasonal: Yes</div>' : '';
  const statusText = route.status_note ? `<div class="route-tooltip-meta">Status: ${escapeHtml(route.status_note)}</div>` : '';

  return `
    <strong style="color:${airline.color}">${airline.label}</strong>
    <div>${escapeHtml(route.origin_iata)} to ${escapeHtml(route.destination_iata)}</div>
    <div class="route-tooltip-meta">Service: ${escapeHtml(route.service_pattern || 'Unknown')}</div>
    ${viaText}
    ${seasonalText}
    ${statusText}
  `;
}

function buildAirportTooltipHtml(code, airport, isHub, shared) {
  return `
    <strong>${escapeHtml(code)}${isHub ? ' hub' : ''}</strong>
    <div>${escapeHtml(airport.name)}, ${escapeHtml(airport.country)}</div>
    <div class="route-tooltip-meta">${shared ? 'Shared destination' : isHub ? 'Origin airport' : 'Destination airport'}</div>
  `;
}

function getAirportVisualState(code, routes, sharedDestinations) {
  const servedBy = new Set(routes
    .filter(route => route.origin_iata === code || route.destination_iata === code)
    .map(route => route.airlineKey));
  const isHub = routes.some(route => route.origin_iata === code);
  const isViaOnly = !servedBy.size && routes.some(route => route.via_iata_list.includes(code));

  let fill = '#AAB6D3';
  if (isHub && servedBy.size === 1) {
    fill = ROUTE_AIRLINE_META[[...servedBy][0]].color;
  } else if (sharedDestinations.has(code) && routeMapState.filter === 'both') {
    fill = '#F5A623';
  } else if (servedBy.size === 1) {
    fill = ROUTE_AIRLINE_META[[...servedBy][0]].color;
  }

  return { fill, isHub, isViaOnly, shared: sharedDestinations.has(code) };
}

function updateRouteMapSummary(routes, filter) {
  const summary = document.getElementById('route-map-summary');
  if (!summary) return;

  if (!routes.length) {
    summary.textContent = 'No routes available for the selected airline filter.';
    return;
  }

  const routeCount = routes.length;
  const destinationCount = new Set(routes.map(route => route.destination_iata)).size;
  const airportCount = new Set(routes.flatMap(route => [route.origin_iata, route.destination_iata, ...route.via_iata_list])).size;
  const filterLabel = filter === 'both'
    ? 'Both airlines'
    : ROUTE_AIRLINE_META[filter]?.label || 'Selected airline';

  summary.textContent = `${filterLabel}: ${routeCount} international routes, ${destinationCount} destinations, ${airportCount} mapped airports.`;
}

function setupRouteMapControls() {
  if (routeMapState.initialized) return;

  document.querySelectorAll('[data-route-filter]').forEach(button => {
    button.addEventListener('click', () => {
      routeMapState.filter = button.dataset.routeFilter;
      document.querySelectorAll('[data-route-filter]').forEach(control => {
        control.classList.toggle('is-active', control === button);
      });
      drawRouteMap();
    });
  });

  document.querySelector('.route-map-shell')?.addEventListener('mouseleave', hideRouteTooltip);
  routeMapState.initialized = true;
}

function drawRouteMap() {
  const map = initializeRouteMap();
  if (!map || !routeMapState.layerGroups) return;

  const routes = getActiveRoutes(routeMapState.routes, routeMapState.filter)
    .filter(route => AIRPORT_COORDS[route.origin_iata] && AIRPORT_COORDS[route.destination_iata]);
  const sharedDestinations = getSharedDestinations(routeMapState.routes);

  routeMapState.layerGroups.lines.clearLayers();
  routeMapState.layerGroups.markers.clearLayers();
  routeMapState.layerGroups.labels.clearLayers();
  hideRouteTooltip();
  updateRouteMapSummary(routes, routeMapState.filter);

  if (!routes.length) return;

  const activeCodes = new Set();

  routes.forEach(route => {
    activeCodes.add(route.origin_iata);
    activeCodes.add(route.destination_iata);
    route.via_iata_list.forEach(code => activeCodes.add(code));

    const airline = ROUTE_AIRLINE_META[route.airlineKey];
    const latLngs = buildRouteLatLngs(
      AIRPORT_COORDS[route.origin_iata],
      AIRPORT_COORDS[route.destination_iata],
      route.airlineKey === 'nepal' ? 0.2 : 0.16
    );

    const routeLine = L.polyline(latLngs, {
      pane: 'routeLines',
      color: airline.color,
      weight: route.isSpecial ? 2 : 2.6,
      opacity: route.isSpecial ? 0.72 : 0.9,
      dashArray: route.isSpecial ? '7 6' : null,
      lineCap: 'round',
      lineJoin: 'round'
    });

    const tooltipHtml = buildRouteTooltipHtml(route);
    routeLine.on('mouseover', event => showRouteTooltipAt(event.containerPoint, tooltipHtml));
    routeLine.on('mousemove', event => showRouteTooltipAt(event.containerPoint, tooltipHtml));
    routeLine.on('mouseout', hideRouteTooltip);
    routeMapState.layerGroups.lines.addLayer(routeLine);
  });

  [...activeCodes].forEach(code => {
    const airport = AIRPORT_COORDS[code];
    if (!airport) return;
    const latLng = [airport.lat, airport.lon];
    const markerState = getAirportVisualState(code, routes, sharedDestinations);

    if (markerState.isHub) {
      routeMapState.layerGroups.markers.addLayer(L.circleMarker(latLng, {
        pane: 'routeMarkers',
        radius: 13,
        stroke: true,
        color: '#FFFFFF',
        weight: 1.4,
        fillColor: markerState.fill,
        fillOpacity: 0.18
      }));
    }

    const airportMarker = L.circleMarker(latLng, {
      pane: 'routeMarkers',
      radius: markerState.isHub ? 6.6 : markerState.isViaOnly ? 3.4 : 4.2,
      fillColor: markerState.fill,
      stroke: true,
      color: markerState.isHub ? '#F7FBFF' : '#0B0D18',
      weight: markerState.isHub ? 2.4 : 1.4,
      opacity: markerState.isViaOnly ? 0.85 : 1,
      fillOpacity: 1
    });
    const airportTooltipHtml = buildAirportTooltipHtml(code, airport, markerState.isHub, markerState.shared);
    airportMarker.on('mouseover', event => showRouteTooltipAt(event.containerPoint, airportTooltipHtml));
    airportMarker.on('mousemove', event => showRouteTooltipAt(event.containerPoint, airportTooltipHtml));
    airportMarker.on('mouseout', hideRouteTooltip);
    routeMapState.layerGroups.markers.addLayer(airportMarker);

    const labelOffset = AIRPORT_LABEL_OFFSETS[code] || { x: 8, y: 4, anchor: 'start' };
    const anchorX = labelOffset.anchor === 'end' ? 60 : labelOffset.anchor === 'middle' ? 30 : 0;
    const hubLabelClass = markerState.isHub
      ? code === 'KTM'
        ? ' route-airport-label-nepalhub'
        : code === 'PBH'
          ? ' route-airport-label-drukhub'
          : ''
      : '';
    routeMapState.layerGroups.labels.addLayer(L.marker(latLng, {
      pane: 'routeLabels',
      interactive: false,
      icon: L.divIcon({
        className: markerState.isHub ? `route-airport-label route-airport-label-hub${hubLabelClass}` : 'route-airport-label',
        html: `<span style="display:inline-block;transform:translate(${labelOffset.x}px, ${labelOffset.y}px);text-align:${labelOffset.anchor === 'end' ? 'right' : 'left'};">${escapeHtml(code)}</span>`,
        iconSize: [60, 18],
        iconAnchor: [anchorX, 9]
      })
    }));
  });
}

async function renderMap() {
  const mapEl = document.getElementById('route-map');
  if (!mapEl) return;

  setupRouteMapControls();

  try {
    await loadRouteMapData();
    drawRouteMap();
  } catch (error) {
    console.error(error);
    mapEl.innerHTML = '';
    document.querySelector('.route-map-shell')?.classList.remove('has-live-map');
    const summary = document.getElementById('route-map-summary');
    if (summary) {
      summary.textContent = 'Interactive basemap could not be loaded, so the route tracker is showing the built-in fallback map instead.';
    }
  }
}
/* ── RECOMMENDATIONS ── */
const RECOS = [
  {
    priority: 'URGENT', pclass: 'p-urgent', icon: '🛂',
    title: 'Fix Immigration Processing at Tribhuvan International',
    body: "Immigration causes 33% of Nepal Airlines' international delays — more than weather, ATC, and engineering combined. This is a government infrastructure failure, not an airline problem.",
    stat: 'Immigration is Nepal\'s #1 delay driver at 33% — vs 0% for Druk Air',
    more: "Deploy automated e-gates, increase officer shift coverage during peak hours (06:00–10:00), and implement pre-clearance for frequent routes to Delhi, Doha, Dubai. Target: reduce immigration delays from 33% to under 10% within 18 months.",
    icao: 'ICAO Doc 9626 — Manual on Regulation of International Air Transport'
  },
  {
    priority: 'URGENT', pclass: 'p-urgent', icon: '⏱️',
    title: 'Set Mandatory OTP Targets with Consequences for NAC',
    body: "Nepal Airlines averages 53% OTP — 26 percentage points below Druk Air and nearly 30 points below the ICAO global average. Without binding KPIs, chronic delays have no regulatory consequences.",
    stat: 'Nepal OTP 53% vs Druk Air 79% vs ICAO benchmark 80%',
    more: "Issue a ministerial directive requiring NAC to publish monthly OTP reports. Set a 12-month target of 68% OTP (improvement of 15 points). Tie aviation route licensing renewals to OTP performance. Establish quarterly CAAN review hearings.",
    icao: 'ICAO Annex 11 — Air Traffic Services, Chapter 2.19'
  },
  {
    priority: 'HIGH', pclass: 'p-high', icon: '🍽️',
    title: 'Digitize Crew Scheduling to Eliminate 30% Subsistence Delays',
    body: "Crew subsistence and rest violations are the second-largest delay cause at 30% — an internal operational failure with a clear digital solution.",
    stat: 'Crew / subsistence delays: Nepal 30%, Druk Air 0% — entirely preventable',
    more: "Procure a crew management system (CMS) with automated duty-time tracking and predictive fatigue alerts. Integrate with catering vendors for real-time meal status. Target: subsistence delays below 10% within 12 months.",
    icao: 'ICAO Annex 6, Chapter 12 — Flight Crew Hours of Service'
  },
  {
    priority: 'HIGH', pclass: 'p-high', icon: '🔧',
    title: 'Mandate Quarterly Engineering Audits Under ICAO Annex 6',
    body: "Engineering delays account for 7% of Nepal's international delays and 13% of domestic cancellations. Combined with aging fleet maintenance needs, this is a systemic risk.",
    stat: 'Technical cancellations: Nepal domestic 13%, Druk Air ~5% (estimated)',
    more: "Require NAC to submit engineering compliance reports to CAAN every quarter. Establish a dedicated Aircraft-on-Ground (AOG) parts reserve fund. Commission an independent ICAO-aligned safety oversight audit by end of year.",
    icao: 'ICAO Annex 6 — Operation of Aircraft, Part I, Chapter 8'
  },
  {
    priority: 'HIGH', pclass: 'p-high', icon: '📡',
    title: 'Invest in ATC Modernisation at Tribhuvan International',
    body: "ATC delays account for 7% of Nepal's international and 35% of domestic delays. Kathmandu's single-runway airport with mountainous approaches creates systemic bottlenecks.",
    stat: 'ATC causes 35% of Nepal domestic delays — highest single controllable factor',
    more: "Upgrade ATC radar systems, implement RNP AR approach procedures on all runways, and establish a Collaborative Decision Making (CDM) system between NAC, CAAN, and ground handlers. Coordinate with Indian ATC for smoother en-route transitions.",
    icao: 'ICAO Doc 9750 — Global Air Navigation Plan, Priority 1'
  },
  {
    priority: 'MEDIUM', pclass: 'p-medium', icon: '🌐',
    title: 'Expand Codeshare Agreements to Compete on Market Share',
    body: "Nepal Airlines holds just 16.56% international market share while Druk Air commands 83% on its competitive routes. Commercial partnerships are the fastest path to load factor improvement.",
    stat: 'Nepal market share: 16.56% overall. Druk Air: 83% on competed routes',
    more: "Negotiate codeshare agreements with Gulf carriers (Qatar, Emirates) for GCC routes and with Thai Airways or AirAsia for Southeast Asia. Pursue IATA MITA agreements to enable interlining. A 5-point load factor gain would add ~NPR 800M in annual revenue.",
    icao: 'ICAO Doc 9587 — Policy on Economic Regulation of International Air Transport'
  }
];

function renderRecos() {
  const grid = document.getElementById('reco-grid');
  if (!grid) return;
  grid.innerHTML = RECOS.map((r,i) => `
    <div class="reco-card" onclick="toggleReco(${i})" id="rc-${i}">
      <div class="reco-priority ${r.pclass}">${r.priority}</div>
      <div class="reco-icon">${r.icon}</div>
      <div class="reco-title">${r.title}</div>
      <div class="reco-body">${r.body}</div>
      <div class="reco-stat">${r.stat}</div>
      <div class="reco-more" id="rm-${i}">
        <p>${r.more}</p>
        <div class="icao">📖 ${r.icao}</div>
      </div>
    </div>
  `).join('');
}

window.toggleReco = i => {
  document.getElementById(`rm-${i}`)?.classList.toggle('open');
};

/* ── UPLOAD ── */
function setupUpload() {
  const btn = document.getElementById('upload-btn');
  const overlay = document.getElementById('modal');
  const closeBtn = document.getElementById('modal-close');

  btn?.addEventListener('click', () => overlay?.classList.add('open'));
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

  ['nepal','druk'].forEach(airline => {
    const zone = document.getElementById(`zone-${airline}`);
    const input = document.getElementById(`file-${airline}`);
    zone?.addEventListener('click', () => input?.click());
    zone?.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone?.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone?.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) {
        const reader = new FileReader();
        reader.onload = ev => {
          const lines = ev.target.result.trim().split('\n');
          document.getElementById(`preview-${airline}`).innerHTML =
            `<div class="upload-success">✅ Loaded ${lines.length-1} rows from ${e.dataTransfer.files[0].name}</div>`;
        };
        reader.readAsText(e.dataTransfer.files[0]);
      }
    });
    input?.addEventListener('change', e => {
      if (e.target.files[0]) {
        document.getElementById(`preview-${airline}`).innerHTML =
          `<div class="upload-success">✅ ${e.target.files[0].name} selected — ${(e.target.files[0].size/1024).toFixed(1)} KB</div>`;
      }
    });
  });

  document.getElementById('export-btn')?.addEventListener('click', () => window.print());
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  renderOTPChart();
  renderLoadChart();
  renderDelayChart();
  renderMap();
  renderRecos();
  setupUpload();
});

