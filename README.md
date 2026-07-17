# VaultX — Digital Banking Dashboard

A fully responsive, feature-rich digital banking dashboard built with pure HTML, CSS, and JavaScript. No frameworks, no build tools — just open and go.

## 🚀 Quick Start

1. Open `login.html` in any modern browser
2. Click **"Use Demo Credentials"** or enter any email + password
3. Explore the full dashboard

## 📁 Project Structure

```
VaultX-Banking-Dashboard/
├── index.html          — Main dashboard
├── login.html          — Login page
├── signup.html         — Sign up page
├── accounts.html       — Account management
├── transactions.html   — Transaction history
├── cards.html          — Card management
├── transfer.html       — Money transfer
├── analytics.html      — Spending analytics
├── goals.html          — Savings goals
├── settings.html       — App settings
│
├── css/
│   ├── global.css      — Design system, sidebar, topbar, components
│   ├── auth.css        — Login & signup styles
│   ├── dashboard.css   — Dashboard & account card styles
│   ├── cards.css       — Bank card UI & 3D effects
│   ├── transfer.css    — Transfer form & receipt
│   ├── analytics.css   — Charts, budget & goals
│   └── responsive.css  — Mobile-first responsive styles
│
└── js/
    ├── data.js         — Mock data (accounts, transactions, cards, goals)
    ├── storage.js      — localStorage helpers & auth guard
    ├── theme.js        — Dark/light mode toggle
    ├── auth.js         — Login/signup simulation
    ├── dashboard.js    — Dashboard rendering & interactions
    ├── transactions.js — Transaction list, filters, export
    ├── cards.js        — Card controls, freeze, PIN, 3D tilt
    ├── transfer.js     — Transfer flow, confirmation, receipt
    ├── analytics.js    — Charts, budget tracker, category breakdown
    └── goals.js        — Savings goals CRUD & progress tracking
```

## ✨ Features

### Auth
- Secure-looking login & signup with validation
- Password strength indicator
- Demo credential auto-fill
- Dark/light mode on auth pages

### Dashboard
- Animated balance counter on load
- Income vs expense bar chart
- Real-time spending category breakdown
- Quick transfer widget with beneficiary selection
- Recent transactions list
- Notification panel (mark all read)
- Time-based greeting

### Accounts
- Savings & current account cards with gradients
- Full account details (IFSC, branch, interest rate)
- Per-account transaction mini-statement
- Balance visibility toggle

### Transactions
- Full transaction history grouped by date
- Search across merchant, category, description, reference
- Category filters (Income, Shopping, Food, Transport, Bills, Entertainment, Transfer)
- Per-account filter
- Transaction detail modal
- Downloadable demo receipt (TXT)
- CSV export of all transactions

### Cards
- 3D tilt effect on hover (mouse-tracking)
- Freeze / unfreeze simulation
- PIN verification to reveal full card number & CVV (demo PIN: 1234)
- Card limit slider with real-time update
- Block card & change PIN simulations
- Spend limit progress bar
- Virtual card UI
- Card statement download

### Transfer
- UPI / NEFT / IMPS / RTGS payment type selection
- From-account selector with balance shown
- Beneficiary chip selector + saved beneficiaries list
- Quick amount buttons (₹500 – ₹10,000)
- Real-time transfer summary panel
- Confirmation modal before executing
- Balance deduction + transaction creation on confirm
- Printable / downloadable transaction receipt
- Add new beneficiary modal

### Analytics
- Income vs expense bar chart (1M / 3M / 6M periods)
- Monthly spending trend bars
- Spending by category with animated progress bars
- SVG donut chart
- Budget tracker with over-budget alerts
- Top merchants ranking

### Goals
- Create savings goals with icon picker, target, deadline
- Animated circular progress bars
- Add funds → deducts from primary account + logs transaction
- Edit and delete goals
- 🎉 Achievement toast when goal is reached
- Overall savings stats

### Settings
- Profile edit (name, email, phone)
- Security toggles (2FA, biometric, sessions)
- Notification preferences
- Dark/light mode toggle + accent color picker
- Privacy controls
- Data export (JSON)

## 🎨 Design

- **Dark mode default** with full light mode support
- CSS custom properties for instant theming
- Accent color: `#667eea` (indigo-purple gradient)
- Card gradients, glassmorphism hints, smooth animations
- Fully responsive: desktop → tablet → mobile (320px+)
- Mobile hamburger sidebar with overlay

## 🔒 Demo Credentials

Any email / password works in demo mode. For the pre-filled demo:
- **Email:** simarjeet@vaultx.in
- **Password:** Vaultx@2026
- **Card PIN:** 1234

## 🛠️ Tech Stack

- HTML5 (semantic)
- CSS3 (custom properties, grid, flexbox, animations)
- Vanilla JavaScript (ES6+)
- localStorage for state persistence
- DiceBear API for avatar images
- Icons8 for transaction icons

---

*VaultX is a demo project. All data is simulated and stored locally in your browser.*
