import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const b = await req.json()
    const date = String(b.date ?? '').trim()
    const items = b.items
    if (!date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid entry' }, { status: 400 })
    }
    const row = await db.groupedEntry.update({
      where: { id },
      data: { date, items: JSON.stringify(items) },
    })
    return NextResponse.json({ id: row.id, module: row.module, date: row.date, items: JSON.parse(row.items) })
  } catch (e) {
    console.error('PUT /api/entries/[id] failed', e)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.groupedEntry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/entries/[id] failed', e)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
