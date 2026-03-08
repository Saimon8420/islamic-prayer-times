import { useState, useEffect, useMemo, useId } from "react";
import { format } from "date-fns";
import { addDays, subDays } from "date-fns";
import { useStore } from "../../store/useStore";
import {
  gregorianToHijri,
  getArabicWeekday,
} from "../../services/hijriService";
import {
  calculatePrayerTimes,
  formatPrayerTime,
} from "../../services/prayerService";

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

interface DateDisplayProps {
  /** Offset in ms added to current time — for testing day/night side by side */
  timeOffset?: number;
  /** Hide the date header row (for test preview cards) */
  hideDate?: boolean;
  /** Optional label shown top-left inside the SVG */
  previewLabel?: string;
}

export const DateDisplay = ({
  timeOffset = 0,
  hideDate = false,
  previewLabel,
}: DateDisplayProps) => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);
  const hijriAdjustment = useStore((state) => state.hijriAdjustment);
  const isDark = useIsDarkMode();
  const uid = useId().replace(/:/g, "");

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const effectiveTime = useMemo(
    () => new Date(currentTime.getTime() + timeOffset),
    [currentTime, timeOffset],
  );
  const effectiveDateStr = effectiveTime.toDateString();

  const today = useMemo(() => new Date(), []);
  const hijriDate = useMemo(() => gregorianToHijri(today, hijriAdjustment), [today, hijriAdjustment]);
  const arabicWeekday = useMemo(() => getArabicWeekday(today), [today]);

  const todayTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(
      location.lat,
      location.lon,
      effectiveTime,
      calculationMethod,
      madhab,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, calculationMethod, madhab, effectiveDateStr]);

  const tomorrowTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(
      location.lat,
      location.lon,
      addDays(effectiveTime, 1),
      calculationMethod,
      madhab,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, calculationMethod, madhab, effectiveDateStr]);

  const yesterdayTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(
      location.lat,
      location.lon,
      subDays(effectiveTime, 1),
      calculationMethod,
      madhab,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, calculationMethod, madhab, effectiveDateStr]);

  if (!location || !todayTimes || !tomorrowTimes || !yesterdayTimes)
    return null;

  // ── Sky tracker math (unchanged) ──
  const now = effectiveTime.getTime();
  const sunrise = todayTimes.sunrise.getTime();
  const maghrib = todayTimes.maghrib.getTime();
  const nextFajr = tomorrowTimes.fajr.getTime();
  const prevMaghrib = yesterdayTimes.maghrib.getTime();

  const isDay = now >= sunrise && now < maghrib;

  let progress: number;
  if (isDay) {
    progress = (now - sunrise) / (maghrib - sunrise);
  } else if (now >= maghrib) {
    progress = (now - maghrib) / (nextFajr - maghrib);
  } else {
    progress = (now - prevMaghrib) / (sunrise - prevMaghrib);
  }
  progress = Math.max(0, Math.min(1, progress));

  // Elliptical arc — wide and compact
  const W = 400,
    H = 72;
  const cx = 200,
    cy = 56;
  const rx = 170,
    ry = 38;

  const angle = progress * Math.PI;
  const iconX = cx - rx * Math.cos(angle);
  const iconY = cy - ry * Math.sin(angle);

  const arcStartX = cx - rx;
  const arcEndX = cx + rx;
  const arcPath = `M ${arcStartX},${cy} A ${rx},${ry} 0 0 1 ${arcEndX},${cy}`;
  const traversedPath =
    progress > 0.001
      ? `M ${arcStartX},${cy} A ${rx},${ry} 0 0 1 ${iconX},${iconY}`
      : "";

  const sunriseLabel = formatPrayerTime(todayTimes.sunrise, use24HourFormat);
  const maghribLabel = formatPrayerTime(todayTimes.maghrib, use24HourFormat);
  const nextFajrLabel = formatPrayerTime(tomorrowTimes.fajr, use24HourFormat);

  // ── Arabian palette colors ──
  const goldMain = "#c8a84e";
  const goldBright = "#d4a017";
  const emerald = "#1a6b4a";

  const dashStroke = isDay
    ? isDark
      ? "rgba(200,168,78,0.18)"
      : "rgba(153,107,47,0.2)"
    : isDark
      ? "rgba(200,168,78,0.12)"
      : "rgba(153,107,47,0.15)";
  const horizonStroke = isDark
    ? "rgba(200,168,78,0.12)"
    : "rgba(153,107,47,0.18)";
  const timeLabelColor = isDay
    ? isDark
      ? "rgba(200,168,78,0.85)"
      : "rgba(100,70,20,0.7)"
    : isDark
      ? "rgba(200,168,78,0.75)"
      : "rgba(100,70,20,0.55)";
  const moonCutout = isDark ? "hsl(222,25%,10%)" : "hsl(38,35%,96%)";

  // Unique gradient IDs per instance
  const id = (name: string) => `${name}_${uid}`;

  return (
    <div className="islamic-border overflow-hidden fade-in relative">
      {/* Arabesque corner ornament — top right */}
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-[0.04] pointer-events-none"
        style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 5L60 20L77 10L70 28L90 25L78 40L95 50L78 60L90 75L70 72L77 90L60 80L50 95L40 80L23 90L30 72L10 75L22 60L5 50L22 40L10 25L30 28L23 10L40 20Z' fill='%23996b2f'/%3E%3C/svg%3E") no-repeat center`,
          backgroundSize: "contain",
        }}
      />

      {/* Date header */}
      {!hideDate && (
        <div className="px-4 pt-3 pb-1.5 flex items-center justify-between gap-2 relative z-10">
          {/* Gregorian date — left side */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl islamic-gradient text-white shadow-md relative overflow-hidden">
              <span className="text-base font-bold relative z-10">{format(today, "d")}</span>
              {/* Subtle inner pattern */}
              <div className="absolute inset-0 opacity-20" style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)"
              }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight truncate">
                {format(today, "EEEE")}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                {format(today, "d MMMM yyyy")}
              </p>
            </div>
          </div>

          {/* Decorative center — small 8-pointed star */}
          <div className="hidden sm:flex items-center">
            <svg viewBox="0 0 20 20" className="w-4 h-4 text-secondary opacity-40" fill="currentColor">
              <path d="M10 0l2 6.5L18 5.5l-4.5 4L16 16l-6-3.5L4 16l2.5-6.5L2 5.5l6 1z" />
            </svg>
          </div>

          {/* Hijri date — right side */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="min-w-0 text-right">
              <p className="text-sm font-semibold text-foreground leading-tight arabic-text truncate">
                {arabicWeekday}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                {hijriDate.day} {hijriDate.monthName.en} {hijriDate.year}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl islamic-gradient-gold text-white shadow-md relative overflow-hidden">
              <span className="text-base font-bold relative z-10">{hijriDate.day}</span>
              {/* Crescent watermark inside badge */}
              <svg viewBox="0 0 20 20" className="absolute w-6 h-6 opacity-20 -bottom-0.5 -right-0.5" fill="white">
                <path d="M12 2a8 8 0 0 0 6 6A8 8 0 0 1 12 14a8 8 0 0 1 0-12z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Sky tracker arc ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ display: "block", direction: "ltr" }}
      >
        <defs>
          {/* Day sky — warm sand/gold */}
          <linearGradient id={id("dtSkyL")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={goldMain} stopOpacity="0.06" />
            <stop offset="30%" stopColor="#e8d5a0" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#87CEEB" stopOpacity="0.06" />
            <stop offset="70%" stopColor="#e8d5a0" stopOpacity="0.08" />
            <stop offset="100%" stopColor={goldMain} stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id={id("dtSkyD")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={goldMain} stopOpacity="0.05" />
            <stop offset="50%" stopColor="#2a4a6a" stopOpacity="0.1" />
            <stop offset="100%" stopColor={goldMain} stopOpacity="0.05" />
          </linearGradient>
          {/* Night sky — deep Arabian night */}
          <linearGradient id={id("ntSkyL")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={emerald} stopOpacity="0.05" />
            <stop offset="50%" stopColor="#1a3a5a" stopOpacity="0.08" />
            <stop offset="100%" stopColor={emerald} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={id("ntSkyD")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0a1628" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#0d1f3c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0a1628" stopOpacity="0.2" />
          </linearGradient>
          {/* Sun glow */}
          <radialGradient id={id("sg")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={goldBright} stopOpacity="0.5" />
            <stop offset="60%" stopColor={goldBright} stopOpacity="0.15" />
            <stop offset="100%" stopColor={goldBright} stopOpacity="0" />
          </radialGradient>
          {/* Moon glow */}
          <radialGradient id={id("mg")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={goldMain} stopOpacity="0.4" />
            <stop offset="100%" stopColor={goldMain} stopOpacity="0" />
          </radialGradient>
          {/* Traversed arc gradient */}
          <linearGradient id={id("arcGrad")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDay ? goldBright : goldMain} stopOpacity="0.3" />
            <stop offset="50%" stopColor={isDay ? goldBright : goldMain} stopOpacity="0.7" />
            <stop offset="100%" stopColor={isDay ? goldBright : goldMain} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Sky tint background */}
        <rect
          x="0"
          y="0"
          width={W}
          height={H}
          fill={
            isDay
              ? `url(#${id(isDark ? "dtSkyD" : "dtSkyL")})`
              : `url(#${id(isDark ? "ntSkyD" : "ntSkyL")})`
          }
        />

        {/* Night stars — gold, with twinkle via varying sizes */}
        {!isDay && (
          <g opacity={isDark ? "0.35" : "0.3"}>
            <circle cx="45" cy="8" r="0.7" fill={goldMain} />
            <circle cx="100" cy="15" r="0.5" fill={goldMain} />
            <circle cx="140" cy="6" r="0.9" fill={goldMain} />
            <circle cx="200" cy="4" r="0.6" fill={goldMain} />
            <circle cx="260" cy="12" r="0.8" fill={goldMain} />
            <circle cx="310" cy="6" r="0.5" fill={goldMain} />
            <circle cx="355" cy="10" r="0.7" fill={goldMain} />
            <circle cx="80" cy="25" r="0.4" fill={goldMain} />
            <circle cx="330" cy="22" r="0.4" fill={goldMain} />
            {/* Larger accent stars */}
            <g opacity="0.6">
              <path d={`M170 10l1 2.5 2.5 0-2 1.5 0.8 2.5-2.3-1.5-2.3 1.5 0.8-2.5-2-1.5 2.5 0z`} fill={goldMain} />
            </g>
          </g>
        )}

        {/* Mosque silhouette on horizon — subtle */}
        <g opacity={isDark ? "0.06" : "0.05"}>
          {/* Small mosque left */}
          <rect x="55" y={cy - 8} width="4" height="8" fill={isDay ? goldBright : goldMain} />
          <ellipse cx="62" cy={cy - 6} rx="6" ry="5" fill={isDay ? goldBright : goldMain} />
          <rect x="60" y={cy - 8} width="4" height="8" fill={isDay ? goldBright : goldMain} />
          <rect x="68" y={cy - 6} width="2" height="6" fill={isDay ? goldBright : goldMain} />
          <polygon points="69,${cy - 10} 70,${cy - 6} 68,${cy - 6}" fill={isDay ? goldBright : goldMain} />

          {/* Small mosque right */}
          <rect x="320" y={cy - 7} width="3" height="7" fill={isDay ? goldBright : goldMain} />
          <ellipse cx="328" cy={cy - 5} rx="7" ry="4.5" fill={isDay ? goldBright : goldMain} />
          <rect x="326" y={cy - 7} width="4" height="7" fill={isDay ? goldBright : goldMain} />
          <rect x="334" y={cy - 5} width="2" height="5" fill={isDay ? goldBright : goldMain} />

          {/* Center minaret */}
          <rect x="198" y={cy - 12} width="4" height="12" fill={isDay ? goldBright : goldMain} />
          <polygon points={`200,${cy - 16} 202,${cy - 12} 198,${cy - 12}`} fill={isDay ? goldBright : goldMain} />
        </g>

        {/* Dashed arc — track */}
        <path
          d={arcPath}
          fill="none"
          stroke={dashStroke}
          strokeWidth="1.2"
          strokeDasharray="5 3.5"
        />

        {/* Traversed arc — with gradient */}
        {traversedPath && (
          <path
            d={traversedPath}
            fill="none"
            stroke={`url(#${id("arcGrad")})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Horizon line */}
        <line
          x1="18"
          y1={cy}
          x2={W - 18}
          y2={cy}
          stroke={horizonStroke}
          strokeWidth="0.8"
        />

        {/* Sun / Moon — unchanged logic */}
        {isDay ? (
          <g>
            <circle cx={iconX} cy={iconY} r="12" fill={`url(#${id("sg")})`} />
            <circle cx={iconX} cy={iconY} r="5" fill={goldBright} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const r = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={iconX + 7 * Math.cos(r)}
                  y1={iconY + 7 * Math.sin(r)}
                  x2={iconX + 9.5 * Math.cos(r)}
                  y2={iconY + 9.5 * Math.sin(r)}
                  stroke={goldBright}
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              );
            })}
          </g>
        ) : (
          <g>
            <circle cx={iconX} cy={iconY} r="11" fill={`url(#${id("mg")})`} />
            <circle cx={iconX} cy={iconY} r="4.5" fill={goldMain} />
            <circle cx={iconX + 2} cy={iconY - 1} r="3.5" fill={moonCutout} />
          </g>
        )}

        {/* Preview label (test mode) */}
        {previewLabel && (
          <text
            x="12"
            y="12"
            fill={timeLabelColor}
            fontSize="9"
            fontWeight="600"
          >
            {previewLabel} — {format(effectiveTime, "h:mm a")}
          </text>
        )}

        {/* Time labels */}
        <text x="22" y={cy + 12} fill={timeLabelColor} fontSize="9" fontWeight="500">
          {isDay ? `☀ ${sunriseLabel}` : `☽ ${maghribLabel}`}
        </text>
        <text
          x={W - 22}
          y={cy + 12}
          fill={timeLabelColor}
          fontSize="9"
          fontWeight="500"
          textAnchor="end"
        >
          {isDay ? `${maghribLabel} ☾` : `${nextFajrLabel} ☀`}
        </text>
      </svg>
    </div>
  );
};
