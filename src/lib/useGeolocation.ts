import { useCallback, useState } from 'react';

export interface Coords {
  lat: number;
  lng: number;
}

export type GeolocationState = { status: 'idle' } | { status: 'locating' } | { status: 'denied'; message: string };

/**
 * Locating is a one-shot action: `locate` resolves with the coordinates (or
 * null when refused) and the caller decides what to do with them. The hook
 * keeps only the transient locating/denied state for the button and its
 * message; it never holds a position, so the URL stays the single source
 * of truth for the near-me filter and clearing it cannot be undone by a
 * stale sync.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  const locate = useCallback((): Promise<Coords | null> => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'denied', message: 'Your browser does not support location.' });
      return Promise.resolve(null);
    }
    setState({ status: 'locating' });
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({ status: 'idle' });
          resolve({ lat: round(position.coords.latitude), lng: round(position.coords.longitude) });
        },
        (error) => {
          setState({ status: 'denied', message: error.message || 'Location was not available.' });
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
      );
    });
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, locate, reset };
}

// Four decimals is about 11 m; enough for "near me" and keeps URLs short.
function round(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}
