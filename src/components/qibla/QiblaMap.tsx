import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { calculateQibla, calculateDistanceToMakkah } from '../../services/prayerService';
import { useTranslation } from '../../i18n/useTranslation';

/**
 * QiblaMap — a world chart that shows the great-circle Qibla line from the
 * user's location to Makkah. A companion to the compass: the compass shows the
 * bearing on the ground, this shows the same direction across the globe.
 * Self-contained (equirectangular projection + slerp), no tiles, no network.
 */

const MAKKAH: [number, number] = [21.4225, 39.8262];

// Equirectangular projection helpers.
const toR = Math.PI / 180;
const toD = 180 / Math.PI;
const projX = (lng: number) => ((lng + 180) / 360) * 100; // %
const projY = (lat: number) => ((90 - lat) / 180) * 100; // %
const svgX = (lng: number) => lng + 180; // 0..360
const svgY = (lat: number) => 90 - lat; // 0..180

// Great-circle samples between two points (spherical interpolation).
function gcPoints(a: [number, number], b: [number, number], n = 48): [number, number][] {
  const φ1 = a[0] * toR,
    λ1 = a[1] * toR,
    φ2 = b[0] * toR,
    λ2 = b[1] * toR;
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
      ),
    );
  if (!d) return [a, b];
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    out.push([Math.atan2(z, Math.hypot(x, y)) * toD, Math.atan2(y, x) * toD]);
  }
  return out;
}

export const QiblaMap = () => {
  const location = useStore((state) => state.location);
  const { t } = useTranslation();
  const [visitor, setVisitor] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const home: [number, number] | null = location ? [location.lat, location.lon] : null;
  const origin = visitor ?? home;

  const line = useMemo(() => {
    if (!origin) return '';
    return gcPoints(origin, MAKKAH)
      .map(([la, ln]) => `${svgX(ln).toFixed(1)},${svgY(la).toFixed(1)}`)
      .join(' ');
  }, [origin]);

  if (!home || !origin) return null;

  const bearing = Math.round(calculateQibla(origin[0], origin[1]));
  const distance = Math.round(calculateDistanceToMakkah(origin[0], origin[1]));
  const originLabel = visitor ? t('qibla.map.you') : location?.name || t('qibla.map.home');

  const requestLocate = () => {
    if (!('geolocation' in navigator)) {
      setGeoError(true);
      return;
    }
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setVisitor([p.coords.latitude, p.coords.longitude]);
        setLocating(false);
      },
      () => {
        setGeoError(true);
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 3600_000 },
    );
  };

  const graticuleLng = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const graticuleLat = [30, 60, 90, 120, 150];

  return (
    <div className="obs-panel relative overflow-hidden fade-in p-4 sm:p-5">
      {/* header */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
        <p className="label-mono !text-secondary">{t('qibla.map.title')}</p>
        <button
          type="button"
          onClick={requestLocate}
          disabled={locating}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/[0.06] px-2.5 py-1.5 text-primary transition-colors hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98] disabled:opacity-60"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="label-mono !text-primary">
            {locating ? t('qibla.map.locating') : t('qibla.map.locateMe')}
          </span>
        </button>
      </div>

      {/* map */}
      <div className="relative mx-auto aspect-[2/1] w-full overflow-hidden rounded-xl border border-border bg-muted/40">
        {/* land (world svg used as an alpha mask, tinted emerald) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'hsl(var(--secondary) / 0.32)',
            WebkitMaskImage: 'url(/world.svg)',
            maskImage: 'url(/world.svg)',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
          aria-hidden="true"
        />

        {/* graticule + great-circle line */}
        <svg
          viewBox="0 0 360 180"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {graticuleLng.map((x) => (
            <line key={`x${x}`} x1={x} y1="0" x2={x} y2="180" stroke="hsl(var(--border))" strokeWidth="0.4" opacity="0.6" />
          ))}
          {graticuleLat.map((y) => (
            <line key={`y${y}`} x1="0" y1={y} x2="360" y2={y} stroke="hsl(var(--border))" strokeWidth="0.4" opacity="0.6" />
          ))}
          <polyline
            points={line}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            strokeLinecap="round"
            opacity="0.9"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Makkah pin */}
        <span
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${projX(MAKKAH[1])}%`, top: `${projY(MAKKAH[0])}%` }}
        >
          <span className="text-[13px] leading-none text-primary drop-shadow-[0_0_5px_hsl(var(--primary)/0.7)]">◈</span>
          <span className="mt-0.5 rounded bg-card/70 px-1 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
            {t('qibla.map.makkah')}
          </span>
        </span>

        {/* Home pin (the set location) */}
        <span
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${projX(home[1])}%`, top: `${projY(home[0])}%` }}
        >
          <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_0_3px_hsl(var(--secondary)/0.22)]" />
          <span className="mt-0.5 max-w-[72px] truncate rounded bg-card/70 px-1 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
            {location?.name || t('qibla.map.home')}
          </span>
        </span>

        {/* Visitor pin (live GPS, opt-in) */}
        {visitor && (
          <span
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${projX(visitor[1])}%`, top: `${projY(visitor[0])}%` }}
          >
            <span className="next-pulse h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]" />
            <span className="mt-0.5 rounded bg-card/70 px-1 font-mono text-[8px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t('qibla.map.you')}
            </span>
          </span>
        )}
      </div>

      {/* readout + legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {geoError ? (
            <span className="text-amber-600 dark:text-amber-400">{t('qibla.map.geoError')}</span>
          ) : (
            <>
              <span className="text-primary">{t('qibla.map.qibla')} {bearing}°</span>
              <span className="mx-1.5 opacity-40">·</span>
              <span className="text-secondary">{distance.toLocaleString()} km</span>
              <span className="mx-1.5 opacity-40">·</span>
              {t('qibla.map.from')} {originLabel}
            </>
          )}
        </p>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            {t('qibla.map.home')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-primary">◈</span>
            {t('qibla.map.makkah')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {t('qibla.map.you')}
          </span>
        </div>
      </div>
    </div>
  );
};
