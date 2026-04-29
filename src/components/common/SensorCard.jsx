import React, { useEffect, useRef, useState } from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa6';
import styles from './SensorCard.module.css';

/**
 * Premium sensor card with gradient accents and trend indicator.
 * Props:
 *   title, value, unit, icon, colorClass, subText, subVariant, loading, staggerIdx, trend
 */
function SensorCard({
  title,
  value,
  unit = '',
  icon,
  colorClass = 'soil',
  subText = '',
  subVariant = '',
  loading = false,
  staggerIdx = 1,
  trend = null, // 'up' | 'down' | 'neutral'
}) {
  const prevValueRef = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!loading && value !== prevValueRef.current && prevValueRef.current !== undefined) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      prevValueRef.current = value;
      return () => clearTimeout(t);
    }
    prevValueRef.current = value;
  }, [value, loading]);

  if (loading) {
    return (
      <div className={`${styles.skeleton} stagger-${staggerIdx}`} aria-busy="true" aria-label={`Loading ${title}`}>
        <div className={styles.skeletonTop}>
          <div className={`${styles.skeletonIcon} skeleton`} />
          <div className={`${styles.skeletonBadge} skeleton`} />
        </div>
        <div className={`${styles.skeletonTitle} skeleton`} />
        <div className={`${styles.skeletonValue} skeleton`} />
        <div className={`${styles.skeletonSub} skeleton`} />
      </div>
    );
  }

  const TrendIcon = trend === 'up' ? FaArrowUp : trend === 'down' ? FaArrowDown : FaMinus;

  return (
    <div
      className={`${styles.card} ${styles[colorClass]} stagger-${staggerIdx} fade-in`}
      role="region"
      aria-label={title}
    >
      <div className={styles.topRow}>
        <div className={`${styles.iconWrapper} ${styles[colorClass]}`} aria-hidden="true">
          {icon}
        </div>
        {trend && (
          <div className={`${styles.trendBadge} ${styles[trend]}`} aria-label={`Trend: ${trend}`}>
            <TrendIcon aria-hidden="true" />
            {trend}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div
          className={`${styles.value}${flash ? ' ' + styles.flash : ''}`}
          aria-label={`${title}: ${value}${unit}`}
        >
          {value !== null && value !== undefined ? `${value}${unit}` : '--'}
        </div>
      </div>

      {subText && (
        <div className={styles.subRow}>
          <span className={`${styles.subDot} ${styles[subVariant || 'default']}`} aria-hidden="true" />
          <span className={`${styles.subText} ${styles[subVariant]}`}>{subText}</span>
        </div>
      )}
    </div>
  );
}

export default SensorCard;
