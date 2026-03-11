import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativePlatform } from './platformService';
import { calculatePrayerTimes } from './prayerService';
import { addDays } from 'date-fns';
import type { CalculationMethodId, MadhabId } from './prayerService';

/* ═══════════════════════════════════════════
   ADHAN SOUND OPTIONS
   ═══════════════════════════════════════════ */

export interface AdhanSound {
  id: string;
  name: string;
  file: string; // local path under public/ (empty = device default or silent)
}

// Regular adhan — for Dhuhr, Asr, Maghrib, Isha
export const REGULAR_ADHAN_SOUNDS: AdhanSound[] = [
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', file: '/audio/adhan/alafasy_regular.mp3' },
  { id: 'makkah', name: 'Makkah — Sheikh Ali Mullah', file: '/audio/adhan/makkah_regular.mp3' },
  { id: 'madinah', name: 'Madinah', file: '/audio/adhan/madinah_regular.mp3' },
  { id: 'default', name: 'Default Sound', file: '' },
  { id: 'off', name: 'Silent (No Sound)', file: '' },
];

// Fajr adhan — includes "الصلاة خير من النوم"
export const FAJR_ADHAN_SOUNDS: AdhanSound[] = [
  { id: 'alafasy-fajr', name: 'Mishary Rashid Alafasy (Fajr)', file: '/audio/adhan/alafasy_fajr.mp3' },
  { id: 'makkah-fajr', name: 'Makkah — Sheikh Ali Mullah (Fajr)', file: '/audio/adhan/makkah_fajr.mp3' },
  { id: 'default', name: 'Default Sound', file: '' },
  { id: 'off', name: 'Silent (No Sound)', file: '' },
];

// Legacy compat — combined list for native channels
const ALL_SOUNDS = [...REGULAR_ADHAN_SOUNDS, ...FAJR_ADHAN_SOUNDS];

export const getAdhanFile = (id: string): string => {
  const sound = ALL_SOUNDS.find((s) => s.id === id);
  return sound?.file || '';
};

/* ═══════════════════════════════════════════
   NATIVE (CAPACITOR) NOTIFICATIONS
   ═══════════════════════════════════════════ */

const CHANNEL_REMINDER = 'prayer-reminders';
const adhanChannelId = (adhanId: string) => `prayer-adhan-${adhanId}`;

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

export const createNotificationChannels = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  for (const adhan of ALL_SOUNDS) {
    if (adhan.id === 'off') continue;
    await LocalNotifications.createChannel({
      id: adhanChannelId(adhan.id),
      name: adhan.id === 'default'
        ? 'Prayer Time (Default Sound)'
        : `Prayer Time - ${adhan.name}`,
      description: `Prayer notifications with ${adhan.name}`,
      importance: 5,
      sound: adhan.file ? adhan.file.split('/').pop() : undefined,
      vibration: true,
    });
  }

  await LocalNotifications.createChannel({
    id: CHANNEL_REMINDER,
    name: 'Prayer Time Reminders',
    description: 'Reminders for sunrise and other notifications',
    importance: 3,
    vibration: true,
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (isNativePlatform()) {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display === 'granted') return true;
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }
  // Web
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

interface ScheduleParams {
  latitude: number;
  longitude: number;
  calculationMethod: CalculationMethodId;
  madhab: MadhabId;
  selectedAdhan: string;
  selectedFajrAdhan: string;
}

export const cancelAllPrayerNotifications = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((n) => ({ id: n.id })),
    });
  }
};

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

  const isRegularOff = params.selectedAdhan === 'off';
  const isFajrOff = params.selectedFajrAdhan === 'off';

  const regularChannelId = isRegularOff ? CHANNEL_REMINDER : adhanChannelId(params.selectedAdhan);
  const fajrChannelId = isFajrOff ? CHANNEL_REMINDER : adhanChannelId(params.selectedFajrAdhan);

  const regularSound = isRegularOff ? undefined : (getAdhanFile(params.selectedAdhan).split('/').pop() || undefined);
  const fajrSound = isFajrOff ? undefined : (getAdhanFile(params.selectedFajrAdhan).split('/').pop() || undefined);

  for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
    const date = dayOffset === 0 ? new Date() : addDays(new Date(), dayOffset);
    const times = calculatePrayerTimes(
      params.latitude, params.longitude, date,
      params.calculationMethod, params.madhab
    );

    // Sehri — uses fajr adhan sound
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.sehri + dayOffset,
      title: 'Sehri Time Ending',
      body: 'Sehri (Imsak) time is ending soon. Complete your suhoor.',
      time: times.imsak, now,
      channelId: fajrChannelId, sound: fajrSound,
    });

    // Fajr — uses fajr adhan
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.fajr + dayOffset,
      title: 'Fajr Prayer',
      body: 'It is time for Fajr prayer.',
      time: times.fajr, now,
      channelId: fajrChannelId, sound: fajrSound,
    });

    // Sunrise — always reminder (no adhan)
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.sunrise + dayOffset,
      title: 'Sunrise',
      body: 'The sun has risen. Ishraq prayer time begins shortly.',
      time: times.sunrise, now,
      channelId: CHANNEL_REMINDER, sound: undefined,
    });

    // Dhuhr — regular adhan
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.dhuhr + dayOffset,
      title: 'Dhuhr Prayer',
      body: 'It is time for Dhuhr prayer.',
      time: times.dhuhr, now,
      channelId: regularChannelId, sound: regularSound,
    });

    // Asr — regular adhan
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.asr + dayOffset,
      title: 'Asr Prayer',
      body: 'It is time for Asr prayer.',
      time: times.asr, now,
      channelId: regularChannelId, sound: regularSound,
    });

    // Maghrib — regular adhan
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.maghrib + dayOffset,
      title: 'Maghrib Prayer',
      body: 'It is time for Maghrib prayer. Iftar time for those fasting.',
      time: times.maghrib, now,
      channelId: regularChannelId, sound: regularSound,
    });

    // Iftar
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.iftar + dayOffset,
      title: 'Iftar Time',
      body: 'It is time to break your fast.',
      time: times.maghrib, now,
      channelId: regularChannelId, sound: regularSound,
    });

    // Isha — regular adhan
    addNotification(notifications, {
      id: NOTIFICATION_BASE_IDS.isha + dayOffset,
      title: 'Isha Prayer',
      body: 'It is time for Isha prayer.',
      time: times.isha, now,
      channelId: regularChannelId, sound: regularSound,
    });
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
};

export const disableAllNotifications = async (): Promise<void> => {
  await cancelAllPrayerNotifications();
};

function addNotification(
  batch: Array<{
    id: number; title: string; body: string;
    schedule: { at: Date; allowWhileIdle: boolean };
    channelId: string; sound: string | undefined;
  }>,
  opts: {
    id: number; title: string; body: string; time: Date; now: Date;
    channelId: string; sound: string | undefined;
  }
) {
  if (opts.time.getTime() > opts.now.getTime()) {
    batch.push({
      id: opts.id, title: opts.title, body: opts.body,
      schedule: { at: opts.time, allowWhileIdle: true },
      channelId: opts.channelId, sound: opts.sound,
    });
  }
}

/* ═══════════════════════════════════════════
   WEB NOTIFICATIONS (Browser + Audio)
   ═══════════════════════════════════════════ */

let webAudio: HTMLAudioElement | null = null;

export const playAdhanAudio = (file: string): void => {
  stopAdhanAudio();
  if (!file) return;
  webAudio = new Audio(file);
  webAudio.play().catch(() => {/* autoplay blocked, notification still shows */});
};

export const stopAdhanAudio = (): void => {
  if (webAudio) {
    webAudio.pause();
    webAudio.currentTime = 0;
    webAudio = null;
  }
};

export const showWebNotification = (title: string, body: string, audioFile: string): void => {
  // Play adhan audio
  if (audioFile) {
    playAdhanAudio(audioFile);
  }

  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'prayer-notification',
      requireInteraction: true,
    });

    // Stop audio when notification is closed
    notification.addEventListener('close', stopAdhanAudio);
    // Auto-close after 5 minutes
    setTimeout(() => notification.close(), 5 * 60 * 1000);
  }
};
