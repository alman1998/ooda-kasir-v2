import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { CATEGORIES, fmtRp } from '../data/menu.js'

const EMPTY_FORM = { name:'', category:'Minuman', price:'', stock:'', emoji:'🍽️', description:'' }

export function ManagePage() {
  const { menuItems, updateMenuItem, addMenuItem, deleteMenuItem, showToast, getLowStockItems } = useStore()
  const lowStockItems = getLowStockItems()
  const [editItem, setEditItem] = useState(null)  // null = closed, {} = new, item = edit
  const [filterCat, setFilterCat] = useState('Semua')
  const [search, setSearch] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const filtered = menuItems.filter(m => {
    const mc = filterCat === 'Semua' || m.category === filterCat
    const ms = m.name.toLowerCase().includes(search.toLowerCase())
    return mc && ms
  })

  const handleSave = (form) => {
    if (!form.name || !form.price || !form.stock) {
      showToast('Nama, harga, dan stok wajib diisi', 'error')
      return
    }
    const item = {
      ...form,
      price: parseInt(form.price) || 0,
      stock: parseInt(form.stock) || 0,
    }
    if (form.id) {
      updateMenuItem(item)
      showToast(`✓ ${item.name} berhasil diperbarui`)
    } else {
      addMenuItem(item)
      showToast(`✓ ${item.name} berhasil ditambahkan`)
    }
    setEditItem(null)
  }

  const handleDelete = (item) => {
    deleteMenuItem(item.id)
    setConfirmDel(null)
    showToast(`${item.name} dihapus`)
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, color:'var(--text-1)' }}>
            Menu &amp; Stok
          </h1>
          <p style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>
            {menuItems.length} item terdaftar · {lowStockItems.length} stok kritis
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setEditItem(EMPTY_FORM)}
          style={{ flexShrink:0 }}
        >
          + Tambah Item
        </button>
      </div>

      {/* Filter row */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200, position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }}>⌕</span>
          <input className="input" style={{ paddingLeft:30 }} placeholder="Cari item…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={()=>setFilterCat(c)}
              style={{
                padding:'8px 14px', borderRadius:8, border:'1px solid',
                borderColor: filterCat===c ? 'var(--accent)' : 'var(--border)',
                background: filterCat===c ? 'var(--accent-muted)' : 'transparent',
                color: filterCat===c ? 'var(--accent-text)' : 'var(--text-2)',
                fontSize:12, fontWeight:500, cursor:'pointer',
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{width:40}}>—</th>
                <th>Nama Item</th>
                <th>Kategori</th>
                <th style={{textAlign:'right'}}>Harga</th>
                <th style={{textAlign:'center'}}>Stok</th>
                <th style={{textAlign:'center'}}>Status</th>
                <th style={{textAlign:'right'}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td style={{fontSize:20, textAlign:'center'}}>{item.emoji}</td>
                  <td>
                    <div style={{fontWeight:500}}>{item.name}</div>
                    <div style={{fontSize:11, color:'var(--text-3)', marginTop:1}} className="truncate">{item.description}</div>
                  </td>
                  <td>
                    <span className="badge badge-gray">{item.category}</span>
                  </td>
                  <td style={{textAlign:'right', fontFamily:'var(--font-display)', fontWeight:600}}>
                    {fmtRp(item.price)}
                  </td>
                  <td style={{textAlign:'center'}}>
                    <span style={{
                      fontWeight:700, fontSize:14,
                      color: item.stock===0 ? 'var(--red)' : item.stock<10 ? 'var(--amber)' : 'var(--green)',
                    }}>{item.stock}</span>
                  </td>
                  <td style={{textAlign:'center'}}>
                    {item.stock === 0
                      ? <span className="badge badge-red">Habis</span>
                      : item.stock < 10
                      ? <span className="badge badge-amber">Kritis</span>
                      : <span className="badge badge-green">Tersedia</span>
                    }
                  </td>
                  <td style={{textAlign:'right'}}>
                    <div style={{display:'flex', gap:6, justifyContent:'flex-end'}}>
                      <button
                        className="btn btn-ghost"
                        style={{padding:'5px 12px', fontSize:12}}
                        onClick={()=>setEditItem({...item, price:item.price.toString(), stock:item.stock.toString()})}
                      >Edit</button>
                      <button
                        className="btn btn-danger"
                        style={{padding:'5px 12px', fontSize:12}}
                        onClick={()=>setConfirmDel(item)}
                      >Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editItem !== null && (
        <ItemFormModal
          initial={editItem}
          onSave={handleSave}
          onClose={()=>setEditItem(null)}
        />
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div className="overlay" onClick={()=>setConfirmDel(null)}>
          <div className="modal" style={{maxWidth:360, padding:'28px'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:32, marginBottom:12, textAlign:'center'}}>{confirmDel.emoji}</div>
            <h3 style={{fontFamily:'var(--font-display)', fontSize:18, textAlign:'center', marginBottom:8}}>Hapus item ini?</h3>
            <p style={{fontSize:13, color:'var(--text-3)', textAlign:'center', marginBottom:24}}>
              <strong>{confirmDel.name}</strong> akan dihapus permanen.
            </p>
            <div style={{display:'flex', gap:8}}>
              <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setConfirmDel(null)}>Batal</button>
              <button className="btn btn-danger" style={{flex:1}} onClick={()=>handleDelete(confirmDel)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ItemFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isEdit = Boolean(form.id)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{padding:'24px 28px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600}}>
            {isEdit ? 'Edit Item' : 'Tambah Item Baru'}
          </h2>
          <button onClick={onClose} style={{background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text-3)', lineHeight:1}}>×</button>
        </div>
        <div style={{padding:'20px 28px 24px'}}>
          <div style={{display:'grid', gridTemplateColumns:'60px 1fr', gap:12, marginBottom:12}}>
            <div>
              <label style={{fontSize:12, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6}}>Emoji</label>
              <input className="input" style={{textAlign:'center', fontSize:24, padding:'6px'}} value={form.emoji} onChange={e=>set('emoji',e.target.value)} />
            </div>
            <div>
              <label style={{fontSize:12, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6}}>Nama Item <span style={{color:'var(--red)'}}>*</span></label>
              <input className="input" placeholder="Nama menu" value={form.name} onChange={e=>set('name',e.target.value)} />
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
            <div>
              <label style={{fontSize:12, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6}}>Harga (Rp) <span style={{color:'var(--red)'}}>*</span></label>
              <input className="input" type="number" placeholder="0" value={form.price} onChange={e=>set('price',e.target.value)} />
            </div>
            <div>
              <label style={{fontSize:12, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6}}>Stok <span style={{color:'var(--red)'}}>*</span></label>
              <input className="input" type="number" placeholder="0" value={form.stock} onChange={e=>set('stock',e.target.value)} />
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:12, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6}}>Kategori</label>
            <select className="input" value={form.category} onChange={e=>set('category',e.target.value)}>
              {CATEGORIES.filter(c=>c!=='Semua').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{fontSize:12, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6}}>Deskripsi</label>
            <input className="input" placeholder="Deskripsi singkat…" value={form.description} onChange={e=>set('description',e.target.value)} />
          </div>

          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Batal</button>
            <button className="btn btn-primary" style={{flex:2}} onClick={()=>onSave(form)}>
              {isEdit ? '✓ Simpan Perubahan' : '+ Tambah Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
