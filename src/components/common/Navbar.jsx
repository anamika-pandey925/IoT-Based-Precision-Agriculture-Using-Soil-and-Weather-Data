import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaSeedling, FaGauge, FaChartLine, FaRobot, FaMap,
  FaCloudSun, FaPaw, FaIndianRupeeSign, FaWater,
  FaSun, FaMoon, FaBars, FaXmark, FaCamera, FaSliders,
} from 'react-icons/fa6';
import { useTheme } from '../../context/ThemeContext';
import { useSensor } from '../../context/SensorContext';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { to: '/',          icon: <FaGauge />,           label: 'Dashboard' },
  { to: '/analytics', icon: <FaChartLine />,        label: 'Analytics' },
  { to: '/ai',        icon: <FaRobot />,            label: 'AI' },
  { to: '/weather',   icon: <FaCloudSun />,         label: 'Weather' },
  { to: '/detection', icon: <FaPaw />,              label: 'Detection' },
  { to: '/market',    icon: <FaIndianRupeeSign />,  label: 'Market' },
  { to: '/map',       icon: <FaMap />,              label: 'Map' },
  { to: '/overflow',  icon: <FaWater />,            label: 'Overflow' },
];

function Navbar({ onScanClick }) {
  const { isDark, toggleTheme } = useTheme();
  const { state: sensorState } = useSensor();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const isOnline = sensorState.serverStatus === 'online';
  const isOffline = sensorState.serverStatus === 'offline';
  const statusClass = isOnline ? 'online' : isOffline ? 'offline' : 'warning';
  const statusText = isOnline ? 'Online' : isOffline ? 'Offline' : 'Connecting';

  return (
    <>
      <nav className={styles.navbar} role="navigation" aria-label="Main Navigation">
        {/* Brand */}
        <NavLink to="/" className={styles.brand} aria-label="AgriSense Home">
          <div className={styles.brandIcon} aria-hidden="true">
            <FaSeedling />
          </div>
          <div>
            <div className={styles.brandName}>AgriSense</div>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <ul className={styles.navLinks} role="list">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink}${isActive ? ' ' + styles.active : ''}`
                }
              >
                {icon} {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Controls */}
        <div className={styles.navRight}>
          {/* Status Pill */}
          <div className={styles.systemStatus} aria-live="polite">
            <span className={`status-dot ${statusClass}`} aria-hidden="true" />
            <span className={styles.statusText}>{statusText}</span>
            <span className={styles.clock} aria-label="Current time">{clock}</span>
          </div>

          <div className={styles.navDivider} aria-hidden="true" />

          {/* Theme */}
          <button className="btn-icon" onClick={toggleTheme} aria-label={isDark ? 'Light mode' : 'Dark mode'} title="Toggle theme">
            {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
          </button>

          {/* Scanner */}
          <button className="btn-icon" onClick={onScanClick} aria-label="Plant Scanner" title="AI Plant Scanner">
            <FaCamera aria-hidden="true" />
          </button>

          {/* Settings */}
          <button className="btn-icon" onClick={() => navigate('/settings')} aria-label="Settings" title="Settings">
            <FaSliders aria-hidden="true" />
          </button>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setDrawerOpen(o => !o)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`${styles.drawer}${drawerOpen ? ' ' + styles.open : ''}`} aria-hidden={!drawerOpen}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.drawerLink}${isActive ? ' ' + styles.active : ''}`
            }
            onClick={() => setDrawerOpen(false)}
          >
            {icon} {label}
          </NavLink>
        ))}
      </div>
    </>
  );
}

export default Navbar;
