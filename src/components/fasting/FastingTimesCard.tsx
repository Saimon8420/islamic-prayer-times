import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes, formatPrayerTime } from '../../services/prayerService';
import { isRamadan, getDaysUntilRamadan } from '../../services/hijriService';
import { formatCountdown, formatDuration } from '../../utils';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../i18n/useTranslation';
import { useHijriDate } from '../../hooks/useHijriDate';

/* ═══════════════════════════════════════════
   DECORATIVE SVG COMPONENTS
   ═══════════════════════════════════════════ */

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

const HangingLantern = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 30 60" fill="none" className={className}>
    <line x1="15" y1="0" x2="15" y2="12" stroke="rgba(200,168,78,0.4)" strokeWidth="1" />
    <path d="M10 12h10l-1 3H11z" fill="rgba(200,168,78,0.5)" />
    <path d="M9 15Q9 10 15 10Q21 10 21 15v18Q21 40 15 44Q9 40 9 33z" fill="rgba(200,168,78,0.15)" stroke="rgba(200,168,78,0.35)" strokeWidth="1" />
    <ellipse cx="15" cy="25" rx="4" ry="8" fill="rgba(200,168,78,0.12)" />
  </svg>
);

const TessellationOverlay = () => (
  <div
    className="absolute inset-0 opacity-[0.04] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Cpath d='M30 30L37.5 37.5L30 45L22.5 37.5Z'/%3E%3Cpath d='M30 45L37.5 52.5L30 60L22.5 52.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
    }}
  />
);

const MosqueSkyline = () => (
  <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-10 pointer-events-none">
    <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full" fill="white" fillOpacity="0.07">
      <path d="M0,80 L0,60 L40,60 L40,40 L44,20 L48,40 L48,60 L80,60 L100,50 Q120,30 140,50 L160,60 L200,60 L200,45 L204,25 L208,45 L208,60 L280,60 Q300,60 310,50 Q330,25 350,50 Q360,60 380,60 L420,60 L420,40 L424,18 L428,40 L428,60 L500,60 L520,55 Q540,40 560,55 L580,60 L640,60 L640,45 L644,22 L648,45 L648,60 L700,60 Q720,60 730,50 Q760,20 790,50 Q800,60 820,60 L860,60 L860,38 L864,16 L868,38 L868,60 L940,60 L960,52 Q980,35 1000,52 L1020,60 L1060,60 L1060,42 L1064,22 L1068,42 L1068,60 L1120,60 Q1140,60 1150,50 Q1170,30 1190,50 L1200,60 L1200,80 Z" />
    </svg>
  </div>
);

// Custom Icons
const SahurIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 sm:w-8 sm:h-8">
    <circle cx="12" cy="17" r="5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2v4M4 12H2M6.34 6.34L4.93 4.93M17.66 6.34l1.41-1.41M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 14l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IftarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 sm:w-8 sm:h-8">
    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 3v3M5 5l2 2M19 5l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    <circle cx="15" cy="15" r="1" fill="currentColor" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

const DatesIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
    <ellipse cx="8" cy="14" rx="3" ry="5" />
    <ellipse cx="16" cy="14" rx="3" ry="5" />
    <ellipse cx="12" cy="12" rx="3" ry="5" />
    <path d="M8 9V5M12 7V3M16 9V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

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
    <Card className="islamic-border overflow-hidden fade-in">
      {/* ═══ HEADER — Gold Arabian gradient with full decorations ═══ */}
      <div className="relative overflow-hidden pb-6 sm:pb-8" style={{
        background: isCurrentlyRamadan
          ? 'linear-gradient(135deg, hsl(38, 80%, 38%) 0%, hsl(43, 90%, 45%) 40%, hsl(38, 80%, 42%) 100%)'
          : 'linear-gradient(135deg, hsl(38, 70%, 35%) 0%, hsl(40, 80%, 42%) 40%, hsl(35, 70%, 32%) 100%)',
      }}>
        <TessellationOverlay />

        {/* Arabesque corners */}
        <ArabesqueCorner className="absolute top-0 left-0 w-14 h-14 sm:w-20 sm:h-20 opacity-60" />
        <ArabesqueCorner className="absolute top-0 right-0 w-14 h-14 sm:w-20 sm:h-20 opacity-60 -scale-x-100" />

        {/* Hanging lanterns */}
        <div className="absolute top-0 left-[15%] w-4 h-8 sm:w-5 sm:h-10 opacity-40 hidden sm:block" style={{ animation: 'lantern-sway 5s ease-in-out infinite' }}>
          <HangingLantern className="w-full h-full" />
        </div>
        <div className="absolute top-0 right-[10%] w-3.5 h-7 sm:w-4 sm:h-8 opacity-30 hidden sm:block" style={{ animation: 'lantern-sway 4s ease-in-out infinite 0.5s' }}>
          <HangingLantern className="w-full h-full" />
        </div>

        {/* Crescent decoration */}
        <div className="crescent-decoration w-24 h-24 sm:w-32 sm:h-32 -top-6 -right-6 sm:-top-8 sm:-right-8" />

        {/* Mosque skyline */}
        <MosqueSkyline />

        <div className="relative z-10 p-4 sm:p-6 pb-0">
          {/* Title row */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1 flex items-center gap-2">
                <DatesIcon />
                {t('fasting.title')}
              </h2>
              <p className="text-white/70 text-xs sm:text-sm">
                {hijriDate.formatted}
              </p>
              {isCurrentlyRamadan && (
                <p className="text-white font-semibold text-sm mt-1">{t('fasting.ramadanMubarak')}</p>
              )}
              {!isCurrentlyRamadan && daysUntilRamadan !== null && daysUntilRamadan > 0 && (
                <p className="text-white/70 text-xs sm:text-sm mt-1">
                  {t('fasting.daysUntilRamadan', { count: daysUntilRamadan })}
                </p>
              )}
            </div>
            <div className="inline-flex flex-col items-center bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-white/10">
              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">{t('fasting.duration')}</p>
              <p className="text-lg sm:text-xl font-bold text-white">{formatDuration(fastingDuration)}</p>
            </div>
          </div>

          {/* ═══ COUNTDOWN — Glass card with gold accents ═══ */}
          {timeUntil && (
            <div className={cn(
              'relative glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 mt-3 sm:mt-4 border-s-4',
              timeUntil.type === 'sahur' ? 'border-s-blue-300/80' : 'border-s-[hsl(40,85%,52%)]'
            )}>
              {/* Subtle arabesque in corner */}
              <div className="absolute top-1 right-1 w-10 h-10 sm:w-14 sm:h-14 opacity-20 pointer-events-none">
                <svg viewBox="0 0 50 50" fill="rgba(200,168,78,0.5)">
                  <path d="M25 5L28 15L38 12L32 20L45 25L32 30L38 38L28 35L25 45L22 35L12 38L18 30L5 25L18 20L12 12L22 15Z" />
                </svg>
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={cn(
                    'w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-white shrink-0',
                    timeUntil.type === 'sahur' ? 'bg-blue-500/30' : 'bg-orange-500/30'
                  )}>
                    {timeUntil.type === 'sahur' ? <SahurIcon /> : <IftarIcon />}
                  </div>
                  <span className="text-white/80 text-xs sm:text-base font-medium truncate">{timeUntil.event}</span>
                </div>
                <p className="text-lg sm:text-3xl font-bold countdown-display tabular-nums text-white shrink-0">
                  {formatCountdown(timeUntil.seconds, showSeconds)}
                </p>
              </div>
              {isFasting && (
                <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${getFastingProgress()}%`,
                      background: 'linear-gradient(90deg, rgba(200,168,78,0.6) 0%, rgba(255,255,255,0.5) 100%)',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gold ornamental border strip */}
      <div className="gold-border-strip" />

      {/* ═══ SAHUR & IFTAR TIMES ═══ */}
      <CardContent className="px-3 sm:px-5 py-4 sm:py-5 relative">
        {/* Arabesque corner watermark */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#996b2f" stroke="#996b2f" strokeWidth="0.5">
            <path d="M50 5L60 20L77 10L70 28L90 25L78 40L95 50L78 60L90 75L70 72L77 90L60 80L50 95L40 80L23 90L30 72L10 75L22 60L5 50L22 40L10 25L30 28L23 10L40 20Z" />
            <circle cx="50" cy="50" r="15" fill="none" />
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Sahur */}
          <div className={cn(
            'relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all',
            currentTime < fajrTime
              ? 'bg-gradient-to-br from-blue-500/15 to-blue-600/5 ring-1 ring-blue-500/30'
              : 'bg-muted/40'
          )}>
            <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/8" />
            <div className="relative">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-blue-500/15 flex items-center justify-center mb-2.5 sm:mb-3 text-blue-600 dark:text-blue-400">
                <SahurIcon />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 mb-0.5 sm:mb-1">
                {t('fasting.sahurSehri')}
              </p>
              <p className="text-2xl sm:text-3xl font-bold">{formatPrayerTime(fajrTime, use24HourFormat)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1.5 sm:mt-2">{t('fasting.endOfPreDawnMeal')}</p>
            </div>
          </div>

          {/* Iftar */}
          <div className={cn(
            'relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all',
            isFasting
              ? 'bg-gradient-to-br from-orange-500/15 to-orange-600/5 ring-1 ring-orange-500/30'
              : 'bg-muted/40'
          )}>
            <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/8" />
            <div className="relative">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-orange-500/15 flex items-center justify-center mb-2.5 sm:mb-3 text-orange-600 dark:text-orange-400">
                <IftarIcon />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 mb-0.5 sm:mb-1">
                {t('fasting.iftar')}
              </p>
              <p className="text-2xl sm:text-3xl font-bold">{formatPrayerTime(iftarTime, use24HourFormat)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1.5 sm:mt-2">{t('fasting.timeToBreakFast')}</p>
            </div>
          </div>
        </div>

        {/* ═══ STATUS MESSAGE — with arabesque divider ═══ */}
        <div className="flex items-center gap-2 mt-4 sm:mt-5 mb-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(40,70%,50%,0.3)]" />
          <svg viewBox="0 0 16 16" className="w-3 h-3 text-[hsl(40,85%,52%)] opacity-30">
            <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(40,70%,50%,0.3)]" />
        </div>

        <div className="rounded-xl bg-muted/30 p-3 sm:p-4 text-center">
          {isFasting ? (
            <div>
              <p className="font-semibold text-sm sm:text-base text-primary">{t('fasting.currentlyFasting')}</p>
              <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5 sm:mt-1">
                {t('fasting.mayAllahAccept')}
                <span className="arabic-text mx-2">تقبل الله</span>
              </p>
            </div>
          ) : currentTime < fajrTime ? (
            <div>
              <p className="font-semibold text-sm sm:text-base">{t('fasting.prepareForSahur')}</p>
              <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5 sm:mt-1">
                {t('fasting.dontForgetIntention')}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-sm sm:text-base text-primary">{t('fasting.fastCompleted')}</p>
              <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5 sm:mt-1">
                <span className="arabic-text">الحمد لله</span> - {t('fasting.alhamdulillah')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
