import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { getDaysUntilEidFitr, getDaysUntilEidAdha, getDaysUntilRamadan, isRamadan } from '../../services/hijriService';
import { useTranslation } from '../../i18n/useTranslation';
import { useHijriDate } from '../../hooks/useHijriDate';

type CountdownMode = 'ramadan' | 'eidFitr' | 'eidAdha';

export const EidCountdown = () => {
  const { t } = useTranslation();
  const hijriAdjustment = useStore((state) => state.hijriAdjustment);
  const { maghribTime } = useHijriDate();

  const daysToFitr = useMemo(() => getDaysUntilEidFitr(hijriAdjustment, maghribTime), [hijriAdjustment, maghribTime]);
  const daysToAdha = useMemo(() => getDaysUntilEidAdha(hijriAdjustment, maghribTime), [hijriAdjustment, maghribTime]);
  const daysToRamadan = useMemo(() => getDaysUntilRamadan(hijriAdjustment, maghribTime), [hijriAdjustment, maghribTime]);
  const inRamadan = useMemo(() => isRamadan(hijriAdjustment, maghribTime), [hijriAdjustment, maghribTime]);

  // Determine what to show:
  // During Ramadan → always Eid ul-Fitr countdown
  // Otherwise → whichever is nearest among Ramadan, Eid Fitr, Eid Adha
  const { mode, days } = useMemo((): { mode: CountdownMode; days: number } => {
    // Eid today — takes top priority
    if (daysToFitr === 0) return { mode: 'eidFitr', days: 0 };
    if (daysToAdha === 0) return { mode: 'eidAdha', days: 0 };

    // During Ramadan → show Eid ul-Fitr countdown
    if (inRamadan && daysToFitr !== null) {
      return { mode: 'eidFitr', days: daysToFitr };
    }

    // Pick the nearest upcoming event
    const candidates: { mode: CountdownMode; days: number }[] = [];
    if (daysToRamadan !== null && daysToRamadan > 0) candidates.push({ mode: 'ramadan', days: daysToRamadan });
    if (daysToFitr !== null && daysToFitr > 0) candidates.push({ mode: 'eidFitr', days: daysToFitr });
    if (daysToAdha !== null && daysToAdha > 0) candidates.push({ mode: 'eidAdha', days: daysToAdha });

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.days - b.days);
      return candidates[0];
    }

    return { mode: 'ramadan', days: 0 };
  }, [daysToFitr, daysToAdha, daysToRamadan, inRamadan]);

  const isToday = days === 0;

  const label = (() => {
    if (mode === 'ramadan') {
      return isToday
        ? t('eidCountdown.ramadanMubarak')
        : t('eidCountdown.daysUntilRamadan', { count: days });
    }
    if (mode === 'eidFitr') {
      return isToday
        ? t('eidCountdown.eidFitrToday')
        : t('eidCountdown.daysUntilEidFitr', { count: days });
    }
    return isToday
      ? t('eidCountdown.eidAdhaToday')
      : t('eidCountdown.daysUntilEidAdha', { count: days });
  })();

  const isEidToday = isToday && (mode === 'eidFitr' || mode === 'eidAdha');

  // Compact pill — gold for Eid day, emerald accent otherwise; Ramadan gets a navy tint
  const pillClasses = isEidToday
    ? 'bg-[hsl(40,80%,38%/0.85)] border-[hsl(40,85%,55%/0.6)] text-white'
    : mode === 'ramadan'
      ? 'bg-[hsl(222,30%,18%/0.6)] dark:bg-[hsl(222,30%,18%/0.7)] border-[hsl(40,85%,52%/0.35)] text-foreground'
      : 'bg-[hsl(158,50%,22%/0.55)] dark:bg-[hsl(158,50%,18%/0.7)] border-[hsl(40,85%,52%/0.35)] text-foreground';

  return (
    <div
      className={`fade-in flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md shadow-sm ${pillClasses}`}
    >
      {/* Icon */}
      {isEidToday ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0 opacity-90">
          <path d="M12 2L14.5 8.5L22 9.5L16.5 14.5L18 22L12 18.5L6 22L7.5 14.5L2 9.5L9.5 8.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 shrink-0 opacity-80">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}

      <p className="text-xs sm:text-sm font-semibold truncate">{label}</p>

      {!isToday && (
        <span className="ms-1 inline-flex items-baseline gap-1 rounded-full bg-[hsl(40,85%,52%/0.18)] border border-[hsl(40,85%,52%/0.4)] px-2 py-0.5 text-[10px] font-bold tabular-nums text-[hsl(40,85%,32%)] dark:text-[hsl(40,80%,68%)] shrink-0">
          {days}
          <span className="text-[9px] font-medium opacity-80">
            {days === 1 ? t('eidCountdown.day') : t('eidCountdown.days')}
          </span>
        </span>
      )}

      {/* Eid Dua — shown only on Eid day, inline */}
      {isEidToday && (
        <span className="hidden md:inline arabic-text text-xs opacity-90 ms-2" dir="rtl">
          {t('eidCountdown.eidDuaArabic')}
        </span>
      )}
    </div>
  );
};
