'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getOrders, getTables, updateOrder, updateOrderItemStatus, addOrderItem, removeOrderItem, subscribeToAdminData } from '@/lib/adminStore';
import { Order, OrderItem, Table } from '@/types/admin';
import { formatCurrency } from '@/lib/utils';

interface OrderStatusConfig {
  value: Order['status'];
  label: string;
  color: string;
  next?: Order['status'];
}

const ORDER_STATUSES: OrderStatusConfig[] = [
  { value: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-700', next: 'confirmed' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-700', next: 'preparing' },
  { value: 'preparing', label: 'Preparando', color: 'bg-amber-100 text-amber-700', next: 'ready' },
  { value: 'ready', label: 'Listo', color: 'bg-green-100 text-green-700', next: 'served' },
  { value: 'served', label: 'Servido', color: 'bg-purple-100 text-purple-700', next: 'paid' },
  { value: 'paid', label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-700' },
];

const ITEM_STATUSES: { value: OrderItem['status']; label: string; color: string }[] = [
  { value: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-700' },
  { value: 'preparing', label: 'Preparando', color: 'bg-amber-100 text-amber-700' },
  { value: 'ready', label: 'Listo', color: 'bg-green-100 text-green-700' },
  { value: 'served', label: 'Servido', color: 'bg-purple-100 text-purple-700' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-700' },
];

export default function AdminOrdersPage() {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderTableId, setNewOrderTableId] = useState<string>('');

  useEffect(() => {
    const loadData = () => {
      setOrders(getOrders().sort((a, b) => b.createdAt - a.createdAt));
      setTables(getTables());
      setIsLoading(false);
    };
    loadData();
    return subscribeToAdminData(loadData);
  }, []);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const canManage = hasPermission('orders:manage') || hasPermission('orders:write');

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrder(orderId, { status });
  };

  const handleItemStatusChange = (orderId: string, itemId: string, status: OrderItem['status']) => {
    updateOrderItemStatus(orderId, itemId, status);
  };

  const handleCreateOrder = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    const newOrder = {
      tableId: table.id,
      tableNumber: table.number,
      waiterId: 'current-user',
      waiterName: 'Usuario actual',
      items: [],
      status: 'pending' as const,
      priority: 'normal' as const,
      subtotal: 0,
      tax: 0,
      serviceCharge: 0,
      total: 0,
    };
    // This would be created via adminStore.createOrder in real implementation
    setShowNewOrderModal(false);
    setNewOrderTableId('');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Gestión de Pedidos</h1>
          <p className="text-amber-600">Ver, editar y cambiar estado de pedidos</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 bg-white"
          >
            <option value="all">Todos los estados</option>
            {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {canManage && (
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Pedido
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {ORDER_STATUSES.map(s => (
          <div key={s.value} className="bg-white rounded-xl border border-amber-100 p-3 text-center">
            <p className="text-2xl font-bold text-amber-900">
              {orders.filter(o => o.status === s.value).length}
            </p>
            <p className={`text-xs font-medium px-2 py-0.5 rounded ${s.color}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-amber-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg">No hay pedidos {statusFilter !== 'all' ? `con estado "${ORDER_STATUSES.find(s => s.value === statusFilter)?.label}"` : ''}</p>
          </div>
        ) : (
          <div className="divide-y divide-amber-100">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onItemStatusChange={handleItemStatusChange}
                canManage={canManage}
                isSelected={selectedOrder?.id === order.id}
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onItemStatusChange={handleItemStatusChange}
          canManage={canManage}
        />
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <NewOrderModal
          tables={tables.filter(t => t.status === 'free')}
          onClose={() => setShowNewOrderModal(false)}
          onCreate={handleCreateOrder}
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function OrderRow({ order, onStatusChange, onItemStatusChange, canManage, isSelected, onClick }: any) {
  const statusConfig = ORDER_STATUSES.find(s => s.value === order.status);
  const timeAgo = getTimeAgo(order.createdAt);
  const duration = order.servedAt ? getDuration(order.createdAt, order.servedAt) : getDuration(order.createdAt, Date.now());

  return (
    <div
      className={`p-4 hover:bg-amber-50 transition-colors cursor-pointer ${isSelected ? 'bg-amber-50 border-l-4 border-amber-500' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Order ID & Table */}
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-amber-700">
            #{order.id.slice(-4)}
          </div>
          <div>
            <p className="font-semibold text-amber-900">Mesa {order.tableNumber}</p>
            <p className="text-sm text-amber-500">{order.waiterName || 'Sin camarero'}</p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {order.items.slice(0, 3).map((item: any) => (
              <span key={item.id} className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded-full">
                {item.name} ×{item.quantity}
              </span>
            ))}
            {order.items.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-600 rounded-full">
                +{order.items.length - 3} más
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-amber-500">
            <span>{order.items.length} platos</span>
            <span>·</span>
            <span className="font-medium text-amber-900">{formatCurrency(order.total)}</span>
            {order.allergyAlert && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">⚠️ Alergia</span>
            )}
            {order.priority === 'urgent' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs animate-pulse">🔴 Urgente</span>
            )}
            {order.priority === 'vip' && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">⭐ VIP</span>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="text-right min-w-[100px]">
          <p className="text-sm text-amber-500">{timeAgo}</p>
          <p className="text-xs text-amber-400">Duración: {duration}</p>
        </div>

        {/* Status */}
        <div className="min-w-[140px]">
          <select
            value={order.status}
            onChange={e => onStatusChange(order.id, e.target.value as any)}
            disabled={!canManage}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium border ${statusConfig?.color} cursor-pointer ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value} disabled={!canManage && s.value !== order.status}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange, onItemStatusChange, canManage }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-amber-100 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-amber-900">Pedido #{order.id.slice(-6)}</h2>
            <p className="text-amber-600">Mesa {order.tableNumber} · {new Date(order.createdAt).toLocaleString('es-ES')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-amber-500 hover:text-amber-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status & Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-600 mb-1">Estado</p>
              <select
                value={order.status}
                onChange={e => onStatusChange(order.id, e.target.value as any)}
                disabled={!canManage}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-amber-900"
              >
                {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-600 mb-1">Prioridad</p>
              <select
                value={order.priority}
                onChange={e => updateOrder(order.id, { priority: e.target.value as any })}
                disabled={!canManage}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-amber-900"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgente</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-600 mb-1">Método de pago</p>
              <select
                value={order.paymentMethod || ''}
                onChange={e => updateOrder(order.id, { paymentMethod: (e.target.value || undefined) as Order['paymentMethod'] })}
                disabled={!canManage}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-amber-900"
              >
                <option value="">Pendiente</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="mobile">Móvil</option>
                <option value="split">Dividido</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-amber-900 mb-3">Platos ({order.items.length})</h3>
            <div className="space-y-2">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="bg-amber-50 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900">{item.name}</p>
                    <p className="text-sm text-amber-600">{item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.price * item.quantity)}</p>
                    {item.notes && <p className="text-xs text-amber-500 italic mt-1">"{item.notes}"</p>}
                  </div>
                  <select
                    value={item.status}
                    onChange={e => onItemStatusChange(order.id, item.id, e.target.value as any)}
                    disabled={!canManage}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${ITEM_STATUSES.find(s => s.value === item.status)?.color} w-36`}
                  >
                    {ITEM_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-amber-50 rounded-xl p-4 border-t border-amber-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-amber-600">Subtotal</p>
                <p className="font-bold text-amber-900">{formatCurrency(order.subtotal)}</p>
              </div>
              <div>
                <p className="text-sm text-amber-600">IVA (10%)</p>
                <p className="font-bold text-amber-900">{formatCurrency(order.tax)}</p>
              </div>
              <div>
                <p className="text-sm text-amber-600">Servicio (5%)</p>
                <p className="font-bold text-amber-900">{formatCurrency(order.serviceCharge)}</p>
              </div>
              <div>
                <p className="text-sm text-amber-600">Total</p>
                <p className="font-bold text-xl text-amber-900">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm font-medium text-blue-800 mb-1">Notas del pedido</p>
              <p className="text-blue-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-amber-100 p-4 flex gap-2 z-10">
          {canManage && order.status !== 'paid' && order.status !== 'cancelled' && (
            <button
              onClick={() => onStatusChange(order.id, ORDER_STATUSES.find(s => s.value === order.status)?.next || 'confirmed')}
              className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700"
            >
              Avanzar a {ORDER_STATUSES.find(s => s.value === ORDER_STATUSES.find(s2 => s2.value === order.status)?.next)?.label || 'siguiente'}
            </button>
          )}
          {canManage && order.status === 'served' && (
            <button
              onClick={() => onStatusChange(order.id, 'paid')}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
            >
              Marcar como pagado
            </button>
          )}
          {canManage && !['paid', 'cancelled'].includes(order.status) && (
            <button
              onClick={() => { updateOrderLocal(order.id, { status: 'cancelled' }); onClose(); }}
              className="px-4 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewOrderModal({ tables, onClose, onCreate }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-amber-900">Nuevo Pedido</h2>
          <button onClick={onClose} className="p-2 text-amber-500 hover:text-amber-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-amber-600 mb-4">Selecciona una mesa libre para crear un nuevo pedido</p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tables.length === 0 ? (
            <p className="text-amber-500 text-center py-4">No hay mesas libres</p>
          ) : (
            tables.map((table: Table) => (
              <button
                key={table.id}
                onClick={() => onCreate(table.id)}
                className="w-full p-4 border border-amber-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-colors text-left"
              >
                <p className="font-bold text-amber-900">Mesa {table.number}</p>
                <p className="text-sm text-amber-500">{table.name || ''} · {table.capacity} pax</p>
              </button>
            ))
          )}
        </div>
        <button onClick={onClose} className="w-full mt-4 px-4 py-2.5 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 font-medium">Cancelar</button>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  return new Date(timestamp).toLocaleDateString('es-ES');
}

function getDuration(start: number, end: number): string {
  const diff = end - start;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}min`;
  return `${minutes}min`;
}

function updateOrderLocal(id: string, updates: any) {
  // This would use the adminStore updateOrder function
  // For now, we'll just trigger a re-render
  window.dispatchEvent(new CustomEvent('admin-data-updated', { detail: { key: 'admin-orders' } }));
}