'use client'

import { useMemo, useRef, useState } from 'react'
import {
  MODULES,
  fd,
  todayStr,
  type ErpModule,
  type Field,
  type GroupRec,
  type ImportEntry,
} from '@/lib/erp-data'
import { Ic } from './ErpIcons'
import ImportPage from './ImportPage'

interface ModulePageProps {
  mod: ErpModule
  imports: ImportEntry[]
  importsLoaded: boolean
  groups: Record<string, GroupRec[]>
  groupsLoaded: boolean
  onAddImport: (entry: Omit<ImportEntry, 'id'>) => Promise<void>
  onUpdateImport: (id: string, entry: Omit<ImportEntry, 'id'>) => Promise<void>
  onDeleteImport: (id: string) => void
  onCreateGroup: (modId: string, date: string, items: (string | number)[][]) => Promise<void>
  onUpdateGroup: (modId: string, id: string, date: string, items: (string | number)[][]) => Promise<void>
  onDeleteGroup: (modId: string, id: string) => void
  toast: (msg: string) => void
}

export default function ModulePage(props: ModulePageProps) {
  const { mod } = props
  if (mod.id === 'import') {
    return (
      <ImportPage
        imports={props.imports}
        importsLoaded={props.importsLoaded}
        onAdd={props.onAddImport}
        onUpdate={props.onUpdateImport}
        onDelete={props.onDeleteImport}
        toast={props.toast}
      />
    )
  }
  return <GenericPage {...props} />
}

/* ---------- cell renderer (matches v2 HTML) ---------- */
function Cell({ f, v }: { f: Field; v: string | number }) {
  if (f.type === 'num') return <>{Number(v).toLocaleString('en-IN')}</>
  const s = String(v)
  if (/^(Paid|Active|Ready)$/.test(s)) return <span className="pill">{s}</span>
  if (/^(Pending|Inactive)$/.test(s)) return <span className="pill w">{s}</span>
  return <>{s}</>
}

function GenericPage({
  mod,
  groups,
  groupsLoaded,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  toast,
}: ModulePageProps) {
  const [q, setQ] = useState('')
  const [F, setF] = useState({ a: '', b: '' })
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [items, setItems] = useState<(string)[][]>([])
  const [saving, setSaving] = useState(false)
  const [armed, setArmed] = useState<string | null>(null)
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const records = groups[mod.id] ?? []

  // product names master (for pn datalist) — from the Product module
  const names = useMemo(() => {
    const set = new Set<string>()
    for (const r of groups['product'] ?? [])
      for (const it of r.items) if (it[0]) set.add(String(it[0]))
    return [...set]
  }, [groups])

  const blank = () => mod.cols.map((c) => (c.type === 'sel' ? (c.options?.[0] ?? '') : ''))

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return records
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      .map((r) => ({
        r,
        its: r.items.filter(
          (it) => !needle || it.join(' ').toLowerCase().includes(needle)
        ),
      }))
      .filter(({ r, its }) => {
        if (F.a && r.date < F.a) return false
        if (F.b && r.date > F.b) return false
        return its.length > 0
      })
  }, [records, q, F])

  const openNew = () => {
    setEditId(null)
    setDate(todayStr())
    setItems([blank()])
    setFormOpen(true)
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: 'nearest' }))
  }

  const openEdit = (rec: GroupRec) => {
    setEditId(rec.id)
    setDate(rec.date)
    setItems(rec.items.map((i) => i.map((v) => String(v))))
    setFormOpen(true)
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: 'nearest' }))
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditId(null)
  }

  const save = async () => {
    if (!date) {
      toast('Please pick a date')
      return
    }
    const rows = items.filter((r) =>
      r.some((v, i) => v && mod.cols[i].type !== 'sel')
    )
    if (!rows.length) {
      toast('Add at least one item')
      return
    }
    if (rows.some((r) => r.some((v) => v === ''))) {
      toast('Please fill all fields in every item')
      return
    }
    setSaving(true)
    const out = rows.map((r) =>
      r.map((v, i) => (mod.cols[i].type === 'num' ? Number(v) : v))
    )
    let msg = editId ? 'Entry updated' : 'Entry saved'
    const other = records.find((x) => x.date === date && x.id !== editId)
    try {
      if (editId) {
        await onUpdateGroup(mod.id, editId, date, out)
        if (other) {
          await onUpdateGroup(mod.id, other.id, date, [...other.items, ...out])
          onDeleteGroup(mod.id, editId)
          msg = 'Merged into existing date'
        }
      } else if (other) {
        await onUpdateGroup(mod.id, other.id, date, [...other.items, ...out])
        msg = 'Added to existing date'
      } else {
        await onCreateGroup(mod.id, date, out)
      }
      toast(msg)
      closeForm()
    } finally {
      setSaving(false)
    }
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
    onDeleteGroup(mod.id, id)
  }

  const setItem = (ri: number, ci: number, v: string) =>
    setItems((prev) => prev.map((row, i) => (i === ri ? row.map((x, j) => (j === ci ? v : x)) : row)))

  const removeItem = (ri: number) => {
    setItems((prev) => prev.filter((_, i) => i !== ri))
  }

  const addItem = () => {
    setItems((prev) => [...prev, blank()])
  }

  const input = (c: Field, ri: number, ci: number, autoFocus = false) => {
    const t = c.type || 'txt'
    const v = items[ri]?.[ci] ?? ''
    if (t === 'sel')
      return (
        <select
          value={v}
          aria-label={c.label}
          autoFocus={autoFocus}
          onChange={(e) => setItem(ri, ci, e.target.value)}
        >
          {(c.options ?? []).map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )
    return (
      <>
        <input
          data-c={ci}
          type={t === 'num' ? 'number' : t === 'time' ? 'time' : 'text'}
          min={t === 'num' ? 0 : undefined}
          step={t === 'num' ? 'any' : undefined}
          list={t === 'pn' ? 'pnl' : undefined}
          autoComplete={t === 'pn' ? 'off' : undefined}
          value={v}
          placeholder={c.label}
          aria-label={c.label}
          autoFocus={autoFocus}
          onChange={(e) => setItem(ri, ci, e.target.value)}
        />
      </>
    )
  }

  return (
    <>
      <div className="ph">
        <div>
          <div className="crumb">Dashboard / {mod.n}</div>
          <h2>{mod.n}</h2>
          <div className="sub">{mod.d}</div>
        </div>
        <button className="btn" onClick={openNew}>
          <Ic name="plus" />
          New entry
        </button>
      </div>

      <div className="bar">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={'Search in ' + mod.n}
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
          <h3>{editId ? 'Edit' : 'New'} entry</h3>
          <div className="fm">
            <label className="fl">
              <span className="lbl">Date</span>
              <input
                type="date"
                value={date}
                aria-label="Date"
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
          <div className="tw2">
            <table className="it">
              <thead>
                <tr>
                  <th>#</th>
                  {mod.cols.map((c) => (
                    <th key={c.label}>{c.label}</th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    {mod.cols.map((c, ci) => (
                      <td key={ci}>{input(c, i, ci, i === 0 && ci === 0)}</td>
                    ))}
                    <td>
                      <button
                        className="x"
                        onClick={() => removeItem(i)}
                        aria-label="Remove item"
                        title="Remove item"
                        disabled={items.length < 2}
                      >
                        <Ic name="x" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <datalist id="pnl">
            {names.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
          <div className="fa">
            <button
              className="btn g"
              onClick={() => {
                addItem()
                requestAnimationFrame(() => {
                  const rows = formRef.current?.querySelectorAll('tbody tr')
                  const last = rows?.[rows.length - 1]
                  last?.querySelector<HTMLElement>('input, select')?.focus()
                })
              }}
            >
              <Ic name="plus" />
              Add item
            </button>
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
        {!groupsLoaded ? (
          <div className="empty">Loading entries…</div>
        ) : visible.length === 0 ? (
          <div className="empty">No entries found. Use “New entry” to add one.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                {mod.cols.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
                <th className="ac"></th>
              </tr>
            </thead>
            {visible.map(({ r, its }) => (
              <tbody className="grp" key={r.id}>
                {its.map((it, i) => (
                  <tr key={i}>
                    {i === 0 && (
                      <td className="dt" rowSpan={its.length}>
                        {fd(r.date)}
                        <small>
                          {r.items.length} item{r.items.length > 1 ? 's' : ''}
                        </small>
                      </td>
                    )}
                    {it.map((v, ci) => (
                      <td key={ci}>
                        <Cell f={mod.cols[ci]} v={v} />
                      </td>
                    ))}
                    {i === 0 && (
                      <td className="ac" rowSpan={its.length}>
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
                    )}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        )}
      </div>
    </>
  )
}
