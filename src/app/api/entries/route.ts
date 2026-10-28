import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SEED_GROUPS } from '@/lib/erp-data'

// seed demo data when the table is empty
async function seedIfEmpty() {
  const count = await db.groupedEntry.count()
  if (count > 0) return
  await db.groupedEntry.createMany({
    data: SEED_GROUPS.map((g) => ({ module: g.module, date: g.date, items: JSON.stringify(g.items) })),
  })
}

export async function GET() {
  try {
    await seedIfEmpty()
    const rows = await db.groupedEntry.findMany({ orderBy: { createdAt: 'asc' } })
    return NextResponse.json(
      rows.map((r) => ({ id: r.id, module: r.module, date: r.date, items: JSON.parse(r.items) }))
    )
  } catch (e) {
    console.error('GET /api/entries failed', e)
    return NextResponse.json({ error: 'Failed to load entries' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json()
    const modId = String(b.module ?? '').trim()
    const date = String(b.date ?? '').trim()
    const items = b.items
    if (!modId || !date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid entry' }, { status: 400 })
    }
    const row = await db.groupedEntry.create({
      data: { module: modId, date, items: JSON.stringify(items) },
    })
    return NextResponse.json(
      { id: row.id, module: row.module, date: row.date, items: JSON.parse(row.items) },
      { status: 201 }
    )
  } catch (e) {
    console.error('POST /api/entries failed', e)
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
  }
}
