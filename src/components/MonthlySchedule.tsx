import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Moon,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  MoonStar,
  UtensilsCrossed,
  Timer,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  getDaysInMonth,
  startOfMonth,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useStore } from "../store/useStore";
import {
  calculatePrayerTimes,
  formatPrayerTime,
} from "../services/prayerService";
import { formatDuration } from "../utils";
import { useTranslation } from "../i18n/useTranslation";

interface DayData {
  date: Date;
  dayNum: number;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  fastingDuration: number;
}

export const MonthlySchedule = () => {
  const location = useStore((state) => state.location);
  const calculationMethod = useStore((state) => state.calculationMethod);
  const madhab = useStore((state) => state.madhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);
  const { t } = useTranslation();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("prayer");

  const hasLocation = location !== null;

  const prayerColumns = [
    { key: "fajr", label: t('prayer.names.Fajr'), icon: Moon, color: "text-indigo-400 dark:text-indigo-300" },
    { key: "sunrise", label: t('prayer.names.Sunrise'), icon: Sunrise, color: "text-orange-400 dark:text-orange-300" },
    { key: "dhuhr", label: t('prayer.names.Dhuhr'), icon: Sun, color: "text-yellow-500 dark:text-yellow-400" },
    { key: "asr", label: t('prayer.names.Asr'), icon: CloudSun, color: "text-amber-500 dark:text-amber-400" },
    { key: "maghrib", label: t('prayer.names.Maghrib'), icon: Sunset, color: "text-rose-400 dark:text-rose-300" },
    { key: "isha", label: t('prayer.names.Isha'), icon: MoonStar, color: "text-blue-400 dark:text-blue-300" },
  ] as const;

  const monthData = useMemo(() => {
    if (!hasLocation) return [];

    const daysInMonth = getDaysInMonth(currentMonth);
    const monthStart = startOfMonth(currentMonth);
    const data: DayData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day,
      );
      const prayerTimes = calculatePrayerTimes(
        location.lat,
        location.lon,
        date,
        calculationMethod,
        madhab,
      );

      const fastingDuration = Math.floor(
        (prayerTimes.maghrib.getTime() - prayerTimes.fajr.getTime()) /
          (1000 * 60),
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

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const renderEmptyState = (message: string) => (
    <p className="text-center text-muted-foreground py-8">{message}</p>
  );

  const renderDateCell = (day: DayData, isToday: boolean) => (
    <td className={`py-2.5 px-3 ${isToday ? "border-s-[3px] border-s-primary" : "border-s-[3px] border-s-transparent"}`}>
      <div className="flex items-center gap-2">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isToday
              ? "islamic-gradient text-white shadow-md"
              : "bg-muted/60 text-muted-foreground"
          }`}
        >
          {day.dayNum}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium">{format(day.date, "EEE")}</span>
          {isToday && (
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
              {t('common.today')}
            </span>
          )}
        </div>
      </div>
    </td>
  );

  const renderMobileDateHeader = (day: DayData, isToday: boolean) => (
    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border/40">
      <div className="flex items-center gap-2.5">
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
            isToday
              ? "islamic-gradient text-white shadow-md"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {day.dayNum}
        </span>
        <span className="font-semibold text-sm">{format(day.date, "EEEE")}</span>
      </div>
      {isToday && (
        <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {t('common.today')}
        </span>
      )}
    </div>
  );

  return (
    <Card className="islamic-border">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('schedule.title')}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-semibold text-sm">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prayer">{t('schedule.prayerTimes')}</TabsTrigger>
            <TabsTrigger value="fasting">{t('schedule.fastingTimes')}</TabsTrigger>
          </TabsList>

          <TabsContent value="prayer" className="mt-4">
            {monthData.length === 0 ? (
              renderEmptyState(t('schedule.noLocationPrayer'))
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-border/40 shadow-sm">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="islamic-gradient text-white">
                        <th className="py-3.5 px-3 text-start font-semibold text-xs uppercase tracking-wider">
                          {t('schedule.date')}
                        </th>
                        {prayerColumns.map((col) => {
                          const Icon = col.icon;
                          return (
                            <th
                              key={col.key}
                              className="py-3.5 px-2 text-center font-semibold text-xs uppercase tracking-wider"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <Icon className="h-3.5 w-3.5 opacity-80" />
                                <span>{col.label}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {monthData.map((day, index) => {
                        const isToday =
                          todayStr === format(day.date, "yyyy-MM-dd");
                        return (
                          <tr
                            key={day.dayNum}
                            className={`transition-colors ${
                              isToday
                                ? "bg-primary/10 font-semibold"
                                : index % 2 === 0
                                  ? "bg-card hover:bg-muted/30"
                                  : "bg-muted/15 hover:bg-muted/40"
                            }`}
                          >
                            {renderDateCell(day, isToday)}
                            {prayerColumns.map((col) => (
                              <td
                                key={col.key}
                                className="py-2.5 px-2 text-center tabular-nums text-[13px]"
                              >
                                {formatPrayerTime(
                                  day[col.key as keyof DayData] as Date,
                                  use24HourFormat,
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-2 max-h-[70vh] overflow-y-auto pe-1">
                  {monthData.map((day) => {
                    const isToday =
                      todayStr === format(day.date, "yyyy-MM-dd");
                    return (
                      <div
                        key={day.dayNum}
                        className={`rounded-xl p-3 border transition-all ${
                          isToday
                            ? "border-primary/40 bg-primary/8 shadow-md shadow-primary/10"
                            : "border-border/30 bg-card hover:bg-muted/20"
                        }`}
                      >
                        {renderMobileDateHeader(day, isToday)}

                        <div className="grid grid-cols-3 gap-x-2 gap-y-2.5">
                          {prayerColumns.map((col) => {
                            const Icon = col.icon;
                            return (
                              <div
                                key={col.key}
                                className="flex flex-col items-center gap-0.5 py-1 rounded-lg bg-muted/25"
                              >
                                <div className="flex items-center gap-1">
                                  <Icon className={`h-3 w-3 ${col.color}`} />
                                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                    {col.label}
                                  </span>
                                </div>
                                <span className="text-sm font-bold tabular-nums">
                                  {formatPrayerTime(
                                    day[col.key as keyof DayData] as Date,
                                    use24HourFormat,
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="fasting" className="mt-4">
            {monthData.length === 0 ? (
              renderEmptyState(t('schedule.noLocationFasting'))
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-border/40 shadow-sm">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="islamic-gradient text-white">
                        <th className="py-3.5 px-3 text-start font-semibold text-xs uppercase tracking-wider">
                          {t('schedule.date')}
                        </th>
                        <th className="py-3.5 px-3 text-center font-semibold text-xs uppercase tracking-wider">
                          <div className="flex flex-col items-center gap-1">
                            <UtensilsCrossed className="h-3.5 w-3.5 opacity-80" />
                            <span>{t('schedule.sahurEnds')}</span>
                          </div>
                        </th>
                        <th className="py-3.5 px-3 text-center font-semibold text-xs uppercase tracking-wider">
                          <div className="flex flex-col items-center gap-1">
                            <Sunset className="h-3.5 w-3.5 opacity-80" />
                            <span>{t('fasting.iftar')}</span>
                          </div>
                        </th>
                        <th className="py-3.5 px-3 text-center font-semibold text-xs uppercase tracking-wider">
                          <div className="flex flex-col items-center gap-1">
                            <Timer className="h-3.5 w-3.5 opacity-80" />
                            <span>{t('fasting.duration')}</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthData.map((day, index) => {
                        const isToday =
                          todayStr === format(day.date, "yyyy-MM-dd");
                        const sahurTime = new Date(
                          day.fajr.getTime() - 10 * 60 * 1000,
                        );

                        return (
                          <tr
                            key={day.dayNum}
                            className={`transition-colors ${
                              isToday
                                ? "bg-primary/10 font-semibold"
                                : index % 2 === 0
                                  ? "bg-card hover:bg-muted/30"
                                  : "bg-muted/15 hover:bg-muted/40"
                            }`}
                          >
                            {renderDateCell(day, isToday)}
                            <td className="py-2.5 px-3 text-center tabular-nums text-[13px]">
                              {formatPrayerTime(sahurTime, use24HourFormat)}
                            </td>
                            <td className="py-2.5 px-3 text-center tabular-nums text-[13px]">
                              {formatPrayerTime(day.maghrib, use24HourFormat)}
                            </td>
                            <td className="py-2.5 px-3 text-center tabular-nums text-[13px] text-muted-foreground">
                              {formatDuration(day.fastingDuration)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-2 max-h-[70vh] overflow-y-auto pe-1">
                  {monthData.map((day) => {
                    const isToday =
                      todayStr === format(day.date, "yyyy-MM-dd");
                    const sahurTime = new Date(
                      day.fajr.getTime() - 10 * 60 * 1000,
                    );

                    return (
                      <div
                        key={day.dayNum}
                        className={`rounded-xl p-3 border transition-all ${
                          isToday
                            ? "border-primary/40 bg-primary/8 shadow-md shadow-primary/10"
                            : "border-border/30 bg-card hover:bg-muted/20"
                        }`}
                      >
                        {renderMobileDateHeader(day, isToday)}

                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-muted/25">
                            <div className="flex items-center gap-1">
                              <UtensilsCrossed className="h-3 w-3 text-indigo-400 dark:text-indigo-300" />
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                {t('fasting.sahur')}
                              </span>
                            </div>
                            <span className="text-sm font-bold tabular-nums">
                              {formatPrayerTime(sahurTime, use24HourFormat)}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-muted/25">
                            <div className="flex items-center gap-1">
                              <Sunset className="h-3 w-3 text-rose-400 dark:text-rose-300" />
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                {t('fasting.iftar')}
                              </span>
                            </div>
                            <span className="text-sm font-bold tabular-nums">
                              {formatPrayerTime(day.maghrib, use24HourFormat)}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-muted/25">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                {t('fasting.duration')}
                              </span>
                            </div>
                            <span className="text-sm font-bold tabular-nums">
                              {formatDuration(day.fastingDuration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
