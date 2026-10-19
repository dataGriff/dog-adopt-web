import { useCallback, useState } from 'react';

export interface Coords {
  lat: number;
  lng: number;
}

export type GeolocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'granted'; coords: Coords }
  | { status: 'denied'; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'denied', message: 'Your browser does not support location.' });
      return;
    }
    setState({ status: 'locating' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'granted',
          coords: { lat: round(position.coords.latitude), lng: round(position.coords.longitude) },
        });
      },
      (error) => {
        setState({ status: 'denied', message: error.message || 'Location was not available.' });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, locate, reset };
}

// Four decimals is about 11 m; enough for "near me" and keeps URLs short.
function round(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}
