# ☕ OODA Kasir — F&B Point of Sale System

Sistem kasir modern untuk bisnis F&B dengan backend Google Sheets dan dashboard analitik berbasis OODA Loop.
versi 2

## Tech Stack

- **Frontend**: React 18 + Vite 5
- **State Management**: Zustand
- **Backend / Database**: Google Sheets via Apps Script Web App
- **Styling**: Pure CSS (no framework)
- **Deploy**: Vercel / Netlify

---

## Fitur

- 🧾 **POS** — Kasir dengan menu grid, cart, dan kalkulasi otomatis
- 💳 **Payment** — Cash (kembalian otomatis), QRIS, Transfer
- 📊 **Dashboard** — OODA Loop: traffic per jam, top items, stok alert
- 📦 **Menu Management** — CRUD menu, monitoring stok real-time
- 🔗 **Google Sheets Sync** — Setiap transaksi tersimpan otomatis
- 📱 **Responsive** — Optimal di tablet kasir

---

## Quick Start

### 1. Install & Jalankan

```bash
# Clone / download project
cd ooda-kasir

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Jalankan dev server
npm run dev
# → Buka http://localhost:3000
```

### 2. Setup Google Sheets (Opsional tapi direkomendasikan)

**a. Buat Spreadsheet**
1. Buka [sheets.google.com](https://sheets.google.com) → Buat spreadsheet baru
2. Beri nama: `OODA Kasir F&B`
3. Copy **Spreadsheet ID** dari URL:
   ```
   docs.google.com/spreadsheets/d/ [SPREADSHEET_ID] /edit
   ```

**b. Deploy Apps Script**
1. Di spreadsheet: **Extensions → Apps Script**
2. Hapus kode default, paste isi file `gas/Code.gs`
3. Ganti `ISI_SPREADSHEET_ID_KAMU` dengan ID dari langkah sebelumnya
4. Klik **Deploy → New deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Klik Deploy → Copy **Web App URL**

**c. Konfigurasi .env**
```bash
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_ID/exec
VITE_BUSINESS_NAME=Nama Bisnis Kamu
VITE_CASHIER_NAME=Kasir 1
```

---

## Deploy ke Vercel

```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "init: ooda kasir"
git remote add origin https://github.com/username/ooda-kasir.git
git push -u origin main

# 2. Import di Vercel
# → vercel.com/new → Import Git Repository

# 3. Tambahkan Environment Variables
# → Project Settings → Environment Variables
# Tambahkan semua isi file .env

# 4. Deploy otomatis setiap push ke main
```

---

## Struktur Project

```
ooda-kasir/
├── gas/
│   └── Code.gs              ← Google Apps Script backend
├── src/
│   ├── data/
│   │   └── menu.js          ← Data menu & mock data
│   ├── lib/
│   │   └── sheets.js        ← Google Sheets API client
│   ├── store/
│   │   └── useStore.js      ← Zustand global state
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx  ← Navigasi utama
│   │   └── pos/
│   │       ├── MenuGrid.jsx     ← Grid menu POS
│   │       ├── CartPanel.jsx    ← Panel keranjang
│   │       └── PaymentModal.jsx ← Modal pembayaran
│   ├── pages/
│   │   ├── POSPage.jsx      ← Halaman kasir
│   │   ├── DashboardPage.jsx← Halaman analitik
│   │   ├── ManagePage.jsx   ← Manajemen menu & stok
│   │   └── SetupPage.jsx    ← Panduan setup
│   ├── App.jsx              ← Root component
│   ├── main.jsx             ← Entry point
│   └── index.css            ← Design system & global styles
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

---

## Google Sheets API Endpoints

| Action | Method | Deskripsi |
|--------|--------|-----------|
| `ping` | GET | Health check |
| `getSales` | GET | Ambil semua transaksi |
| `getStock` | GET | Ambil data stok |
| `getMenu` | GET | Ambil data menu |
| `getSummary` | GET | Ringkasan revenue hari ini |
| `addTransaction` | POST | Simpan transaksi baru |
| `updateStock` | POST | Update stok setelah checkout |
| `syncMenu` | POST | Sinkronisasi semua menu |

---

## OODA Loop dalam Sistem

| Fase | Implementasi |
|------|-------------|
| **Observe** | Google Sheets menerima setiap transaksi real-time |
| **Orient** | Dashboard analisis: traffic per jam, top items, tren |
| **Decide** | Alert stok kritis, rekomendasi restock |
| **Act** | Kasir eksekusi order, inventory update otomatis |

---

## Lisensi

MIT — Bebas digunakan dan dimodifikasi untuk keperluan personal maupun komersial.
