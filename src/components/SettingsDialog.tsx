import { MapPin, RefreshCw, Info, Bell } from 'lucide-react';
import { isNativePlatform } from '../services/platformService';
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
import { ADHAN_SOUNDS } from '../services/notificationService';

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
  const notificationsEnabled = useStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useStore((state) => state.setNotificationsEnabled);
  const selectedAdhan = useStore((state) => state.selectedAdhan);
  const setSelectedAdhan = useStore((state) => state.setSelectedAdhan);
  const resetSettings = useStore((state) => state.resetSettings);

  const { name: locationName, hasLocation, loading, requestLocation, clearLocation } = useLocation();

  const isNative = isNativePlatform();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>
            Customize prayer time calculations and app preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Location */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Location</label>
            {hasLocation ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{locationName}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={requestLocation}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearLocation}>
                    Clear
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
                <MapPin className="mr-2 h-4 w-4" />
                {loading ? 'Getting location...' : 'Set Location'}
              </Button>
            )}
          </div>

          {/* Calculation Method */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Calculation Method</label>
            <Select
              value={calculationMethod}
              onValueChange={(value) => setCalculationMethod(value as typeof calculationMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
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
              Different organizations use different angles for Fajr and Isha calculations.
            </p>
          </div>

          {/* Juristic School (Madhab) */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Juristic School (Asr)</label>
            <Select
              value={madhab}
              onValueChange={(value) => setMadhab(value as typeof madhab)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select school" />
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
              Affects the calculation of Asr prayer time.
            </p>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Theme</label>
            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as typeof theme)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">24-Hour Format</label>
              <p className="text-xs text-muted-foreground">Use 24-hour time format</p>
            </div>
            <Switch
              checked={use24HourFormat}
              onCheckedChange={setUse24HourFormat}
            />
          </div>

          {/* Show Seconds */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Show Seconds</label>
              <p className="text-xs text-muted-foreground">Display seconds in countdown</p>
            </div>
            <Switch
              checked={showSeconds}
              onCheckedChange={setShowSeconds}
            />
          </div>

          {/* Notifications - only visible on native platform */}
          {isNative && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium">Notifications</label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Prayer Notifications</label>
                  <p className="text-xs text-muted-foreground">Get notified at each prayer time</p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              {notificationsEnabled && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Adhan Sound</label>
                  <Select
                    value={selectedAdhan}
                    onValueChange={(value) => setSelectedAdhan(value as typeof selectedAdhan)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select adhan" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADHAN_SOUNDS.map((adhan) => (
                        <SelectItem key={adhan.id} value={adhan.id}>
                          {adhan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose which adhan to play for prayer notifications.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reset */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={resetSettings}
            >
              Reset to Defaults
            </Button>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Settings are saved locally on your device. Prayer times are calculated
              locally using the <strong>Adhan</strong> library for accurate results.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
