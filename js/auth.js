// VaultX - Auth Simulation

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();

  // --- LOGIN PAGE ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Demo credential fill
    const demoBtn = document.getElementById('demoFill');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        document.getElementById('email').value = 'simarjeet@vaultx.in';
        document.getElementById('password').value = 'Vaultx@2026';
        showToast('Demo credentials filled!', 'info');
      });
    }

    // Toggle password visibility
    const togglePwd = document.getElementById('togglePassword');
    if (togglePwd) {
      togglePwd.addEventListener('click', () => {
        const pwd = document.getElementById('password');
        const isText = pwd.type === 'text';
        pwd.type = isText ? 'password' : 'text';
        togglePwd.textContent = isText ? '👁️' : '🙈';
      });
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = loginForm.querySelector('.auth-btn');

      clearErrors();

      // Basic validation
      if (!email) { showFieldError('email', 'Email is required'); return; }
      if (!isValidEmail(email)) { showFieldError('email', 'Enter a valid email'); return; }
      if (!password) { showFieldError('password', 'Password is required'); return; }

      // Simulate loading
      btn.classList.add('loading');
      btn.disabled = true;

      setTimeout(() => {
        // Accept any non-empty credentials (demo mode)
        const session = {
          userId: 'usr_001',
          email: email,
          loginTime: new Date().toISOString(),
          token: 'demo_token_' + Math.random().toString(36).substr(2)
        };
        Storage.setSession(session);
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 800);
      }, 1200);
    });
  }

  // --- SIGNUP PAGE ---
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    const togglePwd = document.getElementById('togglePassword');
    if (togglePwd) {
      togglePwd.addEventListener('click', () => {
        const pwd = document.getElementById('password');
        const isText = pwd.type === 'text';
        pwd.type = isText ? 'password' : 'text';
        togglePwd.textContent = isText ? '👁️' : '🙈';
      });
    }

    // Password strength indicator
    const pwdInput = document.getElementById('password');
    if (pwdInput) {
      pwdInput.addEventListener('input', () => {
        updatePasswordStrength(pwdInput.value);
      });
    }

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirmPassword').value;
      const agree = document.getElementById('agreeTerms').checked;
      const btn = signupForm.querySelector('.auth-btn');

      if (!name) { showFieldError('fullName', 'Full name is required'); return; }
      if (!email || !isValidEmail(email)) { showFieldError('email', 'Enter a valid email'); return; }
      if (!phone || phone.length < 10) { showFieldError('phone', 'Enter a valid phone number'); return; }
      if (password.length < 8) { showFieldError('password', 'Password must be at least 8 characters'); return; }
      if (password !== confirm) { showFieldError('confirmPassword', 'Passwords do not match'); return; }
      if (!agree) { showToast('Please agree to the Terms & Conditions', 'error'); return; }

      btn.classList.add('loading');
      btn.disabled = true;

      setTimeout(() => {
        // Update user data with signup info
        const user = Storage.getUser();
        user.name = name;
        user.email = email;
        user.phone = phone;
        Storage.setUser(user);

        const session = {
          userId: 'usr_001',
          email: email,
          loginTime: new Date().toISOString(),
          token: 'demo_token_' + Math.random().toString(36).substr(2)
        };
        Storage.setSession(session);
        showToast('Account created! Welcome to VaultX!', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 800);
      }, 1500);
    });
  }
});

// Helpers
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const group = field.closest('.form-group');
  if (group) {
    group.classList.add('error');
    const err = group.querySelector('.field-error');
    if (err) err.textContent = msg;
  }
}

function clearErrors() {
  document.querySelectorAll('.form-group.error').forEach(g => {
    g.classList.remove('error');
    const err = g.querySelector('.field-error');
    if (err) err.textContent = '';
  });
}

function updatePasswordStrength(pwd) {
  const bar = document.querySelector('.strength-fill');
  const label = document.querySelector('.strength-label');
  if (!bar || !label) return;

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#f5576c', '#f7971e', '#ffd200', '#43cea2'];
  const widths = ['0%', '25%', '50%', '75%', '100%'];

  bar.style.width = widths[score] || '0%';
  bar.style.background = colors[score] || 'transparent';
  label.textContent = score > 0 ? levels[score] : '';
  label.style.color = colors[score] || '';
}

// Toast notification
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
