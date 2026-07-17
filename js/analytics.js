// VaultX — Analytics JS

let currentPeriod = '6m';

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  Theme.init();

  const user = Storage.getUser();
  document.getElementById('sidebarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('topbarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('notifCount').textContent = Storage.getUnreadCount();

  renderAnalyticsStats();
  renderBarChart(currentPeriod);
  renderMonthlyTrend();
  renderCategoryBreakdown();
  renderDonutChart();
  renderBudgetGrid();
  renderTopMerchants();
});

/* ── Stats ── */
function renderAnalyticsStats() {
  const txns = Storage.getTransactions();
  const income  = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const savings = income - expense;
  const rate    = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

  document.getElementById('analyticsStats').innerHTML = `
    <div class="stat-card fade-in">
      <div class="stat-icon-wrapper" style="background:rgba(67,206,162,0.15);">📥</div>
      <div class="stat-label">Total Income</div>
      <div class="stat-value amount-credit">₹${fmt(income)}</div>
      <div class="stat-change text-muted">All transactions</div>
    </div>
    <div class="stat-card fade-in" style="animation-delay:0.05s">
      <div class="stat-icon-wrapper" style="background:rgba(245,87,108,0.15);">📤</div>
      <div class="stat-label">Total Expense</div>
      <div class="stat-value amount-debit">₹${fmt(expense)}</div>
      <div class="stat-change text-muted">All categories</div>
    </div>
    <div class="stat-card fade-in" style="animation-delay:0.1s">
      <div class="stat-icon-wrapper" style="background:rgba(102,126,234,0.15);">💰</div>
      <div class="stat-label">Net Savings</div>
      <div class="stat-value ${savings>=0?'amount-credit':'amount-debit'}">₹${fmt(Math.abs(savings))}</div>
      <div class="stat-change text-muted">Savings rate: ${rate}%</div>
    </div>
    <div class="stat-card fade-in" style="animation-delay:0.15s">
      <div class="stat-icon-wrapper" style="background:rgba(247,151,30,0.15);">📈</div>
      <div class="stat-label">Avg. Monthly Spend</div>
      <div class="stat-value">₹${fmt(expense / 7)}</div>
      <div class="stat-change text-muted">Over 7 months</div>
    </div>
  `;
}

/* ── Bar Chart (Income vs Expense) ── */
function renderBarChart(period) {
  currentPeriod = period;
  const data    = VaultXData.monthlyData;
  const count   = period === '1m' ? 1 : period === '3m' ? 3 : data.labels.length;
  const labels  = data.labels.slice(-count);
  const income  = data.income.slice(-count);
  const expense = data.expense.slice(-count);
  const maxVal  = Math.max(...income, ...expense);
  const chartH  = 160;

  const container = document.getElementById('analyticsBarChart');
  container.innerHTML = labels.map((label, i) => {
    const incH = Math.round((income[i] / maxVal) * chartH);
    const expH = Math.round((expense[i] / maxVal) * chartH);
    return `
      <div class="bar-group">
        <div class="bars-row">
          <div class="bar income" style="height:0px;" data-h="${incH}px">
            <span class="bar-tooltip">₹${(income[i]/1000).toFixed(0)}k</span>
          </div>
          <div class="bar expense" style="height:0px;" data-h="${expH}px">
            <span class="bar-tooltip">₹${(expense[i]/1000).toFixed(0)}k</span>
          </div>
        </div>
        <div class="bar-month">${label}</div>
      </div>`;
  }).join('');

  setTimeout(() => {
    container.querySelectorAll('.bar').forEach(bar => {
      bar.style.height = bar.dataset.h;
    });
  }, 100);
}

function setPeriod(period, btn) {
  document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBarChart(period);
}

/* ── Monthly Trend (horizontal bars) ── */
function renderMonthlyTrend() {
  const data = VaultXData.monthlyData;
  const max  = Math.max(...data.expense);
  document.getElementById('monthlyTrendChart').innerHTML = data.labels.map((label, i) => `
    <div class="chart-bar-row" style="margin-bottom:0.5rem;">
      <span class="chart-bar-label">${label}</span>
      <div class="chart-bar-track">
        <div class="chart-bar-fill"
             style="width:0%;background:linear-gradient(90deg,var(--accent),var(--accent-2));"
             data-width="${(data.expense[i]/max*100).toFixed(1)}%">
        </div>
      </div>
      <span class="chart-bar-value">₹${(data.expense[i]/1000).toFixed(0)}k</span>
    </div>
  `).join('');
  setTimeout(() => {
    document.querySelectorAll('#monthlyTrendChart .chart-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 150);
}

/* ── Category Breakdown ── */
function renderCategoryBreakdown() {
  const cats = VaultXData.categorySpending;
  document.getElementById('categoryBreakdown').innerHTML = cats.map(cat => `
    <div class="category-item">
      <div class="category-icon-wrap">${cat.icon}</div>
      <div class="category-info">
        <div class="category-name-row">
          <span class="category-name">${cat.name}</span>
          <span class="category-percent" style="color:${cat.color};">${cat.percent}%</span>
        </div>
        <div class="category-bar-track">
          <div class="category-bar-fill" style="width:0%;background:${cat.color};"
               data-width="${cat.percent}%"></div>
        </div>
        <div class="category-amount">₹${cat.amount.toLocaleString('en-IN')}</div>
      </div>
    </div>
  `).join('');
  setTimeout(() => {
    document.querySelectorAll('.category-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 200);
}

/* ── Donut Chart (SVG) ── */
function renderDonutChart() {
  const cats   = VaultXData.categorySpending;
  const svg    = document.getElementById('donutSvg');
  const cx = 18, cy = 18, r = 15.9155;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const segments = cats.map(cat => {
    const dash   = (cat.percent / 100) * circumference;
    const offset = circumference - cumulative;
    cumulative  += dash;
    return { dash, offset, color: cat.color, name: cat.name };
  });

  svg.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}"
            fill="none" stroke="var(--bg-input)" stroke-width="3.8" />
    ${segments.map(seg => `
      <circle cx="${cx}" cy="${cy}" r="${r}"
              fill="none"
              stroke="${seg.color}"
              stroke-width="3.8"
              stroke-dasharray="${seg.dash.toFixed(4)} ${(circumference - seg.dash).toFixed(4)}"
              stroke-dashoffset="${seg.offset.toFixed(4)}"
              stroke-linecap="round" />
    `).join('')}
  `;
}

/* ── Budget Grid ── */
function renderBudgetGrid() {
  const budget = VaultXData.budget;
  document.getElementById('budgetGrid').innerHTML = budget.categories.map(cat => {
    const pct  = Math.min((cat.spent / cat.budget) * 100, 100).toFixed(0);
    const over = cat.spent > cat.budget;
    const color = over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : cat.color;
    return `
      <div class="budget-item">
        <div class="budget-item-header">
          <span class="budget-item-icon">${cat.icon}</span>
          <span class="budget-item-name">${cat.name}</span>
        </div>
        <div class="budget-item-amounts">
          <span class="spent" style="color:${color};">₹${cat.spent.toLocaleString('en-IN')}</span>
          <span class="total">/ ₹${cat.budget.toLocaleString('en-IN')}</span>
        </div>
        <div class="budget-progress-track">
          <div class="budget-progress-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <div class="budget-status" style="color:${color};">
          ${over ? `⚠️ Over by ₹${(cat.spent-cat.budget).toLocaleString('en-IN')}` : `${pct}% used`}
        </div>
      </div>
    `;
  }).join('');
}

/* ── Top Merchants ── */
function renderTopMerchants() {
  const txns = Storage.getTransactions().filter(t => t.amount < 0);
  const map  = {};
  txns.forEach(t => {
    map[t.merchant] = (map[t.merchant] || 0) + Math.abs(t.amount);
  });
  const sorted = Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const max = sorted[0]?.[1] || 1;
  document.getElementById('topMerchants').innerHTML = sorted.map(([name, amount], i) => `
    <div style="display:flex;align-items:center;gap:0.875rem;padding:0.5rem 0;
         border-bottom:1px solid var(--border-light);">
      <div style="width:24px;text-align:center;font-size:0.8rem;font-weight:700;
           color:var(--text-muted);">#${i+1}</div>
      <div style="flex:1;">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:0.25rem;">${name}</div>
        <div style="height:4px;background:var(--bg-input);border-radius:99px;overflow:hidden;">
          <div style="height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--accent-2));
               width:${(amount/max*100).toFixed(1)}%;transition:width 1s ease;"></div>
        </div>
      </div>
      <div style="font-size:0.85rem;font-weight:700;color:var(--danger);">₹${fmt(amount)}</div>
    </div>
  `).join('');
}

/* ── Helpers ── */
function fmt(n) { return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}
function handleLogout() { Storage.clearSession(); window.location.href = 'login.html'; }
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type==='success'?'✅':type==='error'?'❌':'ℹ️'}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}
