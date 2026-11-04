'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getOrders, updateOrderItemStatus, subscribeToAdminData } from '@/lib/adminStore';
import { Order, OrderItem } from '@/types/admin';
import { formatCurrency } from '@/lib/utils';

const KITCHEN_CATEGORIES = [
  { id: 'all', label: 'Todos', icon: '🍽️' },
  { id: 'entrantes', label: 'Entrantes', icon: '🍽️' },
  { id: 'principales', label: 'Principales', icon: '🍖' },
  { id: 'pescados', label: 'Pescados', icon: '🐟' },
  { id: 'pastas', label: 'Pastas', icon: '🍝' },
  { id: 'postres', label: 'Postres', icon: '🍰' },
  { id: 'bebidas', label: 'Bebidas', icon: '🍷', isBar: true },
];

const ITEM_STATUSES = ['pending', 'preparing', 'ready'] as const;

export default function AdminKitchenPage() {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const activeOrders = getOrders().filter(o => 
        ['confirmed', 'preparing', 'ready'].includes(o.status)
      );
      setOrders(activeOrders.sort((a, b) => a.createdAt - b.createdAt));
      setIsLoading(false);
    };
    loadData();
    return subscribeToAdminData(loadData);
  }, []);

  const canUpdate = hasPermission('orders:update_status') || hasPermission('orders:write');

  // Group items by category
  const itemsByCategory: Record<string, Array<{ item: OrderItem; order: Order }>> = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory && !(activeCategory === 'bebidas' && item.category === 'bebidas')) return;
      if (!showCompleted && item.status === 'ready') return;
      
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push({ item, order });
    });
  });

  // Sort items: pending first, then preparing, then ready
  Object.keys(itemsByCategory).forEach(cat => {
    itemsByCategory[cat].sort((a, b) => {
      const statusOrder = { pending: 0, preparing: 1, ready: 2, served: 3, cancelled: 4 };
      return (statusOrder[a.item.status] || 99) - (statusOrder[b.item.status] || 99);
    });
  });

  const handleStatusChange = (orderId: string, itemId: string, status: OrderItem['status']) => {
    updateOrderItemStatus(orderId, itemId, status);
    // Play notification sound for ready items
    if (status === 'ready' && soundEnabled) {
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (e) {
      // Audio not supported
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPending = orders.reduce((sum, o) => sum + o.items.filter(i => i.status === 'pending').length, 0);
  const totalPreparing = orders.reduce((sum, o) => sum + o.items.filter(i => i.status === 'preparing').length, 0);
  const totalReady = orders.reduce((sum, o) => sum + o.items.filter(i => i.status === 'ready').length, 0);

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Kitchen Header */}
      <div className="bg-white rounded-xl border border-amber-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-16 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <span className="text-white text-2xl">👨‍🍳</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-amber-900">Cocina - Vista de Preparación</h1>
            <p className="text-sm text-amber-500">Pedidos activos en tiempo real</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex gap-1 bg-amber-50 rounded-lg p-1">
            {KITCHEN_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-amber-600 text-white' : 'text-amber-600 hover:bg-amber-100'}`}
              >
                <span className="flex items-center gap-1">{cat.icon} {cat.label}</span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Pendientes: <strong>{totalPending}</strong></span>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Preparando: <strong>{totalPreparing}</strong></span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Listos: <strong>{totalReady}</strong></span>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-amber-600 cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={e => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-amber-300"
              />
              🔊 Sonido
            </label>
            <label className="flex items-center gap-2 text-sm text-amber-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={e => setShowCompleted(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-amber-300"
              />
              Mostrar listos
            </label>
          </div>
        </div>
      </div>

      {/* Kitchen Stations */}
      <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {KITCHEN_CATEGORIES
          .filter(cat => cat.id !== 'all')
          .map(category => {
            const items = itemsByCategory[category.id] || [];
            if (items.length === 0 && !showCompleted) return null;

            return (
              <KitchenStation
                key={category.id}
                category={category}
                items={items}
                onStatusChange={handleStatusChange}
                canUpdate={canUpdate}
                showCompleted={showCompleted}
              />
            );
          })}
        
        {Object.keys(itemsByCategory).length === 0 && (
          <div className="col-span-full flex items-center justify-center h-64 text-amber-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg">No hay pedidos en cocina</p>
              <p className="text-sm">Los pedidos confirmados aparecerán aquí automáticamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// KITCHEN STATION COMPONENT
// ============================================

function KitchenStation({ 
  category, 
  items, 
  onStatusChange, 
  canUpdate, 
  showCompleted 
}: { 
  category: any; 
  items: Array<{ item: any; order: any }>; 
  onStatusChange: (orderId: string, itemId: string, status: any) => void;
  canUpdate: boolean;
  showCompleted: boolean;
}) {
  const pendingItems = items.filter(i => i.item.status === 'pending');
  const preparingItems = items.filter(i => i.item.status === 'preparing');
  const readyItems = items.filter(i => i.item.status === 'ready');

  const categoryColors: Record<string, { bg: string; border: string; text: string; header: string }> = {
    entrantes: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', header: 'bg-blue-100' },
    principales: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', header: 'bg-red-100' },
    pescados: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', header: 'bg-cyan-100' },
    pastas: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', header: 'bg-amber-100' },
    postres: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', header: 'bg-pink-100' },
    bebidas: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', header: 'bg-green-100' },
  };

  const colors = categoryColors[category.id] || categoryColors.entrantes;

  return (
    <div className={`rounded-xl border ${colors.border} overflow-hidden flex flex-col h-full bg-white`}>
      {/* Station Header */}
      <div className={`${colors.header} px-4 py-3 border-b ${colors.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <h3 className="font-bold text-lg">{category.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
            {pendingItems.length} pendientes
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700`}>
            {preparingItems.length} en prep.
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Pending Items - High Priority */}
        {pendingItems.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs font-semibold text-red-600 uppercase tracking-wider">🔴 PENDIENTES - URGENTE</div>
            {pendingItems.map(({ item, order }) => (
              <KitchenTicket
                key={`${order.id}-${item.id}`}
                item={item}
                order={order}
                status="pending"
                onStatusChange={onStatusChange}
                canUpdate={canUpdate}
                colors={colors}
                isUrgent={true}
              />
            ))}
          </>
        )}

        {/* Preparing Items */}
        {preparingItems.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs font-semibold text-amber-700 uppercase tracking-wider">🟡 EN PREPARACIÓN</div>
            {preparingItems.map(({ item, order }) => (
              <KitchenTicket
                key={`${order.id}-${item.id}`}
                item={item}
                order={order}
                status="preparing"
                onStatusChange={onStatusChange}
                canUpdate={canUpdate}
                colors={colors}
              />
            ))}
          </>
        )}

        {/* Ready Items */}
        {(readyItems.length > 0 || showCompleted) && (
          <>
            <div className="px-2 py-1 text-xs font-semibold text-green-700 uppercase tracking-wider">🟢 LISTOS PARA SERVIR</div>
            {readyItems.map(({ item, order }) => (
              <KitchenTicket
                key={`${order.id}-${item.id}`}
                item={item}
                order={order}
                status="ready"
                onStatusChange={onStatusChange}
                canUpdate={canUpdate}
                colors={colors}
                isReady={true}
              />
            ))}
          </>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-amber-400">
            <p className="text-sm">Sin pedidos en esta estación</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KitchenTicket({ 
  item, 
  order, 
  status, 
  onStatusChange, 
  canUpdate, 
  colors, 
  isUrgent,
  isReady 
}: { 
  item: any; 
  order: any; 
  status: string; 
  onStatusChange: (orderId: string, itemId: string, status: string) => void;
  canUpdate: boolean;
  colors: any;
  isUrgent?: boolean;
  isReady?: boolean;
}) {
  const timeWaiting = Date.now() - order.createdAt;
  const minutesWaiting = Math.floor(timeWaiting / 60000);
  
  const nextStatus = status === 'pending' ? 'preparing' : status === 'preparing' ? 'ready' : 'served';
  const nextLabel = status === 'pending' ? 'Iniciar' : status === 'preparing' ? 'Listo' : 'Servido';
  const nextColor = status === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : status === 'preparing' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700';

  return (
    <div className={`bg-white rounded-lg border p-3 shadow-sm transition-all ${isUrgent ? 'border-red-300 animate-pulse' : status === 'preparing' ? 'border-amber-300' : 'border-green-300'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-amber-900">{item.name}</span>
            {item.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">⭐</span>}
            {isUrgent && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded animate-pulse">URGENTE</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs text-amber-600">
            <span>Mesa {order.tableNumber}</span>
            <span>×{item.quantity}</span>
            {item.preparationTime && <span>⏱️ {item.preparationTime}min</span>}
            {minutesWaiting > 15 && <span className="text-red-600 font-medium">⏰ {minutesWaiting}min esperando</span>}
          </div>
        </div>

        {/* Time badge */}
        <div className={`px-2 py-1 rounded text-xs font-mono font-bold ${isUrgent ? 'bg-red-100 text-red-700' : status === 'preparing' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
          {minutesWaiting}min
        </div>
      </div>

      {/* Notes & Allergies */}
      {(item.notes || (item.allergens && item.allergens.length > 0)) && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
          {item.allergens?.length > 0 && (
            <div className="flex items-center gap-1 text-red-700 mb-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              ALÉRGENOS: {item.allergens.join(', ').toUpperCase()}
            </div>
          )}
          {item.notes && (
            <div className="text-amber-800 italic">"⚠️ {item.notes}"</div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {canUpdate && status !== 'ready' && (
          <button
            onClick={() => onStatusChange(order.id, item.id, nextStatus)}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold text-white text-sm transition-colors ${nextColor}`}
          >
            {nextLabel}
          </button>
        )}
        {canUpdate && status === 'ready' && (
          <button
            onClick={() => onStatusChange(order.id, item.id, 'served')}
            className="flex-1 px-3 py-2 rounded-lg font-semibold text-white text-sm bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Servido
          </button>
        )}
        {canUpdate && (
          <button
            onClick={() => onStatusChange(order.id, item.id, 'cancelled')}
            className="px-3 py-2 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            title="Cancelar"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}