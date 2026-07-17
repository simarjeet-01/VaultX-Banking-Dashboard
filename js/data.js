// VaultX - Mock Data Store
const VaultXData = {
  user: {
    id: "usr_001",
    name: "Simarjeet Singh",
    email: "simarjeet@vaultx.in",
    phone: "+91 98765 43210",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simarjeet&backgroundColor=b6e3f4",
    joinDate: "2022-03-15",
    kycVerified: true,
    notifications: [
      { id: "n1", type: "credit", message: "Salary credited ₹45,000", time: "2 hours ago", read: false, icon: "💰" },
      { id: "n2", type: "debit", message: "Amazon payment ₹2,499 deducted", time: "5 hours ago", read: false, icon: "🛒" },
      { id: "n3", type: "alert", message: "New login from MacBook Air", time: "1 day ago", read: true, icon: "🔐" },
      { id: "n4", type: "info", message: "Your KYC verification is complete", time: "2 days ago", read: true, icon: "✅" },
      { id: "n5", type: "promo", message: "Get 5% cashback on fuel transactions", time: "3 days ago", read: true, icon: "⛽" },
    ]
  },

  accounts: [
    {
      id: "acc_001",
      type: "Savings",
      number: "4281 0000 0000 4281",
      shortNumber: "4281",
      balance: 124580.45,
      currency: "INR",
      ifsc: "VLTX0001234",
      branch: "Connaught Place, New Delhi",
      interestRate: 4.5,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "https://img.icons8.com/fluency/48/savings.png"
    },
    {
      id: "acc_002",
      type: "Current",
      number: "9014 0000 0000 9014",
      shortNumber: "9014",
      balance: 38250.00,
      currency: "INR",
      ifsc: "VLTX0001234",
      branch: "Connaught Place, New Delhi",
      interestRate: 0,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "https://img.icons8.com/fluency/48/bank-account.png"
    }
  ],

  cards: [
    {
      id: "card_001",
      type: "Debit",
      network: "Visa",
      number: "4582 •••• •••• 4281",
      fullNumber: "4582 1234 5678 4281",
      cvv: "382",
      expiry: "05/30",
      holder: "SIMARJEET SINGH",
      accountId: "acc_001",
      frozen: false,
      limit: 100000,
      spent: 28450,
      color: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      virtual: false,
      contactless: true
    },
    {
      id: "card_002",
      type: "Credit",
      network: "Mastercard",
      number: "5412 •••• •••• 9014",
      fullNumber: "5412 9876 5432 9014",
      cvv: "517",
      expiry: "11/28",
      holder: "SIMARJEET SINGH",
      accountId: "acc_002",
      frozen: false,
      limit: 200000,
      spent: 45200,
      color: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      virtual: false,
      contactless: true
    },
    {
      id: "card_003",
      type: "Virtual",
      network: "Visa",
      number: "4532 •••• •••• 7731",
      fullNumber: "4532 8765 4321 7731",
      cvv: "294",
      expiry: "12/25",
      holder: "SIMARJEET SINGH",
      accountId: "acc_001",
      frozen: false,
      limit: 50000,
      spent: 8900,
      color: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
      virtual: true,
      contactless: false
    }
  ],

  transactions: [
    { id: "txn_001", date: "2026-07-17", merchant: "Amazon India", category: "Shopping", amount: -2499, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/amazon.png", description: "Online Shopping", reference: "AMZ2607171" },
    { id: "txn_002", date: "2026-07-17", merchant: "Salary - TechCorp", category: "Income", amount: 45000, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/salary.png", description: "Monthly Salary", reference: "SAL2607171" },
    { id: "txn_003", date: "2026-07-16", merchant: "Zomato", category: "Food", amount: -649, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/zomato.png", description: "Food Delivery", reference: "ZOM2607161" },
    { id: "txn_004", date: "2026-07-16", merchant: "Netflix", category: "Entertainment", amount: -649, account: "acc_002", status: "completed", icon: "https://img.icons8.com/color/48/netflix.png", description: "Monthly Subscription", reference: "NFL2607161" },
    { id: "txn_005", date: "2026-07-15", merchant: "Swiggy", category: "Food", amount: -389, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/swiggy.png", description: "Food Delivery", reference: "SWG2607151" },
    { id: "txn_006", date: "2026-07-15", merchant: "Ola Cabs", category: "Transport", amount: -245, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/ola-cabs.png", description: "Cab Service", reference: "OLA2607151" },
    { id: "txn_007", date: "2026-07-14", merchant: "HDFC Bank ATM", category: "ATM", amount: -5000, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/atm.png", description: "Cash Withdrawal", reference: "ATM2607141" },
    { id: "txn_008", date: "2026-07-14", merchant: "Flipkart", category: "Shopping", amount: -3499, account: "acc_002", status: "completed", icon: "https://img.icons8.com/color/48/flipkart.png", description: "Electronics", reference: "FLK2607141" },
    { id: "txn_009", date: "2026-07-13", merchant: "Spotify", category: "Entertainment", amount: -119, account: "acc_002", status: "completed", icon: "https://img.icons8.com/color/48/spotify.png", description: "Music Subscription", reference: "SPT2607131" },
    { id: "txn_010", date: "2026-07-13", merchant: "Electricity Bill - BSES", category: "Bills", amount: -2340, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/electricity.png", description: "Monthly Bill", reference: "BSE2607131" },
    { id: "txn_011", date: "2026-07-12", merchant: "Freelance Payment", category: "Income", amount: 12000, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/invoice.png", description: "Project Payment", reference: "FRL2607121" },
    { id: "txn_012", date: "2026-07-12", merchant: "BigBasket", category: "Shopping", amount: -1850, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/vegetable-basket.png", description: "Groceries", reference: "BBK2607121" },
    { id: "txn_013", date: "2026-07-11", merchant: "Airtel Recharge", category: "Bills", amount: -599, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/airtel.png", description: "Mobile Recharge", reference: "ATL2607111" },
    { id: "txn_014", date: "2026-07-11", merchant: "Uber", category: "Transport", amount: -312, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/uber.png", description: "Cab Service", reference: "UBR2607111" },
    { id: "txn_015", date: "2026-07-10", merchant: "Transfer to Rahul Sharma", category: "Transfer", amount: -5000, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/bank-transfer.png", description: "Money Transfer", reference: "TRF2607101" },
    { id: "txn_016", date: "2026-07-10", merchant: "SBI Home Loan EMI", category: "Bills", amount: -18500, account: "acc_002", status: "completed", icon: "https://img.icons8.com/color/48/sbi.png", description: "Home Loan EMI", reference: "SBI2607101" },
    { id: "txn_017", date: "2026-07-09", merchant: "Myntra", category: "Shopping", amount: -2199, account: "acc_002", status: "completed", icon: "https://img.icons8.com/color/48/myyntra-app.png", description: "Clothing", reference: "MYN2607091" },
    { id: "txn_018", date: "2026-07-09", merchant: "BookMyShow", category: "Entertainment", amount: -750, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/movie.png", description: "Movie Tickets", reference: "BMS2607091" },
    { id: "txn_019", date: "2026-07-08", merchant: "Dominos Pizza", category: "Food", amount: -549, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/pizza.png", description: "Food Delivery", reference: "DOM2607081" },
    { id: "txn_020", date: "2026-07-08", merchant: "Paytm Cashback", category: "Income", amount: 250, account: "acc_001", status: "completed", icon: "https://img.icons8.com/color/48/paytm.png", description: "Cashback", reference: "PTM2607081" },
  ],

  beneficiaries: [
    { id: "ben_001", name: "Rahul Sharma", bank: "SBI", account: "••••5521", upi: "rahul@sbi", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=c0aede", initials: "RS" },
    { id: "ben_002", name: "Priya Mehta", bank: "HDFC", account: "••••8834", upi: "priya@hdfc", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffdfbf", initials: "PM" },
    { id: "ben_003", name: "Arjun Kapoor", bank: "ICICI", account: "••••2271", upi: "arjun@icici", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=d1f4d1", initials: "AK" },
    { id: "ben_004", name: "Neha Gupta", bank: "Axis Bank", account: "••••6643", upi: "neha@axis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha&backgroundColor=ffd5e5", initials: "NG" },
  ],

  goals: [
    { id: "goal_001", name: "Emergency Fund", target: 150000, saved: 87500, icon: "🛡️", color: "#667eea", deadline: "2026-12-31", description: "6 months of expenses" },
    { id: "goal_002", name: "New MacBook Pro", target: 200000, saved: 45000, icon: "💻", color: "#f093fb", deadline: "2027-03-31", description: "Latest M4 model" },
    { id: "goal_003", name: "Goa Vacation", target: 50000, saved: 32000, icon: "🏖️", color: "#43cea2", deadline: "2026-12-25", description: "Holiday trip with family" },
    { id: "goal_004", name: "Home Renovation", target: 500000, saved: 120000, icon: "🏠", color: "#f7971e", deadline: "2027-06-30", description: "Living room & kitchen" },
    { id: "goal_005", name: "Investment Portfolio", target: 300000, saved: 180000, icon: "📈", color: "#4facfe", deadline: "2027-01-01", description: "Stock market & mutual funds" },
  ],

  monthlyData: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    income:  [52000, 48000, 65000, 57000, 72000, 60000, 57000],
    expense: [24000, 15000, 31000, 18000, 27000, 21000, 16000],
  },

  categorySpending: [
    { name: "Shopping", percent: 32, amount: 12400, color: "#667eea", icon: "🛍️" },
    { name: "Food", percent: 21, amount: 8100, color: "#f093fb", icon: "🍔" },
    { name: "Transport", percent: 16, amount: 6200, color: "#43cea2", icon: "🚗" },
    { name: "Entertainment", percent: 12, amount: 4650, color: "#f7971e", icon: "🎬" },
    { name: "Bills", percent: 11, amount: 4300, color: "#4facfe", icon: "💡" },
    { name: "Other", percent: 8, amount: 3100, color: "#a8edea", icon: "···" },
  ],

  budget: {
    total: 60000,
    categories: [
      { name: "Shopping", budget: 15000, spent: 12400, icon: "🛍️", color: "#667eea" },
      { name: "Food", budget: 10000, spent: 8100, icon: "🍔", color: "#f093fb" },
      { name: "Transport", budget: 5000, spent: 6200, icon: "🚗", color: "#43cea2" },
      { name: "Entertainment", budget: 5000, spent: 4650, icon: "🎬", color: "#f7971e" },
      { name: "Bills", budget: 25000, spent: 21500, icon: "💡", color: "#4facfe" },
    ]
  }
};

// Initialize data in localStorage if not present
function initData() {
  if (!localStorage.getItem('vaultx_user')) {
    localStorage.setItem('vaultx_user', JSON.stringify(VaultXData.user));
  }
  if (!localStorage.getItem('vaultx_accounts')) {
    localStorage.setItem('vaultx_accounts', JSON.stringify(VaultXData.accounts));
  }
  if (!localStorage.getItem('vaultx_cards')) {
    localStorage.setItem('vaultx_cards', JSON.stringify(VaultXData.cards));
  }
  if (!localStorage.getItem('vaultx_transactions')) {
    localStorage.setItem('vaultx_transactions', JSON.stringify(VaultXData.transactions));
  }
  if (!localStorage.getItem('vaultx_beneficiaries')) {
    localStorage.setItem('vaultx_beneficiaries', JSON.stringify(VaultXData.beneficiaries));
  }
  if (!localStorage.getItem('vaultx_goals')) {
    localStorage.setItem('vaultx_goals', JSON.stringify(VaultXData.goals));
  }
}

initData();
