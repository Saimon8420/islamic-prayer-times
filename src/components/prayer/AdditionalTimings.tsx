import { useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes, formatPrayerTime } from '../../services/prayerService';
import { useTranslation } from '../../i18n/useTranslation';

/* ═══════════════════════════════════════════
   DECORATIVE SVG COMPONENTS
   ═══════════════════════════════════════════ */

// Arabesque corner ornament
const ArabesqueCorner = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 0L20 10L10 20Z" fill="rgba(200,168,78,0.25)" />
    <path d="M0 0L40 5L35 15L15 35L5 40Z" fill="rgba(200,168,78,0.12)" />
    <path d="M40 5L35 15L50 20L60 10Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <path d="M5 40L15 35L20 50L10 60Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
    <circle cx="20" cy="20" r="6" stroke="rgba(200,168,78,0.15)" strokeWidth="0.5" fill="none" />
  </svg>
);

// Hanging lantern
const HangingLantern = ({ className = "" }: { className?: string }) => (
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

// Tessellation overlay
const TessellationOverlay = () => (
  <div
    className="absolute inset-0 opacity-[0.04] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Cpath d='M30 30L37.5 37.5L30 45L22.5 37.5Z'/%3E%3Cpath d='M30 45L37.5 52.5L30 60L22.5 52.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
    }}
  />
);

// Moon and stars icon for Additional Times header
const MoonStarsIcon = () => (
  <svg viewBox="0 0 28 28" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
    <path d="M20 5a10 10 0 0 0-8.5 15A10 10 0 0 1 20 5z" opacity="0.9" />
    <path d="M14 2a12 12 0 1 0 12 12A10 10 0 0 1 14 2z" opacity="0.3" />
    <circle cx="22" cy="6" r="1.2" opacity="0.8" />
    <circle cx="25" cy="10" r="0.8" opacity="0.6" />
    <circle cx="24" cy="14" r="0.6" opacity="0.4" />
    <path d="M21 3l.4.8.8.4-.8.4-.4.8-.4-.8-.8-.4.8-.4z" opacity="0.7" />
  </svg>
);

// Warning/caution icon for Makruh header
const CautionIcon = () => (
  <svg viewBox="0 0 28 28" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
    <path d="M14 2L2 24h24L14 2z" opacity="0.15" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M14 5L4 23h20L14 5z" opacity="0.3" />
    <rect x="13" y="10" width="2" height="7" rx="1" fill="white" opacity="0.9" />
    <circle cx="14" cy="20" r="1.2" fill="white" opacity="0.9" />
  </svg>
);

// Small 8-pointed star divider between items
const MiniStarDivider = () => (
  <div className="flex items-center px-3 sm:px-4">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(40,70%,50%,0.15)] to-transparent" />
    <svg viewBox="0 0 12 12" className="w-2 h-2 mx-1.5 text-[hsl(40,85%,52%)] opacity-20">
      <path d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5Z" fill="currentColor" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(40,70%,50%,0.15)] to-transparent" />
  </div>
);

export const AdditionalTimings = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);
  const { t } = useTranslation();

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

  if (!hasLocation || !prayerTimes) return null;

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
    <div className="grid gap-4 md:grid-cols-2">
      {/* ═══════════════════════════════════════════
          ADDITIONAL TIMES CARD
          ═══════════════════════════════════════════ */}
      <Card className="islamic-border overflow-hidden fade-in">
        {/* Header — Deep emerald gradient with Arabian decorations */}
        <div
          className="relative overflow-hidden px-4 py-3 sm:px-5 sm:py-4"
          style={{
            background: 'linear-gradient(135deg, hsl(222, 30%, 12%) 0%, hsl(222, 25%, 18%) 40%, hsl(230, 20%, 15%) 100%)',
          }}
        >
          <TessellationOverlay />

          {/* Arabesque corners */}
          <ArabesqueCorner className="absolute top-0 left-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50" />
          <ArabesqueCorner className="absolute top-0 right-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50 -scale-x-100" />

          {/* Hanging lantern */}
          <div
            className="absolute top-0 right-[12%] w-3 h-6 sm:w-4 sm:h-8 opacity-30 hidden sm:block"
            style={{ animation: 'lantern-sway 4.5s ease-in-out infinite' }}
          >
            <HangingLantern className="w-full h-full" />
          </div>

          {/* Crescent moon decoration */}
          <div className="absolute -top-3 -right-3 w-14 h-14 sm:w-20 sm:h-20 opacity-[0.06] pointer-events-none">
            <svg viewBox="0 0 100 100" fill="#c8a84e">
              <path d="M70 15 A35 35 0 1 0 70 85 A28 28 0 1 1 70 15" />
              <polygon points="78,42 81,50 90,50 83,55 86,64 78,58 70,64 73,55 66,50 75,50" />
            </svg>
          </div>

          {/* Mosque skyline at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 pointer-events-none">
            <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="w-full h-full" fill="white" fillOpacity="0.05">
              <path d="M0,40 L0,30 L20,30 L20,20 L22,10 L24,20 L24,30 L60,30 Q70,30 75,25 Q85,12 95,25 Q100,30 110,30 L140,30 L140,22 L142,12 L144,22 L144,30 L200,30 L210,26 Q220,18 230,26 L240,30 L280,30 L280,20 L282,8 L284,20 L284,30 L340,30 Q350,30 355,25 Q370,10 385,25 Q390,30 400,30 L440,30 L440,22 L442,10 L444,22 L444,30 L500,30 L510,26 Q520,16 530,26 L540,30 L570,30 Q580,30 585,25 Q595,14 600,25 L600,40 Z" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-[hsl(40,85%,60%)] border border-white/10">
              <MoonStarsIcon />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {t('prayer.additional.title')}
            </h3>
          </div>
        </div>

        <div className="gold-border-strip" />

        {/* Content — Parchment style items */}
        <CardContent className="px-1 sm:px-2 py-1.5 sm:py-2">
            {additionalTimes.map((item, index) => (
              <div key={item.name}>
                {index > 0 && <MiniStarDivider />}
                <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 mx-1 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-semibold text-sm sm:text-base text-foreground leading-tight">{item.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-1.5 bg-primary/8 dark:bg-primary/12 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5">
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-primary opacity-50 hidden sm:block">
                      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M6 3v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <p className="font-bold text-sm sm:text-base tabular-nums text-primary">
                      {formatPrayerTime(item.time, use24HourFormat)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════
          MAKRUH TIMES CARD
          ═══════════════════════════════════════════ */}
      <Card className="islamic-border overflow-hidden fade-in">
        {/* Header — Warm amber/gold gradient with Arabian decorations */}
        <div
          className="relative overflow-hidden px-4 py-3 sm:px-5 sm:py-4"
          style={{
            background: 'linear-gradient(135deg, hsl(30, 60%, 18%) 0%, hsl(35, 50%, 22%) 40%, hsl(28, 55%, 16%) 100%)',
          }}
        >
          <TessellationOverlay />

          {/* Arabesque corners */}
          <ArabesqueCorner className="absolute top-0 left-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50" />
          <ArabesqueCorner className="absolute top-0 right-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50 -scale-x-100" />

          {/* Hanging lantern */}
          <div
            className="absolute top-0 right-[15%] w-3 h-6 sm:w-4 sm:h-8 opacity-25 hidden sm:block"
            style={{ animation: 'lantern-sway 5s ease-in-out infinite 0.3s' }}
          >
            <HangingLantern className="w-full h-full" />
          </div>

          {/* Mosque skyline at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 pointer-events-none">
            <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="w-full h-full" fill="white" fillOpacity="0.05">
              <path d="M0,40 L0,32 L30,32 Q40,32 45,26 Q55,14 65,26 Q70,32 80,32 L120,32 L120,22 L122,10 L124,22 L124,32 L180,32 L190,28 Q200,18 210,28 L220,32 L260,32 L260,22 L262,8 L264,22 L264,32 L330,32 Q340,32 345,26 Q360,10 375,26 Q380,32 390,32 L430,32 L430,24 L432,12 L434,24 L434,32 L490,32 L500,28 Q510,18 520,28 L530,32 L560,32 Q575,32 580,26 Q590,14 600,26 L600,40 Z" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/15 backdrop-blur-sm flex items-center justify-center text-amber-400 border border-amber-500/20">
              <CautionIcon />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {t('prayer.makruh.title')}
            </h3>
          </div>
        </div>

        <div className="gold-border-strip" />

        {/* Content */}
        <CardContent className="px-1 sm:px-2 pt-0 pb-1.5 sm:pb-2">
          {/* Description */}
          <p className="text-xs sm:text-sm text-muted-foreground/70 px-3 sm:px-4 pt-2 pb-1 sm:pt-3 sm:pb-2 leading-relaxed">
            {t('prayer.makruh.description')}
          </p>

            {makruhTimes.map((item, index) => (
              <div key={item.label}>
                {index > 0 && <MiniStarDivider />}
                <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 mx-1 rounded-lg hover:bg-amber-500/5 transition-colors">
                  {/* Label with diamond bullet */}
                  <div className="flex items-center gap-2 min-w-0">
                    <svg viewBox="0 0 8 8" className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-amber-500 opacity-60 shrink-0">
                      <rect x="1" y="1" width="6" height="6" rx="1" transform="rotate(45 4 4)" fill="currentColor" />
                    </svg>
                    <p className="font-semibold text-sm sm:text-base text-amber-700 dark:text-amber-400 leading-tight">
                      {item.label}
                    </p>
                  </div>

                  {/* Time range badge */}
                  <div className="shrink-0 inline-flex items-center bg-amber-500/8 dark:bg-amber-500/12 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 ml-2">
                    <p className="text-xs sm:text-sm tabular-nums font-semibold text-amber-700 dark:text-amber-400">
                      {formatPrayerTime(item.start, use24HourFormat)}
                      <span className="text-amber-600/50 dark:text-amber-500/50 mx-0.5 sm:mx-1">–</span>
                      {formatPrayerTime(item.end, use24HourFormat)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
};
