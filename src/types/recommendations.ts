export interface WeatherData {
  temperature: number; // Celsius
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
  humidity: number;
  windSpeed: number;
  location: string;
  timestamp: number;
}

export interface TimeContext {
  hour: number;
  period: 'breakfast' | 'lunch' | 'dinner' | 'late-night';
  dayOfWeek: number; // 0-6
  isWeekend: boolean;
  isHoliday?: boolean;
}

export interface UserPreferences {
  dietaryRestrictions: string[]; // 'vegetarian', 'vegan', 'gluten-free', 'nut-free', etc.
  allergies: string[];
  spiceTolerance: 0 | 1 | 2 | 3;
  favoriteCategories: string[];
  dislikedIngredients: string[];
  priceRange: [number, number]; // [min, max]
  language: 'es' | 'en';
}

export interface OrderHistoryItem {
  itemId: string;
  timestamp: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  quantity: number;
}

export interface UserProfile {
  preferences: UserPreferences;
  orderHistory: OrderHistoryItem[];
  visitCount: number;
  lastVisit: number;
  averageSpend: number;
  favoriteItems: string[]; // item IDs
}

export interface RecommendationReason {
  type: 'weather' | 'time' | 'preference' | 'popularity' | 'pairing' | 'history' | 'seasonal' | 'chef';
  weight: number; // 0-1
  message: string;
  icon: string;
}

export interface SmartRecommendation {
  itemId: string;
  score: number; // 0-100
  reasons: RecommendationReason[];
  confidence: 'high' | 'medium' | 'low';
}

export interface PairingSuggestion {
  foodItemId: string;
  drinkItemId: string;
  reason: string;
  compatibilityScore: number; // 0-100
}

export interface WeatherRecommendationRule {
  condition: keyof WeatherData | 'temperature';
  operator: '>' | '<' | '>=' | '<=' | '===';
  value: number | string;
  categoryBoost: Record<string, number>; // category -> boost %
  itemBoost?: Record<string, number>; // itemId -> boost %
  message: string;
  icon: string;
}

export interface TimeRecommendationRule {
  period: TimeContext['period'];
  categoryBoost: Record<string, number>;
  itemBoost?: Record<string, number>;
  message: string;
  icon: string;
}