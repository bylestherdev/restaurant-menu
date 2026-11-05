'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTables, getOrders, updateTableStatus, subscribeToAdminData } from '@/lib/adminStore';
import { Table, Order } from '@/types/admin';

export default function WaiterHomePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadData = () => {
      setTables(getTables().sort((a, b) => a.number - b.number));
      setOrders(getOrders().filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(o.status)));
      setIsLoading(false);
    };
    loadData();
    return subscribeToAdminData(loadData);
  }, []);

  const statusCounts = {
    free: tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-3 space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Libres" count={statusCounts.free} color="bg-green-500" icon="✅" />
        <StatCard label="Ocupadas" count={statusCounts.occupied} color="bg-amber-500" icon="👥" />
        <StatCard label="Reservadas" count={statusCounts.reserved} color="bg-blue-500" icon="📅" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/waiter/orders/new" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl flex flex-col items-center gap-2">
          <span className="text-2xl">➕</span>
          <span className="font-semibold">Nuevo Pedido</span>
        </Link>
        <Link href="/waiter/calls" className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl flex flex-col items-center gap-2">
          <span className="text-2xl">🔔</span>
          <span className="font-semibold">Llamadas ({tables.filter(t => t.status === 'occupied').length})</span>
        </Link>
      </div>

      {/* Tables Grid */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-amber-900">Mesas</h2>
        <div className="flex gap-1 bg-amber-50 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-md text-sm ${viewMode === 'grid' ? 'bg-white text-amber-800 shadow' : 'text-amber-600'}`}>Cuadrícula</button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm ${viewMode === 'list' ? 'bg-white text-amber-800 shadow' : 'text-amber-600'}`}>Lista</button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {tables.map(table => (
            <WaiterTableCard key={table.id} table={table} orders={orders} onStatusChange={updateTableStatus} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tables.map(table => (
            <WaiterTableRow key={table.id} table={table} orders={orders} onStatusChange={updateTableStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-amber-100 p-3 text-center">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-1`}>
        <span className="text-white text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-amber-900">{count}</p>
      <p className="text-xs text-amber-500">{label}</p>
    </div>
  );
}

function WaiterTableCard({ table, orders, onStatusChange }: { table: Table; orders: Order[]; onStatusChange: (id: string, status: Table['status']) => void }) {
  const tableOrders = orders.filter(o => o.tableId === table.id);
  const activeOrder = tableOrders.find(o => ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(o.status));
  const itemCount = activeOrder?.items.length || 0;
  const total = activeOrder?.total || 0;

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  const statusConfig: Record<Table['status'], { bg: string; text: string; label: string; next: Table['status'] }> = {
    free: { bg: 'bg-green-100', text: 'text-green-700', label: 'Libre', next: 'occupied' },
    occupied: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Ocupada', next: 'free' },
    reserved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Reservada', next: 'occupied' },
    cleaning: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Limpieza', next: 'free' },
    maintenance: { bg: 'bg-red-100', text: 'text-red-700', label: 'Mantenim.', next: 'free' },
  };

  const config = statusConfig[table.status];

  return (
    <Link href={`/waiter/tables/${table.id}`} className={`bg-white rounded-xl border p-3 transition-all ${activeOrder ? 'border-amber-300 shadow-md' : 'border-amber-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-amber-900">#{table.number}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        </div>
        {table.capacity > 4 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{table.capacity} pax</span>
        )}
      </div>

      {activeOrder && (
        <div className="bg-amber-50 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-amber-600">{itemCount} platos</span>
            <span className="font-bold text-amber-900">{formatCurrency(total)}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {activeOrder.items.slice(0, 3).map(item => (
              <span key={item.id} className="px-1.5 py-0.5 bg-white text-amber-700 text-xs rounded border border-amber-200">
                {item.name}
              </span>
            ))}
            {activeOrder.items.length > 3 && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs rounded border border-amber-200">
                +{activeOrder.items.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-amber-100">
        <span className="text-xs text-amber-500">{table.name || 'Sin nombre'}</span>
        <select
          value={table.status}
          onChange={e => onStatusChange(table.id, e.target.value as Table['status'])}
          className={`px-2 py-1 rounded-lg text-xs font-medium border ${config.bg} ${config.text} text-center`}
        >
          <option value="free">✅ Libre</option>
          <option value="occupied">👥 Ocupada</option>
          <option value="reserved">📅 Reservada</option>
          <option value="cleaning">🧹 Limpieza</option>
        </select>
      </div>
    </Link>
  );
}

function WaiterTableRow({ table, orders, onStatusChange }: { table: Table; orders: Order[]; onStatusChange: (id: string, status: Table['status']) => void }) {
  const tableOrders = orders.filter(o => o.tableId === table.id);
  const activeOrder = tableOrders.find(o => ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(o.status));
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  const statusConfig: Record<Table['status'], { bg: string; text: string; label: string }> = {
    free: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Libre' },
    occupied: { bg: 'bg-amber-100', text: 'text-amber-700', label: '👥 Ocupada' },
    reserved: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📅 Reservada' },
    cleaning: { bg: 'bg-gray-100', text: 'text-gray-700', label: '🧹 Limpieza' },
    maintenance: { bg: 'bg-red-100', text: 'text-red-700', label: '🔧 Mantenim.' },
  };

  const config = statusConfig[table.status];

  return (
    <Link href={`/waiter/tables/${table.id}`} className="bg-white rounded-xl border border-amber-100 p-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-lg">#{table.number}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-900">{table.name || 'Mesa sin nombre'}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>
        </div>
        {activeOrder && (
          <p className="text-sm text-amber-600 mt-1">{activeOrder.items.length} platos · {formatCurrency(activeOrder.total)}</p>
        )}
      </div>
      <select
        value={table.status}
        onChange={e => onStatusChange(table.id, e.target.value as Table['status'])}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${config.bg} ${config.text}`}
      >
        <option value="free">✅ Libre</option>
        <option value="occupied">👥 Ocupada</option>
        <option value="reserved">📅 Reservada</option>
        <option value="cleaning">🧹 Limpieza</option>
      </select>
    </Link>
  );
}