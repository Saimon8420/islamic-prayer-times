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

function getSpecialDayStyle(special: SpecialDay, isToday: boolean): string {
  if (isToday) return 'islamic-gradient text-white shadow-md ring-2 ring-primary/30';
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

/* ═══════════════════════════════════════════
   DECORATIVE COMPONENTS
   ═══════════════════════════════════════════ */

const ArabesqueCorner = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 0L20 10L10 20Z" fill="rgba(200,168,78,0.25)" />
    <path d="M0 0L40 5L35 15L15 35L5 40Z" fill="rgba(200,168,78,0.12)" />
    <path d="M40 5L35 15L50 20L60 10Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <path d="M5 40L15 35L20 50L10 60Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
    <circle cx="20" cy="20" r="6" stroke="rgba(200,168,78,0.15)" strokeWidth="0.5" fill="none" />
  </svg>
);

const HangingLantern = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 30 60" fill="none" className={className}>
    <line x1="15" y1="0" x2="15" y2="12" stroke="rgba(200,168,78,0.4)" strokeWidth="1" />
    <path d="M10 12h10l-1 3H11z" fill="rgba(200,168,78,0.5)" />
    <path d="M9 15Q9 10 15 10Q21 10 21 15v18Q21 40 15 44Q9 40 9 33z" fill="rgba(200,168,78,0.15)" stroke="rgba(200,168,78,0.35)" strokeWidth="1" />
    <ellipse cx="15" cy="25" rx="4" ry="8" fill="rgba(200,168,78,0.12)" />
  </svg>
);

const TessellationOverlay = () => (
  <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Cpath d='M30 30L37.5 37.5L30 45L22.5 37.5Z'/%3E%3Cpath d='M30 45L37.5 52.5L30 60L22.5 52.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
  }} />
);

// Ornamental star divider
const StarDivider = () => (
  <div className="flex items-center my-1 sm:my-2 px-2 sm:px-4">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(40,70%,50%,0.25)]" />
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 sm:w-3 sm:h-3 mx-2 text-[hsl(40,85%,52%)] opacity-25">
      <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(40,70%,50%,0.25)]" />
  </div>
);

export function HijriCalendar() {
  const { t } = useTranslation();
  const language = useStore((state) => state.language);

  const { hijriDate: todayHijri } = useHijriDate();

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
          HEADER — Arabian/Mamluk style
          ═══════════════════════════════════════════ */}
      <Card className="islamic-border overflow-hidden">
        <div
          className="relative px-4 py-3 sm:px-5 sm:py-4 text-white overflow-hidden"
          style={{
            background: isRamadan
              ? 'linear-gradient(135deg, hsl(38,75%,28%) 0%, hsl(40,80%,36%) 40%, hsl(35,70%,26%) 100%)'
              : 'linear-gradient(135deg, hsl(158,50%,18%) 0%, hsl(160,45%,24%) 40%, hsl(155,50%,16%) 100%)',
          }}
        >
          <TessellationOverlay />

          {/* Arabesque corners */}
          <ArabesqueCorner className="absolute top-0 left-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50" />
          <ArabesqueCorner className="absolute top-0 right-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50 -scale-x-100" />

          {/* Hanging lantern */}
          <div className="absolute top-0 right-[12%] w-3 h-6 sm:w-4 sm:h-8 opacity-30 hidden sm:block" style={{ animation: 'lantern-sway 4.5s ease-in-out infinite' }}>
            <HangingLantern className="w-full h-full" />
          </div>

          {/* Crescent */}
          <div className="absolute -top-3 -right-3 w-14 h-14 sm:w-20 sm:h-20 opacity-[0.06] pointer-events-none">
            <svg viewBox="0 0 100 100" fill="#c8a84e">
              <path d="M70 15 A35 35 0 1 0 70 85 A28 28 0 1 1 70 15" />
              <polygon points="78,42 81,50 90,50 83,55 86,64 78,58 70,64 73,55 66,50 75,50" />
            </svg>
          </div>

          {/* Mosque skyline */}
          <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 pointer-events-none">
            <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="w-full h-full" fill="white" fillOpacity="0.05">
              <path d="M0,40 L0,30 L20,30 L20,20 L22,10 L24,20 L24,30 L60,30 Q70,30 75,25 Q85,12 95,25 Q100,30 110,30 L140,30 L140,22 L142,12 L144,22 L144,30 L200,30 L210,26 Q220,18 230,26 L240,30 L280,30 L280,20 L282,8 L284,20 L284,30 L340,30 Q350,30 355,25 Q370,10 385,25 Q390,30 400,30 L440,30 L440,22 L442,10 L444,22 L444,30 L500,30 L510,26 Q520,16 530,26 L540,30 L570,30 Q580,30 585,25 Q595,14 600,25 L600,40 Z" />
            </svg>
          </div>

          {/* Content — compact horizontal layout */}
          <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0" style={{
              background: 'rgba(200,168,78,0.12)',
              border: '1px solid rgba(200,168,78,0.2)',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.8)" strokeWidth="1.5" className="w-4.5 h-4.5 sm:w-5 sm:h-5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M8 2v4M16 2v4" strokeLinecap="round" />
                <path d="M16 14.4a4 4 0 1 1-3.2-3.9 3 3 0 0 0 3.2 3.9z" fill="rgba(200,168,78,0.3)" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">{t('hijriCalendar.title')}</h2>
              <p className="text-[10px] sm:text-xs text-white/60 leading-tight">{t('hijriCalendar.subtitle')}</p>
            </div>
            {isRamadan && (
              <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shrink-0" style={{
                background: 'rgba(200,168,78,0.15)',
                border: '1px solid rgba(200,168,78,0.25)',
              }}>
                <svg viewBox="0 0 24 24" fill="rgba(200,168,78,0.8)" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                {t('hijriCalendar.ramadan')}
              </div>
            )}
          </div>
        </div>

        {/* Gold border strip */}
        <div className="gold-border-strip" />
      </Card>

      {/* ═══════════════════════════════════════════
          CALENDAR BODY — Single card with all sections
          ═══════════════════════════════════════════ */}
      <Card className="islamic-border overflow-hidden fade-in relative">
        {/* Arabesque corner watermark */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#996b2f" stroke="#996b2f" strokeWidth="0.5">
            <path d="M50 5L60 20L77 10L70 28L90 25L78 40L95 50L78 60L90 75L70 72L77 90L60 80L50 95L40 80L23 90L30 72L10 75L22 60L5 50L22 40L10 25L30 28L23 10L40 20Z" />
            <circle cx="50" cy="50" r="15" fill="none" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 opacity-[0.02] pointer-events-none rotate-[22.5deg]">
          <svg viewBox="0 0 100 100" fill="#996b2f">
            <path d="M50 5L60 20L77 10L70 28L90 25L78 40L95 50L78 60L90 75L70 72L77 90L60 80L50 95L40 80L23 90L30 72L10 75L22 60L5 50L22 40L10 25L30 28L23 10L40 20Z" />
          </svg>
        </div>

        {/* ── Month Navigation ── */}
        <CardContent className="px-3 sm:px-5 pt-3 sm:pt-4 pb-0">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevMonth}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="text-center">
              <h3 className="text-base sm:text-lg font-bold flex items-center justify-center gap-2">
                {displayMonthName}
                <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[hsl(40,85%,52%)] opacity-40">
                  <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
                </svg>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground/60">{hijriYear} AH</p>
            </div>

            <button
              onClick={goToNextMonth}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="mt-2 sm:mt-3 w-full text-xs sm:text-sm py-1.5 rounded-lg bg-primary/8 text-primary hover:bg-primary/15 transition-colors font-semibold"
            >
              {t('hijriCalendar.jumpToToday')}
            </button>
          )}
        </CardContent>

        {/* ── Special Days Banner ── */}
        {specialDaysInMonth.length > 0 && (
          <>
            <StarDivider />
            <div className="px-3 sm:px-5">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {specialDaysInMonth.map((d) => {
                  const label = d.special ? t(SPECIAL_DAY_KEYS[d.special]) : null;
                  const dotColor = getSpecialDayDot(d.special);
                  return (
                    <span
                      key={d.hijriDay}
                      className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-muted/60"
                    >
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dotColor}`} />
                      {label} — {d.hijriDay} {displayMonthName}
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Calendar Grid ── */}
        <StarDivider />
        <div className="px-2 sm:px-4 pb-1">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 rounded-lg overflow-hidden bg-muted/50 dark:bg-muted/30 border border-border/40">
            {weekdays.map((day, i) => (
              <div
                key={i}
                className={`text-center text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 uppercase tracking-wider ${
                  i === 6
                    ? 'text-primary bg-primary/8 dark:bg-primary/12'
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
                cellClass = 'islamic-gradient text-white shadow-md ring-2 ring-primary/30';
              } else if (day.special) {
                cellClass = specialStyle;
              } else if (day.isWhite) {
                cellClass = 'bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700';
              } else if (isFridayCol) {
                cellClass = 'bg-primary/5 dark:bg-primary/10';
              } else {
                cellClass = 'hover:bg-muted/40';
              }

              return (
                <div
                  key={day.hijriDay}
                  className={`relative flex flex-col items-center justify-center rounded-lg p-1 sm:p-1.5 min-h-[2.8rem] sm:min-h-[3.5rem] transition-all ${cellClass}`}
                  title={day.special ? t(SPECIAL_DAY_KEYS[day.special]) : undefined}
                >
                  <span className={`text-sm sm:text-base font-bold leading-none ${day.isToday ? 'text-white' : ''}`}>
                    {day.hijriDay}
                  </span>
                  <span className={`text-[8px] sm:text-[10px] leading-none mt-0.5 sm:mt-1 ${day.isToday ? 'text-white/80' : 'text-muted-foreground/60'}`}>
                    {formatGregorianShort(day.gregorianDate)}
                  </span>
                  {!day.isToday && day.special && (
                    <span className={`absolute top-0.5 right-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getSpecialDayDot(day.special)}`} />
                  )}
                  {!day.isToday && !day.special && day.isWhite && (
                    <span className="absolute top-0.5 right-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Legend ── */}
        <StarDivider />
        <div className="px-3 sm:px-5 pb-3 sm:pb-4">
          <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded islamic-gradient shrink-0" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.today')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-400 dark:border-emerald-600 shrink-0" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.eidUlFitr')} / {t('hijriCalendar.eidUlAdha')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-violet-100 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700 shrink-0" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.dayOfArafah')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 shrink-0" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.tashriq')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-600 shrink-0" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.laylatulQadr')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 shrink-0" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.whiteDay')} (13, 14, 15)</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-primary/5 dark:bg-primary/10 border border-primary/20 shrink-0" />
              <span className="text-muted-foreground/70">{t('hijriCalendar.weekdays.fri')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
