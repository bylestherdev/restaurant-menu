'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export function CartSidebar() {
  const { state, removeItem, updateQuantity, updateNotes, setTableNumber, setCustomerName, setOrderNotes, clearCart, getSubtotal, getTax, getServiceCharge, getTotal, config } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (state.items.length === 0 && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-amber-600 text-white p-4 rounded-full shadow-xl hover:bg-amber-700 transition-all duration-300 hover:scale-105 animate-bounce-subtle"
        aria-label="Abrir carrito"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          0
        </span>
      </button>
    );
  }

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-amber-600 text-white p-4 rounded-full shadow-xl hover:bg-amber-700 transition-all duration-300 hover:scale-105"
        aria-label="Abrir carrito"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative bg-white w-full md:w-96 max-h-screen flex flex-col shadow-2xl animate-slide-in-right z-50">
            <div className="sticky top-0 bg-white border-b border-amber-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-xl text-amber-900 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Tu Pedido
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {state.items.length === 0 ? (
                <div className="text-center py-12 text-amber-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-amber-600">Tu carrito está vacío</p>
                  <p className="text-sm text-amber-400 mt-1">Añade platos del menú</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={`${item.id}-${item.notes || ''}`} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-2xl flex-shrink-0">
                            {getCategoryEmoji(item.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-amber-900 text-sm truncate pr-2">{item.name}</h4>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-amber-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                aria-label="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-amber-600/80 mt-1 italic">"{item.notes}"</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-lg bg-white text-amber-700 font-bold hover:bg-amber-100 transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center font-medium text-amber-900">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-lg bg-white text-amber-700 font-bold hover:bg-amber-100 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-bold text-amber-600">
                {(item.price * item.quantity).toFixed(2)} €
              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-amber-200 pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-amber-600 mb-1">Mesa</label>
                        <input
                          type="number"
                          value={state.tableNumber || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTableNumber(isNaN(val) ? null : val);
                          }}
                          placeholder="Nº mesa"
                          min="1"
                          max="50"
                          className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-amber-600 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={state.customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-amber-600 mb-1">Notas del pedido</label>
                      <textarea
                        value={state.notes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Instrucciones especiales, alergias, etc."
                        rows={2}
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400 resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {state.items.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-amber-100 p-4 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-amber-700">
                    <span>Subtotal ({itemCount} art.)</span>
                    <span>{getSubtotal().toFixed(2)} €</span>
                  </div>
                  {config.taxRate > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>IVA ({Math.round(config.taxRate * 100)}%)</span>
                      <span>{getTax().toFixed(2)} €</span>
                    </div>
                  )}
                  {config.serviceCharge && config.serviceCharge > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Servicio ({Math.round(config.serviceCharge * 100)}%)</span>
                      <span>{getServiceCharge().toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="border-t border-amber-200 pt-2 flex justify-between text-lg font-bold text-amber-900">
                    <span>Total</span>
                    <span>{getTotal().toFixed(2)} €</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Funcionalidad de envío a cocina pendiente de implementar')}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar a Cocina
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-amber-600 hover:text-amber-800 font-medium py-2"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    entrantes: '🍽️',
    ensaladas: '🥗',
    principales: '🍖',
    pescados: '🐟',
    pastas: '🍝',
    postres: '🍰',
    bebidas: '🍷',
  };
  return emojis[category] || '🍽️';
}