import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { calculateQibla, calculateDistanceToMakkah } from '../../services/prayerService';
import { degreesToCardinal } from '../../utils';
import { useTranslation } from '../../i18n/useTranslation';

/* ═══════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════ */

// Compass icon for header
const CompassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 9L10 14L12 12.5L14 14L12 9Z" fill="currentColor" opacity="0.8" />
  </svg>
);

// Kaaba Icon - 3D perspective view
const KaabaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-9 h-9">
    <path d="M3 7L3 22L15 22L15 7Z" fill="currentColor" />
    <path d="M15 7L15 22L22 18L22 3Z" fill="currentColor" opacity="0.75" />
    <path d="M3 7L15 7L22 3L10 3Z" fill="currentColor" opacity="0.5" />
    <rect x="3" y="10" width="12" height="2" fill="currentColor" opacity="0.4" />
    <path d="M15 10L22 6L22 8L15 12Z" fill="currentColor" opacity="0.3" />
    <path d="M7 22L7 15.5Q9.5 13 12 15.5L12 22Z" fill="currentColor" opacity="0.3" />
  </svg>
);

// Direction info icon
const DirectionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-5 sm:h-5">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M12 8l-3 8 3-2.5 3 2.5-3-8z" fill="currentColor" opacity="0.7" />
  </svg>
);

// Distance icon (Kaaba small)
const DistanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-5 sm:h-5">
    <rect x="6" y="8" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M6 12h12" stroke="currentColor" strokeWidth="1" />
    <path d="M10 22v-5Q12 14 14 17v5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
    <path d="M6 8l6-6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
  </svg>
);

export const QiblaCompass = () => {
  const location = useStore((state) => state.location);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { t } = useTranslation();

  // Smooth rotation tracking to avoid jumps at 0°/360° boundary
  const [smoothRotation, setSmoothRotation] = useState(0);
  const prevHeadingRef = useRef<number | null>(null);

  const hasLocation = location !== null;

  // Calculate Qibla direction and distance
  const qiblaData = useMemo(() => {
    if (!hasLocation) return null;
    return {
      direction: calculateQibla(location.lat, location.lon),
      distance: calculateDistanceToMakkah(location.lat, location.lon),
    };
  }, [hasLocation, location]);

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      setIsSupported(false);
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const heading =
        (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
          .webkitCompassHeading ?? event.alpha;
      if (heading !== null && heading !== undefined) {
        setDeviceHeading(heading);
      }
    };

    const requestPermission = async () => {
      if (
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
          .requestPermission === 'function'
      ) {
        try {
          const permission = await (
            DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
          ).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setPermissionDenied(true);
          }
        } catch {
          setPermissionDenied(true);
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Smooth compass rotation (avoids jump at 360°/0° boundary)
  useEffect(() => {
    if (deviceHeading === null) return;

    if (prevHeadingRef.current === null) {
      setSmoothRotation(-deviceHeading);
      prevHeadingRef.current = deviceHeading;
      return;
    }

    let delta = deviceHeading - prevHeadingRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    setSmoothRotation((prev) => prev - delta);
    prevHeadingRef.current = deviceHeading;
  }, [deviceHeading]);

  if (!hasLocation || !qiblaData) return null;

  const { direction, distance } = qiblaData;
  // Compass dial rotation: when device heading is available, rotate the entire dial
  // so N/S/E/W show actual real-world directions
  const compassRotation = deviceHeading !== null ? smoothRotation : 0;

  // Cardinal direction labels on the compass dial
  const directionLabels: { key: string; angle: number; isCardinal: boolean }[] = [
    { key: 'N', angle: 0, isCardinal: true },
    { key: 'NE', angle: 45, isCardinal: false },
    { key: 'E', angle: 90, isCardinal: true },
    { key: 'SE', angle: 135, isCardinal: false },
    { key: 'S', angle: 180, isCardinal: true },
    { key: 'SW', angle: 225, isCardinal: false },
    { key: 'W', angle: 270, isCardinal: true },
    { key: 'NW', angle: 315, isCardinal: false },
  ];

  return (
    <Card className="overflow-hidden fade-in">
      {/* faint heritage watermark, top-right */}
      <div className="girih-watermark pointer-events-none absolute right-3 top-3 h-20 w-20 sm:h-24 sm:w-24" />

      {/* ═══ HEADER ═══ */}
      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary sm:h-10 sm:w-10">
            <CompassIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-mono">{t('qibla.title')}</p>
            <p className="mt-0.5 font-display text-base font-semibold leading-tight text-foreground sm:text-lg">
              {t('qibla.subtitle')}
            </p>
          </div>
          <p className="arabic-text shrink-0 text-sm text-secondary sm:text-base">الكعبة المشرفة</p>
        </div>
      </div>

      <div className="mx-4 sm:mx-6">
        <div className="heritage-rule" />
      </div>

      {/* ═══ CONTENT ═══ */}
      <CardContent className="relative px-3 sm:px-5 pt-0 pb-4 sm:pb-6">
        <div className="grid items-center gap-4 lg:grid-cols-2 lg:gap-8">
          {/* ── LEFT: the compass dial ── */}
          <div className="flex w-full flex-col items-center">
        {/* User heading display - above compass */}
        {deviceHeading !== null && (
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 rounded-lg bg-primary/[0.06] px-3 py-2 sm:px-4 sm:py-2.5 border border-primary/20">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary fill-current shrink-0">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
            <span className="label-mono">{t('qibla.yourHeading')}</span>
            <span className="font-mono text-sm font-medium tabular-nums text-primary">
              {deviceHeading.toFixed(0)}° {degreesToCardinal(deviceHeading)}
            </span>
          </div>
        )}

        {/* Compass — extra top padding so "You" pointer doesn't overlap header */}
        <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 mb-4 sm:mb-6 mt-8 sm:mt-9">
          {/* Fixed "You" pointer at top - does NOT rotate with compass */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            <span className="label-mono !text-primary bg-background/80 px-1.5 py-0.5 rounded">
              {t('qibla.youLabel')}
            </span>
            <svg width="14" height="10" viewBox="0 0 14 10" className="mt-px drop-shadow-sm">
              <polygon points="7,10 0,0 14,0" className="fill-primary" />
            </svg>
          </div>

          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full pointer-events-none text-primary">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
              <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
              {/* 8 marker dots at 45° intervals on outer ring */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <circle
                  key={angle}
                  cx={100 + 97 * Math.cos((angle - 90) * Math.PI / 180)}
                  cy={100 + 97 * Math.sin((angle - 90) * Math.PI / 180)}
                  r="1.5"
                  fill="currentColor"
                  opacity="0.2"
                />
              ))}
            </svg>
          </div>

          {/* Rotating compass dial - rotates by -deviceHeading so N/S/E/W show real directions */}
          <div
            className="absolute inset-1 rounded-full border-2 border-primary/15 overflow-hidden rotate-smooth"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            {/* Degree tick marks — every 5°, bolder at 15° */}
            {[...Array(72)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 left-1/2 origin-bottom h-full"
                style={{ transform: `translateX(-50%) rotate(${i * 5}deg)` }}
              >
                <div
                  className={`w-0.5 ${
                    i % 6 === 0 ? 'h-3.5 bg-primary' : i % 3 === 0 ? 'h-2 bg-primary/50' : 'h-1.5 bg-primary/25'
                  }`}
                />
              </div>
            ))}

            {/* Degree number labels at 30° intervals (except where cardinal/intercardinal labels go) */}
            {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
              <div
                key={`deg-${deg}`}
                className="absolute top-0 left-1/2 origin-bottom h-full"
                style={{ transform: `translateX(-50%) rotate(${deg}deg)` }}
              >
                <span
                  className="block font-mono text-[8px] sm:text-[9px] font-medium tabular-nums text-muted-foreground/50 mt-4"
                  style={{ transform: `rotate(${-(compassRotation + deg)}deg)` }}
                >
                  {deg}°
                </span>
              </div>
            ))}

            {/* Cardinal & intercardinal direction labels */}
            {directionLabels.map(({ key, angle, isCardinal }) => (
              <div
                key={key}
                className="absolute top-0 left-1/2 origin-bottom h-full"
                style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
              >
                {key === 'N' ? (
                  <div className="flex flex-col items-center mt-0.5">
                    {/* Red North triangle */}
                    <svg width="10" height="8" viewBox="0 0 10 8">
                      <polygon points="5,0 0,8 10,8" className="fill-red-500" />
                    </svg>
                    <span
                      className="text-[11px] sm:text-xs font-bold text-red-500 leading-none"
                      style={{ transform: `rotate(${-(compassRotation + angle)}deg)` }}
                    >
                      {t('qibla.cardinalDirections.N')}
                    </span>
                  </div>
                ) : isCardinal ? (
                  <span
                    className="block text-[11px] sm:text-xs font-bold text-primary mt-3.5"
                    style={{ transform: `rotate(${-(compassRotation + angle)}deg)` }}
                  >
                    {t(`qibla.cardinalDirections.${key}` as `qibla.cardinalDirections.${'N' | 'E' | 'S' | 'W'}`)}
                  </span>
                ) : (
                  <span
                    className="block text-[9px] sm:text-[10px] font-semibold text-muted-foreground/60 mt-3.5"
                    style={{ transform: `rotate(${-(compassRotation + angle)}deg)` }}
                  >
                    {key}
                  </span>
                )}
              </div>
            ))}

            {/* Inner compass circle */}
            <div className="absolute inset-[2.75rem] sm:inset-12 rounded-full bg-gradient-to-br from-muted to-muted/50 shadow-inner">
              {/* Qibla needle - rotated to the qibla bearing within the dial */}
              <div
                className="absolute inset-0"
                style={{ transform: `rotate(${direction}deg)` }}
              >
                <div className="relative w-full h-full">
                  {/* Kaaba icon at the Qibla end */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    {/* Counter-rotate so icon and label stay upright on screen */}
                    <div style={{ transform: `rotate(${-(compassRotation + direction)}deg)` }}>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center shadow-lg text-primary-foreground">
                          <KaabaIcon />
                        </div>
                        <span className="label-mono !text-primary mt-0.5 bg-background/90 px-1.5 py-px rounded-full shadow-sm whitespace-nowrap">
                          {t('qibla.qiblaLabel')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Needle line from Kaaba icon toward center */}
                  <div className="absolute top-[2.8rem] sm:top-[3.2rem] left-1/2 -translate-x-1/2 w-0.5 h-[calc(50%-0.8rem)] rounded-full bg-primary opacity-50" />
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary shadow-md z-10" />
            </div>
          </div>
        </div>
          </div>

          {/* ── RIGHT: readouts ── */}
          <div className="w-full">
        {/* Divider — only when the columns are stacked (mobile/tablet) */}
        <div className="px-3 sm:px-4 lg:hidden">
          <div className="heritage-rule" />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 lg:mt-0">
          <div className="rounded-lg bg-primary/[0.06] p-3 sm:p-4 text-center border border-primary/20">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="text-primary">
                <DirectionIcon />
              </div>
              <p className="label-mono">{t('qibla.direction')}</p>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-primary">{direction.toFixed(1)}°</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70">{degreesToCardinal(direction)}</p>
          </div>
          <div className="rounded-lg bg-secondary/[0.06] p-3 sm:p-4 text-center border border-secondary/20">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="text-secondary">
                <DistanceIcon />
              </div>
              <p className="label-mono">{t('qibla.distance')}</p>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-secondary">
              {distance.toLocaleString()} km
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70">{t('qibla.toMakkah')}</p>
          </div>
        </div>

        {/* Status Messages */}
        {!isSupported && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 sm:p-4 text-xs sm:text-sm border border-amber-500/10">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400">
              {t('qibla.compassNotSupported')}
            </span>
          </div>
        )}

        {permissionDenied && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 sm:p-4 text-xs sm:text-sm border border-amber-500/10">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400">
              {t('qibla.compassPermissionDenied')}
            </span>
          </div>
        )}

        {deviceHeading === null && isSupported && !permissionDenied && (
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground rounded-lg bg-muted/50 p-3 sm:p-4 border border-border/50">
            <p>{t('qibla.holdDeviceFlat')}</p>
          </div>
        )}

        {/* Instructions footer */}
        <div className="mt-3 sm:mt-4 mb-1 border-t border-border" />
        <p className="text-[10px] sm:text-xs text-muted-foreground/50 text-center italic">
          {t('qibla.faceDirection')}
        </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
