/**
 * DataOrchestrator — renders nothing, just runs global hooks.
 * Placed inside all providers so it has access to all contexts.
 */
import useSensorData from './hooks/useSensorData';
import useAlerts from './hooks/useAlerts';

function DataOrchestrator() {
  useSensorData();  // polls /sensor-data, updates SensorContext
  useAlerts();      // checks thresholds, dispatches alerts
  return null;
}

export default DataOrchestrator;
