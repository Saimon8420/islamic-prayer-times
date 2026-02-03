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
  const hijriDate = useMemo(() => gregorianToHijri(today), [today]);
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

  // Sky tracker math
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
    H = 62;
  const cx = 200,
    cy = 48;
  const rx = 170,
    ry = 34;

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

  // Theme-aware SVG colors — night uses teal/gold to match site palette
  const arcColor = isDay ? "#FDB813" : "#d4a017";
  const dashStroke = isDay
    ? isDark
      ? "rgba(253,184,19,0.2)"
      : "rgba(180,160,120,0.25)"
    : isDark
      ? "rgba(30,125,92,0.18)"
      : "rgba(30,125,92,0.2)";
  const horizonStroke = isDay
    ? isDark
      ? "rgba(180,160,100,0.2)"
      : "rgba(139,119,80,0.25)"
    : isDark
      ? "rgba(30,125,92,0.15)"
      : "rgba(30,125,92,0.2)";
  const timeLabelColor = isDay
    ? isDark
      ? "rgba(220,200,160,0.85)"
      : "rgba(80,60,20,0.65)"
    : isDark
      ? "rgba(200,180,120,0.8)"
      : "rgba(30,80,55,0.6)";
  const moonCutout = isDark ? "hsl(160,30%,10%)" : "hsl(45,40%,97%)";

  // Unique gradient IDs per instance (avoids clashes when multiple on same page)
  const id = (name: string) => `${name}_${uid}`;

  return (
    <div className="islamic-border overflow-hidden fade-in">
      {/* Date header */}
      {!hideDate && (
        <div className="px-3 pt-2.5 pb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg islamic-gradient text-white shadow-sm">
              <span className="text-sm font-bold">{format(today, "d")}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight truncate">
                {format(today, "EEEE")}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                {format(today, "d MMM yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 text-right">
              <p className="text-sm font-semibold text-foreground leading-tight arabic-text truncate">
                {arabicWeekday}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                {hijriDate.day} {hijriDate.monthName.en} {hijriDate.year}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg islamic-gradient-gold text-white shadow-sm">
              <span className="text-sm font-bold">{hijriDate.day}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sky tracker arc */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ display: "block", direction: "ltr" }}
      >
        <defs>
          <linearGradient id={id("dtSkyL")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDB813" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#87CEEB" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FDB813" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={id("dtSkyD")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B6914" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#2a5a7a" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#8B6914" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={id("ntSkyL")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(158,64%,32%)" stopOpacity="0.08" />
            <stop
              offset="50%"
              stopColor="hsl(160,35%,20%)"
              stopOpacity="0.12"
            />
            <stop
              offset="100%"
              stopColor="hsl(158,64%,32%)"
              stopOpacity="0.08"
            />
          </linearGradient>
          <linearGradient id={id("ntSkyD")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(158,40%,18%)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="hsl(160,35%,12%)" stopOpacity="0.2" />
            <stop
              offset="100%"
              stopColor="hsl(158,40%,18%)"
              stopOpacity="0.15"
            />
          </linearGradient>
          <radialGradient id={id("sg")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDB813" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FDB813" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("mg")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4a017" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4a017" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky tint */}
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

        {/* Night stars — gold to match Islamic palette */}
        {!isDay && (
          <g opacity={isDark ? "0.3" : "0.35"}>
            <circle cx="50" cy="8" r="0.6" fill="#d4a017" />
            <circle cx="130" cy="16" r="0.8" fill="#d4a017" />
            <circle cx="200" cy="5" r="0.5" fill="#d4a017" />
            <circle cx="270" cy="13" r="0.7" fill="#d4a017" />
            <circle cx="350" cy="7" r="0.6" fill="#d4a017" />
            <circle cx="95" cy="28" r="0.5" fill="#d4a017" />
            <circle cx="310" cy="25" r="0.5" fill="#d4a017" />
          </g>
        )}

        {/* Dashed arc */}
        <path
          d={arcPath}
          fill="none"
          stroke={dashStroke}
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* Traversed arc */}
        {traversedPath && (
          <path
            d={traversedPath}
            fill="none"
            stroke={arcColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.6"
          />
        )}

        {/* Horizon */}
        <line
          x1="20"
          y1={cy}
          x2={W - 20}
          y2={cy}
          stroke={horizonStroke}
          strokeWidth="0.8"
        />

        {/* Sun / Moon */}
        {isDay ? (
          <g>
            <circle cx={iconX} cy={iconY} r="10" fill={`url(#${id("sg")})`} />
            <circle cx={iconX} cy={iconY} r="4.5" fill="#FDB813" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const r = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={iconX + 6.5 * Math.cos(r)}
                  y1={iconY + 6.5 * Math.sin(r)}
                  x2={iconX + 9 * Math.cos(r)}
                  y2={iconY + 9 * Math.sin(r)}
                  stroke="#FDB813"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        ) : (
          <g>
            <circle cx={iconX} cy={iconY} r="9" fill={`url(#${id("mg")})`} />
            <circle cx={iconX} cy={iconY} r="4" fill="#d4a017" />
            <circle cx={iconX + 1.8} cy={iconY - 1} r="3.3" fill={moonCutout} />
          </g>
        )}

        {/* Preview label (test mode) */}
        {previewLabel && (
          <text
            x="12"
            y="12"
            fill={
              isDay
                ? isDark
                  ? "rgba(253,184,19,0.8)"
                  : "rgba(80,60,20,0.6)"
                : isDark
                  ? "rgba(200,180,120,0.7)"
                  : "rgba(30,80,55,0.5)"
            }
            fontSize="9"
            fontWeight="600"
          >
            {previewLabel} — {format(effectiveTime, "h:mm a")}
          </text>
        )}

        {/* Time labels */}
        <text x="22" y={cy + 11} fill={timeLabelColor} fontSize="8">
          {isDay ? `☀ ${sunriseLabel}` : `☽ ${maghribLabel}`}
        </text>
        <text
          x={W - 22}
          y={cy + 11}
          fill={timeLabelColor}
          fontSize="8"
          textAnchor="end"
        >
          {isDay ? `${maghribLabel} ☾` : `${nextFajrLabel} ☀`}
        </text>
      </svg>
    </div>
  );
};
