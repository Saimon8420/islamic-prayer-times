import { useMemo } from 'react';
import { Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useStore } from '../../store/useStore';
import { getUpcomingWhiteDays, isWhiteDay, gregorianToHijri } from '../../services/hijriService';
import { useTranslation } from '../../i18n/useTranslation';

export const WhiteDays = () => {
  const location = useStore((state) => state.location);
  const hasLocation = location !== null;
  const { t } = useTranslation();

  const whiteDays = useMemo(() => getUpcomingWhiteDays(6), []);
  const todayHijri = useMemo(() => gregorianToHijri(new Date()), []);
  const isTodayWhiteDay = useMemo(() => isWhiteDay(todayHijri.day), [todayHijri.day]);

  if (!hasLocation) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-yellow-500" />
          {t('fasting.whiteDays.title')}
        </CardTitle>
        <CardDescription>
          {t('fasting.whiteDays.description')}
          {isTodayWhiteDay && (
            <span className="ms-1 text-yellow-600 font-medium">{t('fasting.whiteDays.todayIsWhiteDay')}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {whiteDays.map((day, index) => {
            const isToday = format(day.gregorianDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  isToday ? 'bg-yellow-500/20 ring-2 ring-yellow-500/50' : 'bg-yellow-500/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isToday ? 'bg-yellow-500 text-white' : 'bg-yellow-500/20'
                  }`}>
                    <Calendar className={`h-5 w-5 ${isToday ? '' : 'text-yellow-600 dark:text-yellow-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium">
                      {t('fasting.whiteDays.dayOfMonth', { day: day.hijriDate.day, month: day.hijriDate.monthName.en })}
                      {isToday && <span className="ms-2 text-yellow-600 text-sm">{t('fasting.whiteDays.todayLabel')}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground arabic-text">
                      {day.hijriDate.formattedArabic}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(day.gregorianDate, 'EEE, MMM d')}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          {t('fasting.whiteDays.hadith')}
        </p>
      </CardContent>
    </Card>
  );
};
