export type FieldType = 'txt' | 'num' | 'sel' | 'time' | 'pn'

export interface Field {
  label: string
  type?: FieldType
  options?: string[]
}

export interface ErpModule {
  id: string
  n: string // name
  d: string // description
  cols: Field[]
}

export interface ImportEntry {
  id: string
  date: string // yyyy-mm-dd
  material: string
  qty: number
  rate: number
  amount: number
  vendor: string
  transport: number
}

export type NewImport = Omit<ImportEntry, 'id'>

export interface GroupRec {
  id: string
  date: string
  items: (string | number)[][]
}

// raw material master: [name, unit]
export const MATS: [string, string][] = [
  ['Sugar', 'kg'],
  ['Refined Flour', 'kg'],
  ['Desi Ghee', 'kg'],
  ['Cashew (Kaju)', 'kg'],
  ['Almond', 'kg'],
  ['Pistachio', 'kg'],
  ['Milk Khoya', 'kg'],
  ['Besan', 'kg'],
  ['Edible Oil', 'L'],
  ['Cardamom', 'kg'],
  ['Saffron', 'g'],
  ['Raisins', 'kg'],
]

export const IMPORT_COLS = ['Date', 'Material', 'Qty', 'Rate (₹)', 'Amount (₹)', 'Vendor', 'Transport (₹)']

export const MODULES: ErpModule[] = [
  { id: 'import', n: 'Material Import', d: 'Inward entries, vendors and item history', cols: [] },
  {
    id: 'product',
    n: 'Product',
    d: 'Sweets and snacks catalogue (many items under one date)',
    cols: [
      { label: 'Product' },
      { label: 'Category', type: 'sel', options: ['Sweets', 'Namkeen', 'Bakery'] },
      { label: 'Price (₹/kg)', type: 'num' },
      { label: 'Status', type: 'sel', options: ['Active', 'Inactive'] },
    ],
  },
  {
    id: 'prod',
    n: 'Daily Production',
    d: 'Batches prepared on a date',
    cols: [
      { label: 'Product', type: 'pn' },
      { label: 'Batch' },
      { label: 'Produced (kg)', type: 'num' },
      { label: 'Time', type: 'time' },
    ],
  },
  {
    id: 'sale',
    n: 'Daily Sale',
    d: 'Counter and wholesale sales',
    cols: [
      { label: 'Product', type: 'pn' },
      { label: 'Sold (kg)', type: 'num' },
      { label: 'Rate (₹)', type: 'num' },
      { label: 'Total (₹)', type: 'num' },
    ],
  },
  {
    id: 'bal',
    n: 'Balanced Product',
    d: 'Closing stock after sales',
    cols: [
      { label: 'Product', type: 'pn' },
      { label: 'Produced', type: 'num' },
      { label: 'Sold', type: 'num' },
      { label: 'Balance', type: 'num' },
    ],
  },
  {
    id: 'ret',
    n: 'Returning Product',
    d: 'Goods returned by customers',
    cols: [{ label: 'Product', type: 'pn' }, { label: 'Qty (kg)', type: 'num' }, { label: 'Reason' }],
  },
  {
    id: 'rep',
    n: 'Report',
    d: 'Sales and profit reports',
    cols: [
      { label: 'Report' },
      { label: 'Period' },
      { label: 'Total (₹)', type: 'num' },
      { label: 'Status', type: 'sel', options: ['Ready', 'Pending'] },
    ],
  },
  {
    id: 'bill',
    n: 'Bill',
    d: 'Customer invoices',
    cols: [
      { label: 'Bill No.' },
      { label: 'Customer' },
      { label: 'Amount (₹)', type: 'num' },
      { label: 'Status', type: 'sel', options: ['Paid', 'Pending'] },
    ],
  },
]

// seed records for date-grouped modules (matches v2 HTML)
export const SEED_GROUPS: { module: string; date: string; items: string[][] }[] = [
  {
    module: 'product',
    date: '2026-10-28',
    items: [
      ['Kaju Katli', 'Sweets', '900', 'Active'],
      ['Motichoor Laddoo', 'Sweets', '420', 'Active'],
      ['Aloo Bhujia', 'Namkeen', '260', 'Active'],
    ],
  },
  {
    module: 'product',
    date: '2026-10-26',
    items: [
      ['Jalebi', 'Sweets', '280', 'Active'],
      ['Samosa', 'Namkeen', '240', 'Active'],
    ],
  },
  {
    module: 'prod',
    date: '2026-10-28',
    items: [
      ['Motichoor Laddoo', 'B-101', '45', '06:30'],
      ['Kaju Katli', 'B-102', '20', '09:00'],
      ['Jalebi', 'B-103', '25', '11:15'],
    ],
  },
  {
    module: 'sale',
    date: '2026-10-28',
    items: [
      ['Kaju Katli', '6', '900', '5400'],
      ['Motichoor Laddoo', '18', '420', '7560'],
      ['Jalebi', '12', '280', '3360'],
    ],
  },
  {
    module: 'bal',
    date: '2026-10-28',
    items: [
      ['Motichoor Laddoo', '45', '18', '27'],
      ['Kaju Katli', '20', '6', '14'],
      ['Jalebi', '25', '12', '13'],
    ],
  },
  { module: 'ret', date: '2026-10-27', items: [['Barfi', '2', 'Past date']] },
  { module: 'ret', date: '2026-10-28', items: [['Samosa', '1', 'Not fresh']] },
  {
    module: 'rep',
    date: '2026-10-28',
    items: [
      ['Daily Sale', 'Today', '16320', 'Ready'],
      ['Weekly Sale', 'This week', '98450', 'Ready'],
      ['Monthly Profit', 'Oct 2026', '310000', 'Pending'],
    ],
  },
  {
    module: 'bill',
    date: '2026-10-27',
    items: [
      ['#1041', 'Ramesh Gupta', '1250', 'Paid'],
      ['#1042', 'Sunita Devi', '860', 'Paid'],
    ],
  },
  { module: 'bill', date: '2026-10-28', items: [['#1043', 'Hotel Maurya', '7400', 'Pending']] },
]

// seed rows for the import module (matches v2 HTML)
export const SEED_IMPORTS: Omit<ImportEntry, 'id'>[] = [
  { date: '2026-10-28', material: 'Desi Ghee', qty: 80, rate: 610, amount: 48800, vendor: 'Amul Depot', transport: 1200 },
  { date: '2026-10-27', material: 'Sugar', qty: 200, rate: 44, amount: 8800, vendor: 'Gupta Traders', transport: 600 },
  { date: '2026-10-25', material: 'Refined Flour', qty: 150, rate: 32, amount: 4800, vendor: 'Sharma Mill', transport: 400 },
  { date: '2026-10-22', material: 'Cashew (Kaju)', qty: 25, rate: 780, amount: 19500, vendor: 'Bihar Dry Fruits', transport: 500 },
  { date: '2026-10-20', material: 'Sugar', qty: 300, rate: 43, amount: 12900, vendor: 'Gupta Traders', transport: 800 },
  { date: '2026-10-18', material: 'Desi Ghee', qty: 100, rate: 598, amount: 59800, vendor: 'Sudha Dairy', transport: 1500 },
  { date: '2026-10-15', material: 'Milk Khoya', qty: 60, rate: 340, amount: 20400, vendor: 'Kisan Dairy', transport: 700 },
  { date: '2026-10-12', material: 'Refined Flour', qty: 200, rate: 31, amount: 6200, vendor: 'Patna Flour Mill', transport: 500 },
  { date: '2026-10-10', material: 'Sugar', qty: 250, rate: 45, amount: 11250, vendor: 'Mahavir Traders', transport: 700 },
  { date: '2026-10-05', material: 'Edible Oil', qty: 120, rate: 128, amount: 15360, vendor: 'Ruchi Oils', transport: 650 },
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

/* ---------- helpers (mirror the v2 HTML) ---------- */

// yyyy-mm-dd for <input type="date"> defaults (client only)
export const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// display date: yyyy-mm-dd -> dd-mm-yyyy
export const fd = (s: string) => {
  const p = String(s).split('-')
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : s
}

// unit for a material from MATS
export const unit = (n: string) => MATS.find((m) => m[0] === n)?.[1] ?? ''

// ₹ formatting, Indian locale
export const inr = (n: number | string) => '₹' + Number(n).toLocaleString('en-IN')

// round to 2 decimals
export const round2 = (n: number) => Math.round(n * 100) / 100

export const sortDesc = (a: { date: string }, b: { date: string }) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0
