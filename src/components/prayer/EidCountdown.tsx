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
  const isEidToday = isToday && (mode === 'eidFitr' || mode === 'eidAdha');

  // Event name (the number is shown separately as the hero).
  const eventName =
    mode === 'ramadan'
      ? t('dailyVerse.context.ramadan')
      : mode === 'eidFitr'
        ? t('dailyVerse.context.eid_fitr')
        : t('dailyVerse.context.eid_adha');

  // "Mubarak!" line when today; otherwise the short counting label.
  const todayLabel = (() => {
    if (mode === 'ramadan') return t('eidCountdown.ramadanMubarak');
    if (mode === 'eidFitr') return t('eidCountdown.eidFitrToday');
    return t('eidCountdown.eidAdhaToday');
  })();

  // Accent by mode: Eid day = gold, everything upcoming = emerald.
  const accent = isEidToday ? 'primary' : 'secondary';

  const shellClasses =
    accent === 'primary'
      ? 'border-primary/30 bg-primary/[0.07]'
      : 'border-secondary/25 bg-secondary/[0.06]';
  const chipClasses =
    accent === 'primary'
      ? 'border-primary/30 bg-primary/15 text-primary'
      : 'border-secondary/30 bg-secondary/15 text-secondary';

  const Icon = () =>
    isEidToday ? (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M12 2L14.5 8.5L22 9.5L16.5 14.5L18 22L12 18.5L6 22L7.5 14.5L2 9.5L9.5 8.5Z" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );

  return (
    <div
      className={`fade-in inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 ${shellClasses}`}
    >
      {/* crescent / star medallion */}
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${chipClasses}`}
      >
        <Icon />
      </span>

      {isToday ? (
        <p className="font-display text-sm font-semibold text-foreground">{todayLabel}</p>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="font-display text-sm font-semibold text-foreground">{eventName}</span>
          <span
            className={`font-mono text-base font-semibold tabular-nums ${
              accent === 'primary' ? 'text-primary' : 'text-secondary'
            }`}
          >
            {days}
          </span>
          <span className="label-mono">
            {days === 1 ? t('eidCountdown.day') : t('eidCountdown.days')}
          </span>
        </div>
      )}
    </div>
  );
};
