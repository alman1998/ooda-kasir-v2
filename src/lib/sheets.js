import axios from 'axios'

const GAS_URL = import.meta.env.VITE_GAS_URL

export const isConnected = Boolean(GAS_URL)

// ── POST helpers ─────────────────────────────────────────────────────────────

export async function postTransaction(order) {
  if (!isConnected) return { success: true, mock: true }
  try {
    const { data } = await axios.post(GAS_URL, {
      action: 'addTransaction',
      id:      order.id,
      date:    new Date().toLocaleDateString('id-ID'),
      time:    order.time,
      items:   order.items.map(i => `${i.name} x${i.qty}`).join(', '),
      total:   order.total,
      method:  order.method,
      cashier: import.meta.env.VITE_CASHIER_NAME || 'Kasir',
    })
    return data
  } catch (err) {
    console.error('[Sheets] postTransaction:', err)
    throw err
  }
}

export async function updateStock(updates) {
  // updates = [{ id, qty }]
  if (!isConnected) return { success: true, mock: true }
  try {
    const { data } = await axios.post(GAS_URL, {
      action: 'updateStock',
      updates,
    })
    return data
  } catch (err) {
    console.error('[Sheets] updateStock:', err)
    throw err
  }
}

// ── GET helpers ──────────────────────────────────────────────────────────────

export async function fetchSales() {
  if (!isConnected) return null
  try {
    const { data } = await axios.get(GAS_URL, { params: { action: 'getSales' } })
    return data
  } catch (err) {
    console.error('[Sheets] fetchSales:', err)
    return null
  }
}

export async function fetchStock() {
  if (!isConnected) return null
  try {
    const { data } = await axios.get(GAS_URL, { params: { action: 'getStock' } })
    return data
  } catch (err) {
    console.error('[Sheets] fetchStock:', err)
    return null
  }
}

export async function testConnection() {
  if (!isConnected) return false
  try {
    await axios.get(GAS_URL, { params: { action: 'ping' }, timeout: 5000 })
    return true
  } catch {
    return false
  }
}
