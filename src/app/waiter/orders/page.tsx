'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders, getTables, getMenuItems, updateOrder, updateOrderItemStatus, createOrder, addOrderItem, removeOrderItem, subscribeToAdminData } from '@/lib/adminStore';
import { Order, OrderItem, Table, MenuItem } from '@/types/admin';
import { formatCurrency } from '@/lib/utils';

const ORDER_STATUSES: { value: Order['status']; label: string; color: string; next?: Order['status'] }[] = [
  { value: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-700', next: 'confirmed' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-700', next: 'preparing' },
  { value: 'preparing', label: 'Preparando', color: 'bg-amber-100 text-amber-700', next: 'ready' },
  { value: 'ready', label: 'Listo', color: 'bg-green-100 text-green-700', next: 'served' },
  { value: 'served', label: 'Servido', color: 'bg-purple-100 text-purple-700', next: 'paid' },
  { value: 'paid', label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-700' },
];

export default function WaiterOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    const loadData = () => {
      setOrders(getOrders().filter(o => o.status !== 'cancelled').sort((a, b) => b.createdAt - a.createdAt));
      setTables(getTables());
      setMenuItems(getMenuItems().filter(i => i.isActive));
      setIsLoading(false);
    };
    loadData();
    return subscribeToAdminData(loadData);
  }, []);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrder(orderId, { status });
  };

  const handleItemStatusChange = (orderId: string, itemId: string, status: OrderItem['status']) => {
    updateOrderItemStatus(orderId, itemId, status);
  };

  const handleCreateOrder = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    const newOrder = createOrder({
      tableId: table.id,
      tableNumber: table.number,
      waiterId: 'current-user',
      waiterName: 'Camarero',
      items: [],
      status: 'pending',
      priority: 'normal',
      subtotal: 0,
      tax: 0,
      serviceCharge: 0,
      total: 0,
    });
    setShowNewOrder(false);
    setEditingOrder(newOrder);
  };

  const handleAddItem = (orderId: string, menuItem: MenuItem) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    addOrderItem(orderId, {
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      status: 'pending',
      category: menuItem.categoryId,
    });
  };

  const handleRemoveItem = (orderId: string, itemId: string) => {
    removeOrderItem(orderId, itemId);
  };

  const handleUpdateItemQty = (orderId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeOrderItem(orderId, itemId);
      return;
    }
    // This would need an updateOrderItemQuantity function in adminStore
    // For now, remove and re-add
    removeOrderItem(orderId, itemId);
    const item = orders.find(o => o.id === orderId)?.items.find(i => i.id === itemId);
    if (item) {
      addOrderItem(orderId, { ...item, quantity });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3">
        <h1 className="text-xl font-bold text-amber-900">Pedidos</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-amber-200 rounded-xl text-amber-900 bg-white text-sm"
          >
            <option value="all">Todos</option>
            {ORDER_STATUSES.slice(0, -1).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button
            onClick={() => setShowNewOrder(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center text-amber-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No hay pedidos</p>
        </div>
      ) : (
        <div className="space-y-3 px-3 pb-24">
          {filteredOrders.map(order => (
            <WaiterOrderCard
              key={order.id}
              order={order}
              tables={tables}
              menuItems={menuItems}
              onStatusChange={handleStatusChange}
              onItemStatusChange={handleItemStatusChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onUpdateItemQty={handleUpdateItemQty}
              onClick={() => setEditingOrder(order)}
            />
          ))}
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrder && (
        <NewOrderModal
          tables={tables.filter(t => t.status === 'free')}
          onClose={() => setShowNewOrder(false)}
          onCreate={handleCreateOrder}
        />
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          menuItems={menuItems}
          onClose={() => setEditingOrder(null)}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onStatusChange={handleStatusChange}
          onItemStatusChange={handleItemStatusChange}
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function WaiterOrderCard({ 
  order, 
  tables, 
  menuItems,
  onStatusChange, 
  onItemStatusChange,
  onAddItem,
  onRemoveItem,
  onUpdateItemQty,
  onClick 
}: { 
  order: Order; 
  tables: Table[]; 
  menuItems: MenuItem[];
  onStatusChange: (id: string, status: Order['status']) => void;
  onItemStatusChange: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  onAddItem: (orderId: string, item: MenuItem) => void;
  onRemoveItem: (orderId: string, itemId: string) => void;
  onUpdateItemQty: (orderId: string, itemId: string, quantity: number) => void;
  onClick: () => void;
}) {
  const table = tables.find(t => t.id === order.tableId);
  const statusConfig = ORDER_STATUSES.find(s => s.value === order.status);
  const timeAgo = getTimeAgo(order.createdAt);

  return (
    <div 
      className="bg-white rounded-xl border border-amber-100 p-3 shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-amber-700">
            #{order.id.slice(-4)}
          </div>
          <div>
            <p className="font-semibold text-amber-900">Mesa {order.tableNumber} {table?.name ? `· ${table.name}` : ''}</p>
            <p className="text-xs text-amber-500">{order.items.length} platos · {formatCurrency(order.total)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
            {statusConfig?.label}
          </span>
          <span className="text-xs text-amber-400">{timeAgo}</span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {order.items.slice(0, 4).map(item => (
          <span key={item.id} className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-full flex items-center gap-1">
            {item.name} ×{item.quantity}
            <span className={`w-1.5 h-1.5 rounded-full ${getItemStatusColor(item.status)}`} />
          </span>
        ))}
        {order.items.length > 4 && (
          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-600 rounded-full">+{order.items.length - 4}</span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-amber-100">
        <Link href={`/waiter/orders/${order.id}/edit`} className="text-sm text-amber-600 hover:text-amber-800 font-medium">Editar</Link>
        <div className="flex gap-1">
          {statusConfig?.next && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, statusConfig.next!); }}
              className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700"
            >
              {statusConfig.next === 'confirmed' ? 'Confirmar' : statusConfig.next === 'paid' ? 'Cobrar' : 'Avanzar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditOrderModal({ 
  order, 
  menuItems, 
  onClose, 
  onAddItem, 
  onRemoveItem, 
  onStatusChange, 
  onItemStatusChange 
}: { 
  order: Order; 
  menuItems: MenuItem[];
  onClose: () => void;
  onAddItem: (orderId: string, item: MenuItem) => void;
  onRemoveItem: (orderId: string, itemId: string) => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  onItemStatusChange: (orderId: string, itemId: string, status: OrderItem['status']) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('entrantes');
  
  const categories = [...new Set(menuItems.map(m => m.categoryId))].sort();
  const filteredItems = menuItems.filter(item => 
    item.categoryId === activeCategory &&
    item.isActive &&
    (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-amber-100 p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-amber-900">Pedido Mesa {order.tableNumber}</h2>
            <p className="text-sm text-amber-500">{order.items.length} platos · {formatCurrency(order.total)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-amber-500 hover:text-amber-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-120px)] sm:max-h-[70vh]">
          {/* Current Items */}
          <div className="p-4 border-b border-amber-100">
            <h3 className="font-semibold text-amber-900 mb-3">Platos en comanda</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {order.items.length === 0 ? (
                <p className="text-center text-amber-500 py-4">Comanda vacía</p>
              ) : (
                order.items.map(item => (
                  <div key={item.id} className="bg-amber-50 rounded-lg p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-amber-900">{item.name}</p>
                      <p className="text-sm text-amber-600">{item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <select
                      value={item.status}
                      onChange={e => onItemStatusChange(order.id, item.id, e.target.value as any)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${getItemStatusColor(item.status).replace('bg-', 'bg-').replace('text-', 'text-')}`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Listo</option>
                      <option value="served">Servido</option>
                    </select>
                    <button onClick={() => onRemoveItem(order.id, item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar plato..."
                  className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'}`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onAddItem(order.id, item)}
                  className="bg-white border border-amber-200 rounded-xl p-3 text-left hover:border-amber-400 hover:shadow-md transition-all"
                >
                  <p className="font-medium text-amber-900">{item.name}</p>
                  <p className="text-sm text-amber-600">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-amber-500 mt-1">{item.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Totals & Actions */}
          <div className="sticky bottom-0 bg-white border-t border-amber-100 p-4 space-y-3">
            <div className="grid grid-cols-4 gap-2 text-center bg-amber-50 rounded-xl p-3">
              <div><p className="text-xs text-amber-600">Subtotal</p><p className="font-bold text-amber-900">{formatCurrency(order.subtotal)}</p></div>
              <div><p className="text-xs text-amber-600">IVA</p><p className="font-bold text-amber-900">{formatCurrency(order.tax)}</p></div>
              <div><p className="text-xs text-amber-600">Servicio</p><p className="font-bold text-amber-900">{formatCurrency(order.serviceCharge)}</p></div>
              <div><p className="text-xs text-amber-600">Total</p><p className="font-bold text-xl text-amber-900">{formatCurrency(order.total)}</p></div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={order.status}
                onChange={e => onStatusChange(order.id, e.target.value as any)}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl font-medium"
              >
                {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button onClick={onClose} className="px-4 py-3 border border-amber-200 rounded-xl text-amber-700 font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewOrderModal({ 
  tables, 
  onClose, 
  onCreate 
}: { 
  tables: Table[]; 
  onClose: () => void;
  onCreate: (tableId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-amber-900">Nuevo Pedido</h2>
          <button onClick={onClose} className="p-2 text-amber-500 hover:text-amber-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-amber-600 mb-4">Selecciona una mesa libre</p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tables.length === 0 ? (
            <p className="text-amber-500 text-center py-4">No hay mesas libres</p>
          ) : (
            tables.map(table => (
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
        <button onClick={onClose} className="w-full mt-4 px-4 py-2.5 border border-amber-200 rounded-xl text-amber-700 font-medium">Cancelar</button>
      </div>
    </div>
  );
}

function getItemStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-700';
    case 'preparing': return 'bg-amber-100 text-amber-700';
    case 'ready': return 'bg-green-100 text-green-700';
    case 'served': return 'bg-purple-100 text-purple-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes}min`;
  return `${Math.floor(minutes / 60)}h`;
}