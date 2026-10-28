import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const entry = await db.importEntry.update({
      where: { id },
      data: { date, material, vendor, qty, rate, amount: Math.round(qty * rate * 100) / 100, transport },
    })
    return NextResponse.json(entry)
  } catch (e) {
    console.error('PUT /api/imports/[id] failed', e)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.importEntry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/imports/[id] failed', e)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
