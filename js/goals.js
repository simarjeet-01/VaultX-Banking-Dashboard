// VaultX — Goals JS

const ICONS = ['🎯','🏠','💻','🏖️','📈','🚗','💍','🎓','✈️','🏋️','📱','🎮','🛡️','💰','🌍'];

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  Theme.init();

  const user = Storage.getUser();
  document.getElementById('sidebarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('topbarUserName').textContent = user.name.split(' ')[0];
  document.getElementById('notifCount').textContent = Storage.getUnreadCount();

  renderGoalStats();
  renderGoalsGrid();
  buildIconPicker();
  setMinDeadline();

  document.getElementById('addGoalForm').addEventListener('submit', submitAddGoal);
});

/* ── Stats ── */
function renderGoalStats() {
  const goals      = Storage.getGoals();
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved  = goals.reduce((s, g) => s + g.saved, 0);
  const completed   = goals.filter(g => g.saved >= g.target).length;
  const overallPct  = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0;

  document.getElementById('goalsStats').innerHTML = `
    <div class="stat-card fade-in">
      <div class="stat-icon-wrapper" style="background:rgba(102,126,234,0.15);">🎯</div>
      <div class="stat-label">Active Goals</div>
      <div class="stat-value">${goals.length}</div>
      <div class="stat-change text-muted">${completed} completed</div>
    </div>
    <div class="stat-card fade-in" style="animation-delay:0.05s">
      <div class="stat-icon-wrapper" style="background:rgba(67,206,162,0.15);">💰</div>
      <div class="stat-label">Total Saved</div>
      <div class="stat-value amount-credit">₹${fmt(totalSaved)}</div>
      <div class="stat-change text-muted">of ₹${fmt(totalTarget)} target</div>
    </div>
    <div class="stat-card fade-in" style="animation-delay:0.1s">
      <div class="stat-icon-wrapper" style="background:rgba(247,151,30,0.15);">📊</div>
      <div class="stat-label">Overall Progress</div>
      <div class="stat-value">${overallPct}%</div>
      <div class="stat-change text-muted">Across all goals</div>
    </div>
  `;
}

/* ── Goals Grid ── */
function renderGoalsGrid() {
  const goals = Storage.getGoals();
  const grid  = document.getElementById('goalsGrid');

  grid.innerHTML = goals.map(goal => {
    const pct        = Math.min((goal.saved / goal.target) * 100, 100);
    const remaining  = goal.target - goal.saved;
    const deadline   = new Date(goal.deadline);
    const today      = new Date();
    const daysLeft   = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    const done       = goal.saved >= goal.target;

    return `
      <div class="goal-card fade-in">
        <div class="goal-card-header">
          <div class="goal-icon-wrap" style="background:${goal.color}20;">
            <span style="font-size:1.6rem;">${goal.icon}</span>
          </div>
          <div class="dropdown" style="position:relative;">
            <button class="goal-menu-btn" onclick="toggleGoalMenu('${goal.id}')">⋯</button>
            <div class="dropdown-menu" id="goalMenu_${goal.id}">
              <div class="dropdown-item" onclick="openAddFunds('${goal.id}')">💰 Add Funds</div>
              <div class="dropdown-item" onclick="editGoal('${goal.id}')">✏️ Edit Goal</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item danger" onclick="deleteGoal('${goal.id}')">🗑️ Delete</div>
            </div>
          </div>
        </div>

        <div class="goal-name">${goal.icon} ${goal.name}</div>
        <div class="goal-desc">${goal.description}</div>

        <div class="goal-amounts">
          <span class="goal-saved" style="color:${goal.color};">₹${fmt(goal.saved)}</span>
          <span class="goal-target">/ ₹${fmt(goal.target)}</span>
        </div>
        <div class="goal-progress-track">
          <div class="goal-progress-fill"
               style="width:0%;background:${done ? 'var(--success)' : goal.color};"
               data-width="${pct.toFixed(1)}%">
          </div>
        </div>
        <div class="goal-meta">
          <span class="goal-deadline">
            📅 ${done ? '🎉 Goal Achieved!' : daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
          </span>
          <span class="goal-percent" style="color:${goal.color};">${pct.toFixed(0)}%</span>
        </div>

        ${!done ? `
          <button class="btn btn-primary btn-block btn-sm" style="margin-top:1rem;"
                  onclick="openAddFunds('${goal.id}')">
            + Add Funds
          </button>
        ` : `
          <div class="badge badge-success" style="display:block;text-align:center;margin-top:1rem;padding:0.4rem;">
            🎉 Goal Achieved!
          </div>
        `}
      </div>
    `;
  }).join('') + `
    <button class="goal-add-btn" onclick="openAddGoalModal()">
      <div class="plus-icon">+</div>
      <span>Create New Goal</span>
    </button>
  `;

  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll('.goal-progress-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
      bar.style.transition = 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)';
    });
  }, 100);
}

/* ── Goal Menu ── */
function toggleGoalMenu(id) {
  const menu = document.getElementById(`goalMenu_${id}`);
  // Close all other menus
  document.querySelectorAll('.dropdown-menu.open').forEach(m => {
    if (m !== menu) m.classList.remove('open');
  });
  menu.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  }
});

/* ── Add Goal Modal ── */
function openAddGoalModal() { openModal('addGoalModal'); }

function buildIconPicker() {
  let selected = '🎯';
  const picker = document.getElementById('iconPicker');
  picker.innerHTML = ICONS.map(icon => `
    <button type="button"
            class="icon-pick-btn"
            style="font-size:1.4rem;background:var(--bg-input);border:2px solid var(--border);
                   border-radius:var(--border-radius-sm);width:40px;height:40px;cursor:pointer;
                   transition:all 0.2s;${icon === selected ? 'border-color:var(--accent);background:rgba(102,126,234,0.15);' : ''}"
            onclick="pickIcon('${icon}', this)">${icon}</button>
  `).join('');
}

function pickIcon(icon, btn) {
  document.getElementById('selectedIcon').value = icon;
  document.querySelectorAll('.icon-pick-btn').forEach(b => {
    b.style.borderColor = 'var(--border)';
    b.style.background = 'var(--bg-input)';
  });
  btn.style.borderColor = 'var(--accent)';
  btn.style.background = 'rgba(102,126,234,0.15)';
}

function setMinDeadline() {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  document.getElementById('goalDeadline').min = today.toISOString().split('T')[0];
}

function submitAddGoal(e) {
  e.preventDefault();
  const name     = document.getElementById('goalName').value.trim();
  const icon     = document.getElementById('selectedIcon').value || '🎯';
  const target   = parseFloat(document.getElementById('goalTarget').value);
  const saved    = parseFloat(document.getElementById('goalSaved').value) || 0;
  const deadline = document.getElementById('goalDeadline').value;
  const desc     = document.getElementById('goalDesc').value.trim();

  if (!name)                   { showToast('Enter a goal name', 'error'); return; }
  if (!target || target <= 0)  { showToast('Enter a valid target amount', 'error'); return; }
  if (!deadline)               { showToast('Select a target date', 'error'); return; }
  if (saved > target)          { showToast('Saved amount cannot exceed target', 'error'); return; }

  const colors = ['#667eea','#f093fb','#43cea2','#f7971e','#4facfe','#a8edea'];
  const color  = colors[Storage.getGoals().length % colors.length];

  const newGoal = {
    id: 'goal_' + Date.now(),
    name, icon, target, saved, deadline, description: desc || name, color
  };
  Storage.addGoal(newGoal);
  closeModal('addGoalModal');
  document.getElementById('addGoalForm').reset();
  buildIconPicker();
  renderGoalStats();
  renderGoalsGrid();
  showToast(`Goal "${name}" created!`, 'success');
}

/* ── Add Funds ── */
function openAddFunds(goalId) {
  const goal = Storage.getGoals().find(g => g.id === goalId);
  if (!goal) return;
  document.getElementById('addFundsGoalId').value = goalId;
  document.getElementById('addFundsTitle').textContent = `Add Funds — ${goal.icon} ${goal.name}`;
  document.getElementById('addFundsAmount').value = '';
  openModal('addFundsModal');
  // Close any open dropdowns
  document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
}

function submitAddFunds() {
  const goalId = document.getElementById('addFundsGoalId').value;
  const amount = parseFloat(document.getElementById('addFundsAmount').value);
  const goal   = Storage.getGoals().find(g => g.id === goalId);

  if (!amount || amount <= 0)     { showToast('Enter a valid amount', 'error'); return; }

  const totalBal = Storage.getAccounts().reduce((s, a) => s + a.balance, 0);
  if (amount > totalBal)          { showToast('Insufficient balance', 'error'); return; }

  const newSaved = Math.min(goal.saved + amount, goal.target);
  Storage.updateGoal(goalId, { saved: newSaved });

  // Deduct from primary account
  const acc = Storage.getAccounts()[0];
  Storage.updateAccount(acc.id, { balance: acc.balance - amount });

  // Log transaction
  Storage.addTransaction({
    id: 'txn_' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    merchant: `Goal: ${goal.name}`,
    category: 'Transfer',
    amount: -amount,
    account: acc.id,
    status: 'completed',
    icon: 'https://img.icons8.com/color/48/goal.png',
    description: `Savings goal contribution`,
    reference: 'GOAL' + Date.now(),
  });

  closeModal('addFundsModal');
  renderGoalStats();
  renderGoalsGrid();

  if (newSaved >= goal.target) {
    showToast(`🎉 Goal "${goal.name}" achieved! Congratulations!`, 'success');
  } else {
    const remaining = goal.target - newSaved;
    showToast(`₹${fmt(amount)} added to "${goal.name}". ₹${fmt(remaining)} to go!`, 'success');
  }
}

/* ── Edit Goal ── */
function editGoal(id) {
  const goal = Storage.getGoals().find(g => g.id === id);
  if (!goal) return;
  document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));

  // Re-use add goal form pre-filled
  document.getElementById('goalName').value     = goal.name;
  document.getElementById('goalTarget').value   = goal.target;
  document.getElementById('goalSaved').value    = goal.saved;
  document.getElementById('goalDeadline').value = goal.deadline;
  document.getElementById('goalDesc').value     = goal.description;
  document.getElementById('selectedIcon').value = goal.icon;

  openModal('addGoalModal');

  // Override submit to update instead of create
  const form = document.getElementById('addGoalForm');
  form.onsubmit = (e) => {
    e.preventDefault();
    Storage.updateGoal(id, {
      name:        document.getElementById('goalName').value.trim(),
      target:      parseFloat(document.getElementById('goalTarget').value),
      saved:       parseFloat(document.getElementById('goalSaved').value) || 0,
      deadline:    document.getElementById('goalDeadline').value,
      description: document.getElementById('goalDesc').value.trim(),
      icon:        document.getElementById('selectedIcon').value,
    });
    closeModal('addGoalModal');
    renderGoalStats();
    renderGoalsGrid();
    showToast('Goal updated!', 'success');
    // Restore original submit handler
    form.onsubmit = submitAddGoal;
    form.reset();
    buildIconPicker();
  };
}

/* ── Delete Goal ── */
function deleteGoal(id) {
  const goals = Storage.getGoals().filter(g => g.id !== id);
  Storage.setGoals(goals);
  renderGoalStats();
  renderGoalsGrid();
  showToast('Goal deleted', 'info');
}

/* ── Helpers ── */
function fmt(n) { return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
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
