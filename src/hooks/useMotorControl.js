import { useState, useEffect, useRef } from 'react';
import { useSensor } from '../context/SensorContext';
import { useSettings } from '../context/SettingsContext';
import { useAlertContext } from '../context/AlertContext';
import motorService from '../services/motorService';

/**
 * Tracks motor run time and triggers auto-off when max run time is exceeded.
 * Returns { runDuration, runPercent, isRunning }
 */
function useMotorControl() {
  const { state: sensorState } = useSensor();
  const { settings } = useSettings();
  const { triggerAlert } = useAlertContext();

  const [runDuration, setRunDuration] = useState(0);
  const startTimeRef = useRef(null);
  const warningShownRef = useRef(false);
  const autoOffSentRef = useRef(false);
  const timerRef = useRef(null);

  const motorStatus = sensorState.data?.motor_status;
  const isRunning = motorStatus === 'ON';
  const maxRunTime = settings.motorMaxRunTime;

  useEffect(() => {
    if (isRunning) {
      // Start timer
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        warningShownRef.current = false;
        autoOffSentRef.current = false;
      }

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setRunDuration(elapsed);

        // Warning at 1 minute before max
        const warningThreshold = maxRunTime - 60000;
        if (elapsed >= warningThreshold && !warningShownRef.current) {
          const remaining = Math.ceil((maxRunTime - elapsed) / 1000);
          triggerAlert('MOTOR_AUTO_OFF', `Motor will auto-off in ${remaining}s to prevent overwatering`);
          warningShownRef.current = true;
        }

        // Auto-off
        if (elapsed >= maxRunTime && !autoOffSentRef.current) {
          autoOffSentRef.current = true;
          motorService.forceOff('max_run_time_exceeded', elapsed).catch(() => {});
          triggerAlert('MOTOR_AUTO_OFF', 'Motor auto-OFF: Maximum run time exceeded (5 min)');
        }
      }, 1000);
    } else {
      // Motor stopped — reset
      clearInterval(timerRef.current);
      startTimeRef.current = null;
      setRunDuration(0);
      warningShownRef.current = false;
      autoOffSentRef.current = false;
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, maxRunTime, triggerAlert]);

  const runPercent = maxRunTime > 0 ? Math.min((runDuration / maxRunTime) * 100, 100) : 0;

  return { runDuration, runPercent, isRunning };
}

export default useMotorControl;
