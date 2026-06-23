// ============================================
// 多國貨幣記帳儀表板 - JavaScript
// ============================================

const GAS_DEPLOYMENT_URL = 'https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercopy';
// 注意：需要替換 {DEPLOYMENT_ID} 為實際的Google Apps Script部署ID

// 本月預算上限（可根據需要修改）
const MONTHLY_BUDGET = 10000;

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
    updateBudgetProgress();
    setCurrentMonth();
    attachEventListeners();
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

    const currency = document.getElementById('currency').value;
    const foreignAmount = document.getElementById('foreignAmount').value;

    // 驗證
    if (!currency) {
        showMessage('請先選擇幣別', 'error');
        return;
    }

    if (!foreignAmount || foreignAmount <= 0) {
        showMessage('請輸入有效的金額', 'error');
        return;
    }

    // 顯示加載狀態
    showLoading(true);

    try {
        // 呼叫 Frankfurter API (免費、無需Key)
        const response = await fetch(
            `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=TWD`
        );

        if (!response.ok) {
            throw new Error('無法獲取匯率資料');
        }

        const data = await response.json();
        const exchangeRate = data.rates.TWD;

        // 填入匯率欄位
        document.getElementById('exchangeRate').value = exchangeRate.toFixed(4);

        // 自動計算折合台幣
        calculateTWD();

        showMessage(`✓ 成功取得匯率：1 ${currency} = ${exchangeRate.toFixed(2)} TWD`, 'success');

    } catch (error) {
        console.error('匯率獲取失敗:', error);
        showMessage('❌ 無法獲取匯率，請稍後重試或手動輸入', 'error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// 計算折合台幣
// ============================================

function calculateTWD() {
    const foreignAmount = parseFloat(document.getElementById('foreignAmount').value) || 0;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 0;

    const twdAmount = (foreignAmount * exchangeRate).toFixed(2);
    document.getElementById('twdAmount').value = twdAmount;
}

// ============================================
// 表單提交
// ============================================

async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        itemName: document.getElementById('itemName').value,
        currency: document.getElementById('currency').value,
        foreignAmount: parseFloat(document.getElementById('foreignAmount').value),
        exchangeRate: parseFloat(document.getElementById('exchangeRate').value),
        twdAmount: parseFloat(document.getElementById('twdAmount').value),
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString(),
        id: Date.now() // 簡單的唯一ID
    };

    // 驗證必填欄位
    if (!formData.itemName || !formData.currency || !formData.foreignAmount) {
        showMessage('❌ 請填寫所有必填欄位', 'error');
        return;
    }

    if (formData.exchangeRate <= 0 || formData.twdAmount <= 0) {
        showMessage('❌ 請先獲取匯率', 'error');
        return;
    }

    showLoading(true);

    try {
        // 發送到 Google Apps Script
        const response = await fetch(GAS_DEPLOYMENT_URL, {
            method: 'POST',
            mode: 'no-cors', // 跨域請求
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
        document.getElementById('exchangeRate').value = '';
        document.getElementById('twdAmount').value = '';

        // 更新預算進度
        updateBudgetProgress();

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
    const percentage = Math.min((totalSpent / MONTHLY_BUDGET) * 100, 100);
    const progressBar = document.getElementById('budgetProgressBar');
    progressBar.style.width = percentage + '%';

    // 更新數字顯示
    document.getElementById('spentAmount').textContent = totalSpent.toFixed(0);
    document.getElementById('budgetAmount').textContent = MONTHLY_BUDGET;

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

    drawer.classList.add('active');
    backdrop.classList.add('active');
}

function closeSideDrawer() {
    const drawer = document.getElementById('sideDrawer');
    const backdrop = document.getElementById('drawerBackdrop');

    drawer.classList.remove('active');
    backdrop.classList.remove('active');
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
