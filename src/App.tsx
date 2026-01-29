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
import { useStore } from './store/useStore';
import { useTheme } from './hooks/useTheme';

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

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useStore((state) => state.location);
  useTheme();

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

            {/* Main Content Tabs */}
            <Tabs defaultValue="prayer" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-card/80 backdrop-blur-sm islamic-border">
                <TabsTrigger
                  value="prayer"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient data-[state=active]:text-white rounded-lg transition-all"
                >
                  <PrayerIcon />
                  <span className="hidden sm:inline">Prayer</span>
                </TabsTrigger>
                <TabsTrigger
                  value="fasting"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient-gold data-[state=active]:text-white rounded-lg transition-all"
                >
                  <FastingIcon />
                  <span className="hidden sm:inline">Fasting</span>
                </TabsTrigger>
                <TabsTrigger
                  value="qibla"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient data-[state=active]:text-white rounded-lg transition-all"
                >
                  <QiblaIcon />
                  <span className="hidden sm:inline">Qibla</span>
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="flex items-center gap-2 data-[state=active]:islamic-gradient data-[state=active]:text-white rounded-lg transition-all"
                >
                  <CalendarIcon />
                  <span className="hidden sm:inline">Schedule</span>
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
