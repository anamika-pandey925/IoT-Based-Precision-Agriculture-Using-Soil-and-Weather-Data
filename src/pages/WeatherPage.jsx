import React from 'react';
import {
  FaCloudSun, FaCalendarDays, FaLightbulb, FaWheatAwn,
  FaDroplet, FaWind, FaSync,
} from 'react-icons/fa6';
import useWeather from '../hooks/useWeather';
import LoadingSpinner from '../components/common/LoadingSpinner';
import styles from './WeatherPage.module.css';

const WEATHER_ICONS = {
  sun: '☀️', 'cloud-sun': '⛅', cloud: '☁️', 'cloud-rain': '🌧️', moon: '🌙',
};

function WeatherPage() {
  const { weather, loading, refresh } = useWeather();

  if (loading) return <LoadingSpinner message="Loading weather data..." />;

  const { current, forecast } = weather;

  return (
    <div>
      <div className={styles.header}>
        <h1 className="section-title"><FaCloudSun aria-hidden="true" /> Weather &amp; Farming</h1>
        <button className="btn btn-secondary" onClick={refresh} aria-label="Refresh weather">
          <FaSync aria-hidden="true" /> Refresh
        </button>
      </div>

      {/* Current Weather */}
      <div className={styles.currentCard}>
        <div className={styles.currentMain}>
          <div className={styles.weatherEmoji}>{WEATHER_ICONS[current.icon] || '🌤️'}</div>
          <div>
            <div className={styles.currentTemp}>{current.temperature}°C</div>
            <div className={styles.currentCondition}>{current.condition}</div>
          </div>
        </div>
        <div className={styles.currentDetails}>
          <div className={styles.detailItem}>
            <FaDroplet aria-hidden="true" />
            <span>{current.humidity}%</span>
            <small>Humidity</small>
          </div>
          <div className={styles.detailItem}>
            <FaDroplet aria-hidden="true" />
            <span>{current.precipitation}mm</span>
            <small>Precipitation</small>
          </div>
          <div className={styles.detailItem}>
            <FaWind aria-hidden="true" />
            <span>{current.wind} km/h</span>
            <small>Wind</small>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaCalendarDays aria-hidden="true" /> 7-Day Forecast</h2>
        <div className={styles.forecastGrid}>
          {forecast.map((day, i) => (
            <div key={i} className={`${styles.forecastCard}${i === 0 ? ' ' + styles.today : ''}`}>
              <div className={styles.forecastDay}>{day.day}</div>
              <div className={styles.forecastDate}>{day.date}</div>
              <div className={styles.forecastEmoji}>{WEATHER_ICONS[day.icon] || '🌤️'}</div>
              <div className={styles.forecastTemps}>
                <span className={styles.high}>{day.high}°</span>
                <span className={styles.low}>{day.low}°</span>
              </div>
              <div className={styles.forecastHum}><FaDroplet aria-hidden="true" /> {day.humidity}%</div>
            </div>
          ))}
        </div>
      </section>

      {/* Farming Advice */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaLightbulb aria-hidden="true" /> Farming Advice</h2>
        <div className={styles.adviceGrid}>
          {[
            { title: 'Irrigation', advice: current.precipitation > 3 ? 'Rain expected — skip irrigation today.' : 'No rain expected — irrigate as scheduled.' },
            { title: 'Pesticide', advice: current.wind > 20 ? 'High winds — avoid spraying today.' : 'Good conditions for pesticide application.' },
            { title: 'Harvesting', advice: current.condition.includes('Rain') ? 'Delay harvest — wet conditions.' : 'Good conditions for harvesting.' },
            { title: 'Soil Work', advice: current.humidity > 80 ? 'High humidity — avoid tilling.' : 'Good conditions for soil preparation.' },
          ].map((item, i) => (
            <div key={i} className={styles.adviceCard}>
              <div className={styles.adviceTitle}>{item.title}</div>
              <div className={styles.adviceText}>{item.advice}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Crop Suggestions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaWheatAwn aria-hidden="true" /> Recommended Crops</h2>
        <div className={styles.cropGrid}>
          {['Rice', 'Wheat', 'Maize', 'Tomato', 'Onion', 'Potato'].map((crop, i) => (
            <div key={i} className={styles.cropCard}>
              <div className={styles.cropEmoji}>🌾</div>
              <div className={styles.cropName}>{crop}</div>
              <div className={styles.cropSuitability}>Suitable for current weather</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default WeatherPage;
