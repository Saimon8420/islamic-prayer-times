import { useState, useRef, useEffect } from 'react';
import { MapPin, RefreshCw, Info, Bell, Minus, Plus, Play, Square } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { useStore } from '../store/useStore';
import { useLocation } from '../hooks/useLocation';
import { CALCULATION_METHODS, MADHAB_OPTIONS } from '../services/prayerService';
import { CITIES, type City } from '../data/cities';
import { REGULAR_ADHAN_SOUNDS, FAJR_ADHAN_SOUNDS } from '../services/notificationService';
import { useTranslation } from '../i18n/useTranslation';
import { LANGUAGE_OPTIONS } from '../i18n';
import type { Language } from '../i18n/types';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const calculationMethod = useStore((state) => state.calculationMethod);
  const setCalculationMethod = useStore((state) => state.setCalculationMethod);
  const madhab = useStore((state) => state.madhab);
  const setMadhab = useStore((state) => state.setMadhab);
  const use24HourFormat = useStore((state) => state.use24HourFormat);
  const setUse24HourFormat = useStore((state) => state.setUse24HourFormat);
  const showSeconds = useStore((state) => state.showSeconds);
  const setShowSeconds = useStore((state) => state.setShowSeconds);
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const hijriAdjustment = useStore((state) => state.hijriAdjustment);
  const setHijriAdjustment = useStore((state) => state.setHijriAdjustment);
  const notificationsEnabled = useStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useStore((state) => state.setNotificationsEnabled);
  const selectedAdhan = useStore((state) => state.selectedAdhan);
  const setSelectedAdhan = useStore((state) => state.setSelectedAdhan);
  const selectedFajrAdhan = useStore((state) => state.selectedFajrAdhan);
  const setSelectedFajrAdhan = useStore((state) => state.setSelectedFajrAdhan);
  const resetSettings = useStore((state) => state.resetSettings);
  const { t } = useTranslation();

  const { name: locationName, hasLocation, loading, requestLocation, setCityLocation, clearLocation } = useLocation();

  // Offline city picker
  const [cityQuery, setCityQuery] = useState('');
  const filteredCities = (() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return CITIES.slice(0, 50);
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    ).slice(0, 50);
  })();

  const handlePickCity = (city: City) => {
    setCityLocation(city.lat, city.lon, `${city.name}, ${city.country}`);
    setCityQuery('');
  };

  // Adhan preview player
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingId(null);
  };

  const togglePreview = (id: string, file: string) => {
    if (playingId === id) {
      stopPreview();
      return;
    }
    stopPreview();
    if (!file) return;
    const audio = new Audio(file);
    audio.addEventListener('ended', () => setPlayingId(null));
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlayingId(id);
  };

  // Stop preview when dialog closes
  useEffect(() => {
    if (!open) stopPreview();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('settings.title')}</DialogTitle>
          <DialogDescription>
            {t('settings.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Location */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('settings.location')}</label>
            {hasLocation ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm truncate">{locationName}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={requestLocation}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearLocation}>
                    {t('common.clear')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={requestLocation}
                disabled={loading}
              >
                <MapPin className="me-2 h-4 w-4" />
                {loading ? t('settings.gettingLocation') : t('settings.setLocation')}
              </Button>
            )}

            {/* Offline city picker */}
            <div className="space-y-2 rounded-lg border border-dashed p-3">
              <div>
                <p className="text-xs font-medium">{t('settings.chooseCity')}</p>
                <p className="text-[11px] text-muted-foreground">{t('settings.chooseCityDesc')}</p>
              </div>
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder={t('settings.searchCity')}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              {filteredCities.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">{t('settings.noCityFound')}</p>
              ) : (
                <ul className="max-h-44 overflow-y-auto rounded-md border bg-background/50">
                  {filteredCities.map((city) => (
                    <li key={`${city.name}-${city.country}-${city.lat}`}>
                      <button
                        type="button"
                        onClick={() => handlePickCity(city)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                      >
                        <span className="truncate">{city.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{city.country}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Calculation Method */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('settings.calculationMethod')}</label>
            <Select
              value={calculationMethod}
              onValueChange={(value) => setCalculationMethod(value as typeof calculationMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.selectMethod')} />
              </SelectTrigger>
              <SelectContent>
                {CALCULATION_METHODS.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('settings.calculationMethodDesc')}
            </p>
          </div>

          {/* Juristic School (Madhab) */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('settings.juristicSchool')}</label>
            <Select
              value={madhab}
              onValueChange={(value) => setMadhab(value as typeof madhab)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.selectSchool')} />
              </SelectTrigger>
              <SelectContent>
                {MADHAB_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('settings.juristicSchoolDesc')}
            </p>
          </div>

          {/* Language */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('settings.language')}</label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.nativeLabel} ({lang.label})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hijri Date Adjustment */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('settings.hijriAdjustment')}</label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHijriAdjustment(Math.max(-2, hijriAdjustment - 1))}
                disabled={hijriAdjustment <= -2}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[3rem] text-center">
                {hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHijriAdjustment(Math.min(2, hijriAdjustment + 1))}
                disabled={hijriAdjustment >= 2}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.hijriAdjustmentDesc')}
            </p>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('settings.theme')}</label>
            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as typeof theme)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">{t('settings.timeFormat24')}</label>
              <p className="text-xs text-muted-foreground">{t('settings.timeFormat24Desc')}</p>
            </div>
            <Switch
              checked={use24HourFormat}
              onCheckedChange={setUse24HourFormat}
            />
          </div>

          {/* Show Seconds */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">{t('settings.showSeconds')}</label>
              <p className="text-xs text-muted-foreground">{t('settings.showSecondsDesc')}</p>
            </div>
            <Switch
              checked={showSeconds}
              onCheckedChange={setShowSeconds}
            />
          </div>

          {/* Notifications & Adhan — visible on ALL platforms */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium">{t('settings.notifications')}</label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">{t('settings.prayerNotifications')}</label>
                <p className="text-xs text-muted-foreground">{t('settings.prayerNotificationsDesc')}</p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {notificationsEnabled && (
              <div className="space-y-4">
                {/* Regular Adhan (Dhuhr, Asr, Maghrib, Isha) */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">{t('settings.adhanSound')}</label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedAdhan}
                      onValueChange={(value) => { stopPreview(); setSelectedAdhan(value); }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t('settings.selectAdhan')} />
                      </SelectTrigger>
                      <SelectContent>
                        {REGULAR_ADHAN_SOUNDS.map((adhan) => (
                          <SelectItem key={adhan.id} value={adhan.id}>
                            {adhan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {(() => {
                      const selected = REGULAR_ADHAN_SOUNDS.find((a) => a.id === selectedAdhan);
                      return selected?.file ? (
                        <Button
                          variant={playingId === selectedAdhan ? 'default' : 'outline'}
                          size="icon"
                          className="shrink-0"
                          onClick={() => togglePreview(selectedAdhan, selected.file)}
                        >
                          {playingId === selectedAdhan ? (
                            <Square className="h-4 w-4 fill-current" />
                          ) : (
                            <Play className="h-4 w-4 fill-current" />
                          )}
                        </Button>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.adhanSoundDesc')}
                  </p>
                </div>

                {/* Fajr Adhan */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">{t('settings.fajrAdhanSound')}</label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedFajrAdhan}
                      onValueChange={(value) => { stopPreview(); setSelectedFajrAdhan(value); }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t('settings.selectAdhan')} />
                      </SelectTrigger>
                      <SelectContent>
                        {FAJR_ADHAN_SOUNDS.map((adhan) => (
                          <SelectItem key={adhan.id} value={adhan.id}>
                            {adhan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {(() => {
                      const selected = FAJR_ADHAN_SOUNDS.find((a) => a.id === selectedFajrAdhan);
                      return selected?.file ? (
                        <Button
                          variant={playingId === selectedFajrAdhan ? 'default' : 'outline'}
                          size="icon"
                          className="shrink-0"
                          onClick={() => togglePreview(selectedFajrAdhan, selected.file)}
                        >
                          {playingId === selectedFajrAdhan ? (
                            <Square className="h-4 w-4 fill-current" />
                          ) : (
                            <Play className="h-4 w-4 fill-current" />
                          )}
                        </Button>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.fajrAdhanSoundDesc')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={resetSettings}
            >
              {t('settings.resetDefaults')}
            </Button>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              {t('settings.infoText')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
