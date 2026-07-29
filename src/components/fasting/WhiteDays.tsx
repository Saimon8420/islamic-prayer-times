import { useMemo } from 'react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { getUpcomingWhiteDays, isWhiteDay } from '../../services/hijriService';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../i18n/useTranslation';
import { useHijriDate } from '../../hooks/useHijriDate';

export const WhiteDays = () => {
  const location = useStore((state) => state.location);
  const hasLocation = location !== null;
  const { t } = useTranslation();

  const hijriAdjustment = useStore((state) => state.hijriAdjustment);
  const { hijriDate: todayHijri, maghribTime } = useHijriDate();
  const whiteDays = useMemo(() => getUpcomingWhiteDays(6, hijriAdjustment, maghribTime), [hijriAdjustment, maghribTime]);
  const isTodayWhiteDay = useMemo(() => isWhiteDay(todayHijri.day), [todayHijri.day]);

  if (!hasLocation) return null;

  return (
    <div className="obs-panel flex flex-col overflow-hidden fade-in">
      {/* faint heritage watermark, top-right */}
      <div className="girih-watermark pointer-events-none absolute right-3 top-3 h-20 w-20 sm:h-28 sm:w-28" />

      {/* ── header ── */}
      <div className="relative p-4 pb-3 sm:p-5">
        <p className="label-mono">{t('fasting.whiteDays.title')}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {t('fasting.whiteDays.description')}
          {isTodayWhiteDay && (
            <span className="ms-1 font-semibold text-secondary">{t('fasting.whiteDays.todayIsWhiteDay')}</span>
          )}
        </p>
      </div>

      <div className="mx-4 sm:mx-5">
        <div className="heritage-rule" />
      </div>

      {/* ── white days list ── */}
      <div className="flex-1 p-2 sm:p-3">
        {whiteDays.map((day, index) => {
          const isToday = format(day.gregorianDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-3 transition-colors sm:px-4',
                isToday ? 'bg-secondary/[0.07]' : 'hover:bg-foreground/[0.03]'
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums',
                    isToday
                      ? 'next-pulse border-secondary/40 bg-secondary/15 text-secondary'
                      : 'border-border bg-muted/40 text-muted-foreground'
                  )}
                >
                  {day.hijriDate.day}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'font-display text-[15px] font-semibold leading-tight sm:text-base',
                      isToday ? 'text-secondary' : 'text-foreground'
                    )}
                  >
                    {t('fasting.whiteDays.dayOfMonth', { day: day.hijriDate.day, month: day.hijriDate.monthName.en })}
                    {isToday && (
                      <span className="label-mono ms-1.5 !text-secondary">{t('fasting.whiteDays.todayLabel')}</span>
                    )}
                  </p>
                  <p className="arabic-text mt-0.5 text-xs leading-tight text-muted-foreground/70">
                    {day.hijriDate.formattedArabic}
                  </p>
                </div>
              </div>
              <p className="ml-2 shrink-0 font-mono text-xs tabular-nums text-muted-foreground sm:text-sm">
                {format(day.gregorianDate, 'EEE, MMM d')}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── hadith footer ── */}
      <div className="border-t border-border px-4 py-3 sm:px-5">
        <p className="text-center text-[10px] italic leading-relaxed text-muted-foreground/60 sm:text-xs">
          {t('fasting.whiteDays.hadith')}
        </p>
      </div>
    </div>
  );
};
