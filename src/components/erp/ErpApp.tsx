'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  MODULES,
  type GroupRec,
  type ImportEntry,
} from '@/lib/erp-data'
import { Ic } from './ErpIcons'
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

type GroupsMap = Record<string, GroupRec[]>

export default function ErpApp() {
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

  const [imports, setImports] = useState<ImportEntry[]>([])
  const [importsLoaded, setImportsLoaded] = useState(false)
  const [groups, setGroups] = useState<GroupsMap>({})
  const [groupsLoaded, setGroupsLoaded] = useState(false)

  // load material imports from database
  useEffect(() => {
    let alive = true
    fetch('/api/imports')
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d)) setImports(d)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setImportsLoaded(true)
      })
    return () => {
      alive = false
    }
  }, [])

  // load date-grouped entries (all modules) from database
  useEffect(() => {
    let alive = true
    fetch('/api/entries')
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !Array.isArray(d)) return
        const map: GroupsMap = {}
        for (const g of d as (GroupRec & { module: string })[]) {
          ;(map[g.module] ??= []).push({ id: g.id, date: g.date, items: g.items })
        }
        setGroups(map)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setGroupsLoaded(true)
      })
    return () => {
      alive = false
    }
  }, [])

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

  /* ---------- import CRUD ---------- */
  const addImport = useCallback(
    async (entry: Omit<ImportEntry, 'id'>) => {
      const res = await fetch('/api/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (!res.ok) {
        toast('Please fill date, qty, rate and vendor')
        return
      }
      const created: ImportEntry = await res.json()
      setImports((prev) => [created, ...prev].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)))
      toast('Entry saved')
    },
    [toast]
  )

  const updateImport = useCallback(
    async (id: string, entry: Omit<ImportEntry, 'id'>) => {
      const res = await fetch(`/api/imports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (!res.ok) {
        toast('Please fill date, qty, rate and vendor')
        return
      }
      const updated: ImportEntry = await res.json()
      setImports((prev) =>
        prev.map((e) => (e.id === id ? updated : e)).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      )
      toast('Entry updated')
    },
    [toast]
  )

  const deleteImport = useCallback(
    (id: string) => {
      setImports((prev) => prev.filter((e) => e.id !== id))
      fetch(`/api/imports/${id}`, { method: 'DELETE' }).catch(() => {})
      toast('Entry deleted')
    },
    [toast]
  )

  /* ---------- date-grouped module CRUD ---------- */
  const createGroup = useCallback(
    async (modId: string, date: string, items: string[][]) => {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: modId, date, items }),
      })
      if (!res.ok) throw new Error('create failed')
      const rec: GroupRec = await res.json()
      setGroups((prev) => ({ ...prev, [modId]: [...(prev[modId] ?? []), rec] }))
    },
    []
  )

  const updateGroup = useCallback(
    async (modId: string, id: string, date: string, items: string[][]) => {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, items }),
      })
      if (!res.ok) throw new Error('update failed')
      const rec: GroupRec = await res.json()
      setGroups((prev) => ({
        ...prev,
        [modId]: (prev[modId] ?? []).map((g) => (g.id === id ? rec : g)),
      }))
    },
    []
  )

  const deleteGroup = useCallback((modId: string, id: string) => {
    setGroups((prev) => ({ ...prev, [modId]: (prev[modId] ?? []).filter((g) => g.id !== id) }))
    fetch(`/api/entries/${id}`, { method: 'DELETE' }).catch(() => {})
  }, [])

  const onGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const v = e.currentTarget.value.trim().toLowerCase()
    if (!v) return
    const m = MODULES.find((x) => x.n.toLowerCase().includes(v))
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
  const curMod = cur === 'home' ? null : MODULES.find((m) => m.id === cur)

  return (
    <div className={appCls}>
      <aside aria-label="Main menu">
        <div className="brand">
          <img className="lg" src="/logo.png" alt="Sri Ram Sweets logo" />
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
          {MODULES.map((m) => (
            <li key={m.id}>
              <button
                className={cur === m.id ? 'on' : ''}
                onClick={() => go(m.id)}
                aria-current={cur === m.id ? 'page' : undefined}
              >
                <Ic name={m.id} />
                <span className="lb">{m.n}</span>
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
        <div className="hb">
          <img className="lg" src="/logo.png" alt="" />
          <b>Sri Ram Sweets</b>
        </div>
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
            imports={imports}
            importsLoaded={importsLoaded}
            groups={groups}
            groupsLoaded={groupsLoaded}
            onAddImport={addImport}
            onUpdateImport={updateImport}
            onDeleteImport={deleteImport}
            onCreateGroup={createGroup}
            onUpdateGroup={updateGroup}
            onDeleteGroup={deleteGroup}
            toast={toast}
          />
        ) : (
          <Dashboard go={go} />
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
