import { useState, useEffect, useMemo, useId } from 'react';
import { addDays, subDays } from 'date-fns';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes } from '../../services/prayerService';

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

/**
 * Global, fixed sky-tracker background — option (b):
 * lives in the upper ~45vh of the viewport behind all content, fades to
 * transparent below so cards/text remain readable. Sun/moon position
 * tracks the current solar day for the user's location.
 */
export const SkyBackground = () => {
  const location = useStore((s) => s.location);
  const calculationMethod = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);
  const isDark = useIsDarkMode();
  const uid = useId().replace(/:/g, '');

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dateKey = currentTime.toDateString();

  const todayTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(location.lat, location.lon, currentTime, calculationMethod, madhab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, calculationMethod, madhab, dateKey]);

  const tomorrowTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(location.lat, location.lon, addDays(currentTime, 1), calculationMethod, madhab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, calculationMethod, madhab, dateKey]);

  const yesterdayTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(location.lat, location.lon, subDays(currentTime, 1), calculationMethod, madhab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, calculationMethod, madhab, dateKey]);

  if (!location || !todayTimes || !tomorrowTimes || !yesterdayTimes) return null;

  const now = currentTime.getTime();
  const sunrise = todayTimes.sunrise.getTime();
  const maghrib = todayTimes.maghrib.getTime();
  const nextFajr = tomorrowTimes.fajr.getTime();
  const prevMaghrib = yesterdayTimes.maghrib.getTime();
  const isDay = now >= sunrise && now < maghrib;

  let progress: number;
  if (isDay) progress = (now - sunrise) / (maghrib - sunrise);
  else if (now >= maghrib) progress = (now - maghrib) / (nextFajr - maghrib);
  else progress = (now - prevMaghrib) / (sunrise - prevMaghrib);
  progress = Math.max(0, Math.min(1, progress));

  const W = 400;
  const H = 120;
  const cx = 200;
  const cy = 95;
  const rx = 185;
  const ry = 70;

  const angle = progress * Math.PI;
  const iconX = cx - rx * Math.cos(angle);
  const iconY = cy - ry * Math.sin(angle);

  const arcStartX = cx - rx;
  const arcEndX = cx + rx;
  const arcPath = `M ${arcStartX},${cy} A ${rx},${ry} 0 0 1 ${arcEndX},${cy}`;
  const traversedPath =
    progress > 0.001
      ? `M ${arcStartX},${cy} A ${rx},${ry} 0 0 1 ${iconX},${iconY}`
      : '';

  const goldMain = '#c8a84e';
  const goldBright = '#d4a017';
  const moonCutout = isDark ? 'hsl(222,25%,10%)' : 'hsl(38,35%,96%)';

  const dashStroke = isDay
    ? isDark ? 'rgba(200,168,78,0.16)' : 'rgba(153,107,47,0.18)'
    : isDark ? 'rgba(200,168,78,0.13)' : 'rgba(153,107,47,0.14)';

  const id = (name: string) => `${name}_${uid}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-16 z-0 select-none overflow-hidden"
      style={{
        aspectRatio: `${W} / ${H}`,
        maxHeight: '60vh',
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block', direction: 'ltr' }}
      >
        <defs>
          <linearGradient id={id('skyDayL')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8d5a0" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#f3e3b5" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f3e3b5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('skyDayD')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a3a5a" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#1a3a5a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1a3a5a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('skyNightL')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a3a5a" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#1a3a5a" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#1a3a5a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('skyNightD')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1628" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#0a1628" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0a1628" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={id('sunGlow')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={goldBright} stopOpacity="0.55" />
            <stop offset="60%" stopColor={goldBright} stopOpacity="0.18" />
            <stop offset="100%" stopColor={goldBright} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id('moonGlow')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={goldMain} stopOpacity="0.45" />
            <stop offset="100%" stopColor={goldMain} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id('arcGrad')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDay ? goldBright : goldMain} stopOpacity="0.25" />
            <stop offset="50%" stopColor={isDay ? goldBright : goldMain} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isDay ? goldBright : goldMain} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Sky tint */}
        <rect
          x="0"
          y="0"
          width={W}
          height={H}
          fill={
            isDay
              ? `url(#${id(isDark ? 'skyDayD' : 'skyDayL')})`
              : `url(#${id(isDark ? 'skyNightD' : 'skyNightL')})`
          }
        />

        {/* Stars at night */}
        {!isDay && (
          <g opacity={isDark ? '0.5' : '0.4'}>
            <circle cx="35" cy="12" r="0.9" fill={goldMain} />
            <circle cx="80" cy="22" r="0.6" fill={goldMain} />
            <circle cx="125" cy="8" r="1.1" fill={goldMain} />
            <circle cx="170" cy="18" r="0.7" fill={goldMain} />
            <circle cx="215" cy="10" r="0.9" fill={goldMain} />
            <circle cx="255" cy="20" r="0.6" fill={goldMain} />
            <circle cx="290" cy="6" r="1" fill={goldMain} />
            <circle cx="335" cy="16" r="0.7" fill={goldMain} />
            <circle cx="375" cy="9" r="0.9" fill={goldMain} />
            <circle cx="60" cy="40" r="0.5" fill={goldMain} />
            <circle cx="195" cy="38" r="0.6" fill={goldMain} />
            <circle cx="320" cy="42" r="0.5" fill={goldMain} />
            <g opacity="0.7">
              <path
                d="M150 30l1.2 3 3 0-2.5 1.8 1 3-2.7-1.8-2.7 1.8 1-3-2.5-1.8 3 0z"
                fill={goldMain}
              />
              <path
                d="M270 32l1 2.5 2.5 0-2 1.5 0.8 2.5-2.3-1.5-2.3 1.5 0.8-2.5-2-1.5 2.5 0z"
                fill={goldMain}
              />
            </g>
          </g>
        )}

        {/* Dashed full arc */}
        <path
          d={arcPath}
          fill="none"
          stroke={dashStroke}
          strokeWidth="1"
          strokeDasharray="5 4"
        />

        {/* Traversed arc */}
        {traversedPath && (
          <path
            d={traversedPath}
            fill="none"
            stroke={`url(#${id('arcGrad')})`}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}

        {/* Sun / Moon */}
        {isDay ? (
          <g>
            <circle cx={iconX} cy={iconY} r="14" fill={`url(#${id('sunGlow')})`} />
            <circle cx={iconX} cy={iconY} r="5.5" fill={goldBright} opacity="0.95" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const r = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={iconX + 8 * Math.cos(r)}
                  y1={iconY + 8 * Math.sin(r)}
                  x2={iconX + 11 * Math.cos(r)}
                  y2={iconY + 11 * Math.sin(r)}
                  stroke={goldBright}
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              );
            })}
          </g>
        ) : (
          <g>
            <circle cx={iconX} cy={iconY} r="13" fill={`url(#${id('moonGlow')})`} />
            <circle cx={iconX} cy={iconY} r="5" fill={goldMain} opacity="0.95" />
            <circle cx={iconX + 2.2} cy={iconY - 1} r="3.8" fill={moonCutout} />
          </g>
        )}
      </svg>

      {/* Fade to background colour at the bottom of the band */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, hsl(var(--background) / 0.7) 65%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  );
};
