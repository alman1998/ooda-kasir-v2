export const CATEGORIES = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Dessert']

export const MENU_ITEMS = [
  { id: 1,  name: 'Es Kopi Susu',       category: 'Minuman', price: 18000,  stock: 50, emoji: '☕', description: 'Kopi susu segar dengan es batu' },
  { id: 2,  name: 'Matcha Latte',       category: 'Minuman', price: 22000,  stock: 40, emoji: '🍵', description: 'Matcha premium Jepang dengan susu oat' },
  { id: 3,  name: 'Thai Tea',           category: 'Minuman', price: 15000,  stock: 35, emoji: '🧋', description: 'Teh Thailand original dengan susu evap' },
  { id: 4,  name: 'Americano',          category: 'Minuman', price: 20000,  stock: 45, emoji: '☕', description: 'Espresso double shot dengan air panas' },
  { id: 5,  name: 'Caramel Macchiato', category: 'Minuman', price: 28000,  stock: 30, emoji: '🥤', description: 'Espresso dengan vanilla, susu, dan karamel' },
  { id: 6,  name: 'Nasi Goreng Spesial',category: 'Makanan', price: 35000,  stock: 20, emoji: '🍳', description: 'Nasi goreng dengan telur, ayam, dan sayuran' },
  { id: 7,  name: 'Mie Ayam Bakso',    category: 'Makanan', price: 30000,  stock: 15, emoji: '🍜', description: 'Mie kuning dengan ayam kecap dan bakso' },
  { id: 8,  name: 'Ayam Geprek',       category: 'Makanan', price: 28000,  stock: 25, emoji: '🍗', description: 'Ayam crispy geprek sambal bawang' },
  { id: 9,  name: 'Indomie Goreng',    category: 'Makanan', price: 18000,  stock: 30, emoji: '🍜', description: 'Indomie goreng telur dengan topping pilihan' },
  { id: 10, name: 'Croissant Butter',  category: 'Snack',   price: 25000,  stock: 12, emoji: '🥐', description: 'Croissant segar dengan mentega premium' },
  { id: 11, name: 'Roti Bakar Coklat', category: 'Snack',   price: 20000,  stock: 18, emoji: '🍞', description: 'Roti bakar dengan coklat meisjes' },
  { id: 12, name: 'Kentang Goreng',   category: 'Snack',   price: 22000,  stock: 22, emoji: '🍟', description: 'Kentang goreng crispy dengan saus pilihan' },
  { id: 13, name: 'Pisang Nugget',    category: 'Snack',   price: 18000,  stock: 16, emoji: '🍌', description: 'Pisang nugget crispy dengan topping keju' },
  { id: 14, name: 'Es Krim Vanilla',  category: 'Dessert', price: 15000,  stock: 20, emoji: '🍦', description: 'Es krim vanilla premium satu scoop' },
  { id: 15, name: 'Pudding Coklat',   category: 'Dessert', price: 12000,  stock: 14, emoji: '🍮', description: 'Pudding coklat lembut dengan saus karamel' },
  { id: 16, name: 'Lava Cake',        category: 'Dessert', price: 32000,  stock: 8,  emoji: '🎂', description: 'Kue coklat hangat dengan lelehan di dalam' },
]

export const HOURLY_TRAFFIC = [0,0,1,0,2,6,14,20,16,24,28,26,32,30,26,18,22,28,20,16,10,7,3,1]

export const MOCK_TRANSACTIONS = [
  { id: 'TRX-001', time: '08:32', items: 'Es Kopi Susu x2, Croissant x1', total: 61000, method: 'QRIS' },
  { id: 'TRX-002', time: '09:15', items: 'Nasi Goreng Spesial x1, Americano x1', total: 55000, method: 'Cash' },
  { id: 'TRX-003', time: '10:02', items: 'Matcha Latte x2', total: 44000, method: 'Transfer' },
  { id: 'TRX-004', time: '10:47', items: 'Ayam Geprek x2, Thai Tea x2', total: 86000, method: 'QRIS' },
  { id: 'TRX-005', time: '11:20', items: 'Lava Cake x1, Matcha Latte x1', total: 54000, method: 'Cash' },
]

export const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

export const fmtRp = (num) =>
  'Rp\u00A0' + new Intl.NumberFormat('id-ID').format(num)
