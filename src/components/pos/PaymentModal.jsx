import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { fmtRp } from '../../data/menu.js'

const METHODS = ['Cash', 'QRIS', 'Transfer']
const QUICK_AMOUNTS = [20000, 50000, 100000]

export function PaymentModal({ total, subtotal, tax, onClose }) {
  const { checkout, txLoading, cart } = useStore()
  const [method, setMethod] = useState('Cash')
  const [cashInput, setCashInput] = useState('')
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState('')

  const cashNum   = parseInt(cashInput.replace(/\D/g, '')) || 0
  const change    = cashNum - total
  const cashValid = method !== 'Cash' || cashNum >= total

  const handleConfirm = async () => {
    if (!cashValid || txLoading) return
    try {
      const order = await checkout(method)
      setOrderId(order.id)
      setDone(true)
    } catch {}
  }

  if (done) {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign:'center', padding:'40px 36px' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text-1)', marginBottom:6 }}>
            Pembayaran Berhasil
          </h2>
          <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:20 }}>{orderId}</p>
          <div style={{ fontSize:28, fontFamily:'var(--font-display)', fontWeight:700, color:'var(--accent)', marginBottom:8 }}>
            {fmtRp(total)}
          </div>
          <div className="badge badge-green" style={{ margin:'0 auto 28px' }}>{method}</div>
          {method === 'Cash' && change > 0 && (
            <div style={{ background:'var(--green-bg)', border:'1px solid var(--green)', borderRadius:'var(--r-md)', padding:'12px 20px', marginBottom:24 }}>
              <div style={{ fontSize:12, color:'var(--green)', marginBottom:2 }}>Kembalian</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--green)' }}>{fmtRp(change)}</div>
            </div>
          )}
          <button className="btn btn-primary" style={{ width:'100%' }} onClick={onClose}>
            Transaksi Baru
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:'24px 28px 20px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, color:'var(--text-1)' }}>
              Pembayaran
            </h2>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-3)', fontSize:20, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>
        </div>

        <div style={{ padding:'20px 28px' }}>
          {/* Order Summary */}
          <div style={{ background:'var(--surface-2)', borderRadius:'var(--r-md)', padding:'14px 16px', marginBottom:20 }}>
            {cart.map(c => (
              <div key={c.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-2)', marginBottom:4 }}>
                <span className="truncate" style={{ flex:1, marginRight:8 }}>{c.name} × {c.qty}</span>
                <span className="mono">{fmtRp(c.price * c.qty)}</span>
              </div>
            ))}
            <div style={{ height:1, background:'var(--border)', margin:'10px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginBottom:4 }}>
              <span>PPN 11%</span>
              <span className="mono">{fmtRp(tax)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <span style={{ fontWeight:600, fontSize:13 }}>Total</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--accent)' }} className="mono">
                {fmtRp(total)}
              </span>
            </div>
          </div>

          {/* Method Tabs */}
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            {METHODS.map(m => (
              <button
                key={m}
                onClick={() => { setMethod(m); setCashInput('') }}
                style={{
                  flex:1,
                  padding:'9px 0',
                  borderRadius:'var(--r-md)',
                  border:'1.5px solid',
                  borderColor: method === m ? 'var(--accent)' : 'var(--border)',
                  background: method === m ? 'var(--accent-muted)' : 'transparent',
                  color: method === m ? 'var(--accent-text)' : 'var(--text-2)',
                  fontSize:13, fontWeight:600,
                  cursor:'pointer',
                  transition:'all 150ms ease',
                }}
              >{m}</button>
            ))}
          </div>

          {/* Cash Input */}
          {method === 'Cash' && (
            <div style={{ marginBottom:20, animation:'fadeUp 200ms ease' }}>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6 }}>
                Uang Diterima
              </label>
              <input
                className="input mono"
                placeholder="0"
                value={cashInput ? 'Rp ' + parseInt(cashInput.replace(/\D/g,'')||0).toLocaleString('id-ID') : ''}
                onChange={e => setCashInput(e.target.value.replace(/\D/g,''))}
                style={{ fontSize:16, fontWeight:600 }}
                autoFocus
              />
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                {[...QUICK_AMOUNTS, total + 1000].map((v,i) => (
                  <button
                    key={i}
                    onClick={() => setCashInput(v.toString())}
                    style={{
                      flex:1, padding:'6px 4px',
                      background:'var(--surface-2)',
                      border:'1px solid var(--border)',
                      borderRadius:6, fontSize:10,
                      color:'var(--text-2)', cursor:'pointer',
                    }}
                  >
                    {v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}
                  </button>
                ))}
              </div>
              {cashNum >= total && (
                <div style={{
                  marginTop:10,
                  padding:'10px 14px',
                  background:'var(--green-bg)',
                  border:'1px solid rgba(31,122,74,.2)',
                  borderRadius:'var(--r-md)',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                }}>
                  <span style={{ fontSize:12, color:'var(--green)', fontWeight:500 }}>Kembalian</span>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--green)' }} className="mono">
                    {fmtRp(change)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* QRIS */}
          {method === 'QRIS' && (
            <div style={{ textAlign:'center', marginBottom:20, animation:'fadeUp 200ms ease' }}>
              <div style={{
                width:160, height:160,
                background:'var(--surface-2)',
                border:'2px dashed var(--border)',
                borderRadius:'var(--r-lg)',
                margin:'0 auto 12px',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexDirection:'column', gap:8,
              }}>
                <span style={{ fontSize:40 }}>📱</span>
                <span style={{ fontSize:11, color:'var(--text-3)' }}>QR Code di sini</span>
              </div>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>Scan QR dengan aplikasi pembayaran</p>
            </div>
          )}

          {/* Transfer */}
          {method === 'Transfer' && (
            <div style={{ marginBottom:20, animation:'fadeUp 200ms ease', background:'var(--blue-bg)', borderRadius:'var(--r-md)', padding:'14px 16px', border:'1px solid rgba(34,96,160,.15)' }}>
              <div style={{ fontSize:12, color:'var(--blue)', fontWeight:600, marginBottom:8 }}>Rekening Tujuan</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text-1)', marginBottom:2 }}>BCA — 1234567890</div>
              <div style={{ fontSize:13, color:'var(--text-2)' }}>a.n. {import.meta.env.VITE_BUSINESS_NAME || 'Kafe Senja'}</div>
              <div style={{ marginTop:10, fontSize:12, color:'var(--text-3)' }}>Nominal tepat: <strong style={{color:'var(--text-1)'}}>{fmtRp(total)}</strong></div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            className="btn btn-primary"
            style={{ width:'100%', padding:'13px 0', opacity: cashValid ? 1 : .5, cursor: cashValid ? 'pointer' : 'not-allowed' }}
            onClick={handleConfirm}
            disabled={!cashValid || txLoading}
          >
            {txLoading ? '⏳ Memproses…' : `✓ Konfirmasi ${method}`}
          </button>
        </div>
      </div>
    </div>
  )
}
