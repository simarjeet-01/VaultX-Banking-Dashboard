// VaultX - localStorage Helpers

const Storage = {
  // Generic get/set
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch { return null; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },

  // User
  getUser() { return this.get('vaultx_user') || VaultXData.user; },
  setUser(u) { this.set('vaultx_user', u); },

  // Auth session
  getSession() { return this.get('vaultx_session'); },
  setSession(s) { this.set('vaultx_session', s); },
  clearSession() { this.remove('vaultx_session'); },
  isLoggedIn() { return !!this.getSession(); },

  // Accounts
  getAccounts() { return this.get('vaultx_accounts') || VaultXData.accounts; },
  setAccounts(a) { this.set('vaultx_accounts', a); },
  getAccount(id) { return this.getAccounts().find(a => a.id === id); },
  updateAccount(id, changes) {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...changes };
      this.setAccounts(accounts);
    }
  },

  // Cards
  getCards() { return this.get('vaultx_cards') || VaultXData.cards; },
  setCards(c) { this.set('vaultx_cards', c); },
  getCard(id) { return this.getCards().find(c => c.id === id); },
  updateCard(id, changes) {
    const cards = this.getCards();
    const idx = cards.findIndex(c => c.id === id);
    if (idx !== -1) {
      cards[idx] = { ...cards[idx], ...changes };
      this.setCards(cards);
    }
    return this.getCards()[idx];
  },

  // Transactions
  getTransactions() { return this.get('vaultx_transactions') || VaultXData.transactions; },
  setTransactions(t) { this.set('vaultx_transactions', t); },
  addTransaction(txn) {
    const txns = this.getTransactions();
    txns.unshift(txn);
    this.setTransactions(txns);
  },

  // Beneficiaries
  getBeneficiaries() { return this.get('vaultx_beneficiaries') || VaultXData.beneficiaries; },
  setBeneficiaries(b) { this.set('vaultx_beneficiaries', b); },
  addBeneficiary(ben) {
    const bens = this.getBeneficiaries();
    bens.push(ben);
    this.setBeneficiaries(bens);
  },

  // Goals
  getGoals() { return this.get('vaultx_goals') || VaultXData.goals; },
  setGoals(g) { this.set('vaultx_goals', g); },
  addGoal(goal) {
    const goals = this.getGoals();
    goals.push(goal);
    this.setGoals(goals);
  },
  updateGoal(id, changes) {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx !== -1) {
      goals[idx] = { ...goals[idx], ...changes };
      this.setGoals(goals);
    }
  },

  // Theme
  getTheme() { return localStorage.getItem('vaultx_theme') || 'dark'; },
  setTheme(t) { localStorage.setItem('vaultx_theme', t); },

  // Notifications
  markNotificationsRead() {
    const user = this.getUser();
    user.notifications = user.notifications.map(n => ({ ...n, read: true }));
    this.setUser(user);
  },
  getUnreadCount() {
    const user = this.getUser();
    return user.notifications.filter(n => !n.read).length;
  }
};

// Auth guard — redirect to login if not logged in
function requireAuth() {
  if (!Storage.isLoggedIn()) {
    window.location.href = 'login.html';
  }
}
