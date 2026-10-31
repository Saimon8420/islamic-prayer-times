import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { calculatePrayerTimes, formatPrayerTime, PRAYER_NAMES } from '../services/prayerService';
import { useTranslation } from '../i18n/useTranslation';

/** Current time, re-rendering every `ms` (seconds for countdowns, a minute otherwise). */
export function useNow(ms = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const PRAYER_KEYS: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const TITLE: Record<PrayerKey, keyof typeof PRAYER_NAMES> = { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

export interface PrayerSlot {
  key: PrayerKey;
  name: string;
  arabic: string;
  time: Date;
  /** sunrise is shown but is not a prayer */
  isPrayer: boolean;
}

/** Prayer times for a date at the saved location, with localized names. */
export function usePrayerDay(date: Date) {
  const location = useStore((s) => s.location);
  const method = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);
  const { t } = useTranslation();
  const dayStamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return useMemo(() => {
    if (!location) return null;
    const times = calculatePrayerTimes(location.lat, location.lon, date, method, madhab);
    const slots: PrayerSlot[] = PRAYER_KEYS.map((key) => ({
      key,
      name: t(`prayer.names.${TITLE[key]}` as 'prayer.names.Fajr'),
      arabic: PRAYER_NAMES[TITLE[key]].ar,
      time: times[key],
      isPrayer: key !== 'sunrise',
    }));
    return { times, slots };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, method, madhab, dayStamp, t]);
}

export function useFormatTime() {
  const use24 = useStore((s) => s.use24HourFormat);
  return useCallback((d: Date) => formatPrayerTime(d, use24), [use24]);
}

/** "1 hr 20 min" in the current language. */
export function useDuration() {
  const { t } = useTranslation();
  return useCallback(
    (ms: number) => {
      const total = Math.max(0, Math.round(ms / 60000));
      const h = Math.floor(total / 60), m = total % 60;
      return h ? `${h} ${t('ui.today.hr')} ${m} ${t('ui.today.min')}` : `${m} ${t('ui.today.min')}`;
    },
    [t],
  );
}

export const hms = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const localeFor = (lang: string) => (lang === 'bn' ? 'bn-BD' : lang === 'ar' ? 'ar' : 'en-GB');

export const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
