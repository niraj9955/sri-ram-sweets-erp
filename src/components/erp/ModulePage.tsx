'use client'

import { useMemo, useState } from 'react'
import type { ErpModule } from '@/lib/erp-data'
import { Ic } from './ErpIcons'

interface ModulePageProps {
  mod: ErpModule
  onAdd: (modId: string, row: string[]) => void
  onDelete: (modId: string, rowIndex: number) => void
  toast: (msg: string) => void
}

const GREEN = /^(Paid|Active|Ready)$/

function Cell({ v }: { v: string }) {
  if (GREEN.test(v)) return <span className="pill">{v}</span>
  if (v === 'Pending') return <span className="pill w">{v}</span>
  return <>{v}</>
}

export default function ModulePage({ mod, onAdd, onDelete, toast }: ModulePageProps) {
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [vals, setVals] = useState<string[]>(() => mod.cols.map(() => ''))

  // visible rows keep their ORIGINAL index so delete targets the right entry
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return mod.rows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => !needle || r.join(' ').toLowerCase().includes(needle))
  }, [mod.rows, q])

  const save = () => {
    const row = vals.map((v) => v.trim())
    if (row.some((v) => !v)) {
      toast('Please fill all fields')
      return
    }
    onAdd(mod.id, row)
    setVals(mod.cols.map(() => ''))
    setFormOpen(false)
  }

  return (
    <>
      <div className="ph">
        <div>
          <div className="crumb">Dashboard / {mod.n}</div>
          <h2>{mod.n}</h2>
          <div className="sub">{mod.d}</div>
        </div>
        <button
          className="btn"
          onClick={() => {
            setFormOpen(true)
            setVals(mod.cols.map(() => ''))
          }}
        >
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
      </div>

      {formOpen && (
        <div className="panel fm">
          {mod.cols.map((c, i) => (
            <input
              key={c}
              value={vals[i]}
              placeholder={c}
              aria-label={c}
              onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
              }}
            />
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={save}>
              Save entry
            </button>
            <button className="btn g" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="panel tw">
        {visible.length === 0 ? (
          <div className="empty">No entries found. Use “New entry” to add one.</div>
        ) : (
          <table>
            <thead>
              <tr>
                {mod.cols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ r, i }) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <td key={j}>
                      <Cell v={v} />
                    </td>
                  ))}
                  <td style={{ width: 40 }}>
                    <button
                      className="x"
                      onClick={() => onDelete(mod.id, i)}
                      aria-label="Delete entry"
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
  )
}
