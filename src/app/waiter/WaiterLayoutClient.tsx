'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function WaiterLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [didInit, setDidInit] = useState(false);

  // Efecto de inicialización UNA SOLA VEZ (sin router en deps)
  useEffect(() => {
    if (!didInit) {
      setDidInit(true);
      // Delay corto para estabilizar el contexto auth
      const timeoutId = setTimeout(() => {
        // Verificar estado después de init
        if (isAuthenticated && !isLoading && hasRole(['waiter', 'manager', 'owner'])) {
          setIsReady(true);
        } else if (!isAuthenticated) {
          // Navegar al login solo si no ya estamos ahí
          if (pathname !== '/waiter/login') {
            router.push('/waiter/login');
          }
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, []); // ¡Solo se ejecuta UNA VEZ!

  // Efecto secundario después de init - SIN router en deps
  useEffect(() => {
    if (didInit) {
      // No hace falta observar routeChange, el didInit ya manejó el navigation
      // Solo aseguramos que el estado sea consistente
      if (!isReady && isAuthenticated && !isLoading && hasRole(['waiter', 'manager', 'owner'])) {
        setIsReady(true);
      }
    }
  }, [didInit, isAuthenticated, isLoading]);

  if (isLoading && !didInit) {
    // Mostrar spinner DURANTE la inicialización
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isReady && didInit) {
    // Si ya pasó el init y aún no está listo, redirigir
    if (!isAuthenticated) {
      router.push('/waiter/login');
    }
    // Mostrar spinner temporal mientras se verifica
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between h-14 px-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-white text-lg">👩‍💼</span>
            </div>
            <h1 className="font-bold text-amber-900 text-lg">Camarero</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-500 hidden sm:block">{user?.name}</span>
            <button onClick={logout} className="p-2 text-amber-500 hover:text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 px-2 py-1 z-40">
        <div className="flex items-center justify-around max-w-xl mx-auto">
          <WaiterNavLink href="/waiter" icon="🏠" label="Inicio" />
          <WaiterNavLink href="/waiter/tables" icon="🪑" label="Mesas" />
          <WaiterNavLink href="/waiter/orders" icon="📋" label="Pedidos" />
          <WaiterNavLink href="/waiter/calls" icon="🔔" label="Llamadas" badge={3} />
        </div>
      </nav>
    </div>
  )
}

function WaiterNavLink({ href, icon, label, badge }: { href: string; icon: string; label: string; badge?: number }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 px-3 py-2 text-amber-600 hover:text-amber-800 transition-colors relative">
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </a>
  );
}
