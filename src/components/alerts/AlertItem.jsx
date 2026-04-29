import React from 'react';
import {
  FaTriangleExclamation, FaCircleExclamation, FaCircleCheck, FaCircleInfo,
} from 'react-icons/fa6';
import styles from './Alerts.module.css';

const ICONS = {
  danger:  <FaTriangleExclamation />,
  warning: <FaCircleExclamation />,
  success: <FaCircleCheck />,
  info:    <FaCircleInfo />,
};

function AlertItem({ alert }) {
  const icon = ICONS[alert.color] || ICONS.info;
  const timeStr = new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour12: false });

  return (
    <li className={styles.item}>
      <span className={`${styles.itemIcon} ${styles[alert.color]}`} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.itemBody}>
        <div className={styles.itemMessage}>{alert.message}</div>
        <div className={styles.itemTime}>{timeStr}</div>
      </div>
    </li>
  );
}

export default AlertItem;
