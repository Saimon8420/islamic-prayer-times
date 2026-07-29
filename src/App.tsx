import { useState, useEffect, useRef } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { isNativePlatform } from "./services/platformService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { SettingsDialog } from "./components/SettingsDialog";
import { LocationPrompt } from "./components/common/LocationPrompt";
import { PrayerTimesCard } from "./components/prayer/PrayerTimesCard";
import { FastingTimesCard } from "./components/fasting/FastingTimesCard";
import { WhiteDays } from "./components/fasting/WhiteDays";
import { QiblaCompass } from "./components/qibla/QiblaCompass";
import { QiblaMap } from "./components/qibla/QiblaMap";
import { MonthlySchedule } from "./components/MonthlySchedule";
import { DuaCollection } from "./components/dua/DuaCollection";
import { HijriCalendar } from "./components/calendar/HijriCalendar";
import { useStore } from "./store/useStore";
import { useTheme } from "./hooks/useTheme";
import { useNotifications } from "./hooks/useNotifications";
import { useLanguageEffect } from "./hooks/useLanguage";
import { IslamicOccasionBanner } from "./components/common/IslamicOccasionBanner";
import { DailyVerse } from "./components/common/DailyVerse";
import { PrayerComparison } from "./components/explore/PrayerComparison";
import { AthanGlobe } from "./components/explore/AthanGlobe";
import { WordOfTheDay } from "./components/dua/WordOfTheDay";
import { useTranslation } from "./i18n/useTranslation";

// Custom Icons
const PrayerIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
  </svg>
);

const FastingIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const QiblaIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
    <path d="M12 8v4l2 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
  </svg>
);

const DuaIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8M8 11h6" strokeLinecap="round" />
  </svg>
);

const HijriIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M8 2v4M16 2v4" strokeLinecap="round" />
    <path d="M16 14.4a4 4 0 1 1-3.2-3.9 3 3 0 0 0 3.2 3.9z" />
  </svg>
);

const ExploreIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const DEFAULT_TAB = "prayer";

// ── Explore tab sub-content with toggle ──
function ExploreContent() {
  const [view, setView] = useState<"comparison" | "globe">("comparison");
  const { t } = useTranslation();
  return (
    <>
      <div className="flex gap-1.5 parchment-card islamic-border p-1.5 w-fit mx-auto">
        <button
          onClick={() => setView("comparison")}
          className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${
            view === "comparison"
              ? "islamic-gradient-gold text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          {t("explore.tabComparison")}
        </button>
        <button
          onClick={() => setView("globe")}
          className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${
            view === "globe"
              ? "islamic-gradient-gold text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          {t("explore.tabGlobe")}
        </button>
      </div>
      {view === "comparison" ? <PrayerComparison /> : <AthanGlobe />}
    </>
  );
}

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TAB);
  const tabHistoryRef = useRef<string[]>([DEFAULT_TAB]);
  const location = useStore((state) => state.location);
  const { t } = useTranslation();
  useTheme();
  useNotifications();
  useLanguageEffect();

  const hasLocation = location !== null;

  // Track tab history for Android back-button navigation
  const handleTabChange = (next: string) => {
    setActiveTab(next);
    const history = tabHistoryRef.current;
    // Avoid duplicate consecutive entries
    if (history[history.length - 1] !== next) {
      history.push(next);
      // Cap history to avoid unbounded growth
      if (history.length > 20) history.shift();
    }
  };

  // Android hardware back button: close dialog → pop tab history → exit app
  useEffect(() => {
    if (!isNativePlatform()) return;
    let handle: { remove: () => void } | undefined;
    let cancelled = false;

    CapacitorApp.addListener("backButton", () => {
      // 1. If settings dialog is open, close it
      if (settingsOpen) {
        setSettingsOpen(false);
        return;
      }
      // 2. If we have previous tabs in history, pop and switch
      const history = tabHistoryRef.current;
      if (history.length > 1) {
        history.pop(); // remove current
        const prev = history[history.length - 1];
        setActiveTab(prev);
        return;
      }
      // 3. If on default tab with no history, exit the app
      if (activeTab !== DEFAULT_TAB) {
        tabHistoryRef.current = [DEFAULT_TAB];
        setActiveTab(DEFAULT_TAB);
        return;
      }
      CapacitorApp.exitApp();
    }).then((h) => {
      if (cancelled) h.remove();
      else handle = h;
    });

    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [settingsOpen, activeTab]);

  return (
    <div className="min-h-screen flex flex-col sky-bg relative">
      <div className="heritage-bg" aria-hidden="true" />
      <div className="sky-stars" aria-hidden="true" />
      <div className="minbar-decor is-left" aria-hidden="true" />
      <div className="minbar-decor is-right" aria-hidden="true" />
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="flex-1 container px-4 py-6 md:py-8 relative z-10">
        {!hasLocation ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LocationPrompt />
          </div>
        ) : (
          <div className="space-y-6 slide-up">
            {/* Date Display + Daily Ayah / Hadith (merged card) */}
            <DailyVerse />

            {/* Islamic Occasion Banner */}
            <IslamicOccasionBanner />

            {/* Main Content Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid h-auto w-full grid-cols-7 gap-1 rounded-xl border border-border bg-card/50 p-1.5 backdrop-blur-md">
                {(
                  [
                    { value: "prayer", Icon: PrayerIcon, label: "prayer" },
                    { value: "fasting", Icon: FastingIcon, label: "fasting" },
                    { value: "qibla", Icon: QiblaIcon, label: "qibla" },
                    { value: "schedule", Icon: CalendarIcon, label: "schedule" },
                    { value: "duas", Icon: DuaIcon, label: "duas" },
                    { value: "hijriCalendar", Icon: HijriIcon, label: "hijriCalendar" },
                    { value: "explore", Icon: ExploreIcon, label: "explore" },
                  ] as const
                ).map(({ value, Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="group flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-primary/[0.07] data-[state=active]:text-primary data-[state=active]:shadow-[inset_0_-2px_0_0_hsl(var(--primary))] sm:flex-row sm:gap-2"
                  >
                    <Icon />
                    <span className="hidden font-mono text-[10px] uppercase tracking-wider sm:inline">
                      {t(`common.tabs.${label}` as "common.tabs.prayer")}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Prayer Times Tab */}
              <TabsContent value="prayer" className="mt-6 fade-in">
                <div className="relative w-full">
                  <PrayerTimesCard />
                </div>
              </TabsContent>

              {/* Fasting Times Tab */}
              <TabsContent value="fasting" className="mt-6 space-y-6 fade-in">
                <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
                  <FastingTimesCard />
                  <WhiteDays />
                </div>
              </TabsContent>

              {/* Qibla Tab */}
              <TabsContent value="qibla" className="mt-6 space-y-6 fade-in">
                <QiblaCompass />
                <QiblaMap />
              </TabsContent>

              {/* Monthly Schedule Tab */}
              <TabsContent value="schedule" className="mt-6 fade-in">
                <MonthlySchedule />
              </TabsContent>

              {/* Duas Tab */}
              <TabsContent value="duas" className="mt-6 space-y-6 fade-in">
                <WordOfTheDay />
                <DuaCollection />
              </TabsContent>

              {/* Hijri Calendar Tab */}
              <TabsContent value="hijriCalendar" className="mt-6 fade-in">
                <HijriCalendar />
              </TabsContent>

              {/* Explore Tab */}
              <TabsContent value="explore" className="mt-6 space-y-4 fade-in">
                <ExploreContent />
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
