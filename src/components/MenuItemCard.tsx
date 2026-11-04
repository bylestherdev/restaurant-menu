'use client';

import { MenuItem } from '@/types/menu';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface MenuItemCardProps {
  item: MenuItem;
  compact?: boolean;
}

const allergenIcons: Record<string, string> = {
  gluten: '🌾',
  lactosa: '🥛',
  huevo: '🥚',
  pescados: '🐟',
  crustáceos: '🦐',
  moluscos: '🦪',
  frutos_secos: '🥜',
  cacahuetes: '🥜',
  soja: '🫘',
  sésamo: '🌰',
  mostaza: '🌿',
  apio: '🌱',
  sulfitos: '🍷',
  altramuces: '🌱',
};

const allergenNames: Record<string, string> = {
  gluten: 'Gluten',
  lactosa: 'Lactosa',
  huevo: 'Huevo',
  pescados: 'Pescado',
  crustáceos: 'Crustáceos',
  moluscos: 'Moluscos',
  frutos_secos: 'Frutos secos',
  cacahuetes: 'Cacahuetes',
  soja: 'Soja',
  sésamo: 'Sésamo',
  mostaza: 'Mostaza',
  apio: 'Apio',
  sulfitos: 'Sulfitos',
  altramuces: 'Altramuces',
};

export function MenuItemCard({ item, compact = false }: MenuItemCardProps) {
  const { addItem } = useCart();
  const [showOptions, setShowOptions] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAddToCart = () => {
    addItem(item, quantity, notes || undefined);
    setShowOptions(false);
    setQuantity(1);
    setNotes('');
  };

  const allergens = item.allergens || [];
  const dietaryTags = [
    item.isVegetarian && '🌱 Vegetariano',
    item.isVegan && '🌿 Vegano',
    item.isGlutenFree && '🚫 Sin gluten',
  ].filter((tag): tag is string => Boolean(tag));

  const spicyIcons = '🌶️'.repeat(item.spicyLevel || 0);

  if (compact) {
    return (
      <div className="group bg-white rounded-xl border border-amber-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-4">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 text-lg truncate">{item.name}</h3>
              <p className="text-amber-700/80 text-sm mt-1 line-clamp-2">{item.description}</p>
            </div>
            <span className="font-bold text-amber-600 text-lg whitespace-nowrap">
              {item.price.toFixed(2)} €
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {dietaryTags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">
                {tag}
              </span>
            ))}
            {item.spicyLevel && item.spicyLevel > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded-full">
                {spicyIcons} Picante
              </span>
            )}
            {item.preparationTime && (
              <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                ⏱️ {item.preparationTime} min
              </span>
            )}
          </div>
          {allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 text-xs text-amber-600/70">
              {allergens.map((allergen) => (
                <span key={allergen} className="flex items-center gap-0.5">
                  {allergenIcons[allergen] || '⚠️'} {allergenNames[allergen] || allergen}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="bg-amber-50 px-4 py-3 border-t border-amber-100">
          <button
            onClick={handleAddToCart}
            className="w-full bg-amber-600 text-white py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Añadir al pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-xl border border-amber-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-video bg-amber-50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {getCategoryEmoji(item.category)}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {dietaryTags.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs bg-white/95 backdrop-blur text-amber-800 rounded-full shadow-sm">
              {tag}
            </span>
          ))}
          {item.spicyLevel && item.spicyLevel > 0 && (
            <span className="px-2 py-1 text-xs bg-red-500/90 text-white rounded-full shadow-sm">
              {spicyIcons} Picante {item.spicyLevel}/3
            </span>
          )}
        </div>
        {item.preparationTime && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/95 backdrop-blur text-amber-800 text-xs rounded-full shadow-sm">
            ⏱️ {item.preparationTime} min
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-amber-900 text-lg mb-2">{item.name}</h3>
        <p className="text-amber-700/80 text-sm mb-3 line-clamp-3">{item.description}</p>

        {allergens.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {allergens.map((allergen) => (
              <span
                key={allergen}
                className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-full flex items-center gap-1"
                title={allergenNames[allergen] || allergen}
              >
                {allergenIcons[allergen] || '⚠️'}
                <span className="hidden sm:inline">{allergenNames[allergen] || allergen}</span>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-amber-100">
          <span className="font-bold text-amber-600 text-xl">{item.price.toFixed(2)} €</span>
          <button
            onClick={() => setShowOptions(true)}
            className="bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Añadir
          </button>
        </div>
      </div>

      {showOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-amber-900 text-lg">{item.name}</h4>
              <button
                onClick={() => setShowOptions(false)}
                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-amber-900 w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Notas / Alergias</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, poco hecho, alergia a frutos secos..."
                  rows={3}
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Añadir al pedido ({quantity})
            </button>
          </div>
        </div>
      )}
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