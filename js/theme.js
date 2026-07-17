// VaultX - Theme Manager

const Theme = {
  init() {
    const saved = Storage.getTheme();
    this.apply(saved);
    this.updateToggleButton(saved);
  },

  apply(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    Storage.setTheme(mode);
  },

  toggle() {
    const current = Storage.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    this.updateToggleButton(next);
  },

  updateToggleButton(mode) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.innerHTML = mode === 'dark'
        ? '<i class="icon">☀️</i>'
        : '<i class="icon">🌙</i>';
      btn.title = mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Storage !== 'undefined' && Storage.getTheme) {
    Theme.init();
  }
});
