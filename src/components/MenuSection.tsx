'use client';

import { MenuItemCard } from './MenuItemCard';
import { getItemsByCategory } from '@/data/menu';
import { MenuItem } from '@/types/menu';

interface MenuSectionProps {
  categoryId: string;
  items: MenuItem[];
}

export function MenuSection({ categoryId, items }: MenuSectionProps) {
  const categoryItems = getItemsByCategory(categoryId);

  if (categoryItems.length === 0) return null;

  const categoryNames: Record<string, string> = {
    entrantes: 'Entrantes',
    ensaladas: 'Ensaladas',
    principales: 'Platos Principales',
    pescados: 'Pescados y Mariscos',
    pastas: 'Pastas y Risottos',
    postres: 'Postres',
    bebidas: 'Bebidas',
  };

  const categoryEmojis: Record<string, string> = {
    entrantes: '🍽️',
    ensaladas: '🥗',
    principales: '🍖',
    pescados: '🐟',
    pastas: '🍝',
    postres: '🍰',
    bebidas: '🍷',
  };

  return (
    <section id={categoryId} className="py-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{categoryEmojis[categoryId]}</span>
          <div>
            <h2 className="font-bold text-2xl md:text-3xl text-amber-900">{categoryNames[categoryId]}</h2>
            <p className="text-amber-600 text-sm">Descubre nuestras especialidades</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoryItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}