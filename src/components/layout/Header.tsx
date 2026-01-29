import { Moon, Sun, Monitor, MapPin, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useTheme } from '../../hooks/useTheme';
import { useLocation } from '../../hooks/useLocation';

// Custom Mosque Icon
const MosqueIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2C11 2 10 2.5 10 3.5V4C8.5 4 7 5.5 7 7V8H5V7C5 5 6 4 7 3.5V3C7 2 8 1 9 1H15C16 1 17 2 17 3V3.5C18 4 19 5 19 7V8H17V7C17 5.5 15.5 4 14 4V3.5C14 2.5 13 2 12 2Z" />
    <path d="M3 10H21V22H19V14H17V22H15V14H13V22H11V14H9V22H7V14H5V22H3V10Z" />
    <path d="M12 6C11.4 6 11 6.4 11 7V8H13V7C13 6.4 12.6 6 12 6Z" />
    <circle cx="6" cy="6" r="1" />
    <circle cx="18" cy="6" r="1" />
  </svg>
);

// Crescent Star Icon
const CrescentStarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 3a9 9 0 0 0 9 9 9 9 0 0 1-9 9 9 9 0 0 1 0-18z" />
    <path d="M16 8l.5 1.5L18 10l-1.5.5L16 12l-.5-1.5L14 10l1.5-.5L16 8z" fill="currentColor" opacity="0.8" />
  </svg>
);

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  const { theme, setTheme, isDark } = useTheme();
  const { name: locationName, hasLocation, loading, requestLocation } = useLocation();

  const ThemeIcon = isDark ? Moon : theme === 'system' ? Monitor : Sun;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main header */}
      <div className="islamic-gradient">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <MosqueIcon />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Prayer Times
                <CrescentStarIcon />
              </h1>
              <p className="text-xs text-white/70 arabic-text">أوقات الصلاة</p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Location */}
            {hasLocation ? (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2 text-white hover:bg-white/20 hover:text-white"
                onClick={requestLocation}
              >
                <MapPin className="h-4 w-4" />
                <span className="max-w-[150px] truncate text-sm">{locationName}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2 text-white hover:bg-white/20 hover:text-white"
                onClick={requestLocation}
                disabled={loading}
              >
                <MapPin className="h-4 w-4" />
                {loading ? 'Getting...' : 'Set Location'}
              </Button>
            )}

            {/* Theme Selector */}
            <Select
              value={theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}
            >
              <SelectTrigger className="w-[110px] hidden sm:flex bg-white/20 border-white/30 text-white hover:bg-white/30">
                <ThemeIcon className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-white hover:bg-white/20"
              onClick={() =>
                setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
              }
            >
              <ThemeIcon className="h-5 w-5" />
            </Button>

            {/* Mobile Location */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-white hover:bg-white/20"
              onClick={requestLocation}
              disabled={loading}
            >
              <MapPin className="h-5 w-5" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 islamic-gradient-gold" />
    </header>
  );
};
