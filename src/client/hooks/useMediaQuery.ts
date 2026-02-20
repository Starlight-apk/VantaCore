import { useState, useEffect, useCallback } from 'react';

interface UseMediaQueryOptions {
  defaultValue?: boolean;
}

export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { defaultValue = false } = options;
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
