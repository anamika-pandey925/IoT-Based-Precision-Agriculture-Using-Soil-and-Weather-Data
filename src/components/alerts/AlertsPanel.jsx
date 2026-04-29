import React from 'react';
import { FaBell, FaDownload, FaTrash } from 'react-icons/fa6';
import { useAlertContext } from '../../context/AlertContext';
import sensorService from '../../services/sensorService';
import AlertItem from './AlertItem';
import styles from './Alerts.module.css';

function AlertsPanel() {
  const { state, clearHistory } = useAlertContext();
  const { history } = state;

  return (
    <div className={styles.panel} role="region" aria-label="Alerts and Activity Log">
      <div className={styles.header}>
        <div className={styles.title}>
          <FaBell aria-hidden="true" />
          Alerts &amp; Activity
        </div>
        <div className={styles.actions}>
          <button
            className="btn btn-secondary"
            onClick={sensorService.exportCSV}
            aria-label="Export data as CSV"
            title="Export CSV"
            style={{ fontSize: 'var(--font-size-xs)', padding: '4px 10px' }}
          >
            <FaDownload aria-hidden="true" /> Export
          </button>
          {history.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={clearHistory}
              aria-label="Clear alert history"
              title="Clear history"
              style={{ fontSize: 'var(--font-size-xs)', padding: '4px 10px' }}
            >
              <FaTrash aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <ul className={styles.logList} aria-label="Activity log" aria-live="polite">
        {history.length === 0 ? (
          <li className={styles.empty}>No alerts yet. System monitoring active.</li>
        ) : (
          history.map((alert) => <AlertItem key={alert.id} alert={alert} />)
        )}
      </ul>
    </div>
  );
}

export default AlertsPanel;
