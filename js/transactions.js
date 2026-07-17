// VaultX — Transactions JS

let allTxns = [];
let activeCategory = 'all';
let activeAccount = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  Theme.init();

  const user = Storage.getUser();
  document.getElementById('sidebarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('topbarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('notifCount').textContent = Storage.getUnreadCount();

  allTxns = Storage.getTransactions();

  // Populate account filter
  const accFilter = document.getElementById('accFilter');
  Storage.getAccounts().forEach(acc => {
    const opt = document.createElement('option');
    opt.value = acc.id;
    opt.textContent = `${acc.type} ••••${acc.shortNumber}`;
    accFilter.appendChild(opt);
  });

  // Pre-fill search from URL query
  const urlParams = new URLSearchParams(window.location.search);
  const qs = urlParams.get('search');
  if (qs) {
    const searchEl = document.getElementById('txnSearch');
    searchEl.value = qs;
    searchQuery = qs.toLowerCase();
  }

  renderStats();
  filterTxns();
});

/* ── Stats ── */
function renderStats() {
  const totalIncome  = allTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = allTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const netFlow      = totalIncome - totalExpense;

  document.getElementById('txnStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon-wrapper" style="background:rgba(67,206,162,0.15);">📥</div>
      <div class="stat-label">Total Income</div>
      <div class="stat-value amount-credit">₹${fmt(totalIncome)}</div>
      <div class="stat-change text-muted">${allTxns.filter(t=>t.amount>0).length} transactions</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrapper" style="background:rgba(245,87,108,0.15);">📤</div>
      <div class="stat-label">Total Expense</div>
      <div class="stat-value amount-debit">₹${fmt(totalExpense)}</div>
      <div class="stat-change text-muted">${allTxns.filter(t=>t.amount<0).length} transactions</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrapper" style="background:rgba(102,126,234,0.15);">📊</div>
      <div class="stat-label">Net Flow</div>
      <div class="stat-value ${netFlow >= 0 ? 'amount-credit' : 'amount-debit'}">₹${fmt(Math.abs(netFlow))}</div>
      <div class="stat-change text-muted">${netFlow >= 0 ? 'Net positive' : 'Net negative'}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrapper" style="background:rgba(247,151,30,0.15);">🔢</div>
      <div class="stat-label">Transactions</div>
      <div class="stat-value">${allTxns.length}</div>
      <div class="stat-change text-muted">All time</div>
    </div>
  `;
}

/* ── Filter ── */
function setFilter(category, btn) {
  activeCategory = category;
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterTxns();
}

function filterTxns() {
  const searchEl = document.getElementById('txnSearch');
  const accEl    = document.getElementById('accFilter');
  searchQuery    = searchEl ? searchEl.value.toLowerCase().trim() : '';
  activeAccount  = accEl ? accEl.value : 'all';

  let filtered = allTxns;

  if (activeCategory !== 'all') {
    filtered = filtered.filter(t => t.category === activeCategory);
  }
  if (activeAccount !== 'all') {
    filtered = filtered.filter(t => t.account === activeAccount);
  }
  if (searchQuery.length >= 1) {
    filtered = filtered.filter(t =>
      t.merchant.toLowerCase().includes(searchQuery) ||
      t.category.toLowerCase().includes(searchQuery) ||
      t.description.toLowerCase().includes(searchQuery) ||
      t.reference.toLowerCase().includes(searchQuery)
    );
  }

  renderTxnList(filtered);
}

/* ── Render List ── */
function renderTxnList(txns) {
  const container = document.getElementById('txnContainer');
  const empty     = document.getElementById('txnEmpty');

  if (!txns.length) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  // Group by date
  const groups = {};
  txns.forEach(t => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });

  container.innerHTML = Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, items]) => `
      <div style="padding: 0.75rem 0.5rem 0.25rem;">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">
          ${formatGroupDate(date)}
        </div>
      </div>
      ${items.map(txn => `
        <div class="txn-item fade-in" onclick="openTxnDetail('${txn.id}')">
          <div class="txn-icon">
            <img src="${txn.icon}" alt="${txn.merchant}"
                 onerror="this.src='https://img.icons8.com/color/48/money.png'" />
          </div>
          <div class="txn-info">
            <div class="txn-merchant">${txn.merchant}</div>
            <div class="txn-category">${txn.category} · ${txn.reference}</div>
          </div>
          <div style="text-align:right;">
            <div class="txn-amount ${txn.amount > 0 ? 'amount-credit' : 'amount-debit'}">
              ${txn.amount > 0 ? '+' : ''}₹${fmt(Math.abs(txn.amount))}
            </div>
            <div class="txn-date"><span class="badge badge-success">✓</span></div>
          </div>
        </div>
      `).join('')}
    `).join('');
}

/* ── Transaction Detail Modal ── */
function openTxnDetail(id) {
  const txn = allTxns.find(t => t.id === id);
  if (!txn) return;
  const accounts = Storage.getAccounts();
  const acc = accounts.find(a => a.id === txn.account);
  document.getElementById('txnDetailBody').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;padding:1rem 0 1.5rem;">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--bg-input);
           display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <img src="${txn.icon}" style="width:40px;height:40px;object-fit:contain;"
             onerror="this.src='https://img.icons8.com/color/48/money.png'" />
      </div>
      <div style="text-align:center;">
        <div style="font-size:1.75rem;font-weight:800;${txn.amount > 0 ? 'color:var(--success)' : 'color:var(--danger)'}">
          ${txn.amount > 0 ? '+' : '-'}₹${fmt(Math.abs(txn.amount))}
        </div>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-top:0.25rem;">${txn.merchant}</div>
      </div>
      <span class="badge badge-success">✓ Completed</span>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:1rem;">
      ${[
        ['Date', formatFullDate(txn.date)],
        ['Category', txn.category],
        ['Account', acc ? `${acc.type} ••••${acc.shortNumber}` : '—'],
        ['Description', txn.description],
        ['Reference', txn.reference],
        ['Status', '<span class="badge badge-success">Completed</span>'],
      ].map(([k, v]) => `
        <div style="display:flex;justify-content:space-between;padding:0.6rem 0;
             border-bottom:1px solid var(--border-light);font-size:0.875rem;">
          <span style="color:var(--text-muted);">${k}</span>
          <span style="font-weight:600;">${v}</span>
        </div>
      `).join('')}
    </div>
    <div style="display:flex;gap:0.75rem;margin-top:1.25rem;">
      <button class="btn btn-secondary btn-block btn-sm"
              onclick="downloadReceipt('${txn.id}')">📄 Download Receipt</button>
      <button class="btn btn-ghost btn-block btn-sm"
              onclick="closeModal('txnDetailModal')">Close</button>
    </div>
  `;
  openModal('txnDetailModal');
}

/* ── Download Receipt ── */
function downloadReceipt(id) {
  const txn = allTxns.find(t => t.id === id);
  if (!txn) return;
  const content = `VaultX Banking — Transaction Receipt
======================================
Date        : ${formatFullDate(txn.date)}
Reference   : ${txn.reference}
Merchant    : ${txn.merchant}
Category    : ${txn.category}
Amount      : ${txn.amount > 0 ? '+' : '-'}₹${fmt(Math.abs(txn.amount))}
Status      : Completed
Description : ${txn.description}
======================================
This is a demo receipt generated by VaultX.
© 2026 VaultX Technologies Pvt. Ltd.`;

  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `VaultX-Receipt-${txn.reference}.txt`;
  a.click();
  showToast('Receipt downloaded!', 'success');
}

/* ── Export CSV ── */
function exportCSV() {
  const rows = [['Date','Merchant','Category','Amount','Account','Reference','Status']];
  allTxns.forEach(t => {
    const acc = Storage.getAccounts().find(a => a.id === t.account);
    rows.push([
      t.date, `"${t.merchant}"`, t.category,
      t.amount, acc ? `${acc.type} ••••${acc.shortNumber}` : t.account,
      t.reference, t.status
    ]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'VaultX-Transactions.csv';
  a.click();
  showToast('Transactions exported!', 'success');
}

/* ── Helpers ── */
function fmt(n) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatGroupDate(d) {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d === today.toISOString().split('T')[0]) return 'Today';
  if (d === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatFullDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
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
