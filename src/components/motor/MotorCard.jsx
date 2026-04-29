import React from 'react';
import { FaGears } from 'react-icons/fa6';
import { useSensor } from '../../context/SensorContext';
import useMotorControl from '../../hooks/useMotorControl';
import styles from './MotorCard.module.css';

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

function getMotorVariant(status) {
  if (!status) return 'unknown';
  const s = status.toUpperCase();
  if (s === 'ON') return 'on';
  if (s.includes('OVERFLOW') || s.includes('FORCED')) return 'overflow';
  if (s === 'OFF') return 'off';
  return 'unknown';
}

function MotorCard({ loading = false, staggerIdx = 4 }) {
  const { state } = useSensor();
  const { runDuration, runPercent, isRunning } = useMotorControl();

  const motorStatus = state.data?.motor_status;
  const sensorConnected = state.data?.sensor_connected;
  const serverOffline = state.serverStatus === 'offline';

  if (loading) {
    return (
      <div className={`${styles.card} stagger-${staggerIdx}`} aria-busy="true">
        <div className="flex gap-4">
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: '50%' }} />
            <div className="skeleton skeleton-value" />
            <div className="skeleton skeleton-text" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  let displayStatus = '--';
  let subText = 'Motor not connected';
  let variant = 'unknown';

  if (serverOffline) {
    subText = 'Server not connected';
  } else if (sensorConnected === false) {
    subText = 'Motor not connected';
  } else if (motorStatus) {
    displayStatus = motorStatus;
    variant = getMotorVariant(motorStatus);
    if (variant === 'on')       subText = 'Irrigation in progress';
    else if (variant === 'overflow') subText = 'Safety cutoff activated';
    else                        subText = 'Standby mode';
  }

  const timerClass = runPercent < 70 ? 'safe' : runPercent < 90 ? 'caution' : 'danger';
  const maxMin = Math.floor(300000 / 60000); // default 5 min display

  return (
    <div
      className={`${styles.card} stagger-${staggerIdx} fade-in`}
      role="region"
      aria-label="Motor Status"
    >
      <div className={styles.top}>
        <div className={`${styles.iconWrapper} ${styles[variant]}`} aria-hidden="true">
          <FaGears />
        </div>
        <div className={styles.info}>
          <div className={styles.title}>Motor Status</div>
          <div className={`${styles.value} ${styles[variant]}`} aria-label={`Motor: ${displayStatus}`}>
            {displayStatus}
          </div>
          <div className={`${styles.subText} ${styles[variant]}`}>{subText}</div>
        </div>
      </div>

      {/* Run Timer — only shown when motor is ON */}
      {isRunning && (
        <div className={styles.timerSection}>
          <div className={styles.timerHeader}>
            <span>Running: {formatDuration(runDuration)}</span>
            <span>Max: {maxMin}m</span>
          </div>
          <div className={styles.timerBar} role="progressbar" aria-valuenow={Math.round(runPercent)} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={`${styles.timerFill} ${styles[timerClass]}`}
              style={{ width: `${runPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MotorCard;
