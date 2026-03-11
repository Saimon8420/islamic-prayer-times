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
   DECORATIVE SVG COMPONENTS
   ═══════════════════════════════════════════ */

const ArabesqueCorner = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 0L20 10L10 20Z" fill="rgba(200,168,78,0.25)" />
    <path d="M0 0L40 5L35 15L15 35L5 40Z" fill="rgba(200,168,78,0.12)" />
    <path d="M40 5L35 15L50 20L60 10Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <path d="M5 40L15 35L20 50L10 60Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
    <circle cx="20" cy="20" r="6" stroke="rgba(200,168,78,0.15)" strokeWidth="0.5" fill="none" />
  </svg>
);

const HangingLantern = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 30 60" fill="none" className={className}>
    <line x1="15" y1="0" x2="15" y2="12" stroke="rgba(200,168,78,0.4)" strokeWidth="1" />
    <path d="M10 12h10l-1 3H11z" fill="rgba(200,168,78,0.5)" />
    <path d="M9 15Q9 10 15 10Q21 10 21 15v18Q21 40 15 44Q9 40 9 33z" fill="rgba(200,168,78,0.15)" stroke="rgba(200,168,78,0.35)" strokeWidth="1" />
    <ellipse cx="15" cy="25" rx="4" ry="8" fill="rgba(200,168,78,0.12)" />
  </svg>
);

const TessellationOverlay = () => (
  <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Cpath d='M30 30L37.5 37.5L30 45L22.5 37.5Z'/%3E%3Cpath d='M30 45L37.5 52.5L30 60L22.5 52.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
  }} />
);

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
    <Card className="islamic-border overflow-hidden fade-in">
      {/* ═══ HEADER — Arabian gradient with decorations ═══ */}
      <div className="islamic-gradient-header relative overflow-hidden px-4 py-3 sm:px-5 sm:py-4">
        <TessellationOverlay />

        {/* Arabesque corners */}
        <ArabesqueCorner className="absolute top-0 left-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50" />
        <ArabesqueCorner className="absolute top-0 right-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50 -scale-x-100" />

        {/* Hanging lantern */}
        <div className="absolute top-0 left-[15%] w-3 h-6 sm:w-4 sm:h-8 opacity-30 hidden sm:block" style={{ animation: 'lantern-sway 5s ease-in-out infinite' }}>
          <HangingLantern className="w-full h-full" />
        </div>

        {/* Crescent decoration */}
        <div className="absolute -top-3 -right-3 w-14 h-14 sm:w-20 sm:h-20 opacity-[0.06] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#c8a84e">
            <path d="M70 15 A35 35 0 1 0 70 85 A28 28 0 1 1 70 15" />
            <polygon points="78,42 81,50 90,50 83,55 86,64 78,58 70,64 73,55 66,50 75,50" />
          </svg>
        </div>

        {/* Mosque skyline */}
        <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 pointer-events-none">
          <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="w-full h-full" fill="white" fillOpacity="0.05">
            <path d="M0,40 L0,30 L20,30 L20,20 L22,10 L24,20 L24,30 L60,30 Q70,30 75,25 Q85,12 95,25 Q100,30 110,30 L140,30 L140,22 L142,12 L144,22 L144,30 L200,30 L210,26 Q220,18 230,26 L240,30 L280,30 L280,20 L282,8 L284,20 L284,30 L340,30 Q350,30 355,25 Q370,10 385,25 Q390,30 400,30 L440,30 L440,22 L442,10 L444,22 L444,30 L500,30 L510,26 Q520,16 530,26 L540,30 L570,30 Q580,30 585,25 Q595,14 600,25 L600,40 Z" />
          </svg>
        </div>

        {/* Content — horizontal layout with nav */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
              <CalendarIcon />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t('schedule.title')}
            </h2>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[110px] sm:min-w-[130px] text-center font-semibold text-xs sm:text-sm text-white">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Gold border strip */}
      <div className="gold-border-strip" />

      {/* ═══ BODY ═══ */}
      <CardContent className="px-2 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 relative">
        {/* Arabesque watermark */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#996b2f" stroke="#996b2f" strokeWidth="0.5">
            <path d="M50 5L60 20L77 10L70 28L90 25L78 40L95 50L78 60L90 75L70 72L77 90L60 80L50 95L40 80L23 90L30 72L10 75L22 60L5 50L22 40L10 25L30 28L23 10L40 20Z" />
            <circle cx="50" cy="50" r="15" fill="none" />
          </svg>
        </div>

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
                <div className="hidden md:block overflow-x-auto rounded-xl border border-border/40 shadow-sm">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="islamic-gradient-header text-white">
                        <th className="py-3 px-3 text-start font-semibold text-xs uppercase tracking-wider">
                          {t('schedule.date')}
                        </th>
                        {prayerColumns.map((col) => {
                          const Icon = col.icon;
                          return (
                            <th
                              key={col.key}
                              className="py-3 px-2 text-center font-semibold text-xs uppercase tracking-wider"
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

          <TabsContent value="fasting" className="mt-3 sm:mt-4">
            {monthData.length === 0 ? (
              renderEmptyState(t('schedule.noLocationFasting'))
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-border/40 shadow-sm">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="islamic-gradient-header text-white">
                        <th className="py-3 px-3 text-start font-semibold text-xs uppercase tracking-wider">
                          {t('schedule.date')}
                        </th>
                        <th className="py-3 px-3 text-center font-semibold text-xs uppercase tracking-wider">
                          <div className="flex flex-col items-center gap-1">
                            <UtensilsCrossed className="h-3.5 w-3.5 opacity-80" />
                            <span>{t('schedule.sahurEnds')}</span>
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center font-semibold text-xs uppercase tracking-wider">
                          <div className="flex flex-col items-center gap-1">
                            <Sunset className="h-3.5 w-3.5 opacity-80" />
                            <span>{t('fasting.iftar')}</span>
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center font-semibold text-xs uppercase tracking-wider">
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
