import { useState, useEffect, useCallback } from 'react';

interface UseDebounceOptions {
  delay?: number;
}

export function useDebounce<T>(value: T, options: UseDebounceOptions = {}): T {
  const { delay = 300 } = options;
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const id = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(id);
    },
    [callback, delay, timeoutId]
  );

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}
