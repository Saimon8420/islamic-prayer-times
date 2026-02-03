import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useStore } from '../store/useStore';
import { isNativePlatform } from '../services/platformService';
import {
  scheduleAllPrayerNotifications,
  disableAllNotifications,
  createNotificationChannels,
} from '../services/notificationService';

/**
 * Reactive bridge between the Zustand store and notification scheduling.
 * - Reschedules notifications when relevant settings change
 * - Reschedules on app resume from background
 * - No-op on web platform
 */
export const useNotifications = () => {
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const selectedAdhan = useStore((s) => s.selectedAdhan);
  const location = useStore((s) => s.location);
  const calculationMethod = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isNativePlatform()) return;

    // Create channels on first mount
    if (!isInitialized.current) {
      createNotificationChannels();
      isInitialized.current = true;
    }

    const scheduleOrCancel = async () => {
      if (!notificationsEnabled || !location) {
        await disableAllNotifications();
        return;
      }

      await scheduleAllPrayerNotifications({
        latitude: location.lat,
        longitude: location.lon,
        calculationMethod,
        madhab,
        selectedAdhan,
      });
    };

    scheduleOrCancel();
  }, [notificationsEnabled, selectedAdhan, location, calculationMethod, madhab]);

  // Reschedule on app resume from background
  useEffect(() => {
    if (!isNativePlatform()) return;

    const listener = App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) return;

      const state = useStore.getState();
      if (!state.notificationsEnabled || !state.location) return;

      scheduleAllPrayerNotifications({
        latitude: state.location.lat,
        longitude: state.location.lon,
        calculationMethod: state.calculationMethod,
        madhab: state.madhab,
        selectedAdhan: state.selectedAdhan,
      });
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);
};
