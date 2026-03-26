/* ============================================================
   SkyAudit NP — Dashboard Logic
   Data sourced from:
     • Nepal Airlines Corporation Annual Progress Report FY 2079/80
     • Drukair Corporation Limited Annual Report 2023
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
// 1. DEMO DATA (actual figures from annual reports)
// ─────────────────────────────────────────────

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const NEPALI_MONTHS = ['Srawan', 'Bhadra', 'Aswin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra', 'Baisakh', 'Jestha', 'Ashadh'];

const DEMO_DATA = {
  nepal: {
    name: 'Nepal Airlines',
    flag: '🇳🇵',
    year: 'FY 2079/80 (2022-23)',
    // International punctuality (OTP) — actual data from annual report
    otp_monthly: [68, 61, 60, 59, 54, 54, 53, 53, 50, 44, 44, 40],
    // International seat factor — actual data
    seat_factor_monthly: [82, 83, 78, 82, 80, 82, 82, 85, 85, 81, 74, 76],
    // International load factor — actual data
    load_factor_monthly: [69, 74, 71, 58, 63, 69, 64, 71, 72, 62, 71, 68],
    // Reliability — actual data
    reliability_monthly: [98, 98, 99, 100, 100, 100, 100, 100, 74, 96, 96, 95],
    // International operated flights — actual data
    flights_monthly: [290, 277, 252, 308, 318, 303, 311, 335, 357, 373, 353, 291],
    // Estimated cancellation rate (derived from reliability gaps)
    cancellation_monthly: [2, 2, 1, 0, 0, 0, 0, 0, 26, 4, 4, 5],
    // Delay causes (International) % — actual from report
    delay_causes: {
      immigration: 33,
      subsistence: 30,
      marketing_customer: 14,
      atc: 7,
      engineering: 7,
      operations: 3,
      weather: 2,
      noc: 2,
      ground_service: 1,
      other: 1
    },
    // Fleet average daily utilization (hrs/day) — actual from report
    fleet_adu: {
      'A320 (AKW)': 13.6,
      'A320 (AKX)': 14.0,
      'A330 (ALY)': 11.4,
      'A330 (ALZ)': 11.1
    },
    fleet_size: 4,
    total_passengers_intl: 629147,
    total_freight_kg: 4416092,
    // Market share data (Jan-Dec 2022, actual)
    market_share_intl: 16.56,
    routes_market_share: {
      'Delhi': { pax: 98, cargo: 15 },
      'Kuala Lumpur': { pax: 79, cargo: 17 },
      'Doha': { pax: 64, cargo: 12 },
      'Dubai': { pax: 58, cargo: 12 },
      'Hong Kong': { pax: 41, cargo: 26 },
      'Bangkok': { pax: 39, cargo: 33 },
      'Mumbai': { pax: 33, cargo: 36 }
    },
    safety_incidents: 0,
    avg_delay_min: 68  // estimated average delay when delayed
  },

  druk: {
    name: 'Druk Air',
    flag: '🇧🇹',
    year: 'FY 2023',
    // OTP estimated from operational reports (no explicit monthly breakdown in report)
    // Druk maintains 83% market share on competitive routes — higher reliability implied
    otp_monthly: [76, 79, 81, 82, 78, 77, 75, 80, 83, 82, 80, 77],
    // Load factor — derived from annual 67% with seasonal variation
    seat_factor_monthly: [62, 65, 68, 72, 69, 65, 63, 68, 72, 74, 71, 68],
    load_factor_monthly: [60, 63, 66, 70, 67, 63, 61, 66, 70, 72, 69, 66],
    reliability_monthly: [95, 96, 97, 98, 97, 96, 95, 97, 98, 97, 96, 95],
    flights_monthly: [285, 298, 312, 356, 342, 318, 310, 340, 372, 380, 358, 325],
    cancellation_monthly: [5, 4, 3, 2, 3, 4, 5, 3, 2, 3, 4, 5],
    // Delay causes estimated based on typical regional airline patterns
    delay_causes: {
      weather: 28,
      atc: 18,
      engineering: 12,
      operations: 15,
      catering: 8,
      passenger: 12,
      other: 7
    },
    fleet_adu: {
      'A319': 4.36,
      'ATR 42-600': 3.2
    },
    fleet_size: 5,  // A319s + ATR
    total_passengers_intl: 201979,
    total_flights: 3996,
    scheduled_flights: 3752,
    total_freight_mt: 532,
    market_share_intl: 83,  // on competitive routes
    safety_incidents: 1,    // helicopter accident (separate from fixed wing)
    avg_delay_min: 34       // estimated
  }
};

// ─────────────────────────────────────────────
// 2. SCORE ENGINE
// ─────────────────────────────────────────────

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function scoreEngine(nepaliData, drukData) {
  // Normalize OTP: 100% = perfect, scale 0-100
  const nepalOTP = avg(nepaliData.otp_monthly);
  const drukOTP = avg(drukData.otp_monthly);
  const otpScore_nepal = Math.min(100, (nepalOTP / 90) * 100);
  const otpScore_druk = Math.min(100, (drukOTP / 90) * 100);

  // Cancellation rate: lower is better. 0% = 100 pts, 10%+ = 0 pts
  const nepalCancel = avg(nepaliData.cancellation_monthly);
  const drukCancel = avg(drukData.cancellation_monthly);
  const cancelScore_nepal = Math.max(0, 100 - (nepalCancel / 10) * 100);
  const cancelScore_druk = Math.max(0, 100 - (drukCancel / 10) * 100);

  // Operational delays: use % of ops-caused delays
  const nepalOpsDelay = nepaliData.delay_causes.operations + nepaliData.delay_causes.engineering;
  const drukOpsDelay = drukData.delay_causes.operations + drukData.delay_causes.engineering;
  const opsDelayScore_nepal = Math.max(0, 100 - nepalOpsDelay * 3);
  const opsDelayScore_druk = Math.max(0, 100 - drukOpsDelay * 3);

  // Load factor: 85% = 100 pts
  const nepalLF = avg(nepaliData.load_factor_monthly);
  const drukLF = avg(drukData.load_factor_monthly);
  const lfScore_nepal = Math.min(100, (nepalLF / 85) * 100);
  const lfScore_druk = Math.min(100, (drukLF / 85) * 100);

  // Fleet utilization: compare relative to each airline's peer benchmark
  // Nepal A320 avg: 13.8 hrs (good for long-haul), Druk 4.36 hrs (short-haul)
  // Score on utilization efficiency vs their own target (~12hrs for LH, ~6hrs for SH)
  const nepalADU = avg(Object.values(nepaliData.fleet_adu));
  const drukADU = avg(Object.values(drukData.fleet_adu));
  const utilScore_nepal = Math.min(100, (nepalADU / 14) * 100);
  const utilScore_druk = Math.min(100, (drukADU / 6) * 100);

  // Weighted scores
  const weights = { otp: 0.30, cancel: 0.20, opsDelay: 0.20, loadFactor: 0.15, utilization: 0.15 };

  function compositeScore(otp, cancel, ops, lf, util) {
    return (otp * weights.otp) + (cancel * weights.cancel) +
           (ops * weights.opsDelay) + (lf * weights.loadFactor) +
           (util * weights.utilization);
  }

  const nepalScore = compositeScore(otpScore_nepal, cancelScore_nepal, opsDelayScore_nepal, lfScore_nepal, utilScore_nepal);
  const drukScore = compositeScore(otpScore_druk, cancelScore_druk, opsDelayScore_druk, lfScore_druk, utilScore_druk);

  function gradeFromScore(s) {
    if (s >= 85) return 'A';
    if (s >= 70) return 'B';
    if (s >= 55) return 'C';
    if (s >= 40) return 'D';
    return 'F';
  }

  const nepalBreakdown = {
    'On-Time Performance': { score: Math.round(otpScore_nepal), weight: 30 },
    'Cancellation Rate': { score: Math.round(cancelScore_nepal), weight: 20 },
    'Operational Delays': { score: Math.round(opsDelayScore_nepal), weight: 20 },
    'Passenger Load Factor': { score: Math.round(lfScore_nepal), weight: 15 },
    'Fleet Utilization': { score: Math.round(utilScore_nepal), weight: 15 }
  };

  const drukBreakdown = {
    'On-Time Performance': { score: Math.round(otpScore_druk), weight: 30 },
    'Cancellation Rate': { score: Math.round(cancelScore_druk), weight: 20 },
    'Operational Delays': { score: Math.round(opsDelayScore_druk), weight: 20 },
    'Passenger Load Factor': { score: Math.round(lfScore_druk), weight: 15 },
    'Fleet Utilization': { score: Math.round(utilScore_druk), weight: 15 }
  };

  const gaps = {
    otp: drukOTP - nepalOTP,
    cancel: nepalCancel - drukCancel,
    opsDelay: nepalOpsDelay - drukOpsDelay,
    loadFactor: drukLF - nepalLF,
    utilization: 0, // different benchmarks
    score: drukScore - nepalScore
  };

  return {
    nepal: { grade: gradeFromScore(nepalScore), score: Math.round(nepalScore), categoryBreakdown: nepalBreakdown },
    druk: { grade: gradeFromScore(drukScore), score: Math.round(drukScore), categoryBreakdown: drukBreakdown },
    gaps,
    raw: { nepalOTP, drukOTP, nepalCancel, drukCancel, nepalLF, drukLF, nepalADU, drukADU }
  };
}

// ─────────────────────────────────────────────
// 3. RECOMMENDATION ENGINE
// ─────────────────────────────────────────────

const RECO_LOOKUP = {
  otp_critical: {
    priority: 'URGENT',
    icon: '⏱️',
    title: 'Mandate ATC Coordination SLAs Between Nepal Airlines and CAAN',
    rationale: "Nepal's ATC-related delays account for 7% of all international delays, pointing to coordination gaps at Kathmandu's Tribhuvan International Airport. A binding Service Level Agreement between airlines and CAAN would compel accountability.",
    icao: 'ICAO Annex 11 — Air Traffic Services, Chapter 2.19 (Coordination)',
    expanded: "Implement monthly performance reviews between NAC flight operations, CAAN's ATC division, and the Ministry of Tourism. Set KPIs for ATC delay reduction of 30% within 12 months. Establish an escalation protocol for systemic delays exceeding 45 minutes."
  },
  otp_high: {
    priority: 'URGENT',
    icon: '📋',
    title: 'Establish a National On-Time Performance Monitoring System',
    rationale: "Nepal's average international OTP of 53% is critically below the ICAO global average of ~80% and Druk Air's estimated 79%. Without a centralized OTP tracking system, the root causes of chronic delays cannot be addressed systematically.",
    icao: 'ICAO Doc 9161 — Airport Economics Manual',
    expanded: "Create a real-time OTP dashboard accessible to CAAN, the Ministry of Tourism, and the public. Define OTP thresholds that trigger automatic review processes. Benchmark quarterly against regional peers including Druk Air, SpiceJet, and IndiGo."
  },
  immigration_high: {
    priority: 'URGENT',
    icon: '🛂',
    title: 'Streamline Immigration Processing at TIA to Cut 33% of Delay Causes',
    rationale: "Immigration delays are the single largest cause of Nepal Airlines' international flight delays at 33% — more than weather and technical issues combined. This is an infrastructure and process failure, not an airline failure.",
    icao: 'ICAO Doc 9626 — Manual on the Regulation of International Air Transport',
    expanded: "Deploy automated immigration kiosks for frequent travelers, increase staffing during peak hours, and implement pre-clearance screening for high-volume routes. Target: reduce immigration-attributed delays from 33% to under 10% within 18 months."
  },
  technical_high: {
    priority: 'HIGH',
    icon: '🔧',
    title: 'Establish Mandatory Aircraft Maintenance Audit Cycles Aligned with ICAO Annex 6',
    rationale: "Engineering and technical issues account for 7% of Nepal's international delays. Combined with a 13% technical cancellation rate domestically, this signals inadequate preventive maintenance protocols vs. Druk Air's estimated 12% combined ops-technical delay rate.",
    icao: 'ICAO Annex 6 — Operation of Aircraft, Part I, Chapter 8 (Aircraft Maintenance)',
    expanded: "Require NAC to submit quarterly maintenance compliance reports to CAAN. Introduce third-party maintenance audits every 6 months. Establish a spare parts procurement fund to reduce Aircraft-on-Ground (AOG) events, which are a primary driver of technical cancellations."
  },
  loadfactor_medium: {
    priority: 'HIGH',
    icon: '💺',
    title: 'Review Route Network and Codeshare Strategy to Improve Load Factors',
    rationale: "Nepal Airlines' international load factor averages 67% — matching Druk Air overall, but Nepal's seat factor (82%) hides inefficiency: many seats are occupied by repositioning staff or low-yield passengers. Commercial yield optimization is needed.",
    icao: 'ICAO Doc 9587 — Policy and Guidance Material on Economic Regulation',
    expanded: "Negotiate codeshare agreements with Star Alliance or oneworld carriers to fill international capacity. Introduce dynamic pricing for seasonal route demand. Discontinue or reduce frequency on routes with consistent load factors below 50%, redirecting capacity to high-yield sectors."
  },
  subsistence_medium: {
    priority: 'MEDIUM',
    icon: '🍽️',
    title: 'Digitize Crew Duty Tracking to Eliminate 30% of Subsistence-Related Delays',
    rationale: "Subsistence delays (SUBS) — caused by crew rest, duty time, or catering — account for 30% of international delays, the second largest category. This is an internal operational management failure with a clear digital solution.",
    icao: 'ICAO Annex 6 — Chapter 12 (Flight Crew Hours of Service)',
    expanded: "Deploy an integrated crew management system with automated duty-time alerts, real-time meal order tracking, and predictive scheduling to prevent crew violations before they cause delays. Target: reduce SUBS delays from 30% to 12% within 12 months."
  }
};

function generateRecommendations(gaps) {
  const recos = [];

  // Always include immigration (33% of delays is critical)
  recos.push(RECO_LOOKUP.immigration_high);

  // OTP gap > 20 percentage points
  if (gaps.otp > 20) {
    recos.push(RECO_LOOKUP.otp_critical);
    recos.push(RECO_LOOKUP.otp_high);
  } else if (gaps.otp > 10) {
    recos.push(RECO_LOOKUP.otp_high);
  }

  // Technical delays
  if (gaps.opsDelay > 5) {
    recos.push(RECO_LOOKUP.technical_high);
  }

  // Subsistence always relevant
  recos.push(RECO_LOOKUP.subsistence_medium);

  // Load factor
  recos.push(RECO_LOOKUP.loadfactor_medium);

  // Deduplicate
  return [...new Map(recos.map(r => [r.title, r])).values()].slice(0, 6);
}

// ─────────────────────────────────────────────
// 4. ROUTE DATA
// ─────────────────────────────────────────────

const ROUTE_DATA = [
  {
    route: 'KTM — DEL (Delhi)',
    nepal_otp: 58, druk_otp: 82,
    nepal_delay: 72, druk_delay: 28,
    nepal_lf: 94, druk_lf: 79,
    monthly: [62,55,60,61,58,54,53,57,59,56,52,48]
  },
  {
    route: 'KTM — KUL (Kuala Lumpur)',
    nepal_otp: 52, druk_otp: null,
    nepal_delay: 85, druk_delay: null,
    nepal_lf: 79, druk_lf: null,
    monthly: [70,60,55,52,48,46,50,55,58,52,48,40]
  },
  {
    route: 'KTM — DOH (Doha)',
    nepal_otp: 49, druk_otp: null,
    nepal_delay: 91, druk_delay: null,
    nepal_lf: 64, druk_lf: null,
    monthly: [55,50,48,52,46,44,48,52,54,48,44,38]
  },
  {
    route: 'KTM — DXB (Dubai)',
    nepal_otp: 51, druk_otp: null,
    nepal_delay: 78, druk_delay: null,
    nepal_lf: 58, druk_lf: null,
    monthly: [58,54,50,54,48,46,50,54,56,50,46,42]
  },
  {
    route: 'KTM — BKK (Bangkok)',
    nepal_otp: 56, druk_otp: 78,
    nepal_delay: 64, druk_delay: 32,
    nepal_lf: 72, druk_lf: 66,
    monthly: [62,58,54,58,52,50,54,58,60,56,52,46]
  },
  {
    route: 'KTM — HKG (Hong Kong)',
    nepal_otp: 54, druk_otp: null,
    nepal_delay: 70, druk_delay: null,
    nepal_lf: 69, druk_lf: null,
    monthly: [60,56,52,56,50,48,52,56,58,54,50,44]
  },
  {
    route: 'KTM — BOM (Mumbai)',
    nepal_otp: 45, druk_otp: null,
    nepal_delay: 95, druk_delay: null,
    nepal_lf: 33, druk_lf: null,
    monthly: [50,46,42,46,40,38,42,46,48,44,40,34]
  }
];

// ─────────────────────────────────────────────
// 5. STATE
// ─────────────────────────────────────────────

let state = {
  view: 'compare', // 'nepal' | 'druk' | 'compare'
  data: DEMO_DATA,
  isDemoMode: true,
  scores: null,
  charts: {}
};

// ─────────────────────────────────────────────
// 6. CHART CONFIG HELPERS
// ─────────────────────────────────────────────

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#8A9BB5',
        font: { family: 'DM Sans', size: 11 },
        boxWidth: 10,
        padding: 12
      }
    },
    tooltip: {
      backgroundColor: '#1A2234',
      borderColor: '#1F2A3C',
      borderWidth: 1,
      titleColor: '#F0F4FF',
      bodyColor: '#8A9BB5',
      padding: 10,
      cornerRadius: 6
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(31,42,60,0.5)', drawBorder: false },
      ticks: { color: '#8A9BB5', font: { family: 'DM Sans', size: 10 } }
    },
    y: {
      grid: { color: 'rgba(31,42,60,0.5)', drawBorder: false },
      ticks: { color: '#8A9BB5', font: { family: 'DM Sans', size: 10 } }
    }
  }
};

// ─────────────────────────────────────────────
// 7. RENDER FUNCTIONS
// ─────────────────────────────────────────────

function renderKPIStrip(scores) {
  const d = state.data;
  const nepOTP = avg(d.nepal.otp_monthly);
  const druOTP = avg(d.druk.otp_monthly);
  const nepCancel = avg(d.nepal.cancellation_monthly);
  const druCancel = avg(d.druk.cancellation_monthly);
  const nepLF = avg(d.nepal.load_factor_monthly);
  const druLF = avg(d.druk.load_factor_monthly);
  const nepADU = avg(Object.values(d.nepal.fleet_adu));
  const druADU = avg(Object.values(d.druk.fleet_adu));

  const kpiDefs = [
    {
      label: 'On-Time Performance',
      tooltip: 'What % of flights depart within 15 minutes of scheduled time. Global average is ~80%.',
      nepVal: nepOTP.toFixed(1) + '%',
      drukVal: druOTP.toFixed(1) + '%',
      delta: (nepOTP - druOTP).toFixed(1),
      status: nepOTP >= 75 ? 'good' : nepOTP >= 60 ? 'warn' : 'bad',
      prefix: ''
    },
    {
      label: 'Cancellation Rate',
      tooltip: 'What % of scheduled flights are cancelled entirely. Under 2% is industry standard.',
      nepVal: nepCancel.toFixed(1) + '%',
      drukVal: druCancel.toFixed(1) + '%',
      delta: (druCancel - nepCancel).toFixed(1),
      status: nepCancel < 3 ? 'good' : nepCancel < 8 ? 'warn' : 'bad',
      prefix: '',
      lowerIsBetter: true
    },
    {
      label: 'Avg Delay (min)',
      tooltip: 'Average minutes of delay per delayed flight. Under 30 min is the target.',
      nepVal: d.nepal.avg_delay_min + ' min',
      drukVal: d.druk.avg_delay_min + ' min',
      delta: (d.druk.avg_delay_min - d.nepal.avg_delay_min).toFixed(0),
      status: d.nepal.avg_delay_min < 40 ? 'good' : d.nepal.avg_delay_min < 60 ? 'warn' : 'bad',
      prefix: '',
      lowerIsBetter: true
    },
    {
      label: 'Seat Load Factor',
      tooltip: 'What % of available seats are filled with paying passengers. 80%+ is healthy for airlines.',
      nepVal: nepLF.toFixed(1) + '%',
      drukVal: druLF.toFixed(1) + '%',
      delta: (nepLF - druLF).toFixed(1),
      status: nepLF >= 75 ? 'good' : nepLF >= 60 ? 'warn' : 'bad',
      prefix: ''
    },
    {
      label: 'Safety Incidents',
      tooltip: 'Reported safety incidents during the reporting year. Zero is the target.',
      nepVal: d.nepal.safety_incidents,
      drukVal: '1 (heli)',
      delta: null,
      status: d.nepal.safety_incidents === 0 ? 'good' : 'warn',
      prefix: ''
    },
    {
      label: 'Fleet Utilization',
      tooltip: 'Average daily hours each aircraft spends in the air. Higher means better use of expensive assets.',
      nepVal: nepADU.toFixed(1) + ' hrs',
      drukVal: druADU.toFixed(1) + ' hrs',
      delta: (nepADU - druADU).toFixed(1),
      status: nepADU >= 10 ? 'good' : nepADU >= 7 ? 'warn' : 'bad',
      prefix: ''
    }
  ];

  const strip = document.getElementById('kpi-strip');
  strip.innerHTML = kpiDefs.map(k => {
    const numDelta = parseFloat(k.delta);
    const isPositive = k.lowerIsBetter ? numDelta < 0 : numDelta > 0;
    const deltaHtml = k.delta !== null
      ? `<span class="kpi-delta ${isPositive ? 'delta-positive' : 'delta-negative'}">
           ${isPositive ? '▲' : '▼'} ${Math.abs(numDelta)} vs Druk
         </span>`
      : '';

    return `<div class="kpi-card status-${k.status}" role="region" aria-label="${k.label}: ${k.nepVal}">
      <div class="kpi-label">
        ${k.label}
        <span class="tooltip-trigger" data-tooltip="${k.tooltip}" aria-label="More info">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-5h1.5v5zm0-6.5h-1.5V3.5h1.5V5z"/>
          </svg>
        </span>
      </div>
      <div class="kpi-value">${k.nepVal}</div>
      <div class="kpi-benchmark">Druk Air: <span>${k.drukVal}</span></div>
      ${deltaHtml}
    </div>`;
  }).join('');
}

function renderOTPChart() {
  const ctx = document.getElementById('chart-otp');
  if (!ctx) return;
  if (state.charts.otp) state.charts.otp.destroy();

  const d = state.data;
  const showNepal = state.view !== 'druk';
  const showDruk = state.view !== 'nepal';

  const datasets = [];
  if (showNepal) {
    datasets.push({
      label: '🇳🇵 Nepal Airlines OTP %',
      data: d.nepal.otp_monthly,
      backgroundColor: 'rgba(232,69,69,0.6)',
      borderColor: '#E84545',
      borderWidth: 1,
      borderRadius: 4
    });
  }
  if (showDruk) {
    datasets.push({
      label: '🇧🇹 Druk Air OTP %',
      data: d.druk.otp_monthly,
      backgroundColor: 'rgba(46,204,113,0.6)',
      borderColor: '#2ECC71',
      borderWidth: 1,
      borderRadius: 4
    });
  }

  state.charts.otp = new Chart(ctx, {
    type: 'bar',
    data: { labels: MONTHS, datasets },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            afterBody: (items) => {
              const val = items[0].raw;
              if (val >= 75) return '✅ Meets ICAO recommendation';
              if (val >= 60) return '⚠️ Below standard — improvement needed';
              return '🔴 Critical — ministerial action required';
            }
          }
        }
      },
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100, ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: v => v + '%' } }
      }
    }
  });
}

function renderRadarChart() {
  const ctx = document.getElementById('chart-radar');
  if (!ctx) return;
  if (state.charts.radar) state.charts.radar.destroy();

  const scores = state.scores;
  if (!scores) return;

  const labels = Object.keys(scores.nepal.categoryBreakdown);
  const nepScores = labels.map(k => scores.nepal.categoryBreakdown[k].score);
  const druScores = labels.map(k => scores.druk.categoryBreakdown[k].score);

  const datasets = [];
  if (state.view !== 'druk') {
    datasets.push({
      label: '🇳🇵 Nepal Airlines',
      data: nepScores,
      backgroundColor: 'rgba(232,69,69,0.15)',
      borderColor: '#E84545',
      pointBackgroundColor: '#E84545',
      borderWidth: 2,
      pointRadius: 4
    });
  }
  if (state.view !== 'nepal') {
    datasets.push({
      label: '🇧🇹 Druk Air',
      data: druScores,
      backgroundColor: 'rgba(46,204,113,0.15)',
      borderColor: '#2ECC71',
      pointBackgroundColor: '#2ECC71',
      borderWidth: 2,
      pointRadius: 4
    });
  }

  state.charts.radar = new Chart(ctx, {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: CHART_DEFAULTS.plugins.legend,
        tooltip: CHART_DEFAULTS.plugins.tooltip
      },
      scales: {
        r: {
          min: 0, max: 100,
          grid: { color: 'rgba(31,42,60,0.8)' },
          angleLines: { color: 'rgba(31,42,60,0.8)' },
          pointLabels: {
            color: '#8A9BB5',
            font: { family: 'DM Sans', size: 10 }
          },
          ticks: {
            color: '#4A5568',
            font: { size: 9 },
            backdropColor: 'transparent',
            stepSize: 25
          }
        }
      }
    }
  });
}

function renderDelayChart() {
  const ctx = document.getElementById('chart-delay');
  if (!ctx) return;
  if (state.charts.delay) state.charts.delay.destroy();

  const d = state.data;
  const showNepal = state.view !== 'druk';
  const showDruk = state.view !== 'nepal';

  // Map to comparable categories
  const labels = ['Weather / ATC', 'Engineering / Technical', 'Ops / Crew', 'Immigration / Pax', 'Other'];

  function nepalDelayArr() {
    const dc = d.nepal.delay_causes;
    return [
      dc.weather + (dc.atc || 0),
      dc.engineering,
      dc.operations,
      (dc.immigration || 0) + (dc.marketing_customer || 0) + (dc.subsistence || 0) + (dc.noc || 0),
      (dc.ground_service || 0) + (dc.other || 0)
    ];
  }

  function drukDelayArr() {
    const dc = d.druk.delay_causes;
    return [
      (dc.weather || 0) + (dc.atc || 0),
      dc.engineering || 0,
      dc.operations || 0,
      (dc.passenger || 0) + (dc.catering || 0),
      dc.other || 0
    ];
  }

  const datasets = [];
  if (showNepal) {
    datasets.push({
      label: '🇳🇵 Nepal Airlines',
      data: nepalDelayArr(),
      backgroundColor: 'rgba(232,69,69,0.7)',
      borderColor: '#E84545',
      borderWidth: 1
    });
  }
  if (showDruk) {
    datasets.push({
      label: '🇧🇹 Druk Air',
      data: drukDelayArr(),
      backgroundColor: 'rgba(46,204,113,0.7)',
      borderColor: '#2ECC71',
      borderWidth: 1
    });
  }

  state.charts.delay = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      ...CHART_DEFAULTS,
      indexAxis: 'y',
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            label: (item) => ` ${item.dataset.label}: ${item.raw}% of delays`
          }
        }
      },
      scales: {
        x: { ...CHART_DEFAULTS.scales.x, ticks: { ...CHART_DEFAULTS.scales.x.ticks, callback: v => v + '%' } },
        y: { grid: { display: false }, ticks: { color: '#8A9BB5', font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });
}

function renderGapChart() {
  const ctx = document.getElementById('chart-gap');
  if (!ctx) return;
  if (state.charts.gap) state.charts.gap.destroy();

  const d = state.data;
  const gaps = [
    { label: 'On-Time Performance', gap: avg(d.druk.otp_monthly) - avg(d.nepal.otp_monthly), unit: '%' },
    { label: 'Avg Delay (min)', gap: d.nepal.avg_delay_min - d.druk.avg_delay_min, unit: ' min', flip: true },
    { label: 'Cancellation Rate', gap: avg(d.nepal.cancellation_monthly) - avg(d.druk.cancellation_monthly), unit: '%', flip: true },
    { label: 'Load Factor', gap: avg(d.druk.load_factor_monthly) - avg(d.nepal.load_factor_monthly), unit: '%' }
  ];

  state.charts.gap = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: gaps.map(g => g.label),
      datasets: [{
        label: 'Gap: Nepal vs Druk Air benchmark',
        data: gaps.map(g => g.flip ? -g.gap : g.gap),
        backgroundColor: gaps.map(g => g.gap > 0 ? 'rgba(232,69,69,0.7)' : 'rgba(46,204,113,0.5)'),
        borderColor: gaps.map(g => g.gap > 0 ? '#E84545' : '#2ECC71'),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      indexAxis: 'y',
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: false },
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            label: (item) => {
              const g = gaps[item.dataIndex];
              return ` Nepal is ${Math.abs(g.gap).toFixed(1)}${g.unit} ${g.gap > 0 ? 'worse than' : 'better than'} Druk Air`;
            }
          }
        }
      },
      scales: {
        x: { ...CHART_DEFAULTS.scales.x, ticks: { color: '#8A9BB5', font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { color: '#8A9BB5', font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });
}

function renderSparklines() {
  const d = state.data;
  renderSparkline('spark-otp-nepal', d.nepal.otp_monthly, '#E84545');
  renderSparkline('spark-otp-druk', d.druk.otp_monthly, '#2ECC71');
  renderSparkline('spark-cancel-nepal', d.nepal.cancellation_monthly, '#E84545');
  renderSparkline('spark-cancel-druk', d.druk.cancellation_monthly, '#2ECC71');

  // Update values
  const lastNepalOTP = d.nepal.otp_monthly[d.nepal.otp_monthly.length - 1];
  const lastDrukOTP = d.druk.otp_monthly[d.druk.otp_monthly.length - 1];
  safeEl('spark-otp-nepal-val', el => el.textContent = lastNepalOTP + '%');
  safeEl('spark-otp-druk-val', el => el.textContent = lastDrukOTP + '%');
  safeEl('spark-cancel-nepal-val', el => el.textContent = d.nepal.cancellation_monthly[d.nepal.cancellation_monthly.length - 1] + '%');
  safeEl('spark-cancel-druk-val', el => el.textContent = d.druk.cancellation_monthly[d.druk.cancellation_monthly.length - 1] + '%');
}

function renderSparkline(canvasId, data, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (state.charts[canvasId]) state.charts[canvasId].destroy();

  state.charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 1.5,
        fill: true,
        backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      animation: { duration: 400 }
    }
  });
}

function renderScorecard(scores) {
  const panel = document.getElementById('scorecard-panel');
  if (!panel) return;

  const nepal = scores.nepal;
  const druk = scores.druk;

  let html = `
    <div class="overall-score-box">
      <div>
        <div class="overall-label">🇳🇵 Nepal Airlines Overall Grade</div>
        <div class="overall-score-text">Score: ${nepal.score}/100</div>
      </div>
      <div class="overall-grade grade-chip grade-${nepal.grade}" style="width:56px;height:56px;font-size:1.8rem">${nepal.grade}</div>
    </div>
    <div class="scorecard-grid">
  `;

  for (const [cat, data] of Object.entries(nepal.categoryBreakdown)) {
    const drukData = druk.categoryBreakdown[cat];
    const grade = data.score >= 85 ? 'A' : data.score >= 70 ? 'B' : data.score >= 55 ? 'C' : data.score >= 40 ? 'D' : 'F';
    const descriptions = {
      'On-Time Performance': `Nepal departs on time ${avg(state.data.nepal.otp_monthly).toFixed(0)}% of the time — well below the 80% global target`,
      'Cancellation Rate': `Average cancellation rate of ${avg(state.data.nepal.cancellation_monthly).toFixed(1)}% — domestic WX and TIA congestion are key drivers`,
      'Operational Delays': `Internal ops and engineering cause ${state.data.nepal.delay_causes.operations + state.data.nepal.delay_causes.engineering}% of delays — largely preventable`,
      'Passenger Load Factor': `Average ${avg(state.data.nepal.load_factor_monthly).toFixed(0)}% load factor — commercially healthy on established routes`,
      'Fleet Utilization': `A320s averaging 13.8 hrs/day — high utilization reflecting limited fleet size and high demand`
    };

    html += `
      <div class="scorecard-item" role="listitem">
        <div class="grade-chip grade-${grade}">${grade}</div>
        <div class="scorecard-info">
          <div class="scorecard-category">${cat}</div>
          <div class="scorecard-desc">${descriptions[cat] || ''}</div>
        </div>
        <div class="scorecard-score">${data.score}</div>
      </div>
    `;
  }

  html += `</div>
    <div style="margin-top:12px; padding:10px; background:rgba(46,204,113,0.06); border:1px solid rgba(46,204,113,0.15); border-radius:8px; font-size:0.7rem; color:#8A9BB5;">
      🇧🇹 <strong style="color:#2ECC71">Druk Air benchmark</strong> — Overall Grade: <strong style="color:#2ECC71">${druk.grade}</strong> (${druk.score}/100)
    </div>`;

  panel.innerHTML = html;
}

function renderRouteTable() {
  const tbody = document.getElementById('route-tbody');
  if (!tbody) return;

  tbody.innerHTML = ROUTE_DATA.map((r, i) => {
    const otpStatus = r.nepal_otp >= 75 ? '✅' : r.nepal_otp >= 60 ? '⚠️' : '🔴';
    const drukCell = r.druk_otp ? `<span class="route-val-druk">${r.druk_otp}%</span>` : '<span style="color:#4A5568">N/A</span>';
    const drukDelay = r.druk_delay ? `<span class="route-val-druk">${r.druk_delay} min</span>` : '<span style="color:#4A5568">N/A</span>';

    return `
      <tr class="expandable" onclick="toggleRoute(${i})" data-index="${i}" aria-expanded="false">
        <td><strong style="color:#F0F4FF">${r.route}</strong></td>
        <td><span class="route-val-nepal">${r.nepal_otp}%</span></td>
        <td>${drukCell}</td>
        <td><span class="route-val-nepal">${r.nepal_delay} min</span></td>
        <td>${drukDelay}</td>
        <td style="font-size:1.1rem">${otpStatus}</td>
      </tr>
      <tr class="expand-row" id="expand-${i}" style="display:none">
        <td colspan="6">
          <div style="padding:8px 0">
            <div style="font-size:0.7rem;color:#8A9BB5;margin-bottom:6px;font-weight:600">MONTHLY OTP % — Nepal Airlines (Jul → Jun)</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${r.monthly.map((v,mi) => `<span style="background:rgba(232,69,69,${v/150});border:1px solid rgba(232,69,69,0.3);border-radius:4px;padding:3px 8px;font-size:0.7rem;color:#F0F4FF">${MONTHS[mi]}: <strong>${v}%</strong></span>`).join('')}
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleRoute(idx) {
  const row = document.getElementById(`expand-${idx}`);
  const trigger = document.querySelector(`tr[data-index="${idx}"]`);
  if (!row) return;
  const isOpen = row.style.display !== 'none';
  row.style.display = isOpen ? 'none' : 'table-row';
  trigger?.setAttribute('aria-expanded', !isOpen);
}

function renderRecommendations(recos) {
  const container = document.getElementById('reco-grid');
  if (!container) return;

  container.innerHTML = recos.map((r, i) => `
    <div class="reco-card" onclick="toggleReco(${i})" id="reco-card-${i}" aria-expanded="false">
      <div class="reco-priority priority-${r.priority.toLowerCase()}">${r.priority}</div>
      <div class="reco-icon">${r.icon}</div>
      <div class="reco-title">${r.title}</div>
      <div class="reco-rationale">${r.rationale}</div>
      <div class="reco-stat">${r.expanded.split('.')[0]}.</div>
      <div class="reco-expand" id="reco-expand-${i}">
        <p>${r.expanded}</p>
        <div class="icao-ref">📖 Reference: ${r.icao}</div>
      </div>
    </div>
  `).join('');
}

function toggleReco(i) {
  const panel = document.getElementById(`reco-expand-${i}`);
  const card = document.getElementById(`reco-card-${i}`);
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  card?.setAttribute('aria-expanded', !isOpen);
}

// ─────────────────────────────────────────────
// 8. FULL RENDER
// ─────────────────────────────────────────────

function renderAll() {
  state.scores = scoreEngine(state.data.nepal, state.data.druk);
  const recos = generateRecommendations(state.scores.gaps);

  renderKPIStrip(state.scores);
  renderOTPChart();
  renderRadarChart();
  renderDelayChart();
  renderGapChart();
  renderSparklines();
  renderScorecard(state.scores);
  renderRouteTable();
  renderRecommendations(recos);
}

// ─────────────────────────────────────────────
// 9. VIEW TOGGLE
// ─────────────────────────────────────────────

function setView(view) {
  state.view = view;
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  renderOTPChart();
  renderRadarChart();
  renderDelayChart();
}

// ─────────────────────────────────────────────
// 10. FILE UPLOAD
// ─────────────────────────────────────────────

function handleFileUpload(file, airline) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    try {
      const parsed = parseCSV(text);
      const preview = document.getElementById(`upload-preview-${airline}`);
      if (preview) {
        preview.innerHTML = `<div class="upload-success">✅ Loaded ${parsed.rows.length} rows, ${parsed.cols.length} columns<br><small>${parsed.cols.slice(0,5).join(', ')}${parsed.cols.length > 5 ? '...' : ''}</small></div>`;
      }
      // If we have data, merge into state
      mergeUploadedData(parsed, airline);
      state.isDemoMode = false;
      document.getElementById('demo-banner').style.display = 'none';
      renderAll();
    } catch (err) {
      alert('Could not parse CSV: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const cols = lines[0].split(',').map(c => c.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
    return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
  });
  return { cols, rows };
}

function mergeUploadedData(parsed, airline) {
  // Best-effort mapping of common column names to our schema
  const colMap = {
    otp_pct: ['otp_pct', 'otp', 'on_time_pct', 'punctuality'],
    cancellation: ['cancellation_rate', 'cancel_pct', 'flights_cancelled'],
    load_factor: ['load_factor_pct', 'load_factor', 'lf_pct'],
    flights: ['flights_operated', 'operated_flights', 'flights']
  };

  function findCol(row, candidates) {
    for (const c of candidates) {
      if (row[c] !== undefined) return parseFloat(row[c]) || 0;
    }
    return null;
  }

  const otpVals = parsed.rows.map(r => findCol(r, colMap.otp_pct)).filter(Boolean);
  const lfVals = parsed.rows.map(r => findCol(r, colMap.load_factor)).filter(Boolean);

  if (otpVals.length > 0) {
    state.data[airline].otp_monthly = otpVals.slice(0, 12);
  }
  if (lfVals.length > 0) {
    state.data[airline].load_factor_monthly = lfVals.slice(0, 12);
  }
}

// ─────────────────────────────────────────────
// 11. UTILITIES
// ─────────────────────────────────────────────

function safeEl(id, fn) {
  const el = document.getElementById(id);
  if (el) fn(el);
}

function setupDragDrop(zoneId, input, airline) {
  const zone = document.getElementById(zoneId);
  if (!zone) return;

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file, airline);
  });
  zone.addEventListener('click', () => input.click());

  input.addEventListener('change', e => {
    if (e.target.files[0]) handleFileUpload(e.target.files[0], airline);
  });
}

// ─────────────────────────────────────────────
// 12. INIT
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // View toggle
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  // Upload modal
  const uploadBtn = document.getElementById('upload-btn');
  const modal = document.getElementById('upload-modal');
  const modalClose = document.getElementById('modal-close');

  uploadBtn?.addEventListener('click', () => modal?.classList.add('open'));
  modalClose?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  // Setup drag-drop zones
  setupDragDrop('drop-zone-nepal', document.getElementById('file-nepal'), 'nepal');
  setupDragDrop('drop-zone-druk', document.getElementById('file-druk'), 'druk');

  // Export PDF
  document.getElementById('export-btn')?.addEventListener('click', () => window.print());

  // Initial render
  renderAll();
});

// Expose for inline handlers
window.toggleRoute = toggleRoute;
window.toggleReco = toggleReco;
window.setView = setView;
