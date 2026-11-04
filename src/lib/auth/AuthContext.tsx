'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AdminUser } from '@/types/admin';

const DEMO_USERS: Record<string, { password: string; user: AdminUser }> = {
  'owner@restaurante.com': {
    password: 'owner123',
    user: {
      id: '1',
      email: 'owner@restaurante.com',
      name: 'María García (Dueña)',
      role: 'owner',
      createdAt: Date.now() - 86400000 * 365,
    },
  },
  'manager@restaurante.com': {
    password: 'manager123',
    user: {
      id: '2',
      email: 'manager@restaurante.com',
      name: 'Carlos Ruiz (Gerente)',
      role: 'manager',
      createdAt: Date.now() - 86400000 * 180,
    },
  },
  'camarero1@restaurante.com': {
    password: 'camarero123',
    user: {
      id: '3',
      email: 'camarero1@restaurante.com',
      name: 'Ana López (Camarera)',
      role: 'waiter',
      createdAt: Date.now() - 86400000 * 90,
    },
  },
  'cocina@restaurante.com': {
    password: 'cocina123',
    user: {
      id: '4',
      email: 'cocina@restaurante.com',
      name: 'Chef Pedro (Cocina)',
      role: 'kitchen',
      createdAt: Date.now() - 86400000 * 200,
    },
  },
};

const ROLE_PERMISSIONS: Record<AdminUser['role'], string[]> = {
  owner: ['*'], // All permissions
  manager: [
    'menu:read', 'menu:write', 'menu:delete',
    'tables:read', 'tables:write',
    'orders:read', 'orders:write', 'orders:manage',
    'staff:read', 'staff:write',
    'analytics:read',
    'settings:read', 'settings:write',
  ],
  waiter: [
    'menu:read',
    'tables:read', 'tables:write',
    'orders:read', 'orders:write',
    'orders:create',
  ],
  kitchen: [
    'menu:read',
    'orders:read', 'orders:update_status',
  ],
};

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: AdminUser['role'][]) => boolean;
  updateUser: (data: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    permissions: [],
  });

  useEffect(() => {
    // Check for saved session
    const saved = localStorage.getItem('admin-session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        // Session expires after 24 hours
        if (Date.now() - session.loginTime < 24 * 60 * 60 * 1000) {
          const userData = DEMO_USERS[session.email];
          if (userData) {
            const user = { ...userData.user, lastLogin: Date.now() };
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              permissions: ROLE_PERMISSIONS[user.role] || [],
            });
            return;
          }
        }
      } catch {
        // Invalid session
      }
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const userData = DEMO_USERS[email.toLowerCase()];
    
    if (!userData || userData.password !== password) {
      return { success: false, error: 'Credenciales incorrectas' };
    }

    const user = { ...userData.user, lastLogin: Date.now() };
    const permissions = ROLE_PERMISSIONS[user.role] || [];

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      permissions,
    });

    localStorage.setItem('admin-session', JSON.stringify({
      email: email.toLowerCase(),
      loginTime: Date.now(),
    }));

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin-session');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: [],
    });
  }, []);

  const hasPermission = useCallback((permission: string) => {
    if (!state.isAuthenticated) return false;
    if (state.permissions.includes('*')) return true;
    return state.permissions.includes(permission);
  }, [state.permissions]);

  const hasRole = useCallback((roles: AdminUser['role'][]) => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  const updateUser = useCallback((data: Partial<AdminUser>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...data } : null,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasPermission,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}