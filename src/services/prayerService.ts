/**
 * Prayer Time Calculation Service
 * Uses the Adhan library for accurate prayer time calculations
 *
 * Adhan is an open-source library for calculating Islamic prayer times
 * https://github.com/batoulapps/adhan-js
 */

import {
  PrayerTimes,
  CalculationMethod,
  Coordinates,
  CalculationParameters,
  Madhab,
  Prayer,
  Qibla,
} from 'adhan';
import { format, differenceInSeconds, addDays } from 'date-fns';

// Calculation method options
export const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'Muslim World League' },
  { id: 'Egyptian', name: 'Egyptian General Authority of Survey' },
  { id: 'Karachi', name: 'University of Islamic Sciences, Karachi' },
  { id: 'UmmAlQura', name: 'Umm Al-Qura University, Makkah' },
  { id: 'Dubai', name: 'Dubai' },
  { id: 'MoonsightingCommittee', name: 'Moonsighting Committee' },
  { id: 'NorthAmerica', name: 'Islamic Society of North America (ISNA)' },
  { id: 'Kuwait', name: 'Kuwait' },
  { id: 'Qatar', name: 'Qatar' },
  { id: 'Singapore', name: 'Majlis Ugama Islam Singapura' },
  { id: 'Turkey', name: 'Diyanet İşleri Başkanlığı, Turkey' },
  { id: 'Tehran', name: 'Institute of Geophysics, University of Tehran' },
] as const;

export type CalculationMethodId = typeof CALCULATION_METHODS[number]['id'];

// Madhab options for Asr calculation
export const MADHAB_OPTIONS = [
  { id: 'Shafi', name: 'Shafi\'i, Maliki, Hanbali (Standard)' },
  { id: 'Hanafi', name: 'Hanafi' },
] as const;

export type MadhabId = typeof MADHAB_OPTIONS[number]['id'];

// Get calculation parameters based on method ID
const getCalculationParams = (methodId: CalculationMethodId): CalculationParameters => {
  const methods: Record<CalculationMethodId, () => CalculationParameters> = {
    MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
    Egyptian: CalculationMethod.Egyptian,
    Karachi: CalculationMethod.Karachi,
    UmmAlQura: CalculationMethod.UmmAlQura,
    Dubai: CalculationMethod.Dubai,
    MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
    NorthAmerica: CalculationMethod.NorthAmerica,
    Kuwait: CalculationMethod.Kuwait,
    Qatar: CalculationMethod.Qatar,
    Singapore: CalculationMethod.Singapore,
    Turkey: CalculationMethod.Turkey,
    Tehran: CalculationMethod.Tehran,
  };
  return methods[methodId]();
};

// Prayer times result interface
export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  // Additional times
  imsak: Date; // 10 minutes before Fajr
  midnight: Date;
  lastThird: Date;
}

// Calculate prayer times for a specific date and location
export const calculatePrayerTimes = (
  latitude: number,
  longitude: number,
  date: Date,
  method: CalculationMethodId = 'MuslimWorldLeague',
  madhab: MadhabId = 'Shafi'
): PrayerTimesResult => {
  const coordinates = new Coordinates(latitude, longitude);
  const params = getCalculationParams(method);
  params.madhab = madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // Calculate additional times
  const imsakTime = new Date(prayerTimes.fajr.getTime() - 10 * 60 * 1000); // 10 min before Fajr

  // Calculate Islamic midnight (midpoint between Maghrib and Fajr of next day)
  const nextDayFajr = new PrayerTimes(coordinates, addDays(date, 1), params).fajr;
  const midnightMs = (prayerTimes.maghrib.getTime() + nextDayFajr.getTime()) / 2;
  const midnightTime = new Date(midnightMs);

  // Last third of the night
  const nightDuration = nextDayFajr.getTime() - prayerTimes.maghrib.getTime();
  const lastThirdTime = new Date(prayerTimes.maghrib.getTime() + (nightDuration * 2) / 3);

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    imsak: imsakTime,
    midnight: midnightTime,
    lastThird: lastThirdTime,
  };
};

// Get the next prayer
export const getNextPrayer = (
  latitude: number,
  longitude: number,
  method: CalculationMethodId = 'MuslimWorldLeague',
  madhab: MadhabId = 'Shafi'
): { name: string; time: Date; timeRemaining: number } | null => {
  const coordinates = new Coordinates(latitude, longitude);
  const params = getCalculationParams(method);
  params.madhab = madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const now = new Date();
  const prayerTimes = new PrayerTimes(coordinates, now, params);
  const nextPrayer = prayerTimes.nextPrayer();

  if (nextPrayer === Prayer.None) {
    // All prayers passed, get Fajr of next day
    const tomorrow = addDays(now, 1);
    const tomorrowPrayers = new PrayerTimes(coordinates, tomorrow, params);
    return {
      name: 'Fajr',
      time: tomorrowPrayers.fajr,
      timeRemaining: differenceInSeconds(tomorrowPrayers.fajr, now),
    };
  }

  const prayerNames: Record<string, string> = {
    [Prayer.Fajr]: 'Fajr',
    [Prayer.Sunrise]: 'Sunrise',
    [Prayer.Dhuhr]: 'Dhuhr',
    [Prayer.Asr]: 'Asr',
    [Prayer.Maghrib]: 'Maghrib',
    [Prayer.Isha]: 'Isha',
    [Prayer.None]: '',
  };

  const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);
  if (!nextPrayerTime) return null;

  return {
    name: prayerNames[nextPrayer],
    time: nextPrayerTime,
    timeRemaining: differenceInSeconds(nextPrayerTime, now),
  };
};

// Calculate Qibla direction
export const calculateQibla = (latitude: number, longitude: number): number => {
  const coordinates = new Coordinates(latitude, longitude);
  return Qibla(coordinates);
};

// Calculate distance to Makkah (Haversine formula)
export const calculateDistanceToMakkah = (latitude: number, longitude: number): number => {
  const makkahLat = 21.4225;
  const makkahLon = 39.8262;

  const R = 6371; // Earth's radius in km
  const dLat = ((makkahLat - latitude) * Math.PI) / 180;
  const dLon = ((makkahLon - longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos((makkahLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Format time to display string
export const formatPrayerTime = (date: Date, use24Hour: boolean = false): string => {
  return format(date, use24Hour ? 'HH:mm' : 'h:mm a');
};

// Format countdown
export const formatCountdown = (seconds: number): string => {
  if (seconds < 0) return '0:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Prayer names with Arabic and Bangla
export const PRAYER_NAMES = {
  Fajr: { en: 'Fajr', ar: 'الفجر', bn: 'ফজর' },
  Sunrise: { en: 'Sunrise', ar: 'الشروق', bn: 'সূর্যোদয়' },
  Dhuhr: { en: 'Dhuhr', ar: 'الظهر', bn: 'যোহর' },
  Asr: { en: 'Asr', ar: 'العصر', bn: 'আসর' },
  Maghrib: { en: 'Maghrib', ar: 'المغرب', bn: 'মাগরিব' },
  Isha: { en: 'Isha', ar: 'العشاء', bn: 'ইশা' },
} as const;
