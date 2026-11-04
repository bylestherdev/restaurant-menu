'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, UserPreferences, OrderHistoryItem } from '@/types/recommendations';

const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRestrictions: [],
  allergies: [],
  spiceTolerance: 2,
  favoriteCategories: [],
  dislikedIngredients: [],
  priceRange: [0, 50],
  language: 'es',
};

const INITIAL_PROFILE: UserProfile = {
  preferences: DEFAULT_PREFERENCES,
  orderHistory: [],
  visitCount: 0,
  lastVisit: Date.now(),
  averageSpend: 0,
  favoriteItems: [],
};

type ProfileAction =
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'ADD_ORDER'; payload: OrderHistoryItem }
  | { type: 'SET_ORDER_HISTORY'; payload: OrderHistoryItem[] }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'INCREMENT_VISIT' }
  | { type: 'UPDATE_SPEND'; payload: number }
  | { type: 'LOAD_PROFILE'; payload: UserProfile }
  | { type: 'RESET_PROFILE' };

function profileReducer(state: UserProfile, action: ProfileAction): UserProfile {
  switch (action.type) {
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };

    case 'ADD_ORDER': {
      const newHistory = [...state.orderHistory, action.payload].slice(-100); // Keep last 100
      const totalSpend = newHistory.reduce((sum, o) => {
        // We'd need item price here, simplified
        return sum + 15 * o.quantity; // avg estimate
      }, 0);
      return {
        ...state,
        orderHistory: newHistory,
        lastVisit: Date.now(),
        averageSpend: totalSpend / newHistory.length || 0,
      };
    }

    case 'SET_ORDER_HISTORY':
      return { ...state, orderHistory: action.payload };

    case 'TOGGLE_FAVORITE': {
      const favorites = state.favoriteItems.includes(action.payload)
        ? state.favoriteItems.filter(id => id !== action.payload)
        : [...state.favoriteItems, action.payload];
      return { ...state, favoriteItems: favorites };
    }

    case 'INCREMENT_VISIT':
      return { ...state, visitCount: state.visitCount + 1, lastVisit: Date.now() };

    case 'UPDATE_SPEND': {
      const totalOrders = state.orderHistory.length + 1;
      const newAvg = ((state.averageSpend * (totalOrders - 1)) + action.payload) / totalOrders;
      return { ...state, averageSpend: newAvg };
    }

    case 'LOAD_PROFILE':
      return action.payload;

    case 'RESET_PROFILE':
      return INITIAL_PROFILE;

    default:
      return state;
  }
}

interface ProfileContextType {
  profile: UserProfile;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addOrderToHistory: (itemId: string, quantity: number, rating?: number) => void;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  getDietaryCompatibility: (item: { allergens?: string[]; isVegetarian?: boolean; isVegan?: boolean; isGlutenFree?: boolean }) => 'full' | 'partial' | 'none';
  clearHistory: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, dispatch] = useReducer(profileReducer, INITIAL_PROFILE);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user-profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_PROFILE', payload: parsed });
      } catch {
        // Ignore parse errors
      }
    }
    // Track visit
    dispatch({ type: 'INCREMENT_VISIT' });
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('user-profile', JSON.stringify(profile));
  }, [profile]);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: prefs });
  }, []);

  const addOrderToHistory = useCallback((itemId: string, quantity: number, rating?: number) => {
    dispatch({
      type: 'ADD_ORDER',
      payload: {
        itemId,
        timestamp: Date.now(),
        quantity,
        rating: rating as 1 | 2 | 3 | 4 | 5 | undefined,
      },
    });
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: itemId });
  }, []);

  const isFavorite = useCallback((itemId: string) => {
    return profile.favoriteItems.includes(itemId);
  }, [profile.favoriteItems]);

  const getDietaryCompatibility = useCallback((
    item: { allergens?: string[]; isVegetarian?: boolean; isVegan?: boolean; isGlutenFree?: boolean }
  ): 'full' | 'partial' | 'none' => {
    const { dietaryRestrictions, allergies } = profile.preferences;
    const itemAllergens = item.allergens || [];

    // Check allergies (hard block)
    const hasAllergy = allergies.some(a => itemAllergens.includes(a));
    if (hasAllergy) return 'none';

    // Check dietary restrictions
    let violations = 0;
    if (dietaryRestrictions.includes('vegetarian') && !item.isVegetarian) violations++;
    if (dietaryRestrictions.includes('vegan') && !item.isVegan) violations++;
    if (dietaryRestrictions.includes('gluten-free') && !item.isGlutenFree) violations++;

    if (violations === 0) return 'full';
    if (violations <= 1) return 'partial';
    return 'none';
  }, [profile.preferences]);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'SET_ORDER_HISTORY', payload: [] });
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updatePreferences,
        addOrderToHistory,
        toggleFavorite,
        isFavorite,
        getDietaryCompatibility,
        clearHistory,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}