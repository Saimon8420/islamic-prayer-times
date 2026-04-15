import { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { getUpcomingWhiteDays, isWhiteDay } from '../../services/hijriService';
import { useTranslation } from '../../i18n/useTranslation';
import { useHijriDate } from '../../hooks/useHijriDate';

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
  <div
    className="absolute inset-0 opacity-[0.04] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Cpath d='M30 30L37.5 37.5L30 45L22.5 37.5Z'/%3E%3Cpath d='M30 45L37.5 52.5L30 60L22.5 52.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
    }}
  />
);

// Star icon for header
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
    <path d="M12 2L14.5 8.5L22 9.5L16.5 14.5L18 22L12 18.5L6 22L7.5 14.5L2 9.5L9.5 8.5Z" opacity="0.9" />
  </svg>
);

// Calendar icon for each day
const CalendarDayIcon = ({ isToday }: { isToday: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 sm:w-5 sm:h-5">
    <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill={isToday ? "currentColor" : "none"} fillOpacity={isToday ? 0.15 : 0} />
    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" opacity="0.6" />
  </svg>
);

// Small star divider
const MiniStarDivider = () => (
  <div className="flex items-center px-3 sm:px-4">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(40,70%,50%,0.15)] to-transparent" />
    <svg viewBox="0 0 12 12" className="w-2 h-2 mx-1.5 text-[hsl(40,85%,52%)] opacity-20">
      <path d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5Z" fill="currentColor" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(40,70%,50%,0.15)] to-transparent" />
  </div>
);

export const WhiteDays = () => {
  const location = useStore((state) => state.location);
  const hasLocation = location !== null;
  const { t } = useTranslation();

  const hijriAdjustment = useStore((state) => state.hijriAdjustment);
  const { hijriDate: todayHijri, maghribTime } = useHijriDate();
  const whiteDays = useMemo(() => getUpcomingWhiteDays(6, hijriAdjustment, maghribTime), [hijriAdjustment, maghribTime]);
  const isTodayWhiteDay = useMemo(() => isWhiteDay(todayHijri.day), [todayHijri.day]);

  if (!hasLocation) return null;

  return (
    <Card className="islamic-border overflow-hidden fade-in">
      {/* ═══ HEADER — Deep navy Arabian gradient ═══ */}
      <div
        className="relative overflow-hidden px-4 py-3 sm:px-5 sm:py-4"
        style={{
          background: 'linear-gradient(135deg, hsl(45, 60%, 28%) 0%, hsl(40, 70%, 35%) 40%, hsl(38, 60%, 26%) 100%)',
        }}
      >
        <TessellationOverlay />

        {/* Arabesque corners */}
        <ArabesqueCorner className="absolute top-0 left-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50" />
        <ArabesqueCorner className="absolute top-0 right-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50 -scale-x-100" />

        {/* Hanging lantern */}
        <div
          className="absolute top-0 right-[12%] w-3 h-6 sm:w-4 sm:h-8 opacity-30 hidden sm:block"
          style={{ animation: 'lantern-sway 4.5s ease-in-out infinite' }}
        >
          <HangingLantern className="w-full h-full" />
        </div>

        {/* Crescent moon */}
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

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-yellow-400 border border-white/10">
            <StarIcon />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {t('fasting.whiteDays.title')}
          </h3>
        </div>
      </div>

      <div className="gold-border-strip" />

      {/* ═══ CONTENT ═══ */}
      <CardContent className="px-2 sm:px-3 pt-0 pb-2 sm:pb-3">
        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground/70 px-3 sm:px-4 pt-2.5 pb-1 sm:pt-3 sm:pb-2 leading-relaxed">
          {t('fasting.whiteDays.description')}
          {isTodayWhiteDay && (
            <span className="ms-1 text-yellow-600 dark:text-yellow-400 font-semibold">{t('fasting.whiteDays.todayIsWhiteDay')}</span>
          )}
        </p>

        {/* White days list */}
        <div className="py-1 sm:py-1.5">
          {whiteDays.map((day, index) => {
            const isToday = format(day.gregorianDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div key={index}>
                {index > 0 && <MiniStarDivider />}
                <div
                  className={`flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 mx-1 rounded-lg transition-colors ${
                    isToday
                      ? 'bg-yellow-500/12 dark:bg-yellow-500/10'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isToday
                        ? 'bg-yellow-500 text-white shadow-sm'
                        : 'bg-yellow-500/12 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      <CalendarDayIcon isToday={isToday} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-base leading-tight">
                        {t('fasting.whiteDays.dayOfMonth', { day: day.hijriDate.day, month: day.hijriDate.monthName.en })}
                        {isToday && <span className="ms-1.5 text-yellow-600 dark:text-yellow-400 text-xs font-semibold">{t('fasting.whiteDays.todayLabel')}</span>}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground/60 arabic-text leading-tight mt-0.5">
                        {day.hijriDate.formattedArabic}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 shrink-0 ml-2">
                    {format(day.gregorianDate, 'EEE, MMM d')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hadith footer with arabesque divider */}
        <div className="flex items-center gap-2 mt-2 sm:mt-3 mb-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(40,70%,50%,0.25)]" />
          <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 text-[hsl(40,85%,52%)] opacity-25">
            <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(40,70%,50%,0.25)]" />
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground/50 text-center px-2 sm:px-4 italic leading-relaxed">
          {t('fasting.whiteDays.hadith')}
        </p>
      </CardContent>
    </Card>
  );
};
