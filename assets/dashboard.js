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
function renderMap() {
  const svg = document.getElementById('route-map');
  if (!svg) return;

  // Route endpoints [lon, lat] → [x%, y%] on a simplified equirectangular map
  // Map bounds: lon -10 to 160, lat 60 to -15
  const project = (lon, lat) => {
    const x = ((lon + 10) / 170) * 100;
    const y = ((60 - lat) / 75) * 100;
    return { x, y };
  };

  const airports = {
    KTM: { lon: 85.36, lat: 27.70, label: 'KTM', name: 'Kathmandu' },
    PBH: { lon: 89.43, lat: 27.40, label: 'PBH', name: 'Paro' },
    DEL: { lon: 77.10, lat: 28.55, label: 'DEL', name: 'Delhi' },
    BKK: { lon: 100.75, lat: 13.68, label: 'BKK', name: 'Bangkok' },
    KUL: { lon: 101.70, lat: 2.74,  label: 'KUL', name: 'Kuala Lumpur' },
    DOH: { lon: 51.61, lat: 25.27,  label: 'DOH', name: 'Doha' },
    DXB: { lon: 55.36, lat: 25.25,  label: 'DXB', name: 'Dubai' },
    HKG: { lon: 113.92, lat: 22.31, label: 'HKG', name: 'Hong Kong' },
    BOM: { lon: 72.87, lat: 19.09,  label: 'BOM', name: 'Mumbai' },
    CCU: { lon: 88.45, lat: 22.65,  label: 'CCU', name: 'Kolkata' },
    DAC: { lon: 90.40, lat: 23.85,  label: 'DAC', name: 'Dhaka' },
    SIN: { lon: 103.99, lat: 1.36,  label: 'SIN', name: 'Singapore' },
    IXB: { lon: 88.33, lat: 26.68,  label: 'IXB', name: 'Bagdogra' },
    GAU: { lon: 91.59, lat: 26.10,  label: 'GAU', name: 'Guwahati' },
    GAY: { lon: 84.95, lat: 24.74,  label: 'GAY', name: 'Bodh Gaya' },
  };

  // Nepal routes
  const nepalRoutes = ['DEL','BKK','KUL','DOH','DXB','HKG','BOM'];
  // Druk routes
  const drukRoutes  = ['DEL','BKK','CCU','DAC','SIN','IXB','GAU','GAY'];

  const W = 800, H = 400;
  const toSVG = (lon, lat) => ({ x: ((lon+10)/170)*W, y: ((60-lat)/75)*H });

  // Build curved arc path between two points
  const arc = (a, b) => {
    const p1 = toSVG(a.lon, a.lat);
    const p2 = toSVG(b.lon, b.lat);
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2 - 30;
    return `M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`;
  };

  const mapContent = svg;

  // Draw Nepal routes (red)
  nepalRoutes.forEach(code => {
    const ap = airports[code];
    const hub = airports.KTM;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const p1 = toSVG(hub.lon, hub.lat);
    const p2 = toSVG(ap.lon, ap.lat);
    const mx = (p1.x+p2.x)/2;
    const my = (p1.y+p2.y)/2 - 35;
    path.setAttribute('d', `M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`);
    path.setAttribute('stroke', '#E8253D');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-dasharray', '4 3');
    path.setAttribute('opacity', '0.7');
    mapContent.appendChild(path);
  });

  // Draw Druk routes (teal)
  drukRoutes.forEach(code => {
    const ap = airports[code];
    const hub = airports.PBH;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const p1 = toSVG(hub.lon, hub.lat);
    const p2 = toSVG(ap.lon, ap.lat);
    const mx = (p1.x+p2.x)/2;
    const my = (p1.y+p2.y)/2 - 28;
    path.setAttribute('d', `M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`);
    path.setAttribute('stroke', '#1DAB9F');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-dasharray', '4 3');
    path.setAttribute('opacity', '0.7');
    mapContent.appendChild(path);
  });

  // Draw all airport dots
  const allCodes = ['KTM','PBH',...new Set([...nepalRoutes,...drukRoutes])];
  allCodes.forEach(code => {
    const ap = airports[code];
    if (!ap) return;
    const pt = toSVG(ap.lon, ap.lat);
    const isHub = code === 'KTM' || code === 'PBH';
    const isNepal = code === 'KTM' || nepalRoutes.includes(code);
    const isDruk  = code === 'PBH' || drukRoutes.includes(code);

    const color = (code === 'KTM') ? '#E8253D' : (code === 'PBH') ? '#1DAB9F' :
                  (isNepal && isDruk) ? '#F5A623' :
                  isNepal ? '#E8253D' : '#1DAB9F';

    // Dot
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pt.x);
    circle.setAttribute('cy', pt.y);
    circle.setAttribute('r', isHub ? 6 : 4);
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', '#0B0D18');
    circle.setAttribute('stroke-width', isHub ? '2' : '1.5');
    mapContent.appendChild(circle);

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pt.x + 8);
    text.setAttribute('y', pt.y + 4);
    text.setAttribute('fill', isHub ? '#EDF1FF' : '#7888A8');
    text.setAttribute('font-size', isHub ? '10' : '8');
    text.setAttribute('font-family', 'DM Sans, sans-serif');
    text.setAttribute('font-weight', isHub ? '700' : '400');
    text.textContent = ap.label;
    mapContent.appendChild(text);
  });

  // Animated plane icons on main routes
  animatePlane(svg, airports.KTM, airports.DEL, '#E8253D');
  animatePlane(svg, airports.KTM, airports.BKK, '#E8253D');
  animatePlane(svg, airports.PBH, airports.BKK, '#1DAB9F');
  animatePlane(svg, airports.PBH, airports.CCU, '#1DAB9F');
}

function animatePlane(svg, from, to, color) {
  const p1 = { x:((from.lon+10)/170)*800, y:((60-from.lat)/75)*400 };
  const p2 = { x:((to.lon+10)/170)*800,   y:((60-to.lat)/75)*400 };
  const mx = (p1.x+p2.x)/2;
  const my = (p1.y+p2.y)/2 - 32;

  const g = document.createElementNS('http://www.w3.org/2000/svg','g');

  // Plane shape (simple triangle pointing right)
  const plane = document.createElementNS('http://www.w3.org/2000/svg','polygon');
  plane.setAttribute('points', '0,-4 8,0 0,4 2,0');
  plane.setAttribute('fill', color);

  const animMotion = document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
  animMotion.setAttribute('dur', `${6 + Math.random()*4}s`);
  animMotion.setAttribute('repeatCount', 'indefinite');
  animMotion.setAttribute('rotate', 'auto');

  const mpath = document.createElementNS('http://www.w3.org/2000/svg','mpath');
  // Create path el for motion
  const pid = `mp-${Math.random().toString(36).substr(2,6)}`;
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg','path');
  pathEl.setAttribute('id', pid);
  pathEl.setAttribute('d', `M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`);
  pathEl.setAttribute('fill','none');
  pathEl.setAttribute('stroke','none');
  svg.appendChild(pathEl);

  mpath.setAttributeNS('http://www.w3.org/1999/xlink','href','#'+pid);
  animMotion.appendChild(mpath);
  g.appendChild(plane);
  g.appendChild(animMotion);
  svg.appendChild(g);
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
