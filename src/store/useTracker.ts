/**
 * Personal tracking: prayers marked as prayed, make-up fasts, saved duas and tasbih.
 * Kept apart from settings so "reset settings" never wipes someone's prayer history.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TrackedPrayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const TRACKED: TrackedPrayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/** Local calendar date as YYYY-MM-DD (not UTC, so late-night prayers land on the right day). */
export const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface TrackerState {
  /** day -> prayers marked as prayed that day */
  log: Record<string, Partial<Record<TrackedPrayer, boolean>>>;
  makeupFasts: number;
  savedDuas: number[];
  togglePrayed: (day: string, prayer: TrackedPrayer) => void;
  setMakeupFasts: (n: number) => void;
  toggleSavedDua: (id: number) => void;
}

export const useTracker = create<TrackerState>()(
  persist(
    (set) => ({
      log: {},
      makeupFasts: 0,
      savedDuas: [],
      togglePrayed: (day, prayer) =>
        set((s) => ({ log: { ...s.log, [day]: { ...s.log[day], [prayer]: !s.log[day]?.[prayer] } } })),
      setMakeupFasts: (n) => set({ makeupFasts: Math.max(0, Math.min(999, Math.round(n))) }),
      toggleSavedDua: (id) =>
        set((s) => ({ savedDuas: s.savedDuas.includes(id) ? s.savedDuas.filter((x) => x !== id) : [...s.savedDuas, id] })),
    }),
    { name: 'falah-tracker' },
  ),
);

export const countPrayed = (day: Partial<Record<TrackedPrayer, boolean>> | undefined): number =>
  TRACKED.filter((p) => day?.[p]).length;

/**
 * Days in a row with all five prayers marked, counting back from yesterday
 * (today still counts once it is complete, so the streak never drops mid-day).
 */
export const streakFor = (log: TrackerState['log'], today: Date): number => {
  let n = countPrayed(log[dayKey(today)]) === 5 ? 1 : 0;
  const d = new Date(today);
  for (;;) {
    d.setDate(d.getDate() - 1);
    if (countPrayed(log[dayKey(d)]) === 5) n++;
    else break;
  }
  return n;
};
