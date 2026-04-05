import { useState } from 'react'
import { MenuGrid } from '../components/pos/MenuGrid.jsx'
import { CartPanel } from '../components/pos/CartPanel.jsx'
import { PaymentModal } from '../components/pos/PaymentModal.jsx'

export function POSPage() {
  const [payState, setPayState] = useState(null) // { total, subtotal, tax }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Page Header */}
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, color:'var(--text-1)' }}>
            Point of Sale
          </h1>
          <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
            {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <MenuGrid />
      </div>

      <CartPanel onCheckout={(total, subtotal, tax) => setPayState({ total, subtotal, tax })} />

      {payState && (
        <PaymentModal
          {...payState}
          onClose={() => setPayState(null)}
        />
      )}
    </div>
  )
}
