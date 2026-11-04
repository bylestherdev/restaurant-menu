'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { WeatherData } from '@/types/recommendations';
import { SmartRecommendation, getTopRecommendations, generatePairingRecommendations } from '@/lib/recommendationEngine';
import { fetchWeather, getCachedWeather, subscribeToWeather } from '@/lib/weatherService';
import { MenuItem, getItemById, menuItems } from '@/data/menu';
import { useProfile } from './ProfileContext';
import { useCart } from './CartContext';

interface RecommendationsContextType {
  weather: WeatherData;
  refreshWeather: () => Promise<void>;
  recommendations: SmartRecommendation[];
  getRecommendationsForCategory: (categoryId: string, limit?: number) => SmartRecommendation[];
  getPairingsForCart: () => Array<{ foodItem: MenuItem; drinkItem: MenuItem; reason: string; score: number }>;
  isLoading: boolean;
}

const RecommendationsContext = createContext<RecommendationsContextType | undefined>(undefined);

export function RecommendationsProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData>(getCachedWeather());
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { profile } = useProfile();
  const { state: cartState } = useCart();

  // Build global popularity map (in real app, this would come from backend)
  const globalPopularity = new Map<string, number>();
  // Simulate some popular items
  globalPopularity.set('principales-1', 245); // Chuletón
  globalPopularity.set('entrantes-1', 189);   // Croquetas
  globalPopularity.set('postres-1', 156);     // Tarta queso
  globalPopularity.set('pescados-1', 134);    // Lubina
  globalPopularity.set('pastas-1', 123);      // Tagliatelle
  globalPopularity.set('entrantes-3', 98);    // Tabla quesos
  globalPopularity.set('bebidas-4', 312);     // Vino tinto
  globalPopularity.set('principales-5', 87);  // Hamburguesa

  const refreshWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      const newWeather = await fetchWeather();
      setWeather(newWeather);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to weather updates
  useEffect(() => {
    const unsubscribe = subscribeToWeather(setWeather);
    return unsubscribe;
  }, []);

  // Generate recommendations when dependencies change
  useEffect(() => {
    const recs = getTopRecommendations(
      weather,
      profile,
      globalPopularity,
      menuItems,
      10
    );
    setRecommendations(recs);
  }, [weather, profile, cartState.items.length]);

  const getRecommendationsForCategory = useCallback((categoryId: string, limit = 4) => {
    return recommendations
      .filter(rec => {
        const item = getItemById(rec.itemId);
        return item?.category === categoryId;
      })
      .slice(0, limit);
  }, [recommendations]);

  const getPairingsForCart = useCallback(() => {
    const foodIds = cartState.items
      .filter(item => item.category !== 'bebidas' && item.category !== 'postres')
      .map(item => item.id);

    const pairings = generatePairingRecommendations(foodIds);

    return pairings.map(p => {
      const foodItem = getItemById(p.foodItemId)!;
      const drinkItem = getItemById(p.drinkItemId)!;
      return { foodItem, drinkItem, reason: p.reason, score: p.compatibilityScore };
    });
  }, [cartState.items]);

  return (
    <RecommendationsContext.Provider
      value={{
        weather,
        refreshWeather,
        recommendations,
        getRecommendationsForCategory,
        getPairingsForCart,
        isLoading,
      }}
    >
      {children}
    </RecommendationsContext.Provider>
  );
}

export function useRecommendations() {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
}