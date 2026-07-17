// VaultX — Cards JS

let activeCardId = null;

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  Theme.init();

  const user = Storage.getUser();
  document.getElementById('sidebarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('topbarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('notifCount').textContent = Storage.getUnreadCount();

  const cards = Storage.getCards();
  activeCardId = cards[0].id;

  renderCardTabs(cards);
  renderCard(activeCardId);
  initPinInputs();
});

/* ── Card Tabs ── */
function renderCardTabs(cards) {
  document.getElementById('cardTabs').innerHTML = cards.map((c, i) => `
    <button class="card-tab ${i === 0 ? 'active' : ''}"
            onclick="switchCard('${c.id}', this)">
      ${c.type === 'Virtual' ? '🌐' : c.type === 'Credit' ? '💳' : '💳'} ${c.type} ••••${c.number.slice(-4)}
    </button>
  `).join('');
}

function switchCard(id, btn) {
  activeCardId = id;
  document.querySelectorAll('.card-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderCard(id);
}

/* ── Full Card Visual ── */
function renderCard(id) {
  const card = Storage.getCard(id);
  if (!card) return;

  // Card visual
  const visual = document.getElementById('cardVisual');
  visual.style.background = card.color;
  visual.innerHTML = `
    <div class="card-shine"></div>
    <div class="card-bg-pattern"></div>
    <div class="card-top">
      <div class="card-brand">VAULTX</div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        ${card.virtual ? '<span class="virtual-badge">Virtual</span>' : ''}
        <span style="font-size:0.85rem;font-weight:700;color:rgba(255,255,255,0.8);">${card.network}</span>
      </div>
    </div>
    <div class="chip-and-contactless">
      <div class="chip"></div>
      ${card.contactless ? '<span class="contactless" title="Contactless">📶</span>' : ''}
    </div>
    <div class="card-number-full" id="cardNumDisplay">
      ${card.number}
    </div>
    <div class="card-bottom">
      <div class="card-holder-info">
        <div class="label">Card Holder</div>
        <div class="value">${card.holder}</div>
      </div>
      <div class="card-expiry-info">
        <div class="label" style="font-size:0.6rem;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.5);">Expires</div>
        <div class="value" style="font-size:0.8rem;font-weight:700;color:rgba(255,255,255,0.9);">${card.expiry}</div>
      </div>
    </div>
  `;

  // 3D tilt effect
  visual.addEventListener('mousemove', (e) => {
    const rect = visual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    visual.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 12}deg) scale(1.03)`;
  });
  visual.addEventListener('mouseleave', () => {
    visual.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
  });
  visual.style.transition = 'transform 0.15s ease';

  // Frozen overlay
  if (card.frozen) visual.classList.add('frozen');
  else visual.classList.remove('frozen');

  renderCardActions(card);
  renderSpendLimit(card);
  renderCardDetails(card);
  renderCardTransactions(card);
}

/* ── Card Actions ── */
function renderCardActions(card) {
  document.getElementById('cardActions').innerHTML = `
    <button class="card-action-btn ${card.frozen ? 'frozen' : ''}"
            onclick="toggleFreeze('${card.id}')">
      <span class="action-icon">${card.frozen ? '🔓' : '❄️'}</span>
      ${card.frozen ? 'Unfreeze' : 'Freeze Card'}
    </button>
    <button class="card-action-btn" onclick="openModal('pinModal')">
      <span class="action-icon">👁️</span>
      View Details
    </button>
    <button class="card-action-btn" onclick="openModal('limitModal'); renderLimitModal('${card.id}')">
      <span class="action-icon">🔧</span>
      Set Limit
    </button>
    <button class="card-action-btn" onclick="showToast('Card blocked & replacement ordered!','success')">
      <span class="action-icon">🚫</span>
      Block Card
    </button>
    <button class="card-action-btn" onclick="showToast('New PIN sent to your registered mobile!','info')">
      <span class="action-icon">🔐</span>
      Change PIN
    </button>
    <button class="card-action-btn" onclick="downloadCardStatement('${card.id}')">
      <span class="action-icon">📄</span>
      Statement
    </button>
  `;
}

/* ── Freeze / Unfreeze ── */
function toggleFreeze(id) {
  const card = Storage.getCard(id);
  const nowFrozen = !card.frozen;
  Storage.updateCard(id, { frozen: nowFrozen });
  showToast(nowFrozen ? '❄️ Card frozen successfully' : '✅ Card unfrozen', nowFrozen ? 'info' : 'success');
  renderCard(id);
}

/* ── Spend Limit ── */
function renderSpendLimit(card) {
  const pct  = Math.min((card.spent / card.limit) * 100, 100).toFixed(1);
  const high = pct > 80;
  document.getElementById('spendLimitSection').innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.875rem;">
      <span>Spent: <strong>₹${fmt(card.spent)}</strong></span>
      <span style="color:var(--text-muted);">Limit: ₹${fmt(card.limit)}</span>
    </div>
    <div class="spend-limit-bar">
      <div class="spend-limit-fill ${high ? 'high' : ''}" style="width:${pct}%;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:0.35rem;font-size:0.75rem;">
      <span style="color:${high?'var(--danger)':'var(--text-muted)'};">${pct}% used</span>
      <span style="color:var(--text-muted);">Available: ₹${fmt(card.limit - card.spent)}</span>
    </div>
  `;
}

/* ── Card Details Panel ── */
function renderCardDetails(card) {
  document.getElementById('cardDetailList').innerHTML = `
    <div class="card-detail-item">
      <span class="detail-label">Card Type</span>
      <span class="detail-value">${card.type} ${card.virtual ? '<span class="virtual-badge">Virtual</span>' : ''}</span>
    </div>
    <div class="card-detail-item">
      <span class="detail-label">Network</span>
      <span class="detail-value">${card.network}</span>
    </div>
    <div class="card-detail-item">
      <span class="detail-label">Card Number</span>
      <span class="detail-value" id="detailCardNum">${card.number}</span>
    </div>
    <div class="card-detail-item">
      <span class="detail-label">Expiry Date</span>
      <span class="detail-value">${card.expiry}</span>
    </div>
    <div class="card-detail-item">
      <span class="detail-label">CVV</span>
      <span class="detail-value" id="detailCvv">•••</span>
    </div>
    <div class="card-detail-item">
      <span class="detail-label">Status</span>
      <span class="detail-value">
        <span class="badge ${card.frozen ? 'badge-info' : 'badge-success'}">
          ${card.frozen ? '❄️ Frozen' : '✓ Active'}
        </span>
      </span>
    </div>
    <div class="card-detail-item">
      <span class="detail-label">Contactless</span>
      <span class="detail-value">${card.contactless ? '✅ Enabled' : '❌ Disabled'}</span>
    </div>
    <div class="card-detail-item">
      <span class="detail-label">Linked Account</span>
      <span class="detail-value">
        ${(Storage.getAccounts().find(a => a.id === card.accountId) || {}).type || '—'} ••••${card.accountId === 'acc_001' ? '4281' : '9014'}
      </span>
    </div>
  `;
}

/* ── Card Transactions ── */
function renderCardTransactions(card) {
  // Show transactions for the linked account
  const txns = Storage.getTransactions()
    .filter(t => t.account === card.accountId)
    .slice(0, 5);

  document.getElementById('cardTxnList').innerHTML = txns.map(txn => `
    <div class="txn-item">
      <div class="txn-icon">
        <img src="${txn.icon}" alt="" onerror="this.src='https://img.icons8.com/color/48/money.png'" />
      </div>
      <div class="txn-info">
        <div class="txn-merchant">${txn.merchant}</div>
        <div class="txn-category">${txn.category}</div>
      </div>
      <div>
        <div class="txn-amount ${txn.amount > 0 ? 'amount-credit' : 'amount-debit'}">
          ${txn.amount > 0 ? '+' : ''}₹${fmt(Math.abs(txn.amount))}
        </div>
        <div class="txn-date">${fmtDate(txn.date)}</div>
      </div>
    </div>
  `).join('') || '<p class="text-muted" style="padding:1rem;text-align:center;font-size:0.875rem;">No transactions</p>';
}

/* ── Limit Modal ── */
function renderLimitModal(id) {
  const card = Storage.getCard(id);
  document.getElementById('limitModalBody').innerHTML = `
    <div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:0.5rem;">
      <span>Current Limit:</span>
      <strong>₹${fmt(card.limit)}</strong>
    </div>
    <input type="range" class="limit-slider" id="limitSlider"
           min="10000" max="500000" step="5000" value="${card.limit}"
           oninput="document.getElementById('limitDisplay').textContent='₹'+parseInt(this.value).toLocaleString('en-IN')" />
    <div style="text-align:center;font-size:1.25rem;font-weight:700;color:var(--accent);" id="limitDisplay">
      ₹${fmt(card.limit)}
    </div>
    <button class="btn btn-primary btn-block"
            onclick="saveLimit('${id}')">
      Save New Limit
    </button>
  `;
}

function saveLimit(id) {
  const newLimit = parseInt(document.getElementById('limitSlider').value);
  Storage.updateCard(id, { limit: newLimit });
  closeModal('limitModal');
  showToast(`Card limit updated to ₹${newLimit.toLocaleString('en-IN')}`, 'success');
  renderCard(id);
}

/* ── PIN Verification ── */
function initPinInputs() {
  const inputs = document.querySelectorAll('.pin-input');
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
  });
}

function verifyPin() {
  const inputs = document.querySelectorAll('.pin-input');
  const pin    = Array.from(inputs).map(i => i.value).join('');
  if (pin === '1234') {
    const card = Storage.getCard(activeCardId);
    // Reveal full details
    document.getElementById('detailCardNum').textContent = card.fullNumber;
    document.getElementById('detailCvv').textContent = card.cvv;
    document.getElementById('cardNumDisplay').textContent = card.fullNumber;
    closeModal('pinModal');
    showToast('Card details revealed!', 'success');
    inputs.forEach(i => i.value = '');
  } else {
    showToast('Incorrect PIN. Try 1234 (demo)', 'error');
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
  }
}

/* ── Download Statement ── */
function downloadCardStatement(id) {
  const card = Storage.getCard(id);
  const txns = Storage.getTransactions().filter(t => t.account === card.accountId);
  const lines = [
    `VaultX — Card Statement`,
    `Card: ${card.number} (${card.type})`,
    `Generated: ${new Date().toLocaleDateString('en-IN')}`,
    '='.repeat(50),
    'Date          | Merchant                    | Amount',
    '-'.repeat(50),
    ...txns.map(t =>
      `${t.date}  | ${t.merchant.padEnd(27)} | ${t.amount > 0 ? '+' : ''}₹${Math.abs(t.amount)}`
    ),
    '='.repeat(50),
    `Total Debit:  ₹${fmt(txns.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0))}`,
    `Total Credit: ₹${fmt(txns.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0))}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `VaultX-Card-Statement-${card.number.slice(-4)}.txt`;
  a.click();
  showToast('Statement downloaded!', 'success');
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
