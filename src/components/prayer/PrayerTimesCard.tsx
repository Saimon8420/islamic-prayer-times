import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
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
import { SupplementaryTimes } from "./SupplementaryTimes";
import { ShareCardDialog } from "../share/ShareCardDialog";
import { SkyArc, type SkyWaypoint } from "./SkyArc";
import { EidCountdown } from "./EidCountdown";

const mainPrayers = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const;
type PrayerKey = (typeof mainPrayers)[number];

// Short labels for the sky-arc (kept tight so six fit on a phone).
const ARC_LABELS: Record<PrayerKey, string> = {
  Fajr: "FAJR",
  Sunrise: "RISE",
  Dhuhr: "DHUHR",
  Asr: "ASR",
  Maghrib: "MAGH",
  Isha: "ISHA",
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
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [shareOpen, setShareOpen] = useState(false);

  if (!hasLocation || !prayerTimes) return null;

  const prayerTimesMap: Record<PrayerKey, Date> = {
    Fajr: prayerTimes.fajr,
    Sunrise: prayerTimes.sunrise,
    Dhuhr: prayerTimes.dhuhr,
    Asr: prayerTimes.asr,
    Maghrib: prayerTimes.maghrib,
    Isha: prayerTimes.isha,
  };

  const waypoints: SkyWaypoint[] = mainPrayers.map((p) => ({
    key: p,
    label: ARC_LABELS[p],
    time: prayerTimesMap[p],
  }));

  const calculateProgress = () => {
    if (!nextPrayer) return 0;
    const prayerIndex = mainPrayers.indexOf(nextPrayer.name as PrayerKey);
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
      elapsedMs = nowMs - prayerTimesMap[mainPrayers[prayerIndex - 1]].getTime();
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
    if (language === "bn") return t(`prayer.names.${key}` as "prayer.names.Fajr");
    if (language === "ar") return PRAYER_NAMES[key]?.ar || prayer;
    return PRAYER_NAMES[key]?.en || prayer;
  };

  const nextName = nextPrayer ? getPrayerDisplayName(nextPrayer.name) : "";

  return (
    <div className="obs-panel overflow-hidden fade-in">
      {/* faint heritage watermark, top-right */}
      <div className="girih-watermark pointer-events-none absolute right-3 top-3 h-20 w-20 sm:h-28 sm:w-28" />

      <div className="relative p-4 pb-2 sm:p-6 sm:pb-3">
        {/* ── meta row ── */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="label-mono">{t("prayer.title")}</p>
            <p className="mt-1 font-display text-base font-semibold text-foreground sm:text-lg">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
            <div className="mt-2">
              <EidCountdown />
            </div>
          </div>
          <div className="text-right">
            <p className="label-mono">{hijriDate.year} AH</p>
            <p className="arabic-text mt-1 text-base font-semibold text-secondary sm:text-lg">
              {hijriDate.day} {hijriDate.monthName.ar}
            </p>
          </div>
        </div>

        {/* ── the sky-arc (signature) ── */}
        <SkyArc
          waypoints={waypoints}
          nextKey={nextPrayer?.name}
          now={currentTime}
        />

        {/* ── next prayer highlight ── */}
        {nextPrayer && (
          <div className="mt-2 rounded-2xl border border-secondary/25 bg-secondary/[0.06] p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="label-mono">{t("prayer.nextPrayer")}</p>
                <p className="mt-1 font-display text-2xl font-semibold leading-none text-foreground sm:text-3xl">
                  {nextName}
                  <span className="arabic-text ml-2 text-lg text-muted-foreground sm:text-xl">
                    {PRAYER_NAMES[nextPrayer.name as keyof typeof PRAYER_NAMES]?.ar}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {t("prayer.at")}{" "}
                  {formatPrayerTime(nextPrayer.time, use24HourFormat)}
                </p>
              </div>
              <div className="text-right">
                <p className="label-mono">{t("prayer.timeRemaining")}</p>
                <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-primary sm:text-3xl">
                  {formatCountdown(nextPrayer.timeRemaining, showSeconds)}
                </p>
              </div>
            </div>

            {/* progress */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10 sm:mt-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-out"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mx-4 my-1 sm:mx-6">
        <div className="heritage-rule" />
      </div>

      {/* ── prayer list ── */}
      <div className="relative px-2 py-2 sm:px-3">
        <div className="grid lg:grid-cols-2 lg:items-start lg:gap-x-6">
          <div>
            {mainPrayers.map((prayer) => {
              const isNext = nextPrayer?.name === prayer;
              const prayerTime = prayerTimesMap[prayer];
              const isPassed = prayerTime < currentTime && !isNext;

              return (
                <div
                  key={prayer}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-3 transition-colors sm:px-4",
                    isNext && "bg-secondary/[0.07]",
                    isPassed && "opacity-40",
                    !isNext && !isPassed && "hover:bg-foreground/[0.03]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        isNext
                          ? "next-pulse bg-secondary"
                          : isPassed
                            ? "bg-muted-foreground/40"
                            : "bg-muted-foreground/60",
                      )}
                    />
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-display text-[15px] font-semibold leading-tight sm:text-base",
                          isNext ? "text-secondary" : "text-foreground",
                        )}
                      >
                        {getPrayerDisplayName(prayer)}
                      </p>
                      {language !== "ar" && (
                        <p className="arabic-text mt-0.5 text-xs leading-tight text-muted-foreground/70">
                          {PRAYER_NAMES[prayer as keyof typeof PRAYER_NAMES]?.ar || ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-right">
                    {isNext && (
                      <span className="label-mono hidden text-secondary sm:inline">
                        {t("prayer.comingUp")}
                      </span>
                    )}
                    <p
                      className={cn(
                        "font-mono text-lg font-medium tabular-nums sm:text-xl",
                        isNext ? "text-primary" : "text-foreground",
                      )}
                    >
                      {formatPrayerTime(prayerTime, use24HourFormat)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <SupplementaryTimes
            prayerTimes={prayerTimes}
            use24HourFormat={use24HourFormat}
          />
        </div>

        {/* ── footer meta ── */}
        <div className="mt-2 flex items-center justify-between gap-2 px-3 pb-2 sm:px-4">
          <span className="label-mono truncate">
            {location.name || t("common.unknownLocation")}
            <span className="mx-1.5 text-muted-foreground/40">·</span>
            {methodName.split(",")[0]}
          </span>
          <button
            onClick={() => setShareOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/[0.06] px-3 py-1.5 text-primary transition-colors hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98]"
            title={t("share.button")}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
              <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="5.8" y1="7" x2="10.2" y2="4" stroke="currentColor" strokeWidth="1.2" />
              <line x1="5.8" y1="9" x2="10.2" y2="12" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className="label-mono !text-primary">{t("share.button")}</span>
          </button>
        </div>
      </div>

      <ShareCardDialog open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
};
