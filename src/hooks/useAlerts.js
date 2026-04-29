import { useEffect, useRef } from 'react';
import { useSensor } from '../context/SensorContext';
import { useSettings } from '../context/SettingsContext';
import { useAlertContext } from '../context/AlertContext';
import buzzerService from '../services/buzzerService';

/**
 * Alert engine — runs on every sensor update and dispatches alerts
 * based on configured thresholds.
 */
function useAlerts() {
  const { state: sensorState } = useSensor();
  const { settings } = useSettings();
  const { triggerAlert } = useAlertContext();
  const prevConnectedRef = useRef(true);

  useEffect(() => {
    const data = sensorState.data;
    if (!data) return;

    // Server came back online after being down
    if (sensorState.serverStatus === 'offline') return;

    // Sensor disconnected
    if (!data.sensor_connected) {
      if (prevConnectedRef.current) {
        triggerAlert('SENSOR_DISCONNECTED', 'Sensor not connected. Check hardware.');
      }
      prevConnectedRef.current = false;
      return;
    }
    prevConnectedRef.current = true;

    const { temperature, moisture } = data;

    // Dry soil alert
    if (moisture !== undefined && moisture < settings.moistureThreshold) {
      triggerAlert('DRY_SOIL', `Soil moisture low: ${moisture.toFixed(1)}%. Irrigation may be needed.`);
      if (settings.buzzerAlerts) buzzerService.trigger('DRY_SOIL');
    }

    // Water overflow alert
    if (moisture !== undefined && moisture >= settings.overflowThreshold) {
      triggerAlert('WATER_OVERFLOW', `Water overflow detected! Moisture: ${moisture.toFixed(1)}%. Motor force-stopped.`);
      if (settings.buzzerAlerts) buzzerService.trigger('WATER_OVERFLOW');
    }

    // High temperature alert
    if (temperature !== undefined && temperature > settings.tempThreshold) {
      triggerAlert('HIGH_TEMPERATURE', `High temperature: ${temperature.toFixed(1)}°C. Check crop conditions.`);
    }
  }, [sensorState.data, sensorState.serverStatus, settings, triggerAlert]);
}

export default useAlerts;
