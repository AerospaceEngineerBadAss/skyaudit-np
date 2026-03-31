'use strict';

(function fleetPageScope() {
  const fleetRecords = Array.isArray(window.SKYAUDIT_FLEET_DATA) ? window.SKYAUDIT_FLEET_DATA : [];
  const airlineOrder = ['Nepal Airlines', 'Drukair'];
  const categoryOrder = ['narrowbody', 'widebody', 'turboprop', 'specialty'];
  const categoryLabels = {
    narrowbody: 'Narrowbody',
    widebody: 'Widebody',
    turboprop: 'Turboprop',
    specialty: 'Specialty'
  };
  const airlineMeta = {
    Drukair: {
      shortLabel: 'Drukair',
      accent: '#1DAB9F',
      accentSoft: 'rgba(29,171,159,0.16)',
      className: 'druk'
    },
    'Nepal Airlines': {
      shortLabel: 'Nepal Airlines',
      accent: '#E8253D',
      accentSoft: 'rgba(232,37,61,0.16)',
      className: 'nepal'
    }
  };

  const tableState = { filter: 'all' };
  const chartInstances = [];

  document.addEventListener('DOMContentLoaded', initializeFleetPage);

  function initializeFleetPage() {
    if (!document.body.classList.contains('fleet-page')) {
      return;
    }

    const metrics = computeFleetMetrics(fleetRecords);
    renderSummaryCards(metrics);
    renderTableFilters(metrics.filteredRecords);
    renderFleetTable(metrics.filteredRecords);
    renderCharts(metrics);
    renderStrategicImplications(metrics);
  }

  function computeFleetMetrics(records) {
    const filteredRecords = records.filter((aircraft) => aircraft.tail !== 'A5-BHT');
    const byAirline = {};

    airlineOrder.forEach((airline) => {
      const airlineRecords = filteredRecords.filter((aircraft) => aircraft.airline === airline);
      const activeRecords = airlineRecords.filter((aircraft) => aircraft.status === 'active');
      const seatComparableActive = activeRecords.filter((aircraft) => aircraft.includeInSeatCapacityComparison);
      const uniqueTypes = new Set(airlineRecords.map((aircraft) => aircraft.aircraftType));

      byAirline[airline] = {
        airline,
        totalAircraft: airlineRecords.length,
        activeAircraft: activeRecords.length,
        inactiveAircraft: airlineRecords.length - activeRecords.length,
        fleetDiversity: uniqueTypes.size,
        estimatedSeatCapacity: sum(seatComparableActive.map((aircraft) => aircraft.totalSeats)),
        averageSeatsPerActiveAircraft: seatComparableActive.length
          ? sum(seatComparableActive.map((aircraft) => aircraft.totalSeats)) / seatComparableActive.length
          : 0,
        jetCount: activeRecords.filter((aircraft) => ['narrowbody', 'widebody'].includes(aircraft.category)).length,
        turbopropCount: activeRecords.filter((aircraft) => aircraft.category === 'turboprop').length,
        specialtyCount: activeRecords.filter((aircraft) => aircraft.category === 'specialty').length,
        widebodyCount: activeRecords.filter((aircraft) => aircraft.category === 'widebody').length,
        narrowbodyCount: activeRecords.filter((aircraft) => aircraft.category === 'narrowbody').length,
        records: airlineRecords,
        activeRecords,
        seatComparableActive
      };
    });

    return {
      filteredRecords,
      byAirline,
      seatCapacityNote: 'Seat-based comparisons exclude helicopter/specialty aircraft and do not fully capture utility or special-mission value.'
    };
  }

  function renderSummaryCards(metrics) {
    const host = document.getElementById('fleet-summary-grid');
    if (!host) {
      return;
    }

    host.innerHTML = airlineOrder.map((airline) => {
      const summary = metrics.byAirline[airline];
      const meta = airlineMeta[airline];

      return `
        <article class="fleet-summary-card fleet-summary-card-${meta.className}">
          <div class="fleet-summary-top">
            <div>
              <div class="fleet-summary-label">${meta.shortLabel}</div>
              <h3>${summary.activeAircraft} active airframes</h3>
            </div>
            <span class="fleet-summary-pill">${summary.fleetDiversity} types</span>
          </div>
          <div class="fleet-summary-metrics">
            ${renderSummaryMetric('Total aircraft', summary.totalAircraft)}
            ${renderSummaryMetric('Active aircraft', summary.activeAircraft)}
            ${renderSummaryMetric('Seat capacity', formatNumber(summary.estimatedSeatCapacity))}
            ${renderSummaryMetric('Avg seats / active aircraft', formatNumber(summary.averageSeatsPerActiveAircraft, 1))}
            ${renderSummaryMetric('Jets', summary.jetCount)}
            ${renderSummaryMetric('Turboprops', summary.turbopropCount)}
            ${renderSummaryMetric('Specialty aircraft', summary.specialtyCount)}
            ${renderSummaryMetric('Widebodies', summary.widebodyCount)}
            ${renderSummaryMetric('Narrowbodies', summary.narrowbodyCount)}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderSummaryMetric(label, value) {
    return `
      <div class="fleet-mini-stat">
        <span class="fleet-mini-label">${label}</span>
        <strong>${value}</strong>
      </div>
    `;
  }

  function renderTableFilters(records) {
    const host = document.getElementById('fleet-table-filters');
    if (!host) {
      return;
    }

    const filters = [
      { key: 'all', label: `All aircraft (${records.length})` },
      ...airlineOrder.map((airline) => ({
        key: airline,
        label: `${airlineMeta[airline].shortLabel} (${records.filter((record) => record.airline === airline).length})`
      }))
    ];

    host.innerHTML = filters.map((filter) => `
      <button
        type="button"
        class="fleet-filter-btn${filter.key === tableState.filter ? ' is-active' : ''}"
        data-fleet-filter="${escapeAttribute(filter.key)}">
        ${filter.label}
      </button>
    `).join('');

    host.querySelectorAll('[data-fleet-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        tableState.filter = button.getAttribute('data-fleet-filter') || 'all';
        renderTableFilters(records);
        renderFleetTable(records);
      });
    });
  }

  function renderFleetTable(records) {
    const body = document.getElementById('fleet-table-body');
    if (!body) {
      return;
    }

    const visibleRecords = tableState.filter === 'all'
      ? records
      : records.filter((record) => record.airline === tableState.filter);

    body.innerHTML = visibleRecords.map((record) => {
      const meta = airlineMeta[record.airline];
      const notes = record.notes || (record.includeInSeatCapacityComparison ? '—' : 'Excluded from seat-capacity comparisons');
      return `
        <tr>
          <td><span class="fleet-airline-pill fleet-airline-pill-${meta.className}">${record.airline}</span></td>
          <td>${record.aircraftType}</td>
          <td><code>${record.tail}</code></td>
          <td><span class="fleet-status-pill">${titleCase(record.status)}</span></td>
          <td>${record.seatLayout || 'N/A'}</td>
          <td>${Number.isFinite(record.totalSeats) ? formatNumber(record.totalSeats) : 'N/A'}</td>
          <td>${categoryLabels[record.category] || titleCase(record.category)}</td>
          <td>${record.role}</td>
          <td>${notes}</td>
        </tr>
      `;
    }).join('');
  }

  function renderCharts(metrics) {
    destroyCharts();
    renderSeatCapacityChart(metrics.byAirline);
    renderFleetMixChart(metrics.byAirline);
    renderAircraftTypeChart(metrics.filteredRecords);
  }

  function renderSeatCapacityChart(byAirline) {
    const canvas = document.getElementById('seat-capacity-chart');
    if (!canvas || !window.Chart) {
      return;
    }

    chartInstances.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: airlineOrder.map((airline) => airlineMeta[airline].shortLabel),
        datasets: [{
          label: 'Active seat capacity',
          data: airlineOrder.map((airline) => byAirline[airline].estimatedSeatCapacity),
          backgroundColor: airlineOrder.map((airline) => airlineMeta[airline].accent),
          borderRadius: 10,
          maxBarThickness: 60
        }]
      },
      options: buildChartOptions({
        yTitle: 'Seats',
        integerTicks: true
      })
    }));
  }

  function renderFleetMixChart(byAirline) {
    const canvas = document.getElementById('fleet-mix-chart');
    if (!canvas || !window.Chart) {
      return;
    }

    chartInstances.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: airlineOrder.map((airline) => airlineMeta[airline].shortLabel),
        datasets: categoryOrder.map((category) => ({
          label: categoryLabels[category],
          data: airlineOrder.map((airline) =>
            byAirline[airline].activeRecords.filter((record) => record.category === category).length
          ),
          backgroundColor: categoryColor(category)
        }))
      },
      options: buildChartOptions({
        stacked: true,
        yTitle: 'Aircraft',
        integerTicks: true
      })
    }));
  }

  function renderAircraftTypeChart(records) {
    const canvas = document.getElementById('aircraft-type-chart');
    if (!canvas || !window.Chart) {
      return;
    }

    const types = Array.from(new Set(records.map((record) => record.aircraftType)));
    chartInstances.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: types,
        datasets: airlineOrder.map((airline) => ({
          label: airlineMeta[airline].shortLabel,
          data: types.map((type) => records.filter((record) => record.airline === airline && record.aircraftType === type).length),
          backgroundColor: airlineMeta[airline].accent,
          borderRadius: 8,
          maxBarThickness: 32
        }))
      },
      options: buildChartOptions({
        yTitle: 'Aircraft',
        integerTicks: true
      })
    }));
  }

  function buildChartOptions(config) {
    const root = getComputedStyle(document.documentElement);
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          labels: {
            color: root.getPropertyValue('--muted').trim(),
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: 'rectRounded'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(8, 12, 22, 0.96)',
          titleColor: '#EDF1FF',
          bodyColor: '#D7DDED',
          borderColor: 'rgba(40, 58, 88, 0.9)',
          borderWidth: 1,
          padding: 12,
          displayColors: true
        }
      },
      scales: {
        x: {
          stacked: !!config.stacked,
          ticks: {
            color: root.getPropertyValue('--muted').trim()
          },
          grid: {
            display: false
          },
          border: {
            color: 'rgba(30,42,68,0.75)'
          }
        },
        y: {
          stacked: !!config.stacked,
          beginAtZero: true,
          ticks: {
            precision: config.integerTicks ? 0 : undefined,
            color: root.getPropertyValue('--muted').trim()
          },
          title: config.yTitle ? {
            display: true,
            text: config.yTitle,
            color: root.getPropertyValue('--muted').trim()
          } : undefined,
          grid: {
            color: 'rgba(30,42,68,0.58)'
          },
          border: {
            color: 'rgba(30,42,68,0.75)'
          }
        }
      }
    };
  }

  function renderStrategicImplications(metrics) {
    const host = document.getElementById('fleet-implications-list');
    if (!host) {
      return;
    }

    const druk = metrics.byAirline.Drukair;
    const nepal = metrics.byAirline['Nepal Airlines'];
    const implications = [
      `Drukair operates the more mission-diverse fleet in this dataset, spanning ${druk.fleetDiversity} aircraft types across narrowbody, turboprop, and specialty helicopter roles.`,
      `Nepal Airlines concentrates ${formatNumber(nepal.estimatedSeatCapacity)} active fixed-wing seats into ${nepal.seatComparableActive.length} passenger aircraft, versus ${formatNumber(druk.estimatedSeatCapacity)} seats across ${druk.seatComparableActive.length} comparable Drukair airframes.`,
      `Nepal Airlines carries a higher average seat gauge at ${formatNumber(nepal.averageSeatsPerActiveAircraft, 1)} seats per active fixed-wing aircraft, materially above Drukair's ${formatNumber(druk.averageSeatsPerActiveAircraft, 1)}.`,
      `Drukair's turboprop and helicopter assets extend network utility and access flexibility, but they also add operating-model complexity that is not visible in seat-only comparisons.`,
      `Nepal Airlines' two A330-200 widebodies create stronger trunk and long-haul capacity, but that also concentrates a meaningful share of seat supply in a small number of large aircraft.`,
      `Both airlines rely on mixed narrowbody and turboprop capability, yet Drukair's specialty aircraft make its fleet structure more multi-role while Nepal Airlines remains more seat-dense and international-capacity focused.`
    ];

    host.innerHTML = implications.map((item) => `<li>${item}</li>`).join('');
  }

  function destroyCharts() {
    while (chartInstances.length) {
      const chart = chartInstances.pop();
      chart.destroy();
    }
  }

  function categoryColor(category) {
    const palette = {
      narrowbody: '#E8253D',
      widebody: '#F47920',
      turboprop: '#4A86E8',
      specialty: '#1DAB9F'
    };
    return palette[category] || '#A9BAD9';
  }

  function sum(values) {
    return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
  }

  function formatNumber(value, digits) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0
    });
  }

  function titleCase(value) {
    return String(value)
      .split(/[\s-]+/)
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ');
  }

  function escapeAttribute(value) {
    return String(value).replace(/"/g, '&quot;');
  }
})();
