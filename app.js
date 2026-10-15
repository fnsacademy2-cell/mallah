/**
 * MALLAH TRADERS NEWJATOI — COMMODITY TRADING MIS
 * Ultra-Simple, Fast, Intuitive Dashboard Controller
 * Designed specifically for Wheat (گندم), Rice (چاول), Sugar Cane (کمند) Traders
 */

// Application State
const state = {
    activeView: 'dashboard',
    theme: localStorage.getItem('mallah_theme') || 'dark',
    lang: localStorage.getItem('mallah_lang') || 'en',
    clients: [],
    transactions: [],
    payments: [],
    stats: null,
    selectedKhataClient: null,
    selectedBillClient: null,
    billLanguage: 'en',
    isApiOnline: true
};

// UI Translations (English, Sindhi سنڌي, Urdu اردو)
const TRANSLATIONS = {
    en: {
        nav_dashboard: "Home & Stock",
        nav_buy: "Buy Stock (خريداري)",
        nav_sell: "Sell Stock (وڪرو)",
        nav_khata: "Party Khata (کاتو)",
        nav_history: "All Deals & History",
        nav_bill: "Print Bill",
        nav_settings: "Settings",
        nav_reset_db: "Reset DB",

        kpi_stock: "Godown Stock (گودام جو مال)",
        kpi_profit: "Net Profit (خالص منافعو)",
        kpi_profit_sub: "Sales − Purchases − Expenses",
        kpi_receivable: "Market Dues to Collect (وٺڻي رقم)",
        kpi_receivable_sub: "From Buyers & Mills (Dr)",
        kpi_payable: "Dues to Pay Farmers (ڏيڻي رقم)",
        kpi_payable_sub: "To Farmers & Suppliers (Cr)",

        qa_buy_title: "+ BUY STOCK (خريداري)",
        qa_buy_sub: "Buy Wheat, Rice, Sugar Cane from Farmer or Zamindar",
        qa_sell_title: "+ SELL STOCK (وڪرو)",
        qa_sell_sub: "Sell stock to Flour Mill, Rice Mill, Sugar Mill, or Trader",
        qa_pay_title: "+ CASH PAYMENT (روڪ کاتو)",
        qa_pay_sub: "Pay pending balance to farmer or receive cash from mill",

        buy_form_title: "Buy Stock from Farmer / Supplier (فصل خريداري)",
        buy_form_sub: "Stock enters your Godown. Calculates Gross Total, Paid Cash, and Remaining Khata Balance.",
        buy_btn_save: "SAVE PURCHASE DEAL (خريداري محفوظ ڪريو)",
        buy_lbl_weight: "Weight in KG (وزن ڪلو گرام)",
        buy_lbl_rate: "Rate per 1 KG (اگهه في 1 ڪلو)",

        sell_form_title: "Sell Stock to Mill / Buyer (فصل وڪرو)",
        sell_form_sub: "Stock leaves your Godown. Calculates Sale Value, Cash Received, and Market Dues (Receivable).",
        sell_btn_save: "SAVE SALE DEAL (وڪرو محفوظ ڪريو)",
        sell_lbl_weight: "Weight in KG (وزن ڪلو گرام)",
        sell_lbl_rate: "Selling Rate per 1 KG (وڪرو اگهه في 1 ڪلو)"
    },
    sd: {
        nav_dashboard: "گودام ۽ مال (Home)",
        nav_buy: "خريداري (Buy)",
        nav_sell: "وڪرو (Sell)",
        nav_khata: "کاتو (Khata)",
        nav_history: "سڀ سوديون ۽ تاريخ",
        nav_bill: "بل ڇاپيو (Bill)",
        nav_settings: "سيٽنگس",
        nav_reset_db: "رڪارڊ صاف ڪريو",

        kpi_stock: "گودام جو مال (اسٽاڪ)",
        kpi_profit: "خالص منافعو (Net Profit)",
        kpi_profit_sub: "وڪرو − خريداري − خرچ",
        kpi_receivable: "مارڪيٽ مان وٺڻي رقم (Dr)",
        kpi_receivable_sub: "ملن ۽ واپارين کان وٺڻي رقم",
        kpi_payable: "زميندارن کي ڏيڻي رقم (Cr)",
        kpi_payable_sub: "فصل جي ادائيگي باقي",

        qa_buy_title: "+ فصل خريداري ڪريو",
        qa_buy_sub: "زميندار يا آبادگار کان گندم، چانور يا ڪمند خريد ڪريو",
        qa_sell_title: "+ فصل وڪرو ڪريو",
        qa_sell_sub: "فلور مل، رائس مل، شگر مل يا واپاري کي مال وڪرو ڪريو",
        qa_pay_title: "+ روڪ ادائيگي / وصولي",
        qa_pay_sub: "زميندار کي ادائيگي ڪريو يا مل کان رقم وصول ڪريو",

        buy_form_title: "زميندار يا سپلائر کان مال خريداري (Purchase)",
        buy_form_sub: "مال گودام ۾ داخل ٿيندو. وزن، اگهه، روڪ ۽ باقي حساب خودڪار ٺهي ويندو.",
        buy_btn_save: "خريداري جو سودو محفوظ ڪريو (SAVE PURCHASE)",
        buy_lbl_weight: "وزن ڪلو گرام ۾ (KG)",
        buy_lbl_rate: "اگهه في 1 ڪلو (Rate/KG)",

        sell_form_title: "مل يا واپاري کي مال وڪرو (Sale)",
        sell_form_sub: "مال گودام مان خارج ٿيندو. ڪل بل، وصولي ۽ باقي وٺڻي کاتي ۾ داخل ٿيندي.",
        sell_btn_save: "وڪري جو سودو محفوظ ڪريو (SAVE SALE)",
        sell_lbl_weight: "وزن ڪلو گرام ۾ (KG)",
        sell_lbl_rate: "وڪرو اگهه في 1 ڪلو (Rate/KG)"
    },
    ur: {
        nav_dashboard: "اسٹاک اور ہوم",
        nav_buy: "مال خریداری (Buy)",
        nav_sell: "مال فروخت (Sell)",
        nav_khata: "کھاتہ (Khata)",
        nav_history: "تمام سودے اور تاریخ",
        nav_bill: "بل پرنٹ کریں",
        nav_settings: "سیٹنگز",
        nav_reset_db: "ڈیٹا صاف کریں",

        kpi_stock: "گودام کا مال (اسٹاک)",
        kpi_profit: "خالص منافع (Net Profit)",
        kpi_profit_sub: "فروخت − خریداری − اخراجات",
        kpi_receivable: "مارکیٹ سے وصول طلب رقم (Dr)",
        kpi_receivable_sub: "خریداروں اور ملوں سے وصولی",
        kpi_payable: "کسانوں کو قابل ادا رقم (Cr)",
        kpi_payable_sub: "سپلائرز کی واجب الادا رقم",

        qa_buy_title: "+ مال خریداری کریں",
        qa_buy_sub: "کسان یا زمیندار سے گندم، چاول یا کمند خریدیں",
        qa_sell_title: "+ مال فروخت کریں",
        qa_sell_sub: "فلور مل، رائس مل، شوگر مل یا تاجر کو فروخت کریں",
        qa_pay_title: "+ نقد ادائیگی / وصولی",
        qa_pay_sub: "زمیندار کو رقم ادا کریں یا خریدار سے رقم وصول کریں",

        buy_form_title: "کسان یا سپلائر سے مال خریداری (Purchase)",
        buy_form_sub: "مال گودام میں داخل ہوگا۔ کل رقم، نقد ادائیگی اور بقیہ رقم کا خودکار حساب۔",
        buy_btn_save: "خریداری کا سودا محفوظ کریں (SAVE PURCHASE)",
        buy_lbl_weight: "وزن کلو گرام میں (KG)",
        buy_lbl_rate: "ریٹ فی 1 کلو (Rate/KG)",

        sell_form_title: "مل یا تاجر کو مال فروخت (Sale)",
        sell_form_sub: "مال گودام سے نکلے گا۔ کل بل، نقد وصولی اور بقیہ رقم کھاتے میں درج ہوگی۔",
        sell_btn_save: "فروخت کا سودا محفوظ کریں (SAVE SALE)",
        sell_lbl_weight: "وزن کلو گرام میں (KG)",
        sell_lbl_rate: "فروخت ریٹ فی 1 کلو (Rate/KG)"
    }
};

// Utilities
function formatRs(num) {
    const val = Number(num) || 0;
    return 'Rs ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatKg(num) {
    const val = Number(num) || 0;
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' KG';
}

function formatMaunds(num) {
    const val = Number(num) || 0;
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Maunds';
}

function formatNum(num) {
    const val = Number(num) || 0;
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}

// REST API Client
async function api(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
        }
        state.isApiOnline = true;
        return await response.json();
    } catch (err) {
        console.warn(`API call failed for ${endpoint}:`, err);
        return handleOfflineFallback(endpoint, options);
    }
}

// Offline LocalStorage Fallback (ensures zero data loss even if server restarts)
function handleOfflineFallback(endpoint, options) {
    const path = endpoint.split('?')[0];
    const method = (options.method || 'GET').toUpperCase();

    let clients = JSON.parse(localStorage.getItem('mallah_clients') || '[]');
    let txns = JSON.parse(localStorage.getItem('mallah_txns') || '[]');
    let payments = JSON.parse(localStorage.getItem('mallah_payments') || '[]');

    if (path === '/api/stats') {
        const totalStockKg = txns.reduce((acc, t) => acc + (t.transaction_type === 'Purchase' ? (t.weight || ((t.weight_maunds || 0) * 40)) : -(t.weight || ((t.weight_maunds || 0) * 40))), 0);
        return {
            total_stock_kg: Math.max(0, totalStockKg),
            total_stock_maunds: Math.max(0, totalStockKg / 40.0),
            stock_value: 0,
            gross_sales: 0,
            gross_purchases: 0,
            net_profit: 0,
            total_receivable: 0,
            total_payable: 0,
            stock_by_commodity: []
        };
    }
    if (path === '/api/clients') return clients;
    if (path === '/api/transactions') return txns;
    if (path === '/api/payments') return payments;
    if (path === '/api/clear-all-data') {
        localStorage.removeItem('mallah_clients');
        localStorage.removeItem('mallah_txns');
        localStorage.removeItem('mallah_payments');
        return { success: true };
    }
    return { success: true };
}

// ----------------- VIEW SWITCHER -----------------
function switchView(viewName) {
    state.activeView = viewName;
    document.querySelectorAll('.simple-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewName}`);
    const targetNav = document.getElementById(`nav-${viewName}`);

    if (targetView) targetView.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    // Scroll smoothly to top of main container
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Focus primary fields if entering Buy or Sell
    if (viewName === 'buy') {
        setTimeout(() => document.getElementById('buy-client-name')?.focus(), 100);
    } else if (viewName === 'sell') {
        setTimeout(() => document.getElementById('sell-client-name')?.focus(), 100);
    }
}

// ----------------- DATA LOADING & REFRESH -----------------
async function loadAllData() {
    try {
        const [statsData, clientsData, txnsData, paymentsData] = await Promise.all([
            api('/api/stats'),
            api('/api/clients'),
            api('/api/transactions'),
            api('/api/payments')
        ]);

        state.stats = statsData || {};
        state.clients = clientsData || [];
        state.transactions = txnsData || [];
        state.payments = paymentsData || [];

        // Save local cache
        localStorage.setItem('mallah_clients', JSON.stringify(state.clients));
        localStorage.setItem('mallah_txns', JSON.stringify(state.transactions));
        localStorage.setItem('mallah_payments', JSON.stringify(state.payments));

        // Render UI
        renderDashboardStats();
        renderStockCards();
        renderRecentDeals();
        renderKhataSelect();
        renderAllPartiesTable();
        renderHistoryTable();
        renderBillSelect();
        updateClientDatalist();

        if (state.selectedKhataClient) {
            renderKhataSpotlight(state.selectedKhataClient);
        }
    } catch (err) {
        console.error('Failed to load application data:', err);
    }
}

// ----------------- RENDER DASHBOARD STATS -----------------
function renderDashboardStats() {
    const s = state.stats || {};
    const stockItems = s.stocks || s.stock_by_commodity || [];
    const stockKg = s.total_stock_kg !== undefined ? s.total_stock_kg : stockItems.reduce((acc, it) => acc + (it.stock_kg !== undefined ? it.stock_kg : ((it.stock_maunds || 0) * 40)), 0);
    const stockMaunds = stockKg / 40.0;
    const stockVal = s.total_stock_value !== undefined ? s.total_stock_value : (s.stock_value || 0);
    const netProfit = s.total_profit !== undefined ? s.total_profit : (s.net_profit || 0);
    const receivables = s.total_receivable || 0;
    const payables = s.total_payable || 0;

    const elStock = document.getElementById('dash-total-stock');
    const elStockVal = document.getElementById('dash-stock-value');
    const elProfit = document.getElementById('dash-net-profit');
    const elReceivable = document.getElementById('dash-receivables');
    const elPayable = document.getElementById('dash-payables');

    if (elStock) elStock.innerHTML = `${formatNum(stockKg)} <span style="font-size:18px; font-weight:600; opacity:0.85;">KG</span>`;
    if (elStockVal) elStockVal.textContent = `Value: ${formatRs(stockVal)} • (${formatNum(stockMaunds)} Maunds)`;
    if (elProfit) {
        elProfit.textContent = formatRs(netProfit);
        elProfit.style.color = netProfit >= 0 ? 'var(--buy-green)' : 'var(--danger)';
    }
    if (elReceivable) elReceivable.textContent = formatRs(receivables);
    if (elPayable) elPayable.textContent = formatRs(payables);
}

// ----------------- RENDER GODOWN STOCK CARDS -----------------
function renderStockCards() {
    const container = document.getElementById('dashboard-stock-cards');
    if (!container) return;

    const stockItems = state.stats?.stocks || state.stats?.stock_by_commodity || [];

    // Default crop items if empty
    const defaultCrops = [
        { commodity: 'Wheat', stock_maunds: 0, stock_kg: 0, avg_buy_maund: 0, stock_value: 0 },
        { commodity: 'Rice', stock_maunds: 0, stock_kg: 0, avg_buy_maund: 0, stock_value: 0 },
        { commodity: 'Sugar Cane', stock_maunds: 0, stock_kg: 0, avg_buy_maund: 0, stock_value: 0 }
    ];

    const displayList = stockItems.length > 0 ? stockItems : defaultCrops;

    const cropIcons = {
        'Wheat': 'fa-wheat-awn',
        'Rice': 'fa-bowl-rice',
        'Sugar Cane': 'fa-seedling',
        'Corn': 'fa-cubes',
        'Mustard': 'fa-leaf'
    };

    container.innerHTML = displayList.map(item => {
        const icon = cropIcons[item.commodity] || 'fa-boxes-stacked';
        const kg = item.stock_kg !== undefined ? item.stock_kg : ((item.stock_maunds || 0) * 40);
        const maunds = item.stock_maunds !== undefined ? item.stock_maunds : (kg / 40.0);
        const avgBuyMaund = item.avg_buy_maund || 0;
        const avgBuyKg = avgBuyMaund > 0 ? (avgBuyMaund / 40.0) : 0;
        const val = item.stock_value || 0;

        return `
            <div class="stock-card">
                <div class="stock-card-head">
                    <div class="stock-crop-icon">
                        <i class="fa-solid ${icon}"></i>
                        <span>${item.commodity}</span>
                    </div>
                    <span class="badge-tag ${kg > 0 ? 'badge-buy' : 'badge-nil'}">
                        ${kg > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
                <div class="stock-qty-big">${formatNum(kg)} <span style="font-size:14px; color:var(--text-secondary); font-weight:600;">KG</span></div>
                <div class="stock-stats-row">
                    <span>In Maunds (40 KG):</span>
                    <strong>${formatNum(maunds)} Maunds</strong>
                </div>
                <div class="stock-stats-row">
                    <span>Avg Purchase Rate:</span>
                    <strong>${avgBuyKg > 0 ? formatRs(avgBuyKg) + ' / 1 KG (' + formatRs(avgBuyMaund) + '/40kg)' : 'Rs 0.00'}</strong>
                </div>
                <div class="stock-stats-row">
                    <span>Estimated Stock Value:</span>
                    <strong>${formatRs(val)}</strong>
                </div>
            </div>
        `;
    }).join('');
}

// ----------------- RENDER RECENT DEALS (DASHBOARD) -----------------
function renderRecentDeals() {
    const tbody = document.getElementById('dashboard-recent-tbody');
    if (!tbody) return;

    const recent = state.transactions.slice(0, 8);
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-muted);">No deals recorded yet. Click <strong>+ BUY STOCK</strong> or <strong>+ SELL STOCK</strong> above to record your first deal!</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(t => {
        const isBuy = t.transaction_type === 'Purchase';
        const typeBadge = isBuy
            ? `<span class="badge-tag badge-buy"><i class="fa-solid fa-cart-arrow-down"></i> BUY</span>`
            : `<span class="badge-tag badge-sell"><i class="fa-solid fa-truck-fast"></i> SELL</span>`;

        const kg = t.weight || (t.weight_maunds ? t.weight_maunds * 40 : 0);
        const maunds = t.weight_maunds || (t.weight ? t.weight / 40 : 0);
        const rateKg = t.rate || (t.rate_maund ? t.rate_maund / 40 : 0);

        return `
            <tr>
                <td>${t.date ? t.date.split(' ')[0] : 'Today'}</td>
                <td>${typeBadge}</td>
                <td><strong>${t.client_name || 'Walk-in'}</strong></td>
                <td>${t.commodity || 'Wheat'}</td>
                <td><strong>${formatNum(kg)} KG</strong></td>
                <td>${formatNum(maunds)}</td>
                <td>${formatRs(rateKg)}</td>
                <td><strong>${formatRs(t.total)}</strong></td>
                <td>${formatRs(t.paid)}</td>
                <td><strong style="color:${(t.balance || 0) > 0 ? 'var(--danger)' : 'var(--text-muted)'};">${formatRs(t.balance)}</strong></td>
                <td>
                    <button class="action-icon-btn" onclick="openBillForParty('${t.client_name}')" title="Print Bill">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    <button class="action-icon-btn" onclick="editDeal(${t.id})" title="Edit Deal">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-icon-btn danger" onclick="deleteDeal(${t.id})" title="Delete Deal">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ----------------- TRADING CALCULATOR (BUY FORM) -----------------
function initBuyCalculator() {
    const inputKg = document.getElementById('buy-kg');
    const inputRate = document.getElementById('buy-rate');
    const inputPaid = document.getElementById('buy-cash-paid');
    const displayTotal = document.getElementById('buy-display-total');
    const displayBalance = document.getElementById('buy-balance');
    const syncMaunds = document.getElementById('buy-sync-maunds');
    const syncRateMaund = document.getElementById('buy-sync-rate-maund');

    function calculate() {
        const kg = parseFloat(inputKg?.value) || 0;
        const rateKg = parseFloat(inputRate?.value) || 0;
        const cashPaid = parseFloat(inputPaid?.value) || 0;

        const maunds = kg > 0 ? (kg / 40.0) : 0;
        const rateMaund = rateKg * 40.0;
        const grossTotal = kg * rateKg;

        // Hidden sync inputs for backend
        if (document.getElementById('buy-weight-kg')) document.getElementById('buy-weight-kg').value = kg;
        if (document.getElementById('buy-maunds')) document.getElementById('buy-maunds').value = maunds;
        if (document.getElementById('buy-rate-maund')) document.getElementById('buy-rate-maund').value = rateMaund;
        if (document.getElementById('buy-gross-total')) document.getElementById('buy-gross-total').value = grossTotal;

        // Visual labels
        if (syncMaunds) syncMaunds.textContent = `= ${formatNum(maunds)} Maunds (منڊ - 40 KG)`;
        if (syncRateMaund) syncRateMaund.textContent = `= Rs ${formatNum(rateMaund)} per 40 KG (منڊ)`;
        if (displayTotal) displayTotal.textContent = formatRs(grossTotal);

        const balance = grossTotal - cashPaid;
        if (displayBalance) displayBalance.value = balance.toFixed(2);
    }

    inputKg?.addEventListener('input', calculate);
    inputRate?.addEventListener('input', calculate);
    inputPaid?.addEventListener('input', calculate);

    // Crop Chip Selection
    const chips = document.querySelectorAll('#buy-crop-chips .crop-chip');
    const cropInput = document.getElementById('buy-commodity');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const crop = chip.dataset.crop;
            if (crop === 'Custom') {
                cropInput.classList.add('show');
                cropInput.value = '';
                cropInput.focus();
            } else {
                cropInput.classList.remove('show');
                cropInput.value = crop;
            }
        });
    });

    // Form Submit
    const form = document.getElementById('form-buy-deal');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dealId = document.getElementById('buy-deal-id').value;
        const kg = parseFloat(inputKg?.value) || 0;
        const rateKg = parseFloat(inputRate?.value) || 0;
        const cashPaid = parseFloat(inputPaid?.value) || 0;
        const clientName = document.getElementById('buy-client-name').value.trim();
        const commodity = cropInput.value.trim() || 'Wheat';

        if (!clientName) {
            showToast('Please enter Farmer / Supplier Name', 'warning');
            return;
        }
        if (kg <= 0 || rateKg <= 0) {
            showToast('Please enter valid Weight in KG and Rate per 1 KG', 'warning');
            return;
        }

        const maunds = kg / 40.0;
        const rateMaund = rateKg * 40.0;
        const grossTotal = kg * rateKg;

        const payload = {
            client_name: clientName,
            transaction_type: 'Purchase',
            commodity: commodity,
            weight: kg,
            weight_maunds: maunds,
            rate: rateKg,
            rate_maund: rateMaund,
            gross_total: grossTotal,
            total: grossTotal,
            paid: cashPaid,
            kiraya: parseFloat(document.getElementById('buy-kiraya')?.value) || 0,
            kanta_charges: parseFloat(document.getElementById('buy-kanta')?.value) || 0,
            loading: parseFloat(document.getElementById('buy-loading')?.value) || 0,
            unloading: parseFloat(document.getElementById('buy-unloading')?.value) || 0,
            brokery: parseFloat(document.getElementById('buy-brokery')?.value) || 0,
            expense_payer: document.getElementById('buy-payer')?.value || 'Company',
            vehicle_type: document.getElementById('buy-veh-type')?.value || '',
            vehicle_no: document.getElementById('buy-veh-num')?.value || '',
            gatepass_no: document.getElementById('buy-gatepass')?.value || ''
        };

        const method = dealId ? 'PUT' : 'POST';
        const url = dealId ? `/api/transactions/${dealId}` : '/api/transactions';

        try {
            await api(url, { method, body: JSON.stringify(payload) });
            showToast(`Purchase Deal saved successfully! ${formatNum(kg)} KG (${formatNum(maunds)} Maunds) of ${commodity} added to Godown.`, 'success');
            resetBuyForm();
            await loadAllData();
            switchView('dashboard');
        } catch (err) {
            showToast('Error saving purchase deal: ' + err.message, 'error');
        }
    });

    document.getElementById('btn-clear-buy')?.addEventListener('click', resetBuyForm);
}

function resetBuyForm() {
    document.getElementById('buy-deal-id').value = '';
    document.getElementById('buy-client-name').value = '';
    if (document.getElementById('buy-kg')) document.getElementById('buy-kg').value = '';
    if (document.getElementById('buy-maunds')) document.getElementById('buy-maunds').value = '';
    document.getElementById('buy-rate').value = '';
    document.getElementById('buy-cash-paid').value = '0';
    document.getElementById('buy-balance').value = '0.00';
    document.getElementById('buy-display-total').textContent = 'Rs 0.00';
    if (document.getElementById('buy-sync-maunds')) document.getElementById('buy-sync-maunds').textContent = '= 0.00 Maunds (منڊ - 40 KG)';
    if (document.getElementById('buy-sync-rate-maund')) document.getElementById('buy-sync-rate-maund').textContent = '= Rs 0.00 per 40 KG (منڊ)';
    document.getElementById('btn-save-buy-submit').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SAVE PURCHASE DEAL (خريداري محفوظ ڪريو)';
}

// ----------------- TRADING CALCULATOR (SELL FORM) -----------------
function initSellCalculator() {
    const inputKg = document.getElementById('sell-kg');
    const inputRate = document.getElementById('sell-rate');
    const inputPaid = document.getElementById('sell-cash-paid');
    const displayTotal = document.getElementById('sell-display-total');
    const displayBalance = document.getElementById('sell-balance');
    const syncMaunds = document.getElementById('sell-sync-maunds');
    const syncRateMaund = document.getElementById('sell-sync-rate-maund');

    function calculate() {
        const kg = parseFloat(inputKg?.value) || 0;
        const rateKg = parseFloat(inputRate?.value) || 0;
        const cashReceived = parseFloat(inputPaid?.value) || 0;

        const maunds = kg > 0 ? (kg / 40.0) : 0;
        const rateMaund = rateKg * 40.0;
        const grossTotal = kg * rateKg;

        if (document.getElementById('sell-weight-kg')) document.getElementById('sell-weight-kg').value = kg;
        if (document.getElementById('sell-maunds')) document.getElementById('sell-maunds').value = maunds;
        if (document.getElementById('sell-rate-maund')) document.getElementById('sell-rate-maund').value = rateMaund;
        if (document.getElementById('sell-gross-total')) document.getElementById('sell-gross-total').value = grossTotal;

        if (syncMaunds) syncMaunds.textContent = `= ${formatNum(maunds)} Maunds (منڊ - 40 KG)`;
        if (syncRateMaund) syncRateMaund.textContent = `= Rs ${formatNum(rateMaund)} per 40 KG (منڊ)`;
        if (displayTotal) displayTotal.textContent = formatRs(grossTotal);

        const balance = grossTotal - cashReceived;
        if (displayBalance) displayBalance.value = balance.toFixed(2);
    }

    inputKg?.addEventListener('input', calculate);
    inputRate?.addEventListener('input', calculate);
    inputPaid?.addEventListener('input', calculate);

    // Crop Chip Selection
    const chips = document.querySelectorAll('#sell-crop-chips .crop-chip');
    const cropInput = document.getElementById('sell-commodity');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const crop = chip.dataset.crop;
            if (crop === 'Custom') {
                cropInput.classList.add('show');
                cropInput.value = '';
                cropInput.focus();
            } else {
                cropInput.classList.remove('show');
                cropInput.value = crop;
            }
        });
    });

    // Form Submit
    const form = document.getElementById('form-sell-deal');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dealId = document.getElementById('sell-deal-id').value;
        const kg = parseFloat(inputKg?.value) || 0;
        const rateKg = parseFloat(inputRate?.value) || 0;
        const cashReceived = parseFloat(inputPaid?.value) || 0;
        const clientName = document.getElementById('sell-client-name').value.trim();
        const commodity = cropInput.value.trim() || 'Wheat';

        if (!clientName) {
            showToast('Please enter Buyer / Mill Name', 'warning');
            return;
        }
        if (kg <= 0 || rateKg <= 0) {
            showToast('Please enter valid Weight in KG and Rate per 1 KG', 'warning');
            return;
        }

        const maunds = kg / 40.0;
        const rateMaund = rateKg * 40.0;
        const grossTotal = kg * rateKg;

        const payload = {
            client_name: clientName,
            transaction_type: 'Sale',
            commodity: commodity,
            weight: kg,
            weight_maunds: maunds,
            rate: rateKg,
            rate_maund: rateMaund,
            gross_total: grossTotal,
            total: grossTotal,
            paid: cashReceived,
            kiraya: parseFloat(document.getElementById('sell-kiraya')?.value) || 0,
            kanta_charges: parseFloat(document.getElementById('sell-kanta')?.value) || 0,
            loading: parseFloat(document.getElementById('sell-loading')?.value) || 0,
            expense_payer: document.getElementById('sell-payer')?.value || 'Company',
            vehicle_type: document.getElementById('sell-veh-type')?.value || '',
            vehicle_no: document.getElementById('sell-veh-num')?.value || '',
            gatepass_no: document.getElementById('sell-gatepass')?.value || ''
        };

        const method = dealId ? 'PUT' : 'POST';
        const url = dealId ? `/api/transactions/${dealId}` : '/api/transactions';

        try {
            await api(url, { method, body: JSON.stringify(payload) });
            showToast(`Sale Deal saved successfully! ${formatNum(kg)} KG (${formatNum(maunds)} Maunds) of ${commodity} dispatched from Godown.`, 'success');
            resetSellForm();
            await loadAllData();
            switchView('dashboard');
        } catch (err) {
            showToast('Error saving sale deal: ' + err.message, 'error');
        }
    });

    document.getElementById('btn-clear-sell')?.addEventListener('click', resetSellForm);
}

function resetSellForm() {
    document.getElementById('sell-deal-id').value = '';
    document.getElementById('sell-client-name').value = '';
    if (document.getElementById('sell-kg')) document.getElementById('sell-kg').value = '';
    if (document.getElementById('sell-maunds')) document.getElementById('sell-maunds').value = '';
    document.getElementById('sell-rate').value = '';
    document.getElementById('sell-cash-paid').value = '0';
    document.getElementById('sell-balance').value = '0.00';
    document.getElementById('sell-display-total').textContent = 'Rs 0.00';
    if (document.getElementById('sell-sync-maunds')) document.getElementById('sell-sync-maunds').textContent = '= 0.00 Maunds (منڊ - 40 KG)';
    if (document.getElementById('sell-sync-rate-maund')) document.getElementById('sell-sync-rate-maund').textContent = '= Rs 0.00 per 40 KG (منڊ)';
    document.getElementById('btn-save-sell-submit').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SAVE SALE DEAL (وڪرو محفوظ ڪريو)';
}

// ----------------- EDIT DEAL -----------------
function editDeal(id) {
    const deal = state.transactions.find(t => t.id === id);
    if (!deal) return;

    const kg = deal.weight ? deal.weight : (deal.weight_maunds ? deal.weight_maunds * 40 : 0);
    const maunds = deal.weight_maunds ? deal.weight_maunds : (kg / 40);
    const rateKg = deal.rate || (deal.rate_maund ? deal.rate_maund / 40 : 0);

    if (deal.transaction_type === 'Purchase') {
        switchView('buy');
        document.getElementById('buy-deal-id').value = deal.id;
        document.getElementById('buy-client-name').value = deal.client_name || '';
        document.getElementById('buy-commodity').value = deal.commodity || 'Wheat';
        if (document.getElementById('buy-kg')) document.getElementById('buy-kg').value = kg;
        if (document.getElementById('buy-maunds')) document.getElementById('buy-maunds').value = maunds;
        document.getElementById('buy-rate').value = rateKg;
        document.getElementById('buy-cash-paid').value = deal.paid || 0;
        document.getElementById('btn-save-buy-submit').innerHTML = '<i class="fa-solid fa-check"></i> UPDATE PURCHASE DEAL';

        // Trigger input event to re-calculate display
        document.getElementById('buy-kg')?.dispatchEvent(new Event('input'));
    } else {
        switchView('sell');
        document.getElementById('sell-deal-id').value = deal.id;
        document.getElementById('sell-client-name').value = deal.client_name || '';
        document.getElementById('sell-commodity').value = deal.commodity || 'Wheat';
        if (document.getElementById('sell-kg')) document.getElementById('sell-kg').value = kg;
        if (document.getElementById('sell-maunds')) document.getElementById('sell-maunds').value = maunds;
        document.getElementById('sell-rate').value = rateKg;
        document.getElementById('sell-cash-paid').value = deal.paid || 0;
        document.getElementById('btn-save-sell-submit').innerHTML = '<i class="fa-solid fa-check"></i> UPDATE SALE DEAL';

        document.getElementById('sell-kg')?.dispatchEvent(new Event('input'));
    }
}

// ----------------- DELETE DEAL -----------------
async function deleteDeal(id) {
    if (!confirm('Are you sure you want to delete this deal? Stock and account balances will be adjusted automatically.')) {
        return;
    }
    try {
        await api(`/api/transactions/${id}`, { method: 'DELETE' });
        showToast('Deal deleted successfully', 'success');
        await loadAllData();
    } catch (err) {
        showToast('Error deleting deal: ' + err.message, 'error');
    }
}

// ----------------- KHATA & PARTY LEDGER -----------------
function renderKhataSelect() {
    const select = document.getElementById('khata-party-select');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Choose a party to view their account --</option>' +
        state.clients.map(c => {
            const bal = c.net_due !== undefined ? c.net_due : (c.balance || 0);
            const dr_cr = bal > 0 ? 'Dr' : bal < 0 ? 'Cr' : '';
            return `
                <option value="${c.id}" ${String(c.id) === String(currentVal) ? 'selected' : ''}>
                    ${c.name} (${c.role || (c.is_seller && c.is_purchaser ? 'Both' : c.is_seller ? 'Farmer' : 'Buyer')} • ${c.address || c.village || 'Local'}) — Balance: ${formatRs(Math.abs(bal))} ${dr_cr}
                </option>
            `;
        }).join('');

    select.onchange = () => {
        const clientId = select.value;
        const client = state.clients.find(c => String(c.id) === String(clientId));
        if (client) {
            renderKhataSpotlight(client);
        } else {
            document.getElementById('khata-spotlight-card').style.display = 'none';
            document.getElementById('khata-ledger-container').style.display = 'none';
        }
    };
}

async function renderKhataSpotlight(client) {
    state.selectedKhataClient = client;
    const spotlightCard = document.getElementById('khata-spotlight-card');
    const ledgerContainer = document.getElementById('khata-ledger-container');
    if (!spotlightCard) return;

    spotlightCard.style.display = 'flex';
    document.getElementById('spotlight-party-name').textContent = client.name;
    document.getElementById('spotlight-party-info').textContent = `${client.role || (client.is_seller && client.is_purchaser ? 'Both' : client.is_seller ? 'Farmer' : 'Buyer')} • ${client.mobile || 'No Phone'} • ${client.address || client.village || 'Village'}`;

    const balance = client.net_due !== undefined ? client.net_due : (client.balance || 0);
    const balanceVal = Math.abs(balance);
    const elBal = document.getElementById('spotlight-balance-val');
    const elDesc = document.getElementById('spotlight-balance-desc');

    if (balance > 0) {
        elBal.textContent = formatRs(balanceVal);
        elBal.style.color = 'var(--sell-blue)';
        elDesc.textContent = 'RECEIVABLE (وٺڻي رقم) — They owe you money';
        elDesc.style.color = 'var(--sell-blue)';
    } else if (balance < 0) {
        elBal.textContent = formatRs(balanceVal);
        elBal.style.color = 'var(--danger)';
        elDesc.textContent = 'PAYABLE (ڏيڻي رقم) — You owe them money';
        elDesc.style.color = 'var(--danger)';
    } else {
        elBal.textContent = 'Rs 0.00';
        elBal.style.color = 'var(--buy-green)';
        elDesc.textContent = 'CLEARED (حساب برابر) — No balance pending';
        elDesc.style.color = 'var(--buy-green)';
    }

    // Bind action buttons
    document.getElementById('btn-spotlight-pay').onclick = () => {
        openPaymentModalForParty(client.name, balance < 0 ? 'Pay to Seller' : 'Receive from Purchaser', balanceVal);
    };

    document.getElementById('btn-spotlight-bill').onclick = () => {
        openBillForParty(client.name);
    };

    // Load and render party ledger entries
    ledgerContainer.style.display = 'block';
    await renderPartyLedger(client.id);
}

async function renderPartyLedger(clientId) {
    const tbody = document.getElementById('khata-ledger-tbody');
    if (!tbody) return;

    try {
        const ledgerData = await api(`/api/clients/${clientId}/ledger`);
        const entries = ledgerData.ledger || [];

        if (entries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No transactions or payments found for this party.</td></tr>`;
            return;
        }

        tbody.innerHTML = entries.map(row => {
            const dr = row.debit > 0 ? formatRs(row.debit) : '-';
            const cr = row.credit > 0 ? formatRs(row.credit) : '-';
            return `
                <tr>
                    <td>${row.date ? row.date.split(' ')[0] : ''}</td>
                    <td><strong>${row.description || 'Transaction'}</strong></td>
                    <td>${row.commodity || '-'} ${row.maunds ? `(${formatNum(row.maunds)} M)` : ''}</td>
                    <td style="color:var(--sell-blue); font-weight:600;">${dr}</td>
                    <td style="color:var(--danger); font-weight:600;">${cr}</td>
                    <td><strong>${formatRs(row.balance)}</strong></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger);">Error loading ledger: ${err.message}</td></tr>`;
    }
}

// ----------------- ALL PARTIES TABLE -----------------
function renderAllPartiesTable() {
    const tbody = document.getElementById('all-parties-tbody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('party-search-input')?.value || '').toLowerCase();
    const filtered = state.clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm) ||
        (c.address && c.address.toLowerCase().includes(searchTerm)) ||
        (c.mobile && c.mobile.includes(searchTerm))
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No parties found. Parties are automatically registered when you enter deals!</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(c => {
        const bal = c.net_due !== undefined ? c.net_due : (c.balance || 0);
        let badge = '<span class="badge-tag badge-nil">Cleared</span>';
        if (bal > 0) badge = `<span class="badge-tag badge-dr">Receivable (Dr)</span>`;
        if (bal < 0) badge = `<span class="badge-tag badge-cr">Payable (Cr)</span>`;

        return `
            <tr>
                <td><strong>${c.name}</strong> <small style="display:block; color:var(--text-muted);">${c.role || (c.is_seller && c.is_purchaser ? 'Both' : c.is_seller ? 'Farmer' : 'Buyer')}</small></td>
                <td>${c.address || c.village || 'Local'} • ${c.mobile || '-'}</td>
                <td>${c.total_deals || 0} Deals</td>
                <td>${badge}</td>
                <td><strong style="color:${bal > 0 ? 'var(--sell-blue)' : bal < 0 ? 'var(--danger)' : 'var(--text-primary)'};">${formatRs(Math.abs(bal))}</strong></td>
                <td>
                    <button class="action-icon-btn" onclick="selectKhataPartyById(${c.id})" title="View Party Khata">
                        <i class="fa-solid fa-book-bookmark"></i>
                    </button>
                    <button class="action-icon-btn" onclick="openPaymentModalForParty('${c.name}', '${bal < 0 ? 'Pay to Seller' : 'Receive from Purchaser'}', ${Math.abs(bal)})" title="Pay / Receive Cash">
                        <i class="fa-solid fa-hand-holding-dollar"></i>
                    </button>
                    <button class="action-icon-btn" onclick="openBillForParty('${c.name}')" title="Print Statement">
                        <i class="fa-solid fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function selectKhataPartyById(id) {
    switchView('khata');
    const select = document.getElementById('khata-party-select');
    if (select) {
        select.value = id;
        select.dispatchEvent(new Event('change'));
    }
}

// ----------------- ALL DEALS & HISTORY TABLE -----------------
function renderHistoryTable() {
    const tbody = document.getElementById('history-deals-tbody');
    if (!tbody) return;

    const typeFilter = document.getElementById('hist-type-filter')?.value || '';
    const cropFilter = document.getElementById('hist-commodity-filter')?.value || '';
    const search = (document.getElementById('hist-search-input')?.value || '').toLowerCase();

    const filtered = state.transactions.filter(t => {
        if (typeFilter && t.transaction_type !== typeFilter) return false;
        if (cropFilter && t.commodity !== cropFilter) return false;
        if (search) {
            const matchName = t.client_name && t.client_name.toLowerCase().includes(search);
            const matchCrop = t.commodity && t.commodity.toLowerCase().includes(search);
            if (!matchName && !matchCrop) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:32px; color:var(--text-muted);">No transaction history matches your filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(t => {
        const isBuy = t.transaction_type === 'Purchase';
        const typeBadge = isBuy
            ? `<span class="badge-tag badge-buy">BUY</span>`
            : `<span class="badge-tag badge-sell">SELL</span>`;

        const kg = t.weight || (t.weight_maunds ? t.weight_maunds * 40 : 0);
        const maunds = t.weight_maunds || (t.weight ? t.weight / 40 : 0);
        const rateKg = t.rate || (t.rate_maund ? t.rate_maund / 40 : 0);

        return `
            <tr>
                <td>#${t.id}</td>
                <td>${t.date ? t.date.split(' ')[0] : 'Today'}</td>
                <td>${typeBadge}</td>
                <td><strong>${t.client_name}</strong></td>
                <td>${t.commodity || 'Wheat'}</td>
                <td><strong>${formatNum(kg)} KG</strong></td>
                <td>${formatNum(maunds)}</td>
                <td>${formatRs(rateKg)}</td>
                <td><strong>${formatRs(t.total)}</strong></td>
                <td>${formatRs(t.paid)}</td>
                <td><strong style="color:${(t.balance || 0) > 0 ? 'var(--danger)' : 'var(--text-muted)'};">${formatRs(t.balance)}</strong></td>
                <td>
                    <button class="action-icon-btn" onclick="openBillForParty('${t.client_name}')" title="Print Invoice">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    <button class="action-icon-btn" onclick="editDeal(${t.id})" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-icon-btn danger" onclick="deleteDeal(${t.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ----------------- PAYMENT MODAL -----------------
function openPaymentModalForParty(clientName = '', direction = 'Pay to Seller', defaultAmount = 0) {
    const modal = document.getElementById('modal-payment');
    if (!modal) return;

    document.getElementById('pay-client-name').value = clientName;
    document.getElementById('pay-direction').value = direction;
    document.getElementById('pay-amount').value = defaultAmount > 0 ? defaultAmount : '';
    document.getElementById('pay-note').value = '';

    modal.classList.add('active');
    setTimeout(() => document.getElementById('pay-amount').focus(), 100);
}

function initPaymentModal() {
    const form = document.getElementById('form-simple-payment');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientName = document.getElementById('pay-client-name').value.trim();
        const direction = document.getElementById('pay-direction').value;
        const amount = parseFloat(document.getElementById('pay-amount').value) || 0;
        const mode = document.getElementById('pay-mode').value;
        const note = document.getElementById('pay-note').value.trim();

        if (!clientName) {
            showToast('Please specify party name', 'warning');
            return;
        }
        if (amount <= 0) {
            showToast('Please enter a valid payment amount', 'warning');
            return;
        }

        try {
            await api('/api/payments', {
                method: 'POST',
                body: JSON.stringify({
                    client_name: clientName,
                    amount: amount,
                    payment_direction: direction,
                    payment_mode: mode,
                    notes: note
                })
            });
            showToast(`Payment voucher of ${formatRs(amount)} saved! Account updated.`, 'success');
            document.getElementById('modal-payment').classList.remove('active');
            await loadAllData();
        } catch (err) {
            showToast('Error saving payment: ' + err.message, 'error');
        }
    });
}

// ----------------- CLIENT REGISTRATION MODAL -----------------
function initClientModal() {
    const form = document.getElementById('form-simple-client');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('client-reg-name').value.trim();
        const mobile = document.getElementById('client-reg-mobile').value.trim();
        const village = document.getElementById('client-reg-village').value.trim();
        const role = document.getElementById('client-reg-role').value;
        const caste = document.getElementById('client-reg-caste').value.trim();

        if (!name) {
            showToast('Party Name is required', 'warning');
            return;
        }

        try {
            await api('/api/clients', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    mobile,
                    address: village,
                    role,
                    caste
                })
            });
            showToast(`Party "${name}" registered successfully!`, 'success');
            document.getElementById('modal-client').classList.remove('active');
            form.reset();
            await loadAllData();
        } catch (err) {
            showToast('Error registering party: ' + err.message, 'error');
        }
    });

    document.getElementById('btn-new-party-shortcut')?.addEventListener('click', () => {
        document.getElementById('modal-client').classList.add('active');
        setTimeout(() => document.getElementById('client-reg-name').focus(), 100);
    });
}

// ----------------- PRINT BILL STUDIO -----------------
function renderBillSelect() {
    const select = document.getElementById('bill-party-select');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Select party to print statement --</option>' +
        state.clients.map(c => `
            <option value="${c.name}" ${c.name === currentVal ? 'selected' : ''}>${c.name} (${c.role || 'Party'} • ${c.address || 'Local'})</option>
        `).join('');

    select.onchange = () => {
        generateBillSheet(select.value, document.getElementById('bill-lang-select').value);
    };

    document.getElementById('bill-lang-select')?.addEventListener('change', (e) => {
        state.billLanguage = e.target.value;
        if (select.value) {
            generateBillSheet(select.value, state.billLanguage);
        }
    });

    document.getElementById('btn-do-print')?.addEventListener('click', () => {
        if (!select.value) {
            showToast('Please select a party first', 'warning');
            return;
        }
        window.print();
    });
}

function openBillForParty(partyName) {
    switchView('bill');
    const select = document.getElementById('bill-party-select');
    if (select) {
        select.value = partyName;
        generateBillSheet(partyName, state.billLanguage);
    }
}

function generateBillSheet(partyName, lang = 'en') {
    const sheet = document.getElementById('bill-sheet');
    if (!sheet) return;

    const client = state.clients.find(c => c.name.toLowerCase() === partyName.toLowerCase());
    if (!client) {
        sheet.innerHTML = `<div class="bill-placeholder"><p>Party records not found.</p></div>`;
        return;
    }

    const clientTxns = state.transactions.filter(t => t.client_name?.toLowerCase() === partyName.toLowerCase());
    const clientPayments = state.payments.filter(p => p.client_name?.toLowerCase() === partyName.toLowerCase());

    const isSindhi = lang === 'sd';

    const labels = isSindhi ? {
        title: 'مالاهه ٽريڊرز نئين جتوئي',
        sub: 'گندم، چانور، ڪمند ۽ اَن جو ڪميشن اڳواڻ',
        contact: 'فون: 0300-1234567 • نئين جتوئي، سنڌ',
        billNo: 'بل نمبر:',
        date: 'تاريخ:',
        billedTo: 'سوداگر / زميندار جو تفصيل:',
        particulars: 'تفصيل',
        crop: 'فصل',
        maunds: 'منڊ',
        rate: 'في منڊ اگهه',
        total: 'ڪل رقم',
        paid: 'ادا / وصول',
        balance: 'باقي',
        grandTotal: 'ڪل سودي جي رقم:',
        totalPaid: 'ڪل وصول / ادا ڪيل:',
        netBalance: 'حتمي باقي کاتو (Net Balance):',
        signature: 'مالڪ جي صحيح',
        clientSig: 'پارٽي جي صحيح'
    } : {
        title: 'MALLAH TRADERS NEWJATOI',
        sub: 'Wheat, Rice, Sugar Cane & Grain Commission Agents',
        contact: 'Cell: 0300-1234567 • Newjatoi, Sindh, Pakistan',
        billNo: 'Statement #:',
        date: 'Date:',
        billedTo: 'Account Statement For:',
        particulars: 'Particulars',
        crop: 'Commodity',
        maunds: 'Weight (KG / Maunds)',
        rate: 'Rate / 1 KG',
        total: 'Total Deal',
        paid: 'Paid / Recv',
        balance: 'Remaining',
        grandTotal: 'Total Deal Value:',
        totalPaid: 'Total Cash Settled:',
        netBalance: 'Current Net Balance:',
        signature: 'Proprietor Signature',
        clientSig: 'Party Signature'
    };

    let totalDealsAmt = 0;
    let totalPaidAmt = 0;

    const rowsHtml = clientTxns.map((t, idx) => {
        const kg = t.weight || (t.weight_maunds ? t.weight_maunds * 40 : 0);
        const maunds = t.weight_maunds || (t.weight ? t.weight / 40 : 0);
        const rateKg = t.rate || (t.rate_maund ? t.rate_maund / 40 : 0);
        totalDealsAmt += (t.total || 0);
        totalPaidAmt += (t.paid || 0);

        return `
            <tr>
                <td>${idx + 1}</td>
                <td>${t.date ? t.date.split(' ')[0] : 'Deal'} — ${t.transaction_type}</td>
                <td><strong>${t.commodity || 'Wheat'}</strong></td>
                <td><strong>${formatNum(kg)} KG</strong> <small style="color:#666;">(${formatNum(maunds)} M)</small></td>
                <td>${formatRs(rateKg)}</td>
                <td><strong>${formatRs(t.total)}</strong></td>
                <td>${formatRs(t.paid)}</td>
                <td>${formatRs(t.balance)}</td>
            </tr>
        `;
    }).join('');

    sheet.innerHTML = `
        <div class="bill-print-header" dir="${isSindhi ? 'rtl' : 'ltr'}">
            <div class="bill-print-brand">
                <h1>${labels.title}</h1>
                <p>${labels.sub}</p>
                <p>${labels.contact}</p>
            </div>
            <div class="bill-print-meta">
                <p><strong>${labels.billNo}</strong> MT-${client.id}-${Date.now().toString().slice(-4)}</p>
                <p><strong>${labels.date}</strong> ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
        </div>

        <div class="bill-print-parties" dir="${isSindhi ? 'rtl' : 'ltr'}">
            <div class="bill-print-party-box">
                <small>${labels.billedTo}</small>
                <strong>${client.name}</strong>
                <p>${client.address || 'Local'} • ${client.mobile || 'No Mobile'} • ${client.role || 'Party'}</p>
            </div>
            <div class="bill-print-party-box">
                <small>Trading Summary:</small>
                <p>Total Deals: <strong>${clientTxns.length}</strong></p>
                <p>Vouchers: <strong>${clientPayments.length}</strong></p>
            </div>
        </div>

        <table class="bill-print-table" dir="${isSindhi ? 'rtl' : 'ltr'}">
            <thead>
                <tr>
                    <th>#</th>
                    <th>${labels.particulars}</th>
                    <th>${labels.crop}</th>
                    <th>${labels.maunds}</th>
                    <th>${labels.rate}</th>
                    <th>${labels.total}</th>
                    <th>${labels.paid}</th>
                    <th>${labels.balance}</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml || `<tr><td colspan="8" style="text-align:center; padding:16px;">No transactions recorded.</td></tr>`}
            </tbody>
        </table>

        <div class="bill-print-totals" dir="${isSindhi ? 'rtl' : 'ltr'}">
            <div class="bill-print-totals-box">
                <div class="bill-print-totals-row">
                    <span>${labels.grandTotal}</span>
                    <strong>${formatRs(totalDealsAmt)}</strong>
                </div>
                <div class="bill-print-totals-row">
                    <span>${labels.totalPaid}</span>
                    <strong>${formatRs(totalPaidAmt)}</strong>
                </div>
                <div class="bill-print-totals-row">
                    <span>${labels.netBalance}</span>
                    <strong style="color:${client.balance > 0 ? 'var(--sell-blue)' : client.balance < 0 ? 'var(--danger)' : 'inherit'};">
                        ${formatRs(Math.abs(client.balance || 0))} ${client.dr_cr || ''}
                    </strong>
                </div>
            </div>
        </div>

        <div class="bill-print-signatures" dir="${isSindhi ? 'rtl' : 'ltr'}">
            <div class="bill-sig-line">${labels.clientSig}</div>
            <div class="bill-sig-line">${labels.signature}</div>
        </div>
    `;
}

// ----------------- AUTOCOMPLETE DATALIST -----------------
function updateClientDatalist() {
    const datalist = document.getElementById('datalist-clients');
    if (!datalist) return;
    datalist.innerHTML = state.clients.map(c => `<option value="${c.name}">${c.address ? `(${c.address})` : ''}</option>`).join('');
}

// ----------------- DANGER ZONE: WIPE ALL DATA -----------------
function initWipeAllFeature() {
    const modal = document.getElementById('modal-delete-all');
    const inputConfirm = document.getElementById('delete-confirm-input');
    const btnDoWipe = document.getElementById('btn-do-wipe-all');

    document.getElementById('nav-btn-delete-all')?.addEventListener('click', () => {
        modal.classList.add('active');
        inputConfirm.value = '';
        btnDoWipe.disabled = true;
        setTimeout(() => inputConfirm.focus(), 100);
    });

    document.getElementById('btn-danger-wipe-all')?.addEventListener('click', () => {
        modal.classList.add('active');
        inputConfirm.value = '';
        btnDoWipe.disabled = true;
        setTimeout(() => inputConfirm.focus(), 100);
    });

    inputConfirm?.addEventListener('input', () => {
        btnDoWipe.disabled = (inputConfirm.value.trim().toUpperCase() !== 'DELETE');
    });

    btnDoWipe?.addEventListener('click', async () => {
        try {
            btnDoWipe.disabled = true;
            btnDoWipe.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Erasing Data...';

            await api('/api/clear-all-data', { method: 'POST' });

            localStorage.removeItem('mallah_clients');
            localStorage.removeItem('mallah_txns');
            localStorage.removeItem('mallah_payments');

            modal.classList.remove('active');
            showToast('All records permanently deleted! Database is clean.', 'success');

            btnDoWipe.innerHTML = '<i class="fa-solid fa-trash-can"></i> Permanently Delete All Data';
            await loadAllData();
            switchView('dashboard');
        } catch (err) {
            showToast('Error deleting database: ' + err.message, 'error');
            btnDoWipe.disabled = false;
        }
    });
}

// ----------------- MODAL CLOSE DISPATCHER -----------------
function initModalCloseHandlers() {
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            const targetModal = document.getElementById(modalId);
            if (targetModal) targetModal.classList.remove('active');
        });
    });

    // Close when clicking dark backdrop
    document.querySelectorAll('.simple-modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) backdrop.classList.remove('active');
        });
    });
}

// ----------------- LIVE CLOCK & THEME TOGGLE -----------------
function initClockAndTheme() {
    // Clock
    const clockEl = document.getElementById('live-clock');
    function tick() {
        if (!clockEl) return;
        const now = new Date();
        clockEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    }
    setInterval(tick, 1000);
    tick();

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        state.theme = theme;
        localStorage.setItem('mallah_theme', theme);
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
    }

    applyTheme(state.theme);

    themeBtn?.addEventListener('click', () => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // Refresh Data Button
    document.getElementById('refresh-data-btn')?.addEventListener('click', async () => {
        showToast('Refreshing database records...', 'info');
        await loadAllData();
        showToast('Database up to date!', 'success');
    });
}

// ----------------- LANGUAGE SWITCHER -----------------
function setLanguage(lang) {
    if (!['en', 'sd', 'ur'].includes(lang)) lang = 'en';
    state.lang = lang;
    localStorage.setItem('mallah_lang', lang);

    // Direction & HTML Lang attribute
    const isRtl = (lang === 'sd' || lang === 'ur');
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    // Update Language Toggle Buttons (placed on left of top menus)
    document.querySelectorAll('#lang-toggle-group .lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Translate all [data-i18n] text nodes
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Update Buy Form specific titles and buttons
    const buyHeader = document.querySelector('#view-buy .deal-card-header h2');
    if (buyHeader && dict.buy_form_title) buyHeader.textContent = dict.buy_form_title;
    const buySub = document.querySelector('#view-buy .deal-card-header p');
    if (buySub && dict.buy_form_sub) buySub.textContent = dict.buy_form_sub;
    const buySaveBtn = document.getElementById('btn-save-buy-submit');
    if (buySaveBtn && !document.getElementById('buy-deal-id')?.value) {
        buySaveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${dict.buy_btn_save}`;
    }

    // Update Sell Form specific titles and buttons
    const sellHeader = document.querySelector('#view-sell .deal-card-header h2');
    if (sellHeader && dict.sell_form_title) sellHeader.textContent = dict.sell_form_title;
    const sellSub = document.querySelector('#view-sell .deal-card-header p');
    if (sellSub && dict.sell_form_sub) sellSub.textContent = dict.sell_form_sub;
    const sellSaveBtn = document.getElementById('btn-save-sell-submit');
    if (sellSaveBtn && !document.getElementById('sell-deal-id')?.value) {
        sellSaveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${dict.sell_btn_save}`;
    }

    // Sync Print Bill Studio Language select if available
    const billLangSelect = document.getElementById('bill-lang-select');
    if (billLangSelect) {
        billLangSelect.value = (lang === 'sd') ? 'sd' : 'en';
        state.billLanguage = billLangSelect.value;
        const currentParty = document.getElementById('bill-party-select')?.value;
        if (currentParty) {
            generateBillSheet(currentParty, state.billLanguage);
        }
    }
}

function initLanguageSwitcher() {
    document.querySelectorAll('#lang-toggle-group .lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chosenLang = btn.dataset.lang;
            if (chosenLang) {
                setLanguage(chosenLang);
                const toastMsg = chosenLang === 'sd' 
                    ? 'سنڌي ٻولي فعال ڪئي وئي (Sindhi enabled)'
                    : chosenLang === 'ur'
                    ? 'اردو زبان منتخب کی گئی (Urdu enabled)'
                    : 'English language enabled';
                showToast(toastMsg, 'info');
            }
        });
    });

    // Apply initial saved language
    setLanguage(state.lang);
}

// ----------------- MAIN INITIALIZATION -----------------
document.addEventListener('DOMContentLoaded', () => {
    // 0. Language Switcher (Left Side of Top Menus)
    initLanguageSwitcher();

    // 1. Navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view) switchView(view);
        });
    });

    // 2. Big 3 Quick Action Cards on Dashboard
    document.getElementById('btn-quick-buy')?.addEventListener('click', () => switchView('buy'));
    document.getElementById('btn-quick-sell')?.addEventListener('click', () => switchView('sell'));
    document.getElementById('btn-quick-pay')?.addEventListener('click', () => openPaymentModalForParty());
    document.getElementById('btn-view-all-deals')?.addEventListener('click', () => switchView('history'));

    // 3. Search & Filter Listeners
    document.getElementById('party-search-input')?.addEventListener('input', renderAllPartiesTable);
    document.getElementById('hist-type-filter')?.addEventListener('change', renderHistoryTable);
    document.getElementById('hist-commodity-filter')?.addEventListener('change', renderHistoryTable);
    document.getElementById('hist-search-input')?.addEventListener('input', renderHistoryTable);

    // 4. Calculators & Modules
    initBuyCalculator();
    initSellCalculator();
    initPaymentModal();
    initClientModal();
    initWipeAllFeature();
    initModalCloseHandlers();
    initClockAndTheme();

    // 5. Initial Data Load
    loadAllData();
});
