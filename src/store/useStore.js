import { create } from 'zustand'
import { MENU_ITEMS, MOCK_TRANSACTIONS } from '../data/menu.js'
import { postTransaction, updateStock, isConnected } from '../lib/sheets.js'

const TAX_RATE = 0.11

const genId = () => 'TRX-' + Date.now().toString(36).toUpperCase().slice(-6)
const nowTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export const useStore = create((set, get) => ({
  // ── Navigation ───────────────────────────────────────────────────────────
  activePage: 'pos',
  setPage: (page) => set({ activePage: page }),

  // ── Toast ────────────────────────────────────────────────────────────────
  toast: null,
  showToast: (msg, type = 'success') => {
    set({ toast: { msg, type } })
    setTimeout(() => set({ toast: null }), 3500)
  },

  // ── Menu data ────────────────────────────────────────────────────────────
  menuItems: MENU_ITEMS,
  updateMenuItem: (updated) =>
    set(s => ({ menuItems: s.menuItems.map(m => m.id === updated.id ? updated : m) })),
  addMenuItem: (item) =>
    set(s => ({ menuItems: [...s.menuItems, { ...item, id: Date.now() }] })),
  deleteMenuItem: (id) =>
    set(s => ({ menuItems: s.menuItems.filter(m => m.id !== id) })),

  // ── Cart ─────────────────────────────────────────────────────────────────
  cart: [],
  addToCart: (item) => {
    set(s => {
      const existing = s.cart.find(c => c.id === item.id)
      if (existing) {
        return { cart: s.cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) }
      }
      return { cart: [...s.cart, { ...item, qty: 1 }] }
    })
  },
  setQty: (id, qty) =>
    set(s => ({
      cart: qty <= 0
        ? s.cart.filter(c => c.id !== id)
        : s.cart.map(c => c.id === id ? { ...c, qty } : c)
    })),
  clearCart: () => set({ cart: [] }),

  get cartSubtotal() {
    return get().cart.reduce((sum, c) => sum + c.price * c.qty, 0)
  },
  get cartTax() {
    return Math.round(get().cartSubtotal * TAX_RATE)
  },
  get cartTotal() {
    return get().cartSubtotal + get().cartTax
  },

  // ── Transactions ─────────────────────────────────────────────────────────
  transactions: MOCK_TRANSACTIONS,
  todayRevenue: 4_320_000,
  txLoading: false,

  checkout: async (payMethod) => {
    const { cart, menuItems, showToast } = get()
    if (cart.length === 0) return null

    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
    const tax      = Math.round(subtotal * TAX_RATE)
    const total    = subtotal + tax

    const order = {
      id:       genId(),
      time:     nowTime(),
      items:    cart,
      subtotal, tax, total,
      method:   payMethod,
    }

    set({ txLoading: true })

    // Update stock & transaksi secara lokal — selalu berhasil
    const updatedMenu = menuItems.map(m => {
      const ci = cart.find(c => c.id === m.id)
      return ci ? { ...m, stock: Math.max(0, m.stock - ci.qty) } : m
    })

    const txEntry = {
      id:     order.id,
      time:   order.time,
      items:  cart.map(c => `${c.name} x${c.qty}`).join(', '),
      total,
      method: payMethod,
    }

    // Simpan lokal dulu — ini tidak pernah gagal
    set(s => ({
      transactions: [txEntry, ...s.transactions].slice(0, 50),
      todayRevenue: s.todayRevenue + total,
      menuItems:    updatedMenu,
      cart:         [],
      txLoading:    false,
    }))

    // Sync ke Google Sheets hanya jika URL sudah dikonfigurasi
    if (isConnected) {
      try {
        await postTransaction(order)
        await updateStock(cart.map(c => ({ id: c.id, qty: c.qty })))
        showToast(`✓ ${order.id} tersimpan ke Google Sheets`)
      } catch (err) {
        console.warn('[Sheets] Sync gagal, data tetap tersimpan lokal:', err)
        showToast('Transaksi berhasil (gagal sync ke Sheets)', 'error')
      }
    } else {
      showToast(`✓ ${order.id} — ${new Intl.NumberFormat('id-ID').format(total)} (Mode Demo)`)
    }

    return order
  },

  // ── Computed helpers (fungsi biasa, bukan JS getter — kompatibel Zustand v5) ──
  getTxCount:       () => get().transactions.length + 33,
  getAvgTx:         () => {
    const count = get().transactions.length + 33
    return count > 0 ? Math.round(get().todayRevenue / count) : 0
  },
  getLowStockItems: () => get().menuItems.filter(m => m.stock < 10),
}))
