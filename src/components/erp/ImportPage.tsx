'use client'

import { useMemo, useState } from 'react'
import { IMPORT_COLS, MATERIALS, todayStr, type ImportEntry } from '@/lib/erp-data'
import { Ic } from './ErpIcons'
import HistoryModal from './HistoryModal'

interface ImportPageProps {
  entries: ImportEntry[]
  loaded: boolean
  onAdd: (entry: Omit<ImportEntry, 'id'>) => Promise<void>
  onDelete: (id: string) => void
  toast: (msg: string) => void
}

const fmt = (n: number) => n.toLocaleString('en-IN')

const EMPTY = { date: '', material: '', qty: '', rate: '', vendor: '', transport: '0' }

export default function ImportPage({ entries, loaded, onAdd, onDelete, toast }: ImportPageProps) {
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [f, setF] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [histFor, setHistFor] = useState<string | null>(null)

  const amount = useMemo(() => {
    const qty = parseFloat(f.qty)
    const rate = parseFloat(f.rate)
    return Number.isFinite(qty) && Number.isFinite(rate) ? qty * rate : 0
  }, [f.qty, f.rate])

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter((e) =>
      [e.date, e.material, e.vendor].join(' ').toLowerCase().includes(needle)
    )
  }, [entries, q])

  const openForm = () => {
    setF({ ...EMPTY, date: todayStr() })
    setFormOpen(true)
  }

  const save = async () => {
    if (!f.date || !f.material || !f.vendor.trim() || !f.qty || parseFloat(f.qty) <= 0) {
      toast('Please fill all fields')
      return
    }
    setSaving(true)
    await onAdd({
      date: f.date,
      material: f.material,
      qty: parseFloat(f.qty),
      rate: parseFloat(f.rate) || 0,
      amount: amount,
      vendor: f.vendor.trim(),
      transport: parseFloat(f.transport) || 0,
    })
    setSaving(false)
    setFormOpen(false)
  }

  return (
    <>
      <div className="ph">
        <div>
          <div className="crumb">Dashboard / Material Import</div>
          <h2>Material Import</h2>
          <div className="sub">Raw material inward entries — click 🕘 to see a material’s full history</div>
        </div>
        <button className="btn" onClick={openForm}>
          <Ic name="plus" />
          New entry
        </button>
      </div>

      <div className="bar">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by material, vendor or date"
          aria-label="Search entries"
        />
      </div>

      {formOpen && (
        <div className="panel fm">
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12.5, color: 'var(--mu)' }}>Import Date</span>
            <input
              type="date"
              value={f.date}
              aria-label="Import Date"
              onChange={(e) => setF((v) => ({ ...v, date: e.target.value }))}
            />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12.5, color: 'var(--mu)' }}>Material Name</span>
            <select
              value={f.material}
              aria-label="Material Name"
              onChange={(e) => setF((v) => ({ ...v, material: e.target.value }))}
            >
              <option value="">Select material</option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12.5, color: 'var(--mu)' }}>Qty (kg)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Qty"
              aria-label="Qty (kg)"
              value={f.qty}
              onChange={(e) => setF((v) => ({ ...v, qty: e.target.value }))}
            />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12.5, color: 'var(--mu)' }}>Rate (₹/kg)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Rate"
              aria-label="Rate (₹/kg)"
              value={f.rate}
              onChange={(e) => setF((v) => ({ ...v, rate: e.target.value }))}
            />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12.5, color: 'var(--mu)' }}>Amount (auto: Qty × Rate)</span>
            <input type="text" readOnly aria-label="Amount (₹)" value={amount ? fmt(amount) : ''} placeholder="0" />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12.5, color: 'var(--mu)' }}>Vendor Name</span>
            <input
              type="text"
              placeholder="Vendor"
              aria-label="Vendor Name"
              value={f.vendor}
              onChange={(e) => setF((v) => ({ ...v, vendor: e.target.value }))}
            />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12.5, color: 'var(--mu)' }}>Transportation Charge (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              aria-label="Transportation Charge (₹)"
              value={f.transport}
              onChange={(e) => setF((v) => ({ ...v, transport: e.target.value }))}
            />
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
            <button className="btn" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save entry'}
            </button>
            <button className="btn g" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="panel tw">
        {!loaded ? (
          <div className="empty">Loading entries…</div>
        ) : visible.length === 0 ? (
          <div className="empty">No entries found. Use “New entry” to add one.</div>
        ) : (
          <table>
            <thead>
              <tr>
                {IMPORT_COLS.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>
                    <button
                      className="x"
                      style={{ color: 'var(--ac)', fontWeight: 600 }}
                      onClick={() => setHistFor(e.material)}
                      aria-label={`Show history of ${e.material}`}
                      title="View history"
                    >
                      {e.material}
                    </button>
                  </td>
                  <td>{fmt(e.qty)}</td>
                  <td>{fmt(e.rate)}</td>
                  <td>{fmt(e.amount)}</td>
                  <td>{e.vendor}</td>
                  <td>{fmt(e.transport)}</td>
                  <td style={{ width: 76, whiteSpace: 'nowrap' }}>
                    <button
                      className="x"
                      onClick={() => setHistFor(e.material)}
                      aria-label={`History of ${e.material}`}
                      title="History"
                    >
                      <Ic name="hist" />
                    </button>
                    <button className="x" onClick={() => onDelete(e.id)} aria-label="Delete entry" title="Delete">
                      <Ic name="del" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {histFor && (
        <HistoryModal material={histFor} entries={entries} onClose={() => setHistFor(null)} />
      )}
    </>
  )
}
