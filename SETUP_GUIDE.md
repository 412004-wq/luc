# 多國貨幣記帳儀表板 - 完整設置指南

## 📋 目錄
1. [專案概述](#專案概述)
2. [技術棧](#技術棧)
3. [功能特性](#功能特性)
4. [前端設置](#前端設置)
5. [後端設置 (Google Apps Script)](#後端設置-google-apps-script)
6. [部署步驟](#部署步驟)
7. [使用教學](#使用教學)
8. [API 文檔](#api-文檔)
9. [疑難排解](#疑難排解)

---

## 專案概述

這是一個**純前端的多國貨幣記帳儀表板**，結合 **Google Apps Script** 作為後端，用於記錄多幣種消費並自動換算為新台幣。

### 核心特色
- ✨ 高質感手繪風設計
- 🎨 Tailwind CSS 全域風格
- 💱 即時匯率自動換算（Frankfurter API）
- 📊 動態預算進度條
- 🗂️ 分頁切換和側邊欄詳細面板
- 💾 本地存儲 + Google 試算表同步

---

## 技術棧

### 前端
- **HTML5** - 語意化結構
- **CSS3** - 手繪風動畫效果
- **JavaScript (原生)** - 無框架依賴
- **Tailwind CSS** - 工具類樣式
- **Frankfurter API** - 免費匯率API（無需Key）

### 後端
- **Google Apps Script (GAS)** - 接收資料並寫入試算表
- **Google Sheets** - 數據存儲

---

## 功能特性

### 1️⃣ 動態分頁切換 (Tabs Transition)
- 上方有「新增消費」和「歷史流水帳」兩個分頁
- 點擊時以平滑淡入動畫呈現內容

### 2️⃣ 動態預算進度條
- 主畫面頂端顯示本月預算進度
- 資料更新時自動伸展
- 超過預算時變色提示（橙色 → 黃色 → 紅色）

### 3️⃣ 右側滑出詳細面板 (Side Drawer)
- 點擊消費紀錄時平滑滑出
- 顯示完整的消費細節
- 支持刪除功能

### 4️⃣ 自動匯率換算
- 點擊「自動獲取匯率換算」按鈕
- 自動調用 Frankfurter API
- 填入即時匯率和折合台幣

---

## 前端設置

### 檔案結構
```
luc/
├── index.html        # 主頁面（HTML結構）
├── styles.css        # 自定義樣式和動畫
├── script.js         # JavaScript邏輯
├── gas-code.js       # Google Apps Script代碼（參考）
└── SETUP_GUIDE.md    # 本文件
```

### 快速開始

#### 方式 1：本地文件打開
1. 將所有文件保存到同一目錄
2. 在瀏覽器中打開 `index.html`

#### 方式 2：上傳到網站
1. 上傳 `index.html`、`styles.css` 和 `script.js` 到網站主機
2. 訪問對應的 URL

#### 方式 3：使用 VS Code Live Server 插件
```bash
# 1. 安裝 Live Server 插件
# 2. 右鍵點擊 index.html
# 3. 選擇 "Open with Live Server"
```

### 配置參數

編輯 `script.js` 中的以下變數：

```javascript
// 第 13 行 - 本月預算上限
const MONTHLY_BUDGET = 10000; // 改為你的預算

// 第 8 行 - Google Apps Script 部署 URL
const GAS_DEPLOYMENT_URL = 'https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercopy';
// 替換 {DEPLOYMENT_ID} 為你的實際部署ID
```

---

## 後端設置 (Google Apps Script)

### 步驟 1：創建 Google 試算表

1. 訪問 [Google Sheets](https://sheets.google.com)
2. 新建試算表，命名為「多國貨幣記帳」
3. 複製試算表ID（URL中 `/spreadsheets/d/` 後面的部分）

### 步驟 2：打開 Google Apps Script 編輯器

1. 在試算表中點擊「擴充功能」→「Apps Script」
2. 刪除預設代碼
3. 複製 `gas-code.js` 中的所有代碼到編輯器

### 步驟 3：配置 Google Apps Script

編輯 `gas-code.js` 中的設定：

```javascript
// 第 11-12 行
const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // 改為你的試算表ID
const SHEET_NAME = '消費記錄';
```

### 步驟 4：部署為 Web App

1. 點擊「部署」→「新增部署」
2. 選擇「類型」為「Web 應用程式」
3. 設定：
   - 「執行身份」：選擇你的帳號
   - 「有權存取的使用者」：選擇「所有人」
4. 點擊「部署」
5. **複製部署 URL**，格式為：
   ```
   https://script.google.com/macros/s/{DEPLOYMENT_ID}/usercopy
   ```

### 步驟 5：更新前端配置

將得到的部署 URL 粘貼到 `script.js`：

```javascript
const GAS_DEPLOYMENT_URL = 'https://script.google.com/macros/s/{DEPLOYMENT_ID}/usercopy';
```

---

## 部署步驟

### 完整檢查清單

- [ ] 前端文件準備完畢
- [ ] Google 試算表已創建
- [ ] Google Apps Script 代碼已上傳
- [ ] 試算表 ID 已配置到 `gas-code.js`
- [ ] GAS 已部署為 Web App
- [ ] 部署 URL 已複製
- [ ] 部署 URL 已更新到 `script.js`
- [ ] 前端頁面測試成功

### 測試部署

1. 打開 `index.html`
2. 輸入測試消費記錄
3. 點擊「自動獲取匯率換算」→ 驗證匯率是否正確載入
4. 點擊「儲存消費」
5. 打開 Google 試算表，驗證資料是否出現

---

## 使用教學

### 新增消費

1. **填寫消費項目**
   - 例：「機票」、「飯店」、「餐飲」等

2. **選擇外幣幣別**
   - 支持：USD（美元）、JPY（日圓）、EUR（歐元）、KRW（韓圓）

3. **輸入外幣金額**
   - 例：100.50

4. **點擊「自動獲取匯率換算」**
   - 自動調用 API 獲取最新匯率
   - 系統自動計算折合台幣

5. **（可選）添加消費備註**

6. **點擊「儲存消費」**
   - 資料同時保存到本地存儲和 Google 試算表

### 查看歷史流水帳

1. 點擊上方「歷史流水帳」分頁
2. 查看所有消費記錄
3. 點擊任何記錄的「查看詳細」按鈕
4. 右側面板滑出，顯示完整信息

### 刪除消費記錄

1. 在詳細面板中點擊「🗑️ 刪除」按鈕
2. 確認刪除
3. 本地記錄立即刪除

---

## API 文檔

### Frankfurter API

**無需 API Key 的免費匯率 API**

#### 請求格式
```
GET https://api.frankfurter.dev/v1/latest?base={CURRENCY}&symbols=TWD
```

#### 參數
- `base` - 源幣別（USD, JPY, EUR, KRW 等）
- `symbols` - 目標幣別（固定為 TWD）

#### 響應示例
```json
{
  "amount": 1,
  "base": "USD",
  "date": "2024-01-15",
  "rates": {
    "TWD": 30.5
  }
}
```

### Google Apps Script API

#### 請求
```javascript
fetch('https://script.google.com/macros/s/{DEPLOYMENT_ID}/usercopy', {
  method: 'POST',
  mode: 'no-cors',
  body: JSON.stringify({
    itemName: "機票",
    currency: "USD",
    foreignAmount: 1000,
    exchangeRate: 30.5,
    twdAmount: 30500,
    notes: "往返東京",
    timestamp: "2024-01-15T10:30:00Z"
  })
})
```

#### 響應
```json
{
  "success": true,
  "message": "資料已成功記錄",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 數據結構

### 前端本地存儲格式
```javascript
{
  id: 1705325400000,                          // 唯一ID（時間戳）
  itemName: "機票",                           // 消費項目
  currency: "USD",                            // 幣別
  foreignAmount: 1000,                        // 外幣金額
  exchangeRate: 30.5,                         // 即時匯率
  twdAmount: 30500,                           // 折合台幣
  notes: "東京行",                            // 備註
  timestamp: "2024-01-15T10:30:00Z"          // 記錄時間
}
```

### Google 試算表列
| 記錄時間 | 消費項目 | 幣別 | 外幣金額 | 即時匯率 | 折合台幣 (TWD) | 備註 |
|---------|--------|------|---------|--------|--------------|-----|

---

## 進階功能

### 修改預算上限
編輯 `script.js`：
```javascript
const MONTHLY_BUDGET = 15000; // 改為 15000
```

### 添加新幣別
編輯 `index.html` 中的 select 元素：
```html
<option value="GBP">英鎊 (GBP)</option>
<option value="AUD">澳元 (AUD)</option>
```

### 本地數據導出
在瀏覽器控制臺運行：
```javascript
console.log(JSON.stringify(localStorage.getItem('expenses'), null, 2));
```

---

## 疑難排解

### 問題 1：「無法獲取匯率」

**原因**：Frankfurter API 不可用或網絡問題

**解決方案**：
1. 檢查網絡連接
2. 確認幣別選擇正確
3. 稍後重試

### 問題 2：儲存數據到 Google 試算表失敗

**原因**：
- GAS 部署 URL 錯誤
- Google 帳號權限不足
- GAS 部署已過期

**解決方案**：
1. 驗證 `script.js` 中的 URL 是否正確
2. 重新部署 GAS（可能過期）
3. 確保 GAS 中的試算表 ID 正確

### 問題 3：資料只保存在本地，未同步到試算表

**原因**：GAS 部署未正確配置

**解決方案**：
1. 打開瀏覽器開發者工具 (F12)
2. 查看 Network 標籤，檢查 POST 請求
3. 驗證請求 URL 和響應

### 問題 4：「跨域請求錯誤」

**原因**：GAS 的 CORS 配置問題

**解決方案**：
- 這已通過前端 `mode: 'no-cors'` 解決
- 如仍有問題，重新部署 GAS

### 問題 5：預算進度條不更新

**原因**：數據未正確計算

**解決方案**：
1. 按 F12 打開開發者工具
2. 檢查 Console 是否有錯誤
3. 驗證 `MONTHLY_BUDGET` 設定

---

## 效能最佳化

### 本地存儲優化
- 前端自動保存所有消費到 `localStorage`
- 即使 GAS 暫時不可用，資料仍被保留
- 當網絡恢復後手動或自動同步

### API 調用最佳實踐
- 避免頻繁調用匯率 API（同一天同一幣別只需一次）
- 匯率每日更新，無需多次查詢

### 頁面載入速度
- 所有資源為本地文件或 CDN 加載
- Tailwind CSS 通過 CDN 動態加載
- 無重框架依賴，加載速度快

---

## 安全性注意

### 前端
- 不存儲敏感信息
- 所有計算在本地進行

### 後端 (GAS)
- 確保 Google 帳號安全
- 定期檢查試算表訪問權限
- 不建議將試算表設為公開

---

## 常見問題 (FAQ)

**Q: 能否添加更多幣別？**
A: 可以，編輯 `index.html` 中的 `<select>` 元素即可。Frankfurter API 支持數百種幣別。

**Q: 能否修改預算？**
A: 可以，編輯 `script.js` 中的 `MONTHLY_BUDGET` 常數。

**Q: 數據會永久保存嗎？**
A: 會的。前端本地存儲和 Google 試算表都會永久保存。

**Q: 能否在多台設備間同步？**
A: 可以，Google 試算表作為中央存儲。

**Q: 需要付費嗎？**
A: 不需要。所有工具都是免費的（Frankfurter API、Google Sheets、Google Apps Script）。

---

## 許可證

開源專案，自由使用和修改

## 最後更新

2024 年 1 月 15 日
