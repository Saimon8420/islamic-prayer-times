import { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { calculateQibla, calculateDistanceToMakkah } from '../../services/prayerService';
import { degreesToCardinal } from '../../utils';

// Kaaba Icon
const KaabaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <rect x="4" y="6" width="16" height="16" rx="1" />
    <path d="M8 6V4a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="10" y="12" width="4" height="6" fill="white" opacity="0.3" />
  </svg>
);

export const QiblaCompass = () => {
  const location = useStore((state) => state.location);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

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

  if (!hasLocation || !qiblaData) return null;

  const direction = qiblaData.direction;
  const distance = qiblaData.distance;
  const qiblaRotation = deviceHeading !== null ? direction - deviceHeading : direction;

  return (
    <Card className="islamic-border overflow-hidden fade-in">
      {/* Header */}
      <div className="islamic-gradient p-6 text-white text-center relative overflow-hidden">
        <div className="crescent-decoration w-40 h-40 -top-10 -right-10 opacity-20" />
        <div className="crescent-decoration w-32 h-32 -bottom-8 -left-8 rotate-180 opacity-20" />

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Qibla Direction</h2>
          <p className="text-white/80 text-sm">
            Direction to the Holy Kaaba
          </p>
          <p className="text-2xl arabic-text mt-2">الكعبة المشرفة</p>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Compass */}
        <div className="relative mx-auto w-72 h-72 mb-6">
          {/* Outer decorative ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20">
            {/* Degree markers */}
            {[...Array(72)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom h-full"
                style={{ transform: `translateX(-50%) rotate(${i * 5}deg)` }}
              >
                <div
                  className={`w-0.5 ${
                    i % 6 === 0 ? 'h-3 bg-primary' : 'h-1.5 bg-primary/30'
                  }`}
                />
              </div>
            ))}

            {/* Cardinal directions */}
            {[
              { dir: 'N', angle: 0, ar: 'ش' },
              { dir: 'E', angle: 90, ar: 'ش' },
              { dir: 'S', angle: 180, ar: 'ج' },
              { dir: 'W', angle: 270, ar: 'غ' },
            ].map(({ dir, angle }) => (
              <div
                key={dir}
                className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom h-full"
                style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
              >
                <span
                  className={`block text-sm font-bold mt-4 ${
                    dir === 'N' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  style={{ transform: `rotate(-${angle}deg)` }}
                >
                  {dir}
                </span>
              </div>
            ))}
          </div>

          {/* Inner compass area */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-br from-muted to-muted/50 shadow-inner">
            {/* Compass needle pointing to Qibla */}
            <div
              className="absolute inset-0 flex items-center justify-center rotate-smooth"
              style={{ transform: `rotate(${qiblaRotation}deg)` }}
            >
              {/* Needle */}
              <div className="relative w-full h-full">
                {/* Kaaba icon at top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <div className="w-14 h-14 rounded-full islamic-gradient flex items-center justify-center shadow-lg text-white">
                    <KaabaIcon />
                  </div>
                </div>

                {/* Needle line */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-1 h-[calc(50%-1rem)] rounded-full islamic-gradient" />

                {/* Bottom indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-muted-foreground/30" />
              </div>
            </div>

            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full islamic-gradient shadow-md" />
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
            <p className="text-sm text-muted-foreground mb-1">Direction</p>
            <p className="text-2xl font-bold text-primary">{direction.toFixed(1)}°</p>
            <p className="text-xs text-muted-foreground">{degreesToCardinal(direction)}</p>
          </div>
          <div className="rounded-xl bg-secondary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Distance</p>
            <p className="text-2xl font-bold text-secondary">
              {distance.toLocaleString()} km
            </p>
            <p className="text-xs text-muted-foreground">to Makkah</p>
          </div>
        </div>

        {/* Status Messages */}
        {!isSupported && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400">
              Device compass not supported. Use the degree value above.
            </span>
          </div>
        )}

        {permissionDenied && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400">
              Compass permission denied. Enable device orientation in settings.
            </span>
          </div>
        )}

        {deviceHeading === null && isSupported && !permissionDenied && (
          <div className="mt-4 text-center text-sm text-muted-foreground rounded-xl bg-muted/50 p-4">
            <p>Hold your device flat and level for accurate compass direction.</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Face the direction shown by the Kaaba icon to pray towards Qibla</p>
        </div>
      </CardContent>
    </Card>
  );
};
