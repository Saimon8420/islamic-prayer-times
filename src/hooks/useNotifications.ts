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

      // Prayer schedule: [key, title, body, time, type]
      // type: 'fajr' = fajr adhan, 'regular' = regular adhan, 'silent' = no adhan (default sound only)
      const schedule: [string, string, string, Date, 'fajr' | 'regular' | 'silent'][] = [
        ['sehri', 'Suhoor Reminder', 'Fajr is approaching. Complete your suhoor soon.', times.imsak, 'silent'],
        ['fajr', 'Fajr Prayer', 'It is time for Fajr prayer.', times.fajr, 'fajr'],
        ['dhuhr', 'Dhuhr Prayer', 'It is time for Dhuhr prayer.', times.dhuhr, 'regular'],
        ['asr', 'Asr Prayer', 'It is time for Asr prayer.', times.asr, 'regular'],
        ['iftar', 'Iftar Time', 'It is time to break your fast.', times.maghrib, 'silent'],
        ['maghrib', 'Maghrib Prayer', 'It is time for Maghrib prayer.', new Date(times.maghrib.getTime() + 60000), 'regular'],
        ['isha', 'Isha Prayer', 'It is time for Isha prayer.', times.isha, 'regular'],
      ];

      // Friday reminders — Surah Kahf at Fajr, Jummah 1h before Dhuhr
      if (now.getDay() === 5) {
        schedule.push(
          ['friday-kahf', 'Surah Al-Kahf Reminder', "It's Friday! Don't forget to read Surah Al-Kahf.", times.fajr, 'silent'],
          ['friday-jummah', 'Jummah Prayer', 'Prepare for Jummah prayer. Go early and send salawat upon the Prophet (PBUH).', new Date(times.dhuhr.getTime() - 60 * 60000), 'silent'],
        );
      }

      const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

      for (const [key, title, body, time, type] of schedule) {
        const notifKey = `${dateKey}-${key}`;
        if (notifiedRef.current.has(notifKey)) continue;

        const diff = now.getTime() - time.getTime();
        // Trigger if within 0–45 seconds after prayer time
        if (diff >= 0 && diff < 45000) {
          notifiedRef.current.add(notifKey);
          if (type === 'silent') {
            // No adhan — just browser notification with no audio
            showWebNotification(title, body, '');
          } else {
            const adhanId = type === 'fajr' ? state.selectedFajrAdhan : state.selectedAdhan;
            if (adhanId === 'off') continue;
            const audioFile = adhanId === 'default' ? '' : getAdhanFile(adhanId);
            showWebNotification(title, body, audioFile);
          }
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
