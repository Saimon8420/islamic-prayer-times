import { formatPrayerTime, calculatePrayerTimes } from '../../services/prayerService';
import { useTranslation } from '../../i18n/useTranslation';

type PrayerTimesResult = ReturnType<typeof calculatePrayerTimes>;

interface SupplementaryTimesProps {
  prayerTimes: PrayerTimesResult;
  use24HourFormat: boolean;
}

// Moon and stars — Additional times header
const MoonStarsIcon = () => (
  <svg viewBox="0 0 28 28" fill="currentColor" className="w-4 h-4">
    <path d="M20 5a10 10 0 0 0-8.5 15A10 10 0 0 1 20 5z" opacity="0.9" />
    <path d="M14 2a12 12 0 1 0 12 12A10 10 0 0 1 14 2z" opacity="0.3" />
    <circle cx="22" cy="6" r="1.2" opacity="0.8" />
    <circle cx="25" cy="10" r="0.8" opacity="0.6" />
  </svg>
);

// Caution — Makruh (avoid) times header
const CautionIcon = () => (
  <svg viewBox="0 0 28 28" fill="currentColor" className="w-4 h-4">
    <path d="M14 5L4 23h20L14 5z" opacity="0.3" />
    <rect x="13" y="10" width="2" height="7" rx="1" fill="currentColor" opacity="0.9" />
    <circle cx="14" cy="20" r="1.2" fill="currentColor" opacity="0.9" />
  </svg>
);

// Per-row glyphs for the additional times.
const ImsakIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
    <path d="M17 18a5 5 0 0 0-10 0" />
    <path d="M12 2v2M4.2 10.2l1.4 1.4M2 18h2M20 18h2M18.4 11.6l1.4-1.4M22 18H2" />
  </svg>
);
const MidnightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const LastThirdIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M8 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" opacity="0.95" />
    <path d="M17 9l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" opacity="0.7" />
    <path d="M13 15l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L11 17l1.5-.5z" opacity="0.55" />
  </svg>
);
const ADDITIONAL_ICONS = [ImsakIcon, MidnightIcon, LastThirdIcon];

// Sun-phase glyphs for the three makruh windows (sunrise · zenith · sunset).
const SunriseGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M17 18a5 5 0 0 0-10 0" />
    <line x1="3" y1="18" x2="21" y2="18" />
    <path d="M12 3v4M12 3l-2.5 2.5M12 3l2.5 2.5" />
  </svg>
);
const ZenithGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);
const SunsetGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M17 18a5 5 0 0 0-10 0" />
    <line x1="3" y1="18" x2="21" y2="18" />
    <path d="M12 9V5M12 9l-2.5-2.5M12 9l2.5-2.5" />
  </svg>
);
const MAKRUH_ICONS = [SunriseGlyph, ZenithGlyph, SunsetGlyph];

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
      {/* divider — only when stacked under the list (mobile/tablet) */}
      <div className="lg:hidden heritage-rule mb-4 mt-1" />

      <div className="space-y-4">
        {/* ── Additional / sunnah times ── */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-1.5">
            <span className="text-primary/70"><MoonStarsIcon /></span>
            <h4 className="label-mono">
              {t('prayer.additional.title')}
            </h4>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card/50">
            {additionalTimes.map((item, i) => {
              const RowIcon = ADDITIONAL_ICONS[i] ?? ADDITIONAL_ICONS[0];
              return (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 px-3.5 py-3 ${i > 0 ? 'border-t border-border/60' : ''}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <RowIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold leading-tight text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{item.desc}</p>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-primary">
                    {formatPrayerTime(item.time, use24HourFormat)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Makruh / avoid times (a distinct amber "caution" panel) ── */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-1.5">
            <span className="text-amber-500"><CautionIcon /></span>
            <h4 className="label-mono !text-amber-700 dark:!text-amber-400">
              {t('prayer.makruh.title')}
            </h4>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.10] to-amber-500/[0.04]">
            {/* caution accent stripe */}
            <div className="absolute inset-y-0 start-0 w-1 bg-amber-500/60" />
            <p className="px-4 pb-2.5 pt-3 text-[11px] italic leading-relaxed text-amber-800/80 dark:text-amber-300/80">
              {t('prayer.makruh.description')}
            </p>
            <div className="space-y-1.5 px-2.5 pb-2.5">
              {makruhTimes.map((item, i) => {
                const RowIcon = MAKRUH_ICONS[i] ?? MAKRUH_ICONS[0];
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <RowIcon />
                    </span>
                    <p className="flex-1 font-display text-sm font-semibold leading-tight text-amber-800 dark:text-amber-300">
                      {item.label}
                    </p>
                    <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-mono text-[11px] font-medium tabular-nums text-amber-700 dark:text-amber-300">
                      {formatPrayerTime(item.start, use24HourFormat)}
                      <span className="mx-0.5 opacity-50">–</span>
                      {formatPrayerTime(item.end, use24HourFormat)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
