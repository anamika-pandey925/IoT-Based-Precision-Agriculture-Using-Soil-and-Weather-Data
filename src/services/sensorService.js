import api, { BASE_URL } from './api';

const sensorService = {
  /**
   * Fetch live sensor data from Flask backend.
   * Expected response shape:
   * {
   *   sensor_connected: boolean,
   *   temperature: number,
   *   humidity: number,
   *   moisture: number,
   *   motor_status: "ON" | "OFF" | "OVERFLOW" | "FORCED OFF",
   * }
   */
  getData: () => api.get('/sensor-data'),

  /**
   * Trigger CSV export — opens download in new tab.
   */
  exportCSV: () => {
    window.open(`${BASE_URL}/export_csv`, '_blank');
  },
};

export default sensorService;
