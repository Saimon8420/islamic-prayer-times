import { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import {
  hijriToGregorian,
  isWhiteDay,
  HIJRI_MONTHS,
} from '../../services/hijriService';
import { useHijriDate } from '../../hooks/useHijriDate';

// Laylatul Qadr candidate nights — last 10 odd nights of Ramadan
const LAYLATUL_QADR_NIGHTS = [21, 23, 25, 27, 29];

type SpecialDay = 'eidUlFitr' | 'eidUlAdha' | 'arafah' | 'tashriq' | 'laylatulQadr' | null;

function getSpecialDay(month: number, day: number): SpecialDay {
  if (month === 10 && day === 1) return 'eidUlFitr';
  if (month === 12 && day === 9) return 'arafah';
  if (month === 12 && day === 10) return 'eidUlAdha';
  if (month === 12 && day >= 11 && day <= 13) return 'tashriq';
  if (month === 9 && LAYLATUL_QADR_NIGHTS.includes(day)) return 'laylatulQadr';
  return null;
}

// Gold highlight for today, emerald tints for Islamic occasions.
function getSpecialDayStyle(special: SpecialDay, isToday: boolean): string {
  if (isToday) return 'border border-primary bg-primary/15 ring-1 ring-primary/40';
  switch (special) {
    case 'eidUlFitr':
    case 'eidUlAdha':
    case 'arafah':
    case 'laylatulQadr':
      return 'border border-secondary/40 bg-secondary/[0.10]';
    case 'tashriq':
      return 'border border-secondary/25 bg-secondary/[0.06]';
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

export function HijriCalendar() {
  const { t } = useTranslation();
  const language = useStore((state) => state.language);

  const { hijriDate: todayHijri } = useHijriDate();
  const hijriAdjustment = useStore((state) => state.hijriAdjustment);

  const [hijriYear, setHijriYear] = useState(todayHijri.year);
  const [hijriMonth, setHijriMonth] = useState(todayHijri.month);

  const isCurrentMonth = hijriYear === todayHijri.year && hijriMonth === todayHijri.month;
  const isRamadan = hijriMonth === 9;

  const monthName = HIJRI_MONTHS[hijriMonth as keyof typeof HIJRI_MONTHS];
  const displayMonthName = language === 'ar' ? monthName.ar : language === 'bn' ? monthName.bn : monthName.en;

  const weekdayKeys = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;
  const weekdays = weekdayKeys.map((key) => t(`hijriCalendar.weekdays.${key}`));

  const calendarDays = useMemo(() => {
    const days: Array<{
      hijriDay: number;
      gregorianDate: Date;
      isToday: boolean;
      isWhite: boolean;
      isFriday: boolean;
      special: SpecialDay;
    }> = [];

    const today = new Date();

    for (let day = 1; day <= 30; day++) {
      try {
        const gregDate = hijriToGregorian(hijriYear, hijriMonth, day);
        // Shift gregorian date to match hijri adjustment
        // e.g. adjustment=-1 means local calendar is 1 day behind,
        // so each hijri day maps to 1 day later in gregorian
        if (hijriAdjustment !== 0) {
          gregDate.setDate(gregDate.getDate() - hijriAdjustment);
        }

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
  }, [hijriYear, hijriMonth, hijriAdjustment]);

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

  const specialDaysInMonth = calendarDays.filter((d) => d.special !== null);

  return (
    <div className="space-y-4">
      {/* ═══════════════════════════════════════════
          HEADER — clean observatory panel
          ═══════════════════════════════════════════ */}
      <Card className="fade-in">
        {/* faint heritage watermark, top-right */}
        <div className="girih-watermark pointer-events-none absolute right-3 top-3 h-16 w-16 sm:h-20 sm:w-20" />

        <div className="relative flex items-center gap-2.5 p-4 sm:gap-3 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-secondary/25 bg-secondary/[0.08] text-secondary sm:h-10 sm:w-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M8 2v4M16 2v4" strokeLinecap="round" />
              <path d="M16 14.4a4 4 0 1 1-3.2-3.9 3 3 0 0 0 3.2 3.9z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="label-mono">{t('hijriCalendar.title')}</p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{t('hijriCalendar.subtitle')}</p>
          </div>
          {isRamadan && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-2.5 py-1 text-primary">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 sm:h-3.5 sm:w-3.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span className="label-mono !text-primary">{t('hijriCalendar.ramadan')}</span>
            </span>
          )}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════
          CALENDAR BODY — single obs-panel
          ═══════════════════════════════════════════ */}
      <Card className="fade-in">
        {/* ── Month Navigation ── */}
        <CardContent className="px-3 pt-3 pb-0 sm:px-5 sm:pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground sm:h-10 sm:w-10"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="text-center">
              <h3 className="font-display text-base font-semibold sm:text-lg">
                {displayMonthName}
              </h3>
              <p className="label-mono mt-0.5">{hijriYear} AH</p>
            </div>

            <button
              onClick={goToNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground sm:h-10 sm:w-10"
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="mt-2 w-full rounded-lg bg-primary/[0.08] py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 sm:mt-3 sm:text-sm"
            >
              {t('hijriCalendar.jumpToToday')}
            </button>
          )}
        </CardContent>

        {/* ── Special Days Banner ── */}
        {specialDaysInMonth.length > 0 && (
          <div className="px-3 pt-3 sm:px-5">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {specialDaysInMonth.map((d) => {
                const label = d.special ? t(SPECIAL_DAY_KEYS[d.special]) : null;
                return (
                  <span
                    key={d.hijriDay}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-1 sm:text-xs"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary sm:h-2 sm:w-2" />
                    {label}{' '}
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {d.hijriDay} {displayMonthName}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Calendar Grid ── */}
        <div className="px-2 pb-1 pt-3 sm:px-4">
          {/* Weekday Headers */}
          <div className="mb-1.5 grid grid-cols-7 gap-1 overflow-hidden rounded-lg border border-border bg-muted/40 sm:mb-2 sm:gap-1.5">
            {weekdays.map((day, i) => (
              <div
                key={i}
                className={`py-1.5 text-center font-mono text-[10px] uppercase tracking-wider sm:py-2 sm:text-xs ${
                  i === 6
                    ? 'bg-primary/[0.08] text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map((day) => {
              const colIndex = (firstDayOfWeek + day.hijriDay - 1) % 7;
              const isFridayCol = colIndex === 6;

              const specialStyle = getSpecialDayStyle(day.special, day.isToday);

              let cellClass: string;
              if (day.isToday) {
                cellClass = 'border border-primary bg-primary/15 ring-1 ring-primary/40';
              } else if (day.special) {
                cellClass = specialStyle;
              } else if (day.isWhite) {
                cellClass = 'border border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30';
              } else if (isFridayCol) {
                cellClass = 'border border-transparent bg-primary/[0.05]';
              } else {
                cellClass = 'border border-transparent hover:border-border hover:bg-muted/40';
              }

              return (
                <div
                  key={day.hijriDay}
                  className={`relative flex min-h-[2.8rem] flex-col items-center justify-center rounded-lg p-1 transition-colors sm:min-h-[3.5rem] sm:p-1.5 ${cellClass}`}
                  title={day.special ? t(SPECIAL_DAY_KEYS[day.special]) : undefined}
                >
                  <span className={`font-mono text-sm font-semibold leading-none tabular-nums sm:text-base ${day.isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day.hijriDay}
                  </span>
                  <span className={`mt-0.5 font-mono text-[8px] leading-none tabular-nums sm:mt-1 sm:text-[10px] ${day.isToday ? 'text-primary/70' : 'text-muted-foreground/60'}`}>
                    {formatGregorianShort(day.gregorianDate)}
                  </span>
                  {!day.isToday && day.special && (
                    <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-secondary sm:h-1.5 sm:w-1.5" />
                  )}
                  {!day.isToday && !day.special && day.isWhite && (
                    <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-amber-400 sm:h-1.5 sm:w-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="mx-3 my-2 sm:mx-5">
          <div className="border-t border-border" />
        </div>
        <div className="px-3 pb-3 sm:px-5 sm:pb-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] sm:gap-x-4 sm:gap-y-2 sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 shrink-0 rounded border border-primary bg-primary/15 sm:h-4 sm:w-4" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.today')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 shrink-0 rounded border border-secondary/40 bg-secondary/[0.10] sm:h-4 sm:w-4" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.eidUlFitr')} / {t('hijriCalendar.eidUlAdha')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 shrink-0 rounded border border-secondary/40 bg-secondary/[0.10] sm:h-4 sm:w-4" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.dayOfArafah')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 shrink-0 rounded border border-secondary/25 bg-secondary/[0.06] sm:h-4 sm:w-4" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.tashriq')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 shrink-0 rounded border border-secondary/40 bg-secondary/[0.10] sm:h-4 sm:w-4" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.laylatulQadr')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 shrink-0 rounded border border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 sm:h-4 sm:w-4" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.whiteDay')} (13, 14, 15)</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 shrink-0 rounded border border-primary/20 bg-primary/[0.05] sm:h-4 sm:w-4" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.weekdays.fri')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
