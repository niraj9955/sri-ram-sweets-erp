import type { ReactNode } from 'react'

const P: Record<string, ReactNode> = {
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  import: <path d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" />,
  product: <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7.5 7.5h.01" />,
  prod: <path d="M12 2l10 5-10 5L2 7zM2 12l10 5 10-5M2 17l10 5 10-5" />,
  sale: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  bal: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
  ret: <path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />,
  rep: <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9zM14 3v6h6M8 13h8M8 17h8" />,
  bill: <path d="M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  del: <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
  bell: <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />,
}

export function Ic({ name }: { name: string }) {
  return (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      {P[name] ?? null}
    </svg>
  )
}

export function BrandLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 48 48" aria-label="Sri Ram Sweets logo">
      <circle cx="24" cy="24" r="23" fill="#d9780a" />
      <circle cx="24" cy="24" r="20" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1" />
      <circle cx="24" cy="27" r="11" fill="#7c2d12" />
      <circle cx="20" cy="23" r="1.8" fill="#fbd38d" />
      <circle cx="27" cy="22" r="1.8" fill="#fbd38d" />
      <circle cx="24" cy="29" r="1.8" fill="#fbd38d" />
      <circle cx="18" cy="30" r="1.8" fill="#fbd38d" />
      <circle cx="30" cy="29" r="1.8" fill="#fbd38d" />
      <path d="M24 16c-3-5-8-5-9-2 3 0 6 1 9 2zM24 16c3-5 8-5 9-2-3 0-6 1-9 2z" fill="#fff" />
    </svg>
  )
}
