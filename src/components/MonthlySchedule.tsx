import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
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
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useStore } from "../store/useStore";
import {
  calculatePrayerTimes,
  formatPrayerTime,
} from "../services/prayerService";
import { formatDuration } from "../utils";
import { useTranslation } from "../i18n/useTranslation";

/* ═══════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════ */

// Calendar icon for header
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
    <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="7" y="12" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
    <rect x="14" y="12" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
    <rect x="7" y="17" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
  </svg>
);

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
          className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold tabular-nums shrink-0 ${
            isToday
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted/60 text-muted-foreground"
          }`}
        >
          {day.dayNum}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium">{format(day.date, "EEE")}</span>
          {isToday && (
            <span className="label-mono !text-primary">
              {t('common.today')}
            </span>
          )}
        </div>
      </div>
    </td>
  );

  const renderMobileDateHeader = (day: DayData, isToday: boolean) => (
    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border">
      <div className="flex items-center gap-2.5">
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm font-semibold tabular-nums ${
            isToday
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {day.dayNum}
        </span>
        <span className="font-display font-semibold text-sm">{format(day.date, "EEEE")}</span>
      </div>
      {isToday && (
        <span className="label-mono rounded-full bg-primary px-2 py-0.5 !text-primary-foreground">
          {t('common.today')}
        </span>
      )}
    </div>
  );

  return (
    <Card className="overflow-hidden fade-in">
      {/* faint heritage watermark, top-right */}
      <div className="girih-watermark pointer-events-none absolute right-3 top-3 h-20 w-20 sm:h-24 sm:w-24" />

      {/* ═══ HEADER ═══ */}
      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary sm:h-10 sm:w-10">
              <CalendarIcon />
            </div>
            <div>
              <p className="label-mono">{t('schedule.title')}</p>
              <p className="mt-0.5 font-display text-base font-semibold leading-tight text-foreground sm:text-lg">
                {format(currentMonth, "MMMM yyyy")}
              </p>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-6">
        <div className="heritage-rule" />
      </div>

      {/* ═══ BODY ═══ */}
      <CardContent className="px-2 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 relative">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prayer">{t('schedule.prayerTimes')}</TabsTrigger>
            <TabsTrigger value="fasting">{t('schedule.fastingTimes')}</TabsTrigger>
          </TabsList>

          <TabsContent value="prayer" className="mt-3 sm:mt-4">
            {monthData.length === 0 ? (
              renderEmptyState(t('schedule.noLocationPrayer'))
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="py-3 px-3 text-start">
                          <span className="label-mono">{t('schedule.date')}</span>
                        </th>
                        {prayerColumns.map((col) => {
                          const Icon = col.icon;
                          return (
                            <th
                              key={col.key}
                              className="py-3 px-2 text-center"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <Icon className={`h-3.5 w-3.5 ${col.color}`} />
                                <span className="label-mono">{col.label}</span>
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
                            className={`border-b border-border transition-colors ${
                              isToday
                                ? "bg-primary/10 font-semibold"
                                : index % 2 === 0
                                  ? "hover:bg-muted/30"
                                  : "bg-muted/30 hover:bg-muted/50"
                            }`}
                          >
                            {renderDateCell(day, isToday)}
                            {prayerColumns.map((col) => (
                              <td
                                key={col.key}
                                className={`py-2.5 px-2 text-center font-mono tabular-nums text-[13px] ${
                                  isToday ? "text-primary" : "text-foreground"
                                }`}
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
                        className={`rounded-xl p-3 border transition-colors ${
                          isToday
                            ? "border-primary/40 bg-primary/[0.06]"
                            : "border-border bg-muted/20 hover:bg-muted/30"
                        }`}
                      >
                        {renderMobileDateHeader(day, isToday)}

                        <div className="grid grid-cols-3 gap-x-2 gap-y-2.5">
                          {prayerColumns.map((col) => {
                            const Icon = col.icon;
                            return (
                              <div
                                key={col.key}
                                className="flex flex-col items-center gap-0.5 py-1 rounded-lg bg-muted/30"
                              >
                                <div className="flex items-center gap-1">
                                  <Icon className={`h-3 w-3 ${col.color}`} />
                                  <span className="label-mono">
                                    {col.label}
                                  </span>
                                </div>
                                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
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

          <TabsContent value="fasting" className="mt-3 sm:mt-4">
            {monthData.length === 0 ? (
              renderEmptyState(t('schedule.noLocationFasting'))
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="py-3 px-3 text-start">
                          <span className="label-mono">{t('schedule.date')}</span>
                        </th>
                        <th className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <UtensilsCrossed className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-300" />
                            <span className="label-mono">{t('schedule.sahurEnds')}</span>
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Sunset className="h-3.5 w-3.5 text-rose-400 dark:text-rose-300" />
                            <span className="label-mono">{t('fasting.iftar')}</span>
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Timer className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                            <span className="label-mono">{t('fasting.duration')}</span>
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
                            className={`border-b border-border transition-colors ${
                              isToday
                                ? "bg-primary/10 font-semibold"
                                : index % 2 === 0
                                  ? "hover:bg-muted/30"
                                  : "bg-muted/30 hover:bg-muted/50"
                            }`}
                          >
                            {renderDateCell(day, isToday)}
                            <td className={`py-2.5 px-3 text-center font-mono tabular-nums text-[13px] ${isToday ? "text-primary" : "text-foreground"}`}>
                              {formatPrayerTime(sahurTime, use24HourFormat)}
                            </td>
                            <td className={`py-2.5 px-3 text-center font-mono tabular-nums text-[13px] ${isToday ? "text-primary" : "text-foreground"}`}>
                              {formatPrayerTime(day.maghrib, use24HourFormat)}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums text-[13px] text-muted-foreground">
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
                        className={`rounded-xl p-3 border transition-colors ${
                          isToday
                            ? "border-primary/40 bg-primary/[0.06]"
                            : "border-border bg-muted/20 hover:bg-muted/30"
                        }`}
                      >
                        {renderMobileDateHeader(day, isToday)}

                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1">
                              <UtensilsCrossed className="h-3 w-3 text-indigo-400 dark:text-indigo-300" />
                              <span className="label-mono">
                                {t('fasting.sahur')}
                              </span>
                            </div>
                            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                              {formatPrayerTime(sahurTime, use24HourFormat)}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1">
                              <Sunset className="h-3 w-3 text-rose-400 dark:text-rose-300" />
                              <span className="label-mono">
                                {t('fasting.iftar')}
                              </span>
                            </div>
                            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                              {formatPrayerTime(day.maghrib, use24HourFormat)}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                              <span className="label-mono">
                                {t('fasting.duration')}
                              </span>
                            </div>
                            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
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
