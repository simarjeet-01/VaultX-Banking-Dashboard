// VaultX — Transfer JS

let selectedFromAccId = null;
let selectedBenId     = null;
let selectedPayType   = 'UPI';

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  Theme.init();

  const user = Storage.getUser();
  document.getElementById('sidebarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('topbarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('notifCount').textContent = Storage.getUnreadCount();

  const accounts = Storage.getAccounts();
  selectedFromAccId = accounts[0].id;

  renderFromAccounts(accounts);
  renderBeneficiaries();
  renderSavedBeneficiaries();
  renderRecentTransfers();
  updateSummary();

  document.getElementById('transferForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleTransferSubmit();
  });

  document.getElementById('addBenForm').addEventListener('submit', (e) => {
    e.preventDefault();
    submitAddBeneficiary();
  });
});

/* ── From Account Selector ── */
function renderFromAccounts(accounts) {
  const container = document.getElementById('fromAccSelector');
  container.innerHTML = accounts.map((acc, i) => `
    <div class="account-option ${i === 0 ? 'selected' : ''}"
         onclick="selectFromAcc('${acc.id}', this)">
      <div class="acc-icon">🏦</div>
      <div class="acc-details">
        <div class="acc-name">${acc.type} Account</div>
        <div class="acc-num">•••• ${acc.shortNumber}</div>
      </div>
      <div class="acc-bal">₹${fmt(acc.balance)}</div>
      <div class="selected-dot"></div>
    </div>
  `).join('');
}

function selectFromAcc(id, el) {
  selectedFromAccId = id;
  document.querySelectorAll('.account-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  const acc = Storage.getAccount(id);
  document.getElementById('sumFrom').textContent = `${acc.type} ••••${acc.shortNumber}`;
  updateSummary();
}

/* ── Beneficiary Chips ── */
function renderBeneficiaries() {
  const bens = Storage.getBeneficiaries();
  document.getElementById('benScroll').innerHTML = bens.map((b, i) => `
    <div class="ben-chip ${i === 0 ? 'selected' : ''}"
         onclick="selectBen('${b.id}', this)">
      <div class="initials-sm">${b.initials}</div>
      <div>
        <div class="ben-name">${b.name}</div>
        <div class="ben-bank">${b.bank}</div>
      </div>
    </div>
  `).join('');
  if (bens.length) {
    selectedBenId = bens[0].id;
    document.getElementById('sumTo').textContent = `${bens[0].name} (${bens[0].bank})`;
  }
}

function selectBen(id, el) {
  selectedBenId = id;
  document.querySelectorAll('.ben-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const ben = Storage.getBeneficiaries().find(b => b.id === id);
  document.getElementById('sumTo').textContent = `${ben.name} (${ben.bank})`;
  updateSummary();
}

/* ── Payment Type ── */
function selectPayType(type, btn) {
  selectedPayType = type;
  document.querySelectorAll('.payment-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('sumMethod').textContent = type;
}

/* ── Amount / Summary ── */
function setAmount(val) {
  document.getElementById('transferAmount').value = val;
  updateSummary();
}

function updateSummary() {
  const amt = parseFloat(document.getElementById('transferAmount')?.value) || 0;
  document.getElementById('sumAmount').textContent = `₹${fmt(amt)}`;
  document.getElementById('sumTotal').textContent  = `₹${fmt(amt)}`;
  if (selectedFromAccId) {
    const acc = Storage.getAccount(selectedFromAccId);
    document.getElementById('sumFrom').textContent = `${acc.type} ••••${acc.shortNumber}`;
  }
}

/* ── Transfer Submit → Show Confirm Modal ── */
function handleTransferSubmit() {
  const amount = parseFloat(document.getElementById('transferAmount').value);
  const note   = document.getElementById('transferNote').value.trim();

  if (!selectedBenId)          { showToast('Please select a beneficiary', 'error'); return; }
  if (!amount || amount <= 0)  { showToast('Enter a valid amount', 'error'); return; }
  if (amount < 1)              { showToast('Minimum transfer is ₹1', 'error'); return; }

  const acc = Storage.getAccount(selectedFromAccId);
  if (amount > acc.balance)    { showToast(`Insufficient balance. Available: ₹${fmt(acc.balance)}`, 'error'); return; }

  const ben = Storage.getBeneficiaries().find(b => b.id === selectedBenId);

  document.getElementById('confirmModalBody').innerHTML = `
    <div class="confirm-amount-display">
      <div class="conf-label">You are transferring</div>
      <div class="conf-amount">₹${fmt(amount)}</div>
    </div>
    <div style="margin-top:1.25rem;">
      ${[
        ['From',    `${acc.type} ••••${acc.shortNumber}`],
        ['To',      ben.name],
        ['Bank',    ben.bank],
        ['Account', ben.account],
        ['Method',  selectedPayType],
        ['Note',    note || '—'],
        ['Charges', '₹0.00 (Free)'],
      ].map(([k,v]) => `
        <div class="confirm-detail-row"><span>${k}</span><span>${v}</span></div>
      `).join('')}
    </div>
    <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
      <button class="btn btn-secondary btn-block" onclick="closeModal('confirmModal')">← Edit</button>
      <button class="btn btn-primary btn-block" onclick="executeTransfer(${amount},'${note}')">
        Confirm Transfer
      </button>
    </div>
  `;
  openModal('confirmModal');
}

/* ── Execute Transfer ── */
function executeTransfer(amount, note) {
  const acc = Storage.getAccount(selectedFromAccId);
  const ben = Storage.getBeneficiaries().find(b => b.id === selectedBenId);
  const ref = 'TRF' + Date.now();
  const date = new Date().toISOString().split('T')[0];

  // Deduct balance
  Storage.updateAccount(selectedFromAccId, { balance: acc.balance - amount });

  // Add transaction
  const txn = {
    id: 'txn_' + Date.now(),
    date,
    merchant: `Transfer to ${ben.name}`,
    category: 'Transfer',
    amount: -amount,
    account: selectedFromAccId,
    status: 'completed',
    icon: 'https://img.icons8.com/color/48/bank-transfer.png',
    description: note || `${selectedPayType} Transfer`,
    reference: ref,
  };
  Storage.addTransaction(txn);
  closeModal('confirmModal');

  // Show receipt
  showReceipt({ txn, ben, acc, amount, note, ref, date });
  renderRecentTransfers();
  document.getElementById('transferAmount').value = '';
  document.getElementById('transferNote').value = '';
}

/* ── Receipt Modal ── */
function showReceipt({ txn, ben, acc, amount, note, ref, date }) {
  document.getElementById('receiptBody').innerHTML = `
    <div class="receipt">
      <div class="receipt-header">
        <div class="receipt-logo">VaultX</div>
        <div style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin-bottom:0.75rem;">
          Transaction Receipt
        </div>
        <div class="receipt-status">✅ Transfer Successful</div>
        <div style="font-size:2rem;font-weight:800;color:var(--success);margin-top:0.75rem;">
          ₹${fmt(amount)}
        </div>
      </div>
      <div class="receipt-body">
        ${[
          ['Reference No.',  ref],
          ['Date & Time',    new Date().toLocaleString('en-IN')],
          ['From Account',   `${acc.type} ••••${acc.shortNumber}`],
          ['Beneficiary',    ben.name],
          ['Bank',           ben.bank],
          ['Account',        ben.account],
          ['Payment Method', selectedPayType],
          ['Note',           note || '—'],
          ['Status',         '✅ Success'],
        ].map(([k,v]) => `
          <div class="receipt-row">
            <span class="r-label">${k}</span>
            <span class="r-value">${v}</span>
          </div>
        `).join('')}
      </div>
      <div class="receipt-footer">
        <p>VaultX Technologies Pvt. Ltd.</p>
        <p>This is an automated receipt. Keep it for your records.</p>
      </div>
    </div>
    <div style="display:flex;gap:0.75rem;margin-top:1rem;">
      <button class="btn btn-primary btn-block"
              onclick="downloadReceipt('${ref}','${ben.name}',${amount},'${date}')">
        📥 Download Receipt
      </button>
      <button class="btn btn-secondary btn-block" onclick="closeModal('receiptModal')">
        Done
      </button>
    </div>
  `;
  openModal('receiptModal');
  showToast(`₹${fmt(amount)} transferred to ${ben.name}!`, 'success');
}

/* ── Download Receipt ── */
function downloadReceipt(ref, benName, amount, date) {
  const content = `VaultX Banking — Transfer Receipt
======================================
Reference   : ${ref}
Date        : ${date}
Beneficiary : ${benName}
Amount      : ₹${fmt(amount)}
Method      : ${selectedPayType}
Status      : Success
======================================
© 2026 VaultX Technologies Pvt. Ltd.`;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `VaultX-Transfer-${ref}.txt`;
  a.click();
  showToast('Receipt downloaded!', 'success');
}

/* ── Recent Transfers ── */
function renderRecentTransfers() {
  const txns = Storage.getTransactions()
    .filter(t => t.category === 'Transfer')
    .slice(0, 5);
  document.getElementById('recentTransfers').innerHTML = txns.length
    ? txns.map(t => `
      <div class="transfer-item">
        <div class="txn-icon">
          <img src="${t.icon}" onerror="this.src='https://img.icons8.com/color/48/bank-transfer.png'" />
        </div>
        <div class="txn-info">
          <div class="txn-merchant">${t.merchant}</div>
          <div class="txn-category">${t.reference} · ${fmtDate(t.date)}</div>
        </div>
        <div class="txn-amount amount-debit">₹${fmt(Math.abs(t.amount))}</div>
      </div>
    `).join('')
    : '<p style="padding:1rem;color:var(--text-muted);text-align:center;font-size:0.875rem;">No transfers yet</p>';
}

/* ── Saved Beneficiaries ── */
function renderSavedBeneficiaries() {
  const bens = Storage.getBeneficiaries();
  document.getElementById('savedBenList').innerHTML = bens.map(b => `
    <div class="txn-item" onclick="selectBenById('${b.id}')">
      <div class="beneficiary-initials" style="width:40px;height:40px;font-size:0.75rem;">
        ${b.initials}
      </div>
      <div class="txn-info">
        <div class="txn-merchant">${b.name}</div>
        <div class="txn-category">${b.bank} · ${b.account}</div>
      </div>
      <button class="btn btn-ghost btn-sm"
              onclick="event.stopPropagation();removeBen('${b.id}')">✕</button>
    </div>
  `).join('');
}

function selectBenById(id) {
  const chip = document.querySelector(`.ben-chip`);
  selectedBenId = id;
  document.querySelectorAll('.ben-chip').forEach(c => {
    c.classList.toggle('selected', c.onclick?.toString().includes(id));
  });
  const ben = Storage.getBeneficiaries().find(b => b.id === id);
  if (ben) document.getElementById('sumTo').textContent = `${ben.name} (${ben.bank})`;
  showToast(`${ben?.name} selected`, 'info');
}

function removeBen(id) {
  const bens = Storage.getBeneficiaries().filter(b => b.id !== id);
  Storage.setBeneficiaries(bens);
  renderBeneficiaries();
  renderSavedBeneficiaries();
  showToast('Beneficiary removed', 'info');
}

/* ── Add Beneficiary ── */
function openAddBenModal() { openModal('addBenModal'); }

function submitAddBeneficiary() {
  const name = document.getElementById('benName').value.trim();
  const bank = document.getElementById('benBank').value.trim();
  const acc  = document.getElementById('benAcc').value.trim();

  if (!name || !bank || !acc) { showToast('Please fill all fields', 'error'); return; }

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const newBen = {
    id: 'ben_' + Date.now(),
    name, bank,
    account: acc.length > 6 ? '••••' + acc.slice(-4) : acc,
    upi: acc.includes('@') ? acc : '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`,
    initials,
  };
  Storage.addBeneficiary(newBen);
  closeModal('addBenModal');
  renderBeneficiaries();
  renderSavedBeneficiaries();
  document.getElementById('addBenForm').reset();
  showToast(`${name} added as beneficiary!`, 'success');
}

/* ── Helpers ── */
function fmt(n) { return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }); }
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
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
