import { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import {
  gregorianToHijri,
  hijriToGregorian,
  isWhiteDay,
  HIJRI_MONTHS,
} from '../../services/hijriService';

// Laylatul Qadr candidate nights — last 10 odd nights of Ramadan
const LAYLATUL_QADR_NIGHTS = [21, 23, 25, 27, 29];

type SpecialDay = 'eidUlFitr' | 'eidUlAdha' | 'arafah' | 'tashriq' | 'laylatulQadr' | null;

function getSpecialDay(month: number, day: number): SpecialDay {
  // Eid ul-Fitr: 1 Shawwal
  if (month === 10 && day === 1) return 'eidUlFitr';
  // Day of Arafah: 9 Dhul Hijjah
  if (month === 12 && day === 9) return 'arafah';
  // Eid ul-Adha: 10 Dhul Hijjah
  if (month === 12 && day === 10) return 'eidUlAdha';
  // Days of Tashriq: 11, 12, 13 Dhul Hijjah
  if (month === 12 && day >= 11 && day <= 13) return 'tashriq';
  // Laylatul Qadr: odd nights of last 10 days of Ramadan
  if (month === 9 && LAYLATUL_QADR_NIGHTS.includes(day)) return 'laylatulQadr';
  return null;
}

function getSpecialDayStyle(special: SpecialDay, isToday: boolean): string {
  if (isToday) return 'islamic-gradient text-white shadow-md scale-105';
  switch (special) {
    case 'eidUlFitr':
    case 'eidUlAdha':
      return 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-300 dark:ring-emerald-700';
    case 'arafah':
      return 'bg-violet-100 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700';
    case 'tashriq':
      return 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800';
    case 'laylatulQadr':
      return 'bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-600';
    default:
      return '';
  }
}

const SPECIAL_DAY_KEYS = {
  eidUlFitr: 'hijriCalendar.eidUlFitr',
  eidUlAdha: 'hijriCalendar.eidUlAdha',
  arafah: 'hijriCalendar.dayOfArafah',
  tashriq: 'hijriCalendar.tashriq',
  laylatulQadr: 'hijriCalendar.laylatulQadr',
} as const;

function getSpecialDayDot(special: SpecialDay): string {
  switch (special) {
    case 'eidUlFitr':
    case 'eidUlAdha':
      return 'bg-emerald-500';
    case 'arafah':
      return 'bg-violet-500';
    case 'tashriq':
      return 'bg-emerald-400';
    case 'laylatulQadr':
      return 'bg-indigo-500';
    default:
      return '';
  }
}

export function HijriCalendar() {
  const { t } = useTranslation();
  const language = useStore((state) => state.language);

  const todayHijri = useMemo(() => gregorianToHijri(new Date()), []);

  const [hijriYear, setHijriYear] = useState(todayHijri.year);
  const [hijriMonth, setHijriMonth] = useState(todayHijri.month);

  const isCurrentMonth = hijriYear === todayHijri.year && hijriMonth === todayHijri.month;
  const isRamadan = hijriMonth === 9;

  const monthName = HIJRI_MONTHS[hijriMonth as keyof typeof HIJRI_MONTHS];
  const displayMonthName = language === 'ar' ? monthName.ar : language === 'bn' ? monthName.bn : monthName.en;

  // Weekday headers (Sat–Fri, Islamic week starts Saturday)
  const weekdayKeys = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;
  const weekdays = weekdayKeys.map((key) => t(`hijriCalendar.weekdays.${key}`));

  // Build grid data
  const calendarDays = useMemo(() => {
    const days: Array<{
      hijriDay: number;
      gregorianDate: Date;
      isToday: boolean;
      isWhite: boolean;
      isFriday: boolean;
      special: SpecialDay;
    }> = [];

    for (let day = 1; day <= 30; day++) {
      try {
        const gregDate = hijriToGregorian(hijriYear, hijriMonth, day);
        const today = new Date();
        const isToday =
          gregDate.getFullYear() === today.getFullYear() &&
          gregDate.getMonth() === today.getMonth() &&
          gregDate.getDate() === today.getDate();

        days.push({
          hijriDay: day,
          gregorianDate: gregDate,
          isToday,
          isWhite: isWhiteDay(day),
          isFriday: gregDate.getDay() === 5,
          special: getSpecialDay(hijriMonth, day),
        });
      } catch {
        break;
      }
    }

    return days;
  }, [hijriYear, hijriMonth]);

  // Grid offset: empty cells before day 1 (Sat=0 in our grid)
  const firstDayOfWeek = calendarDays.length > 0
    ? (calendarDays[0].gregorianDate.getDay() + 1) % 7
    : 0;

  const goToPrevMonth = () => {
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear((y) => y - 1);
    } else {
      setHijriMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear((y) => y + 1);
    } else {
      setHijriMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setHijriYear(todayHijri.year);
    setHijriMonth(todayHijri.month);
  };

  const formatGregorianShort = (date: Date) => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    return `${d}/${m}`;
  };

  // Check if current viewed month has any special days
  const specialDaysInMonth = calendarDays.filter((d) => d.special !== null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className={`p-6 text-white text-center ${isRamadan ? 'islamic-gradient-gold' : 'islamic-gradient'}`}>
          <h2 className="text-2xl font-bold">{t('hijriCalendar.title')}</h2>
          <p className="text-sm opacity-90 mt-1">{t('hijriCalendar.subtitle')}</p>
          {isRamadan && (
            <p className="text-sm font-semibold mt-2 animate-pulse">
              🌙 {t('hijriCalendar.ramadan')}
            </p>
          )}
        </div>
      </Card>

      {/* Month Navigation */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="text-center">
              <h3 className="text-lg font-bold">{displayMonthName}</h3>
              <p className="text-sm text-muted-foreground">{hijriYear} AH</p>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="mt-3 w-full text-sm py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
            >
              {t('hijriCalendar.jumpToToday')}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Special Days Banner (if any in current month) */}
      {specialDaysInMonth.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {specialDaysInMonth.map((d) => {
                const label = d.special ? t(SPECIAL_DAY_KEYS[d.special]) : null;
                const dotColor = getSpecialDayDot(d.special);
                return (
                  <span
                    key={d.hijriDay}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-muted"
                  >
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    {label} — {d.hijriDay} {displayMonthName}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Grid */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map((day, i) => (
              <div
                key={i}
                className={`text-center text-xs font-semibold py-1.5 rounded ${
                  i === 6 ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty offset cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {calendarDays.map((day) => {
              const colIndex = (firstDayOfWeek + day.hijriDay - 1) % 7;
              const isFridayCol = colIndex === 6;

              const specialStyle = getSpecialDayStyle(day.special, day.isToday);

              let cellClass: string;
              if (day.isToday) {
                cellClass = 'islamic-gradient text-white shadow-md scale-105';
              } else if (day.special) {
                cellClass = specialStyle;
              } else if (day.isWhite) {
                cellClass = 'bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700';
              } else if (isFridayCol) {
                cellClass = 'bg-primary/5 dark:bg-primary/10';
              } else {
                cellClass = 'hover:bg-muted/50';
              }

              return (
                <div
                  key={day.hijriDay}
                  className={`relative flex flex-col items-center justify-center rounded-lg p-1.5 min-h-[3.5rem] transition-all ${cellClass}`}
                  title={day.special ? t(SPECIAL_DAY_KEYS[day.special]) : undefined}
                >
                  <span className={`text-base font-bold leading-none ${day.isToday ? 'text-white' : ''}`}>
                    {day.hijriDay}
                  </span>
                  <span className={`text-[10px] leading-none mt-1 ${day.isToday ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {formatGregorianShort(day.gregorianDate)}
                  </span>
                  {/* Dot indicators for special days (not today) */}
                  {!day.isToday && day.special && (
                    <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${getSpecialDayDot(day.special)}`} />
                  )}
                  {!day.isToday && !day.special && day.isWhite && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded islamic-gradient" />
              <span>{t('hijriCalendar.today')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-400 dark:border-emerald-600" />
              <span>{t('hijriCalendar.eidUlFitr')} / {t('hijriCalendar.eidUlAdha')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-violet-100 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700" />
              <span>{t('hijriCalendar.dayOfArafah')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" />
              <span>{t('hijriCalendar.tashriq')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-600" />
              <span>{t('hijriCalendar.laylatulQadr')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" />
              <span>{t('hijriCalendar.whiteDay')} (13, 14, 15)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/5 dark:bg-primary/10 border border-primary/20" />
              <span>{t('hijriCalendar.weekdays.fri')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
