// ════════════════════════════════════════════════════════════
// OODA Kasir F&B — Google Apps Script Backend
// File: Code.gs
//
// Cara deploy:
// 1. Extensions → Apps Script
// 2. Paste kode ini, ganti SPREADSHEET_ID
// 3. Deploy → New deployment → Web App
//    Execute as: Me | Access: Anyone
// 4. Copy Web App URL → paste ke .env (VITE_GAS_URL)
// ════════════════════════════════════════════════════════════

const SPREADSHEET_ID = 'ISI_SPREADSHEET_ID_KAMU'

// ── Sheet Bootstrap ──────────────────────────────────────────
function getSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  return {
    tx:   getOrCreate(ss, 'Transaksi', ['ID','Tanggal','Waktu','Items','Subtotal','PPN','Total','Metode','Kasir']),
    stok: getOrCreate(ss, 'Stok',      ['ID','Nama','Stok']),
    menu: getOrCreate(ss, 'Menu',      ['ID','Nama','Kategori','Harga','Stok','Emoji','Deskripsi']),
  }
}

function getOrCreate(ss, name, headers) {
  let sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    const hRange = sheet.getRange(1, 1, 1, headers.length)
    hRange.setValues([headers])
    hRange.setFontWeight('bold')
         .setBackground('#2B6B4F')
         .setFontColor('#FFFFFF')
    sheet.setFrozenRows(1)
  }
  return sheet
}

// ── POST Handler ─────────────────────────────────────────────
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents)
    const sheets = getSheets()

    // Tambah transaksi baru
    if (body.action === 'addTransaction') {
      sheets.tx.appendRow([
        body.id,
        new Date().toLocaleDateString('id-ID'),
        body.time,
        body.items,
        body.subtotal || 0,
        body.tax      || 0,
        body.total    || 0,
        body.method   || '-',
        body.cashier  || 'Kasir',
      ])
      // Auto-resize kolom
      try { sheets.tx.autoResizeColumns(1, 9) } catch (_) {}
      return respond({ success: true, action: 'addTransaction' })
    }

    // Update stok setelah checkout
    if (body.action === 'updateStock') {
      const data = sheets.stok.getDataRange().getValues()
      const updates = body.updates || []

      updates.forEach(({ id, qty }) => {
        let found = false
        for (let r = 1; r < data.length; r++) {
          if (String(data[r][0]) === String(id)) {
            const newStock = Math.max(0, Number(data[r][2]) - qty)
            sheets.stok.getRange(r + 1, 3).setValue(newStock)
            found = true
            break
          }
        }
        // Kalau item belum ada di sheet Stok, tambahkan
        if (!found) {
          sheets.stok.appendRow([id, body.name || id, Math.max(0, -qty)])
        }
      })
      return respond({ success: true, action: 'updateStock' })
    }

    // Sync seluruh menu ke sheet Menu
    if (body.action === 'syncMenu') {
      const items = body.items || []
      // Clear existing (except header)
      const lastRow = sheets.menu.getLastRow()
      if (lastRow > 1) sheets.menu.getRange(2, 1, lastRow - 1, 7).clearContent()
      // Write all
      items.forEach(item => {
        sheets.menu.appendRow([
          item.id, item.name, item.category,
          item.price, item.stock, item.emoji, item.description || '',
        ])
      })
      return respond({ success: true, action: 'syncMenu', count: items.length })
    }

    return respond({ success: false, error: 'Unknown action: ' + body.action })

  } catch (err) {
    return respond({ success: false, error: err.message })
  }
}

// ── GET Handler ──────────────────────────────────────────────
function doGet(e) {
  const action = (e.parameter || {}).action

  // Health check
  if (!action || action === 'ping') {
    return respond({ success: true, pong: true, timestamp: new Date().toISOString() })
  }

  try {
    const sheets = getSheets()

    if (action === 'getSales') {
      const rows = sheets.tx.getDataRange().getValues()
      // Skip header row, format as objects
      const headers = rows[0]
      const data = rows.slice(1).map(row => {
        const obj = {}
        headers.forEach((h, i) => { obj[h] = row[i] })
        return obj
      })
      return respond({ success: true, data, count: data.length })
    }

    if (action === 'getStock') {
      const rows = sheets.stok.getDataRange().getValues()
      const headers = rows[0]
      const data = rows.slice(1).map(row => {
        const obj = {}
        headers.forEach((h, i) => { obj[h] = row[i] })
        return obj
      })
      return respond({ success: true, data })
    }

    if (action === 'getMenu') {
      const rows = sheets.menu.getDataRange().getValues()
      const headers = rows[0]
      const data = rows.slice(1).map(row => {
        const obj = {}
        headers.forEach((h, i) => { obj[h] = row[i] })
        return obj
      })
      return respond({ success: true, data })
    }

    if (action === 'getSummary') {
      const txRows  = sheets.tx.getDataRange().getValues()
      const txData  = txRows.slice(1)
      const total   = txData.reduce((s, r) => s + (Number(r[6]) || 0), 0)
      const count   = txData.length
      return respond({
        success: true,
        summary: {
          totalRevenue: total,
          txCount:      count,
          avgTx:        count > 0 ? Math.round(total / count) : 0,
          lastUpdated:  new Date().toISOString(),
        },
      })
    }

    return respond({ success: false, error: 'Unknown action: ' + action })

  } catch (err) {
    return respond({ success: false, error: err.message })
  }
}

// ── Helper ───────────────────────────────────────────────────
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}
