import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import { getArabicWeekday } from '../../services/hijriService';
import { useHijriDate } from '../../hooks/useHijriDate';
import { calculatePrayerTimes } from '../../services/prayerService';
import { selectContextualVerse } from '../../services/verseSelectionService';

export const DailyVerse = () => {
  const { t, language } = useTranslation();
  const { hijriDate } = useHijriDate();
  const location = useStore((s) => s.location);
  const calculationMethod = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);

  const locale = language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US';

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Calculate prayer times for context detection
  const prayerTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(location.lat, location.lon, now, calculationMethod, madhab);
  }, [location, calculationMethod, madhab, now]);

  // Select contextual verse
  const selection = useMemo(() => {
    if (!prayerTimes) return null;
    return selectContextualVerse(now, prayerTimes, hijriDate);
  }, [now, prayerTimes, hijriDate]);

  const arabicWeekday = useMemo(() => getArabicWeekday(now), [now]);

  if (!selection) return null;

  const { verse, contextLabel } = selection;
  const translation = language === 'bn' ? verse.translationBn : verse.translation;

  // Get the translated context label
  const contextKey = `dailyVerse.context.${contextLabel}` as const;
  const contextDisplay = t(contextKey as Parameters<typeof t>[0]) || contextLabel;
  const typeLabel = verse.type === 'ayah' ? t('dailyVerse.ayah') : t('dailyVerse.hadith');

  // Normalize references to "Name-[ref]" form
  const formattedReference = (() => {
    const ref = verse.reference.trim();
    const match = ref.match(/^(.*?)\s+(\d[\d:.\-]*)$/);
    if (match) {
      return `${match[1]}-[${match[2]}]`;
    }
    return ref;
  })();

  return (
    <div className="obs-panel overflow-hidden fade-in">
      {/* ── date row ── */}
      {location && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-sm font-semibold text-foreground">
              {now.toLocaleDateString(locale, { weekday: 'long' })}
            </p>
            <p className="label-mono mt-0.5 truncate">
              {now.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="min-w-0 text-right leading-tight">
            <p className="arabic-text truncate text-sm font-semibold text-secondary">
              {arabicWeekday}
            </p>
            <p className="label-mono mt-0.5 truncate">
              {hijriDate.day}{' '}
              {language === 'ar'
                ? hijriDate.monthName.ar
                : language === 'bn'
                ? hijriDate.monthName.bn
                : hijriDate.monthName.en}{' '}
              {hijriDate.year}
            </p>
          </div>
        </div>
      )}

      {/* ── verse of the day ── */}
      <div className="px-4 py-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="label-mono !text-secondary">{typeLabel}</span>
          <span className="label-mono">{contextDisplay}</span>
        </div>

        <p className="arabic-text text-base leading-relaxed text-foreground sm:text-lg" dir="rtl">
          {verse.arabic}
        </p>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{translation}&rdquo;
        </p>

        <p className="label-mono mt-2 !text-primary">{formattedReference}</p>
      </div>
    </div>
  );
};
