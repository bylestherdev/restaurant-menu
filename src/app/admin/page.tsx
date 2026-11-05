'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAnalytics, getTables, getOrders, getMenuItems, subscribeToAdminData } from '@/lib/adminStore';
import { AnalyticsData, Table, Order } from '@/types/admin';

const STAT_CARDS = [
  { key: 'totalOrders', label: 'Pedidos Hoy', icon: '📋', color: 'bg-blue-500' },
  { key: 'totalRevenue', label: 'Ingresos Hoy', icon: '💰', color: 'bg-green-500', isCurrency: true },
  { key: 'averageTicket', label: 'Ticket Medio', icon: '🧾', color: 'bg-purple-500', isCurrency: true },
  { key: 'activeTables', label: 'Mesas Ocupadas', icon: '🪑', color: 'bg-amber-500' },
];

export default function AdminDashboard() {
  const { hasPermission } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setAnalytics(getAnalytics());
      setTables(getTables());
      setRecentOrders(getOrders().slice(0, 10));
      setMenuItems(getMenuItems());
      setIsLoading(false);
    };

    loadData();
    const unsubscribe = subscribeToAdminData(loadData);
    return unsubscribe;
  }, []);

  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;
  const freeTables = tables.filter(t => t.status === 'free').length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(() => (
          <div key={Math.random()} className="bg-white rounded-xl border border-amber-100 p-6 animate-pulse">
            <div className="h-4 bg-amber-100 rounded w-3/4 mb-2" />
            <div className="h-8 bg-amber-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value={analytics?.totalOrders || 0}
          label="Pedidos Hoy"
          icon="📋"
          color="bg-blue-500"
          trend="+12%"
          trendPositive
        />
        <StatCard
          value={formatCurrency(analytics?.totalRevenue || 0)}
          label="Ingresos Hoy"
          icon="💰"
          color="bg-green-500"
          trend="+8%"
          trendPositive
        />
        <StatCard
          value={formatCurrency(analytics?.averageTicket || 0)}
          label="Ticket Medio"
          icon="🧾"
          color="bg-purple-500"
          trend="-2%"
          trendPositive={false}
        />
        <StatCard
          value={occupiedTables}
          label="Mesas Ocupadas"
          icon="🪑"
          color="bg-amber-500"
          subValue={`${reservedTables} reservadas · ${freeTables} libres`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Orders & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/admin/orders/new" className="bg-white rounded-xl border border-amber-100 p-4 hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Nuevo Pedido</p>
                  <p className="text-sm text-amber-500">Tomar comanda rápida</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/tables" className="bg-white rounded-xl border border-amber-100 p-4 hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Gestionar Mesas</p>
                  <p className="text-sm text-amber-500">{tables.length} mesas totales</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/menu" className="bg-white rounded-xl border border-amber-100 p-4 hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Editar Menú</p>
                  <p className="text-sm text-amber-500">{menuItems.length} platos</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between">
              <h2 className="font-semibold text-amber-900">Pedidos Recientes</h2>
              <Link href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-800 font-medium">Ver todos</Link>
            </div>
            <div className="divide-y divide-amber-100">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-amber-500">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No hay pedidos recientes</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="p-4 hover:bg-amber-50 transition-colors flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                      #{order.id.slice(-4)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-amber-900 truncate">Mesa {order.tableNumber}</p>
                      <p className="text-sm text-amber-500">{order.items.length} platos · {formatCurrency(order.total)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm text-amber-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Top Items & Table Status */}
        <div className="space-y-6">
          {/* Top Selling Items */}
          <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between">
              <h2 className="font-semibold text-amber-900">Más Vendidos</h2>
              <Link href="/admin/analytics" className="text-sm text-amber-600 hover:text-amber-800 font-medium">Ver analíticas</Link>
            </div>
            <div className="divide-y divide-amber-100">
              {analytics?.topItems.slice(0, 5).map((item, index) => (
                <div key={item.itemId} className="p-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900 truncate">{item.name}</p>
                    <p className="text-sm text-amber-500">{item.count} vendidos · {formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
              {(!analytics?.topItems.length) && (
                <div className="p-8 text-center text-amber-500 text-sm">Sin datos de ventas</div>
              )}
            </div>
          </div>

          {/* Table Visual Status */}
          <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between">
              <h2 className="font-semibold text-amber-900">Estado de Mesas</h2>
              <Link href="/admin/tables" className="text-sm text-amber-600 hover:text-amber-800 font-medium">Plano</Link>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <TableLegend color="bg-green-500" label="Libres" count={freeTables} />
                <TableLegend color="bg-amber-500" label="Ocupadas" count={occupiedTables} />
                <TableLegend color="bg-blue-500" label="Reservadas" count={reservedTables} />
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                {tables.slice(0, 15).map((table) => (
                  <Link key={table.id} href={`/admin/tables/${table.id}`} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center transition-all ${getTableStatusColor(table.status)}`}>
                    <span className="font-bold text-lg">{table.number}</span>
                    <span className="text-xs opacity-80">{table.name || ''}</span>
                    <span className="text-xs opacity-70">{table.capacity} pax</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  value, label, icon, color, trend, trendPositive, subValue 
}: { 
  value: string | number;
  label: string;
  icon: string;
  color: string;
  trend?: string;
  trendPositive?: boolean;
  subValue?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-amber-100 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-amber-600 font-medium">{label}</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{value}</p>
          {subValue && <p className="text-xs text-amber-500 mt-1">{subValue}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={`text-sm font-medium ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trendPositive ? '↑' : '↓'} {trend}
          </span>
          <span className="text-sm text-amber-500">vs ayer</span>
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const config: Record<Order['status'], { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pendiente' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmado' },
    preparing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Preparando' },
    ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Listo' },
    served: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Servido' },
    paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pagado' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
  };
  
  const c = config[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function TableLegend({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-amber-700">{label}</span>
      <span className="font-bold text-amber-900 ml-auto">{count}</span>
    </div>
  );
}

function getTableStatusColor(status: Table['status']): string {
  switch (status) {
    case 'free': return 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200';
    case 'occupied': return 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200';
    case 'reserved': return 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200';
    case 'cleaning': return 'bg-gray-100 text-gray-600 border border-gray-200';
    case 'maintenance': return 'bg-red-100 text-red-800 border border-red-200';
    default: return 'bg-gray-100 text-gray-600';
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};