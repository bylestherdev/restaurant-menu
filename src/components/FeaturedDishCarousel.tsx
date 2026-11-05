'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MenuItem } from '@/data/menu';

interface FeaturedDishCarouselProps {
  showCount?: number; // número total de platos a mostrar (default: 5)
  desktopVisible?: number; // cuántos mostrar en desktop (default: 3)
}

export const ssr = false;

export function FeaturedDishCarousel({ showCount = 5, desktopVisible = 3 }: FeaturedDishCarouselProps) {
  // Platos populares del menú con categorías garantizadas
  const popularMenuItems: MenuItem[] = [
    // Entrantes
    { id: 'entrantes-5', name: 'Empanadas de Pino', price: 2500, category: 'entrantes', description: 'Masa artesanal, carne de pino, cebolla, huevo duro y aceituna.' },
    { id: 'entrantes-1', name: 'Croquetas de Jamón Ibérico', price: 8500, category: 'entrantes', description: 'Crujientes por fuera, cremosas por dentro.' },
    // Postres
    { id: 'postres-1', name: 'Tarta de Queso', price: 5500, category: 'postres', description: 'Receta de la abuela.' },
    { id: 'postres-4', name: 'Helado de Manjar', price: 4800, category: 'postres', description: 'Helado artesanal de manjar.' },
    // Bebidas
    { id: 'bebidas-7', name: 'Café / Infusiones', price: 800, category: 'bebidas', description: 'Café, té, infusiones.' },
    { id: 'bebidas-8', name: 'Terremoto', price: 2500, category: 'bebidas', description: 'Pisco, pineapple ice cream y grenadina.' },
    // Principales
    { id: 'principales-3', name: 'Lomo al Travesero', price: 12500, category: 'principales', description: 'Lomo de cerdo marinado.' },
    { id: 'principales-1', name: 'Lomo al Travesero', price: 12500, category: 'principales', description: 'Lomo de cerdo marinado en hierbas.' },
  ];

  const [dishes, setDishes] = useState<MenuItem[]>(popularMenuItems.slice(0, showCount));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Determinar si es desktop al montar
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // QUIZÁS: ya no hay auto-rotation. Navegación por flechas.
  // Ya no usamos interval auto.

  // Items to show based on desktop/mobile
  // Mobile: 2 platos, Desktop: desktopVisible (default 3)
  const visibleCount = isDesktop ? desktopVisible : 2;

  // Build the list of dishes to display (with wrap-around for infinite loop)
  const visibleDishes = [];
  
  for (let i = 0; i < visibleCount; i++) {
    const dishIndex = (currentIndex + i) % dishes.length;
    visibleDishes.push(dishes[dishIndex]);
  }

  return (
    <div className="mt-6 bg-amber-950 rounded-xl border border-amber-200 p-4">
      <div className="overflow-hidden rounded-lg">
        <div className={`flex transition-transform duration-300 ${
          isDesktop ? 'grid' : 'flex'
        } gap-3 ${
          isDesktop ? 'grid-cols-3' : 'items-center justify-center'
        } px-2 pb-2 ${
          isDesktop ? 'overflow-x-auto' : 'flex-none'
        }`}
        ref={carouselRef}
        role="region"
        aria-label="Platos recomendados del día">
          
          {visibleDishes.map((dish, index) => {
            const category = dish.category || 'principales';
            return (
              <div 
                key={dish.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur hover:bg-white/30 transition-colors cursor-pointer ${
                  index === 0 ? 'scale-105' : 'scale-100'
                } transition-transform`}
                onClick={() => {
                  window.location.href = `/${category}?item=${dish.id}`;
                }}
              >
                <div className="w-20 h-20 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                  <span className="text-3xl">{getDishIcon(category)}</span>
                </div>
                <h4 className="text-xs font-medium text-amber-100 truncate">{dish.name}</h4>
                <p className="text-xs text-amber-300">💰 {dish.price?.toLocaleString('es-CL')} CLP</p>
              </div>
            );
          })}

          {/* Flexible nav area - always show arrows for usability */}
          <div className="mt-2 flex items-center justify-between w-full">
            {/* Left arrow - visible on mobile and desktop */}
            <button
              onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              aria-label="Plato anterior"
              className="flex items-center justify-center px-2 py-1 rounded-md text-amber-300 hover:text-amber-200 transition-colors bg-amber-950/20 backdrop-blur select-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right arrow - visible on mobile and desktop */}
            <button
              onClick={() => setCurrentIndex(prev => Math.min(prev + 1, Math.max(0, dishes.length - visibleCount)))}
              aria-label="Plato siguiente"
              className="flex items-center justify-center px-2 py-1 rounded-md text-amber-300 hover:text-amber-200 transition-colors bg-amber-950/20 backdrop-blur select-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDishIcon(category: string): string {
  const icons: Record<string, string> = {
    principales: '🍖',
    postres: '🍰',
    entrantes: '🍽️',
    ensaladas: '🥗',
    pastas: '🍝',
    bebidas: '☕',
  };
  return icons[category] || '🍽️';
}