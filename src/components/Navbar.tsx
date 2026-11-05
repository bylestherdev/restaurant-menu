'use client'

import { useState } from 'react'
import Link from 'next/link'

type NavbarRoute = {
  href: string
  label: string
  icon: string
  requiresRole?: 'owner' | 'manager' | 'waiter'
}

type NavbarProps = {
  isAuthenticated?: boolean
  userRole?: 'owner' | 'manager' | 'waiter' | null
}

export function Navbar({ isAuthenticated: propIsAuthenticated, userRole: propUserRole }: NavbarProps = {}) {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const routes: NavbarRoute[] = propIsAuthenticated ? [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/loyalty', label: 'Club', icon: '🎁' },
    { href: '/admin', label: 'Admin', icon: '📊', requiresRole: 'owner' },
  ] : [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/loyalty', label: 'Club', icon: '🎁' },
    { href: '/waiter/login', label: 'Camarero', icon: '👨‍🍳' },
  ]

  const isOwner = propUserRole === 'owner'

  // Link click handler - closes both menus
  const handleLinkClick = () => {
    setMobileOpen(false)
    setOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 w-full md:top-4 md:left-1/2 md:-translate-x-1/2 md:max-w-[1100px] isolate z-[100] px-0 md:px-4">
      <div className="w-full px-5 sm:px-6 bg-[rgba(28,20,17,0.85)] backdrop-blur-[14px] border-0 md:border md-border-[var(--border)] rounded-none md:rounded-[2rem] h-16 md:h-16 flex items-center justify-between shadow-xl">
        <Link
          href="/"
          onClick={() => {
            setMobileOpen(false)
            setOpen(false)
          }}
          className="font-bold text-xl tracking-tight text-amber-900 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(245,156,66,0.75)]"
        >
          La Casa<span className="text-amber-600"> del Sabor</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {routes.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`
                text-sm text-amber-600 transition-all duration-200 hover:text-amber-800 hover:drop-shadow-[0_0_8px_rgba(245,156,66,0.75)] ${
                  l.requiresRole && !isOwner ? 'hidden' : ''
                }
              `}
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          className="md:hidden text-amber-500 hover:text-amber-600 p-2"
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Menú móvil - fullscreen */}
      <div
        className={`fixed inset-0 bg-amber-950 z-[90] md:hidden flex flex-col px-6 py-6 transition-all duration-300 ${
          mobileOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between h-16">
          <Link href="/" onClick={() => setMobileOpen(false)} className="font-bold text-xl text-amber-900">
            La Casa<span className="text-amber-600"> del Sabor</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-amber-400 p-2" aria-label="Cerrar menú">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 flex flex-col justify-center gap-2">
          {routes.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => {
                setMobileOpen(false)
                handleLinkClick()
              }}
              className="text-amber-100 text-xl font-medium py-4 border-b border-amber-500/10"
            >
              {l.icon} {l.label}
            </Link>
          ))}
          {/* Auth actions in mobile */}
          {propIsAuthenticated ? (
            <>
              <span className="text-amber-400 text-sm hidden sm:block">{propUserRole || 'Cliente'}</span>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    // Navigate to admin
                    window.location.href = '/admin'
                  }}
                  className="text-amber-300 text-sm py-2 px-4 rounded bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    // Navigate to waiter
                    window.location.href = '/waiter'
                  }}
                  className="text-amber-300 text-sm py-2 px-4 rounded bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
                >
                  Camarero
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileOpen(false)
                window.location.href = '/waiter/login'
              }}
              className="text-amber-300 text-sm py-2 px-4 rounded bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
            >
              Iniciar sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
