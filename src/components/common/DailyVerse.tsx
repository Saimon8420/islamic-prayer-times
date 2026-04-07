import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDailyVerse } from '../../data/dailyVerses';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import { getArabicWeekday } from '../../services/hijriService';
import { useHijriDate } from '../../hooks/useHijriDate';

// ── Decorative pieces matching PrayerTimesCard's aesthetic ──

const ArabesqueCorner = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 0L20 10L10 20Z" fill="rgba(200,168,78,0.25)" />
    <path d="M0 0L40 5L35 15L15 35L5 40Z" fill="rgba(200,168,78,0.12)" />
    <path
      d="M40 5L35 15L50 20L60 10Z"
      stroke="rgba(200,168,78,0.2)"
      strokeWidth="0.5"
      fill="rgba(200,168,78,0.06)"
    />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
    <circle cx="20" cy="20" r="6" stroke="rgba(200,168,78,0.15)" strokeWidth="0.5" fill="none" />
  </svg>
);

const HangingLantern = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 30 60" fill="none" className={className}>
    <line x1="15" y1="0" x2="15" y2="12" stroke="rgba(200,168,78,0.4)" strokeWidth="1" />
    <path d="M10 12h10l-1 3H11z" fill="rgba(200,168,78,0.5)" />
    <path
      d="M9 15Q9 10 15 10Q21 10 21 15v18Q21 40 15 44Q9 40 9 33z"
      fill="rgba(200,168,78,0.15)"
      stroke="rgba(200,168,78,0.35)"
      strokeWidth="1"
    />
    <ellipse cx="15" cy="25" rx="4" ry="8" fill="rgba(200,168,78,0.12)" />
  </svg>
);

const TessellationOverlay = () => (
  <div
    className="absolute inset-0 opacity-[0.05] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
    }}
  />
);

export const DailyVerse = () => {
  const { t, language } = useTranslation();
  const verse = useMemo(() => getDailyVerse(), []);
  const { hijriDate } = useHijriDate();
  const location = useStore((s) => s.location);

  const locale = language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US';

  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const arabicWeekday = useMemo(() => getArabicWeekday(today), [today]);
  const translation = language === 'bn' ? verse.translationBn : verse.translation;
  const typeLabel = verse.type === 'ayah' ? t('dailyVerse.ayah') : t('dailyVerse.hadith');

  // Normalize references to "Name-[ref]" form:
  //   "Surah Al-Baqarah 2:152" → "Surah Al-Baqarah-[2:152]"
  //   "Sunan Ibn Majah 2341"   → "Sunan Ibn Majah-[2341]"
  const formattedReference = useMemo(() => {
    const ref = verse.reference.trim();
    const match = ref.match(/^(.*?)\s+(\d[\d:.\-]*)$/);
    if (match) {
      return `${match[1]}-[${match[2]}]`;
    }
    return ref;
  }, [verse]);

  return (
    <div className="islamic-border overflow-hidden fade-in">
      {/* ═══ HEADER — Rich Arabian gradient with decorations ═══ */}
      <div className="islamic-gradient-header relative overflow-hidden">
        <TessellationOverlay />

        {/* Arabesque corners */}
        <ArabesqueCorner className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 opacity-60" />
        <ArabesqueCorner className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 opacity-60 -scale-x-100" />

        {/* Hanging lanterns */}
        <div
          className="absolute top-0 left-[18%] w-3.5 h-7 opacity-40 hidden sm:block"
          style={{ animation: 'lantern-sway 5s ease-in-out infinite' }}
        >
          <HangingLantern className="w-full h-full" />
        </div>
        <div
          className="absolute top-0 right-[18%] w-3 h-6 opacity-30 hidden sm:block"
          style={{ animation: 'lantern-sway 4s ease-in-out infinite 0.5s' }}
        >
          <HangingLantern className="w-full h-full" />
        </div>

        {/* Date row */}
        {location && (
          <div className="relative z-10 px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
            {/* Gregorian — left */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/12 backdrop-blur-sm border border-white/15 text-white shadow-sm">
                <span className="text-sm font-bold">{format(today, 'd')}</span>
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">
                  {today.toLocaleDateString(locale, { weekday: 'long' })}
                </p>
                <p className="text-[10px] text-white/65 truncate">
                  {today.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Type pill — middle */}
            <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide shrink-0 bg-[hsl(40,85%,52%/0.18)] border border-[hsl(40,85%,52%/0.45)] text-[hsl(40,85%,72%)]">
              {typeLabel}
            </span>

            {/* Hijri — right */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0 text-right leading-tight">
                <p className="text-xs sm:text-sm font-semibold text-white arabic-text truncate">
                  {arabicWeekday}
                </p>
                <p className="text-[10px] text-white/65 truncate">
                  {hijriDate.day}{' '}
                  {language === 'ar'
                    ? hijriDate.monthName.ar
                    : language === 'bn'
                    ? hijriDate.monthName.bn
                    : hijriDate.monthName.en}{' '}
                  {hijriDate.year}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(40,85%,52%/0.25)] backdrop-blur-sm border border-[hsl(40,85%,52%/0.4)] text-white shadow-sm">
                <span className="text-sm font-bold">{hijriDate.day}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ VERSE CONTENT — translucent so SkyBackground shows through ═══ */}
      <div className="relative px-4 py-3 text-center">
        {/* Subtle arabesque corner */}
        <div className="absolute top-1 right-1 w-10 h-10 opacity-20 pointer-events-none">
          <svg viewBox="0 0 50 50" fill="rgba(200,168,78,0.5)">
            <path d="M25 5L28 15L38 12L32 20L45 25L32 30L38 38L28 35L25 45L22 35L12 38L18 30L5 25L18 20L12 12L22 15Z" />
          </svg>
        </div>

        <p
          className="relative text-sm sm:text-base leading-relaxed text-foreground arabic-text px-1"
          dir="rtl"
        >
          {verse.arabic}
        </p>

        <p className="relative text-[11px] sm:text-xs text-muted-foreground italic px-1 mt-1">
          &ldquo;{translation}&rdquo;{' '}
          <span className="not-italic font-semibold text-[hsl(40,85%,32%)] dark:text-[hsl(40,80%,65%)]">
            — {formattedReference}
          </span>
          <span className="sm:hidden ml-2 text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide bg-[hsl(40,85%,52%/0.15)] border border-[hsl(40,85%,52%/0.35)] text-[hsl(40,85%,32%)] dark:text-[hsl(40,80%,65%)]">
            {typeLabel}
          </span>
        </p>
      </div>

      <div className="gold-border-strip" />
    </div>
  );
};
