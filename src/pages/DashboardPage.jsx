import { useStore } from '../store/useStore.js'
import { fmtRp } from '../data/menu.js'

// ── Hitung traffic per jam dari data transaksi nyata ─────────────────────────
function buildHourlyTraffic(transactions) {
  const counts = Array(24).fill(0)
  transactions.forEach(tx => {
    // format time: "HH:MM"
    const hour = parseInt((tx.time || '00:00').split(':')[0], 10)
    if (hour >= 0 && hour < 24) counts[hour]++
  })
  return counts
}

// ── Hitung top items dari string items di transaksi ──────────────────────────
// Format items: "Es Kopi Susu x2, Nasi Goreng x1"
function buildTopItems(transactions, menuItems) {
  const tally = {} // { name: { sold, revenue } }

  transactions.forEach(tx => {
    const parts = (tx.items || '').split(',')
    parts.forEach(part => {
      const match = part.trim().match(/^(.+)\s+x(\d+)$/)
      if (!match) return
      const name = match[1].trim()
      const qty  = parseInt(match[2], 10) || 1
      const menuItem = menuItems.find(m => m.name === name)
      const price = menuItem ? menuItem.price : 0

      if (!tally[name]) tally[name] = { name, sold: 0, revenue: 0, emoji: menuItem?.emoji || '🍽️' }
      tally[name].sold    += qty
      tally[name].revenue += qty * price
    })
  })

  return Object.values(tally)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
}

// ── Hitung split metode pembayaran ───────────────────────────────────────────
function buildMethodSplit(transactions) {
  const split = {}
  transactions.forEach(tx => {
    split[tx.method] = (split[tx.method] || 0) + 1
  })
  return split
}

const OODA_CONFIGS = [
  { label:'OBSERVE', icon:'◉', title:'Realtime Monitor',  color:'#1A5C8A', colorBg:'#E0ECFA', desc:'Transaksi hari ini' },
  { label:'ORIENT',  icon:'◈', title:'Analisis Pola',     color:'#825A0A', colorBg:'#FDF3DC', desc:'Rata-rata per transaksi' },
  { label:'DECIDE',  icon:'◇', title:'Alert & Keputusan', color:'#8C2828', colorBg:'#FDEAEA', desc:'Item perlu restock' },
  { label:'ACT',     icon:'◆', title:'Total Pendapatan',  color:'#1E5E38', colorBg:'#E4F5EC', desc:'Akumulasi hari ini' },
]

export function DashboardPage() {
  const { transactions, todayRevenue, menuItems, getTxCount, getAvgTx, getLowStockItems } = useStore()

  // ── Semua computed dari data nyata ──────────────────────────────────────
  const txCount       = getTxCount()
  const avgTx         = getAvgTx()
  const lowStockItems = getLowStockItems()

  const hourlyTraffic = buildHourlyTraffic(transactions)
  const topItems      = buildTopItems(transactions, menuItems)
  const methodSplit   = buildMethodSplit(transactions)

  const maxTraffic    = Math.max(...hourlyTraffic, 1)
  const hour          = new Date().getHours()

  // Jam dengan traffic tertinggi
  const peakHour  = hourlyTraffic.indexOf(Math.max(...hourlyTraffic))
  const peakCount = hourlyTraffic[peakHour]

  // Stok rendah untuk ditampilkan (urut dari paling kritis)
  const stockWarnings = [...menuItems]
    .sort((a, b) => a.stock - b.stock)
    .filter(m => m.stock < 20)
    .slice(0, 6)

  const maxStock = Math.max(...menuItems.map(m => m.stock), 1)

  const oodaValues = [
    `${txCount} transaksi`,
    fmtRp(avgTx) + ' /tx',
    `${lowStockItems.length} item kritis`,
    fmtRp(todayRevenue),
  ]

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
      {/* Title */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, color:'var(--text-1)' }}>
          Dashboard
        </h1>
        <p style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>
          OODA Loop — data diperbarui otomatis setiap transaksi
        </p>
      </div>

      {/* ── OODA Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {OODA_CONFIGS.map((cfg, i) => (
          <div
            key={cfg.label}
            className="card animate-fadeUp"
            style={{ padding:'18px', animationDelay:`${i*60}ms`, borderTop:`3px solid ${cfg.color}` }}
          >
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{
                fontSize:11, fontWeight:700, letterSpacing:'.1em',
                color:cfg.color, background:cfg.colorBg,
                padding:'3px 8px', borderRadius:99,
              }}>{cfg.label}</span>
              <span style={{ fontSize:18, color:cfg.color, opacity:.5 }}>{cfg.icon}</span>
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text-1)', marginBottom:3 }}>
              {oodaValues[i]}
            </div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:2 }}>{cfg.title}</div>
            <div style={{ fontSize:11, color:'var(--text-3)' }}>{cfg.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Row 2 ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:14, marginBottom:14 }}>

        {/* Traffic per Jam — dihitung dari transaksi nyata */}
        <div className="card animate-fadeUp" style={{ padding:'20px', animationDelay:'240ms' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'var(--text-1)' }}>
                Traffic per Jam
              </h3>
              <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
                {transactions.length} transaksi tercatat hari ini
              </p>
            </div>
            <span className="badge badge-accent">Live</span>
          </div>

          <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:100, marginBottom:6 }}>
            {hourlyTraffic.map((v, i) => {
              const isNow = i === hour
              const barH  = Math.max(2, (v / maxTraffic) * 94)
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                  {isNow && v > 0 && (
                    <div style={{
                      position:'absolute', top: -(barH + 18), left:'50%', transform:'translateX(-50%)',
                      fontSize:9, fontWeight:700, color:'var(--accent)',
                      background:'var(--accent-muted)',
                      padding:'1px 5px', borderRadius:4, whiteSpace:'nowrap',
                    }}>{v}tx</div>
                  )}
                  <div
                    title={`${i}:00 — ${v} transaksi`}
                    style={{
                      width:'100%', height:barH,
                      background: isNow ? 'var(--accent)' : v > 0 ? 'var(--accent-muted)' : 'var(--surface-3)',
                      borderRadius:'3px 3px 0 0',
                      transition:'height .5s ease',
                      cursor: v > 0 ? 'default' : 'default',
                    }}
                  />
                  {i % 6 === 0 && (
                    <div style={{ fontSize:9, color:'var(--text-3)', marginTop:4 }}>{i}:00</div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop:10, fontSize:12, color:'var(--text-3)', display:'flex', gap:16 }}>
            {peakCount > 0
              ? <span>Peak: <strong style={{color:'var(--text-1)'}}>{peakHour}:00–{peakHour+1}:00</strong> · {peakCount} transaksi</span>
              : <span>Belum ada transaksi hari ini</span>
            }
            <span style={{ color:'var(--accent)', fontWeight:500 }}>
              ■ Jam ini: {hourlyTraffic[hour]} tx
            </span>
          </div>
        </div>

        {/* Top Items — dari transaksi nyata */}
        <div className="card animate-fadeUp" style={{ padding:'20px', animationDelay:'300ms' }}>
          <div style={{ marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'var(--text-1)' }}>
              Item Terlaris
            </h3>
            <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>Berdasarkan transaksi masuk</p>
          </div>

          {topItems.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-3)', fontSize:12 }}>
              <div style={{ fontSize:28, marginBottom:8, opacity:.4 }}>📊</div>
              Data muncul setelah ada transaksi
            </div>
          ) : (
            topItems.map((item, i) => {
              const maxSold = topItems[0].sold || 1
              return (
                <div key={item.name} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:12, color:'var(--text-1)', fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14 }}>{item.emoji}</span>
                      <span className="truncate" style={{ maxWidth:100 }}>{item.name}</span>
                    </span>
                    <span style={{ fontSize:11, color:'var(--text-3)', whiteSpace:'nowrap' }}>{item.sold}x</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:5, background:'var(--surface-3)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{
                        width:`${(item.sold / maxSold) * 100}%`,
                        height:'100%',
                        background: i === 0 ? 'var(--accent)' : 'var(--accent-muted)',
                        borderRadius:99, transition:'width .6s ease',
                      }} />
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-2)', minWidth:68, textAlign:'right', fontFamily:'var(--font-display)' }}>
                      {fmtRp(item.revenue)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Row 3 ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Status Stok — live dari menuItems */}
        <div className="card animate-fadeUp" style={{ padding:'20px', animationDelay:'360ms' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'var(--text-1)' }}>
                Status Stok
              </h3>
              <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
                {stockWarnings.length} item stok rendah
              </p>
            </div>
            {lowStockItems.length === 0
              ? <span className="badge badge-green">✓ Semua aman</span>
              : <span className="badge badge-red">{lowStockItems.length} kritis</span>
            }
          </div>

          {stockWarnings.length === 0 ? (
            <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-3)', fontSize:12 }}>
              <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
              Semua item stok cukup
            </div>
          ) : (
            stockWarnings.map(item => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:18, width:26, textAlign:'center', flexShrink:0 }}>{item.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--text-1)' }} className="truncate">{item.name}</div>
                  <div style={{ marginTop:3, height:4, background:'var(--surface-3)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{
                      width:`${Math.max(2, (item.stock / maxStock) * 100)}%`,
                      height:'100%',
                      background: item.stock === 0 ? 'var(--red)' : item.stock < 5 ? 'var(--red)' : item.stock < 10 ? 'var(--amber)' : 'var(--green)',
                      borderRadius:99, transition:'width .4s ease',
                    }} />
                  </div>
                </div>
                <span style={{
                  fontSize:12, fontWeight:700, minWidth:28, textAlign:'right', flexShrink:0,
                  color: item.stock === 0 ? 'var(--red)' : item.stock < 5 ? 'var(--red)' : item.stock < 10 ? 'var(--amber)' : 'var(--text-2)',
                }}>{item.stock}</span>
              </div>
            ))
          )}
        </div>

        {/* Transaksi Terakhir + Metode Bayar */}
        <div className="card animate-fadeUp" style={{ animationDelay:'420ms', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {/* Metode split */}
          <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)', display:'flex', gap:10 }}>
            {Object.entries(methodSplit).length === 0
              ? <span style={{ fontSize:12, color:'var(--text-3)' }}>Belum ada transaksi</span>
              : Object.entries(methodSplit).map(([method, count]) => (
                  <div key={method} style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text-1)' }}>{count}</div>
                    <span className={`badge ${method==='QRIS' ? 'badge-accent' : method==='Transfer' ? 'badge-gray' : 'badge-green'}`}>
                      {method}
                    </span>
                  </div>
                ))
            }
            <div style={{ marginLeft:'auto', textAlign:'right' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--accent)' }}>
                {fmtRp(todayRevenue)}
              </div>
              <div style={{ fontSize:11, color:'var(--text-3)' }}>Total hari ini</div>
            </div>
          </div>

          {/* Tabel transaksi */}
          <div style={{ overflowY:'auto', flex:1 }}>
            {transactions.length === 0 ? (
              <div style={{ textAlign:'center', padding:'28px 0', color:'var(--text-3)', fontSize:12 }}>
                <div style={{ fontSize:28, marginBottom:8, opacity:.4 }}>🧾</div>
                Lakukan checkout untuk melihat data
              </div>
            ) : (
              <table className="table" style={{ fontSize:13 }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Waktu</th>
                    <th style={{ textAlign:'right' }}>Total</th>
                    <th>Metode</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight:600, fontSize:11, color:'var(--text-2)', fontVariantNumeric:'tabular-nums' }}>{tx.id}</td>
                      <td style={{ color:'var(--text-3)' }}>{tx.time}</td>
                      <td style={{ textAlign:'right', fontFamily:'var(--font-display)', fontWeight:600, color:'var(--text-1)' }}>
                        {fmtRp(tx.total)}
                      </td>
                      <td>
                        <span className={`badge ${tx.method==='QRIS' ? 'badge-accent' : tx.method==='Transfer' ? 'badge-gray' : 'badge-green'}`}>
                          {tx.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
