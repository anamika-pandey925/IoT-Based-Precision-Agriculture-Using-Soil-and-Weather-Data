import React from 'react';
import styles from './MotorCard.module.css';

function MotorRunTimer({ runDuration, runPercent, maxRunTime }) {
  const totalSec = Math.floor(runDuration / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const maxMin = Math.floor(maxRunTime / 60000);
  const timerClass = runPercent < 70 ? 'safe' : runPercent < 90 ? 'caution' : 'danger';

  return (
    <div className={styles.timerSection}>
      <div className={styles.timerHeader}>
        <span>Running: {m}m {s}s</span>
        <span>Max: {maxMin}m</span>
      </div>
      <div className={styles.timerBar} role="progressbar" aria-valuenow={Math.round(runPercent)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`${styles.timerFill} ${styles[timerClass]}`}
          style={{ width: `${runPercent}%` }}
        />
      </div>
    </div>
  );
}

export default MotorRunTimer;
