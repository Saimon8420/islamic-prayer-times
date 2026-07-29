import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes, formatPrayerTime } from '../../services/prayerService';
import { isRamadan, getDaysUntilRamadan } from '../../services/hijriService';
import { formatCountdown, formatDuration } from '../../utils';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../i18n/useTranslation';
import { useHijriDate } from '../../hooks/useHijriDate';

export const FastingTimesCard = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);
  const showSeconds = useStore((state) => state.showSeconds);
  const { t } = useTranslation();

  const [currentTime, setCurrentTime] = useState(new Date());

  const hasLocation = location !== null;

  const prayerTimes = useMemo(() => {
    if (!hasLocation) return null;
    return calculatePrayerTimes(
      location.lat,
      location.lon,
      new Date(),
      calculationMethod,
      madhab
    );
  }, [hasLocation, location, calculationMethod, madhab]);

  const hijriAdjustment = useStore((state) => state.hijriAdjustment);
  const { hijriDate, maghribTime } = useHijriDate();
  const isCurrentlyRamadan = useMemo(() => isRamadan(hijriAdjustment, maghribTime), [hijriAdjustment, maghribTime]);
  const daysUntilRamadan = useMemo(() => getDaysUntilRamadan(hijriAdjustment, maghribTime), [hijriAdjustment, maghribTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!hasLocation || !prayerTimes) return null;

  const fajrTime = prayerTimes.fajr;
  const iftarTime = prayerTimes.maghrib;
  const fastingDuration = Math.floor((iftarTime.getTime() - fajrTime.getTime()) / (1000 * 60));
  const isFasting = currentTime >= fajrTime && currentTime < iftarTime;
  const sahurActive = currentTime < fajrTime;

  const getTimeUntil = () => {
    if (currentTime < fajrTime) {
      return {
        event: t('fasting.sahurEndsIn'),
        seconds: Math.floor((fajrTime.getTime() - currentTime.getTime()) / 1000),
        type: 'sahur' as const,
      };
    }
    if (currentTime < iftarTime) {
      return {
        event: t('fasting.iftarIn'),
        seconds: Math.floor((iftarTime.getTime() - currentTime.getTime()) / 1000),
        type: 'iftar' as const,
      };
    }
    return null;
  };

  const timeUntil = getTimeUntil();

  const getFastingProgress = () => {
    if (!isFasting) return 0;
    const totalFastingTime = iftarTime.getTime() - prayerTimes.fajr.getTime();
    const elapsed = currentTime.getTime() - prayerTimes.fajr.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalFastingTime) * 100));
  };

  return (
    <div className="obs-panel flex flex-col overflow-hidden fade-in">
      {/* faint heritage watermark, top-right */}
      <div className="girih-watermark pointer-events-none absolute right-3 top-3 h-20 w-20 sm:h-28 sm:w-28" />

      <div className="relative p-4 pb-2 sm:p-6 sm:pb-3">
        {/* ── meta row ── */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-mono">{t('fasting.title')}</p>
            <p className="mt-1 font-display text-base font-semibold text-foreground sm:text-lg">
              {hijriDate.formatted}
            </p>
            {isCurrentlyRamadan && (
              <p className="mt-1 text-sm font-medium text-secondary">{t('fasting.ramadanMubarak')}</p>
            )}
            {!isCurrentlyRamadan && daysUntilRamadan !== null && daysUntilRamadan > 0 && (
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {t('fasting.daysUntilRamadan', { count: daysUntilRamadan })}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="label-mono">{t('fasting.duration')}</p>
            <p className="mt-1 font-mono text-lg font-medium tabular-nums text-primary sm:text-xl">
              {formatDuration(fastingDuration)}
            </p>
          </div>
        </div>

        {/* ── countdown highlight ── */}
        {timeUntil && (
          <div className="mt-2 rounded-2xl border border-secondary/25 bg-secondary/[0.06] p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="label-mono !text-secondary">{timeUntil.event}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {timeUntil.type === 'sahur'
                    ? formatPrayerTime(fajrTime, use24HourFormat)
                    : formatPrayerTime(iftarTime, use24HourFormat)}
                </p>
              </div>
              <p className="font-mono text-2xl font-medium tabular-nums text-primary sm:text-3xl">
                {formatCountdown(timeUntil.seconds, showSeconds)}
              </p>
            </div>

            {isFasting && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10 sm:mt-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-out"
                  style={{ width: `${getFastingProgress()}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mx-4 my-1 sm:mx-6">
        <div className="heritage-rule" />
      </div>

      {/* ── Sahur & Iftar times ── */}
      <div className="relative flex flex-1 flex-col justify-center p-4 pt-3 sm:p-6 sm:pt-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Sahur / Suhoor */}
          <div
            className={cn(
              'rounded-2xl border p-4 transition-colors sm:p-5',
              sahurActive ? 'border-secondary/25 bg-secondary/[0.06]' : 'border-border bg-muted/40'
            )}
          >
            <p className={cn('label-mono', sahurActive && '!text-secondary')}>{t('fasting.sahurSehri')}</p>
            <p
              className={cn(
                'mt-1.5 font-mono text-2xl font-medium tabular-nums sm:text-3xl',
                sahurActive ? 'text-secondary' : 'text-primary'
              )}
            >
              {formatPrayerTime(fajrTime, use24HourFormat)}
            </p>
            <p className="mt-1.5 text-[10px] text-muted-foreground/70 sm:text-xs">{t('fasting.endOfPreDawnMeal')}</p>
          </div>

          {/* Iftar */}
          <div
            className={cn(
              'rounded-2xl border p-4 transition-colors sm:p-5',
              isFasting ? 'border-secondary/25 bg-secondary/[0.06]' : 'border-border bg-muted/40'
            )}
          >
            <p className={cn('label-mono', isFasting && '!text-secondary')}>{t('fasting.iftar')}</p>
            <p
              className={cn(
                'mt-1.5 font-mono text-2xl font-medium tabular-nums sm:text-3xl',
                isFasting ? 'text-secondary' : 'text-primary'
              )}
            >
              {formatPrayerTime(iftarTime, use24HourFormat)}
            </p>
            <p className="mt-1.5 text-[10px] text-muted-foreground/70 sm:text-xs">{t('fasting.timeToBreakFast')}</p>
          </div>
        </div>

        {/* ── status message ── */}
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-center sm:mt-5 sm:p-4">
          {isFasting ? (
            <div>
              <p className="font-display text-sm font-semibold text-secondary sm:text-base">{t('fasting.currentlyFasting')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/70 sm:mt-1 sm:text-sm">
                {t('fasting.mayAllahAccept')}
                <span className="arabic-text mx-2">تقبل الله</span>
              </p>
            </div>
          ) : sahurActive ? (
            <div>
              <p className="font-display text-sm font-semibold text-foreground sm:text-base">{t('fasting.prepareForSahur')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/70 sm:mt-1 sm:text-sm">
                {t('fasting.dontForgetIntention')}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-display text-sm font-semibold text-secondary sm:text-base">{t('fasting.fastCompleted')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/70 sm:mt-1 sm:text-sm">
                <span className="arabic-text">الحمد لله</span> - {t('fasting.alhamdulillah')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
