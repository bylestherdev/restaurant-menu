import { WeatherData } from '@/types/recommendations';

// ============================================
// SERVICIO DE CLIMA (Mock + Ready para API real)
// ============================================

const MOCK_WEATHER: WeatherData = {
  temperature: 22,
  condition: 'sunny',
  humidity: 45,
  windSpeed: 12,
  location: 'Santiago, Chile',
  timestamp: Date.now(),
};

let weatherCache: WeatherData | null = null;
let weatherListeners: Array<(weather: WeatherData) => void> = [];

export async function fetchWeather(location = 'Madrid'): Promise<WeatherData> {
  try {
    // TODO: Replace with real API call
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric&lang=es`);
    // const data = await response.json();
    // return transformWeatherData(data);

    // Simular variación realista
    const variation = (Math.random() - 0.5) * 6; // ±3°C
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'stormy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    const weather: WeatherData = {
      temperature: Math.round(22 + variation),
      condition: randomCondition,
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 20),
      location,
      timestamp: Date.now(),
    };

    weatherCache = weather;
    notifyListeners(weather);
    return weather;
  } catch {
    return getCachedWeather();
  }
}

export function getCachedWeather(): WeatherData {
  if (weatherCache) return weatherCache;
  return MOCK_WEATHER;
}

export function subscribeToWeather(listener: (weather: WeatherData) => void): () => void {
  weatherListeners.push(listener);
  return () => {
    weatherListeners = weatherListeners.filter(l => l !== listener);
  };
}

function notifyListeners(weather: WeatherData) {
  weatherListeners.forEach(l => l(weather));
}

// Simular actualización cada 10 min
if (typeof window !== 'undefined') {
  setInterval(() => {
    fetchWeather().catch(console.error);
  }, 10 * 60 * 1000);
}

// ============================================
// UTILIDADES DE CLIMA
// ============================================
export function getWeatherDescription(weather: WeatherData): string {
  const descriptions: Record<WeatherData['condition'], string> = {
    sunny: 'Soleado',
    cloudy: 'Nublado',
    rainy: 'Lluvioso',
    stormy: 'Tormenta',
    snowy: 'Nevando',
    foggy: 'Neblinoso',
  };
  return `${descriptions[weather.condition]}, ${weather.temperature}°C`;
}

export function getWeatherIcon(weather: WeatherData): string {
  const icons: Record<WeatherData['condition'], string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
    snowy: '❄️',
    foggy: '🌫️',
  };
  return icons[weather.condition];
}

export function getThermalSensation(weather: WeatherData): string {
  const { temperature, humidity, windSpeed } = weather;
  // Simplified heat index / wind chill
  if (temperature >= 27 && humidity > 60) {
    const feelsLike = temperature + (humidity - 60) * 0.5;
    return `Sensación: ${Math.round(feelsLike)}°C`;
  }
  if (temperature <= 10 && windSpeed > 15) {
    const feelsLike = temperature - windSpeed * 0.3;
    return `Sensación: ${Math.round(feelsLike)}°C`;
  }
  return `Sensación: ${temperature}°C`;
}