import React, { useEffect, useState } from 'react';
import {
  FaTriangleExclamation, FaCircleExclamation, FaCircleCheck,
  FaCircleInfo, FaPaw, FaDroplet, FaWater, FaThermometer,
  FaPlugCircleXmark, FaPowerOff, FaXmark,
} from 'react-icons/fa6';
import { useAlertContext } from '../../context/AlertContext';
import styles from './AlertToast.module.css';

const ICON_MAP = {
  danger:  <FaTriangleExclamation />,
  warning: <FaCircleExclamation />,
  success: <FaCircleCheck />,
  info:    <FaCircleInfo />,
  paw:     <FaPaw />,
  droplet: <FaDroplet />,
  water:   <FaWater />,
  thermometer: <FaThermometer />,
  'plug-circle-xmark': <FaPlugCircleXmark />,
  'power-off': <FaPowerOff />,
};

function Toast({ toast }) {
  const { dismissToast } = useAlertContext();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => dismissToast(toast.id), 300);
    }, 5000);
    return () => clearTimeout(dismissTimer);
  }, [toast.id, dismissToast]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => dismissToast(toast.id), 300);
  };

  const icon = ICON_MAP[toast.icon] || ICON_MAP[toast.color] || <FaCircleInfo />;
  const timeStr = new Date(toast.timestamp).toLocaleTimeString('en-IN', { hour12: false });

  return (
    <div
      className={`${styles.toast} ${styles[toast.color]}${exiting ? ' ' + styles.exiting : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <div className={styles.body}>
        <div className={styles.message}>{toast.message}</div>
        <div className={styles.time}>{timeStr}</div>
      </div>
      <button className={styles.closeBtn} onClick={handleClose} aria-label="Dismiss alert">
        <FaXmark aria-hidden="true" />
      </button>
    </div>
  );
}

function AlertToastContainer() {
  const { state } = useAlertContext();

  return (
    <div className={styles.container} aria-label="Alert notifications">
      {state.toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

export default AlertToastContainer;
