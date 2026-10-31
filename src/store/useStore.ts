/**
 * Application State Store
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalculationMethodId, MadhabId } from '../services/prayerService';
import type { Language } from '../i18n/types';

export interface Location {
  lat: number;
  lon: number;
  name: string;
}

export interface AppSettings {
  // Location
  location: Location | null;

  // Calculation settings
  calculationMethod: CalculationMethodId;
  madhab: MadhabId;

  // Display settings
  theme: 'light' | 'dark' | 'system';
  use24HourFormat: boolean;
  showSeconds: boolean;

  // Notifications & Adhan
  notificationsEnabled: boolean;
  selectedAdhan: string;     // regular prayers adhan
  selectedFajrAdhan: string; // fajr-specific adhan

  // Language
  language: Language;

  // Hijri date adjustment (-2 to +2 days)
  hijriAdjustment: number;

  // Per-prayer alerts (on top of the global notifications switch)
  prayerAlerts: Record<PrayerAlertKey, boolean>;

  // Desktop page background (web only)
  backdrop: Backdrop;
}

export type BackdropStyle = 'none' | 'girih' | 'dawn' | 'desert' | 'girihDawn';
export interface Backdrop {
  style: BackdropStyle;
  strength: 'soft' | 'medium' | 'strong';
  tint: 'auto' | 'emerald' | 'gold';
  sidebar: boolean;
}

export type PrayerAlertKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

interface AppState extends AppSettings {
  // Actions
  setLocation: (location: Location | null) => void;
  setCalculationMethod: (method: CalculationMethodId) => void;
  setMadhab: (madhab: MadhabId) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setUse24HourFormat: (use24Hour: boolean) => void;
  setShowSeconds: (show: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSelectedAdhan: (adhan: string) => void;
  setSelectedFajrAdhan: (adhan: string) => void;
  setLanguage: (language: Language) => void;
  setHijriAdjustment: (adjustment: number) => void;
  setPrayerAlert: (key: PrayerAlertKey, on: boolean) => void;
  setBackdrop: (patch: Partial<Backdrop>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  location: null,
  calculationMethod: 'MuslimWorldLeague',
  madhab: 'Shafi',
  theme: 'system',
  use24HourFormat: false,
  showSeconds: true,
  notificationsEnabled: false,
  selectedAdhan: 'alafasy',
  selectedFajrAdhan: 'alafasy-fajr',
  language: 'en' as Language,
  hijriAdjustment: 0,
  prayerAlerts: { fajr: true, sunrise: false, dhuhr: true, asr: true, maghrib: true, isha: true },
  backdrop: { style: 'girihDawn', strength: 'medium', tint: 'auto', sidebar: true },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setLocation: (location) => set({ location }),

      setCalculationMethod: (calculationMethod) => set({ calculationMethod }),

      setMadhab: (madhab) => set({ madhab }),

      setTheme: (theme) => set({ theme }),

      setUse24HourFormat: (use24HourFormat) => set({ use24HourFormat }),

      setShowSeconds: (showSeconds) => set({ showSeconds }),

      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

      setSelectedAdhan: (selectedAdhan) => set({ selectedAdhan }),

      setSelectedFajrAdhan: (selectedFajrAdhan) => set({ selectedFajrAdhan }),

      setLanguage: (language) => set({ language }),

      setHijriAdjustment: (hijriAdjustment) => set({ hijriAdjustment }),

      setPrayerAlert: (key, on) => set((s) => ({ prayerAlerts: { ...defaultSettings.prayerAlerts, ...s.prayerAlerts, [key]: on } })),

      setBackdrop: (patch) => set((s) => ({ backdrop: { ...defaultSettings.backdrop, ...s.backdrop, ...patch } })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'islamic-prayer-app-settings',
    }
  )
);

// Selector hooks for convenience
export const useLocation = () => useStore((state) => state.location);
export const useCalculationMethod = () => useStore((state) => state.calculationMethod);
export const useMadhab = () => useStore((state) => state.madhab);
export const useTheme = () => useStore((state) => state.theme);
export const useUse24HourFormat = () => useStore((state) => state.use24HourFormat);
