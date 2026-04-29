import { useState, useEffect } from 'react';
import useInterval from './useInterval';

const WEATHER_REFRESH = 30 * 60 * 1000; // 30 minutes

// Simulated weather data (replace with real API call if available)
function generateWeatherData() {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  const icons = ['sun', 'cloud-sun', 'cloud', 'cloud-rain', 'moon'];
  const idx = Math.floor(Math.random() * conditions.length);
  const temp = Math.round(22 + Math.random() * 15);
  const humidity = Math.round(40 + Math.random() * 40);

  const forecast = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const fi = Math.floor(Math.random() * conditions.length);
    return {
      day: i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      condition: conditions[fi],
      icon: icons[fi],
      high: Math.round(temp + Math.random() * 5 - 2),
      low:  Math.round(temp - 5 + Math.random() * 3),
      humidity: Math.round(humidity + Math.random() * 20 - 10),
      precipitation: Math.round(Math.random() * 10),
      wind: Math.round(5 + Math.random() * 20),
    };
  });

  return {
    current: {
      temperature: temp,
      condition: conditions[idx],
      icon: icons[idx],
      humidity,
      precipitation: Math.round(Math.random() * 5),
      wind: Math.round(5 + Math.random() * 20),
    },
    forecast,
    lastUpdate: Date.now(),
  };
}

function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = () => {
    // In production, replace with real weather API call
    setWeather(generateWeatherData());
    setLoading(false);
  };

  useEffect(() => { fetchWeather(); }, []);
  useInterval(fetchWeather, WEATHER_REFRESH);

  return { weather, loading, refresh: fetchWeather };
}

export default useWeather;
