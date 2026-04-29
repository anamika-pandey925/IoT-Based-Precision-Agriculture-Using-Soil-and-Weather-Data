import React from 'react';
import { FaSeedling, FaTriangleExclamation, FaCircleCheck } from 'react-icons/fa6';
import { useSensor } from '../../context/SensorContext';
import { useSettings } from '../../context/SettingsContext';
import styles from './StatusBanner.module.css';

function getFieldStatus(data, settings) {
  if (!data || !data.sensor_connected) return { text: 'Sensor not connected', variant: 'error' };
  const { moisture, temperature } = data;
  if (moisture >= settings.overflowThreshold) return { text: 'Water Overflow Detected!', variant: 'danger' };
  if (moisture < settings.moistureThreshold)  return { text: 'Soil Dry — Irrigation Needed', variant: 'warning' };
  if (temperature > settings.tempThreshold)   return { text: 'High Temperature Alert', variant: 'warning' };
  return { text: 'Field Conditions Normal', variant: 'success' };
}

function StatusBanner() {
  const { state } = useSensor();
  const { settings } = useSettings();

  const isOffline = state.serverStatus === 'offline';
  const status = isOffline
    ? { text: 'Server not connected', variant: 'error' }
    : getFieldStatus(state.data, settings);

  const lastUpdate = state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleTimeString('en-IN', { hour12: false })
    : '--:--:--';

  const Icon = status.variant === 'success' ? FaCircleCheck : FaTriangleExclamation;

  return (
    <div className={`${styles.banner} ${styles[status.variant]}`} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        {status.variant === 'success' ? <FaSeedling /> : <Icon />}
      </span>
      <div className={styles.text}>
        <span className={styles.label}>Field Status</span>
        <span className={styles.statusText}>{status.text}</span>
      </div>
      <div className={styles.right}>
        <span className={styles.updateLabel}>Last Update:</span>
        <span className={styles.updateTime}>{lastUpdate}</span>
      </div>
    </div>
  );
}

export default StatusBanner;
