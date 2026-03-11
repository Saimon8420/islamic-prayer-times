import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useStore } from '../store/useStore';
import { isNativePlatform } from '../services/platformService';
import { calculatePrayerTimes } from '../services/prayerService';
import {
  scheduleAllPrayerNotifications,
  disableAllNotifications,
  createNotificationChannels,
  requestNotificationPermission,
  showWebNotification,
  getAdhanFile,
} from '../services/notificationService';

/**
 * Reactive bridge between the Zustand store and notification scheduling.
 * - Native: Schedules Capacitor LocalNotifications
 * - Web: Polls every 30s and fires browser notification + audio at prayer time
 */
export const useNotifications = () => {
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const selectedAdhan = useStore((s) => s.selectedAdhan);
  const selectedFajrAdhan = useStore((s) => s.selectedFajrAdhan);
  const location = useStore((s) => s.location);
  const calculationMethod = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);

  const isInitialized = useRef(false);
  // Track which prayer times we've already notified for (prevent duplicates)
  const notifiedRef = useRef<Set<string>>(new Set());

  // ──── NATIVE NOTIFICATIONS ────
  useEffect(() => {
    if (!isNativePlatform()) return;

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
        selectedFajrAdhan,
      });
    };

    scheduleOrCancel();
  }, [notificationsEnabled, selectedAdhan, selectedFajrAdhan, location, calculationMethod, madhab]);

  // Reschedule on app resume (native)
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
        selectedFajrAdhan: state.selectedFajrAdhan,
      });
    });

    return () => { listener.then((l) => l.remove()); };
  }, []);

  // ──── WEB NOTIFICATIONS ────
  useEffect(() => {
    if (isNativePlatform()) return;
    if (!notificationsEnabled || !location) return;

    // Request permission on first enable
    requestNotificationPermission();

    // Clear notified set at midnight
    const resetAtMidnight = () => {
      notifiedRef.current.clear();
    };

    const checkPrayerTimes = () => {
      const state = useStore.getState();
      if (!state.notificationsEnabled || !state.location) return;

      const now = new Date();
      const times = calculatePrayerTimes(
        state.location.lat,
        state.location.lon,
        now,
        state.calculationMethod,
        state.madhab
      );

      // Prayer schedule: [key, title, body, time, isFajr]
      const schedule: [string, string, string, Date, boolean][] = [
        ['sehri', 'Sehri Time Ending', 'Sehri (Imsak) time is ending soon. Complete your suhoor.', times.imsak, true],
        ['fajr', 'Fajr Prayer', 'It is time for Fajr prayer.', times.fajr, true],
        ['dhuhr', 'Dhuhr Prayer', 'It is time for Dhuhr prayer.', times.dhuhr, false],
        ['asr', 'Asr Prayer', 'It is time for Asr prayer.', times.asr, false],
        ['maghrib', 'Maghrib Prayer', 'It is time for Maghrib prayer. Iftar time for those fasting.', times.maghrib, false],
        ['isha', 'Isha Prayer', 'It is time for Isha prayer.', times.isha, false],
      ];

      const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

      for (const [key, title, body, time, isFajr] of schedule) {
        const notifKey = `${dateKey}-${key}`;
        if (notifiedRef.current.has(notifKey)) continue;

        const diff = now.getTime() - time.getTime();
        // Trigger if within 0–45 seconds after prayer time
        if (diff >= 0 && diff < 45000) {
          notifiedRef.current.add(notifKey);
          const adhanId = isFajr ? state.selectedFajrAdhan : state.selectedAdhan;
          if (adhanId === 'off') continue;
          const audioFile = adhanId === 'default' ? '' : getAdhanFile(adhanId);
          showWebNotification(title, body, audioFile);
        }
      }
    };

    // Check immediately, then every 30 seconds
    checkPrayerTimes();
    const interval = setInterval(checkPrayerTimes, 30000);

    // Reset notified set at midnight
    const midnightCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetAtMidnight();
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(midnightCheck);
    };
  }, [notificationsEnabled, selectedAdhan, selectedFajrAdhan, location, calculationMethod, madhab]);
};
