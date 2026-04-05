import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { CATEGORIES } from '../../data/menu.js'

export function MenuGrid() {
  const { menuItems, addToCart, cart } = useStore()
  const [activeCat, setActiveCat] = useState('Semua')
  const [search, setSearch] = useState('')

  const filtered = menuItems.filter(item => {
    const matchCat = activeCat === 'Semua' || item.category === activeCat
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Toolbar */}
      <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)', background:'var(--surface)', flexShrink:0 }}>
        {/* Search */}
        <div style={{ position:'relative', marginBottom:12 }}>
          <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontSize:15 }}>
            ⌕
          </span>
          <input
            className="input"
            style={{ paddingLeft:32 }}
            placeholder="Cari menu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: '5px 14px',
                borderRadius: 99,
                border: '1px solid',
                borderColor: activeCat === cat ? 'var(--accent)' : 'var(--border)',
                background: activeCat === cat ? 'var(--accent)' : 'transparent',
                color: activeCat === cat ? '#fff' : 'var(--text-2)',
                fontSize: 12,
                fontWeight: 500,
                whiteSpace:'nowrap',
                cursor:'pointer',
                transition:'all 150ms ease',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-3)' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:14 }}>Menu tidak ditemukan</div>
          </div>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))',
            gap:12,
          }}>
            {filtered.map((item, i) => {
              const inCart = cart.find(c => c.id === item.id)
              const outOfStock = item.stock <= 0
              return (
                <MenuCard
                  key={item.id}
                  item={item}
                  inCart={inCart}
                  outOfStock={outOfStock}
                  onAdd={() => !outOfStock && addToCart(item)}
                  delay={i * 20}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function MenuCard({ item, inCart, outOfStock, onAdd, delay }) {
  const [pressed, setPressed] = useState(false)

  const handleAdd = () => {
    if (outOfStock) return
    setPressed(true)
    setTimeout(() => setPressed(false), 200)
    onAdd()
  }

  return (
    <div
      onClick={handleAdd}
      className="animate-fadeUp"
      style={{
        animationDelay: `${delay}ms`,
        background: 'var(--surface)',
        border: `1.5px solid ${inCart ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '14px 12px',
        cursor: outOfStock ? 'not-allowed' : 'pointer',
        opacity: outOfStock ? .45 : 1,
        transition: 'all 160ms var(--ease)',
        transform: pressed ? 'scale(.97)' : 'scale(1)',
        boxShadow: inCart ? '0 0 0 3px var(--accent-muted)' : 'var(--shadow-sm)',
        position:'relative',
        userSelect:'none',
      }}
    >
      {/* Cart badge */}
      {inCart && (
        <div style={{
          position:'absolute', top:-7, right:-7,
          width:22, height:22,
          background:'var(--accent)',
          color:'#fff',
          borderRadius:'50%',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:11, fontWeight:700,
          boxShadow:'0 2px 6px rgba(43,107,79,.35)',
          animation:'scaleIn 200ms var(--ease)',
        }}>{inCart.qty}</div>
      )}

      {/* Emoji */}
      <div style={{
        fontSize:30, marginBottom:10,
        width:52, height:52,
        background:'var(--surface-2)',
        borderRadius:'var(--r-md)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {item.emoji}
      </div>

      {/* Info */}
      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', marginBottom:2, lineHeight:1.3 }} className="truncate">
        {item.name}
      </div>
      <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:8 }} className="truncate">
        {item.category}
      </div>

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:14, fontWeight:700, color:'var(--accent)', fontFamily:'var(--font-display)' }}>
          {(item.price / 1000).toFixed(0)}K
        </div>
        <div style={{
          fontSize:10,
          color: item.stock < 10 ? 'var(--red)' : 'var(--text-3)',
          fontWeight: item.stock < 10 ? 600 : 400,
        }}>
          {item.stock} stok
        </div>
      </div>

      {/* Out of stock overlay */}
      {outOfStock && (
        <div style={{
          position:'absolute', inset:0,
          borderRadius:'var(--r-lg)',
          background:'rgba(255,255,255,.6)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <span style={{
            fontSize:11, fontWeight:700, color:'var(--red)',
            background:'var(--red-bg)',
            padding:'3px 10px', borderRadius:99,
          }}>Habis</span>
        </div>
      )}
    </div>
  )
}
