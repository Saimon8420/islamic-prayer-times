import { useEffect, useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "../ui/card";
import { useStore } from "../../store/useStore";
import {
  calculatePrayerTimes,
  getNextPrayer,
  formatPrayerTime,
  formatCountdown,
  PRAYER_NAMES,
  CALCULATION_METHODS,
} from "../../services/prayerService";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/useTranslation";
import { useHijriDate } from "../../hooks/useHijriDate";

/* ═══════════════════════════════════════════
   DECORATIVE SVG COMPONENTS
   ═══════════════════════════════════════════ */

// Arabesque corner ornament — 8-pointed star with geometric tracery
const ArabesqueCorner = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path
      d="M0 0L20 10L10 20Z"
      fill="rgba(200,168,78,0.25)"
    />
    <path
      d="M0 0L40 5L35 15L15 35L5 40Z"
      fill="rgba(200,168,78,0.12)"
    />
    <path
      d="M40 5L35 15L50 20L60 10Z"
      stroke="rgba(200,168,78,0.2)"
      strokeWidth="0.5"
      fill="rgba(200,168,78,0.06)"
    />
    <path
      d="M5 40L15 35L20 50L10 60Z"
      stroke="rgba(200,168,78,0.2)"
      strokeWidth="0.5"
      fill="rgba(200,168,78,0.06)"
    />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
    <circle cx="20" cy="20" r="6" stroke="rgba(200,168,78,0.15)" strokeWidth="0.5" fill="none" />
  </svg>
);

// Hanging lantern for header decoration
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
    <line x1="15" y1="15" x2="15" y2="33" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" />
    <line x1="9" y1="24" x2="21" y2="24" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" />
  </svg>
);

// 8-pointed star divider between prayer rows
const StarDivider = () => (
  <div className="flex items-center px-4 sm:px-6">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(40,70%,50%,0.2)] to-transparent" />
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 mx-2 text-[hsl(40,85%,52%)] opacity-30">
      <path
        d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z"
        fill="currentColor"
      />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(40,70%,50%,0.2)] to-transparent" />
  </div>
);

// Gold tessellation overlay for header
const TessellationOverlay = () => (
  <div
    className="absolute inset-0 opacity-[0.04] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Cpath d='M30 30L37.5 37.5L30 45L22.5 37.5Z'/%3E%3Cpath d='M30 45L37.5 52.5L30 60L22.5 52.5Z'/%3E%3Cpath d='M0 30L7.5 37.5L0 45L-7.5 37.5Z'/%3E%3Cpath d='M60 30L67.5 37.5L60 45L52.5 37.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
    }}
  />
);

// Mosque skyline silhouette for header bottom
const MosqueSkyline = () => (
  <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-10 pointer-events-none">
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      className="w-full h-full"
      fill="white"
      fillOpacity="0.07"
    >
      <path d="M0,80 L0,60 L40,60 L40,40 L44,20 L48,40 L48,60 L80,60 L100,50 Q120,30 140,50 L160,60 L200,60 L200,45 L204,25 L208,45 L208,60 L280,60 Q300,60 310,50 Q330,25 350,50 Q360,60 380,60 L420,60 L420,40 L424,18 L428,40 L428,60 L500,60 L520,55 Q540,40 560,55 L580,60 L640,60 L640,45 L644,22 L648,45 L648,60 L700,60 Q720,60 730,50 Q760,20 790,50 Q800,60 820,60 L860,60 L860,38 L864,16 L868,38 L868,60 L940,60 L960,52 Q980,35 1000,52 L1020,60 L1060,60 L1060,42 L1064,22 L1068,42 L1068,60 L1120,60 Q1140,60 1150,50 Q1170,30 1190,50 L1200,60 L1200,80 Z" />
    </svg>
  </div>
);

// Custom SVG Icons for prayers with Arabian aesthetic
const PrayerIcons = {
  Fajr: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="17" r="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v4M4 12H2M6.34 6.34L4.93 4.93M17.66 6.34l1.41-1.41M22 12h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M8 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Sunrise: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 6.34l1.41-1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M17.66 17.66l1.41 1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  Dhuhr: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  Asr: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Maghrib: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M12 21a9 9 0 0 0 0-18 9 9 0 0 0 0 18z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.5" />
    </svg>
  ),
  Isha: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 4l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5L17 4z" fill="currentColor" />
      <path d="M20 9l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5L20 9z" fill="currentColor" />
    </svg>
  ),
};

export const PrayerTimesCard = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);
  const showSeconds = useStore((state) => state.showSeconds);
  const { t, language } = useTranslation();

  const [currentTime, setCurrentTime] = useState(new Date());

  const hasLocation = location !== null;

  const prayerTimes = useMemo(() => {
    if (!hasLocation) return null;
    return calculatePrayerTimes(
      location.lat,
      location.lon,
      new Date(),
      calculationMethod,
      madhab,
    );
  }, [hasLocation, location, calculationMethod, madhab]);

  const { hijriDate } = useHijriDate();

  const nextPrayer = useMemo(() => {
    if (!hasLocation) return null;
    return getNextPrayer(location.lat, location.lon, calculationMethod, madhab);
  }, [hasLocation, location, calculationMethod, madhab, currentTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleShare = useCallback(async () => {
    if (!prayerTimes || !location) return;

    const hijriStr = `${hijriDate.day} ${hijriDate.monthName.en} ${hijriDate.year} AH`;
    const line = '─────────────────────────';
    const fmt = (emoji: string, name: string, time: Date) => {
      const t = formatPrayerTime(time, use24HourFormat);
      // Use dot leaders for even distribution in proportional fonts
      const dots = '·'.repeat(Math.max(2, 18 - name.length - t.length));
      return `${emoji}  ${name} ${dots} ${t}`;
    };
    const lines = [
      `🕌 ${t('share.title')}`,
      line,
      `📅 ${format(new Date(), 'EEEE, MMMM d, yyyy')}`,
      `🌙 ${hijriStr}`,
      `📍 ${location.name || t('common.unknownLocation')}`,
      line,
      fmt('🌅', 'Fajr', prayerTimes.fajr),
      fmt('☀️', 'Sunrise', prayerTimes.sunrise),
      fmt('🔆', 'Dhuhr', prayerTimes.dhuhr),
      fmt('🌤', 'Asr', prayerTimes.asr),
      fmt('🌇', 'Maghrib', prayerTimes.maghrib),
      fmt('🌃', 'Isha', prayerTimes.isha),
      line,
      `"Indeed, prayer has been decreed`,
      `upon the believers at specified`,
      `times." — An-Nisa 4:103`,
    ];
    const text = lines.join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: t('share.title'), text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch {
      // User cancelled share or clipboard failed
      try {
        await navigator.clipboard.writeText(text);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch {
        setShareStatus('failed');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    }
  }, [prayerTimes, location, use24HourFormat, t]);

  if (!hasLocation || !prayerTimes) return null;

  const mainPrayers = [
    "Fajr",
    "Sunrise",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
  ] as const;
  const prayerTimesMap = {
    Fajr: prayerTimes.fajr,
    Sunrise: prayerTimes.sunrise,
    Dhuhr: prayerTimes.dhuhr,
    Asr: prayerTimes.asr,
    Maghrib: prayerTimes.maghrib,
    Isha: prayerTimes.isha,
  };

  const calculateProgress = () => {
    if (!nextPrayer) return 0;

    const prayerIndex = mainPrayers.indexOf(
      nextPrayer.name as (typeof mainPrayers)[number],
    );
    if (prayerIndex < 0) return 0;

    const remainingMs = nextPrayer.timeRemaining * 1000;
    if (remainingMs <= 0) return 100;

    const nowMs = currentTime.getTime();
    let elapsedMs: number;

    if (prayerIndex === 0) {
      const ishaMs = prayerTimesMap.Isha.getTime();
      if (nowMs >= ishaMs) {
        elapsedMs = nowMs - ishaMs;
      } else {
        const fajrMs = prayerTimesMap.Fajr.getTime();
        const nightMs = 24 * 3600000 - (ishaMs - fajrMs);
        elapsedMs = Math.max(0, nightMs - remainingMs);
      }
    } else {
      elapsedMs =
        nowMs - prayerTimesMap[mainPrayers[prayerIndex - 1]].getTime();
    }

    if (elapsedMs <= 0) return 0;

    const totalMs = elapsedMs + remainingMs;
    if (totalMs <= 0) return 0;

    return Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
  };

  const methodName =
    CALCULATION_METHODS.find((m) => m.id === calculationMethod)?.name ||
    "Standard Method";

  const getPrayerDisplayName = (prayer: string) => {
    const key = prayer as keyof typeof PRAYER_NAMES;
    if (language === "bn")
      return t(`prayer.names.${key}` as "prayer.names.Fajr");
    if (language === "ar") return PRAYER_NAMES[key]?.ar || prayer;
    return PRAYER_NAMES[key]?.en || prayer;
  };

  const getNextPrayerDisplayName = () => {
    if (!nextPrayer) return "";
    return getPrayerDisplayName(nextPrayer.name);
  };

  return (
    <Card className="islamic-border overflow-hidden fade-in">
      {/* ═══ HEADER — Rich Arabian gradient with full decorations ═══ */}
      <div className="islamic-gradient-header relative overflow-hidden pb-6 sm:pb-8">
        {/* Tessellation overlay */}
        <TessellationOverlay />

        {/* Arabesque corners */}
        <ArabesqueCorner className="absolute top-0 left-0 w-14 h-14 sm:w-20 sm:h-20 opacity-60" />
        <ArabesqueCorner className="absolute top-0 right-0 w-14 h-14 sm:w-20 sm:h-20 opacity-60 -scale-x-100" />

        {/* Hanging lanterns */}
        <div
          className="absolute top-0 left-[15%] w-4 h-8 sm:w-5 sm:h-10 opacity-40 hidden sm:block"
          style={{ animation: "lantern-sway 5s ease-in-out infinite" }}
        >
          <HangingLantern className="w-full h-full" />
        </div>
        <div
          className="absolute top-0 right-[10%] w-3.5 h-7 sm:w-4 sm:h-8 opacity-30 hidden sm:block"
          style={{ animation: "lantern-sway 4s ease-in-out infinite 0.5s" }}
        >
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
                {t("prayer.title")}
                {/* Small 8-pointed star accent */}
                <svg viewBox="0 0 16 16" className="w-3 h-3 sm:w-4 sm:h-4 text-[hsl(40,85%,52%)] opacity-60">
                  <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
                </svg>
              </h2>
              <p className="text-white/70 text-xs sm:text-sm">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="text-end">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 border border-white/10">
                <p className="text-sm sm:text-lg font-semibold arabic-text text-white">
                  {hijriDate.day} {hijriDate.monthName.ar}
                </p>
              </div>
              <p className="text-white/60 text-xs mt-1">{hijriDate.year} AH</p>
            </div>
          </div>

          {/* ═══ NEXT PRAYER HIGHLIGHT — Glass card with gold accents ═══ */}
          {nextPrayer && (
            <div className="relative glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 mt-3 sm:mt-4 border-s-4 border-s-[hsl(40,85%,52%)]">
              {/* Subtle arabesque in corner */}
              <div className="absolute top-1 right-1 w-10 h-10 sm:w-14 sm:h-14 opacity-20 pointer-events-none">
                <svg viewBox="0 0 50 50" fill="rgba(200,168,78,0.5)">
                  <path d="M25 5L28 15L38 12L32 20L45 25L32 30L38 38L28 35L25 45L22 35L12 38L18 30L5 25L18 20L12 12L22 15Z" />
                </svg>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-white/70 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] mb-0.5 sm:mb-1">
                    {t("prayer.nextPrayer")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                    {getNextPrayerDisplayName()}
                  </p>
                  <p className="text-white/60 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    {t("prayer.at")}{" "}
                    {formatPrayerTime(nextPrayer.time, use24HourFormat)}
                  </p>
                </div>
                <div className="text-start">
                  <p className="text-white/70 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] mb-0.5 sm:mb-1">
                    {t("prayer.timeRemaining")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold countdown-display tabular-nums text-white">
                    {formatCountdown(nextPrayer.timeRemaining, showSeconds)}
                  </p>
                </div>
              </div>

              {/* Progress bar with gold gradient */}
              <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${calculateProgress()}%`,
                    background: "linear-gradient(90deg, rgba(200,168,78,0.6) 0%, rgba(255,255,255,0.5) 100%)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gold ornamental border strip between header and list */}
      <div className="gold-border-strip" />

      {/* ═══ PRAYER TIMES LIST — Parchment style with ornamental dividers ═══ */}
      <CardContent className="px-1 sm:px-2 py-1.5 sm:py-2 relative">
        {/* Arabesque corner ornament */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#996b2f" stroke="#996b2f" strokeWidth="0.5">
            <path d="M50 5L60 20L77 10L70 28L90 25L78 40L95 50L78 60L90 75L70 72L77 90L60 80L50 95L40 80L23 90L30 72L10 75L22 60L5 50L22 40L10 25L30 28L23 10L40 20Z" />
            <circle cx="50" cy="50" r="15" fill="none" />
          </svg>
        </div>

          {mainPrayers.map((prayer, index) => {
            const IconComponent = PrayerIcons[prayer];
            const isNext = nextPrayer?.name === prayer;
            const prayerTime = prayerTimesMap[prayer];
            const isPassed = prayerTime < currentTime && !isNext;

            return (
              <div key={prayer}>
                {/* Ornamental star divider between rows */}
                {index > 0 && <StarDivider />}

                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-3 sm:px-5 sm:py-4 rounded-xl transition-all duration-300 mx-1 sm:mx-2",
                    isNext && "relative bg-primary/8 dark:bg-primary/12 shadow-sm",
                    isPassed && "opacity-40",
                    !isNext && !isPassed && "hover:bg-muted/40",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Active prayer gold left accent */}
                  {isNext && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 sm:w-1 rounded-full bg-gradient-to-b from-[hsl(40,85%,52%)] via-[hsl(158,64%,28%)] to-[hsl(40,85%,52%)]" />
                  )}

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all shrink-0",
                        isNext
                          ? "islamic-gradient text-white shadow-lg shadow-primary/25"
                          : "bg-muted/70 text-muted-foreground",
                      )}
                    >
                      <IconComponent />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-semibold text-base sm:text-lg leading-tight",
                          isNext && "text-primary",
                        )}
                      >
                        {getPrayerDisplayName(prayer)}
                      </p>
                      {language !== "ar" && (
                        <p className="text-xs sm:text-sm text-muted-foreground/60 arabic-text text-left leading-tight mt-0.5">
                          {PRAYER_NAMES[prayer as keyof typeof PRAYER_NAMES]?.ar || ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <p
                      className={cn(
                        "text-lg sm:text-xl font-bold tabular-nums",
                        isNext && "text-primary",
                      )}
                    >
                      {formatPrayerTime(prayerTime, use24HourFormat)}
                    </p>
                    {isNext && (
                      <p className="text-[10px] sm:text-xs text-primary font-medium flex items-center justify-end gap-1 sm:gap-1.5 mt-0.5">
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary" />
                        </span>
                        {t("prayer.comingUp")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {/* ═══ FOOTER — Ornamental divider + method info ═══ */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          {/* Arabesque divider */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(40,70%,50%,0.3)]" />
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[hsl(40,85%,52%)] opacity-30">
              <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8Z" fill="currentColor" />
            </svg>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(40,70%,50%,0.3)]" />
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground/70">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60">
                <path
                  d="M8 1C4.7 1 2 3.7 2 7c0 4.5 6 8 6 8s6-3.5 6-8c0-3.3-2.7-6-6-6zm0 8.5c-1.4 0-2.5-1.1-2.5-2.5S6.6 4.5 8 4.5s2.5 1.1 2.5 2.5S9.4 9.5 8 9.5z"
                  fill="currentColor"
                />
              </svg>
              {location.name || t("common.unknownLocation")}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/50">{methodName.split(",")[0]}</span>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground/60 hover:text-muted-foreground"
                title={t('share.button')}
              >
                {shareStatus === 'copied' ? (
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-green-500">
                    <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : shareStatus === 'failed' ? (
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-red-500">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
                    <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <line x1="5.8" y1="7" x2="10.2" y2="4" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="5.8" y1="9" x2="10.2" y2="12" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                )}
                <span className="text-[10px] sm:text-xs">
                  {shareStatus === 'copied' ? t('share.copied') : shareStatus === 'failed' ? t('share.failed') : t('share.button')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
