# ⚡ 快速參考卡 (Cheat Sheet)

## 🚀 30 秒快速開始

### 1️⃣ 直接打開網頁
```
在瀏覽器中打開 index.html
或使用 VS Code Live Server
```

### 2️⃣ 新增消費
```
新增消費 → 填表 → 點擊 🔄 按鈕 → 儲存
```

### 3️⃣ 查看歷史
```
歷史流水帳 → 點擊記錄 → 右側滑出詳細面板
```

---

## 📝 文件快速修改

### 改預算上限
**文件：** `script.js` 第 13 行
```javascript
const MONTHLY_BUDGET = 15000;  // 改成你要的數字
```

### 改 Google Apps Script URL
**文件：** `script.js` 第 8 行
```javascript
const GAS_DEPLOYMENT_URL = 'https://script.google.com/macros/s/YOUR_ID/usercopy';
```

### 改 Google 試算表 ID
**文件：** `gas-code.js` 第 11 行
```javascript
const SHEET_ID = 'YOUR_SPREADSHEET_ID';
```

---

## 🔄 部署檢查清單 (5 步)

- [ ] 1. 打開 `index.html` 驗證前端可用
- [ ] 2. 創建 Google 試算表
- [ ] 3. 複製試算表 ID 到 `gas-code.js`
- [ ] 4. 部署 GAS 並複製部署 URL
- [ ] 5. 更新 `script.js` 中的部署 URL

---

## 💱 支持的幣別

```
USD  - 美元 🇺🇸
JPY  - 日圓 🇯🇵
EUR  - 歐元 🇪🇺
KRW  - 韓圓 🇰🇷
GBP  - 英鎊 🇬🇧
AUD  - 澳元 🇦🇺
```

**添加新幣別：** 編輯 `index.html` 中的 `<select>` 元素

---

## 🐛 常見問題

| 問題 | 解決方案 |
|------|--------|
| 無法獲取匯率 | 檢查網絡、重新選擇幣別 |
| 數據不同步 | 驗證 GAS URL、重新部署 GAS |
| 預算條不更新 | F12 查看 console 是否有錯誤 |
| 側邊欄打不開 | 檢查 index.html 是否完整 |

---

## 📊 數據格式

### 本地存儲
```javascript
localStorage.getItem('expenses')
// 返回 JSON 字符串陣列
```

### Google 試算表
| 時間 | 項目 | 幣別 | 外幣金額 | 匯率 | 台幣 | 備註 |
|------|------|------|---------|------|------|------|

---

## 🎨 自訂樣式

### 改色系
編輯 `styles.css` 中的顏色值：
```css
/* 例：改為藍色系 */
background: linear-gradient(135deg, #93c5fd, #60a5fa);
border-color: #3b82f6;
```

### 改字體
在 `styles.css` 第 4 行修改 font-family

---

## 🔐 安全提示

✅ **安全的**
- 本地計算（前端無數據洩露）
- 無 API Key 暴露（Frankfurter 免費）

⚠️ **需小心**
- Google 試算表設為私密（預設私密 ✓）
- Google 帳號安全

---

## 📱 響應式設計

- 🖥️ 桌面 (1920px+)
- 💻 平板 (768px-1919px)
- 📱 手機 (320px-767px)

側邊欄自動適應屏幕大小

---

## 🆘 獲得幫助

1. 查看 [完整設置指南](./SETUP_GUIDE.md)
2. 查看 `SETUP_GUIDE.md` 的疑難排解部分
3. 檢查瀏覽器控制臺 (F12) 的錯誤信息

---

**更新日期：** 2024 年 1 月 15 日
