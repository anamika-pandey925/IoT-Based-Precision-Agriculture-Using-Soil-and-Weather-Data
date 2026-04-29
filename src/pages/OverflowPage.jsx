import React from 'react';
import { FaWater, FaListCheck, FaArrowsDownToLine, FaTriangleExclamation, FaCircleCheck } from 'react-icons/fa6';
import { useSensor } from '../context/SensorContext';
import styles from './OverflowPage.module.css';

function getOverflowLevel(moisture) {
  if (!moisture) return { level: 'NONE', color: 'var(--color-success)', icon: <FaCircleCheck /> };
  if (moisture >= 90) return { level: 'CRITICAL', color: 'var(--color-danger)', icon: <FaTriangleExclamation /> };
  if (moisture >= 80) return { level: 'HIGH',     color: 'var(--color-warning)', icon: <FaTriangleExclamation /> };
  if (moisture >= 70) return { level: 'MODERATE', color: '#ffa94d', icon: <FaWater /> };
  return { level: 'NONE', color: 'var(--color-success)', icon: <FaCircleCheck /> };
}

function OverflowPage() {
  const { state } = useSensor();
  const moisture = state.data?.moisture;
  const { level, color, icon } = getOverflowLevel(moisture);

  const recoverySteps = level !== 'NONE' ? [
    { step: 1, action: 'Stop all irrigation immediately', priority: 'critical' },
    { step: 2, action: 'Open drainage channels',          priority: 'high' },
    { step: 3, action: 'Check motor force-off status',    priority: 'high' },
    { step: 4, action: 'Inspect crop root zones',         priority: 'medium' },
    { step: 5, action: 'Monitor moisture every 30 min',   priority: 'medium' },
  ] : [];

  return (
    <div>
      <h1 className="section-title"><FaWater aria-hidden="true" /> Water Overflow Recovery</h1>

      {/* Status */}
      <div className={styles.statusCard} style={{ borderColor: color }}>
        <div className={styles.statusIcon} style={{ color }}>{icon}</div>
        <div className={styles.statusInfo}>
          <div className={styles.statusLevel}>Overflow Level: <strong style={{ color }}>{level}</strong></div>
          <div className={styles.statusMoisture}>Water Level: {moisture !== undefined ? `${moisture?.toFixed(1)}%` : '--'}</div>
        </div>
        {level !== 'NONE' && (
          <div className={styles.statusBadge} style={{ background: color }}>ACTION REQUIRED</div>
        )}
      </div>

      {/* Recovery Plan */}
      {recoverySteps.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><FaListCheck aria-hidden="true" /> Recovery Action Plan</h2>
          <div className={styles.stepsList}>
            {recoverySteps.map((s) => (
              <div key={s.step} className={`${styles.stepItem} ${styles[s.priority]}`}>
                <div className={styles.stepNum}>{s.step}</div>
                <div className={styles.stepAction}>{s.action}</div>
                <div className={styles.stepPriority}>{s.priority}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Drainage Recommendations */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaArrowsDownToLine aria-hidden="true" /> Drainage Recommendations</h2>
        <div className={styles.drainageGrid}>
          {[
            { method: 'Surface Drainage', desc: 'Create channels to direct water away from crops.' },
            { method: 'Subsurface Drainage', desc: 'Install perforated pipes below soil surface.' },
            { method: 'Raised Beds', desc: 'Elevate planting areas to prevent waterlogging.' },
            { method: 'Cover Crops', desc: 'Plant water-absorbing cover crops in affected areas.' },
          ].map((d, i) => (
            <div key={i} className={styles.drainageCard}>
              <div className={styles.drainageMethod}>{d.method}</div>
              <div className={styles.drainageDesc}>{d.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Crop Damage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaTriangleExclamation aria-hidden="true" /> Crop Damage Risk</h2>
        <div className={styles.damageCard} style={{ borderLeftColor: color }}>
          <div className={styles.damageIcon} style={{ color }}>{icon}</div>
          <div>
            <div className={styles.damageRisk}>Risk Level: <strong style={{ color }}>{level === 'NONE' ? 'NONE' : level}</strong></div>
            <div className={styles.damageMsg}>
              {level === 'NONE'
                ? 'No significant crop damage expected.'
                : 'Waterlogging detected. Monitor crops closely for root rot and disease.'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OverflowPage;
