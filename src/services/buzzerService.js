import api from './api';

const BUZZER_DURATIONS = {
  WATER_OVERFLOW: 5000,
  ANIMAL_DETECTED: 3000,
  DRY_SOIL: 2000,
  default: 1000,
};

const BUZZER_PATTERNS = {
  WATER_OVERFLOW: 'continuous',
  ANIMAL_DETECTED: 'rapid',
  DRY_SOIL: 'slow',
  default: 'single',
};

const buzzerService = {
  /**
   * Trigger the Arduino buzzer via backend.
   * @param {string} alertType - e.g. 'WATER_OVERFLOW'
   * @param {object} extra - additional data (zone, threat, etc.)
   */
  trigger: (alertType, extra = {}) =>
    api.post('/buzzer/trigger', {
      alert_type: alertType,
      duration: BUZZER_DURATIONS[alertType] ?? BUZZER_DURATIONS.default,
      pattern: BUZZER_PATTERNS[alertType] ?? BUZZER_PATTERNS.default,
      ...extra,
    }).catch(() => {
      // Buzzer failure is non-critical — log and continue
      console.warn('Buzzer trigger failed (non-critical)');
    }),
};

export default buzzerService;
