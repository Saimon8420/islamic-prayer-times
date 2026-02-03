/**
 * Application State Store
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalculationMethodId, MadhabId } from '../services/prayerService';
import type { AdhanSoundId } from '../services/notificationService';

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

  // Notifications
  notificationsEnabled: boolean;
  selectedAdhan: AdhanSoundId;
}

interface AppState extends AppSettings {
  // Actions
  setLocation: (location: Location | null) => void;
  setCalculationMethod: (method: CalculationMethodId) => void;
  setMadhab: (madhab: MadhabId) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setUse24HourFormat: (use24Hour: boolean) => void;
  setShowSeconds: (show: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSelectedAdhan: (adhan: AdhanSoundId) => void;
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
  selectedAdhan: 'makkah',
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
