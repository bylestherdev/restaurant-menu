'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
    setIsLoading(false);
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 mx-auto mb-4">
            <span className="text-white text-3xl">🍽️</span>
          </Link>
          <h1 className="text-2xl font-bold text-amber-900">Panel de Administración</h1>
          <p className="text-amber-600 mt-1">La Casa del Sabor</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-800 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400 transition-all"
                placeholder="owner@restaurante.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-800 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400 transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Acceder al panel'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center justify-center gap-1"
            >
              {showDemo ? 'Ocultar' : 'Mostrar'} cuentas de prueba
              <svg className={`w-4 h-4 transition-transform ${showDemo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDemo && (
              <div className="mt-4 space-y-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-600 text-center mb-2">Click para autocompletar</p>
                {[
                  { email: 'owner@restaurante.com', password: 'owner123', label: '👑 Dueña', desc: 'Acceso total' },
                  { email: 'manager@restaurante.com', password: 'manager123', label: '👔 Gerente', desc: 'Gestión completa' },
                  { email: 'camarero1@restaurante.com', password: 'camarero123', label: '👩‍💼 Camarera', desc: 'Pedidos y mesas' },
                  { email: 'cocina@restaurante.com', password: 'cocina123', label: '👨‍🍳 Cocina', desc: 'Ver y preparar' },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => fillDemo(demo.email, demo.password)}
                    className="w-full p-3 text-left bg-white border border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors"
                  >
                    <div className="font-medium text-amber-900">{demo.label}</div>
                    <div className="text-xs text-amber-500">{demo.desc}</div>
                    <div className="text-xs text-amber-400 font-mono mt-1">{demo.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Back to public */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-amber-500 hover:text-amber-700 text-sm font-medium flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a la carta pública
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}