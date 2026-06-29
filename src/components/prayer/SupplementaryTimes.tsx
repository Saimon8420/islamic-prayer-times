import { formatPrayerTime, calculatePrayerTimes } from '../../services/prayerService';
import { useTranslation } from '../../i18n/useTranslation';

type PrayerTimesResult = ReturnType<typeof calculatePrayerTimes>;

interface SupplementaryTimesProps {
  prayerTimes: PrayerTimesResult;
  use24HourFormat: boolean;
}

// Moon and stars — Additional times
const MoonStarsIcon = () => (
  <svg viewBox="0 0 28 28" fill="currentColor" className="w-4 h-4">
    <path d="M20 5a10 10 0 0 0-8.5 15A10 10 0 0 1 20 5z" opacity="0.9" />
    <path d="M14 2a12 12 0 1 0 12 12A10 10 0 0 1 14 2z" opacity="0.3" />
    <circle cx="22" cy="6" r="1.2" opacity="0.8" />
    <circle cx="25" cy="10" r="0.8" opacity="0.6" />
  </svg>
);

// Caution — Makruh (avoid) times
const CautionIcon = () => (
  <svg viewBox="0 0 28 28" fill="currentColor" className="w-4 h-4">
    <path d="M14 5L4 23h20L14 5z" opacity="0.3" />
    <rect x="13" y="10" width="2" height="7" rx="1" fill="currentColor" opacity="0.9" />
    <circle cx="14" cy="20" r="1.2" fill="currentColor" opacity="0.9" />
  </svg>
);

/**
 * Supplementary times rendered as a light two-column sub-section inside the
 * unified prayer card (no card chrome of its own). Left: additional/sunnah
 * times. Right: makruh (avoid) times, kept visually distinct in amber.
 */
export const SupplementaryTimes = ({ prayerTimes, use24HourFormat }: SupplementaryTimesProps) => {
  const { t } = useTranslation();

  const additionalTimes = [
    { name: t('prayer.additional.imsak'), time: prayerTimes.imsak, desc: t('prayer.additional.imsakDesc') },
    { name: t('prayer.additional.midnight'), time: prayerTimes.midnight, desc: t('prayer.additional.midnightDesc') },
    { name: t('prayer.additional.lastThird'), time: prayerTimes.lastThird, desc: t('prayer.additional.lastThirdDesc') },
  ];

  const sunriseStart = new Date(prayerTimes.sunrise.getTime() - 10 * 60 * 1000);
  const sunriseEnd = new Date(prayerTimes.sunrise.getTime() + 15 * 60 * 1000);
  const noonStart = new Date(prayerTimes.dhuhr.getTime() - 5 * 60 * 1000);
  const noonEnd = prayerTimes.dhuhr;
  const sunsetStart = new Date(prayerTimes.maghrib.getTime() - 15 * 60 * 1000);
  const sunsetEnd = prayerTimes.maghrib;

  const makruhTimes = [
    { label: t('prayer.makruh.sunrise'), start: sunriseStart, end: sunriseEnd },
    { label: t('prayer.makruh.solarNoon'), start: noonStart, end: noonEnd },
    { label: t('prayer.makruh.sunset'), start: sunsetStart, end: sunsetEnd },
  ];

  return (
    <div className="px-2 sm:px-3 pt-1 pb-2">
      {/* Arabesque divider — only when stacked under the list (mobile/tablet) */}
      <div className="lg:hidden flex items-center gap-2 mb-3 px-1">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(40,70%,50%,0.25)]" />
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[hsl(40,85%,52%)] opacity-30">
          <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8Z" fill="currentColor" />
        </svg>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(40,70%,50%,0.25)]" />
      </div>

      <div className="space-y-4">
        {/* ── Additional / sunnah times ── */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-1.5">
            <span className="text-primary/70"><MoonStarsIcon /></span>
            <h4 className="text-xs sm:text-sm font-bold text-foreground/80 uppercase tracking-wide">
              {t('prayer.additional.title')}
            </h4>
          </div>
          <div className="rounded-xl bg-muted/20 border border-border/40 divide-y divide-border/30">
            {additionalTimes.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-3 py-3">
                <div className="min-w-0 mr-2">
                  <p className="font-semibold text-sm text-foreground leading-tight">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-snug">{item.desc}</p>
                </div>
                <p className="shrink-0 font-bold text-sm tabular-nums text-primary">
                  {formatPrayerTime(item.time, use24HourFormat)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Makruh / avoid times (kept distinct in amber) ── */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-1.5">
            <span className="text-amber-500"><CautionIcon /></span>
            <h4 className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              {t('prayer.makruh.title')}
            </h4>
          </div>
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-[11px] text-muted-foreground/70 px-3 pt-2 pb-1 leading-relaxed">
              {t('prayer.makruh.description')}
            </p>
            <div className="divide-y divide-amber-500/15">
              {makruhTimes.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg viewBox="0 0 8 8" className="w-1.5 h-1.5 text-amber-500 opacity-60 shrink-0">
                      <rect x="1" y="1" width="6" height="6" rx="1" transform="rotate(45 4 4)" fill="currentColor" />
                    </svg>
                    <p className="font-semibold text-sm text-amber-700 dark:text-amber-400 leading-tight">
                      {item.label}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs tabular-nums font-semibold text-amber-700 dark:text-amber-400 ml-2">
                    {formatPrayerTime(item.start, use24HourFormat)}
                    <span className="text-amber-600/50 dark:text-amber-500/50 mx-0.5">–</span>
                    {formatPrayerTime(item.end, use24HourFormat)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
