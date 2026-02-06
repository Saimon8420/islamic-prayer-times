import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SettingsDialog } from './components/SettingsDialog';
import { LocationPrompt } from './components/common/LocationPrompt';
import { PrayerTimesCard } from './components/prayer/PrayerTimesCard';
import { AdditionalTimings } from './components/prayer/AdditionalTimings';
import { DateDisplay } from './components/prayer/DateDisplay';
import { FastingTimesCard } from './components/fasting/FastingTimesCard';
import { WhiteDays } from './components/fasting/WhiteDays';
import { QiblaCompass } from './components/qibla/QiblaCompass';
import { MonthlySchedule } from './components/MonthlySchedule';
import { DuaCollection } from './components/dua/DuaCollection';
import { HijriCalendar } from './components/calendar/HijriCalendar';
import { useStore } from './store/useStore';
import { useTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';
import { useLanguageEffect } from './hooks/useLanguage';
import { IslamicOccasionBanner } from './components/common/IslamicOccasionBanner';
import { useTranslation } from './i18n/useTranslation';

// Custom Icons
const PrayerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
  </svg>
);

const FastingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const QiblaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
    <path d="M12 8v4l2 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
  </svg>
);

const DuaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8M8 11h6" strokeLinecap="round" />
  </svg>
);

const HijriIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M8 2v4M16 2v4" strokeLinecap="round" />
    <path d="M16 14.4a4 4 0 1 1-3.2-3.9 3 3 0 0 0 3.2 3.9z" />
  </svg>
);

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useStore((state) => state.location);
  const { t } = useTranslation();
  useTheme();
  useNotifications();
  useLanguageEffect();

  const hasLocation = location !== null;

  return (
    <div className="min-h-screen flex flex-col islamic-pattern-bg">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="flex-1 container px-4 py-6 md:py-8">
        {!hasLocation ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LocationPrompt />
          </div>
        ) : (
          <div className="space-y-6 slide-up">
            {/* Date Display */}
            <DateDisplay />

            {/* Islamic Occasion Banner */}
            <IslamicOccasionBanner />

            {/* Main Content Tabs */}
            <Tabs defaultValue="prayer" className="w-full">
              <TabsList className="grid w-full grid-cols-6 h-14 p-1 bg-card/80 backdrop-blur-sm islamic-border">
                <TabsTrigger
                  value="prayer"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient data-[state=active]:text-white rounded-lg transition-all"
                >
                  <PrayerIcon />
                  <span className="hidden sm:inline">{t('common.tabs.prayer')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="fasting"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient-gold data-[state=active]:text-white rounded-lg transition-all"
                >
                  <FastingIcon />
                  <span className="hidden sm:inline">{t('common.tabs.fasting')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="qibla"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient data-[state=active]:text-white rounded-lg transition-all"
                >
                  <QiblaIcon />
                  <span className="hidden sm:inline">{t('common.tabs.qibla')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient data-[state=active]:text-white rounded-lg transition-all"
                >
                  <CalendarIcon />
                  <span className="hidden sm:inline">{t('common.tabs.schedule')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="duas"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient-dark data-[state=active]:text-white rounded-lg transition-all"
                >
                  <DuaIcon />
                  <span className="hidden sm:inline">{t('common.tabs.duas')}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="hijriCalendar"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient data-[state=active]:text-white rounded-lg transition-all"
                >
                  <HijriIcon />
                  <span className="hidden sm:inline">{t('common.tabs.hijriCalendar')}</span>
                </TabsTrigger>
              </TabsList>

              {/* Prayer Times Tab */}
              <TabsContent value="prayer" className="mt-6 space-y-6 fade-in">
                <div className="grid gap-6 lg:grid-cols-2">
                  <PrayerTimesCard />
                  <div className="space-y-6">
                    <AdditionalTimings />
                  </div>
                </div>
              </TabsContent>

              {/* Fasting Times Tab */}
              <TabsContent value="fasting" className="mt-6 space-y-6 fade-in">
                <div className="grid gap-6 lg:grid-cols-2">
                  <FastingTimesCard />
                  <WhiteDays />
                </div>
              </TabsContent>

              {/* Qibla Tab */}
              <TabsContent value="qibla" className="mt-6 fade-in">
                <div className="max-w-md mx-auto">
                  <QiblaCompass />
                </div>
              </TabsContent>

              {/* Monthly Schedule Tab */}
              <TabsContent value="schedule" className="mt-6 fade-in">
                <MonthlySchedule />
              </TabsContent>

              {/* Duas Tab */}
              <TabsContent value="duas" className="mt-6 fade-in">
                <DuaCollection />
              </TabsContent>

              {/* Hijri Calendar Tab */}
              <TabsContent value="hijriCalendar" className="mt-6 fade-in">
                <HijriCalendar />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <Footer />

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export default App;
