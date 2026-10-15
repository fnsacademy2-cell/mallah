# Mallah Traders — Agri-Commodity Trading Business MIS

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-black.svg)](https://palletsprojects.com/p/flask/)
[![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status: Production](https://img.shields.io/badge/Status-Production%20Ready-success.svg)]()

A clean, modern, intuitive web application engineered for **Agricultural Commodity Trading & Grain Merchants** (Wheat, Rice, Sugar Cane, Corn, Mustard & Cash Crops).

Built with **HTML5, Vanilla CSS3, JavaScript (ES6+), and a lightweight Flask/SQLite REST backend**.

---

## 🌟 How the Business Works (Easy 4-Step Operation)

The system is designed around the exact real-world flow of a commodity business:

1. **🟢 BUYING FROM FARMERS / SUPPLIERS (Inward Deals)**:
   - Click **`+ Buy (Purchase)`** in the top bar or dashboard hub.
   - Pick your commodity (🌾 **Wheat**, 🍚 **Rice**, 🎋 **Sugar Cane**, 🌽 **Corn**, 🌻 **Mustard**).
   - Enter Weight in **KG (ڪلو گرام)** directly from scale/kanta ticket — auto-converts to **Maunds (منڊ = 40 KG)**!
   - Enter Rate per 1 KG (اگهه في 1 ڪلو) — auto-converts to Rate per 40 KG (Maund)!
   - Enter cash paid to farmer now — the remaining balance payable is auto-calculated!

2. **🔵 SELLING TO GRAIN MILLS / BUYERS (Outward Deals)**:
   - Click **`+ Sell (Sale)`**.
   - Select buyer (Flour Mill, Rice Mill, Sugar Mill, or Trader).
   - Enter commodity quantity, selling rate, and vehicle delivery details.
   - Cash received and remaining market receivables update instantly!

3. **📦 GODOWN / WAREHOUSE INVENTORY**:
   - The system tracks every bag and maund: `Purchased − Sold = In Godown`.
   - Visual cards show live stock in Maunds & KG, average buying price, and total inventory value.

4. **📈 PROFIT & LOSS ANALYSIS**:
   - `Total Sales Revenue − Total Purchases Cost − Mandi Expenses = Net Profit`.
   - Item-wise profitability breakdown: see exactly how much money you made on Wheat, Rice, Sugar Cane, etc.

---

## 🚀 Key Modules & Capabilities

- **Executive Dashboard**:
  - 4 High-level business cards: Godown Stock, Market Receivables (Dues to Collect), Supplier Payables (Dues to Pay), and Net Profit.
  - **Mandi Action Hub**: 1-click shortcuts to Record Purchase, Record Sale, or Record Cash Payment.
  - **Live Commodity Stock Position**: Instant visibility of Wheat, Rice, Sugar Cane stocks.
  - **Client Balances Quick Board**: Instant debtor (**Dr**) & creditor (**Cr**) status with 1-click ledger statements.

- **Buy & Sell Desk (Deals)**:
  - Big visual toggle: **BUY (Purchase from Farmer)** vs **SELL (Sale to Mill/Buyer)**.
  - **Mandi Dual-Unit Smart Calculator (KG Default)**:
    - **Default Input**: Enter weight directly in **KG (ڪلو گرام)** from scale/kanta ticket.
    - Live sync displays equivalent in **Maunds (منڊ = 40 KG)** automatically!
    - Enter Rate per 1 KG (اگهه في 1 ڪلو) ➔ Auto-syncs to Rate per 40 KG (منڊ).
  - Mandi & Freight Expenses: Kiraya (Freight), Kanta (Scale), Loading, Unloading, Brokery (Arhat).
  - Payer toggle: Company Paid vs Party Borne.
  - Edit Deal capability on every transaction row.

- **Party Khata (Customer & Supplier Ledger)**:
  - Select any Farmer or Mill to view their complete statement.
  - Spotlight banner displays live Net Due: 🔴 Dr (They owe you), 🟢 Cr (You owe them), ⚪ Cleared.
  - Chronological running ledger and 1-click **Print Statement / Settle Account**.

- **Cashbook & Payments**:
  - Record cash & bank vouchers: Inward from buyers, Outward to suppliers.
  - Daily Cash Flow monitoring.

- **Profit & Loss Center**:
  - Comprehensive trade margins and commodity-wise performance table.

- **Printable Bill & Invoice Studio**:
  - Multi-language official bills (English and Sindhi RTL).

- **Backup & Data Tools**:
  - 1-click SQLite database download, CSV exports, and safe Delete All Records option.

---

## 📁 Repository Structure

```text
├── index.html               # Main HTML5 single-page application dashboard
├── styles.css               # Design system, glassmorphism, responsive grid & print styling
├── app.js                   # JavaScript SPA controller, Chart.js visuals, math engines
├── server.py                # Python Flask REST API connected to SQLite
├── run_web_dashboard.py     # Python launcher (starts server & opens browser)
├── run_web_dashboard.bat    # Windows 1-click batch launcher
├── commodity_mis.db         # Local SQLite database
├── requirements.txt         # Python dependencies
├── .gitignore               # Clean git ignore configuration
└── LICENSE                  # MIT License
```

---

## 🚀 Getting Started

### 1. Requirements
- Python 3.9 or higher
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/mallah-traders-mis.git
cd mallah-traders-mis
pip install -r requirements.txt
```

### 3. Launching the Dashboard

#### Windows 1-Click Launch:
Double-click `run_web_dashboard.bat`.

#### Terminal Launch:
```bash
python run_web_dashboard.py
```

The application will start on `http://127.0.0.1:5000` and automatically open in your default web browser.

#### Standalone Offline Mode:
You can also open `index.html` directly in any web browser without running Python. The app will automatically run in client-side storage mode.

---

## 🧮 Accounting & Calculation Logic

### 1. Transaction Balance
$$\text{Gross Total} = \text{Weight in KG} \times \text{Rate per 1 KG} \quad \left( = \text{Maunds} \times \text{Rate per Maund} \right)$$
$$\text{Total Expenses} = \text{Kiraya (Freight)} + \text{Kanta (Scale)} + \text{Loading} + \text{Unloading} + \text{Brokery}$$

- **Purchases (Buying from Farmer / Supplier)**:
  - If Freight/Expenses are borne by **Client** (Deducted from farmer):
    $$\text{Balance Owed to Farmer} = \text{Gross Total} - \text{Cash Paid} - \text{Expenses}$$
  - If Freight/Expenses are borne by **Company** (We pay delivery):
    $$\text{Balance Owed to Farmer} = \text{Gross Total} - \text{Cash Paid}$$
- **Sales (Selling to Mill / Buyer)**:
  - If Delivery is charged to **Client** (Added to buyer's bill):
    $$\text{Balance Receivable from Buyer} = \text{Gross Total} - \text{Cash Paid} + \text{Expenses}$$
  - If Delivery is borne by **Company** (Free delivery):
    $$\text{Balance Receivable from Buyer} = \text{Gross Total} - \text{Cash Paid}$$

### 2. Client Net Due Balance
$$\text{Net Due} = \sum \text{Sale Balances} - \sum \text{Purchase Balances} + \sum \text{Payments to Client} - \sum \text{Receipts from Client}$$
- $\text{Net Due} > 1$: **Debit (Dr)** — Client owes money to Company.
- $\text{Net Due} < -1$: **Credit (Cr)** — Company owes money to Client.
- $|\text{Net Due}| \le 1$: **Cleared (Zero)** — Account is settled.

---

## 👨‍💻 Developer & Credits

- **Application**: Mallah Traders Newjatoi Commodity MIS
- **Designed & Developed by**: Zonish Computer Academy
- **Phone / WhatsApp**: 0331-2943534

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
