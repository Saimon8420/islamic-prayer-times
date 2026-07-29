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

// Refined crescent + star — the brand mark.
const CrescentMark = () => (
  <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6">
    <path d="M22 6a11 11 0 1 0 4 12A9 9 0 1 1 22 6z" fill="currentColor" />
    <path
      d="M25 7.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"
      fill="currentColor"
      opacity="0.85"
    />
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
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/70 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <CrescentMark />
          </span>
          <div className="leading-none">
            <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {t('common.appName')}
            </h1>
            <p className="arabic-text mt-0.5 text-[11px] text-muted-foreground">
              أوقات الصلاة
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {/* Location */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-2 text-muted-foreground hover:text-foreground sm:flex"
            onClick={requestLocation}
            disabled={loading && !hasLocation}
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span className="label-mono max-w-[150px] truncate normal-case !text-foreground">
              {hasLocation
                ? locationName
                : loading
                  ? t('settings.gettingLocation')
                  : t('settings.setLocation')}
            </span>
          </Button>

          {/* Theme selector (desktop) */}
          <Select
            value={theme}
            onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}
          >
            <SelectTrigger className="hidden h-9 w-[130px] border-border/70 bg-transparent sm:flex">
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

          {/* Mobile theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground sm:hidden"
            onClick={() =>
              setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
            }
          >
            <ThemeIcon className="h-5 w-5" />
          </Button>

          {/* Mobile location */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground sm:hidden"
            onClick={requestLocation}
            disabled={loading}
          >
            <MapPin className="h-5 w-5 text-primary" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
