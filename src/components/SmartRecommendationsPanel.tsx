'use client';

import { useRecommendations } from '@/context/RecommendationsContext';
import { useProfile } from '@/context/ProfileContext';
import { useCart } from '@/context/CartContext';
import { MenuItem, getItemById } from '@/data/menu';
import { SmartRecommendation } from '@/types/recommendations';
import { useState, useEffect } from 'react';

interface SmartRecommendationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartRecommendationsPanel({ isOpen, onClose }: SmartRecommendationsPanelProps) {
  const { recommendations, getPairingsForCart } = useRecommendations();
  const { profile } = useProfile();
  const { state: cartState, addItem } = useCart();
  const [activeTab, setActiveTab] = useState<'para-ti' | 'maridajes' | 'perfil'>('para-ti');
  const [pairings, setPairings] = useState<ReturnType<typeof getPairingsForCart>>([]);

  useEffect(() => {
    setPairings(getPairingsForCart());
  }, [getPairingsForCart, cartState.items.length]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed top-0 left-0 z-50 h-full w-full max-w-sm lg:max-w-md bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-amber-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="font-bold text-amber-900">Recomendaciones IA</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="sticky top-12 z-10 bg-white border-b border-amber-100 px-4 py-2 flex gap-1 overflow-x-auto">
            {[
              { id: 'para-ti', label: 'Para Ti', icon: '🎯', count: recommendations.length },
              { id: 'maridajes', label: 'Maridajes', icon: '🍷', count: pairings.length },
              { id: 'perfil', label: 'Tu Perfil', icon: '👤', count: profile.preferences.dietaryRestrictions.length + profile.preferences.allergies.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                    activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {activeTab === 'para-ti' && (
              <RecommendationsList 
                recommendations={recommendations} 
                onAddToCart={addItem}
                title="Seleccionados para ti"
                emptyMessage="Aún no hay recomendaciones. ¡Empieza a pedir para que la IA aprenda tus gustos!"
              />
            )}

            {activeTab === 'maridajes' && (
              <PairingsList pairings={pairings} onAddToCart={addItem} />
            )}

            {activeTab === 'perfil' && (
              <ProfilePreferencesPanel profile={profile} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function RecommendationsList({ 
  recommendations, 
  onAddToCart, 
  title, 
  emptyMessage 
}: { 
  recommendations: SmartRecommendation[];
  onAddToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  title: string;
  emptyMessage: string;
}) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12 text-amber-500">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="text-amber-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wider mb-3">{title}</h3>
      {recommendations.slice(0, 8).map((rec, index) => (
        <SmartRecommendationCard 
          key={rec.itemId} 
          recommendation={rec} 
          rank={index + 1}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

function SmartRecommendationCard({ 
  recommendation, 
  rank, 
  onAddToCart 
}: { 
  recommendation: SmartRecommendation;
  rank: number;
  onAddToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
}) {
  const item = getItemById(recommendation.itemId);
  if (!item) return null;

  const topReason = recommendation.reasons[0];
  const reasonIcons = recommendation.reasons.map(r => r.icon).join(' ');

  return (
    <div className="bg-white rounded-xl border border-amber-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm">
            {rank}
          </div>

          {/* Item image/category */}
          <div className="w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center text-3xl flex-shrink-0">
            {getCategoryEmoji(item.category)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-amber-900 truncate">{item.name}</h4>
                <p className="text-amber-600/80 text-xs mt-0.5 line-clamp-1">{item.description}</p>
              </div>
              <span className="font-bold text-amber-600 whitespace-nowrap">{item.price.toFixed(2)} €</span>
            </div>

            {/* Reason tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {recommendation.reasons.slice(0, 2).map((reason, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded-full flex items-center gap-1"
                >
                  {reason.icon} {reason.message}
                </span>
              ))}
              {recommendation.reasons.length > 2 && (
                <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded-full">
                  +{recommendation.reasons.length - 2} más
                </span>
              )}
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${recommendation.score}%` }}
                />
              </div>
              <span className="text-xs text-amber-600 font-medium w-10 text-right">
                {recommendation.score}%
              </span>
            </div>
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={() => onAddToCart(item, 1)}
          className="w-full mt-3 bg-amber-600 text-white py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Añadir al pedido
        </button>
      </div>
    </div>
  );
}

function PairingsList({ 
  pairings, 
  onAddToCart 
}: { 
  pairings: Array<{ foodItem: MenuItem; drinkItem: MenuItem; reason: string; score: number }>;
  onAddToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
}) {
  if (pairings.length === 0) {
    return (
      <div className="text-center py-12 text-amber-500">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 9.5a1.5 1.5 0 110 3m-3 0a1.5 1.5 0 110 3m3-3a1.5 1.5 0 110 3m-3 0a1.5 1.5 0 110 3m3-3v3m0-4.5v3m-3 0v3m0-4.5v3m0-3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-amber-600">Añade platos principales para ver maridajes sugeridos</p>
        <p className="text-amber-500 text-sm mt-1">La IA recomendará la bebida perfecta para cada plato</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wider mb-3">Maridajes Perfectos</h3>
      {pairings.map((pairing, index) => (
        <div key={index} className="bg-white rounded-xl border border-amber-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-amber-50 flex items-center justify-center text-2xl">
              {getCategoryEmoji(pairing.foodItem.category)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900">{pairing.foodItem.name}</h4>
              <p className="text-amber-600/80 text-sm">{pairing.reason}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-amber-600">{pairing.foodItem.price.toFixed(2)} €</p>
              <span className="text-xs text-amber-500">Plato</span>
            </div>
          </div>

          <div className="flex items-center justify-center my-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
              +
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-amber-100">
            <div className="w-14 h-14 rounded-lg bg-amber-50 flex items-center justify-center text-2xl">
              🍷
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900">{pairing.drinkItem.name}</h4>
              <p className="text-amber-600/80 text-sm">Compatibilidad: {pairing.score}%</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-amber-600">{pairing.drinkItem.price.toFixed(2)} €</p>
              <span className="text-xs text-amber-500">Bebida</span>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAddToCart(pairing.foodItem, 1)}
              className="flex-1 bg-amber-100 text-amber-800 py-2 rounded-lg font-medium hover:bg-amber-200 transition-colors text-sm"
            >
              Añadir plato
            </button>
            <button
              onClick={() => onAddToCart(pairing.drinkItem, 1)}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-colors text-sm"
            >
              Añadir bebida
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfilePreferencesPanel({ profile }: { profile: ReturnType<typeof useProfile>['profile'] }) {
  const { updatePreferences, toggleFavorite, isFavorite } = useProfile();

  return (
    <div className="space-y-6">
      {/* Dietary Restrictions */}
      <div>
        <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="text-lg">🌱</span> Restricciones Dietéticas
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'vegetarian', label: 'Vegetariano', icon: '🌱' },
            { id: 'vegan', label: 'Vegano', icon: '🌿' },
            { id: 'gluten-free', label: 'Sin Gluten', icon: '🚫' },
            { id: 'nut-free', label: 'Sin Frutos Secos', icon: '🥜' },
            { id: 'dairy-free', label: 'Sin Lácteos', icon: '🥛' },
          ].map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all cursor-pointer ${
                profile.preferences.dietaryRestrictions.includes(opt.id)
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-amber-200 text-amber-600 hover:border-amber-400'
              }`}
            >
              <input
                type="checkbox"
                checked={profile.preferences.dietaryRestrictions.includes(opt.id)}
                onChange={(e) => {
                  const newRestrictions = e.target.checked
                    ? [...profile.preferences.dietaryRestrictions, opt.id]
                    : profile.preferences.dietaryRestrictions.filter(r => r !== opt.id);
                  updatePreferences({ dietaryRestrictions: newRestrictions });
                }}
                className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1">{opt.icon} {opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="text-lg">⚠️</span> Alergias
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            'gluten', 'lactosa', 'huevo', 'pescados', 'crustáceos', 
            'moluscos', 'frutos_secos', 'cacahuetes', 'soja', 'sésamo', 'mostaza', 'sulfitos'
          ].map((allergen) => (
            <label
              key={allergen}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all cursor-pointer ${
                profile.preferences.allergies.includes(allergen)
                  ? 'border-red-500 bg-red-50 text-red-800'
                  : 'border-amber-200 text-amber-600 hover:border-amber-400'
              }`}
            >
              <input
                type="checkbox"
                checked={profile.preferences.allergies.includes(allergen)}
                onChange={(e) => {
                  const newAllergies = e.target.checked
                    ? [...profile.preferences.allergies, allergen]
                    : profile.preferences.allergies.filter(a => a !== allergen);
                  updatePreferences({ allergies: newAllergies });
                }}
                className="w-4 h-4 text-red-600 rounded border-amber-300 focus:ring-red-500"
              />
              <span className="text-sm capitalize">{allergen.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Spice Tolerance */}
      <div>
        <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="text-lg">🌶️</span> Tolerancia al Picante
        </h3>
        <div className="flex items-center gap-4">
          {[0, 1, 2, 3].map((level) => (
            <label
              key={level}
              className={`flex flex-col items-center gap-1 cursor-pointer p-3 rounded-xl transition-all ${
                profile.preferences.spiceTolerance === level
                  ? 'bg-amber-100 ring-2 ring-amber-500'
                  : 'hover:bg-amber-50'
              }`}
            >
              <input
                type="radio"
                name="spice"
                value={level}
                checked={profile.preferences.spiceTolerance === level}
                onChange={() => updatePreferences({ spiceTolerance: level as 0 | 1 | 2 | 3 })}
                className="sr-only"
              />
              <span className="text-2xl">{'🌶️'.repeat(level) || '🚫'}</span>
              <span className="text-xs font-medium text-amber-700">
                {['Ninguno', 'Leve', 'Medio', 'Fuerte'][level]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="text-lg">💰</span> Rango de Precio
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={profile.preferences.priceRange[0]}
            onChange={(e) => updatePreferences({ priceRange: [parseInt(e.target.value) || 0, profile.preferences.priceRange[1]] })}
            min="0"
            max="100"
            className="w-24 px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
            placeholder="Mín"
          />
          <span className="text-amber-500">–</span>
          <input
            type="number"
            value={profile.preferences.priceRange[1]}
            onChange={(e) => updatePreferences({ priceRange: [profile.preferences.priceRange[0], parseInt(e.target.value) || 50] })}
            min="0"
            max="100"
            className="w-24 px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900"
            placeholder="Máx"
          />
          <span className="text-amber-500 text-sm">€</span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span> Tu Actividad
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-amber-600">{profile.visitCount}</p>
            <p className="text-xs text-amber-600">Visitas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{profile.orderHistory.length}</p>
            <p className="text-xs text-amber-600">Pedidos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{profile.favoriteItems.length}</p>
            <p className="text-xs text-amber-600">Favoritos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{profile.averageSpend.toFixed(0)}€</p>
            <p className="text-xs text-amber-600">Media gasto</p>
          </div>
        </div>
      </div>
    </div>
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