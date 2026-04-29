import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Alert type configuration
export const ALERT_TYPES = {
  DRY_SOIL:            { id: 'dry_soil',            color: 'warning', icon: 'droplet',          priority: 2, cooldown: 10000,  buzzer: true,  voice: true },
  WATER_OVERFLOW:      { id: 'water_overflow',       color: 'danger',  icon: 'water',            priority: 1, cooldown: 10000,  buzzer: true,  voice: true },
  HIGH_TEMPERATURE:    { id: 'high_temp',            color: 'danger',  icon: 'thermometer',      priority: 2, cooldown: 10000,  buzzer: false, voice: true },
  ANIMAL_DETECTED:     { id: 'animal_detected',      color: 'warning', icon: 'paw',              priority: 1, cooldown: 30000,  buzzer: true,  voice: true },
  SENSOR_DISCONNECTED: { id: 'sensor_disconnected',  color: 'danger',  icon: 'plug-circle-xmark',priority: 2, cooldown: 30000,  buzzer: false, voice: true },
  MOTOR_AUTO_OFF:      { id: 'motor_auto_off',       color: 'warning', icon: 'power-off',        priority: 2, cooldown: 60000,  buzzer: false, voice: true },
};

function loadHistory() {
  try {
    const saved = localStorage.getItem('agrisense_alert_history');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

const initialState = {
  toasts: [],       // currently visible toast alerts
  history: loadHistory(),
  mutedAlerts: {},  // { alertId: unmute_timestamp }
  lastFired: {},    // { alertId: timestamp } for cooldown tracking
};

function alertReducer(state, action) {
  switch (action.type) {
    case 'TRIGGER_ALERT': {
      const { alertType, message, data } = action.payload;
      const config = ALERT_TYPES[alertType];
      if (!config) return state;

      const now = Date.now();

      // Check mute
      if (state.mutedAlerts[config.id] && state.mutedAlerts[config.id] > now) return state;

      // Check cooldown
      const lastFired = state.lastFired[config.id] || 0;
      if (now - lastFired < config.cooldown) return state;

      const alert = {
        id: `${alertType}_${now}_${Math.random().toString(36).slice(2, 7)}`,
        alertType,
        message,
        data: data || {},
        timestamp: now,
        color: config.color,
        icon: config.icon,
        priority: config.priority,
      };

      const history = [alert, ...state.history].slice(0, 50);
      localStorage.setItem('agrisense_alert_history', JSON.stringify(history));

      return {
        ...state,
        toasts: [...state.toasts, alert],
        history,
        lastFired: { ...state.lastFired, [config.id]: now },
      };
    }
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case 'MUTE_ALERT': {
      const { alertId, durationMs } = action.payload;
      return {
        ...state,
        mutedAlerts: { ...state.mutedAlerts, [alertId]: Date.now() + durationMs },
      };
    }
    case 'UNMUTE_ALERT': {
      const next = { ...state.mutedAlerts };
      delete next[action.payload];
      return { ...state, mutedAlerts: next };
    }
    case 'CLEAR_HISTORY':
      localStorage.removeItem('agrisense_alert_history');
      return { ...state, history: [] };
    default:
      return state;
  }
}

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  const triggerAlert = (alertType, message, data) =>
    dispatch({ type: 'TRIGGER_ALERT', payload: { alertType, message, data } });

  const dismissToast = (id) =>
    dispatch({ type: 'DISMISS_TOAST', payload: id });

  const muteAlert = (alertId, durationMs) =>
    dispatch({ type: 'MUTE_ALERT', payload: { alertId, durationMs } });

  const clearHistory = () =>
    dispatch({ type: 'CLEAR_HISTORY' });

  return (
    <AlertContext.Provider value={{ state, triggerAlert, dismissToast, muteAlert, clearHistory }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlertContext must be used within AlertProvider');
  return ctx;
}
