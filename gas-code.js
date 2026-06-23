// ============================================
// Google Apps Script - 後端代碼
// 複製此代碼到 Google Apps Script 編輯器
// ============================================

// 試算表相關設定
const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // 替換為你的試算表ID
const SHEET_NAME = '消費記錄';

/**
 * doPost - 接收來自前端的POST請求
 * @param {Object} e - 請求事件對象
 * @returns {ContentService.TextOutput} JSON回應
 */
function doPost(e) {
  try {
    // 解析前端送來的JSON資料
    const jsonString = e.postData.contents;
    const data = JSON.parse(jsonString);

    // 驗證必要欄位
    if (!data.itemName || !data.currency || !data.foreignAmount) {
      return respondWithJSON({
        success: false,
        message: '缺少必要欄位'
      });
    }

    // 寫入試算表
    appendToSheet(data);

    return respondWithJSON({
      success: true,
      message: '資料已成功記錄',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('錯誤:', error);
    return respondWithJSON({
      success: false,
      message: '伺服器錯誤: ' + error.toString()
    });
  }
}

/**
 * appendToSheet - 將資料追加到試算表
 * @param {Object} data - 消費記錄對象
 */
function appendToSheet(data) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  
  // 取得或建立工作表
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    createHeaders(sheet);
  }

  // 準備行資料
  const row = [
    new Date(data.timestamp), // 記錄時間
    data.itemName,            // 消費項目
    data.currency,            // 外幣幣別
    data.foreignAmount,       // 外幣金額
    data.exchangeRate,        // 即時匯率
    data.twdAmount,           // 折合台幣
    data.notes                // 備註
  ];

  // 追加到試算表
  sheet.appendRow(row);
}

/**
 * createHeaders - 建立試算表標題行
 * @param {Sheet} sheet - 工作表對象
 */
function createHeaders(sheet) {
  const headers = ['記錄時間', '消費項目', '幣別', '外幣金額', '即時匯率', '折合台幣 (TWD)', '備註'];
  sheet.appendRow(headers);

  // 設定標題行格式
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#FBD38D'); // 黃色背景
  headerRange.setFontWeight('bold');
  headerRange.setFontColor('#92400E'); // 深黃色字體

  // 自動調整列寬
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * respondWithJSON - 生成JSON回應
 * @param {Object} data - 回應資料
 * @returns {ContentService.TextOutput}
 */
function respondWithJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * doGet - 允許GET請求（用於測試）
 */
function doGet() {
  return respondWithJSON({
    message: '多國貨幣記帳儀表板 - Google Apps Script',
    version: '1.0',
    status: 'running'
  });
}

// ============================================
// 輔助函數
// ============================================

/**
 * getSheetDataAsJSON - 取得試算表所有資料（用於測試或導出）
 * @returns {Array} 所有消費記錄
 */
function getSheetDataAsJSON() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const records = [];

  for (let i = 1; i < data.length; i++) {
    const record = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = data[i][j];
    }
    records.push(record);
  }

  return records;
}

/**
 * 清空試算表（謹慎使用）
 */
function clearSheetData() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (sheet) {
    sheet.clear();
    createHeaders(sheet);
  }
}
