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

  const hijriAdjustment = useStore((state) => state.hijriAdjustment);
  const todayHijri = useMemo(() => gregorianToHijri(new Date(), hijriAdjustment), [hijriAdjustment]);

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
      {/* Header — Arabian/Mamluk style */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div
          className="relative p-6 text-white text-center overflow-hidden"
          style={{
            background: isRamadan
              ? 'linear-gradient(135deg, hsl(38,75%,28%) 0%, hsl(40,80%,36%) 40%, hsl(35,70%,26%) 100%)'
              : 'linear-gradient(135deg, hsl(158,50%,18%) 0%, hsl(160,45%,24%) 40%, hsl(155,50%,16%) 100%)',
          }}
        >
          {/* Arabesque border glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            border: '1.5px solid rgba(200,168,78,0.2)',
            boxShadow: 'inset 0 0 40px rgba(200,168,78,0.08)',
          }} />

          {/* Tessellation pattern */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.8'%3E%3Cpath d='M30 0L45 15L30 30L15 15Z'/%3E%3Cpath d='M0 30L15 45L0 60L-15 45Z'/%3E%3Cpath d='M60 30L75 45L60 60L45 45Z'/%3E%3Ccircle cx='30' cy='30' r='5'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          {/* Arabesque corner ornaments */}
          <svg className="absolute top-0 left-0 pointer-events-none" viewBox="0 0 80 80" fill="none" width="70" height="70">
            <path d="M0 0Q20 0 40 20Q60 0 80 0L80 10Q60 10 45 25Q55 35 55 50Q55 65 40 80L30 80Q45 65 45 50Q45 35 35 25Q20 10 0 10Z" fill="rgba(200,168,78,0.12)" />
            <circle cx="40" cy="20" r="2" fill="rgba(200,168,78,0.15)" />
          </svg>
          <svg className="absolute bottom-0 right-0 rotate-180 pointer-events-none" viewBox="0 0 80 80" fill="none" width="70" height="70">
            <path d="M0 0Q20 0 40 20Q60 0 80 0L80 10Q60 10 45 25Q55 35 55 50Q55 65 40 80L30 80Q45 65 45 50Q45 35 35 25Q20 10 0 10Z" fill="rgba(200,168,78,0.12)" />
            <circle cx="40" cy="20" r="2" fill="rgba(200,168,78,0.15)" />
          </svg>

          {/* Hanging lanterns */}
          <svg className="absolute top-0 left-[12%] pointer-events-none hidden sm:block" style={{ animation: 'lantern-sway 5s ease-in-out infinite' }} viewBox="0 0 28 55" fill="none" width="18" height="36">
            <line x1="14" y1="0" x2="14" y2="10" stroke="rgba(200,168,78,0.4)" strokeWidth="0.8" />
            <path d="M9 10h10l-1 3H10z" fill="rgba(200,168,78,0.5)" />
            <path d="M8 13Q8 9 14 9Q20 9 20 13v16Q20 36 14 40Q8 36 8 29z" fill="rgba(200,168,78,0.12)" stroke="rgba(200,168,78,0.3)" strokeWidth="0.8" />
            <ellipse cx="14" cy="22" rx="3.5" ry="7" fill="rgba(255,220,120,0.1)" />
            <path d="M12 38l2 5 2-5" fill="rgba(200,168,78,0.3)" />
          </svg>
          <svg className="absolute top-0 right-[15%] pointer-events-none hidden sm:block" style={{ animation: 'lantern-sway 5s ease-in-out infinite', animationDelay: '1.2s' }} viewBox="0 0 28 55" fill="none" width="16" height="32">
            <line x1="14" y1="0" x2="14" y2="10" stroke="rgba(200,168,78,0.4)" strokeWidth="0.8" />
            <path d="M9 10h10l-1 3H10z" fill="rgba(200,168,78,0.5)" />
            <path d="M8 13Q8 9 14 9Q20 9 20 13v16Q20 36 14 40Q8 36 8 29z" fill="rgba(200,168,78,0.12)" stroke="rgba(200,168,78,0.3)" strokeWidth="0.8" />
            <ellipse cx="14" cy="22" rx="3.5" ry="7" fill="rgba(255,220,120,0.1)" />
            <path d="M12 38l2 5 2-5" fill="rgba(200,168,78,0.3)" />
          </svg>

          {/* Crescent with star */}
          <svg className="absolute top-2 right-3 pointer-events-none" style={{ animation: 'float 6s ease-in-out infinite' }} viewBox="0 0 50 50" fill="none" width="40" height="40">
            <path d="M30 8a16 16 0 1 0 0 28 12 12 0 0 1 0-28z" fill="rgba(200,168,78,0.12)" />
            <polygon points="42,15 43.5,19 48,19 44.5,22 46,26 42,23.5 38,26 39.5,22 36,19 40.5,19" fill="rgba(200,168,78,0.15)" />
          </svg>

          {/* Twinkling star dots */}
          <svg className="absolute top-4 left-[30%] w-1.5 h-1.5 pointer-events-none" style={{ animation: 'twinkle 2.5s ease-in-out infinite' }} viewBox="0 0 8 8" fill="rgba(200,168,78,0.45)"><circle cx="4" cy="4" r="2" /></svg>
          <svg className="absolute top-3 right-[40%] w-1 h-1 pointer-events-none" style={{ animation: 'twinkle 3s ease-in-out infinite 0.7s' }} viewBox="0 0 8 8" fill="rgba(200,168,78,0.35)"><circle cx="4" cy="4" r="2" /></svg>

          {/* 8-pointed star accents */}
          <svg className="absolute top-3 left-[20%] pointer-events-none" viewBox="0 0 24 24" width="8" height="8" fill="rgba(200,168,78,0.18)">
            <path d="M12 0l2.5 7.5L22 7.5l-5.5 4L19 19l-7-4.5L5 19l2.5-7.5L2 7.5l7.5 0z" />
          </svg>
          <svg className="absolute bottom-4 right-[25%] pointer-events-none" viewBox="0 0 24 24" width="10" height="10" fill="rgba(200,168,78,0.12)">
            <path d="M12 0l2.5 7.5L22 7.5l-5.5 4L19 19l-7-4.5L5 19l2.5-7.5L2 7.5l7.5 0z" />
          </svg>

          {/* Mosque silhouette at bottom */}
          <svg className="absolute bottom-0 left-[5%] pointer-events-none opacity-[0.06]" viewBox="0 0 120 40" fill="white" width="110" height="35">
            <rect x="5" y="16" width="4" height="24" />
            <polygon points="7,8 10,16 4,16" />
            <circle cx="7" cy="7" r="1.5" />
            <ellipse cx="35" cy="20" rx="18" ry="13" />
            <rect x="33" y="7" width="4" height="7" rx="1" />
            <rect x="58" y="18" width="4" height="22" />
            <polygon points="60,10 63,18 57,18" />
            <circle cx="60" cy="9" r="1.2" />
            <ellipse cx="85" cy="25" rx="12" ry="10" />
            <rect x="83" y="15" width="3" height="6" rx="1" />
            <rect x="105" y="20" width="3" height="20" />
            <polygon points="106.5,12 109,20 104,20" />
          </svg>

          {/* Content */}
          <div className="relative z-10">
            {/* Calligraphic icon */}
            <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{
              background: 'rgba(200,168,78,0.12)',
              border: '1px solid rgba(200,168,78,0.2)',
              boxShadow: '0 0 20px rgba(200,168,78,0.08)',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.8)" strokeWidth="1.5" className="w-7 h-7">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M8 2v4M16 2v4" strokeLinecap="round" />
                <path d="M16 14.4a4 4 0 1 1-3.2-3.9 3 3 0 0 0 3.2 3.9z" fill="rgba(200,168,78,0.3)" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold drop-shadow-sm">{t('hijriCalendar.title')}</h2>
            <p className="text-sm text-white/70 mt-1">{t('hijriCalendar.subtitle')}</p>

            {isRamadan && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{
                background: 'rgba(200,168,78,0.15)',
                border: '1px solid rgba(200,168,78,0.25)',
              }}>
                <svg viewBox="0 0 24 24" fill="rgba(200,168,78,0.8)" className="w-4 h-4">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                {t('hijriCalendar.ramadan')}
              </div>
            )}
          </div>
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
