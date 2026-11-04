'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryTabs } from '@/components/CategoryTabs';
import { MenuSection } from '@/components/MenuSection';
import { CartSidebar } from '@/components/CartSidebar';
import { SmartRecommendationsPanel } from '@/components/SmartRecommendationsPanel';
import { WeatherBanner } from '@/components/WeatherBanner';
import { categories } from '@/data/menu';
import { useState, useEffect } from 'react';

export function MenuContent() {
  const [activeCategory, setActiveCategory] = useState('entrantes');
  const [showSmartPanel, setShowSmartPanel] = useState(false);
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Auto-scroll to category when changed
  useEffect(() => {
    const element = document.getElementById(activeCategory);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header />
      
      <WeatherBanner />
      
      <main className="flex-1 relative">
        {/* Smart Recommendations Panel (slide-in from left on mobile, sidebar on desktop) */}
        <SmartRecommendationsPanel isOpen={showSmartPanel} onClose={() => setShowSmartPanel(false)} />
        
        {/* Main Menu */}
        <div className="max-w-7xl mx-auto px-4 pb-24">
          {/* Category Tabs + Smart Panel Toggle */}
          <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-amber-100 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSmartPanel(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-sm font-medium shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="hidden sm:inline">Para Ti</span>
                </button>
              </div>
            </div>
            
            <CategoryTabs 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />
          </div>

          {/* Menu Sections */}
          <div className="pt-4">
            {sortedCategories.map((category) => (
              <MenuSection 
                key={category.id} 
                categoryId={category.id} 
                items={[]} 
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <CartSidebar />
    </div>
  );
}