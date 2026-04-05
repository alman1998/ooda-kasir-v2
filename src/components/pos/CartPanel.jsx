import { useStore } from '../../store/useStore.js'
import { fmtRp } from '../../data/menu.js'

export function CartPanel({ onCheckout }) {
  const { cart, setQty, clearCart } = useStore()

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const tax      = Math.round(subtotal * 0.11)
  const total    = subtotal + tax

  return (
    <div style={{
      width: 320,
      flexShrink: 0,
      borderLeft: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, color:'var(--text-1)' }}>
              Pesanan
            </h2>
            <p style={{ fontSize:12, color:'var(--text-3)', marginTop:1 }}>
              {cart.length === 0 ? 'Belum ada item' : `${cart.length} jenis item`}
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              style={{
                fontSize:11, color:'var(--text-3)', background:'none',
                border:'1px solid var(--border)', borderRadius:6,
                padding:'4px 10px', cursor:'pointer',
              }}
            >Hapus semua</button>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text-3)' }}>
            <div style={{ fontSize:40, marginBottom:12, opacity:.5 }}>🛒</div>
            <div style={{ fontSize:13 }}>Tap item di menu<br/>untuk menambahkan</div>
          </div>
        ) : (
          cart.map(item => (
            <CartItem key={item.id} item={item} setQty={setQty} />
          ))
        )}
      </div>

      {/* Summary */}
      {cart.length > 0 && (
        <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-2)', marginBottom:6 }}>
            <span>Subtotal</span>
            <span className="mono">{fmtRp(subtotal)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-2)', marginBottom:14 }}>
            <span>PPN 11%</span>
            <span className="mono">{fmtRp(tax)}</span>
          </div>
          <div style={{ height:1, background:'var(--border)', marginBottom:14 }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>Total</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--accent)' }} className="mono">
              {fmtRp(total)}
            </span>
          </div>
          <button
            className="btn btn-primary"
            style={{ width:'100%', padding:'13px 0', fontSize:14, borderRadius:'var(--r-md)', gap:8 }}
            onClick={() => onCheckout(total, subtotal, tax)}
          >
            Bayar Sekarang
            <span style={{ opacity:.8 }}>→</span>
          </button>
        </div>
      )}
    </div>
  )
}

function CartItem({ item, setQty }) {
  return (
    <div
      className="animate-slideRight"
      style={{
        display:'flex',
        alignItems:'center',
        gap:12,
        padding:'10px 20px',
        transition:'background 150ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width:36, height:36,
        background:'var(--surface-2)',
        borderRadius:8,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:18, flexShrink:0,
      }}>{item.emoji}</div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text-1)' }} className="truncate">{item.name}</div>
        <div style={{ fontSize:12, color:'var(--text-3)', fontFamily:'var(--font-display)' }}>
          {fmtRp(item.price)} × {item.qty}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', fontFamily:'var(--font-display)' }} className="mono">
          {fmtRp(item.price * item.qty)}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <QtyBtn onClick={() => setQty(item.id, item.qty - 1)} label="−" />
          <span style={{ fontSize:13, fontWeight:600, minWidth:20, textAlign:'center' }}>{item.qty}</span>
          <QtyBtn onClick={() => setQty(item.id, item.qty + 1)} label="+" />
        </div>
      </div>
    </div>
  )
}

function QtyBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        width:22, height:22, borderRadius:6,
        border:'1px solid var(--border)',
        background:'var(--surface)',
        color:'var(--text-2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:14, fontWeight:600,
        cursor:'pointer',
        transition:'all 120ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.color='var(--text-2)'; e.currentTarget.style.borderColor='var(--border)' }}
    >{label}</button>
  )
}
