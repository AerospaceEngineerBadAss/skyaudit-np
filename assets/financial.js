'use strict';

(function financialPageScope() {
  const data = window.SKYAUDIT_FINANCIAL_DATA;
  const chartInstances = [];

  const statementTitles = {
    financialPosition: 'Statement of Financial Position',
    profitLoss: 'Statement of Profit or Loss',
    comprehensiveIncome: 'Statement of Other Comprehensive Income',
    cashFlows: 'Statement of Cash Flows',
    changesEquityCurrentYear: 'Statement of Changes in Equity - Current Year',
    changesEquityPreviousYear: 'Statement of Changes in Equity - Previous Year'
  };

  document.addEventListener('DOMContentLoaded', initFinancialPage);

  function initFinancialPage() {
    if (!document.body.classList.contains('financial-page') || !data) {
      return;
    }

    renderExecutiveSummary();
    renderKpis();
    renderCharts();
    renderFindings();
    renderStatements();
  }

  function renderExecutiveSummary() {
    const summaryHost = document.getElementById('financial-summary-copy');
    const noteHost = document.getElementById('financial-source-note');
    if (!summaryHost || !noteHost) {
      return;
    }

    summaryHost.innerHTML = `
      <p>The workbook currently available covers <strong>${escapeHtml(data.meta.availableYears[0])}</strong> and <strong>${escapeHtml(data.meta.availableYears[1])}</strong> across profit/loss, other comprehensive income, cash flows, and changes in equity, with a <strong>${escapeHtml(data.meta.availableYears[2])}</strong> restated balance-sheet year also present in the Statement of Financial Position.</p>
      <p>This page is designed to surface the big picture quickly, show the main numbers visually, and provide direct access to the workbook for deeper review. Displayed figures come from the reconstructed/extracted workbook only.</p>
    `;

    noteHost.textContent = `${data.meta.sourceNote} ${data.meta.validationNote}`;
  }

  function renderKpis() {
    const host = document.getElementById('financial-kpi-grid');
    if (!host) {
      return;
    }

    const current = data.kpis;
    const previousRevenue = data.chartSeries.revenueVsExpenditure.revenue[1];
    const previousExpenditure = data.chartSeries.revenueVsExpenditure.expenditure[1];
    const previousProfit = data.chartSeries.netProfitLoss.values[1];
    const previousCash = data.chartSeries.cashAndCashEquivalents.values[1];
    const previousAssets = data.chartSeries.assetsLiabilitiesEquity.assets[1];
    const previousLiabilities = data.chartSeries.assetsLiabilitiesEquity.liabilities[1];
    const previousEquity = data.chartSeries.assetsLiabilitiesEquity.equity[1];

    const cards = [
      buildKpiCard('Revenue from Operation', current.revenue, diffText(current.revenue - previousRevenue)),
      buildKpiCard('Total Expenditure', current.costOfSales + current.operatingExpenditure, diffText((current.costOfSales + current.operatingExpenditure) - previousExpenditure)),
      buildKpiCard('Profit/(Loss) after Tax', current.netProfitLoss, diffText(current.netProfitLoss - previousProfit)),
      buildKpiCard('Cash and Cash Equivalents', current.cashAndCashEquivalents, diffText(current.cashAndCashEquivalents - previousCash)),
      buildKpiCard('Total Assets', current.totalAssets, diffText(current.totalAssets - previousAssets)),
      buildKpiCard('Total Liabilities', current.totalLiabilities, diffText(current.totalLiabilities - previousLiabilities)),
      buildKpiCard('Total Equity', current.totalEquity, diffText(current.totalEquity - previousEquity))
    ];

    host.innerHTML = cards.join('');
  }

  function buildKpiCard(label, value, subline) {
    const negativeClass = value < 0 ? ' is-negative' : '';
    return `
      <article class="card financial-kpi-card${negativeClass}">
        <div class="financial-kpi-label">${escapeHtml(label)}</div>
        <div class="financial-kpi-value" title="${formatFullNumber(value)}">${formatCompactNumber(value)}</div>
        <div class="financial-kpi-subline">${escapeHtml(subline)}</div>
      </article>
    `;
  }

  function renderCharts() {
    if (!window.Chart) {
      return;
    }

    destroyCharts();
    createRevenueChart();
    createProfitChart();
    createCashChart();
    createBalanceChart();
  }

  function createRevenueChart() {
    const canvas = document.getElementById('financial-revenue-chart');
    if (!canvas) {
      return;
    }

    const labels = [...data.chartSeries.revenueVsExpenditure.labels].reverse();
    const revenue = [...data.chartSeries.revenueVsExpenditure.revenue].reverse();
    const expenditure = [...data.chartSeries.revenueVsExpenditure.expenditure].reverse();

    chartInstances.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue from Operation',
            data: revenue,
            backgroundColor: '#E8253D',
            borderRadius: 10
          },
          {
            label: 'Expenditure',
            data: expenditure,
            backgroundColor: '#4A86E8',
            borderRadius: 10
          }
        ]
      },
      options: buildChartOptions()
    }));
  }

  function createProfitChart() {
    const canvas = document.getElementById('financial-profit-chart');
    if (!canvas) {
      return;
    }

    const labels = [...data.chartSeries.netProfitLoss.labels].reverse();
    const values = [...data.chartSeries.netProfitLoss.values].reverse();

    chartInstances.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Profit/(Loss) after Tax',
          data: values,
          backgroundColor: values.map((value) => value < 0 ? '#F47920' : '#1DAB9F'),
          borderRadius: 10
        }]
      },
      options: buildChartOptions()
    }));
  }

  function createCashChart() {
    const canvas = document.getElementById('financial-cash-chart');
    if (!canvas) {
      return;
    }

    const labels = [...data.chartSeries.cashAndCashEquivalents.labels].reverse();
    const values = [...data.chartSeries.cashAndCashEquivalents.values].reverse();

    chartInstances.push(new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Cash and Cash Equivalents',
          data: values,
          borderColor: '#A9BAD9',
          backgroundColor: 'rgba(169,186,217,0.16)',
          fill: true,
          tension: 0.32,
          pointRadius: 4,
          pointHoverRadius: 5
        }]
      },
      options: buildChartOptions()
    }));
  }

  function createBalanceChart() {
    const canvas = document.getElementById('financial-balance-chart');
    if (!canvas) {
      return;
    }

    const labels = [...data.chartSeries.assetsLiabilitiesEquity.labels].reverse();
    const assets = [...data.chartSeries.assetsLiabilitiesEquity.assets].reverse();
    const liabilities = [...data.chartSeries.assetsLiabilitiesEquity.liabilities].reverse();
    const equity = [...data.chartSeries.assetsLiabilitiesEquity.equity].reverse();

    chartInstances.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Assets',
            data: assets,
            backgroundColor: '#E8253D',
            borderRadius: 10
          },
          {
            label: 'Liabilities',
            data: liabilities,
            backgroundColor: '#4A86E8',
            borderRadius: 10
          },
          {
            label: 'Equity',
            data: equity,
            backgroundColor: '#F47920',
            borderRadius: 10
          }
        ]
      },
      options: buildChartOptions()
    }));
  }

  function renderFindings() {
    const host = document.getElementById('financial-findings');
    if (!host) {
      return;
    }

    const revenueCurrent = data.chartSeries.revenueVsExpenditure.revenue[0];
    const revenuePrevious = data.chartSeries.revenueVsExpenditure.revenue[1];
    const profitCurrent = data.chartSeries.netProfitLoss.values[0];
    const profitPrevious = data.chartSeries.netProfitLoss.values[1];
    const cashCurrent = data.chartSeries.cashAndCashEquivalents.values[0];
    const cashPrevious = data.chartSeries.cashAndCashEquivalents.values[1];
    const assetsCurrent = data.chartSeries.assetsLiabilitiesEquity.assets[0];
    const assetsPrevious = data.chartSeries.assetsLiabilitiesEquity.assets[1];
    const equityCurrent = data.chartSeries.assetsLiabilitiesEquity.equity[0];
    const borrowings = statementValue(data.statements.financialPosition, 'Borrowings', 0) + statementValue(data.statements.financialPosition, 'Short Term Borrowings', 0);
    const liabilitiesCurrent = data.chartSeries.assetsLiabilitiesEquity.liabilities[0];
    const operatingProfit = statementValue(data.statements.profitLoss, 'Operating Profit/(Loss)', 0);
    const financeExpense = Math.abs(statementValue(data.statements.profitLoss, 'Finance Expense', 0));

    const findings = [
      {
        title: 'Revenue expanded year over year',
        evidence: `Revenue from Operation increased from ${formatCompactNumber(revenuePrevious)} to ${formatCompactNumber(revenueCurrent)}, a change of ${formatPercentChange(revenueCurrent, revenuePrevious)}.`,
        implication: 'Top-line growth is visible in the workbook, which provides context for the rest of the operating and financing profile.'
      },
      {
        title: 'Net losses narrowed materially',
        evidence: `Profit/(Loss) after Tax moved from ${formatCompactNumber(profitPrevious)} to ${formatCompactNumber(profitCurrent)}.`,
        implication: 'The business remained loss-making in the current year, but the magnitude of the loss shown in the workbook is materially lower than the previous year.'
      },
      {
        title: 'Operating profit was outweighed by financing cost',
        evidence: `Operating Profit/(Loss) is listed at ${formatCompactNumber(operatingProfit)} while Finance Expense is ${formatCompactNumber(-financeExpense)}.`,
        implication: 'This indicates that below-operating-line financing pressure is a major driver of the reported loss outcome.'
      },
      {
        title: 'Liquidity improved on the balance sheet',
        evidence: `Cash and Cash Equivalents rose from ${formatCompactNumber(cashPrevious)} to ${formatCompactNumber(cashCurrent)}.`,
        implication: 'Year-end cash improved according to the workbook, which helps the liquidity picture even though broader balance-sheet pressures remain.'
      },
      {
        title: 'Assets stayed relatively stable while equity remained negative',
        evidence: `Total Assets were ${formatCompactNumber(assetsCurrent)} versus ${formatCompactNumber(assetsPrevious)} in the prior year, while Total Equity is shown at ${formatCompactNumber(equityCurrent)} in the latest balance sheet.`,
        implication: 'The workbook points to a balance sheet with stable asset scale but continued equity stress.'
      },
      {
        title: 'Borrowings dominate the liability structure',
        evidence: `Long-term and short-term borrowings total ${formatCompactNumber(borrowings)} against total liabilities of ${formatCompactNumber(liabilitiesCurrent)}.`,
        implication: 'Debt exposure appears to make up the bulk of liabilities, which matters for financing cost sensitivity and balance-sheet flexibility.'
      }
    ];

    host.innerHTML = findings.map((finding) => `
      <article class="card financial-finding-card">
        <div class="financial-finding-label">Finding</div>
        <h3>${escapeHtml(finding.title)}</h3>
        <div class="financial-finding-meta"><strong>Evidence</strong><p>${escapeHtml(finding.evidence)}</p></div>
        <div class="financial-finding-meta"><strong>Why it matters</strong><p>${escapeHtml(finding.implication)}</p></div>
      </article>
    `).join('');
  }

  function renderStatements() {
    const host = document.getElementById('financial-statements');
    if (!host) {
      return;
    }

    const order = [
      'financialPosition',
      'profitLoss',
      'comprehensiveIncome',
      'cashFlows',
      'changesEquityCurrentYear',
      'changesEquityPreviousYear'
    ];

    host.innerHTML = order.map((key, index) => {
      const statement = data.statements[key];
      const content = key.startsWith('changesEquity')
        ? renderMatrixTable(statement)
        : renderStatementTable(statement, resolveStatementPeriods(key, statement));

      return `
        <details class="financial-statement-card"${index === 0 ? ' open' : ''}>
          <summary>${escapeHtml(statementTitles[key])}</summary>
          <div class="financial-statement-body">
            ${content}
          </div>
        </details>
      `;
    }).join('');
  }

  function renderStatementTable(statement, periods) {
    return `
      <div class="financial-table-scroll">
        <table class="financial-table">
          <thead>
            <tr>
              <th>${escapeHtml(statement.headers[0])}</th>
              ${periods.map((period) => `<th>${escapeHtml(period)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${statement.lineItems.map((item) => {
              const sectionRow = item.values.every((value) => value === null);
              return `
                <tr class="${sectionRow ? 'financial-table-section' : ''}">
                  <td>${escapeHtml(item.label)}</td>
                  ${item.values.map((value) => `<td>${formatTableValue(value)}</td>`).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderMatrixTable(statement) {
    return `
      <div class="financial-table-scroll">
        <table class="financial-table financial-table-matrix">
          <thead>
            <tr>
              ${statement.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${statement.rows.map((row) => `
              <tr>
                ${row.map((cell, index) => `<td>${index === 0 ? escapeHtml(cell || '') : formatTableValue(cell)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function resolveStatementPeriods(key, statement) {
    if (key === 'financialPosition') {
      return statement.periods;
    }
    if (key === 'profitLoss') {
      return data.periods.profitLoss;
    }
    if (key === 'comprehensiveIncome') {
      return data.periods.comprehensiveIncome;
    }
    if (key === 'cashFlows') {
      return data.periods.cashFlows;
    }
    return statement.periods || [];
  }

  function buildChartOptions() {
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
            color: '#A9BAD9',
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
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${formatFullNumber(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#7888A8'
          },
          grid: {
            display: false
          },
          border: {
            color: 'rgba(30,42,68,0.75)'
          }
        },
        y: {
          ticks: {
            color: '#7888A8',
            callback(value) {
              return formatCompactNumber(Number(value));
            }
          },
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

  function destroyCharts() {
    while (chartInstances.length) {
      chartInstances.pop().destroy();
    }
  }

  function statementValue(statement, label, index) {
    const item = statement.lineItems.find((entry) => entry.label === label);
    return item ? Number(item.values[index] || 0) : 0;
  }

  function diffText(diff) {
    const prefix = diff > 0 ? '+' : '';
    return `Change vs previous year: ${prefix}${formatCompactNumber(diff)}`;
  }

  function formatCompactNumber(value) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatFullNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  function formatTableValue(value) {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return formatFullNumber(Number(value));
  }

  function formatPercentChange(current, previous) {
    if (!previous) {
      return 'N/A';
    }
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
