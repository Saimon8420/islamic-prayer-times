import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { calculatePrayerTimes } from '../services/prayerService';
import { gregorianToHijri } from '../services/hijriService';
import type { HijriDate } from '../services/hijriService';

/**
 * Returns the current Hijri date, correctly advancing at Maghrib (sunset)
 * rather than at Gregorian midnight.
 *
 * Islamically, the new day begins at Maghrib — so after sunset on
 * 21 Ramadan, the date becomes 22 Ramadan.
 */
export const useHijriDate = (): { hijriDate: HijriDate; maghribTime: Date | undefined } => {
  const location = useStore((s) => s.location);
  const calculationMethod = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);
  const hijriAdjustment = useStore((s) => s.hijriAdjustment);

  const maghribTime = useMemo(() => {
    if (!location) return undefined;
    const times = calculatePrayerTimes(
      location.lat,
      location.lon,
      new Date(),
      calculationMethod,
      madhab,
    );
    return times.maghrib;
  }, [location, calculationMethod, madhab]);

  const hijriDate = useMemo(
    () => gregorianToHijri(new Date(), hijriAdjustment, maghribTime),
    [hijriAdjustment, maghribTime],
  );

  return { hijriDate, maghribTime };
};
