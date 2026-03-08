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
import { useTranslation } from '../../i18n/useTranslation';

// Bold Mosque Icon — detailed with dome, minarets, crescent & stars
const MosqueIcon = () => (
  <svg viewBox="0 0 64 64" fill="currentColor" className="w-7 h-7">
    {/* Left minaret */}
    <rect x="8" y="24" width="6" height="28" rx="1" opacity="0.85" />
    <rect x="7" y="30" width="8" height="2" rx="0.5" opacity="0.5" />
    <rect x="7" y="36" width="8" height="2" rx="0.5" opacity="0.5" />
    <polygon points="11,14 14,24 8,24" opacity="0.9" />
    <circle cx="11" cy="13" r="1.2" opacity="0.7" />
    <rect x="6" y="24" width="10" height="2.5" rx="1" opacity="0.6" />
    {/* Right minaret */}
    <rect x="50" y="24" width="6" height="28" rx="1" opacity="0.85" />
    <rect x="49" y="30" width="8" height="2" rx="0.5" opacity="0.5" />
    <rect x="49" y="36" width="8" height="2" rx="0.5" opacity="0.5" />
    <polygon points="53,14 56,24 50,24" opacity="0.9" />
    <circle cx="53" cy="13" r="1.2" opacity="0.7" />
    <rect x="48" y="24" width="10" height="2.5" rx="1" opacity="0.6" />
    {/* Central dome */}
    <ellipse cx="32" cy="28" rx="16" ry="14" opacity="0.9" />
    <ellipse cx="30" cy="26" rx="10" ry="9" opacity="0.15" fill="white" />
    {/* Dome tip finial */}
    <rect x="31" y="12" width="2" height="6" rx="1" />
    {/* Crescent moon above dome */}
    <path d="M32 3a6 6 0 0 0 5.5 5.5A6 6 0 0 1 32 14a6 6 0 0 1 0-11z" opacity="0.95" />
    {/* Accent stars */}
    <circle cx="41" cy="5" r="1" opacity="0.7" />
    <circle cx="44" cy="9" r="0.7" opacity="0.5" />
    <circle cx="23" cy="7" r="0.6" opacity="0.4" />
    {/* Building body */}
    <rect x="16" y="32" width="32" height="20" rx="1" opacity="0.85" />
    {/* Arched doorway */}
    <path d="M27 52V40a5 5 0 0 1 10 0v12z" fill="currentColor" opacity="0.3" />
    <path d="M27 52V40a5 5 0 0 1 10 0v12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    {/* Side arched windows */}
    <ellipse cx="21" cy="40" rx="2.5" ry="3.5" opacity="0.3" />
    <ellipse cx="43" cy="40" rx="2.5" ry="3.5" opacity="0.3" />
    {/* Base platform */}
    <rect x="4" y="52" width="56" height="3" rx="1.5" opacity="0.7" />
  </svg>
);

// Crescent Star Icon
const CrescentStarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 3a9 9 0 0 0 9 9 9 9 0 0 1-9 9 9 9 0 0 1 0-18z" />
    <path d="M16 8l.5 1.5L18 10l-1.5.5L16 12l-.5-1.5L14 10l1.5-.5L16 8z" fill="currentColor" opacity="0.8" />
  </svg>
);

// Hanging Lantern SVG
const HangingLantern = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 30 60" fill="none" className={className}>
    {/* Chain */}
    <line x1="15" y1="0" x2="15" y2="12" stroke="rgba(200,168,78,0.4)" strokeWidth="1" />
    {/* Top cap */}
    <path d="M10 12h10l-1 3H11z" fill="rgba(200,168,78,0.5)" />
    {/* Body */}
    <path d="M9 15Q9 10 15 10Q21 10 21 15v18Q21 40 15 44Q9 40 9 33z" fill="rgba(200,168,78,0.15)" stroke="rgba(200,168,78,0.35)" strokeWidth="1" />
    {/* Inner glow */}
    <ellipse cx="15" cy="25" rx="4" ry="8" fill="rgba(200,168,78,0.12)" />
    {/* Cross pattern */}
    <line x1="15" y1="15" x2="15" y2="33" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" />
    <line x1="9" y1="24" x2="21" y2="24" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" />
  </svg>
);

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  const { theme, setTheme, isDark } = useTheme();
  const { name: locationName, hasLocation, loading, requestLocation } = useLocation();
  const { t } = useTranslation();

  const ThemeIcon = isDark ? Moon : theme === 'system' ? Monitor : Sun;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main header with mosque skyline */}
      <div className="islamic-gradient-header mosque-skyline relative">
        {/* Hanging lantern decorations */}
        <div className="absolute top-0 left-[8%] w-5 h-10 opacity-40 hidden lg:block" style={{ animation: 'lantern-sway 5s ease-in-out infinite' }}>
          <HangingLantern className="w-full h-full" />
        </div>
        <div className="absolute top-0 right-[12%] w-4 h-8 opacity-30 hidden lg:block" style={{ animation: 'lantern-sway 4s ease-in-out infinite 0.5s' }}>
          <HangingLantern className="w-full h-full" />
        </div>

        <div className="container flex h-16 items-center justify-between px-4 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shadow-sm border border-white/10">
              <MosqueIcon />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                {t('common.appName')}
                <CrescentStarIcon />
              </h1>
              <p className="text-xs text-white/60 arabic-text">أوقات الصلاة</p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Location */}
            {hasLocation ? (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2 text-white hover:bg-white/15 hover:text-white border border-transparent hover:border-white/10"
                onClick={requestLocation}
              >
                <MapPin className="h-4 w-4" />
                <span className="max-w-[150px] truncate text-sm">{locationName}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-2 text-white hover:bg-white/15 hover:text-white border border-transparent hover:border-white/10"
                onClick={requestLocation}
                disabled={loading}
              >
                <MapPin className="h-4 w-4" />
                {loading ? t('settings.gettingLocation') : t('settings.setLocation')}
              </Button>
            )}

            {/* Theme Selector */}
            <Select
              value={theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}
            >
              <SelectTrigger className="w-[110px] hidden sm:flex bg-white/15 border-white/15 text-white hover:bg-white/25">
                <ThemeIcon className="h-4 w-4 me-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t('settings.themeLight')}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t('settings.themeDark')}
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t('settings.themeSystem')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-white hover:bg-white/15"
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
              className="sm:hidden text-white hover:bg-white/15"
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
              className="text-white hover:bg-white/15"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Ornamental gold border strip */}
      <div className="gold-border-strip" />
    </header>
  );
};
