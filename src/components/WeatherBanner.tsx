'use client';

import { useRecommendations } from '@/context/RecommendationsContext';
import { getWeatherDescription, getWeatherIcon, getThermalSensation } from '@/lib/weatherService';
import { WeatherData } from '@/types/recommendations';

export function WeatherBanner() {
  const { weather, refreshWeather, isLoading } = useRecommendations();

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0L100 100M100 0L0 100%22 stroke=%22white%22 stroke-width=%220.5%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl animate-pulse-slow">
            {getWeatherIcon(weather)}
          </div>
          <div>
            <p className="font-semibold text-sm">{weather.location}</p>
            <p className="text-amber-100 text-xs">{getWeatherDescription(weather)} · {getThermalSensation(weather)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Smart recommendation indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full border border-white/30">
            <span className="text-xs font-medium">🧠 IA Activa</span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          <button
            onClick={refreshWeather}
            disabled={isLoading}
            className="p-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50"
            aria-label="Actualizar clima"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* AI Recommendation Tagline */}
      <div className="relative max-w-7xl mx-auto px-4 pb-3">
        <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
          <div className="flex items-center gap-2 text-amber-100 text-sm">
            <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Basado en el clima y la hora, te sugerimos: </span>
            <SmartRecommendationTags weather={weather} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SmartRecommendationTags({ weather }: { weather: WeatherData }) {
  // This will be enhanced by the recommendations context
  const suggestions = getWeatherBasedSuggestions(weather);
  
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((s, i) => (
        <span
          key={i}
          className="px-2 py-0.5 bg-white/20 backdrop-blur rounded-full text-xs hover:bg-white/30 transition-colors cursor-pointer"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function getWeatherBasedSuggestions(weather: { temperature: number; condition: string }) {
  const { temperature, condition } = weather;
  const tags: string[] = [];

  if (temperature < 12) {
    tags.push('🍲 Platos de cuchara', '🔥 Carnes guisadas', '☕ Bebidas calientes');
  } else if (temperature < 18) {
    tags.push('🍝 Pastas caseras', '🍖 Platos principales', '🍷 Vino tinto');
  } else if (temperature < 25) {
    tags.push('🥗 Ensaladas frescas', '🐟 Pescados', '🍝 Risottos');
  } else {
    tags.push('🥗 Ensaladas', '🥣 Gazpacho', '🍹 Cócteles', '🍦 Helados', '💧 Agua fría');
  }

  if (condition === 'rainy') tags.unshift('☔ Comida reconfortante');
  if (condition === 'sunny') tags.unshift('☀️ Para terraza');

  return tags.slice(0, 4);
}