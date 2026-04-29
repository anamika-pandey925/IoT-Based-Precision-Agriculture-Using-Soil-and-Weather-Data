import { useState, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAlertContext } from '../context/AlertContext';
import detectionService from '../services/detectionService';
import buzzerService from '../services/buzzerService';
import useInterval from './useInterval';

const ZONES = {
  north: 'North Field',
  south: 'South Field',
  east:  'East Field',
  west:  'West Field',
};

function randomZone() {
  const keys = Object.keys(ZONES);
  return keys[Math.floor(Math.random() * keys.length)];
}

/**
 * Polls /api/detect every 15 seconds when animal detection is enabled.
 * Returns detection state for the DetectionPage.
 */
function useAnimalDetection() {
  const { settings } = useSettings();
  const { triggerAlert } = useAlertContext();

  const [detectionHistory, setDetectionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_detection_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [statistics, setStatistics] = useState({
    totalDetections: 0,
    last24Hours: 0,
    lastWeek: 0,
    mostActiveZone: '--',
    mostCommonThreat: 'No data yet',
  });

  const checkDetection = useCallback(async () => {
    if (!settings.animalDetection) return;
    try {
      const data = await detectionService.check();
      if (!data?.detected) return;

      const zoneId = data.zone || randomZone();
      const threat = data.threat || 'Unknown Animal';
      const detection = {
        id: `det_${Date.now()}`,
        threat,
        zone: zoneId,
        zoneName: ZONES[zoneId] || zoneId,
        timestamp: Date.now(),
        severity: data.severity || 'moderate',
      };

      setDetectionHistory((prev) => {
        const next = [detection, ...prev].slice(0, 200);
        localStorage.setItem('agrisense_detection_history', JSON.stringify(next));

        // Recalculate statistics
        const now = Date.now();
        const oneDay = 86400000;
        const oneWeek = 7 * oneDay;
        const last24 = next.filter((d) => now - d.timestamp < oneDay).length;
        const lastWk  = next.filter((d) => now - d.timestamp < oneWeek).length;

        const zoneCounts = {};
        const threatCounts = {};
        next.forEach((d) => {
          zoneCounts[d.zoneName]  = (zoneCounts[d.zoneName]  || 0) + 1;
          threatCounts[d.threat]  = (threatCounts[d.threat]  || 0) + 1;
        });
        const topZone   = Object.keys(zoneCounts).sort((a, b) => zoneCounts[b] - zoneCounts[a])[0] || '--';
        const topThreat = Object.keys(threatCounts).sort((a, b) => threatCounts[b] - threatCounts[a])[0] || 'No data yet';

        setStatistics({ totalDetections: next.length, last24Hours: last24, lastWeek: lastWk, mostActiveZone: topZone, mostCommonThreat: topThreat });
        return next;
      });

      triggerAlert('ANIMAL_DETECTED', `${threat} detected in ${ZONES[zoneId] || zoneId}!`, { threat, zone: zoneId });
      if (settings.buzzerAlerts) buzzerService.trigger('ANIMAL_DETECTED', { zone: zoneId, threat });
    } catch {
      // Detection failure is non-critical
    }
  }, [settings.animalDetection, settings.buzzerAlerts, triggerAlert]);

  useInterval(checkDetection, settings.animalDetection ? 15000 : null);

  const exportHistory = () => {
    const csv = ['Timestamp,Threat,Zone,Severity', ...detectionHistory.map((d) =>
      `${new Date(d.timestamp).toISOString()},${d.threat},${d.zoneName},${d.severity}`
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detection_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { detectionHistory, statistics, exportHistory };
}

export default useAnimalDetection;
