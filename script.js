// ============================================
// 多國貨幣記帳儀表板 - JavaScript
// ============================================

const GAS_DEPLOYMENT_URL = 'https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercopy';
// 注意：需要替換 {DEPLOYMENT_ID} 為實際的Google Apps Script部署ID

// 本月預算上限（可根據需要修改）
const MONTHLY_BUDGET = 10000;
const BUDGET_STORAGE_KEY = 'monthlyBudget';
let monthlyBudget = MONTHLY_BUDGET;

// 可用的貨幣列表（包含台幣）
let availableCurrencies = {
    'TWD': '台幣 (TWD)',
    'USD': '美元 (USD)',
    'JPY': '日圓 (JPY)',
    'EUR': '歐元 (EUR)',
    'KRW': '韓圓 (KRW)',
    'GBP': '英鎊 (GBP)',
    'AUD': '澳元 (AUD)',
    'CAD': '加幣 (CAD)',
    'SGD': '新加坡幣 (SGD)',
    'HKD': '港幣 (HKD)',
    'CNY': '人民幣 (CNY)',
    'INR': '印度盧比 (INR)',
    'MXN': '墨西哥比索 (MXN)',
    'BRL': '巴西里亞爾 (BRL)',
    'NZD': '紐西蘭幣 (NZD)'
};

// ============================================
// 狀態管理
// ============================================

let expenses = [];
let currentMonth = new Date();

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadExpensesFromLocalStorage();
    loadBudgetFromLocalStorage();
    renderExpenseList();
    updateBudgetProgress();
    setCurrentMonth();
    attachEventListeners();
    initializeCurrencySearch();
});

// ============================================
// UI 初始化
// ============================================

function initializeUI() {
    // 分頁按鈕
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });

    // 自動獲取匯率按鈕
    document.getElementById('fetchRateBtn').addEventListener('click', handleFetchRate);

    // 表單提交
    document.getElementById('expenseForm').addEventListener('submit', handleFormSubmit);

    // 側邊欄關閉
    document.getElementById('closeDrawer').addEventListener('click', closeSideDrawer);
    document.getElementById('drawerBackdrop').addEventListener('click', closeSideDrawer);

    // 表單欄位變化時即時計算
    document.getElementById('foreignAmount').addEventListener('input', calculateTWD);
    document.getElementById('exchangeRate').addEventListener('input', calculateTWD);

    // 預算設定
    const budgetInput = document.getElementById('budgetInput');
    if (budgetInput) {
        budgetInput.addEventListener('change', saveBudgetFromInput);
        budgetInput.addEventListener('blur', saveBudgetFromInput);
    }
}

// ============================================
// 幣別搜索功能
// ============================================

function initializeCurrencySearch() {
    const searchInput = document.getElementById('currencySearch');
    const dropdown = document.getElementById('currencyDropdown');
    const currencyInput = document.getElementById('currency');

    // 初始化顯示所有幣別
    displayCurrencyDropdown(Object.keys(availableCurrencies), dropdown);

    // 搜索功能
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toUpperCase();
        const codes = Object.keys(availableCurrencies);

        if (!searchTerm) {
            displayCurrencyDropdown(codes, dropdown);
            dropdown.classList.remove('hidden');
            currencyInput.value = '';
            return;
        }

        const filtered = codes.filter(code =>
            code.includes(searchTerm) ||
            availableCurrencies[code].toUpperCase().includes(searchTerm)
        );

        displayCurrencyDropdown(filtered, dropdown);
        dropdown.classList.toggle('hidden', filtered.length === 0);
        currencyInput.value = '';
    });

    // 點擊外部關閉下拉菜單
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== searchInput) {
            dropdown.classList.add('hidden');
        }
    });

    // 焦點時顯示下拉菜單
    searchInput.addEventListener('focus', () => {
        if (!searchInput.value) {
            displayCurrencyDropdown(Object.keys(availableCurrencies), dropdown);
        }
        dropdown.classList.remove('hidden');
    });

    // 允許按 Enter 直接選擇第一項
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = searchInput.value.trim().toUpperCase();
            if (!searchTerm) return;

            const exact = Object.keys(availableCurrencies).find(code => code === searchTerm);
            if (exact) {
                selectCurrency(exact);
                return;
            }

            const partial = Object.keys(availableCurrencies).find(code =>
                code.startsWith(searchTerm) || availableCurrencies[code].toUpperCase().startsWith(searchTerm)
            );
            if (partial) {
                selectCurrency(partial);
                return;
            }

            const fallback = Object.keys(availableCurrencies).find(code =>
                availableCurrencies[code].toUpperCase().includes(searchTerm)
            );
            if (fallback) {
                selectCurrency(fallback);
            }
        }
    });
}

function displayCurrencyDropdown(codes, dropdown) {
    dropdown.innerHTML = codes.map(code => `
        <div class="px-4 py-2 cursor-pointer hover:bg-amber-100 transition-colors border-b border-amber-100 last:border-b-0"
             onclick="selectCurrency('${code}')">
            <span class="font-bold text-amber-900">${code}</span> - ${availableCurrencies[code]}
        </div>
    `).join('');
}

function selectCurrency(code) {
    const searchInput = document.getElementById('currencySearch');
    const currencyInput = document.getElementById('currency');
    const selectedDisplay = document.getElementById('selectedCurrency');
    const dropdown = document.getElementById('currencyDropdown');
    const fetchBtnContainer = document.getElementById('fetchRateBtnContainer');

    if (!availableCurrencies[code]) return;

    searchInput.value = code;
    currencyInput.value = code;
    selectedDisplay.textContent = `已選擇：${availableCurrencies[code]}`;
    dropdown.classList.add('hidden');

    // 如果選擇台幣，隱藏「自動獲取匯率」按鈕
    if (code === 'TWD') {
        fetchBtnContainer.classList.add('hidden');
        document.getElementById('exchangeRate').value = '1';
        calculateTWD();
    } else {
        fetchBtnContainer.classList.remove('hidden');
        document.getElementById('exchangeRate').value = '';
    }
}

function ensureCurrencySelected() {
    const currencyInput = document.getElementById('currency');
    const searchInput = document.getElementById('currencySearch');
    const currentCurrency = currencyInput.value.trim().toUpperCase();

    if (currentCurrency && availableCurrencies[currentCurrency]) {
        return true;
    }

    const searchValue = searchInput.value.trim().toUpperCase();
    if (!searchValue) return false;

    // 完全匹配幣別代碼
    if (availableCurrencies[searchValue]) {
        selectCurrency(searchValue);
        return true;
    }

    // 部分匹配幣別名稱或代碼
    const matchedCode = Object.keys(availableCurrencies).find(code =>
        code.startsWith(searchValue) ||
        availableCurrencies[code].toUpperCase().includes(searchValue)
    );
    if (matchedCode) {
        selectCurrency(matchedCode);
        return true;
    }

    return false;
}

// ============================================
// 分頁切換邏輯
// ============================================

function handleTabSwitch(e) {
    const tabBtn = e.currentTarget;
    const tabId = tabBtn.dataset.tab;

    // 移除所有活動狀態
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 設置新的活動狀態
    tabBtn.classList.add('active');
    tabBtn.setAttribute('aria-selected', 'true');

    const targetContent = document.getElementById(`${tabId}-tab`);
    targetContent.classList.add('active');

    // 如果切換到歷史分頁，更新消費列表
    if (tabId === 'history') {
        renderExpenseList();
    }
}

// ============================================
// 自動獲取匯率
// ============================================

async function handleFetchRate(e) {
    e.preventDefault();

    if (!ensureCurrencySelected()) {
        showMessage('❌ 請先選擇或輸入有效的幣別代碼，例如 USD、JPY、TWD', 'error');
        return;
    }

    const currency = document.getElementById('currency').value;
    const foreignAmount = document.getElementById('foreignAmount').value;

    // 驗證
    if (!currency) {
        showMessage('❌ 請先選擇幣別', 'error');
        return;
    }

    if (currency === 'TWD') {
        showMessage('⚠️ 台幣無需匯率轉換', 'error');
        return;
    }

    if (!foreignAmount || foreignAmount <= 0) {
        showMessage('❌ 請輸入有效的金額', 'error');
        return;
    }

    showLoading(true);
    document.getElementById('fetchRateBtn').disabled = true;

    try {
        // 使用可公開的匯率 API
        const url = `https://open.er-api.com/v6/latest/${currency}`;
        console.log('正在調用 API:', url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API 錯誤：${response.status}`);
        }

        const data = await response.json();
        console.log('API 響應:', data);

        if (!data || data.result !== 'success' || !data.rates || typeof data.rates.TWD !== 'number') {
            throw new Error('無法獲取正確的匯率數據');
        }

        const exchangeRate = data.rates.TWD;

        // 填入匯率欄位
        document.getElementById('exchangeRate').value = exchangeRate.toFixed(4);

        // 自動計算折合台幣
        calculateTWD();

        showMessage(`✓ 成功取得匯率：1 ${currency} = ${exchangeRate.toFixed(2)} TWD`, 'success');

    } catch (error) {
        console.error('匯率獲取失敗:', error);
        showMessage(`❌ 無法獲取匯率：${error.message}，請檢查幣別是否正確或稍後重試`, 'error');
    } finally {
        showLoading(false);
        document.getElementById('fetchRateBtn').disabled = false;
    }
}

// ============================================
// 計算折合台幣
// ============================================

function calculateTWD() {
    const currency = document.getElementById('currency').value;
    const foreignAmount = parseFloat(document.getElementById('foreignAmount').value) || 0;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 0;

    let twdAmount = 0;

    // 如果是台幣，直接使用輸入的金額
    if (currency === 'TWD') {
        twdAmount = foreignAmount;
    } else {
        // 其他貨幣，計算為：外幣金額 × 匯率
        twdAmount = foreignAmount * exchangeRate;
    }

    document.getElementById('twdAmount').value = twdAmount.toFixed(2);
}

// ============================================
// 表單提交
// ============================================

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!ensureCurrencySelected()) {
        showMessage('❌ 請先選擇或輸入有效的幣別代碼，例如 USD、JPY、TWD', 'error');
        return;
    }

    const currency = document.getElementById('currency').value;
    const foreignAmount = parseFloat(document.getElementById('foreignAmount').value) || 0;
    const twdAmount = parseFloat(document.getElementById('twdAmount').value) || 0;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 0;

    const formData = {
        itemName: document.getElementById('itemName').value,
        currency: currency,
        foreignAmount: foreignAmount,
        exchangeRate: exchangeRate,
        twdAmount: twdAmount,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };

    // 驗證必填欄位
    if (!formData.itemName) {
        showMessage('❌ 請填寫消費項目', 'error');
        return;
    }

    if (!formData.currency) {
        showMessage('❌ 請選擇幣別', 'error');
        return;
    }

    if (formData.foreignAmount <= 0) {
        showMessage('❌ 請輸入有效的金額', 'error');
        return;
    }

    // 台幣不需要匯率驗證
    if (currency !== 'TWD') {
        if (exchangeRate <= 0) {
            showMessage('❌ 請先點擊「自動獲取匯率換算」獲取匯率', 'error');
            return;
        }
    }

    if (formData.twdAmount <= 0) {
        showMessage('❌ 折合台幣金額無效', 'error');
        return;
    }

    showLoading(true);

    try {
        // 發送到 Google Apps Script
        const response = await fetch(GAS_DEPLOYMENT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // 本地存儲（備份）
        expenses.push(formData);
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // 重置表單
        document.getElementById('expenseForm').reset();
        document.getElementById('currency').value = '';
        document.getElementById('currencySearch').value = '';
        document.getElementById('selectedCurrency').textContent = '';
        document.getElementById('exchangeRate').value = '';
        document.getElementById('twdAmount').value = '';
        document.getElementById('currencyDropdown').classList.add('hidden');
        document.getElementById('fetchRateBtnContainer').classList.remove('hidden');

        // 更新預算進度
        updateBudgetProgress();
        renderExpenseList();

        showMessage('✓ 消費已成功記錄！', 'success');

        // 自動切換到歷史分頁
        setTimeout(() => {
            document.querySelector('[data-tab="history"]').click();
        }, 1000);

    } catch (error) {
        console.error('提交失敗:', error);
        // 即使GAS失敗也保存到本地存儲
        expenses.push(formData);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateBudgetProgress();
        showMessage('✓ 已本地保存（等待同步）', 'success');
    } finally {
        showLoading(false);
    }
}

// ============================================
// 預算進度條更新
// ============================================

function updateBudgetProgress() {
    // 只計算本月的消費
    const thisMonth = new Date();
    const thisMonthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.timestamp);
        return expDate.getMonth() === thisMonth.getMonth() &&
               expDate.getFullYear() === thisMonth.getFullYear();
    });

    const totalSpent = thisMonthExpenses.reduce((sum, exp) => sum + exp.twdAmount, 0);

    // 更新進度條寬度
    const percentage = Math.min((totalSpent / monthlyBudget) * 100, 100);
    const progressBar = document.getElementById('budgetProgressBar');
    progressBar.style.width = percentage + '%';

    // 更新數字顯示
    document.getElementById('spentAmount').textContent = totalSpent.toFixed(0);
    document.getElementById('budgetAmount').textContent = monthlyBudget;

    // 根據使用比例改變顏色
    if (percentage > 90) {
        progressBar.classList.remove('from-orange-400', 'to-orange-600');
        progressBar.classList.add('from-red-400', 'to-red-600');
    } else if (percentage > 70) {
        progressBar.classList.remove('from-red-400', 'to-red-600');
        progressBar.classList.add('from-yellow-400', 'to-yellow-600');
    } else {
        progressBar.classList.remove('from-yellow-400', 'to-yellow-600', 'from-red-400', 'to-red-600');
        progressBar.classList.add('from-orange-400', 'to-orange-600');
    }
}

// ============================================
// 消費列表渲染
// ============================================

function renderExpenseList() {
    const expenseList = document.getElementById('expenseList');

    if (expenses.length === 0) {
        expenseList.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <p class="text-lg">📭 目前沒有記錄</p>
            </div>
        `;
        return;
    }

    // 按時間倒序排列
    const sortedExpenses = [...expenses].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    expenseList.innerHTML = sortedExpenses.map(exp => `
        <div class="expense-item p-4 bg-amber-50 border-2 border-amber-300 rounded-lg cursor-pointer hover:bg-amber-100 transition-all">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="font-bold text-amber-900">${exp.itemName}</p>
                    <p class="text-sm text-gray-600">${formatDate(exp.timestamp)}</p>
                </div>
                <span class="inline-block px-3 py-1 bg-orange-200 text-orange-900 font-bold rounded-full text-sm">
                    ${exp.currency}
                </span>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-xs text-gray-600">外幣金額</p>
                    <p class="font-bold text-lg">${exp.foreignAmount.toFixed(2)} ${exp.currency}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-600">折合台幣</p>
                    <p class="font-bold text-lg text-green-600">$ ${exp.twdAmount.toFixed(2)}</p>
                </div>
            </div>
            <button class="mt-3 w-full px-3 py-2 text-sm bg-blue-100 text-blue-900 rounded font-semibold hover:bg-blue-200 transition-colors" onclick="openSideDrawer(${exp.id})">
                👁️ 查看詳細
            </button>
        </div>
    `).join('');
}

// ============================================
// 側邊欄詳細面板
// ============================================

function openSideDrawer(expenseId) {
    const expense = expenses.find(exp => exp.id === expenseId);

    if (!expense) return;

    const drawerContent = document.getElementById('drawerContent');
    const expDate = new Date(expense.timestamp);

    drawerContent.innerHTML = `
        <h3 class="text-2xl font-bold text-amber-900 mb-6 handwritten-text">${expense.itemName}</h3>

        <div class="space-y-4">
            <!-- 基本資訊 -->
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-200">
                <p class="text-xs font-semibold text-gray-600 mb-1">記錄時間</p>
                <p class="text-lg font-bold text-amber-900">${expDate.toLocaleString('zh-TW')}</p>
            </div>

            <!-- 幣別信息 -->
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
                <p class="text-xs font-semibold text-gray-600 mb-2">幣別信息</p>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-700">幣別：</span>
                        <span class="font-bold text-blue-900">${expense.currency}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">金額：</span>
                        <span class="font-bold">${expense.foreignAmount.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">即時匯率：</span>
                        <span class="font-bold">1 ${expense.currency} = ${expense.exchangeRate.toFixed(4)} TWD</span>
                    </div>
                </div>
            </div>

            <!-- 台幣換算 -->
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                <p class="text-xs font-semibold text-gray-600 mb-1">折合台幣</p>
                <p class="text-3xl font-bold text-green-700">$ ${expense.twdAmount.toFixed(2)}</p>
            </div>

            <!-- 備註 -->
            ${expense.notes ? `
                <div class="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                    <p class="text-xs font-semibold text-gray-600 mb-2">備註</p>
                    <p class="text-gray-800">${expense.notes}</p>
                </div>
            ` : ''}

            <!-- 操作按鈕 -->
            <div class="flex gap-2 mt-6">
                <button onclick="deleteExpense(${expense.id})" class="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">
                    🗑️ 刪除
                </button>
            </div>
        </div>
    `;

    // 打開側邊欄
    const drawer = document.getElementById('sideDrawer');
    const backdrop = document.getElementById('drawerBackdrop');

    // 確保背景顯示
    backdrop.style.display = 'block';
    drawer.classList.add('active');
    backdrop.classList.add('active');
}

function closeSideDrawer() {
    const drawer = document.getElementById('sideDrawer');
    const backdrop = document.getElementById('drawerBackdrop');

    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    
    // 確保背景完全隱藏
    setTimeout(() => {
        if (!drawer.classList.contains('active')) {
            backdrop.style.display = 'none';
        }
    }, 300);
}

// ============================================
// 刪除消費記錄
// ============================================

function deleteExpense(expenseId) {
    if (!confirm('確定要刪除這筆消費嗎？')) return;

    expenses = expenses.filter(exp => exp.id !== expenseId);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    closeSideDrawer();
    renderExpenseList();
    updateBudgetProgress();

    showMessage('✓ 已刪除', 'success');
}

// ============================================
// 本地存儲管理
// ============================================

function loadExpensesFromLocalStorage() {
    const stored = localStorage.getItem('expenses');
    if (stored) {
        try {
            expenses = JSON.parse(stored);
        } catch (e) {
            console.error('無法讀取本地資料', e);
            expenses = [];
        }
    }
}

function loadBudgetFromLocalStorage() {
    const storedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (storedBudget && !isNaN(parseFloat(storedBudget))) {
        monthlyBudget = parseFloat(storedBudget);
    }
    const budgetInput = document.getElementById('budgetInput');
    if (budgetInput) {
        budgetInput.value = monthlyBudget;
    }
}

function saveBudgetFromInput() {
    const budgetInput = document.getElementById('budgetInput');
    if (!budgetInput) return;

    const value = parseFloat(budgetInput.value);
    if (Number.isNaN(value) || value <= 0) {
        showMessage('❌ 請輸入有效的本月預算數字', 'error');
        budgetInput.value = monthlyBudget;
        return;
    }

    monthlyBudget = value;
    localStorage.setItem(BUDGET_STORAGE_KEY, monthlyBudget);
    updateBudgetProgress();
    showMessage(`✓ 已更新本月預算：${monthlyBudget} TWD`, 'success');
}

// ============================================
// 工具函數
// ============================================

function setCurrentMonth() {
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月',
                       '7月', '8月', '9月', '10月', '11月', '12月'];
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    document.getElementById('currentMonth').textContent = `${year} 年 ${monthNames[month]}`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `${type === 'success' ? 'message-success' : 'message-error'}`;
    messageBox.classList.remove('hidden');

    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 4000);
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

function attachEventListeners() {
    // 額外的事件監聽（如需要）
}
