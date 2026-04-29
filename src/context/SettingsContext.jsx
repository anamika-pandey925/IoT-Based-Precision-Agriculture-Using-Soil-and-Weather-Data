import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULTS = {
  moistureThreshold:   40,    // % — motor turns on below this
  tempThreshold:       35,    // °C — high temp alert above this
  overflowThreshold:   90,    // % — overflow alert above this
  refreshRate:         2000,  // ms
  autoIrrigation:      true,
  voiceAlerts:         true,
  buzzerAlerts:        true,
  animalDetection:     true,
  motorMaxRunTime:     300000, // 5 minutes in ms
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_settings');
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const updateSettings = (updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('agrisense_settings', JSON.stringify(next));
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULTS);
    localStorage.setItem('agrisense_settings', JSON.stringify(DEFAULTS));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
