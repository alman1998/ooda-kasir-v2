import { useState } from 'react'
import { testConnection, isConnected } from '../lib/sheets.js'
import { useStore } from '../store/useStore.js'

const GAS_CODE = `// ════════════════════════════════════════
// OODA Kasir — Google Apps Script
// File: Code.gs
// ════════════════════════════════════════

const SPREADSHEET_ID = 'ISI_SPREADSHEET_ID_KAMU'

function getSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  return {
    tx:    getOrCreateSheet(ss, 'Transaksi', ['ID','Tanggal','Waktu','Items','Subtotal','PPN','Total','Metode','Kasir']),
    stok:  getOrCreateSheet(ss, 'Stok',      ['ID','Nama','Stok']),
    menu:  getOrCreateSheet(ss, 'Menu',      ['ID','Nama','Kategori','Harga','Stok','Emoji','Deskripsi']),
  }
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    sheet.appendRow(headers)
    sheet.getRange(1,1,1,headers.length)
         .setFontWeight('bold')
         .setBackground('#2B6B4F')
         .setFontColor('#FFFFFF')
  }
  return sheet
}

// ── Handle POST ──────────────────────────────────────────────
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents)
    const sheets = getSheets()

    if (body.action === 'addTransaction') {
      sheets.tx.appendRow([
        body.id,
        new Date().toLocaleDateString('id-ID'),
        body.time,
        body.items,
        body.subtotal,
        body.tax,
        body.total,
        body.method,
        body.cashier,
      ])
      return ok({ inserted: true })
    }

    if (body.action === 'updateStock') {
      const data  = sheets.stok.getDataRange().getValues()
      body.updates.forEach(({ id, qty }) => {
        for (let r = 1; r < data.length; r++) {
          if (String(data[r][0]) === String(id)) {
            const cur = Number(data[r][2]) || 0
            sheets.stok.getRange(r + 1, 3).setValue(Math.max(0, cur - qty))
            break
          }
        }
      })
      return ok({ updated: true })
    }

    return err('Unknown action')
  } catch (e) {
    return err(e.message)
  }
}

// ── Handle GET ───────────────────────────────────────────────
function doGet(e) {
  const action = (e.parameter || {}).action
  const sheets = getSheets()

  if (action === 'ping') return ok({ pong: true })

  if (action === 'getSales') {
    const rows = sheets.tx.getDataRange().getValues()
    return ok({ rows })
  }

  if (action === 'getStock') {
    const rows = sheets.stok.getDataRange().getValues()
    return ok({ rows })
  }

  return err('Unknown action')
}

// ── Helpers ──────────────────────────────────────────────────
const ok  = (d) => json({ success: true,  ...d })
const err = (m) => json({ success: false, error: m })

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}`

const STEPS = [
  {
    num: '01',
    title: 'Buat Google Spreadsheet',
    color: '#1A5C8A',
    colorBg: '#E0ECFA',
    steps: [
      'Buka sheets.google.com → klik "Spreadsheet Kosong"',
      'Beri nama: OODA Kasir F&B',
      'Copy Spreadsheet ID dari URL:\ndocs.google.com/spreadsheets/d/ [ID DI SINI] /edit',
      'Paste ID tersebut ke variabel SPREADSHEET_ID di kode Apps Script',
    ],
  },
  {
    num: '02',
    title: 'Deploy Google Apps Script',
    color: '#1E5E38',
    colorBg: '#E4F5EC',
    steps: [
      'Di spreadsheet: klik Extensions → Apps Script',
      'Hapus kode default, paste seluruh kode Code.gs di bawah',
      'Klik Deploy → New deployment',
      'Type: Web App | Execute as: Me | Access: Anyone',
      'Klik Deploy → Copy Web App URL',
    ],
  },
  {
    num: '03',
    title: 'Konfigurasi Lokal',
    color: '#825A0A',
    colorBg: '#FDF3DC',
    steps: [
      'Copy file .env.example → buat file .env',
      'Paste Web App URL ke VITE_GAS_URL',
      'Isi VITE_BUSINESS_NAME dengan nama bisnis kamu',
      'Jalankan: npm run dev',
      'Test koneksi dengan tombol di bawah',
    ],
  },
  {
    num: '04',
    title: 'Deploy ke Internet (Vercel)',
    color: '#5A1E6A',
    colorBg: '#F3E8FA',
    steps: [
      'Push project ke GitHub repository',
      'Buka vercel.com → New Project → import repo',
      'Di Environment Variables, tambahkan semua isi .env',
      'Klik Deploy → tunggu build selesai',
      'Aplikasi live! Share URL ke tim kasir',
    ],
  },
]

export function SetupPage() {
  const { showToast } = useStore()
  const [testing, setTesting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(GAS_CODE)
    setCopied(true)
    showToast('✓ Kode berhasil disalin ke clipboard')
    setTimeout(() => setCopied(false), 3000)
  }

  const handleTest = async () => {
    setTesting(true)
    const ok = await testConnection()
    setTesting(false)
    showToast(ok ? '✓ Koneksi ke Google Sheets berhasil!' : 'Koneksi gagal. Cek VITE_GAS_URL di file .env', ok ? 'success' : 'error')
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', maxWidth:860 }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, color:'var(--text-1)' }}>
          Setup &amp; Panduan
        </h1>
        <p style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>
          Hubungkan aplikasi kasir ke Google Sheets sebagai database real-time
        </p>
      </div>

      {/* Status Card */}
      <div className="card" style={{
        padding:'16px 20px', marginBottom:28,
        borderLeft:`4px solid ${isConnected ? 'var(--green)' : 'var(--amber)'}`,
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:16
      }}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{
            width:10, height:10, borderRadius:'50%',
            background: isConnected ? 'var(--green)' : 'var(--amber)',
            boxShadow: `0 0 8px ${isConnected ? 'var(--green)' : 'var(--amber)'}`,
          }} />
          <div>
            <div style={{fontSize:14, fontWeight:600, color:'var(--text-1)'}}>
              {isConnected ? 'Terhubung ke Google Sheets' : 'Mode Demo (Offline)'}
            </div>
            <div style={{fontSize:12, color:'var(--text-3)', marginTop:1}}>
              {isConnected ? 'Data transaksi tersinkronisasi secara real-time' : 'Set VITE_GAS_URL di .env untuk mengaktifkan sinkronisasi'}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost"
          style={{flexShrink:0}}
          onClick={handleTest}
          disabled={testing}
        >
          {testing ? '⏳ Testing…' : '⚡ Test Koneksi'}
        </button>
      </div>

      {/* Step Cards */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:28}}>
        {STEPS.map(s => (
          <div key={s.num} className="card animate-fadeUp" style={{
            padding:'20px',
            borderTop:`3px solid ${s.color}`,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
              <span style={{
                fontSize:11, fontWeight:800, letterSpacing:'.08em',
                background: s.colorBg, color: s.color,
                padding:'3px 10px', borderRadius:99,
              }}>STEP {s.num}</span>
              <span style={{fontSize:13, fontWeight:600, color:'var(--text-1)'}}>{s.title}</span>
            </div>
            {s.steps.map((line, i) => (
              <div key={i} style={{display:'flex', gap:8, marginBottom:7}}>
                <span style={{color: s.color, fontSize:12, marginTop:1, flexShrink:0}}>›</span>
                <span style={{fontSize:12, color:'var(--text-2)', lineHeight:1.5, whiteSpace:'pre-line'}}>{line}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Code Block */}
      <div className="card" style={{overflow:'hidden', marginBottom:28}}>
        <div style={{
          padding:'14px 20px',
          background:'var(--surface-2)',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{display:'flex', gap:5}}>
              {['#FF5F57','#FEBC2E','#28C840'].map(c => (
                <div key={c} style={{width:11, height:11, borderRadius:'50%', background:c}} />
              ))}
            </div>
            <span style={{fontSize:12, fontWeight:600, color:'var(--text-2)'}}>gas/Code.gs</span>
          </div>
          <button
            className="btn btn-ghost"
            style={{padding:'5px 12px', fontSize:12}}
            onClick={handleCopy}
          >
            {copied ? '✓ Tersalin' : '⎘ Copy Kode'}
          </button>
        </div>
        <pre style={{
          padding:'20px', margin:0,
          fontSize:12, lineHeight:1.8,
          color:'var(--text-2)',
          overflowX:'auto',
          fontFamily:"'Courier New', 'Consolas', monospace",
          background: '#FAFAF8',
          maxHeight:420,
          overflowY:'auto',
        }}>
          <code style={{color:'var(--accent-text)'}}>{GAS_CODE}</code>
        </pre>
      </div>

      {/* Struktur Spreadsheet */}
      <div className="card" style={{padding:'20px', marginBottom:28}}>
        <h3 style={{fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, marginBottom:16, color:'var(--text-1)'}}>
          Struktur Google Sheets
        </h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14}}>
          {[
            { name:'Transaksi', color:'var(--green)',  cols:['ID','Tanggal','Waktu','Items','Subtotal','PPN','Total','Metode','Kasir'] },
            { name:'Stok',      color:'var(--blue)',   cols:['ID','Nama','Stok'] },
            { name:'Menu',      color:'var(--accent)', cols:['ID','Nama','Kategori','Harga','Stok','Emoji','Deskripsi'] },
          ].map(s => (
            <div key={s.name} style={{background:'var(--surface-2)', borderRadius:'var(--r-md)', padding:'14px', border:'1px solid var(--border)'}}>
              <div style={{fontSize:12, fontWeight:700, color:s.color, marginBottom:10}}>
                📄 Sheet: {s.name}
              </div>
              {s.cols.map((c,i) => (
                <div key={i} style={{fontSize:11, color:'var(--text-2)', padding:'3px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:6}}>
                  <span style={{color:'var(--text-3)', fontVariantNumeric:'tabular-nums', fontSize:10}}>{String(i+1).padStart(2,'0')}</span>
                  {c}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="card" style={{padding:'20px', borderLeft:'4px solid var(--accent)'}}>
        <h3 style={{fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, marginBottom:12, color:'var(--text-1)'}}>
          ⚡ Quick Start (Local)
        </h3>
        <pre style={{
          background:'var(--sidebar-bg)',
          color:'#86EFAC',
          padding:'16px 18px',
          borderRadius:'var(--r-md)',
          fontSize:12, lineHeight:2,
          fontFamily:"'Courier New', monospace",
          overflowX:'auto',
        }}>{`# 1. Clone / download project
cd ooda-kasir

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# → Edit .env: isi VITE_GAS_URL

# 4. Jalankan development server
npm run dev
# → Buka http://localhost:3000

# 5. Build untuk production
npm run build
npm run preview`}</pre>
      </div>
    </div>
  )
}
