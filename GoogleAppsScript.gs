/**
 * GOOGLE APPS SCRIPT CODE
 * Paste this in your Google Sheet: Extensions > Apps Script
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // Ambil sheet pertama
  const data = sheet.getDataRange().getValues();
  
  // Headers starts from index 2 if you have titles at row 1 & 2
  // But usually we find where "NO" column starts
  let headerRowIndex = -1;
  for(let i=0; i < data.length; i++) {
    if(data[i][0] === "NO") {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) return ContentService.createTextOutput("Header not found").setMimeType(ContentService.MimeType.TEXT);

  const headers = data[headerRowIndex];
  const results = [];

  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows

    results.push({
      no: row[0],
      dateIn: formatDate(row[1]),
      customerName: row[2],
      salesman: row[3],
      unit: row[4],
      category: row[5],
      tdp: typeof row[6] === 'number' ? (row[6] * 100).toFixed(2) + "%" : row[6],
      tenor: row[7],
      status: row[8],
      approvalDate: formatDate(row[9]),
      remarks: row[10]
    });
  }

  return ContentService.createTextOutput(JSON.stringify(results))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(date) {
  if (!date || !(date instanceof Date)) return date;
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}
