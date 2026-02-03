import { useEffect, useState, useMemo } from "react";
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
import { gregorianToHijri } from "../../services/hijriService";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/useTranslation";

// Custom SVG Icons for prayers
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
      <path
        d="M8 17h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  Sunrise: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="2"
      />
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
      <circle
        cx="12"
        cy="12"
        r="5"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="2"
      />
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
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Maghrib: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path
        d="M12 21a9 9 0 0 0 0-18 9 9 0 0 0 0 18z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 3v3M21 12h-3M12 21v-3M3 12h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
      <path
        d="M17 4l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5L17 4z"
        fill="currentColor"
      />
      <path
        d="M20 9l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5L20 9z"
        fill="currentColor"
      />
    </svg>
  ),
};

export const PrayerTimesCard = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);
  const { t, language } = useTranslation();

  const [currentTime, setCurrentTime] = useState(new Date());

  const hasLocation = location !== null;

  // Calculate prayer times
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

  // Get hijri date
  const hijriDate = useMemo(() => gregorianToHijri(new Date()), []);

  // Get next prayer
  const nextPrayer = useMemo(() => {
    if (!hasLocation) return null;
    return getNextPrayer(location.lat, location.lon, calculationMethod, madhab);
  }, [hasLocation, location, calculationMethod, madhab, currentTime]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

    // Remaining ms until next prayer
    const remainingMs = nextPrayer.timeRemaining * 1000;
    if (remainingMs <= 0) return 100;

    // Elapsed ms since previous prayer
    const nowMs = currentTime.getTime();
    let elapsedMs: number;

    if (prayerIndex === 0) {
      // Next is Fajr — previous period started at Isha
      const ishaMs = prayerTimesMap.Isha.getTime();
      if (nowMs >= ishaMs) {
        elapsedMs = nowMs - ishaMs;
      } else {
        // Pre-dawn: estimate night from today's Fajr/Isha span
        const fajrMs = prayerTimesMap.Fajr.getTime();
        const nightMs = 24 * 3600000 - (ishaMs - fajrMs);
        elapsedMs = Math.max(0, nightMs - remainingMs);
      }
    } else {
      elapsedMs =
        nowMs - prayerTimesMap[mainPrayers[prayerIndex - 1]].getTime();
    }

    if (elapsedMs <= 0) return 0;

    // total = elapsed + remaining (always self-consistent)
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
      {/* Header with beautiful gradient */}
      <div className="islamic-gradient p-6 text-white relative mosque-header">
        {/* Decorative crescent */}
        <div className="crescent-decoration w-32 h-32 -top-8 -right-8" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{t("prayer.title")}</h2>
              <p className="text-white/80 text-sm">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="text-end">
              <p className="text-lg font-semibold arabic-text">
                {hijriDate.day} {hijriDate.monthName.ar}
              </p>
              <p className="text-white/80 text-sm">{hijriDate.year} AH</p>
            </div>
          </div>

          {/* Next Prayer Highlight */}
          {nextPrayer && (
            <div className="glass-card rounded-2xl p-5 mt-4 border-s-4 border-s-amber-400/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">
                    {t("prayer.nextPrayer")}
                  </p>
                  <p className="text-3xl font-bold text-white drop-shadow-sm">
                    {getNextPrayerDisplayName()}
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    {t("prayer.at")}{" "}
                    {formatPrayerTime(nextPrayer.time, use24HourFormat)}
                  </p>
                </div>
                <div className="text-start">
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">
                    {t("prayer.timeRemaining")}
                  </p>
                  <p className="text-3xl font-bold countdown-display tabular-nums text-white">
                    {formatCountdown(nextPrayer.timeRemaining)}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white/50 transition-all duration-500 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prayer Times List */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {mainPrayers.map((prayer, index) => {
            const IconComponent = PrayerIcons[prayer];
            const isNext = nextPrayer?.name === prayer;
            const prayerTime = prayerTimesMap[prayer];
            const isPassed = prayerTime < currentTime && !isNext;

            return (
              <div
                key={prayer}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                  isNext && "next-prayer-glow bg-primary/10",
                  isPassed && "opacity-50",
                  !isNext && !isPassed && "hover:bg-muted/50",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      isNext
                        ? "islamic-gradient text-white shadow-lg"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <IconComponent />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-semibold text-lg",
                        isNext && "text-primary",
                      )}
                    >
                      {getPrayerDisplayName(prayer)}
                    </p>
                    {language !== "ar" && (
                      <p className="text-sm text-muted-foreground arabic-text text-left">
                        {PRAYER_NAMES[prayer as keyof typeof PRAYER_NAMES]
                          ?.ar || ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <p
                    className={cn(
                      "text-xl font-bold tabular-nums",
                      isNext && "text-primary",
                    )}
                  >
                    {formatPrayerTime(prayerTime, use24HourFormat)}
                  </p>
                  {isNext && (
                    <p className="text-xs text-primary font-medium flex items-center justify-end gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                      {t("prayer.comingUp")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Method info */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <span>{location.name || t("common.unknownLocation")}</span>
          <span>{methodName.split(",")[0]}</span>
        </div>
      </CardContent>
    </Card>
  );
};
