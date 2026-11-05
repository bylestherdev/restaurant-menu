'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState('/')

  // Track path changes - only on client
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname)
    }
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    // Check initial path on mount
    setCurrentPath(window.location.pathname)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Initial set - only on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  const isAuthenticated = propIsAuthenticated // Default: assume authenticated for public pages
  const userRole = propUserRole || null

  const routes: NavbarRoute[] = isAuthenticated ? [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/loyalty', label: 'Club', icon: '🎁' },
    { href: '/admin', label: 'Admin', icon: '📊', requiresRole: 'owner' },
  ] : [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/loyalty', label: 'Club', icon: '🎁' },
    { href: '/waiter/login', label: 'Camarero', icon: '👨‍🍳' },
  ]

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xl">
              🍽️
            </div>
            <div>
              <h1 className="font-bold text-xl text-amber-900">La Casa del Sabor</h1>
              <p className="text-xs text-amber-600">Menú interactivo</p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            {routes.map((route, index) => {
              const requiresRole = route.requiresRole
              const userHasRole = userRole === requiresRole
              const canAccess = !requiresRole || userHasRole

              if (!canAccess) return null

              const isActive = currentPath === route.href

              return (
                <Link
                  key={index}
                  href={route.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-amber-700 bg-amber-50' : 'text-amber-500 hover:text-amber-700'
                    }
                  `}
                >
                  <span className="text-{isActive ? 'amber-600' : 'amber-400'} text-xl">{route.icon}</span>
                  <span>{route.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Auth actions - only show if we have auth info */}
          {propIsAuthenticated !== undefined ? (
            <div className="hidden md:flex items-center gap-3">
              {propIsAuthenticated ? (
                <>
                  <span className="text-amber-500 text-sm hidden sm:block">{userRole || 'Cliente'}</span>
                  <button
                    onClick={() => router.push('/admin')}
                    className="p-2 text-amber-500 hover:text-amber-700 rounded-md"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => router.push('/waiter')}
                    className="p-2 text-amber-500 hover:text-amber-700 rounded-md"
                  >
                    Camarero
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push('/waiter/login')}
                  className="p-2 bg-amber-600 text-white rounded-md text-sm"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
