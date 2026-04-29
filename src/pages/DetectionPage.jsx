import React from 'react';
import { FaPaw, FaFire, FaChartBar, FaDownload, FaArrowsRotate } from 'react-icons/fa6';
import useAnimalDetection from '../hooks/useAnimalDetection';
import styles from './DetectionPage.module.css';

const ZONE_COLORS = ['#e9ecef', '#74c0fc', '#4dabf7', '#339af0', '#1c7ed6'];
const ZONE_LABELS = ['None', 'Low', 'Medium', 'High', 'Critical'];

const ZONES = [
  { id: 'north', name: 'North Field' },
  { id: 'south', name: 'South Field' },
  { id: 'east',  name: 'East Field' },
  { id: 'west',  name: 'West Field' },
];

function DetectionPage() {
  const { detectionHistory, statistics, exportHistory } = useAnimalDetection();

  // Calculate zone counts
  const zoneCounts = {};
  ZONES.forEach((z) => { zoneCounts[z.id] = 0; });
  detectionHistory.forEach((d) => { if (zoneCounts[d.zone] !== undefined) zoneCounts[d.zone]++; });

  const getIntensity = (count) => {
    if (count === 0) return 0;
    if (count <= 2)  return 1;
    if (count <= 5)  return 2;
    if (count <= 10) return 3;
    return 4;
  };

  return (
    <div>
      <h1 className="section-title"><FaPaw aria-hidden="true" /> Animal &amp; Bird Detection</h1>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total Detections', value: statistics.totalDetections },
          { label: 'Last 24 Hours',    value: statistics.last24Hours },
          { label: 'Last Week',        value: statistics.lastWeek },
          { label: 'Most Active Zone', value: statistics.mostActiveZone },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaFire aria-hidden="true" /> Detection Heatmap by Zone</h2>
        <div className={styles.heatmapGrid}>
          {ZONES.map((zone) => {
            const count = zoneCounts[zone.id];
            const intensity = getIntensity(count);
            return (
              <div
                key={zone.id}
                className={styles.heatmapZone}
                style={{ background: ZONE_COLORS[intensity] }}
              >
                <div className={styles.zoneName}>{zone.name}</div>
                <div className={styles.zoneCount}>{count} detections</div>
                <div className={styles.zoneIntensity}>{ZONE_LABELS[intensity]}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pattern Analysis */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaChartBar aria-hidden="true" /> Detection Patterns</h2>
        <div className={styles.patternCard}>
          <div className={styles.patternLabel}>Most Common Threat</div>
          <div className={styles.patternValue}>{statistics.mostCommonThreat}</div>
        </div>
      </section>

      {/* Recent History */}
      {detectionHistory.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Detections</h2>
          <div className={styles.historyList}>
            {detectionHistory.slice(0, 10).map((d) => (
              <div key={d.id} className={styles.historyItem}>
                <span className={styles.historyThreat}>{d.threat}</span>
                <span className={styles.historyZone}>{d.zoneName}</span>
                <span className={`${styles.historySeverity} ${styles[d.severity]}`}>{d.severity}</span>
                <span className={styles.historyTime}>{new Date(d.timestamp).toLocaleTimeString('en-IN', { hour12: false })}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={exportHistory}>
          <FaDownload aria-hidden="true" /> Export History
        </button>
        <button className="btn btn-secondary" onClick={() => window.location.reload()}>
          <FaArrowsRotate aria-hidden="true" /> Refresh Stats
        </button>
      </div>
    </div>
  );
}

export default DetectionPage;
