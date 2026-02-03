import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativePlatform } from './platformService';
import { calculatePrayerTimes } from './prayerService';
import { addDays } from 'date-fns';
import type { CalculationMethodId, MadhabId } from './prayerService';

// Available adhan sounds — each gets its own Android notification channel
export const ADHAN_SOUNDS = [
  { id: 'makkah', name: 'Makkah', file: 'adhan_makkah.mp3' },
  { id: 'madinah', name: 'Madinah', file: 'adhan_madinah.mp3' },
  { id: 'alafasy', name: 'Mishary Alafasy', file: 'adhan_alafasy.mp3' },
  { id: 'abdulbasit', name: 'Abdul Basit', file: 'adhan_abdulbasit.mp3' },
  { id: 'default', name: 'Default Sound', file: '' },
  { id: 'off', name: 'Silent (No Sound)', file: '' },
] as const;

export type AdhanSoundId = typeof ADHAN_SOUNDS[number]['id'];

// Channel IDs
const CHANNEL_REMINDER = 'prayer-reminders';
const adhanChannelId = (adhanId: AdhanSoundId) => `prayer-adhan-${adhanId}`;

// Get the sound file name for an adhan variant
const getAdhanSound = (adhanId: AdhanSoundId): string | undefined => {
  const adhan = ADHAN_SOUNDS.find((a) => a.id === adhanId);
  return adhan?.file || undefined;
};

// Base IDs for deterministic notification IDs (100-800 range per prayer type)
const NOTIFICATION_BASE_IDS = {
  sehri: 100,
  fajr: 200,
  sunrise: 300,
  dhuhr: 400,
  asr: 500,
  maghrib: 600,
  iftar: 700,
  isha: 800,
} as const;

const DAYS_TO_SCHEDULE = 3;

/**
 * Create Android notification channels — one per adhan variant + one reminder channel.
 * Idempotent: safe to call multiple times. Android ignores re-creation of existing channels.
 */
export const createNotificationChannels = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  // One channel per adhan variant
  for (const adhan of ADHAN_SOUNDS) {
    if (adhan.id === 'off') continue; // no channel needed for silent

    await LocalNotifications.createChannel({
      id: adhanChannelId(adhan.id),
      name: adhan.id === 'default'
        ? 'Prayer Time (Default Sound)'
        : `Prayer Time - ${adhan.name} Adhan`,
      description: adhan.id === 'default'
        ? 'Prayer notifications with default device sound'
        : `Prayer notifications with ${adhan.name} adhan`,
      importance: 5, // HIGH
      sound: adhan.file || undefined,
      vibration: true,
    });
  }

  // Reminder channel (sunrise, silent notifications)
  await LocalNotifications.createChannel({
    id: CHANNEL_REMINDER,
    name: 'Prayer Time Reminders',
    description: 'Reminders for sunrise and other notifications',
    importance: 3, // DEFAULT
    vibration: true,
  });
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNativePlatform()) return false;

  const permission = await LocalNotifications.checkPermissions();
  if (permission.display === 'granted') return true;

  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted';
};

interface ScheduleParams {
  latitude: number;
  longitude: number;
  calculationMethod: CalculationMethodId;
  madhab: MadhabId;
  selectedAdhan: AdhanSoundId;
}

/**
 * Cancel all pending prayer notifications
 */
export const cancelAllPrayerNotifications = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((n) => ({ id: n.id })),
    });
  }
};

/**
 * Schedule all prayer notifications for the next 3 days
 */
export const scheduleAllPrayerNotifications = async (
  params: ScheduleParams
): Promise<void> => {
  if (!isNativePlatform()) return;

  await createNotificationChannels();

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await cancelAllPrayerNotifications();

  const now = new Date();
  const notifications: Array<{
    id: number;
    title: string;
    body: string;
    schedule: { at: Date; allowWhileIdle: boolean };
    channelId: string;
    sound: string | undefined;
  }> = [];

  // Determine which channel and sound to use based on selected adhan
  const isOff = params.selectedAdhan === 'off';
  const channelId = isOff ? CHANNEL_REMINDER : adhanChannelId(params.selectedAdhan);
  const sound = isOff ? undefined : getAdhanSound(params.selectedAdhan);

  for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
    const date = dayOffset === 0 ? new Date() : addDays(new Date(), dayOffset);
    const times = calculatePrayerTimes(
      params.latitude,
      params.longitude,
      date,
      params.calculationMethod,
      params.madhab
    );

    // Sehri (Imsak) - 10 min before Fajr
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.sehri + dayOffset,
      title: 'Sehri Time Ending',
      body: 'Sehri (Imsak) time is ending soon. Complete your suhoor.',
      time: times.imsak,
      now,
      channelId,
      sound,
    });

    // Fajr
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.fajr + dayOffset,
      title: 'Fajr Prayer',
      body: 'It is time for Fajr prayer.',
      time: times.fajr,
      now,
      channelId,
      sound,
    });

    // Sunrise - always reminder channel (no adhan for sunrise)
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.sunrise + dayOffset,
      title: 'Sunrise',
      body: 'The sun has risen. Ishraq prayer time begins shortly.',
      time: times.sunrise,
      now,
      channelId: CHANNEL_REMINDER,
      sound: undefined,
    });

    // Dhuhr
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.dhuhr + dayOffset,
      title: 'Dhuhr Prayer',
      body: 'It is time for Dhuhr prayer.',
      time: times.dhuhr,
      now,
      channelId,
      sound,
    });

    // Asr
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.asr + dayOffset,
      title: 'Asr Prayer',
      body: 'It is time for Asr prayer.',
      time: times.asr,
      now,
      channelId,
      sound,
    });

    // Maghrib
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.maghrib + dayOffset,
      title: 'Maghrib Prayer',
      body: 'It is time for Maghrib prayer. Iftar time for those fasting.',
      time: times.maghrib,
      now,
      channelId,
      sound,
    });

    // Iftar (same as Maghrib time but separate notification)
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.iftar + dayOffset,
      title: 'Iftar Time',
      body: 'It is time to break your fast.',
      time: times.maghrib,
      now,
      channelId,
      sound,
    });

    // Isha
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.isha + dayOffset,
      title: 'Isha Prayer',
      body: 'It is time for Isha prayer.',
      time: times.isha,
      now,
      channelId,
      sound,
    });
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
};

/**
 * Disable all notifications
 */
export const disableAllNotifications = async (): Promise<void> => {
  await cancelAllPrayerNotifications();
};

// Helper to add a notification to the batch if its time is in the future
function addNotification(
  batch: Array<{
    id: number;
    title: string;
    body: string;
    schedule: { at: Date; allowWhileIdle: boolean };
    channelId: string;
    sound: string | undefined;
  }>,
  opts: {
    id: number;
    title: string;
    body: string;
    time: Date;
    now: Date;
    channelId: string;
    sound: string | undefined;
  }
) {
  if (opts.time.getTime() > opts.now.getTime()) {
    batch.push({
      id: opts.id,
      title: opts.title,
      body: opts.body,
      schedule: { at: opts.time, allowWhileIdle: true },
      channelId: opts.channelId,
      sound: opts.sound,
    });
  }
}
