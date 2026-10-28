'use client'

import { DASHBOARD, type ErpModule } from '@/lib/erp-data'
import { Ic } from './ErpIcons'

interface DashboardProps {
  mods: ErpModule[]
  userName: string
  go: (id: string) => void
}

export default function Dashboard({ mods, userName, go }: DashboardProps) {
  const mx = Math.max(...DASHBOARD.sales)

  return (
    <>
      <div className="ph">
        <div>
          <div className="crumb">Overview</div>
          <h2>Dashboard</h2>
          <div className="sub">Welcome back, {userName}. Here is how the shop is doing today.</div>
        </div>
      </div>

      <div className="stats">
        {DASHBOARD.stats.map((s) => (
          <div className="stat" key={s.label}>
            <p>{s.label}</p>
            <strong>{s.value}</strong>
            <span className={'tr' + (s.down ? ' dn' : '')}>{s.trend}</span>
          </div>
        ))}
      </div>

      <div className="two">
        <div className="panel">
          <h3>Sales this week</h3>
          <div className="chart">
            {DASHBOARD.sales.map((v, i) => (
              <div className={i === 6 ? 't' : ''} key={DASHBOARD.days[i]}>
                <span>₹{v}k</span>
                <i style={{ height: Math.round((v / mx) * 100) + '%' }} />
                {DASHBOARD.days[i]}
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Recent activity</h3>
          <ul className="act">
            {DASHBOARD.activity.map((a) => (
              <li key={a.title}>
                <div>
                  {a.title}
                  <em>{a.meta}</em>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3>Modules</h3>
      <div className="grid">
        {mods.map((m) => (
          <button className="card" key={m.id} onClick={() => go(m.id)}>
            <div className="ci">
              <Ic name={m.id} />
            </div>
            <div>
              <b>{m.n}</b>
              <span>{m.d}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
