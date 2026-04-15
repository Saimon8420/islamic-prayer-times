import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { calculateQibla, calculateDistanceToMakkah } from '../../services/prayerService';
import { degreesToCardinal } from '../../utils';
import { useTranslation } from '../../i18n/useTranslation';

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

// Compass icon for header
const CompassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 9L10 14L12 12.5L14 14L12 9Z" fill="currentColor" opacity="0.8" />
  </svg>
);

// Star divider
const StarDivider = () => (
  <div className="flex items-center px-3 sm:px-4">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(40,70%,50%,0.2)] to-transparent" />
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 mx-2 text-[hsl(40,85%,52%)] opacity-30">
      <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(40,70%,50%,0.2)] to-transparent" />
  </div>
);

// Kaaba Icon - 3D perspective view
const KaabaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-9 h-9">
    <path d="M3 7L3 22L15 22L15 7Z" fill="currentColor" />
    <path d="M15 7L15 22L22 18L22 3Z" fill="currentColor" opacity="0.75" />
    <path d="M3 7L15 7L22 3L10 3Z" fill="currentColor" opacity="0.5" />
    <rect x="3" y="10" width="12" height="2" fill="#d4a017" opacity="0.85" />
    <path d="M15 10L22 6L22 8L15 12Z" fill="#d4a017" opacity="0.6" />
    <path d="M7 22L7 15.5Q9.5 13 12 15.5L12 22Z" fill="#d4a017" opacity="0.45" />
    <path d="M7 22L7 15.5Q9.5 13 12 15.5L12 22" fill="none" stroke="white" strokeWidth="0.4" opacity="0.5" />
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
    <Card className="islamic-border overflow-hidden fade-in">
      {/* ═══ HEADER — Deep emerald Arabian gradient ═══ */}
      <div
        className="relative overflow-hidden px-4 py-3 sm:px-5 sm:py-4"
        style={{
          background: 'linear-gradient(135deg, hsl(158, 64%, 18%) 0%, hsl(158, 64%, 28%) 40%, hsl(160, 50%, 20%) 100%)',
        }}
      >
        <TessellationOverlay />

        {/* Arabesque corners */}
        <ArabesqueCorner className="absolute top-0 left-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50" />
        <ArabesqueCorner className="absolute top-0 right-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50 -scale-x-100" />

        {/* Hanging lantern */}
        <div
          className="absolute top-0 right-[12%] w-3 h-6 sm:w-4 sm:h-8 opacity-30 hidden sm:block"
          style={{ animation: 'lantern-sway 4.5s ease-in-out infinite' }}
        >
          <HangingLantern className="w-full h-full" />
        </div>

        {/* Crescent moon */}
        <div className="absolute -top-3 -right-3 w-14 h-14 sm:w-20 sm:h-20 opacity-[0.06] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#c8a84e">
            <path d="M70 15 A35 35 0 1 0 70 85 A28 28 0 1 1 70 15" />
            <polygon points="78,42 81,50 90,50 83,55 86,64 78,58 70,64 73,55 66,50 75,50" />
          </svg>
        </div>

        {/* Mosque skyline */}
        <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 pointer-events-none">
          <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="w-full h-full" fill="white" fillOpacity="0.05">
            <path d="M0,40 L0,30 L20,30 L20,20 L22,10 L24,20 L24,30 L60,30 Q70,30 75,25 Q85,12 95,25 Q100,30 110,30 L140,30 L140,22 L142,12 L144,22 L144,30 L200,30 L210,26 Q220,18 230,26 L240,30 L280,30 L280,20 L282,8 L284,20 L284,30 L340,30 Q350,30 355,25 Q370,10 385,25 Q390,30 400,30 L440,30 L440,22 L442,10 L444,22 L444,30 L500,30 L510,26 Q520,16 530,26 L540,30 L570,30 Q580,30 585,25 Q595,14 600,25 L600,40 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
            <CompassIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">{t('qibla.title')}</h2>
            <p className="text-[10px] sm:text-xs text-white/50 leading-tight mt-0.5">{t('qibla.subtitle')}</p>
          </div>
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-2.5 sm:py-1 border border-white/10 shrink-0">
            <p className="text-xs sm:text-sm text-white/70 arabic-text leading-tight">الكعبة المشرفة</p>
          </div>
        </div>
      </div>

      <div className="gold-border-strip" />

      {/* ═══ CONTENT ═══ */}
      <CardContent className="px-3 sm:px-5 pt-0 pb-3 sm:pb-5">
        {/* User heading display - above compass */}
        {deviceHeading !== null && (
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 rounded-lg bg-primary/8 dark:bg-primary/10 px-3 py-2 sm:px-4 sm:py-2.5 border border-primary/10">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary fill-current shrink-0">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
            <span className="text-xs sm:text-sm text-muted-foreground">{t('qibla.yourHeading')}:</span>
            <span className="text-xs sm:text-sm font-bold text-primary">
              {deviceHeading.toFixed(0)}° {degreesToCardinal(deviceHeading)}
            </span>
          </div>
        )}

        {/* Compass — extra top padding so "You" pointer doesn't overlap header */}
        <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 mb-4 sm:mb-6 mt-8 sm:mt-9">
          {/* Fixed "You" pointer at top - does NOT rotate with compass */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            <span className="text-[8px] sm:text-[9px] font-bold text-primary uppercase tracking-wider bg-background/80 px-1.5 py-0.5 rounded">
              {t('qibla.youLabel')}
            </span>
            <svg width="14" height="10" viewBox="0 0 14 10" className="mt-px drop-shadow-sm">
              <polygon points="7,10 0,0 14,0" className="fill-primary" />
            </svg>
          </div>

          {/* Outer decorative ring — arabesque-inspired */}
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="98" fill="none" stroke="hsl(40,85%,52%)" strokeWidth="0.5" opacity="0.15" />
              <circle cx="100" cy="100" r="96" fill="none" stroke="hsl(40,85%,52%)" strokeWidth="0.3" opacity="0.1" />
              {/* 8 ornamental dots at 45° intervals on outer ring */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <circle
                  key={angle}
                  cx={100 + 97 * Math.cos((angle - 90) * Math.PI / 180)}
                  cy={100 + 97 * Math.sin((angle - 90) * Math.PI / 180)}
                  r="1.5"
                  fill="hsl(40,85%,52%)"
                  opacity="0.2"
                />
              ))}
            </svg>
          </div>

          {/* Rotating compass dial - rotates by -deviceHeading so N/S/E/W show real directions */}
          <div
            className="absolute inset-1 rounded-full border-2 border-[hsl(40,85%,52%,0.15)] overflow-hidden rotate-smooth"
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
                  className="block text-[8px] sm:text-[9px] font-medium text-muted-foreground/50 mt-4"
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
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full islamic-gradient flex items-center justify-center shadow-lg text-white">
                          <KaabaIcon />
                        </div>
                        <span className="text-[7px] sm:text-[8px] font-bold text-primary mt-0.5 bg-background/90 px-1.5 py-px rounded-full shadow-sm whitespace-nowrap">
                          {t('qibla.qiblaLabel')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Needle line from Kaaba icon toward center */}
                  <div className="absolute top-[2.8rem] sm:top-[3.2rem] left-1/2 -translate-x-1/2 w-0.5 h-[calc(50%-0.8rem)] rounded-full islamic-gradient opacity-50" />
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full islamic-gradient shadow-md z-10" />
            </div>
          </div>

          {/* Decorative Islamic pattern overlay */}
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-[0.03]">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M50 5 L50 95 M5 50 L95 50 M15 15 L85 85 M85 15 L15 85" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        {/* Star divider above info cards */}
        <StarDivider />

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div className="rounded-lg bg-primary/8 dark:bg-primary/10 p-3 sm:p-4 text-center border border-primary/10">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="text-primary">
                <DirectionIcon />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('qibla.direction')}</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-primary">{direction.toFixed(1)}°</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/70">{degreesToCardinal(direction)}</p>
          </div>
          <div className="rounded-lg bg-secondary/8 dark:bg-secondary/10 p-3 sm:p-4 text-center border border-secondary/10">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="text-secondary">
                <DistanceIcon />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('qibla.distance')}</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-secondary">
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

        {/* Instructions footer with ornamental divider */}
        <div className="flex items-center gap-2 mt-3 sm:mt-4 mb-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(40,70%,50%,0.25)]" />
          <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 text-[hsl(40,85%,52%)] opacity-25">
            <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(40,70%,50%,0.25)]" />
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground/50 text-center italic">
          {t('qibla.faceDirection')}
        </p>
      </CardContent>
    </Card>
  );
};
