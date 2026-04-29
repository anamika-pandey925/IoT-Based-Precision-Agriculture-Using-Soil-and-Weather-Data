import { useEffect, useRef } from 'react';

/**
 * Reliable polling hook.
 * - Clears interval on unmount.
 * - Pauses when the browser tab is hidden (Page Visibility API).
 * - Pass delay=null to pause manually.
 */
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Always keep the latest callback without restarting the interval
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || delay === undefined) return;

    const tick = () => {
      // Pause when tab is hidden to save resources
      if (document.visibilityState === 'hidden') return;
      savedCallback.current();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default useInterval;
