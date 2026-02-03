import { useMemo } from 'react';
import { Moon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes, formatPrayerTime } from '../../services/prayerService';
import { useTranslation } from '../../i18n/useTranslation';

export const AdditionalTimings = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);
  const { t } = useTranslation();

  const hasLocation = location !== null;

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
    { name: t('prayer.additional.imsak'), time: prayerTimes.imsak, desc: t('prayer.additional.imsakDesc') },
    { name: t('prayer.additional.midnight'), time: prayerTimes.midnight, desc: t('prayer.additional.midnightDesc') },
    { name: t('prayer.additional.lastThird'), time: prayerTimes.lastThird, desc: t('prayer.additional.lastThirdDesc') },
  ];

  const sunriseStart = new Date(prayerTimes.sunrise.getTime() - 10 * 60 * 1000);
  const sunriseEnd = new Date(prayerTimes.sunrise.getTime() + 15 * 60 * 1000);
  const noonStart = new Date(prayerTimes.dhuhr.getTime() - 5 * 60 * 1000);
  const noonEnd = prayerTimes.dhuhr;
  const sunsetStart = new Date(prayerTimes.maghrib.getTime() - 15 * 60 * 1000);
  const sunsetEnd = prayerTimes.maghrib;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Moon className="h-5 w-5 text-primary" />
            {t('prayer.additional.title')}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t('prayer.makruh.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            {t('prayer.makruh.description')}
          </p>
          <div className="rounded-lg bg-amber-500/10 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                {t('prayer.makruh.sunrise')}
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
                {t('prayer.makruh.solarNoon')}
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
                {t('prayer.makruh.sunset')}
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
