import {
  WeatherData,
  TimeContext,
  UserProfile,
  SmartRecommendation,
  RecommendationReason,
  WeatherRecommendationRule,
  TimeRecommendationRule,
  PairingSuggestion,
} from '@/types/recommendations';
import { MenuItem, getItemById, getItemsByCategory } from '@/data/menu';

export type { SmartRecommendation, RecommendationReason, PairingSuggestion, WeatherData, UserProfile } from '@/types/recommendations';

// ============================================
// REGLAS BASADAS EN CLIMA
// ============================================
export const WEATHER_RULES: WeatherRecommendationRule[] = [
  // FRÍO (< 15°C) → Platos calientes, contundentes
  {
    condition: 'temperature',
    operator: '<',
    value: 15,
    categoryBoost: {
      principales: 30,
      pastas: 25,
      pescados: 15,
      entrantes: 10,
    },
    message: 'Hace frío, ¡apetece algo caliente y reconfortante!',
    icon: '🔥',
  },
  {
    condition: 'temperature',
    operator: '<=',
    value: 10,
    categoryBoost: {
      principales: 40,
      pastas: 35,
    },
    itemBoost: {
      'principales-4': 50, // Carrilleras estofadas
      'pastas-2': 40,      // Risotto de boletus
      'entrantes-4': 30,   // Pulpo a la gallega
    },
    message: 'Temperatura muy baja: platos de cuchara y guisos largos',
    icon: '🍲',
  },

  // CALOR (> 25°C) → Platos fríos, ligeros, refrescantes
  {
    condition: 'temperature',
    operator: '>',
    value: 25,
    categoryBoost: {
      ensaladas: 35,
      entrantes: 20,
      pescados: 15,
      postres: 10,
      bebidas: 25,
    },
    itemBoost: {
      'ensaladas-2': 40,   // Burrata tomate
      'ensaladas-4': 35,   // Quinoa aguacate
      'entrantes-5': 50,   // Gazpacho
      'pescados-1': 30,    // Lubina a la sal
      'postres-4': 30,     // Frutas
      'bebidas-1': 40,     // Agua
      'bebidas-2': 30,     // Refrescos
    },
    message: '¡Calor! Te recomendamos platos frescos y bebidas frías',
    icon: '❄️',
  },
  {
    condition: 'temperature',
    operator: '>=',
    value: 30,
    categoryBoost: {
      ensaladas: 45,
      bebidas: 35,
      postres: 15,
    },
    message: 'Ola de calor: prioridad a hidratación y platos fríos',
    icon: '🧊',
  },

  // LLUVIA → Comfort food
  {
    condition: 'condition',
    operator: '===',
    value: 'rainy',
    categoryBoost: {
      principales: 25,
      pastas: 20,
      entrantes: 15,
    },
    itemBoost: {
      'principales-4': 35,  // Carrilleras
      'pastas-1': 30,       // Tagliatelle ragú
      'entrantes-1': 25,    // Croquetas
    },
    message: 'Día lluvioso: comida reconfortante para el alma',
    icon: '☔',
  },

  // NUBOSO → Equilibrio
  {
    condition: 'condition',
    operator: '===',
    value: 'cloudy',
    categoryBoost: {
      principales: 15,
      pastas: 15,
      ensaladas: 10,
      pescados: 10,
    },
    message: 'Día nublado: menú equilibrado para cualquier antojo',
    icon: '☁️',
  },

  // SOLEADO → Terraza, platos para compartir
  {
    condition: 'condition',
    operator: '===',
    value: 'sunny',
    categoryBoost: {
      entrantes: 25,
      ensaladas: 20,
      pescados: 15,
      bebidas: 20,
    },
    itemBoost: {
      'entrantes-3': 35,    // Tabla quesos
      'entrantes-2': 30,    // Pimientos padrón
      'bebidas-8': 40,      // Cóctel casa
      'bebidas-3': 30,      // Caña
    },
    message: '¡Sol radiante! Perfecto para compartir en terraza',
    icon: '☀️',
  },

  // HUMEDAD ALTA → Evitar fritos pesados
  {
    condition: 'humidity',
    operator: '>',
    value: 80,
    categoryBoost: {
      ensaladas: 15,
      pescados: 10,
      postres: 10,
    },
    message: 'Humedad alta: platos ligeros y frescos',
    icon: '💧',
  },
];

// ============================================
// REGLAS BASADAS EN HORA
// ============================================
export const TIME_RULES: TimeRecommendationRule[] = [
  {
    period: 'breakfast', // 7-11
    categoryBoost: {
      entrantes: 10,
      bebidas: 50,
    },
    itemBoost: {
      'bebidas-7': 60,    // Café
      'bebidas-1': 30,    // Agua
      'postres-5': 20,    // Helado (merienda)
    },
    message: 'Buenos días: cafés, zumos y desayuno ligero',
    icon: '🌅',
  },
  {
    period: 'lunch', // 12-16
    categoryBoost: {
      entrantes: 20,
      ensaladas: 25,
      principales: 30,
      pescados: 20,
      pastas: 25,
      bebidas: 15,
    },
    itemBoost: {
      'principales-5': 30, // Hamburguesa (rápida)
      'pastas-1': 25,      // Tagliatelle
      'ensaladas-1': 25,   // César (completa)
    },
    message: 'Hora de comer: menú completo con entrantes y principal',
    icon: '🍽️',
  },
  {
    period: 'dinner', // 19-22
    categoryBoost: {
      entrantes: 35,
      principales: 30,
      pescados: 25,
      pastas: 20,
      postres: 30,
      bebidas: 25,
    },
    itemBoost: {
      'entrantes-3': 40,   // Tabla quesos (compartir)
      'entrantes-4': 35,   // Pulpo
      'principales-1': 40, // Chuletón (ocasión)
      'principales-2': 35, // Secreto ibérico
      'pescados-1': 35,    // Lubina sal
      'postres-1': 35,     // Tarta queso
      'postres-2': 30,     // Coulant
      'bebidas-4': 35,     // Vino tinto
      'bebidas-5': 30,     // Vino blanco
      'bebidas-8': 35,     // Cóctel
    },
    message: 'Cena: platos para disfrutar, compartir y maridar',
    icon: '🌙',
  },
  {
    period: 'late-night', // 23+
    categoryBoost: {
      entrantes: 20,
      postres: 25,
      bebidas: 30,
    },
    itemBoost: {
      'postres-2': 40,     // Coulant
      'postres-5': 35,     // Helados
      'bebidas-8': 30,     // Cóctel
      'bebidas-3': 25,     // Cerveza
    },
    message: 'Noche avanzada: postres, copas y picoteo',
    icon: '🦉',
  },
];

// ============================================
// MARIDAJES PREDEFINIDOS
// ============================================
export const PAIRINGS: PairingSuggestion[] = [
  // CARNES ROJAS → Vino tinto
  { foodItemId: 'principales-1', drinkItemId: 'bebidas-4', reason: 'Chuletón madurado pide un Ribera del Duero crianza', compatibilityScore: 95 },
  { foodItemId: 'principales-2', drinkItemId: 'bebidas-4', reason: 'Secreto ibérico marida perfecto con tinto de cuerpo medio', compatibilityScore: 90 },
  { foodItemId: 'principales-4', drinkItemId: 'bebidas-4', reason: 'Carrilleras en vino tinto → mismo vino para acompañar', compatibilityScore: 98 },

  // CARNES BLANCAS/POLLO → Blanco o rosado
  { foodItemId: 'principales-3', drinkItemId: 'bebidas-5', reason: 'Curry verde Thai + Verdejo fresco = equilibrio', compatibilityScore: 85 },
  { foodItemId: 'principales-5', drinkItemId: 'bebidas-3', reason: 'Hamburguesa gourmet + caña bien fría = clásico', compatibilityScore: 88 },

  // PESCADOS → Blanco
  { foodItemId: 'pescados-1', drinkItemId: 'bebidas-5', reason: 'Lubina a la sal + Verdejo = pureza marina', compatibilityScore: 92 },
  { foodItemId: 'pescados-2', drinkItemId: 'bebidas-5', reason: 'Gambas al ajillo + blanco fresco corta el ajo', compatibilityScore: 90 },
  { foodItemId: 'pescados-3', drinkItemId: 'bebidas-5', reason: 'Salmón teriyaki + vino blanco afrutado', compatibilityScore: 87 },
  { foodItemId: 'pescados-4', drinkItemId: 'bebidas-4', reason: 'Arroz caldoso marisco + tinto ligero (o blanco)', compatibilityScore: 85 },

  // PASTAS → Según salsa
  { foodItemId: 'pastas-1', drinkItemId: 'bebidas-4', reason: 'Ragú de buey 6h + tinto con cuerpo', compatibilityScore: 93 },
  { foodItemId: 'pastas-2', drinkItemId: 'bebidas-5', reason: 'Risotto boletus/trufa + blanco con cuerpo', compatibilityScore: 88 },
  { foodItemId: 'pastas-3', drinkItemId: 'bebidas-6', reason: 'Lasaña verduras + rosado fresco', compatibilityScore: 85 },
  { foodItemId: 'pastas-4', drinkItemId: 'bebidas-4', reason: 'Carbonara tradicional + tinto ligero', compatibilityScore: 86 },

  // ENTRANTES
  { foodItemId: 'entrantes-1', drinkItemId: 'bebidas-3', reason: 'Croquetas ibéricas + caña = barra de toda la vida', compatibilityScore: 90 },
  { foodItemId: 'entrantes-3', drinkItemId: 'bebidas-4', reason: 'Tabla quesos + tinto = maridaje clásico', compatibilityScore: 95 },
  { foodItemId: 'entrantes-4', drinkItemId: 'bebidas-5', reason: 'Pulpo gallego + blanco (Albariño ideal)', compatibilityScore: 94 },

  // POSTRES
  { foodItemId: 'postres-1', drinkItemId: 'bebidas-7', reason: 'Tarta queso + café solo = final perfecto', compatibilityScore: 88 },
  { foodItemId: 'postres-2', drinkItemId: 'bebidas-7', reason: 'Coulant chocolate + café cortado', compatibilityScore: 85 },
];

// ============================================
// FUNCIONES DEL MOTOR
// ============================================

function evaluateWeatherRule(rule: WeatherRecommendationRule, weather: WeatherData): boolean {
  const value = weather[rule.condition];
  if (value === undefined) return false;

  switch (rule.operator) {
    case '>': return (value as number) > (rule.value as number);
    case '<': return (value as number) < (rule.value as number);
    case '>=': return (value as number) >= (rule.value as number);
    case '<=': return (value as number) <= (rule.value as number);
    case '===': return value === rule.value;
    default: return false;
  }
}

function getTimeContext(): TimeContext {
  const now = new Date();
  const hour = now.getHours();
  let period: TimeContext['period'] = 'lunch';

  if (hour >= 7 && hour < 12) period = 'breakfast';
  else if (hour >= 12 && hour < 17) period = 'lunch';
  else if (hour >= 17 && hour < 23) period = 'dinner';
  else period = 'late-night';

  return {
    hour,
    period,
    dayOfWeek: now.getDay(),
    isWeekend: now.getDay() === 0 || now.getDay() === 6,
    isHoliday: false, // TODO: integrar calendario festivos
  };
}

export function generateWeatherRecommendations(
  weather: WeatherData,
  allItems: MenuItem[]
): SmartRecommendation[] {
  const activeRules = WEATHER_RULES.filter(rule => evaluateWeatherRule(rule, weather));
  if (activeRules.length === 0) return [];

  const itemScores = new Map<string, { score: number; reasons: RecommendationReason[] }>();

  for (const rule of activeRules) {
    // Boost por categoría
    for (const [category, boost] of Object.entries(rule.categoryBoost)) {
      const items = getItemsByCategory(category);
      for (const item of items) {
        const existing = itemScores.get(item.id) || { score: 0, reasons: [] };
        existing.score += boost;
        existing.reasons.push({
          type: 'weather',
          weight: boost / 100,
          message: rule.message,
          icon: rule.icon,
        });
        itemScores.set(item.id, existing);
      }
    }

    // Boost por item específico
    if (rule.itemBoost) {
      for (const [itemId, boost] of Object.entries(rule.itemBoost)) {
        const existing = itemScores.get(itemId) || { score: 0, reasons: [] };
        existing.score += boost;
        existing.reasons.push({
          type: 'weather',
          weight: boost / 100,
          message: rule.message,
          icon: rule.icon,
        });
        itemScores.set(itemId, existing);
      }
    }
  }

  // Convertir a recomendaciones ordenadas
  return Array.from(itemScores.entries())
    .map(([itemId, data]): SmartRecommendation => ({
      itemId,
      score: Math.min(100, data.score),
      reasons: data.reasons,
      confidence: data.score > 60 ? 'high' : data.score > 30 ? 'medium' : 'low',
    }))
    .sort((a, b) => b.score - a.score);
}

export function generateTimeRecommendations(
  allItems: MenuItem[]
): SmartRecommendation[] {
  const timeContext = getTimeContext();
  const rule = TIME_RULES.find(r => r.period === timeContext.period);
  if (!rule) return [];

  const itemScores = new Map<string, { score: number; reasons: RecommendationReason[] }>();

  for (const [category, boost] of Object.entries(rule.categoryBoost)) {
    const items = getItemsByCategory(category);
    for (const item of items) {
      const existing = itemScores.get(item.id) || { score: 0, reasons: [] };
      existing.score += boost;
      existing.reasons.push({
        type: 'time',
        weight: boost / 100,
        message: rule.message,
        icon: rule.icon,
      });
      itemScores.set(item.id, existing);
    }
  }

  if (rule.itemBoost) {
    for (const [itemId, boost] of Object.entries(rule.itemBoost)) {
      const existing = itemScores.get(itemId) || { score: 0, reasons: [] };
      existing.score += boost;
      existing.reasons.push({
        type: 'time',
        weight: boost / 100,
        message: rule.message,
        icon: rule.icon,
      });
      itemScores.set(itemId, existing);
    }
  }

  return Array.from(itemScores.entries())
    .map(([itemId, data]): SmartRecommendation => ({
      itemId,
      score: Math.min(100, data.score),
      reasons: data.reasons,
      confidence: data.score > 50 ? 'high' : data.score > 25 ? 'medium' : 'low',
    }))
    .sort((a, b) => b.score - a.score);
}

export function generatePreferenceRecommendations(
  profile: UserProfile,
  allItems: MenuItem[]
): SmartRecommendation[] {
  const { preferences, orderHistory } = profile;
  const itemScores = new Map<string, { score: number; reasons: RecommendationReason[] }>();

  // 1. FILTRAR por alergias/restricciones (penalización fuerte)
  for (const item of allItems) {
    const allergens = item.allergens || [];
    const hasAllergy = preferences.allergies.some(a => allergens.includes(a));
    const hasRestriction = preferences.dietaryRestrictions.some(r => {
      if (r === 'vegetarian' && !item.isVegetarian) return true;
      if (r === 'vegan' && !item.isVegan) return true;
      if (r === 'gluten-free' && !item.isGlutenFree) return true;
      return false;
    });

    if (hasAllergy || hasRestriction) {
      itemScores.set(item.id, { score: -1000, reasons: [] });
    }
  }

  // 2. BOOST por preferencias dietéticas
  for (const item of allItems) {
    if (itemScores.get(item.id)?.score === -1000) continue;

    const existing = itemScores.get(item.id) || { score: 0, reasons: [] };
    let boost = 0;

    if (preferences.dietaryRestrictions.includes('vegetarian') && item.isVegetarian) boost += 15;
    if (preferences.dietaryRestrictions.includes('vegan') && item.isVegan) boost += 20;
    if (preferences.dietaryRestrictions.includes('gluten-free') && item.isGlutenFree) boost += 15;

    // Categoría favorita
    if (preferences.favoriteCategories.includes(item.category)) boost += 10;

    // Nivel picante
    if (item.spicyLevel && item.spicyLevel <= preferences.spiceTolerance) boost += 5;
    else if (item.spicyLevel && item.spicyLevel > preferences.spiceTolerance) boost -= 10;

    // Rango de precio
    if (item.price >= preferences.priceRange[0] && item.price <= preferences.priceRange[1]) boost += 5;

    if (boost > 0) {
      existing.score += boost;
      existing.reasons.push({
        type: 'preference',
        weight: boost / 100,
        message: 'Se ajusta a tus preferencias',
        icon: '🎯',
      });
      itemScores.set(item.id, existing);
    }
  }

  // 3. HISTORIAL DE PEDIDOS (reordenar favoritos)
  const itemFrequency = new Map<string, number>();
  for (const order of orderHistory) {
    itemFrequency.set(order.itemId, (itemFrequency.get(order.itemId) || 0) + order.quantity);
  }

  for (const [itemId, freq] of itemFrequency.entries()) {
    const existing = itemScores.get(itemId) || { score: 0, reasons: [] };
    const boost = Math.min(30, freq * 5); // Máx 30 puntos por historial
    existing.score += boost;
    if (boost > 0) {
      existing.reasons.push({
        type: 'history',
        weight: boost / 100,
        message: `Lo has pedido ${freq} vez${freq > 1 ? 'es' : ''}`,
        icon: '🔁',
      });
    }
    itemScores.set(itemId, existing);
  }

  // 4. ITEMS FAVORITOS explícitos
  for (const favId of profile.favoriteItems) {
    const existing = itemScores.get(favId) || { score: 0, reasons: [] };
    existing.score += 25;
    existing.reasons.push({
      type: 'preference',
      weight: 0.25,
      message: 'Marcado como favorito',
      icon: '⭐',
    });
    itemScores.set(favId, existing);
  }

  return Array.from(itemScores.entries())
    .filter(([, data]) => data.score > 0)
    .map(([itemId, data]): SmartRecommendation => ({
      itemId,
      score: Math.min(100, data.score),
      reasons: data.reasons,
      confidence: data.score > 50 ? 'high' : data.score > 20 ? 'medium' : 'low',
    }))
    .sort((a, b) => b.score - a.score);
}

export function generatePopularityRecommendations(
  allItems: MenuItem[],
  globalOrderCounts: Map<string, number> // itemId -> total orders
): SmartRecommendation[] {
  const maxOrders = Math.max(...globalOrderCounts.values(), 1);
  const recommendations: SmartRecommendation[] = [];

  for (const [itemId, count] of globalOrderCounts.entries()) {
    const item = getItemById(itemId);
    if (!item) continue;

    const normalizedScore = (count / maxOrders) * 40; // Máx 40 pts por popularidad
    recommendations.push({
      itemId,
      score: normalizedScore,
      reasons: [{
        type: 'popularity',
        weight: normalizedScore / 100,
        message: `Plato popular: ${count} pedidos`,
        icon: '📈',
      }],
      confidence: normalizedScore > 20 ? 'high' : 'medium',
    });
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

export function generatePairingRecommendations(
  selectedFoodIds: string[]
): PairingSuggestion[] {
  return PAIRINGS.filter(p => selectedFoodIds.includes(p.foodItemId))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

export function mergeRecommendations(
  ...recommendationArrays: SmartRecommendation[][]
): SmartRecommendation[] {
  const merged = new Map<string, { score: number; reasons: RecommendationReason[] }>();

  for (const recs of recommendationArrays) {
    for (const rec of recs) {
      const existing = merged.get(rec.itemId) || { score: 0, reasons: [] };
      existing.score += rec.score;
      existing.reasons.push(...rec.reasons);
      merged.set(rec.itemId, existing);
    }
  }

  return Array.from(merged.entries())
    .map(([itemId, data]): SmartRecommendation => ({
      itemId,
      score: Math.min(100, data.score),
      reasons: data.reasons,
      confidence: data.score > 70 ? 'high' : data.score > 40 ? 'medium' : 'low',
    }))
    .sort((a, b) => b.score - a.score);
}

export function getTopRecommendations(
  weather: WeatherData | null,
  profile: UserProfile | null,
  globalPopularity: Map<string, number>,
  allItems: MenuItem[],
  limit = 6
): SmartRecommendation[] {
  const recs: SmartRecommendation[] = [];

  // Tiempo (siempre)
  recs.push(...generateTimeRecommendations(allItems));

  // Clima (si disponible)
  if (weather) {
    recs.push(...generateWeatherRecommendations(weather, allItems));
  }

  // Preferencias (si hay perfil)
  if (profile) {
    recs.push(...generatePreferenceRecommendations(profile, allItems));
  }

  // Popularidad
  recs.push(...generatePopularityRecommendations(allItems, globalPopularity));

  // Fusionar y ordenar
  const merged = mergeRecommendations(recs);

  // Deduplicar por itemId manteniendo el mayor score
  const unique = new Map<string, SmartRecommendation>();
  for (const rec of merged) {
    if (!unique.has(rec.itemId) || rec.score > unique.get(rec.itemId)!.score) {
      unique.set(rec.itemId, rec);
    }
  }

  return Array.from(unique.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}