/**
 * Hijri Calendar Service
 * Uses hijri-converter for accurate Hijri date conversions
 *
 * The Hijri calendar is the Islamic lunar calendar used by Muslims worldwide
 * to determine religious observances and dates.
 */

import { toHijri, toGregorian } from 'hijri-converter';

// Hijri month names
export const HIJRI_MONTHS = {
  1: { en: 'Muharram', ar: 'محرم' },
  2: { en: 'Safar', ar: 'صفر' },
  3: { en: 'Rabi\' al-Awwal', ar: 'ربيع الأول' },
  4: { en: 'Rabi\' al-Thani', ar: 'ربيع الثاني' },
  5: { en: 'Jumada al-Awwal', ar: 'جمادى الأولى' },
  6: { en: 'Jumada al-Thani', ar: 'جمادى الثانية' },
  7: { en: 'Rajab', ar: 'رجب' },
  8: { en: 'Sha\'ban', ar: 'شعبان' },
  9: { en: 'Ramadan', ar: 'رمضان' },
  10: { en: 'Shawwal', ar: 'شوال' },
  11: { en: 'Dhu al-Qi\'dah', ar: 'ذو القعدة' },
  12: { en: 'Dhu al-Hijjah', ar: 'ذو الحجة' },
} as const;

// Arabic weekday names
export const ARABIC_WEEKDAYS = {
  0: 'الأحد', // Sunday
  1: 'الإثنين', // Monday
  2: 'الثلاثاء', // Tuesday
  3: 'الأربعاء', // Wednesday
  4: 'الخميس', // Thursday
  5: 'الجمعة', // Friday
  6: 'السبت', // Saturday
} as const;

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: { en: string; ar: string };
  formatted: string;
  formattedArabic: string;
}

// Convert Gregorian date to Hijri
export const gregorianToHijri = (date: Date): HijriDate => {
  const hijri = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const monthName = HIJRI_MONTHS[hijri.hm as keyof typeof HIJRI_MONTHS];

  return {
    year: hijri.hy,
    month: hijri.hm,
    day: hijri.hd,
    monthName,
    formatted: `${hijri.hd} ${monthName.en} ${hijri.hy} AH`,
    formattedArabic: `${hijri.hd} ${monthName.ar} ${hijri.hy} هـ`,
  };
};

// Convert Hijri date to Gregorian
export const hijriToGregorian = (year: number, month: number, day: number): Date => {
  const gregorian = toGregorian(year, month, day);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
};

// Get Arabic weekday name
export const getArabicWeekday = (date: Date): string => {
  return ARABIC_WEEKDAYS[date.getDay() as keyof typeof ARABIC_WEEKDAYS];
};

// Check if a Hijri date is a White Day (13th, 14th, or 15th of any month)
export const isWhiteDay = (hijriDay: number): boolean => {
  return hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
};

// Get White Days for a given Hijri month
export const getWhiteDays = (hijriYear: number, hijriMonth: number): Date[] => {
  const whiteDays: Date[] = [];

  for (const day of [13, 14, 15]) {
    try {
      const gregorian = toGregorian(hijriYear, hijriMonth, day);
      whiteDays.push(new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd));
    } catch {
      // Day might not exist in some months
    }
  }

  return whiteDays;
};

// Get upcoming White Days from today
export const getUpcomingWhiteDays = (count: number = 3): Array<{
  gregorianDate: Date;
  hijriDate: HijriDate;
}> => {
  const today = new Date();
  const todayHijri = gregorianToHijri(today);
  const result: Array<{ gregorianDate: Date; hijriDate: HijriDate }> = [];

  let currentYear = todayHijri.year;
  let currentMonth = todayHijri.month;

  while (result.length < count) {
    for (const day of [13, 14, 15]) {
      if (result.length >= count) break;

      try {
        const gregorian = toGregorian(currentYear, currentMonth, day);
        const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);

        // Only include future dates
        if (date >= today) {
          result.push({
            gregorianDate: date,
            hijriDate: {
              year: currentYear,
              month: currentMonth,
              day,
              monthName: HIJRI_MONTHS[currentMonth as keyof typeof HIJRI_MONTHS],
              formatted: `${day} ${HIJRI_MONTHS[currentMonth as keyof typeof HIJRI_MONTHS].en} ${currentYear} AH`,
              formattedArabic: `${day} ${HIJRI_MONTHS[currentMonth as keyof typeof HIJRI_MONTHS].ar} ${currentYear} هـ`,
            },
          });
        }
      } catch {
        // Skip invalid dates
      }
    }

    // Move to next month
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return result;
};

// Check if current month is Ramadan
export const isRamadan = (): boolean => {
  const today = new Date();
  const hijri = gregorianToHijri(today);
  return hijri.month === 9;
};

// Get days until Ramadan
export const getDaysUntilRamadan = (): number | null => {
  const today = new Date();
  const hijri = gregorianToHijri(today);

  if (hijri.month === 9) {
    return 0; // Already Ramadan
  }

  // Calculate first day of next Ramadan
  let ramadanYear = hijri.year;
  if (hijri.month >= 9) {
    ramadanYear++;
  }

  const ramadanStart = hijriToGregorian(ramadanYear, 9, 1);
  const diffTime = ramadanStart.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : null;
};
