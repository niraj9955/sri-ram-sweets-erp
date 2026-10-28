import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// seed demo data (relative to today) when the table is empty
async function seedIfEmpty() {
  const count = await db.importEntry.count()
  if (count > 0) return
  const d = (daysAgo: number) => {
    const t = new Date()
    t.setDate(t.getDate() - daysAgo)
    return t.toISOString().slice(0, 10)
  }
  const seed = [
    { date: d(0), material: 'Sugar', qty: 200, rate: 44, vendor: 'Gupta Traders', transport: 500 },
    { date: d(0), material: 'Milk', qty: 120, rate: 34, vendor: 'Gopal Dairy', transport: 150 },
    { date: d(1), material: 'Desi Ghee', qty: 80, rate: 610, vendor: 'Amul Depot', transport: 900 },
    { date: d(2), material: 'Refined Flour (Maida)', qty: 150, rate: 32, vendor: 'Sharma Mill', transport: 400 },
    { date: d(3), material: 'Sugar', qty: 150, rate: 43, vendor: 'Gupta Traders', transport: 500 },
    { date: d(4), material: 'Cashew', qty: 25, rate: 780, vendor: 'Krishna Dry Fruits', transport: 250 },
    { date: d(5), material: 'Besan', qty: 90, rate: 58, vendor: 'Sharma Mill', transport: 300 },
    { date: d(7), material: 'Cardamom (Elaichi)', qty: 2, rate: 2400, vendor: 'Spice House', transport: 80 },
  ]
  await db.importEntry.createMany({
    data: seed.map((s) => ({ ...s, amount: s.qty * s.rate })),
  })
}

export async function GET() {
  try {
    await seedIfEmpty()
    const entries = await db.importEntry.findMany({
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(entries)
  } catch (e) {
    console.error('GET /api/imports failed', e)
    return NextResponse.json({ error: 'Failed to load imports' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json()
    const date = String(b.date ?? '').trim()
    const material = String(b.material ?? '').trim()
    const vendor = String(b.vendor ?? '').trim()
    const qty = Number(b.qty)
    const rate = Number(b.rate)
    const transport = Number(b.transport) || 0

    if (!date || !material || !vendor || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(rate) || rate < 0) {
      return NextResponse.json({ error: 'Please fill all fields' }, { status: 400 })
    }

    const entry = await db.importEntry.create({
      data: { date, material, vendor, qty, rate, amount: qty * rate, transport },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (e) {
    console.error('POST /api/imports failed', e)
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
  }
}
