'use client'

import { useMemo, useRef, useState } from 'react'
import {
  IMPORT_COLS,
  MATS,
  fd,
  inr,
  round2,
  todayStr,
  unit,
  type ImportEntry,
} from '@/lib/erp-data'
import { Ic } from './ErpIcons'

interface ImportPageProps {
  imports: ImportEntry[]
  importsLoaded: boolean
  onAdd: (entry: Omit<ImportEntry, 'id'>) => Promise<void>
  onUpdate: (id: string, entry: Omit<ImportEntry, 'id'>) => Promise<void>
  onDelete: (id: string) => void
  toast: (msg: string) => void
}

const fmt = (n: number) => n.toLocaleString('en-IN')

const blankForm = () => ({
  date: todayStr(),
  material: MATS[0][0],
  qty: '',
  rate: '',
  vendor: '',
  transport: '0',
})

export default function ImportPage({
  imports,
  importsLoaded,
  onAdd,
  onUpdate,
  onDelete,
  toast,
}: ImportPageProps) {
  const [tab, setTab] = useState<'e' | 'h'>('e')
  const [hm, setHm] = useState('Sugar')
  const [q, setQ] = useState('')
  const [F, setF] = useState({ a: '', b: '' })
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [f, setF2] = useState(blankForm)
  const [saving, setSaving] = useState(false)
  const [armed, setArmed] = useState<string | null>(null)
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const amount = useMemo(() => {
    const qty = parseFloat(f.qty)
    const rate = parseFloat(f.rate)
    return Number.isFinite(qty) && Number.isFinite(rate) ? round2(qty * rate) : 0
  }, [f.qty, f.rate])

  const vendors = useMemo(
    () => [...new Set(imports.map((x) => x.vendor))].sort(),
    [imports]
  )

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return imports.filter((r) => {
      const joined = [r.date, r.material, r.qty, r.rate, r.amount, r.vendor, r.transport]
        .join(' ')
        .toLowerCase()
      if (needle && !joined.includes(needle)) return false
      if (F.a && r.date < F.a) return false
      if (F.b && r.date > F.b) return false
      return true
    })
  }, [imports, q, F])

  const openNew = () => {
    setEditId(null)
    setF2(blankForm())
    setFormOpen(true)
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: 'nearest' }))
  }

  const openEdit = (row: ImportEntry) => {
    setEditId(row.id)
    setF2({
      date: row.date,
      material: row.material,
      qty: String(row.qty),
      rate: String(row.rate),
      vendor: row.vendor,
      transport: String(row.transport),
    })
    setFormOpen(true)
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: 'nearest' }))
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditId(null)
  }

  const save = async () => {
    if (!f.date || !f.qty || !f.rate || !f.vendor.trim()) {
      toast('Please fill date, qty, rate and vendor')
      return
    }
    setSaving(true)
    const payload = {
      date: f.date,
      material: f.material,
      qty: parseFloat(f.qty),
      rate: parseFloat(f.rate),
      amount: amount,
      vendor: f.vendor.trim(),
      transport: parseFloat(f.transport) || 0,
    }
    if (editId) await onUpdate(editId, payload)
    else await onAdd(payload)
    setSaving(false)
    closeForm()
  }

  const del = (id: string) => {
    if (armed !== id) {
      setArmed(id)
      toast('Click delete again to confirm')
      if (armTimer.current) clearTimeout(armTimer.current)
      armTimer.current = setTimeout(() => setArmed(null), 3000)
      return
    }
    if (armTimer.current) clearTimeout(armTimer.current)
    setArmed(null)
    onDelete(id)
  }

  const showHistory = (mat: string) => {
    setHm(mat)
    setTab('h')
  }

  /* ---------- history tab data ---------- */
  const histRows = useMemo(
    () => imports.filter((r) => r.material === hm),
    [imports, hm]
  )
  const totals = useMemo(
    () =>
      histRows.reduce(
        (acc, r) => ({
          qty: acc.qty + r.qty,
          amt: acc.amt + r.amount,
          tr: acc.tr + r.transport,
        }),
        { qty: 0, amt: 0, tr: 0 }
      ),
    [histRows]
  )
  const byVendor = useMemo(() => {
    const vs: Record<string, number> = {}
    histRows.forEach((r) => {
      vs[r.vendor] = (vs[r.vendor] || 0) + r.qty
    })
    return vs
  }, [histRows])

  return (
    <>
      <div className="ph">
        <div>
          <div className="crumb">Dashboard / Material Import</div>
          <h2>Material Import</h2>
          <div className="sub">Inward entries, vendors and item history</div>
        </div>
        <button
          className="btn"
          onClick={() => {
            if (tab !== 'e') {
              setTab('e')
            }
            if (formOpen) closeForm()
            requestAnimationFrame(openNew)
          }}
        >
          <Ic name="plus" />
          New entry
        </button>
      </div>

      <div className="tabs" role="tablist">
        <button className={tab === 'e' ? 'on' : ''} onClick={() => setTab('e')} role="tab" aria-selected={tab === 'e'}>
          Import entries
        </button>
        <button className={tab === 'h' ? 'on' : ''} onClick={() => setTab('h')} role="tab" aria-selected={tab === 'h'}>
          Material history
        </button>
      </div>

      {tab === 'e' ? (
        <>
          <div className="bar">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search in Material Import"
              aria-label="Search entries"
            />
            <label className="fl">
              <span className="lbl">From</span>
              <input
                type="date"
                value={F.a}
                aria-label="From date"
                onChange={(e) => setF((v) => ({ ...v, a: e.target.value }))}
              />
            </label>
            <label className="fl">
              <span className="lbl">To</span>
              <input
                type="date"
                value={F.b}
                aria-label="To date"
                onChange={(e) => setF((v) => ({ ...v, b: e.target.value }))}
              />
            </label>
          </div>

          {formOpen && (
            <div className="panel fp" ref={formRef}>
              <h3>{editId ? 'Edit' : 'New'} import entry</h3>
              <div className="fm">
                <label className="fl">
                  <span className="lbl">Import date</span>
                  <input
                    type="date"
                    autoFocus
                    value={f.date}
                    aria-label="Import date"
                    onChange={(e) => setF2((v) => ({ ...v, date: e.target.value }))}
                  />
                </label>
                <label className="fl">
                  <span className="lbl">Material name</span>
                  <select
                    value={f.material}
                    aria-label="Material name"
                    onChange={(e) => setF2((v) => ({ ...v, material: e.target.value }))}
                  >
                    {MATS.map(([m]) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="fl">
                  <span className="lbl">Qty ({unit(f.material)})</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Qty"
                    aria-label="Qty"
                    value={f.qty}
                    onChange={(e) => setF2((v) => ({ ...v, qty: e.target.value }))}
                  />
                </label>
                <label className="fl">
                  <span className="lbl">Rate (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Rate"
                    aria-label="Rate"
                    value={f.rate}
                    onChange={(e) => setF2((v) => ({ ...v, rate: e.target.value }))}
                  />
                </label>
                <label className="fl">
                  <span className="lbl">Amount (₹)</span>
                  <input
                    readOnly
                    placeholder="Auto"
                    aria-label="Amount"
                    value={amount || ''}
                  />
                </label>
                <label className="fl">
                  <span className="lbl">Vendor name</span>
                  <input
                    list="vl"
                    autoComplete="off"
                    placeholder="Type or pick vendor"
                    aria-label="Vendor name"
                    value={f.vendor}
                    onChange={(e) => setF2((v) => ({ ...v, vendor: e.target.value }))}
                  />
                  <datalist id="vl">
                    {vendors.map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </label>
                <label className="fl">
                  <span className="lbl">Transportation charge (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    aria-label="Transportation charge"
                    value={f.transport}
                    onChange={(e) => setF2((v) => ({ ...v, transport: e.target.value }))}
                  />
                </label>
              </div>
              <div className="fa">
                <span className="sp" />
                <button className="btn" onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Update entry' : 'Save entry'}
                </button>
                <button className="btn g" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="panel tw">
            {!importsLoaded ? (
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
                    <th className="ac"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id}>
                      <td>{fd(r.date)}</td>
                      <td>
                        <button className="lk" onClick={() => showHistory(r.material)}>
                          {r.material}
                        </button>
                      </td>
                      <td>
                        {fmt(r.qty)} {unit(r.material)}
                      </td>
                      <td>{inr(r.rate)}</td>
                      <td>{inr(r.amount)}</td>
                      <td>{r.vendor}</td>
                      <td>{inr(r.transport)}</td>
                      <td className="ac">
                        <button
                          className="x"
                          onClick={() => openEdit(r)}
                          aria-label="Edit entry"
                          title="Edit"
                        >
                          <Ic name="edit" />
                        </button>
                        <button
                          className={'x' + (armed === r.id ? ' arm' : '')}
                          onClick={() => del(r.id)}
                          aria-label="Delete entry"
                          title="Delete"
                        >
                          <Ic name="del" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="bar">
            <label className="fl">
              <span className="lbl">Material</span>
              <select value={hm} aria-label="Material" onChange={(e) => setHm(e.target.value)}>
                {MATS.map(([m]) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="stats">
            <div className="stat">
              <p>Total received</p>
              <strong>
                {fmt(totals.qty)} {unit(hm)}
              </strong>
            </div>
            <div className="stat">
              <p>Total amount</p>
              <strong>{inr(totals.amt)}</strong>
            </div>
            <div className="stat">
              <p>Average rate</p>
              <strong>{totals.qty ? inr(round2(totals.amt / totals.qty)) : '–'}</strong>
            </div>
            <div className="stat">
              <p>Transport paid</p>
              <strong>{inr(totals.tr)}</strong>
            </div>
          </div>

          {histRows.length ? (
            <>
              <div className="panel tw">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Vendor</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Transport</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {histRows.map((r) => (
                      <tr key={r.id}>
                        <td>{fd(r.date)}</td>
                        <td>{r.vendor}</td>
                        <td>
                          {fmt(r.qty)} {unit(hm)}
                        </td>
                        <td>{inr(r.rate)}</td>
                        <td>{inr(r.amount)}</td>
                        <td>{inr(r.transport)}</td>
                        <td>
                          <b>{inr(r.amount + r.transport)}</b>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="sub" style={{ margin: '12px 0 24px' }}>
                Supplied by:{' '}
                {Object.keys(byVendor)
                  .map((k) => `${k} (${fmt(byVendor[k])} ${unit(hm)})`)
                  .join(', ')}
              </p>
            </>
          ) : (
            <div className="panel empty" style={{ marginBottom: 24 }}>
              No imports recorded for this material yet.
            </div>
          )}

          <h3>All materials</h3>
          <div className="panel tw">
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Entries</th>
                  <th>Total qty</th>
                  <th>Last imported</th>
                </tr>
              </thead>
              <tbody>
                {MATS.map(([m, u]) => {
                  const rs = imports.filter((r) => r.material === m)
                  const t = rs.reduce((a, r) => a + r.qty, 0)
                  return (
                    <tr key={m}>
                      <td>
                        <button className="lk" onClick={() => setHm(m)}>
                          {m}
                        </button>
                      </td>
                      <td>{rs.length}</td>
                      <td>
                        {fmt(t)} {u}
                      </td>
                      <td>{rs.length ? fd(rs[0].date) : '–'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
