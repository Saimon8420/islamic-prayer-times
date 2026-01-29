import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useStore } from '../store/useStore';
import { calculatePrayerTimes, formatPrayerTime } from '../services/prayerService';
import { formatDuration } from '../utils';

interface DayData {
  date: Date;
  dayNum: number;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  fastingDuration: number; // in minutes
}

export const MonthlySchedule = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('prayer');

  const hasLocation = location !== null;

  // Calculate prayer times for each day of the month
  const monthData = useMemo(() => {
    if (!hasLocation) return [];

    const daysInMonth = getDaysInMonth(currentMonth);
    const monthStart = startOfMonth(currentMonth);
    const data: DayData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      const prayerTimes = calculatePrayerTimes(
        location.lat,
        location.lon,
        date,
        calculationMethod,
        madhab
      );

      // Calculate fasting duration in minutes
      const fastingDuration = Math.floor(
        (prayerTimes.maghrib.getTime() - prayerTimes.fajr.getTime()) / (1000 * 60)
      );

      data.push({
        date,
        dayNum: day,
        fajr: prayerTimes.fajr,
        sunrise: prayerTimes.sunrise,
        dhuhr: prayerTimes.dhuhr,
        asr: prayerTimes.asr,
        maghrib: prayerTimes.maghrib,
        isha: prayerTimes.isha,
        fastingDuration,
      });
    }

    return data;
  }, [currentMonth, hasLocation, location, calculationMethod, madhab]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <Card className="islamic-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Monthly Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prayer">Prayer Times</TabsTrigger>
            <TabsTrigger value="fasting">Fasting Times</TabsTrigger>
          </TabsList>

          {/* Prayer Times Tab */}
          <TabsContent value="prayer" className="mt-4">
            {monthData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Please set your location to view prayer times.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="py-3 px-2 text-left font-semibold">Date</th>
                      <th className="py-3 px-2 text-center font-semibold">Fajr</th>
                      <th className="py-3 px-2 text-center font-semibold">Sunrise</th>
                      <th className="py-3 px-2 text-center font-semibold">Dhuhr</th>
                      <th className="py-3 px-2 text-center font-semibold">Asr</th>
                      <th className="py-3 px-2 text-center font-semibold">Maghrib</th>
                      <th className="py-3 px-2 text-center font-semibold">Isha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.map((day) => {
                      const isToday = todayStr === format(day.date, 'yyyy-MM-dd');
                      return (
                        <tr
                          key={day.dayNum}
                          className={`border-b transition-colors ${
                            isToday
                              ? 'bg-primary/15 font-medium'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                                  isToday ? 'bg-primary text-primary-foreground' : ''
                                }`}
                              >
                                {day.dayNum}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(day.date, 'EEE')}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            {formatPrayerTime(day.fajr, use24HourFormat)}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            {formatPrayerTime(day.sunrise, use24HourFormat)}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            {formatPrayerTime(day.dhuhr, use24HourFormat)}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            {formatPrayerTime(day.asr, use24HourFormat)}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            {formatPrayerTime(day.maghrib, use24HourFormat)}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            {formatPrayerTime(day.isha, use24HourFormat)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Fasting Times Tab */}
          <TabsContent value="fasting" className="mt-4">
            {monthData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Please set your location to view fasting times.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="py-3 px-2 text-left font-semibold">Date</th>
                      <th className="py-3 px-2 text-center font-semibold">Sahur</th>
                      <th className="py-3 px-2 text-center font-semibold">Iftar</th>
                      <th className="py-3 px-2 text-center font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.map((day) => {
                      const isToday = todayStr === format(day.date, 'yyyy-MM-dd');
                      // Sahur ends at Fajr, Iftar at Maghrib
                      const sahurTime = new Date(day.fajr.getTime() - 10 * 60 * 1000); // 10 min before Fajr

                      return (
                        <tr
                          key={day.dayNum}
                          className={`border-b transition-colors ${
                            isToday
                              ? 'bg-primary/15 font-medium'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                                  isToday ? 'bg-primary text-primary-foreground' : ''
                                }`}
                              >
                                {day.dayNum}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(day.date, 'EEE')}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            {formatPrayerTime(sahurTime, use24HourFormat)}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            {formatPrayerTime(day.maghrib, use24HourFormat)}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums text-muted-foreground">
                            {formatDuration(day.fastingDuration)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
