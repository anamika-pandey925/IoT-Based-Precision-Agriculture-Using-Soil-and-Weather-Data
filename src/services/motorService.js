import api from './api';

const motorService = {
  /**
   * Force the motor off (safety auto-off).
   * @param {string} reason - e.g. 'max_run_time_exceeded'
   * @param {number} duration - ms the motor has been running
   */
  forceOff: (reason = 'max_run_time_exceeded', duration = 0) =>
    api.post('/motor/force_off', { reason, duration }),

  /**
   * Manual motor control.
   * @param {'on'|'off'} action
   */
  manual: (action) => api.post('/motor/manual', { action }),
};

export default motorService;
