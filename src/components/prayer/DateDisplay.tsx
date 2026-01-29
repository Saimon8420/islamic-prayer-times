import { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { gregorianToHijri, getArabicWeekday } from '../../services/hijriService';

// Star Icon
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-secondary">
    <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" />
  </svg>
);

export const DateDisplay = () => {
  const location = useStore((state) => state.location);
  const hasLocation = location !== null;

  const today = useMemo(() => new Date(), []);
  const hijriDate = useMemo(() => gregorianToHijri(today), [today]);
  const arabicWeekday = useMemo(() => getArabicWeekday(today), [today]);

  if (!hasLocation) return null;

  return (
    <Card className="islamic-border overflow-hidden fade-in">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Gregorian Date */}
          <div className="flex-1 p-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent relative overflow-hidden">
            <div className="crescent-decoration w-24 h-24 -top-6 -right-6 opacity-10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl islamic-gradient text-white shadow-lg">
                <span className="text-2xl font-bold">{format(today, 'd')}</span>
                <span className="text-xs uppercase tracking-wider">
                  {format(today, 'MMM')}
                </span>
              </div>
              <div>
                <p className="text-xl font-semibold">{format(today, 'EEEE')}</p>
                <p className="text-sm text-muted-foreground">
                  {format(today, 'd MMMM yyyy')}{' '}
                  <span className="text-xs">CE</span>
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:flex items-center">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>
          <div className="sm:hidden flex justify-center">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Hijri Date */}
          <div className="flex-1 p-6 bg-gradient-to-bl from-secondary/10 via-transparent to-transparent relative overflow-hidden">
            <div className="crescent-decoration w-24 h-24 -bottom-6 -left-6 rotate-180 opacity-10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl islamic-gradient-gold text-white shadow-lg">
                <span className="text-2xl font-bold">{hijriDate.day}</span>
                <span className="text-xs arabic-text">{hijriDate.monthName.ar.substring(0, 4)}</span>
              </div>
              <div>
                <p className="text-xl font-semibold arabic-text">{arabicWeekday}</p>
                <p className="text-sm text-muted-foreground">
                  {hijriDate.day} {hijriDate.monthName.en} {hijriDate.year}{' '}
                  <span className="text-xs">AH</span>
                </p>
              </div>
            </div>

            {/* Decorative stars */}
            <div className="absolute top-4 right-4 flex gap-1">
              <StarIcon />
              <StarIcon />
              <StarIcon />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
