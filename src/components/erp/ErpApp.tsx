'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { MODULES, type ErpModule } from '@/lib/erp-data'
import { BrandLogo, Ic } from './ErpIcons'
import Dashboard from './Dashboard'
import ModulePage from './ModulePage'

const subscribeNoop = () => () => {}
const formatDate = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export default function ErpApp() {
  const [mods, setMods] = useState<ErpModule[]>(MODULES)
  const [cur, setCur] = useState('home')
  const [mini, setMini] = useState(false) // desktop collapsed sidebar
  const [open, setOpen] = useState(false) // mobile overlay sidebar
  // initialized on client so first paint already respects system theme
  // (state never affects rendered JSX, so no hydration risk)
  const [dark, setDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const today = useSyncExternalStore(subscribeNoop, formatDate, () => '')
  const mainRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toast = useCallback((t: string) => {
    setToastMsg(t)
    setToastShow(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastShow(false), 2200)
  }, [])

  const go = useCallback((id: string) => {
    setCur(id)
    setOpen(false) // close mobile drawer on navigation
    mainRef.current?.scrollTo(0, 0)
  }, [])

  const addRow = useCallback(
    (modId: string, row: string[]) => {
      setMods((prev) =>
        prev.map((m) => (m.id === modId ? { ...m, rows: [row, ...m.rows] } : m))
      )
      toast('Entry saved')
    },
    [toast]
  )

  const deleteRow = useCallback(
    (modId: string, rowIndex: number) => {
      setMods((prev) =>
        prev.map((m) =>
          m.id === modId ? { ...m, rows: m.rows.filter((_, i) => i !== rowIndex) } : m
        )
      )
      toast('Entry deleted')
    },
    [toast]
  )

  const onGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const v = e.currentTarget.value.trim().toLowerCase()
    if (!v) return
    const m = mods.find((x) => x.n.toLowerCase().includes(v))
    if (m) {
      go(m.id)
      if (searchRef.current) searchRef.current.value = ''
    } else {
      toast('No module found')
    }
  }

  const toggleSidebar = () => {
    if (window.innerWidth <= 860) setOpen((o) => !o)
    else setMini((m) => !m)
  }

  const appCls = 'app' + (mini ? ' mini' : '') + (open ? ' open' : '')
  const curMod = cur === 'home' ? null : mods.find((m) => m.id === cur)
  const userName = 'Ram'

  return (
    <div className={appCls}>
      <aside aria-label="Main menu">
        <div className="brand">
          <BrandLogo />
          <div>
            <b>Sri Ram</b>
            <span>Sweets &amp; Namkeen</span>
          </div>
        </div>
        <div className="mt">Menu</div>
        <ul className="nav">
          <li>
            <button
              className={cur === 'home' ? 'on' : ''}
              onClick={() => go('home')}
              aria-current={cur === 'home' ? 'page' : undefined}
            >
              <Ic name="home" />
              <span className="lb">Dashboard</span>
            </button>
          </li>
          {mods.map((m) => (
            <li key={m.id}>
              <button
                className={cur === m.id ? 'on' : ''}
                onClick={() => go(m.id)}
                aria-current={cur === m.id ? 'page' : undefined}
              >
                <Ic name={m.id} />
                <span className="lb">{m.n}</span>
                <span className="bd">{m.rows.length}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="sfo">Sri Ram Sweets ERP v1.0</div>
      </aside>

      <div className="ov" onClick={() => setOpen(false)} />

      <header>
        <button className="ib" onClick={toggleSidebar} aria-label="Toggle menu">
          <Ic name="menu" />
        </button>
        <div className="sr">
          <Ic name="search" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search modules, press Enter"
            aria-label="Search modules"
            onKeyDown={onGlobalSearch}
          />
        </div>
        <div className="sp" />
        <button
          className="ib"
          onClick={() => setDark((d) => !d)}
          aria-label="Switch theme"
        >
          <Ic name="moon" />
        </button>
        <button className="ib" aria-label="Notifications">
          <Ic name="bell" />
          <span className="dot" />
        </button>
        <div className="user">
          <div className="av">RS</div>
          <div>
            Ram Sharma
            <small>Administrator</small>
          </div>
        </div>
      </header>

      <main ref={mainRef}>
        {curMod ? (
          <ModulePage
            key={curMod.id}
            mod={curMod}
            onAdd={addRow}
            onDelete={deleteRow}
            toast={toast}
          />
        ) : (
          <Dashboard mods={mods} userName={userName} go={go} />
        )}
      </main>

      <footer>
        <span>© 2026 Sri Ram Sweets. All rights reserved.</span>
        <span>{today}</span>
      </footer>

      <div className={'toast' + (toastShow ? ' s' : '')} role="status">
        {toastMsg}
      </div>
    </div>
  )
}
