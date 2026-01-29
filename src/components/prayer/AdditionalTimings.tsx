import { useMemo } from 'react';
import { Moon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes, formatPrayerTime } from '../../services/prayerService';

export const AdditionalTimings = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);

  const hasLocation = location !== null;

  // Calculate prayer times including additional times
  const prayerTimes = useMemo(() => {
    if (!hasLocation) return null;
    return calculatePrayerTimes(
      location.lat,
      location.lon,
      new Date(),
      calculationMethod,
      madhab
    );
  }, [hasLocation, location, calculationMethod, madhab]);

  if (!hasLocation || !prayerTimes) return null;

  const additionalTimes = [
    { name: 'Imsak', time: prayerTimes.imsak, desc: 'Start of fasting (10 min before Fajr)' },
    { name: 'Midnight', time: prayerTimes.midnight, desc: 'Islamic midnight' },
    { name: 'Last Third', time: prayerTimes.lastThird, desc: 'Tahajjud time begins' },
  ];

  // Calculate prohibited times (approximate)
  const sunriseStart = new Date(prayerTimes.sunrise.getTime() - 10 * 60 * 1000);
  const sunriseEnd = new Date(prayerTimes.sunrise.getTime() + 15 * 60 * 1000);
  const noonStart = new Date(prayerTimes.dhuhr.getTime() - 5 * 60 * 1000);
  const noonEnd = prayerTimes.dhuhr;
  const sunsetStart = new Date(prayerTimes.maghrib.getTime() - 15 * 60 * 1000);
  const sunsetEnd = prayerTimes.maghrib;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Additional Prayer Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Moon className="h-5 w-5 text-primary" />
            Additional Times
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {additionalTimes.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <p className="font-semibold tabular-nums">
                {formatPrayerTime(item.time, use24HourFormat)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Prohibited Prayer Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Makruh Times
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            It is disliked (makruh) to pray during these times:
          </p>
          <div className="rounded-lg bg-amber-500/10 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Sunrise
              </p>
              <p className="text-sm tabular-nums">
                {formatPrayerTime(sunriseStart, use24HourFormat)} -{' '}
                {formatPrayerTime(sunriseEnd, use24HourFormat)}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Solar Noon
              </p>
              <p className="text-sm tabular-nums">
                {formatPrayerTime(noonStart, use24HourFormat)} -{' '}
                {formatPrayerTime(noonEnd, use24HourFormat)}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Sunset
              </p>
              <p className="text-sm tabular-nums">
                {formatPrayerTime(sunsetStart, use24HourFormat)} -{' '}
                {formatPrayerTime(sunsetEnd, use24HourFormat)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
