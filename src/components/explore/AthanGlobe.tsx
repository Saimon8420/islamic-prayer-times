import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes } from '../../services/prayerService';
import { CITIES, type City } from '../../data/cities';

// ── Types ──
type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

interface CityAthanInfo {
  city: City;
  time: Date;
  minuteOfDay: number;
  x: number;
  y: number;
  isActive: boolean;
}

const PRAYER_KEYS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ── SVG Map Constants ──
// Viewbox: 800x400 equirectangular, Makkah-centered (lon 39.8° shifted to center)
const SVG_W = 800;
const SVG_H = 400;
const MAKKAH_LON = 39.8;

// Convert lat/lon to SVG coordinates (Makkah-centered)
function toSvg(lat: number, lon: number): { x: number; y: number } {
  // Shift longitude so Makkah is at center
  let adjustedLon = lon - MAKKAH_LON;
  if (adjustedLon < -180) adjustedLon += 360;
  if (adjustedLon > 180) adjustedLon -= 360;
  const x = (adjustedLon + 180) * (SVG_W / 360);
  const y = (90 - lat) * (SVG_H / 180);
  return { x, y };
}

// ── Simplified continent paths (Makkah-centered equirectangular) ──
// Generated for lon offset = -MAKKAH_LON (shifted so Makkah ≈ center)
function getContinentPaths() {
  // Helper: convert array of [lat,lon] to SVG path "M x y L x y ..."
  const toPath = (coords: [number, number][]) => {
    return coords.map((c, i) => {
      const { x, y } = toSvg(c[0], c[1]);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ') + ' Z';
  };

  return {
    // Africa
    africa: toPath([
      [37, -10], [37, 10], [33, 10], [32, 32], [30, 33], [22, 37],
      [12, 44], [11, 50], [2, 42], [-2, 41], [-12, 44], [-26, 33],
      [-35, 18], [-34, 26], [-28, 30], [-22, 35], [-15, 41],
      [-11, 40], [-5, 12], [5, 1], [4, -8], [6, -4], [10, -16],
      [15, -17], [21, -17], [30, -10], [35, -5], [37, -10],
    ]),
    // Europe
    europe: toPath([
      [37, -10], [36, -6], [43, -9], [43, -2], [46, -2], [48, -5],
      [49, 0], [51, 2], [54, 6], [55, 8], [58, 6], [56, 10],
      [58, 12], [60, 5], [63, 5], [64, 14], [68, 16], [71, 26],
      [70, 30], [65, 30], [60, 30], [55, 28], [47, 40], [45, 37],
      [41, 29], [42, 28], [40, 26], [38, 24], [35, 25], [37, 10],
      [37, -10],
    ]),
    // Asia
    asia: toPath([
      [37, 10], [35, 25], [38, 24], [40, 26], [42, 28], [41, 29],
      [45, 37], [47, 40], [55, 28], [60, 30], [65, 30], [70, 30],
      [71, 50], [68, 60], [55, 60], [53, 73], [45, 80], [38, 78],
      [35, 75], [28, 72], [23, 70], [20, 73], [15, 80], [8, 80],
      [1, 104], [2, 108], [8, 115], [18, 108], [22, 108], [22, 114],
      [30, 122], [38, 118], [40, 130], [45, 135], [45, 143], [51, 143],
      [55, 138], [60, 142], [62, 150], [63, 168], [67, 170], [70, 180],
      [72, 140], [73, 110], [70, 85], [73, 70], [72, 55], [71, 50],
      [71, 26], [68, 16], [64, 14], [63, 5], [60, 5], [58, 12],
      [55, 8], [37, 10],
    ]),
    // North America (wraps around left side in Makkah-centered)
    northAmerica: toPath([
      [72, -170], [70, -160], [63, -140], [60, -140], [55, -130],
      [48, -125], [38, -122], [30, -115], [25, -110], [20, -105],
      [16, -88], [18, -88], [21, -87], [25, -82], [30, -82],
      [28, -81], [25, -80], [30, -80], [31, -82], [35, -76],
      [40, -74], [42, -70], [45, -65], [47, -60], [49, -55],
      [52, -56], [55, -60], [60, -65], [60, -64], [64, -52],
      [70, -55], [72, -78], [75, -95], [72, -120], [72, -170],
    ]),
    // South America
    southAmerica: toPath([
      [12, -72], [10, -62], [7, -55], [2, -50], [-5, -35],
      [-15, -39], [-23, -42], [-30, -50], [-35, -57], [-40, -62],
      [-46, -67], [-52, -70], [-55, -68], [-55, -65], [-52, -68],
      [-46, -76], [-38, -74], [-30, -72], [-18, -70], [-14, -76],
      [-5, -81], [0, -80], [8, -77], [12, -72],
    ]),
    // Australia
    australia: toPath([
      [-12, 130], [-14, 127], [-20, 119], [-25, 114], [-32, 115],
      [-35, 117], [-36, 137], [-38, 146], [-37, 150], [-33, 152],
      [-28, 154], [-24, 152], [-20, 149], [-16, 146], [-12, 142],
      [-11, 136], [-12, 130],
    ]),
  };
}

// ── Decorative ──
const ArabesqueCorner = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 0L20 10L10 20Z" fill="rgba(200,168,78,0.25)" />
    <path d="M0 0L40 5L35 15L15 35L5 40Z" fill="rgba(200,168,78,0.12)" />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
  </svg>
);

// ── Main Component ──
export const AthanGlobe = () => {
  const { t } = useTranslation();
  const calculationMethod = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);
  const use24HourFormat = useStore((s) => s.use24HourFormat);

  const [selectedPrayer, setSelectedPrayer] = useState<PrayerKey>('fajr');
  const [tooltip, setTooltip] = useState<{ city: CityAthanInfo; svgX: number; svgY: number } | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Update clock every 60s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const today = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);

  // Calculate prayer times for all cities + determine active ones
  const cityData = useMemo<CityAthanInfo[]>(() => {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return CITIES.map(city => {
      const times = calculatePrayerTimes(city.lat, city.lon, today, calculationMethod, madhab);
      const time = times[selectedPrayer];
      const minuteOfDay = time.getHours() * 60 + time.getMinutes();
      const { x, y } = toSvg(city.lat, city.lon);
      // "Active" if current UTC-adjusted local minute is within ±5 min of prayer time
      // Simplified: compare local time of city vs prayer time at that city
      const diff = Math.abs(minuteOfDay - nowMinutes);
      const isActive = diff <= 5 || diff >= (24 * 60 - 5);
      return { city, time, minuteOfDay, x, y, isActive };
    });
  }, [today, now, selectedPrayer, calculationMethod, madhab]);

  const activeCount = useMemo(() => cityData.filter(c => c.isActive).length, [cityData]);

  // Sweep band: approximate longitude where it's currently the selected prayer time
  // Based on the median minute-of-day for the prayer across cities near the equator
  const sweepX = useMemo(() => {
    // Current time in minutes
    const nowMin = now.getHours() * 60 + now.getMinutes();
    // Find cities whose prayer time is close to now (within 30 min)
    const nearCities = cityData.filter(c => {
      const diff = Math.abs(c.minuteOfDay - nowMin);
      return diff <= 30 || diff >= (24 * 60 - 30);
    });
    if (nearCities.length === 0) return null;
    // Average X position of those cities
    const avgX = nearCities.reduce((s, c) => s + c.x, 0) / nearCities.length;
    return avgX;
  }, [cityData, now]);

  const continents = useMemo(() => getContinentPaths(), []);

  const formatTime = useCallback((date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    if (use24HourFormat) return `${h.toString().padStart(2, '0')}:${m}`;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m} ${period}`;
  }, [use24HourFormat]);

  const handleCityClick = (c: CityAthanInfo) => {
    setTooltip(prev => prev?.city.city.name === c.city.name ? null : { city: c, svgX: c.x, svgY: c.y });
  };

  return (
    <div className="islamic-border relative overflow-hidden rounded-2xl">
      {/* Arabesque corners */}
      <ArabesqueCorner className="absolute top-0 left-0 w-12 h-12 opacity-60 z-10 pointer-events-none" />
      <ArabesqueCorner className="absolute top-0 right-0 w-12 h-12 opacity-60 -scale-x-100 z-10 pointer-events-none" />

      {/* Header */}
      <div className="islamic-gradient-header gold-border-strip px-4 py-2.5 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[hsl(var(--gold))] flex-shrink-0">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <h3 className="text-sm font-semibold text-white/95 tracking-wide">
          {t('explore.globe.title')}
        </h3>
      </div>

      {/* Prayer pills + active count */}
      <div className="px-4 pt-3 pb-2 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {PRAYER_KEYS.map(key => (
            <button
              key={key}
              onClick={() => { setSelectedPrayer(key); setTooltip(null); }}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                selectedPrayer === key
                  ? 'islamic-gradient text-white shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {t(`prayer.names.${key.charAt(0).toUpperCase() + key.slice(1)}` as any)}
            </button>
          ))}
        </div>
        {activeCount > 0 && (
          <p className="text-[11px] text-center text-[hsl(var(--gold))] font-medium">
            {t('explore.globe.citiesNow').replace('{count}', String(activeCount))}
          </p>
        )}
      </div>

      {/* SVG Map */}
      <div className="px-3 pb-3" onClick={() => setTooltip(null)}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto rounded-xl overflow-hidden"
          style={{ background: 'var(--globe-bg, hsl(var(--card)))' }}
        >
          <defs>
            {/* Parchment/dark background */}
            <linearGradient id="globe-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="[stop-color:hsl(38,40%,93%)] dark:[stop-color:hsl(222,30%,10%)]" />
              <stop offset="100%" className="[stop-color:hsl(38,35%,88%)] dark:[stop-color:hsl(222,30%,6%)]" />
            </linearGradient>
            {/* Sweep band gradient */}
            <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(200,168,78,0)" />
              <stop offset="50%" stopColor="rgba(200,168,78,0.18)" />
              <stop offset="100%" stopColor="rgba(200,168,78,0)" />
            </linearGradient>
            {/* Pulse animation for active cities */}
            <radialGradient id="active-glow">
              <stop offset="0%" stopColor="rgba(200,168,78,0.6)" />
              <stop offset="100%" stopColor="rgba(200,168,78,0)" />
            </radialGradient>
          </defs>

          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="url(#globe-bg)" />

          {/* Grid lines — subtle */}
          {[-60, -30, 0, 30, 60].map(lat => {
            const y = (90 - lat) * (SVG_H / 180);
            return <line key={`lat${lat}`} x1="0" y1={y} x2={SVG_W} y2={y} stroke="currentColor" className="text-muted-foreground/10" strokeWidth="0.5" />;
          })}
          {[-120, -60, 0, 60, 120].map(lonOffset => {
            const x = (lonOffset + 180) * (SVG_W / 360);
            return <line key={`lon${lonOffset}`} x1={x} y1="0" x2={x} y2={SVG_H} stroke="currentColor" className="text-muted-foreground/10" strokeWidth="0.5" />;
          })}

          {/* Continents */}
          {Object.values(continents).map((d, i) => (
            <path
              key={i}
              d={d}
              className="fill-[hsl(var(--primary))]/10 dark:fill-emerald-900/30 stroke-[hsl(var(--primary))]/40 dark:stroke-emerald-500/25"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          ))}

          {/* Sweep band */}
          {sweepX !== null && (
            <rect
              x={sweepX - 25}
              y="0"
              width="50"
              height={SVG_H}
              fill="url(#sweep-grad)"
              className="pointer-events-none"
            />
          )}

          {/* Makkah marker — special */}
          {(() => {
            const mk = toSvg(21.4225, MAKKAH_LON);
            return (
              <g>
                <circle cx={mk.x} cy={mk.y} r="5" className="fill-[hsl(var(--gold))]" opacity="0.3" />
                <circle cx={mk.x} cy={mk.y} r="3" className="fill-[hsl(var(--gold))]" />
                {/* Kaaba symbol */}
                <rect x={mk.x - 2} y={mk.y - 2} width="4" height="4" className="fill-background dark:fill-black" rx="0.5" />
              </g>
            );
          })()}

          {/* City dots */}
          {cityData.map(c => (
            <g
              key={`${c.city.name}-${c.city.country}`}
              onClick={(e) => { e.stopPropagation(); handleCityClick(c); }}
              className="cursor-pointer"
            >
              {c.isActive && (
                <circle cx={c.x} cy={c.y} r="8" fill="url(#active-glow)" className="animate-pulse" />
              )}
              <circle
                cx={c.x}
                cy={c.y}
                r={c.isActive ? 3 : 2}
                className={c.isActive
                  ? 'fill-[hsl(var(--gold))] drop-shadow-[0_0_3px_rgba(200,168,78,0.8)]'
                  : 'fill-[hsl(var(--primary))]/60 dark:fill-emerald-400/50'
                }
              />
            </g>
          ))}

          {/* Tooltip */}
          {tooltip && (() => {
            const tx = Math.min(Math.max(tooltip.svgX, 80), SVG_W - 80);
            const above = tooltip.svgY > SVG_H / 2;
            const ty = above ? tooltip.svgY - 12 : tooltip.svgY + 12;
            return (
              <g onClick={(e) => e.stopPropagation()}>
                {/* Connector line */}
                <line x1={tooltip.svgX} y1={tooltip.svgY} x2={tx} y2={ty}
                  stroke="rgba(200,168,78,0.5)" strokeWidth="0.5" />
                {/* Background */}
                <rect
                  x={tx - 65} y={above ? ty - 32 : ty}
                  width="130" height="30" rx="6"
                  className="fill-background dark:fill-[hsl(222,30%,12%)]"
                  stroke="rgba(200,168,78,0.3)" strokeWidth="0.5"
                />
                {/* City name */}
                <text
                  x={tx} y={above ? ty - 18 : ty + 13}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-semibold"
                >
                  {tooltip.city.city.name}
                </text>
                {/* Time */}
                <text
                  x={tx} y={above ? ty - 6 : ty + 25}
                  textAnchor="middle"
                  className="fill-[hsl(var(--gold))] text-[10px] font-medium"
                >
                  {t(`prayer.names.${selectedPrayer.charAt(0).toUpperCase() + selectedPrayer.slice(1)}` as any)} — {formatTime(tooltip.city.time)}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};
