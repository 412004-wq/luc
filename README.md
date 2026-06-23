# 🌍 多國貨幣記帳儀表板

> **高質感手繪風設計的純前端多幣種記帳應用**  
> 🎨 Tailwind CSS + 原生 JavaScript + Google Apps Script

![License](https://img.shields.io/badge/License-Open-blue?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0-orange?style=flat-square)

---

## ✨ 功能特性

### 🎯 核心功能
- ✅ **自動匯率換算** - 一鍵調用 Frankfurter API 獲取即時匯率
- ✅ **多幣種支持** - USD、JPY、EUR、KRW（可擴展）
- ✅ **動態預算進度** - 實時顯示本月消費進度，超支自動警告
- ✅ **分頁切換** - 平滑淡入淡出動畫
- ✅ **側邊欄詳細面板** - 滑出式設計查看消費細節
- ✅ **本地存儲** - 離線也能記錄，自動同步到 Google 試算表

### 🎨 設計特色
- 🖌️ 手繪風格字體和動畫
- 🌸 溫暖的橙黃色系調色板
- 📱 完全響應式設計
- ✨ 平滑的 CSS 動畫效果

### ⚡ 技術亮點
- 🚀 **零框架** - 純原生 JavaScript（無 React、Vue 等）
- 🎯 **簡潔設計** - 最小化代碼，避免過度工程
- 📡 **無需 API Key** - Frankfurter API 完全免費
- 💾 **雲端同步** - Google Apps Script 後端自動記錄

---

## 🚀 快速開始

### 最快的方式 - 直接打開

1. **打開文件**
   ```bash
   # 方式1：直接在瀏覽器中打開
   open index.html
   
   # 方式2：使用 VS Code Live Server
   右鍵點擊 index.html → Open with Live Server
   ```

2. **開始記錄消費**
   - 點擊「新增消費」
   - 填寫消費信息
   - 點擊「自動獲取匯率換算」
   - 點擊「儲存消費」✓

### 完整設置（含 Google 試算表同步）

詳見 [完整設置指南](./SETUP_GUIDE.md) 📖

---

## 📋 文件結構

```
luc/
├── index.html              # 主頁面 (HTML 結構)
├── styles.css              # 自定義樣式和動畫
├── script.js               # JavaScript 邏輯
├── gas-code.js             # Google Apps Script 後端代碼
├── SETUP_GUIDE.md          # 詳細設置教程
└── README.md               # 本文件
```

---

## 🎬 動畫效果

| 效果 | 說明 |
|------|------|
| 📊 **預算進度條** | 資料更新時平滑寬度伸展 |
| 🔄 **分頁切換** | 淡入淡出動畫 (fadeIn 0.6s) |
| 📂 **側邊欄** | 從右側平滑滑出 |
| 📝 **列表項** | 依序延遲 slideInUp 動畫 |

---

## 🔧 快速配置

### 預算上限
編輯 `script.js` 第 13 行：
```javascript
const MONTHLY_BUDGET = 10000;  // 改為你的預算
```

### Google Apps Script 部署 URL
編輯 `script.js` 第 8 行：
```javascript
const GAS_DEPLOYMENT_URL = 'https://script.google.com/macros/s/{DEPLOYMENT_ID}/usercopy';
```

---

## 📚 完整文檔

- [完整設置指南](./SETUP_GUIDE.md) - 詳細的部署和配置教程
- [API 文檔](./SETUP_GUIDE.md#api-文檔) - Frankfurter 和 GAS API
- [疑難排解](./SETUP_GUIDE.md#疑難排解) - 常見問題解決

---

## ❓ 快速 FAQ

**Q: 需要編程基礎嗎？**
A: 不需要。開箱即用，只需改幾個配置值。

**Q: 支持離線使用嗎？**
A: 支持。本地存儲所有數據，網絡恢復後自動同步。

**Q: 需要支付費用嗎？**
A: 不需要。所有工具都免費（Frankfurter API、Google Sheets、Google Apps Script）。

---

**最後更新：2024 年 1 月 15 日** ⭐