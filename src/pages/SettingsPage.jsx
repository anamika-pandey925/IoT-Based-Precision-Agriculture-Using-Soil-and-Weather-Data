import React, { useState } from 'react';
import {
  FaSliders, FaFloppyDisk, FaRotateLeft, FaGauge,
  FaBell, FaGears, FaDatabase, FaCircleCheck,
} from 'react-icons/fa6';
import { useSettings } from '../context/SettingsContext';
import styles from './SettingsPage.module.css';

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingInfo}>
        <div className={styles.settingLabel}>{label}</div>
        {description && <div className={styles.settingDesc}>{description}</div>}
      </div>
      <label className="toggle-switch" aria-label={label}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function NumberRow({ label, description, value, min, max, step = 1, onChange, suffix = '' }) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingInfo}>
        <div className={styles.settingLabel}>{label}</div>
        {description && <div className={styles.settingDesc}>{description}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <input
          type="number"
          className={`form-input ${styles.numInput}`}
          value={value}
          min={min} max={max} step={step}
          onChange={e => onChange(+e.target.value)}
        />
        {suffix && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: 'thresholds', label: 'Thresholds',  icon: <FaGauge />,    iconClass: 'green' },
  { id: 'data',       label: 'Data',         icon: <FaDatabase />, iconClass: 'blue' },
  { id: 'motor',      label: 'Motor',        icon: <FaGears />,    iconClass: 'purple' },
  { id: 'alerts',     label: 'Alerts',       icon: <FaBell />,     iconClass: 'orange' },
];

function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [local, setLocal] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('thresholds');

  const set = (key, val) => setLocal(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    updateSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetSettings();
      setLocal({ ...settings });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <FaSliders style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          Settings
        </h1>
        <p className="page-subtitle">Configure thresholds, alerts, and system behaviour</p>
      </div>

      <div className={styles.layout}>
        {/* Side Nav */}
        <nav className={styles.sideNav} aria-label="Settings sections">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`${styles.sideNavItem}${activeSection === s.id ? ' ' + styles.active : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </nav>

        {/* Settings Card */}
        <div className={styles.settingsCard}>

          {/* Thresholds */}
          {activeSection === 'thresholds' && (
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <div className={`${styles.groupIconBox} ${styles.green}`}><FaGauge /></div>
                <div>
                  <div className={styles.groupTitle}>Sensor Thresholds</div>
                  <div className={styles.groupDesc}>Define alert and automation trigger points</div>
                </div>
              </div>
              <NumberRow label="Moisture Threshold" description="Motor activates when moisture falls below this" value={local.moistureThreshold} min={0} max={100} onChange={v => set('moistureThreshold', v)} suffix="%" />
              <NumberRow label="Temperature Alert" description="Alert fires when temperature exceeds this" value={local.tempThreshold} min={0} max={60} onChange={v => set('tempThreshold', v)} suffix="°C" />
              <NumberRow label="Overflow Threshold" description="Overflow alert fires when moisture exceeds this" value={local.overflowThreshold} min={50} max={100} onChange={v => set('overflowThreshold', v)} suffix="%" />
            </div>
          )}

          {/* Data */}
          {activeSection === 'data' && (
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <div className={`${styles.groupIconBox} ${styles.blue}`}><FaDatabase /></div>
                <div>
                  <div className={styles.groupTitle}>Data &amp; Refresh</div>
                  <div className={styles.groupDesc}>Control how often sensor data is fetched</div>
                </div>
              </div>
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>Data Refresh Rate</div>
                  <div className={styles.settingDesc}>How often sensor data is fetched from the backend</div>
                </div>
                <select className={`form-input ${styles.numInput}`} value={local.refreshRate} onChange={e => set('refreshRate', +e.target.value)}>
                  <option value={2000}>2s — Real-time</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={60000}>1 min</option>
                </select>
              </div>
              <ToggleRow label="Auto-Irrigation Mode" description="Automatically control motor based on soil moisture" checked={local.autoIrrigation} onChange={v => set('autoIrrigation', v)} />
            </div>
          )}

          {/* Motor */}
          {activeSection === 'motor' && (
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <div className={`${styles.groupIconBox} ${styles.purple}`}><FaGears /></div>
                <div>
                  <div className={styles.groupTitle}>Motor Control</div>
                  <div className={styles.groupDesc}>Safety limits and automation settings</div>
                </div>
              </div>
              <NumberRow label="Max Continuous Run Time" description="Motor auto-off after this duration to prevent overwatering" value={local.motorMaxRunTime / 60000} min={1} max={30} onChange={v => set('motorMaxRunTime', v * 60000)} suffix="min" />
            </div>
          )}

          {/* Alerts */}
          {activeSection === 'alerts' && (
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <div className={`${styles.groupIconBox} ${styles.orange}`}><FaBell /></div>
                <div>
                  <div className={styles.groupTitle}>Alert Settings</div>
                  <div className={styles.groupDesc}>Configure notification channels</div>
                </div>
              </div>
              <ToggleRow label="Voice Alerts" description="Speak alerts aloud using text-to-speech" checked={local.voiceAlerts} onChange={v => set('voiceAlerts', v)} />
              <ToggleRow label="Buzzer Alerts (Arduino)" description="Trigger physical buzzer via backend" checked={local.buzzerAlerts} onChange={v => set('buzzerAlerts', v)} />
              <ToggleRow label="Animal Detection" description="Poll detection endpoint every 15 seconds" checked={local.animalDetection} onChange={v => set('animalDetection', v)} />
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={handleSave}>
              <FaFloppyDisk aria-hidden="true" /> Save Changes
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              <FaRotateLeft aria-hidden="true" /> Reset Defaults
            </button>
            {saved && (
              <div className={styles.savedMsg}>
                <FaCircleCheck aria-hidden="true" /> Settings saved!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
