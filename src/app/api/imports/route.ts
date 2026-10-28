import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SEED_IMPORTS } from '@/lib/erp-data'

// seed demo data when the table is empty
async function seedIfEmpty() {
  const count = await db.importEntry.count()
  if (count > 0) return
  await db.importEntry.createMany({ data: SEED_IMPORTS })
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
      return NextResponse.json({ error: 'Please fill date, qty, rate and vendor' }, { status: 400 })
    }

    const entry = await db.importEntry.create({
      data: { date, material, vendor, qty, rate, amount: Math.round(qty * rate * 100) / 100, transport },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (e) {
    console.error('POST /api/imports failed', e)
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
  }
}
