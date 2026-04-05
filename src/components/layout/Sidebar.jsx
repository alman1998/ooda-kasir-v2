import { useStore } from '../../store/useStore.js'
import { isConnected } from '../../lib/sheets.js'
import { useState, useEffect } from 'react'

const businessName = import.meta.env.VITE_BUSINESS_NAME || 'OODA Kasir'

const NAV = [
  { id: 'pos',       icon: '⊞',  label: 'Point of Sale' },
  { id: 'dashboard', icon: '◈',  label: 'Dashboard'     },
  { id: 'manage',    icon: '≡',  label: 'Menu & Stok'   },
  { id: 'setup',     icon: '◎',  label: 'Setup & Panduan'},
]

export function Sidebar() {
  const { activePage, setPage, getLowStockItems } = useStore()
  const lowStockItems = getLowStockItems()
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--accent)',
            borderRadius: 9,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 16,
          }}>☕</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 600,
              color: '#F5EDE4',
              letterSpacing: '.01em',
            }}>{businessName}</div>
            <div style={{ fontSize: 10, color: 'var(--sidebar-text)', letterSpacing: '.08em', textTransform:'uppercase', marginTop:1 }}>
              F&amp;B System
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ padding:'12px 10px', flex:1 }}>
        <div style={{ fontSize:10, color:'rgba(168,157,148,.4)', letterSpacing:'.1em', textTransform:'uppercase', padding:'8px 10px 6px', fontWeight:600 }}>
          Menu
        </div>
        {NAV.map((item) => {
          const active = activePage === item.id
          const hasBadge = item.id === 'manage' && lowStockItems.length > 0
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px',
                borderRadius: 8,
                border: 'none',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--sidebar-text)',
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                transition: 'all 150ms ease',
                marginBottom: 2,
                textAlign:'left',
                cursor:'pointer',
                position:'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)'; e.currentTarget.style.color = '#F5EDE4' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; if (!active) e.currentTarget.style.color = 'var(--sidebar-text)' }}
            >
              <span style={{ fontSize:16, lineHeight:1, opacity: active ? 1 : .7 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {hasBadge && (
                <span style={{
                  fontSize:10, fontWeight:700,
                  background:'var(--red)',
                  color:'#fff',
                  borderRadius:99,
                  padding:'1px 6px',
                  minWidth:18,
                  textAlign:'center',
                }}>
                  {lowStockItems.length}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,.06)' }}>
        {/* Connection status */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
          <div style={{
            width: 7, height: 7, borderRadius:'50%',
            background: isConnected ? 'var(--green)' : 'var(--amber)',
            boxShadow: isConnected ? '0 0 6px var(--green)' : '0 0 6px var(--amber)',
          }} />
          <span style={{ fontSize:11, color:'var(--sidebar-text)' }}>
            {isConnected ? 'Terhubung ke Sheets' : 'Mode Demo'}
          </span>
        </div>
        {/* Clock */}
        <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'#F5EDE4', letterSpacing:'-.01em', fontVariantNumeric:'tabular-nums' }}>
          {time}
        </div>
        <div style={{ fontSize:11, color:'var(--sidebar-text)', marginTop:2 }}>
          {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' })}
        </div>
      </div>
    </aside>
  )
}
