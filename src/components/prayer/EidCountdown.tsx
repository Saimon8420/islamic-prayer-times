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

  return (
    <div className="islamic-border rounded-xl overflow-hidden fade-in">
      <div
        className="relative px-4 py-3 sm:px-5 sm:py-4 overflow-hidden"
        style={{
          background: isEidToday
            ? 'linear-gradient(135deg, hsl(40,80%,36%) 0%, hsl(43,90%,45%) 50%, hsl(38,75%,34%) 100%)'
            : mode === 'ramadan'
              ? 'linear-gradient(135deg, hsl(222,30%,14%) 0%, hsl(225,28%,20%) 50%, hsl(220,30%,12%) 100%)'
              : 'linear-gradient(135deg, hsl(158,50%,18%) 0%, hsl(160,45%,24%) 50%, hsl(155,50%,16%) 100%)',
        }}
      >
        {/* Tessellation overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Crescent */}
        <div className="absolute -top-2 -right-2 w-12 h-12 opacity-[0.08] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#c8a84e">
            <path d="M70 15 A35 35 0 1 0 70 85 A28 28 0 1 1 70 15" />
            <polygon points="78,42 81,50 90,50 83,55 86,64 78,58 70,64 73,55 66,50 75,50" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Icon */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0" style={{
                background: 'rgba(200,168,78,0.12)',
                border: '1px solid rgba(200,168,78,0.2)',
              }}>
                {isEidToday ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 sm:w-5 sm:h-5">
                    <path d="M12 2L14.5 8.5L22 9.5L16.5 14.5L18 22L12 18.5L6 22L7.5 14.5L2 9.5L9.5 8.5Z" fill="rgba(200,168,78,0.8)" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.8)" strokeWidth="1.5" className="w-4.5 h-4.5 sm:w-5 sm:h-5">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </div>
              <p className="text-sm sm:text-base font-semibold text-white truncate">
                {label}
              </p>
            </div>

            {!isToday && (
              <div className="flex items-center gap-1.5 shrink-0 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
                <span className="text-lg sm:text-xl font-bold text-white tabular-nums">{days}</span>
                <span className="text-[10px] sm:text-xs text-white/60">{days === 1 ? t('eidCountdown.day') : t('eidCountdown.days')}</span>
              </div>
            )}
          </div>

          {/* Eid Dua — shown only on Eid day */}
          {isEidToday && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-sm sm:text-base text-white/90 arabic-text text-center leading-relaxed" dir="rtl">
                {t('eidCountdown.eidDuaArabic')}
              </p>
              <p className="text-[10px] sm:text-xs text-white/60 text-center italic mt-0.5">
                {t('eidCountdown.eidDuaTranslation')}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="gold-border-strip" />
    </div>
  );
};
