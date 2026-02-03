import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useStore } from '../store/useStore';
import { isNativePlatform } from '../services/platformService';

interface LocationState {
  loading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const location = useStore((state) => state.location);
  const setLocation = useStore((state) => state.setLocation);

  const [state, setState] = useState<LocationState>({
    loading: false,
    error: null,
  });

  const getLocationName = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || '';
      const country = data.address?.country || '';
      return city ? `${city}, ${country}` : country || 'Unknown Location';
    } catch {
      return 'Unknown Location';
    }
  };

  const requestLocation = useCallback(async () => {
    setState({ loading: true, error: null });

    try {
      if (isNativePlatform()) {
        // Use Capacitor Geolocation — triggers native Android permission dialog
        const permResult = await Geolocation.requestPermissions();
        if (permResult.location !== 'granted' && permResult.coarseLocation !== 'granted') {
          setState({ loading: false, error: 'Location permission denied. Please enable location access in app settings.' });
          return;
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const name = await getLocationName(lat, lon);
        setLocation({ lat, lon, name });
        setState({ loading: false, error: null });
      } else {
        // Web fallback — uses browser geolocation API
        if (!navigator.geolocation) {
          setState({ loading: false, error: 'Geolocation is not supported by your browser' });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const name = await getLocationName(lat, lon);
            setLocation({ lat, lon, name });
            setState({ loading: false, error: null });
          },
          (error) => {
            let errorMessage = 'Failed to get location';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied. Please enable location access.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out.';
                break;
            }
            setState({ loading: false, error: errorMessage });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setState({ loading: false, error: message });
    }
  }, [setLocation]);

  const setManualLocation = useCallback(
    async (lat: number, lon: number) => {
      setState({ loading: true, error: null });
      const name = await getLocationName(lat, lon);
      setLocation({ lat, lon, name });
      setState({ loading: false, error: null });
    },
    [setLocation]
  );

  const clearLocation = useCallback(() => {
    setLocation(null);
    setState({ loading: false, error: null });
  }, [setLocation]);

  return {
    lat: location?.lat ?? null,
    lon: location?.lon ?? null,
    name: location?.name ?? '',
    loading: state.loading,
    error: state.error,
    hasLocation: location !== null,
    requestLocation,
    setManualLocation,
    clearLocation,
  };
};
