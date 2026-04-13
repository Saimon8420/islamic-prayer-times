/**
 * Verse Selection Service
 * Selects the best contextual verse based on current time, prayer times,
 * Hijri date, day of week, and season.
 *
 * Priority: Occasion > Friday > Prayer proximity > Time of day > Season > General
 * Deterministic: same context + same date = same verse (stable within a window)
 */

import type { ContextualVerse, VerseContext } from '../data/contextualVerses';
import { getVersesByContext } from '../data/contextualVerses';
import type { PrayerTimesResult } from './prayerService';
import type { HijriDate } from './hijriService';

export type ContextWindow =
  | 'fajr' | 'morning' | 'dhuhr' | 'afternoon'
  | 'asr' | 'evening' | 'maghrib' | 'isha' | 'night';

/**
 * Determines the current context window based on prayer times
 */
export function getCurrentWindow(now: Date, prayerTimes: PrayerTimesResult): ContextWindow {
  const t = now.getTime();

  if (t < prayerTimes.fajr.getTime()) return 'night';
  if (t < prayerTimes.sunrise.getTime()) return 'fajr';
  if (t < prayerTimes.dhuhr.getTime()) return 'morning';
  if (t < prayerTimes.asr.getTime()) {
    // Split dhuhr period: first 30 min = dhuhr context, rest = afternoon
    const dhuhrEnd = prayerTimes.dhuhr.getTime() + 30 * 60 * 1000;
    return t < dhuhrEnd ? 'dhuhr' : 'afternoon';
  }
  if (t < prayerTimes.maghrib.getTime()) {
    // Split asr period: first 30 min = asr context, rest = evening lead-up
    const asrEnd = prayerTimes.asr.getTime() + 30 * 60 * 1000;
    return t < asrEnd ? 'asr' : 'evening';
  }
  if (t < prayerTimes.isha.getTime()) return 'maghrib';
  return 'isha';
}

/**
 * Maps a context window to prioritized context queries
 */
function getContextsForWindow(window: ContextWindow): VerseContext[][] {
  // Returns arrays in priority order — try each group until we find matches
  switch (window) {
    case 'fajr':
      return [
        [{ type: 'prayer', value: 'fajr' }],
        [{ type: 'timeOfDay', value: 'dawn' }],
      ];
    case 'morning':
      return [
        [{ type: 'timeOfDay', value: 'morning' }],
      ];
    case 'dhuhr':
      return [
        [{ type: 'prayer', value: 'dhuhr' }],
        [{ type: 'timeOfDay', value: 'morning' }],
      ];
    case 'afternoon':
      return [
        [{ type: 'timeOfDay', value: 'afternoon' }],
        [{ type: 'prayer', value: 'asr' }],
      ];
    case 'asr':
      return [
        [{ type: 'prayer', value: 'asr' }],
        [{ type: 'timeOfDay', value: 'afternoon' }],
      ];
    case 'evening':
      return [
        [{ type: 'timeOfDay', value: 'evening' }],
        [{ type: 'prayer', value: 'maghrib' }],
      ];
    case 'maghrib':
      return [
        [{ type: 'prayer', value: 'maghrib' }],
        [{ type: 'timeOfDay', value: 'evening' }],
      ];
    case 'isha':
      return [
        [{ type: 'prayer', value: 'isha' }],
        [{ type: 'timeOfDay', value: 'night' }],
      ];
    case 'night':
      return [
        [{ type: 'timeOfDay', value: 'night' }],
        [{ type: 'prayer', value: 'isha' }],
      ];
  }
}

/**
 * Detects active Islamic occasion from Hijri date
 */
function getActiveOccasion(hijriDate: HijriDate): string | null {
  const { month, day } = hijriDate;

  // Ramadan (month 9)
  if (month === 9) {
    // Laylatul Qadr nights (odd nights in last 10)
    if (day >= 21 && day % 2 === 1) return 'laylatul_qadr';
    return 'ramadan';
  }
  // Eid al-Fitr (Shawwal 1-3)
  if (month === 10 && day >= 1 && day <= 3) return 'eid_fitr';
  // Dhul Hijjah
  if (month === 12) {
    if (day === 9) return 'day_of_arafah';
    if (day === 10) return 'eid_adha';
    if (day >= 1 && day <= 8) return 'dhul_hijjah';
    if (day >= 11 && day <= 13) return 'dhul_hijjah'; // Tashriq days
  }
  // Muharram
  if (month === 1) {
    if (day === 10) return 'ashura';
    if (day >= 1 && day <= 10) return 'muharram';
  }
  // Rajab
  if (month === 7) return 'rajab';
  // Shaban
  if (month === 8) return 'shaban';

  return null;
}

/**
 * Gets the current season from the month (Northern Hemisphere default)
 */
function getSeason(date: Date): string {
  const month = date.getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/**
 * Simple deterministic hash for stable verse selection
 * Same date + same context key = same verse
 */
function deterministicPick(verses: ContextualVerse[], seed: string): ContextualVerse {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % verses.length;
  return verses[index];
}

/**
 * The context label shown on the UI (e.g., "Fajr", "Jummah", "Ramadan")
 */
export interface VerseSelection {
  verse: ContextualVerse;
  contextLabel: string; // key for display: 'fajr', 'friday', 'ramadan', etc.
}

/**
 * Main selection function — picks the best verse for the current moment
 */
export function selectContextualVerse(
  now: Date,
  prayerTimes: PrayerTimesResult,
  hijriDate: HijriDate,
): VerseSelection {
  const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const isFriday = now.getDay() === 5;

  // 1. HIGHEST PRIORITY: Islamic occasion
  const occasion = getActiveOccasion(hijriDate);
  if (occasion) {
    const matches = getVersesByContext([{ type: 'occasion', value: occasion }]);
    if (matches.length > 0) {
      const seed = `${dateKey}-occasion-${occasion}`;
      return { verse: deterministicPick(matches, seed), contextLabel: occasion };
    }
  }

  // 2. FRIDAY override (all day)
  if (isFriday) {
    const matches = getVersesByContext([{ type: 'friday' }]);
    if (matches.length > 0) {
      const seed = `${dateKey}-friday`;
      return { verse: deterministicPick(matches, seed), contextLabel: 'friday' };
    }
  }

  // 3. Prayer/time-of-day context window
  const window = getCurrentWindow(now, prayerTimes);
  const contextGroups = getContextsForWindow(window);

  for (const contexts of contextGroups) {
    const matches = getVersesByContext(contexts);
    if (matches.length > 0) {
      const seed = `${dateKey}-${window}`;
      return { verse: deterministicPick(matches, seed), contextLabel: window };
    }
  }

  // 4. Season fallback
  const season = getSeason(now);
  const seasonMatches = getVersesByContext([{ type: 'season', value: season }]);
  if (seasonMatches.length > 0) {
    const seed = `${dateKey}-season-${season}`;
    return { verse: deterministicPick(seasonMatches, seed), contextLabel: season };
  }

  // 5. General fallback
  const generalMatches = getVersesByContext([{ type: 'general' }]);
  const seed = `${dateKey}-general`;
  return {
    verse: deterministicPick(generalMatches, seed),
    contextLabel: 'general',
  };
}
