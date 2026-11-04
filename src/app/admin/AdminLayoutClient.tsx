'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊', permission: 'analytics:read' },
  { href: '/admin/menu', label: 'Menú', icon: '🍽️', permission: 'menu:read' },
  { href: '/admin/tables', label: 'Mesas', icon: '🪑', permission: 'tables:read' },
  { href: '/admin/orders', label: 'Pedidos', icon: '📋', permission: 'orders:read' },
  { href: '/admin/kitchen', label: 'Cocina', icon: '👨‍🍳', permission: 'orders:read' },
  { href: '/admin/staff', label: 'Personal', icon: '👥', permission: 'staff:read' },
  { href: '/admin/analytics', label: 'Analíticas', icon: '📈', permission: 'analytics:read' },
  { href: '/admin/settings', label: 'Ajustes', icon: '⚙️', permission: 'settings:read' },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout, hasPermission } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredNav = ADMIN_NAV.filter(item => 
    item.permission === 'analytics:read' || hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-amber-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-amber-100 transform transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-amber-100">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <span className="text-white text-xl">🍽️</span>
              </div>
              <div>
                <h1 className="font-bold text-amber-900">Admin</h1>
                <p className="text-xs text-amber-500">La Casa del Sabor</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-amber-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900 truncate">{user?.name}</p>
                <p className="text-xs text-amber-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl lg:text-2xl font-bold text-amber-900">
                {ADMIN_NAV.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <Link
                href="/admin/orders/new"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Pedido
              </Link>

              {/* View Restaurant */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                title="Ver carta pública"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                </svg>
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}