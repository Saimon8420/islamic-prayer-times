import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { calculateQibla, calculateDistanceToMakkah } from '../../services/prayerService';
import { degreesToCardinal } from '../../utils';
import { useTranslation } from '../../i18n/useTranslation';

// Kaaba Icon - 3D perspective view
const KaabaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-9 h-9">
    {/* Front face */}
    <path d="M3 7L3 22L15 22L15 7Z" fill="currentColor" />
    {/* Right side face */}
    <path d="M15 7L15 22L22 18L22 3Z" fill="currentColor" opacity="0.75" />
    {/* Top face */}
    <path d="M3 7L15 7L22 3L10 3Z" fill="currentColor" opacity="0.5" />
    {/* Gold band - front */}
    <rect x="3" y="10" width="12" height="2" fill="#d4a017" opacity="0.85" />
    {/* Gold band - side */}
    <path d="M15 10L22 6L22 8L15 12Z" fill="#d4a017" opacity="0.6" />
    {/* Door on front */}
    <path d="M7 22L7 15.5Q9.5 13 12 15.5L12 22Z" fill="#d4a017" opacity="0.45" />
    {/* Door frame outline */}
    <path d="M7 22L7 15.5Q9.5 13 12 15.5L12 22" fill="none" stroke="white" strokeWidth="0.4" opacity="0.5" />
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
  const directionLabels: { key: 'N' | 'E' | 'S' | 'W'; angle: number }[] = [
    { key: 'N', angle: 0 },
    { key: 'E', angle: 90 },
    { key: 'S', angle: 180 },
    { key: 'W', angle: 270 },
  ];

  return (
    <Card className="islamic-border overflow-hidden fade-in">
      {/* Header */}
      <div className="islamic-gradient p-6 text-white text-center relative overflow-hidden">
        <div className="crescent-decoration w-40 h-40 -top-10 -right-10 opacity-20" />
        <div className="crescent-decoration w-32 h-32 -bottom-8 -left-8 rotate-180 opacity-20" />

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">{t('qibla.title')}</h2>
          <p className="text-white/80 text-sm">
            {t('qibla.subtitle')}
          </p>
          <p className="text-2xl arabic-text mt-2">الكعبة المشرفة</p>
        </div>
      </div>

      <CardContent className="p-6">
        {/* User heading display - above compass */}
        {deviceHeading !== null && (
          <div className="flex items-center justify-center gap-2 mb-4 rounded-xl bg-primary/10 p-3">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary fill-current">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
            <span className="text-sm text-muted-foreground">{t('qibla.yourHeading')}:</span>
            <span className="text-sm font-bold text-primary">
              {deviceHeading.toFixed(0)}° {degreesToCardinal(deviceHeading)}
            </span>
          </div>
        )}

        {/* Compass */}
        <div className="relative mx-auto w-72 h-72 mb-6 mt-2">
          {/* Fixed "You" pointer at top - does NOT rotate with compass */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
              {t('qibla.youLabel')}
            </span>
            <svg width="14" height="10" viewBox="0 0 14 10" className="mt-px drop-shadow-sm">
              <polygon points="7,10 0,0 14,0" className="fill-primary" />
            </svg>
          </div>

          {/* Rotating compass dial - rotates by -deviceHeading so N/S/E/W show real directions */}
          <div
            className="absolute inset-0 rounded-full border-4 border-primary/20 overflow-hidden rotate-smooth"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            {/* Degree tick marks */}
            {[...Array(72)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 left-1/2 origin-bottom h-full"
                style={{ transform: `translateX(-50%) rotate(${i * 5}deg)` }}
              >
                <div
                  className={`w-0.5 ${
                    i % 6 === 0 ? 'h-3 bg-primary' : 'h-1.5 bg-primary/30'
                  }`}
                />
              </div>
            ))}

            {/* Cardinal direction labels (N, E, S, W) */}
            {directionLabels.map(({ key, angle }) => (
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
                    {/* N label - counter-rotates to stay upright */}
                    <span
                      className="text-xs font-bold text-red-500 leading-none"
                      style={{ transform: `rotate(${-(compassRotation + angle)}deg)` }}
                    >
                      {t('qibla.cardinalDirections.N')}
                    </span>
                  </div>
                ) : (
                  <span
                    className="block text-xs font-bold text-primary mt-4"
                    style={{ transform: `rotate(${-(compassRotation + angle)}deg)` }}
                  >
                    {t(`qibla.cardinalDirections.${key}`)}
                  </span>
                )}
              </div>
            ))}

            {/* Inner compass circle */}
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-muted to-muted/50 shadow-inner">
              {/* Qibla needle - rotated to the qibla bearing within the dial */}
              <div
                className="absolute inset-0"
                style={{ transform: `rotate(${direction}deg)` }}
              >
                <div className="relative w-full h-full">
                  {/* Kaaba icon at the Qibla end */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2">
                    {/* Counter-rotate so icon and label stay upright on screen */}
                    <div style={{ transform: `rotate(${-(compassRotation + direction)}deg)` }}>
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full islamic-gradient flex items-center justify-center shadow-lg text-white">
                          <KaabaIcon />
                        </div>
                        <span className="text-[8px] font-bold text-primary mt-0.5 bg-background/90 px-1.5 py-px rounded-full shadow-sm whitespace-nowrap">
                          {t('qibla.qiblaLabel')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Needle line from Kaaba icon toward center */}
                  <div className="absolute top-[3.6rem] left-1/2 -translate-x-1/2 w-0.5 h-[calc(50%-1rem)] rounded-full islamic-gradient opacity-50" />
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full islamic-gradient shadow-md z-10" />
            </div>
          </div>

          {/* Decorative Islamic pattern overlay */}
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-5">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M50 5 L50 95 M5 50 L95 50 M15 15 L85 85 M85 15 L15 85" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-primary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t('qibla.direction')}</p>
            <p className="text-2xl font-bold text-primary">{direction.toFixed(1)}°</p>
            <p className="text-xs text-muted-foreground">{degreesToCardinal(direction)}</p>
          </div>
          <div className="rounded-xl bg-secondary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t('qibla.distance')}</p>
            <p className="text-2xl font-bold text-secondary">
              {distance.toLocaleString()} km
            </p>
            <p className="text-xs text-muted-foreground">{t('qibla.toMakkah')}</p>
          </div>
        </div>

        {/* Status Messages */}
        {!isSupported && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400">
              {t('qibla.compassNotSupported')}
            </span>
          </div>
        )}

        {permissionDenied && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400">
              {t('qibla.compassPermissionDenied')}
            </span>
          </div>
        )}

        {deviceHeading === null && isSupported && !permissionDenied && (
          <div className="mt-4 text-center text-sm text-muted-foreground rounded-xl bg-muted/50 p-4">
            <p>{t('qibla.holdDeviceFlat')}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>{t('qibla.faceDirection')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
