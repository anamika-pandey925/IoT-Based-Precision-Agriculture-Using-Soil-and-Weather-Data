import React from 'react';
import { FaTemperatureHalf, FaDroplet, FaSeedling } from 'react-icons/fa6';
import { useSensor } from '../context/SensorContext';
import { useSettings } from '../context/SettingsContext';
import StatusBanner from '../components/common/StatusBanner';
import SensorCard from '../components/common/SensorCard';
import MotorCard from '../components/motor/MotorCard';
import EnvironmentChart from '../components/charts/EnvironmentChart';
import SoilMoistureChart from '../components/charts/SoilMoistureChart';
import AlertsPanel from '../components/alerts/AlertsPanel';
import ChatWidget from '../components/ai/ChatWidget';
import styles from './DashboardPage.module.css';

function getTrend(history, key) {
  if (history.length < 3) return null;
  const recent = history.slice(0, 3).map(d => d[key]).filter(v => v !== undefined);
  if (recent.length < 2) return null;
  const diff = recent[0] - recent[1];
  if (Math.abs(diff) < 0.5) return 'neutral';
  return diff > 0 ? 'up' : 'down';
}

function DashboardPage() {
  const { state } = useSensor();
  const { settings } = useSettings();
  const { data, loading, serverStatus, history } = state;

  const isLoading = loading && !data;
  const isOffline = serverStatus === 'offline';
  const noSensor  = !isOffline && data && !data.sensor_connected;

  const val = (key, decimals = 1) => {
    if (isOffline || noSensor || !data) return null;
    const v = data[key];
    return v !== undefined ? parseFloat(v.toFixed(decimals)) : null;
  };

  const getSubText = (key) => {
    if (isOffline) return 'Server not connected';
    if (noSensor)  return 'Sensor not connected';
    if (!data)     return 'Waiting for data...';
    const v = data[key];
    if (key === 'temperature') return v > settings.tempThreshold ? '⚠ High temperature' : v < 10 ? 'Low temperature' : 'Normal range';
    if (key === 'humidity')    return v > 80 ? 'High humidity' : v < 30 ? 'Low humidity' : 'Normal range';
    if (key === 'moisture')    return v >= settings.overflowThreshold ? '⚠ Overflow risk' : v < settings.moistureThreshold ? 'Dry — needs water' : 'Optimal moisture';
    return '';
  };

  const getSubVariant = (key) => {
    if (isOffline || noSensor) return 'error';
    if (!data) return '';
    const v = data[key];
    if (key === 'temperature') return v > settings.tempThreshold ? 'warning' : 'success';
    if (key === 'moisture')    return v >= settings.overflowThreshold ? 'error' : v < settings.moistureThreshold ? 'warning' : 'success';
    return 'success';
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{greeting} 👋</h1>
          <p className={styles.pageSubtitle}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={`badge ${isOffline ? 'badge-danger' : 'badge-success'}`}>
            {isOffline ? '● Offline' : '● Live'}
          </span>
        </div>
      </div>

      <StatusBanner />

      {/* Sensor Cards */}
      <section className={styles.sensorGrid} aria-label="Sensor Data Cards">
        <SensorCard
          title="Temperature"
          value={val('temperature')}
          unit="°C"
          icon={<FaTemperatureHalf />}
          colorClass="temp"
          subText={getSubText('temperature')}
          subVariant={getSubVariant('temperature')}
          loading={isLoading}
          staggerIdx={1}
          trend={getTrend(history, 'temperature')}
        />
        <SensorCard
          title="Humidity"
          value={val('humidity')}
          unit="%"
          icon={<FaDroplet />}
          colorClass="hum"
          subText={getSubText('humidity')}
          subVariant={getSubVariant('humidity')}
          loading={isLoading}
          staggerIdx={2}
          trend={getTrend(history, 'humidity')}
        />
        <SensorCard
          title="Soil Moisture"
          value={val('moisture')}
          unit="%"
          icon={<FaSeedling />}
          colorClass="soil"
          subText={getSubText('moisture')}
          subVariant={getSubVariant('moisture')}
          loading={isLoading}
          staggerIdx={3}
          trend={getTrend(history, 'moisture')}
        />
        <MotorCard loading={isLoading} staggerIdx={4} />
      </section>

      {/* Charts */}
      <section className={styles.chartsGrid} aria-label="Data Charts">
        <EnvironmentChart />
        <SoilMoistureChart />
      </section>

      {/* Alerts + AI */}
      <section className={styles.middleRow} aria-label="Alerts and AI Assistant">
        <AlertsPanel />
        <ChatWidget />
      </section>
    </div>
  );
}

export default DashboardPage;
