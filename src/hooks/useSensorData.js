import { useEffect } from 'react';
import { useSensor } from '../context/SensorContext';
import { useSettings } from '../context/SettingsContext';
import sensorService from '../services/sensorService';
import useInterval from './useInterval';

/**
 * Polls /sensor-data at the configured refresh rate.
 * Updates SensorContext on every successful response.
 */
function useSensorData() {
  const { dispatch } = useSensor();
  const { settings } = useSettings();

  const fetchData = async () => {
    try {
      const data = await sensorService.getData();
      dispatch({ type: 'UPDATE_SENSORS', payload: data });
    } catch (err) {
      if (err.code === 'SERVER_DOWN') {
        dispatch({ type: 'SERVER_DOWN' });
      } else {
        dispatch({ type: 'SENSOR_ERROR', payload: err.message });
      }
    }
  };

  // Fetch immediately on mount
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Then poll at configured rate
  useInterval(fetchData, settings.refreshRate);
}

export default useSensorData;
