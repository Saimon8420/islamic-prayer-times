import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes, formatPrayerTime } from '../../services/prayerService';
import { gregorianToHijri, isRamadan, getDaysUntilRamadan } from '../../services/hijriService';
import { formatCountdown, formatDuration } from '../../utils';
import { cn } from '../../lib/utils';

// Custom Icons
const SahurIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <circle cx="12" cy="17" r="5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2v4M4 12H2M6.34 6.34L4.93 4.93M17.66 6.34l1.41-1.41M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 14l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IftarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 3v3M5 5l2 2M19 5l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    <circle cx="15" cy="15" r="1" fill="currentColor" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

const DatesIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-600">
    <ellipse cx="8" cy="14" rx="3" ry="5" />
    <ellipse cx="16" cy="14" rx="3" ry="5" />
    <ellipse cx="12" cy="12" rx="3" ry="5" />
    <path d="M8 9V5M12 7V3M16 9V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const FastingTimesCard = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);

  const [currentTime, setCurrentTime] = useState(new Date());

  const hasLocation = location !== null;

  // Calculate prayer times for fasting
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

  // Get hijri date
  const hijriDate = useMemo(() => gregorianToHijri(new Date()), []);

  // Check Ramadan status
  const isCurrentlyRamadan = useMemo(() => isRamadan(), []);
  const daysUntilRamadan = useMemo(() => getDaysUntilRamadan(), []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!hasLocation || !prayerTimes) return null;

  const sahurTime = prayerTimes.imsak; // Sahur ends at Imsak (10 min before Fajr)
  const iftarTime = prayerTimes.maghrib;

  // Calculate fasting duration in minutes
  const fastingDuration = Math.floor((iftarTime.getTime() - prayerTimes.fajr.getTime()) / (1000 * 60));

  const isFasting = currentTime >= prayerTimes.fajr && currentTime < iftarTime;

  const getTimeUntil = () => {
    if (currentTime < sahurTime) {
      return {
        event: 'Sahur ends in',
        seconds: Math.floor((sahurTime.getTime() - currentTime.getTime()) / 1000),
        type: 'sahur' as const,
      };
    }
    if (currentTime < iftarTime) {
      return {
        event: 'Iftar in',
        seconds: Math.floor((iftarTime.getTime() - currentTime.getTime()) / 1000),
        type: 'iftar' as const,
      };
    }
    return null;
  };

  const timeUntil = getTimeUntil();

  const getFastingProgress = () => {
    if (!isFasting) return 0;
    const totalFastingTime = iftarTime.getTime() - prayerTimes.fajr.getTime();
    const elapsed = currentTime.getTime() - prayerTimes.fajr.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalFastingTime) * 100));
  };

  return (
    <Card className="islamic-border overflow-hidden fade-in">
      {/* Header */}
      <div className="islamic-gradient-gold p-6 text-white relative overflow-hidden">
        <div className="crescent-decoration w-32 h-32 -top-8 -right-8 opacity-20" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <DatesIcon />
                Fasting Times
              </h2>
              <p className="text-white/80 text-sm">
                {hijriDate.formatted}
              </p>
              {isCurrentlyRamadan && (
                <p className="text-white font-medium mt-1">Ramadan Mubarak!</p>
              )}
              {!isCurrentlyRamadan && daysUntilRamadan !== null && daysUntilRamadan > 0 && (
                <p className="text-white/80 text-sm mt-1">
                  {daysUntilRamadan} days until Ramadan
                </p>
              )}
            </div>
            <div className="text-right bg-white/20 rounded-xl px-4 py-2">
              <p className="text-xs text-white/70">Duration</p>
              <p className="text-xl font-bold">{formatDuration(fastingDuration)}</p>
            </div>
          </div>

          {/* Countdown */}
          {timeUntil && (
            <div className={cn(
              'glass-card rounded-2xl p-5 border-l-4',
              timeUntil.type === 'sahur' ? 'border-l-blue-300/80' : 'border-l-orange-200/80'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white',
                    timeUntil.type === 'sahur' ? 'bg-blue-500/30' : 'bg-orange-500/30'
                  )}>
                    {timeUntil.type === 'sahur' ? <SahurIcon /> : <IftarIcon />}
                  </div>
                  <span className="text-white/90 font-medium drop-shadow-sm">{timeUntil.event}</span>
                </div>
                <p className="text-3xl font-bold countdown-display tabular-nums text-white">
                  {formatCountdown(timeUntil.seconds)}
                </p>
              </div>
              {isFasting && <Progress value={getFastingProgress()} className="mt-4 h-2" />}
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Sahur */}
          <div className={cn(
            'relative overflow-hidden rounded-2xl p-6 transition-all',
            currentTime < sahurTime
              ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 ring-2 ring-blue-500/50'
              : 'bg-muted/50'
          )}>
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-500/10" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                <SahurIcon />
              </div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Sahur (Sehri)
              </p>
              <p className="text-3xl font-bold">{formatPrayerTime(sahurTime, use24HourFormat)}</p>
              <p className="text-xs text-muted-foreground mt-2">End of pre-dawn meal</p>
            </div>
          </div>

          {/* Iftar */}
          <div className={cn(
            'relative overflow-hidden rounded-2xl p-6 transition-all',
            isFasting
              ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 ring-2 ring-orange-500/50'
              : 'bg-muted/50'
          )}>
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-orange-500/10" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3 text-orange-600 dark:text-orange-400">
                <IftarIcon />
              </div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                Iftar
              </p>
              <p className="text-3xl font-bold">{formatPrayerTime(iftarTime, use24HourFormat)}</p>
              <p className="text-xs text-muted-foreground mt-2">Time to break fast</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-6 rounded-xl bg-muted/50 p-4 text-center">
          {isFasting ? (
            <div>
              <p className="font-medium text-primary">You are currently fasting</p>
              <p className="text-sm text-muted-foreground mt-1">
                May Allah accept your fast
                <span className="arabic-text mx-2">تقبل الله</span>
              </p>
            </div>
          ) : currentTime < sahurTime ? (
            <div>
              <p className="font-medium">Prepare for Sahur</p>
              <p className="text-sm text-muted-foreground mt-1">
                Don't forget to make intention for fasting
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-primary">Fast completed for today</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="arabic-text">الحمد لله</span> - Alhamdulillah
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
