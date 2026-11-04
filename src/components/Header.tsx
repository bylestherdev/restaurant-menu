'use client';

import { restaurantConfig } from '@/data/menu';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xl">
              🍽️
            </div>
            <div>
              <h1 className="font-bold text-xl text-amber-900">{restaurantConfig.name}</h1>
              <p className="text-xs text-amber-600">{restaurantConfig.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
              <span className="text-sm text-amber-700">🕐</span>
              <span className="text-sm font-medium text-amber-900">13:00 - 23:00</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
              <span className="text-sm text-amber-700">📍</span>
              <span className="text-sm font-medium text-amber-900">C/ Mayor 123</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
              <span className="text-sm text-amber-700">📞</span>
              <span className="text-sm font-medium text-amber-900">+34 900 123 456</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}