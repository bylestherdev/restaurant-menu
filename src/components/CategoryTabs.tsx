'use client';

import { Category } from '@/types/menu';
import { categories } from '@/data/menu';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-amber-100 px-4 py-3 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        {sortedCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === category.id
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}