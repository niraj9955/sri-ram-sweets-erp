export interface ErpModule {
  id: string
  n: string // name
  d: string // description
  cols: string[]
  rows: string[][]
}

export interface ImportEntry {
  id: string
  date: string // yyyy-mm-dd
  material: string
  qty: number // kg
  rate: number // ₹ / kg
  amount: number // qty × rate
  vendor: string
  transport: number // ₹
}

export type NewImport = Omit<ImportEntry, 'id'>

// raw material master — used in Material Import dropdown
export const MATERIALS = [
  'Sugar',
  'Desi Ghee',
  'Refined Flour (Maida)',
  'Besan',
  'Khoya / Mawa',
  'Milk',
  'Cashew',
  'Kishmish (Raisins)',
  'Cardamom (Elaichi)',
  'Saffron (Kesar)',
  'Dry Fruits Mix',
  'Food Colour',
  'Rose Water',
  'Refined Oil',
  'Baking Soda',
]

export const IMPORT_COLS = [
  'Date',
  'Material',
  'Qty (kg)',
  'Rate (₹)',
  'Amount (₹)',
  'Vendor',
  'Transport (₹)',
]

export const MODULES: ErpModule[] = [
  {
    id: 'import',
    n: 'Material Import',
    d: 'Raw material inward entries',
    cols: IMPORT_COLS,
    rows: [], // comes from database (API)
  },
  {
    id: 'product',
    n: 'Product',
    d: 'Sweets and snacks catalogue',
    cols: ['Date', 'Product', 'Category', 'Price (₹/kg)', 'Status'],
    rows: [
      ['2026-10-26', 'Kaju Katli', 'Sweets', '900', 'Active'],
      ['2026-10-24', 'Motichoor Laddoo', 'Sweets', '420', 'Active'],
      ['2026-10-22', 'Aloo Bhujia', 'Namkeen', '260', 'Active'],
    ],
  },
  {
    id: 'prod',
    n: 'Daily Production',
    d: 'Batches prepared today',
    cols: ['Date', 'Product', 'Batch', 'Produced (kg)', 'Time'],
    rows: [
      ['2026-10-28', 'Motichoor Laddoo', 'B-101', '45', '06:30'],
      ['2026-10-28', 'Kaju Katli', 'B-102', '20', '09:00'],
      ['2026-10-28', 'Jalebi', 'B-103', '25', '11:15'],
    ],
  },
  {
    id: 'sale',
    n: 'Daily Sale',
    d: 'Counter and wholesale sales',
    cols: ['Date', 'Product', 'Sold (kg)', 'Rate (₹)', 'Total (₹)'],
    rows: [
      ['2026-10-28', 'Kaju Katli', '6', '900', '5,400'],
      ['2026-10-28', 'Motichoor Laddoo', '18', '420', '7,560'],
      ['2026-10-28', 'Jalebi', '12', '280', '3,360'],
    ],
  },
  {
    id: 'bal',
    n: 'Balanced Product',
    d: 'Closing stock after sales',
    cols: ['Date', 'Product', 'Produced', 'Sold', 'Balance'],
    rows: [
      ['2026-10-28', 'Motichoor Laddoo', '45', '18', '27'],
      ['2026-10-28', 'Kaju Katli', '20', '6', '14'],
      ['2026-10-28', 'Jalebi', '25', '12', '13'],
    ],
  },
  {
    id: 'ret',
    n: 'Returning Product',
    d: 'Goods returned by customers',
    cols: ['Date', 'Product', 'Qty (kg)', 'Reason'],
    rows: [
      ['2026-10-27', 'Barfi', '2', 'Past date'],
      ['2026-10-28', 'Samosa', '1', 'Not fresh'],
    ],
  },
  {
    id: 'rep',
    n: 'Report',
    d: 'Sales and profit reports',
    cols: ['Date', 'Report', 'Period', 'Total (₹)', 'Status'],
    rows: [
      ['2026-10-28', 'Daily Sale', 'Today', '16,320', 'Ready'],
      ['2026-10-26', 'Weekly Sale', 'This week', '98,450', 'Ready'],
      ['2026-10-25', 'Monthly Profit', 'Oct 2026', '3.1 L', 'Pending'],
    ],
  },
  {
    id: 'bill',
    n: 'Bill',
    d: 'Customer invoices',
    cols: ['Date', 'Bill No.', 'Customer', 'Amount (₹)', 'Status'],
    rows: [
      ['2026-10-28', '#1041', 'Ramesh Gupta', '1,250', 'Paid'],
      ['2026-10-27', '#1042', 'Sunita Devi', '860', 'Paid'],
      ['2026-10-28', '#1043', 'Hotel Maurya', '7,400', 'Pending'],
    ],
  },
]

export const DASHBOARD = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  sales: [42, 55, 48, 63, 58, 71, 64],
  stats: [
    { label: 'Today’s sales', value: '₹16,320', trend: '▲ 8.4% vs yesterday', down: false },
    { label: 'Production', value: '90 kg', trend: '▲ 3 batches', down: false },
    { label: 'Closing stock', value: '54 kg', trend: '▼ 12% vs yesterday', down: true },
    { label: 'Pending bills', value: '₹7,400', trend: '1 invoice open', down: true },
  ],
  activity: [
    { title: 'Bill #1043 created', meta: 'Hotel Maurya · 10 min ago' },
    { title: 'Batch B-103 completed', meta: 'Jalebi, 25 kg · 1 hr ago' },
    { title: 'Material received', meta: 'Desi Ghee, 80 kg · 3 hrs ago' },
    { title: 'Return recorded', meta: 'Samosa, 1 kg · 5 hrs ago' },
  ],
}

// yyyy-mm-dd for <input type="date"> defaults (client only)
export const todayStr = () => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
