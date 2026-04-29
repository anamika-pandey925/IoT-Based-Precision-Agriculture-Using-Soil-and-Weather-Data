import React from 'react';
import { FaChartLine, FaGauge, FaBrain, FaFileLines, FaDownload } from 'react-icons/fa6';
import { useSensor } from '../context/SensorContext';
import EnvironmentChart from '../components/charts/EnvironmentChart';
import SoilMoistureChart from '../components/charts/SoilMoistureChart';
import { MoistureDistChart, MotorUsageChart, AlertFrequencyChart } from '../components/charts/AnalyticsCharts';
import styles from './AnalyticsPage.module.css';

function AnalyticsPage() {
  const { state } = useSensor();
  const history = state.history;

  const avg = (key) => history.length
    ? (history.reduce((s, d) => s + (d[key] || 0), 0) / history.length).toFixed(1)
    : '--';

  const metrics = [
    { label: 'Avg Temperature', value: avg('temperature') !== '--' ? `${avg('temperature')}°C` : '--', sub: 'Last 20 readings' },
    { label: 'Avg Humidity',    value: avg('humidity')    !== '--' ? `${avg('humidity')}%`    : '--', sub: 'Last 20 readings' },
    { label: 'Avg Moisture',    value: avg('moisture')    !== '--' ? `${avg('moisture')}%`    : '--', sub: 'Last 20 readings' },
    { label: 'Data Points',     value: history.length,                                                sub: 'In memory' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <FaChartLine style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          Analytics
        </h1>
        <p className="page-subtitle">Historical trends, predictions, and reports</p>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        {metrics.map((m, i) => (
          <div key={i} className={`${styles.metricCard} stagger-${i + 1}`}>
            <div className={styles.metricLabel}>{m.label}</div>
            <div className={styles.metricValue}>{m.value}</div>
            <div className={styles.metricSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Live Charts */}
      <div className={styles.chartsGrid}>
        <EnvironmentChart />
        <SoilMoistureChart />
        <MoistureDistChart />
        <MotorUsageChart />
        <AlertFrequencyChart />
      </div>

      {/* Predictions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaBrain aria-hidden="true" /> Predictive Analytics</h2>
        <div className={styles.predGrid}>
          {[
            { label: 'Next 24h Temperature', value: '28°C',        conf: 92 },
            { label: 'Irrigation Need (7d)', value: 'High Need',   conf: 85 },
            { label: 'Crop Yield Estimate',  value: '2.5 t/ac',    conf: 78 },
            { label: 'Disease Risk',         value: 'Low Risk',    conf: 88 },
          ].map((p, i) => (
            <div key={i} className={`${styles.predCard} stagger-${i + 1}`}>
              <div className={styles.predLabel}>{p.label}</div>
              <div className={styles.predValue}>{p.value}</div>
              <div className={styles.predConf}>Confidence: {p.conf}%</div>
            </div>
          ))}
        </div>
      </section>

      {/* Reports */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaFileLines aria-hidden="true" /> Reports &amp; Export</h2>
        <div className={styles.reportActions}>
          {['Daily', 'Weekly', 'Monthly'].map(type => (
            <button key={type} className="btn btn-primary" onClick={() => alert(`${type} report generated!`)}>
              {type} Report
            </button>
          ))}
          <button className="btn btn-secondary" onClick={() => alert('Exporting CSV...')}>
            <FaDownload aria-hidden="true" /> Export CSV
          </button>
        </div>
      </section>
    </div>
  );
}

export default AnalyticsPage;
