// VaultX — Dashboard JS

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  Theme.init();

  const user = Storage.getUser();
  initTopbar(user);
  setGreeting(user);
  renderCards();
  renderRecentTransactions();
  renderQuickTransfer();
  renderCategoryChart();
  renderMonthlyTrend();
  renderIncomeExpenseChart();
  animateBalances();
  renderNotifications();
});

/* ── Topbar / Sidebar ── */
function initTopbar(user) {
  const firstName = user.name.split(' ')[0];
  document.getElementById('sidebarUserName').textContent = firstName;
  document.getElementById('topbarUserName').textContent = firstName;
  const count = Storage.getUnreadCount();
  document.getElementById('notifCount').textContent = count;
  if (count === 0) document.getElementById('notifCount').style.display = 'none';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}
function handleLogout() {
  Storage.clearSession();
  window.location.href = 'login.html';
}

/* ── Greeting ── */
function setGreeting(user) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const emoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';
  document.getElementById('greetingText').textContent = `${greet}, ${user.name.split(' ')[0]} ${emoji}`;
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ── Animate Balances ── */
function animateBalances() {
  const accounts = Storage.getAccounts();
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  animateCount(document.getElementById('totalBalance'), total, '₹', true);

  const txns = Storage.getTransactions();
  const thisMonth = new Date().getMonth();
  const spend = txns
    .filter(t => t.amount < 0 && new Date(t.date).getMonth() === thisMonth)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  animateCount(document.getElementById('monthlySpend'), spend, '₹', true);
}

function animateCount(el, target, prefix = '', isCurrency = false) {
  if (!el) return;
  const duration = 1200;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = eased * target;
    el.textContent = prefix + (isCurrency
      ? val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.floor(val).toLocaleString('en-IN'));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── Bank Cards ── */
function renderCards() {
  const cards = Storage.getCards();
  const container = document.getElementById('dashboardCards');
  if (!container) return;
  container.innerHTML = cards.map(card => `
    <div class="bank-card ${card.frozen ? 'frozen' : ''}"
         style="background:${card.color};"
         onclick="window.location.href='cards.html'">
      <div style="display:flex;flex-direction:column;height:100%;justify-content:space-between;">
        <!-- Top row: chip + network -->
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div class="card-chip"></div>
          <div class="card-network">${card.network}</div>
        </div>
        <!-- Middle: card number -->
        <div class="card-number">${card.number}</div>
        <!-- Bottom row: holder name + expiry -->
        <div class="card-footer">
          <div class="card-holder">${card.holder}</div>
          <div class="card-expiry">${card.expiry}</div>
        </div>
      </div>
      <div class="card-type-badge">${card.type}</div>
    </div>
  `).join('');
}

/* ── Recent Transactions ── */
function renderRecentTransactions() {
  const txns = Storage.getTransactions().slice(0, 6);
  const container = document.getElementById('recentTxnList');
  if (!container) return;
  container.innerHTML = txns.map(txn => `
    <div class="txn-item fade-in">
      <div class="txn-icon">
        <img src="${txn.icon}" alt="${txn.merchant}"
             onerror="this.src='https://img.icons8.com/color/48/money.png'" />
      </div>
      <div class="txn-info">
        <div class="txn-merchant">${txn.merchant}</div>
        <div class="txn-category">${txn.category} · ${formatDate(txn.date)}</div>
      </div>
      <div>
        <div class="txn-amount ${txn.amount > 0 ? 'amount-credit' : 'amount-debit'}">
          ${txn.amount > 0 ? '+' : ''}₹${formatNum(Math.abs(txn.amount))}
        </div>
      </div>
    </div>
  `).join('');
}

/* ── Quick Transfer ── */
function renderQuickTransfer() {
  const bens = Storage.getBeneficiaries();
  const benGrid = document.getElementById('quickBeneficiaries');
  const accSel = document.getElementById('quickFromAcc');
  if (!benGrid || !accSel) return;

  benGrid.innerHTML = bens.map(b => `
    <div class="beneficiary-item" onclick="selectQuickBen('${b.id}', this)">
      <div class="beneficiary-initials" style="font-size:0.75rem;">${b.initials}</div>
      <div class="beneficiary-name">${b.name.split(' ')[0]}</div>
    </div>
  `).join('') + `
    <div class="beneficiary-item" onclick="window.location.href='transfer.html'">
      <div class="add-beneficiary">+</div>
      <div class="beneficiary-name" style="font-size:0.65rem;">Add New</div>
    </div>`;

  const accounts = Storage.getAccounts();
  accSel.innerHTML = accounts.map(a =>
    `<option value="${a.id}">${a.type} ••••${a.shortNumber} — ₹${formatNum(a.balance)}</option>`
  ).join('');
}

let selectedBenId = null;
function selectQuickBen(id, el) {
  document.querySelectorAll('#quickBeneficiaries .beneficiary-item').forEach(i =>
    i.style.background = '');
  el.style.background = 'rgba(102,126,234,0.15)';
  el.style.borderRadius = 'var(--border-radius-sm)';
  selectedBenId = id;
}

function handleQuickTransfer() {
  const amount = parseFloat(document.getElementById('quickAmount').value);
  const accId  = document.getElementById('quickFromAcc').value;

  if (!selectedBenId) { showToast('Please select a beneficiary', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }

  const ben = Storage.getBeneficiaries().find(b => b.id === selectedBenId);
  const acc = Storage.getAccount(accId);
  if (amount > acc.balance) { showToast('Insufficient balance', 'error'); return; }

  const body = document.getElementById('quickTransferModalBody');
  body.innerHTML = `
    <div class="confirm-amount-display">
      <div class="conf-label">You are sending</div>
      <div class="conf-amount">₹${formatNum(amount)}</div>
    </div>
    <div style="margin-top:1rem;">
      ${[
        ['To', ben.name],
        ['Bank', ben.bank],
        ['From', `${acc.type} ••••${acc.shortNumber}`],
        ['Method', 'UPI / Instant'],
      ].map(([k, v]) => `
        <div class="confirm-detail-row"><span>${k}</span><span>${v}</span></div>
      `).join('')}
    </div>
    <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
      <button class="btn btn-secondary btn-block" onclick="closeModal('quickTransferModal')">Cancel</button>
      <button class="btn btn-primary btn-block" onclick="executeQuickTransfer('${accId}','${selectedBenId}',${amount})">
        Confirm & Send
      </button>
    </div>`;
  openModal('quickTransferModal');
}

function executeQuickTransfer(accId, benId, amount) {
  const acc = Storage.getAccount(accId);
  const ben = Storage.getBeneficiaries().find(b => b.id === benId);

  Storage.updateAccount(accId, { balance: acc.balance - amount });

  const txn = {
    id: 'txn_' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    merchant: `Transfer to ${ben.name}`,
    category: 'Transfer',
    amount: -amount,
    account: accId,
    status: 'completed',
    icon: 'https://img.icons8.com/color/48/bank-transfer.png',
    description: 'Quick Transfer',
    reference: 'TRF' + Date.now(),
  };
  Storage.addTransaction(txn);
  closeModal('quickTransferModal');
  showToast(`₹${formatNum(amount)} sent to ${ben.name}!`, 'success');
  renderRecentTransactions();
  animateBalances();
  document.getElementById('quickAmount').value = '';
  selectedBenId = null;
}

/* ── Category Spending Chart ── */
function renderCategoryChart() {
  const container = document.getElementById('categoryChart');
  if (!container) return;
  const cats = VaultXData.categorySpending;
  container.innerHTML = cats.map(cat => `
    <div class="chart-bar-row">
      <span style="width:1.2rem;text-align:center;">${cat.icon}</span>
      <span style="min-width:80px;font-size:0.75rem;font-weight:600;color:var(--text-secondary);">${cat.name}</span>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:0%;background:${cat.color};"
             data-width="${cat.percent}%"></div>
      </div>
      <span style="min-width:2.5rem;text-align:right;font-size:0.75rem;color:var(--text-muted);">${cat.percent}%</span>
    </div>
  `).join('');
  // Animate bars
  setTimeout(() => {
    container.querySelectorAll('.chart-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 100);
}

/* ── Monthly Trend ── */
function renderMonthlyTrend() {
  const container = document.getElementById('monthlyTrend');
  if (!container) return;
  const data = VaultXData.monthlyData;
  const max = Math.max(...data.expense);
  container.innerHTML = data.labels.map((label, i) => `
    <div class="chart-bar-row">
      <span class="chart-bar-label">${label}</span>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:0%;background:linear-gradient(90deg,var(--accent-2),var(--accent));"
             data-width="${(data.expense[i] / max * 100).toFixed(1)}%"></div>
      </div>
      <span class="chart-bar-value">₹${(data.expense[i]/1000).toFixed(0)}k</span>
    </div>
  `).join('');
  setTimeout(() => {
    container.querySelectorAll('.chart-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 200);
}

/* ── Income vs Expense Bar Chart ── */
function renderIncomeExpenseChart() {
  const container = document.getElementById('incomeExpenseChart');
  if (!container) return;
  const data = VaultXData.monthlyData;
  const maxVal = Math.max(...data.income, ...data.expense);
  const chartH = 160;

  container.innerHTML = data.labels.map((label, i) => {
    const incH = Math.round((data.income[i] / maxVal) * chartH);
    const expH = Math.round((data.expense[i] / maxVal) * chartH);
    return `
      <div class="bar-group">
        <div class="bars-row">
          <div class="bar income" style="height:0px;" data-h="${incH}px"
               title="Income: ₹${(data.income[i]/1000).toFixed(0)}k">
            <span class="bar-tooltip">₹${(data.income[i]/1000).toFixed(0)}k</span>
          </div>
          <div class="bar expense" style="height:0px;" data-h="${expH}px"
               title="Expense: ₹${(data.expense[i]/1000).toFixed(0)}k">
            <span class="bar-tooltip">₹${(data.expense[i]/1000).toFixed(0)}k</span>
          </div>
        </div>
        <div class="bar-month">${label}</div>
      </div>`;
  }).join('');

  setTimeout(() => {
    container.querySelectorAll('.bar').forEach(bar => {
      bar.style.height = bar.dataset.h;
    });
  }, 150);
}

/* ── Notifications Panel ── */
function renderNotifications() {
  const user = Storage.getUser();
  const list = document.getElementById('notifList');
  if (!list) return;
  list.innerHTML = user.notifications.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}">
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-content">
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>
  `).join('');
}

function toggleNotifPanel() {
  document.getElementById('notifPanel').classList.toggle('open');
}

function markAllRead() {
  Storage.markNotificationsRead();
  document.getElementById('notifCount').style.display = 'none';
  renderNotifications();
  showToast('All notifications marked as read', 'success');
}

/* ── Modal helpers ── */
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

/* ── Global search ── */
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q.length < 2) return;
      const txns = Storage.getTransactions().filter(t =>
        t.merchant.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
      if (txns.length > 0) {
        window.location.href = `transactions.html?search=${encodeURIComponent(q)}`;
      }
    });
  }
});

/* ── Helpers ── */
function formatNum(n) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Close notif panel and sidebar on outside click
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notifPanel');
  const btn   = document.getElementById('notifBtn');
  if (panel && panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btn) {
    panel.classList.remove('open');
  }
});
