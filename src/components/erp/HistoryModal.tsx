'use client'

import { useMemo } from 'react'
import type { ImportEntry } from '@/lib/erp-data'

interface HistoryModalProps {
  material: string
  entries: ImportEntry[] // all import entries
  onClose: () => void
}

const fmt = (n: number) => n.toLocaleString('en-IN')

export default function HistoryModal({ material, entries, onClose }: HistoryModalProps) {
  const rows = useMemo(
    () =>
      entries
        .filter((e) => e.material === material)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [entries, material]
  )

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, e) => ({
          qty: acc.qty + e.qty,
          amount: acc.amount + e.amount,
          transport: acc.transport + e.transport,
        }),
        { qty: 0, amount: 0, transport: 0 }
      ),
    [rows]
  )

  const vendors = useMemo(() => [...new Set(rows.map((r) => r.vendor))], [rows])

  return (
    <div className="ovm" onClick={onClose}>
      <div className="mdlg" role="dialog" aria-modal="true" aria-label={`${material} history`} onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <div>
            <b>{material} — History</b>
            <small>
              {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
              {vendors.length > 0 && ` · via ${vendors.join(', ')}`}
            </small>
          </div>
          <button className="x" onClick={onClose} aria-label="Close history">
            ✕
          </button>
        </div>
        <div className="mb">
          {rows.length === 0 ? (
            <div className="empty">No imports recorded for this material yet.</div>
          ) : (
            <>
              <div className="msum">
                <div>
                  <span>Total qty received</span>
                  <b>{fmt(totals.qty)} kg</b>
                </div>
                <div>
                  <span>Total material cost</span>
                  <b>₹{fmt(totals.amount)}</b>
                </div>
                <div>
                  <span>Total transport</span>
                  <b>₹{fmt(totals.transport)}</b>
                </div>
                <div>
                  <span>Grand total</span>
                  <b>₹{fmt(totals.amount + totals.transport)}</b>
                </div>
              </div>
              <div className="panel tw">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Vendor (kha se aaya)</th>
                      <th>Qty (kg)</th>
                      <th>Rate (₹)</th>
                      <th>Amount (₹)</th>
                      <th>Transport (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e) => (
                      <tr key={e.id}>
                        <td>{e.date}</td>
                        <td>{e.vendor}</td>
                        <td>{fmt(e.qty)}</td>
                        <td>{fmt(e.rate)}</td>
                        <td>{fmt(e.amount)}</td>
                        <td>{fmt(e.transport)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
