export interface ErpModule {
  id: string
  n: string // name
  d: string // description
  cols: string[]
  rows: string[][]
}

export const MODULES: ErpModule[] = [
  {
    id: 'import',
    n: 'Material Import',
    d: 'Raw material inward entries',
    cols: ['Material', 'Supplier', 'Qty (kg)', 'Rate (₹)'],
    rows: [
      ['Sugar', 'Gupta Traders', '200', '44'],
      ['Desi Ghee', 'Amul Depot', '80', '610'],
      ['Refined Flour', 'Sharma Mill', '150', '32'],
    ],
  },
  {
    id: 'product',
    n: 'Product',
    d: 'Sweets and snacks catalogue',
    cols: ['Product', 'Category', 'Price (₹/kg)', 'Status'],
    rows: [
      ['Kaju Katli', 'Sweets', '900', 'Active'],
      ['Motichoor Laddoo', 'Sweets', '420', 'Active'],
      ['Aloo Bhujia', 'Namkeen', '260', 'Active'],
    ],
  },
  {
    id: 'prod',
    n: 'Daily Production',
    d: 'Batches prepared today',
    cols: ['Product', 'Batch', 'Produced (kg)', 'Time'],
    rows: [
      ['Motichoor Laddoo', 'B-101', '45', '06:30'],
      ['Kaju Katli', 'B-102', '20', '09:00'],
      ['Jalebi', 'B-103', '25', '11:15'],
    ],
  },
  {
    id: 'sale',
    n: 'Daily Sale',
    d: 'Counter and wholesale sales',
    cols: ['Product', 'Sold (kg)', 'Rate (₹)', 'Total (₹)'],
    rows: [
      ['Kaju Katli', '6', '900', '5,400'],
      ['Motichoor Laddoo', '18', '420', '7,560'],
      ['Jalebi', '12', '280', '3,360'],
    ],
  },
  {
    id: 'bal',
    n: 'Balanced Product',
    d: 'Closing stock after sales',
    cols: ['Product', 'Produced', 'Sold', 'Balance'],
    rows: [
      ['Motichoor Laddoo', '45', '18', '27'],
      ['Kaju Katli', '20', '6', '14'],
      ['Jalebi', '25', '12', '13'],
    ],
  },
  {
    id: 'ret',
    n: 'Returning Product',
    d: 'Goods returned by customers',
    cols: ['Product', 'Qty (kg)', 'Reason', 'Date'],
    rows: [
      ['Barfi', '2', 'Past date', 'Yesterday'],
      ['Samosa', '1', 'Not fresh', 'Today'],
    ],
  },
  {
    id: 'rep',
    n: 'Report',
    d: 'Sales and profit reports',
    cols: ['Report', 'Period', 'Total (₹)', 'Status'],
    rows: [
      ['Daily Sale', 'Today', '16,320', 'Ready'],
      ['Weekly Sale', 'This week', '98,450', 'Ready'],
      ['Monthly Profit', 'Oct 2026', '3.1 L', 'Pending'],
    ],
  },
  {
    id: 'bill',
    n: 'Bill',
    d: 'Customer invoices',
    cols: ['Bill No.', 'Customer', 'Amount (₹)', 'Status'],
    rows: [
      ['#1041', 'Ramesh Gupta', '1,250', 'Paid'],
      ['#1042', 'Sunita Devi', '860', 'Paid'],
      ['#1043', 'Hotel Maurya', '7,400', 'Pending'],
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
