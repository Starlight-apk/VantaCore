import { useState, useEffect, useCallback } from 'react';

interface UseIntervalOptions {
  immediate?: boolean;
}

export function useInterval(
  callback: () => void,
  delay: number | null,
  options: UseIntervalOptions = {}
) {
  const { immediate = false } = options;
  const [savedCallback, setSavedCallback] = useState(callback);

  useEffect(() => {
    setSavedCallback(callback);
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      savedCallback();
    };

    if (immediate) {
      tick();
    }

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay, immediate, savedCallback]);
}
