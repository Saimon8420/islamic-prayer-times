import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { useStore } from '../../store/useStore';
import { calculatePrayerTimes } from '../../services/prayerService';
import { CITIES, type City } from '../../data/cities';
import { X, Plus, Search } from 'lucide-react';

// ── Types ──

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

interface CityPrayerData {
  city: City;
  time: Date;
  minuteOfDay: number;
}

// ── Default cities for comparison ──

const DEFAULT_CITY_NAMES = [
  'Makkah', 'Madinah', 'Dhaka', 'Istanbul', 'Cairo',
  'London', 'Stockholm', 'New York', 'Jakarta', 'Tokyo',
];

const PRAYER_KEYS: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Country flag emojis
const COUNTRY_FLAGS: Record<string, string> = {
  'Saudi Arabia': '🇸🇦', 'Bangladesh': '🇧🇩', 'Turkey': '🇹🇷', 'Egypt': '🇪🇬',
  'United Kingdom': '🇬🇧', 'Sweden': '🇸🇪', 'USA': '🇺🇸', 'Indonesia': '🇮🇩',
  'Japan': '🇯🇵', 'India': '🇮🇳', 'Pakistan': '🇵🇰', 'UAE': '🇦🇪',
  'Qatar': '🇶🇦', 'Kuwait': '🇰🇼', 'Bahrain': '🇧🇭', 'Oman': '🇴🇲',
  'Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Syria': '🇸🇾', 'Lebanon': '🇱🇧',
  'Jordan': '🇯🇴', 'Palestine': '🇵🇸', 'Sudan': '🇸🇩', 'Libya': '🇱🇾',
  'Tunisia': '🇹🇳', 'Algeria': '🇩🇿', 'Morocco': '🇲🇦', 'Nigeria': '🇳🇬',
  'Kenya': '🇰🇪', 'Somalia': '🇸🇴', 'Ethiopia': '🇪🇹', 'Senegal': '🇸🇳',
  'South Africa': '🇿🇦', 'Afghanistan': '🇦🇫', 'Sri Lanka': '🇱🇰', 'Nepal': '🇳🇵',
  'Malaysia': '🇲🇾', 'Singapore': '🇸🇬', 'Brunei': '🇧🇳', 'Philippines': '🇵🇭',
  'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Myanmar': '🇲🇲', 'Cambodia': '🇰🇭',
  'Maldives': '🇲🇻', 'China': '🇨🇳', 'Hong Kong': '🇭🇰', 'South Korea': '🇰🇷',
  'Uzbekistan': '🇺🇿', 'Kazakhstan': '🇰🇿', 'Kyrgyzstan': '🇰🇬', 'Tajikistan': '🇹🇯',
  'Turkmenistan': '🇹🇲', 'Azerbaijan': '🇦🇿', 'France': '🇫🇷', 'Germany': '🇩🇪',
  'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪',
  'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Russia': '🇷🇺',
  'Bosnia & Herzegovina': '🇧🇦', 'Greece': '🇬🇷', 'Austria': '🇦🇹',
  'Switzerland': '🇨🇭', 'Canada': '🇨🇦', 'Mexico': '🇲🇽', 'Australia': '🇦🇺',
  'New Zealand': '🇳🇿', 'Brazil': '🇧🇷', 'Argentina': '🇦🇷',
};

// ── Decorative ──

const ArabesqueCorner = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 0L20 10L10 20Z" fill="rgba(200,168,78,0.25)" />
    <path d="M0 0L40 5L35 15L15 35L5 40Z" fill="rgba(200,168,78,0.12)" />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
  </svg>
);

// ── Helper ──

function formatTime(date: Date, use24h: boolean): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  if (use24h) return `${h.toString().padStart(2, '0')}:${m}`;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${period}`;
}

// ── Main Component ──

export const PrayerComparison = () => {
  const { t } = useTranslation();
  const calculationMethod = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);
  const use24HourFormat = useStore((s) => s.use24HourFormat);

  const [selectedPrayer, setSelectedPrayer] = useState<PrayerKey>('fajr');
  const [selectedCities, setSelectedCities] = useState<City[]>(() =>
    DEFAULT_CITY_NAMES.map(name => CITIES.find(c => c.name === name)!).filter(Boolean)
  );
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const today = useMemo(() => new Date(), []);

  // Calculate prayer times for all selected cities
  const cityData = useMemo<CityPrayerData[]>(() => {
    return selectedCities
      .map(city => {
        const times = calculatePrayerTimes(city.lat, city.lon, today, calculationMethod, madhab);
        const time = times[selectedPrayer];
        const minuteOfDay = time.getHours() * 60 + time.getMinutes();
        return { city, time, minuteOfDay };
      })
      .sort((a, b) => a.minuteOfDay - b.minuteOfDay);
  }, [selectedCities, selectedPrayer, today, calculationMethod, madhab]);

  // Stats
  const stats = useMemo(() => {
    if (cityData.length < 2) return null;
    const earliest = cityData[0];
    const latest = cityData[cityData.length - 1];
    const spread = latest.minuteOfDay - earliest.minuteOfDay;
    const spreadH = Math.floor(spread / 60);
    const spreadM = spread % 60;
    return { earliest, latest, spreadH, spreadM };
  }, [cityData]);

  // Timeline range — pad 30 min
  const timelineRange = useMemo(() => {
    if (cityData.length === 0) return { min: 0, max: 1440 };
    const min = Math.max(0, cityData[0].minuteOfDay - 30);
    const max = Math.min(1440, cityData[cityData.length - 1].minuteOfDay + 30);
    return { min, max };
  }, [cityData]);

  const availableCities = useMemo(() => {
    const selectedNames = new Set(selectedCities.map(c => c.name));
    const search = citySearch.toLowerCase();
    return CITIES.filter(c =>
      !selectedNames.has(c.name) &&
      (c.name.toLowerCase().includes(search) || c.country.toLowerCase().includes(search))
    );
  }, [selectedCities, citySearch]);

  const addCity = useCallback((city: City) => {
    if (selectedCities.length >= 15) return;
    setSelectedCities(prev => [...prev, city]);
    setCitySearch('');
    setShowCityPicker(false);
  }, [selectedCities.length]);

  const removeCity = useCallback((cityName: string) => {
    setSelectedCities(prev => prev.filter(c => c.name !== cityName));
  }, []);

  const prayerLabel = (key: PrayerKey) => {
    const nameMap: Record<PrayerKey, string> = {
      fajr: t('prayer.names.Fajr'),
      sunrise: t('prayer.names.Sunrise'),
      dhuhr: t('prayer.names.Dhuhr'),
      asr: t('prayer.names.Asr'),
      maghrib: t('prayer.names.Maghrib'),
      isha: t('prayer.names.Isha'),
    };
    return nameMap[key];
  };

  // Format timeline label
  const timeLabel = (minute: number) => {
    const h = Math.floor(minute / 60);
    const m = minute % 60;
    if (use24HourFormat) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="islamic-border overflow-hidden fade-in">
      {/* ═══ HEADER ═══ */}
      <div className="islamic-gradient-header relative overflow-hidden px-3 sm:px-4 py-2.5 sm:py-3">
        <ArabesqueCorner className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 opacity-50" />
        <ArabesqueCorner className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 opacity-50 -scale-x-100" />

        <h3 className="relative z-10 text-sm sm:text-base font-bold text-white text-center sm:text-left">
          {t('explore.comparison.title')}
        </h3>
      </div>

      {/* ═══ PRAYER SELECTOR — horizontal scrollable pills ═══ */}
      <div className="px-3 sm:px-4 pt-3 pb-1">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {PRAYER_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setSelectedPrayer(key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                key === selectedPrayer
                  ? 'bg-[hsl(158,64%,28%)] text-white shadow-md'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              {prayerLabel(key)}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CITY LIST WITH INLINE TIMES ═══ */}
      <div className="px-3 sm:px-4 py-2 space-y-0.5">
        {/* Time axis — only on sm+ */}
        <div className="hidden sm:flex justify-between text-[9px] text-muted-foreground pl-[140px] mb-1">
          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <span key={frac}>
              {timeLabel(Math.round(timelineRange.min + frac * (timelineRange.max - timelineRange.min)))}
            </span>
          ))}
        </div>

        {cityData.map(({ city, time, minuteOfDay }, index) => {
          const range = timelineRange.max - timelineRange.min;
          const position = range > 0 ? ((minuteOfDay - timelineRange.min) / range) * 100 : 50;
          const flag = COUNTRY_FLAGS[city.country] || '';

          return (
            <div key={city.name} className="group">
              {/* ── Mobile layout: stacked city name + bar ── */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      onClick={() => removeCity(city.name)}
                      className="shrink-0 opacity-60 active:opacity-100"
                      title={t('explore.comparison.removeCity')}
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <span className="text-[11px] font-medium text-foreground truncate">
                      {flag} {city.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-[hsl(40,85%,38%)] dark:text-[hsl(40,80%,60%)] shrink-0">
                    {formatTime(time, use24HourFormat)}
                  </span>
                </div>
                {/* Progress bar showing relative position */}
                <div className="relative h-2 rounded-full bg-muted/50 mb-1.5">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[hsl(158,64%,28%)] to-[hsl(40,85%,52%)]"
                    style={{ width: `${Math.max(3, Math.min(100, position))}%` }}
                  />
                  {/* Rank number */}
                  <span className="absolute -top-0.5 text-[8px] font-bold text-[hsl(40,85%,42%)] dark:text-[hsl(40,80%,60%)]"
                    style={{ left: `${Math.max(3, Math.min(95, position))}%`, transform: 'translateX(-50%)' }}
                  >
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* ── Desktop layout: side-by-side city name + timeline bar ── */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-[135px] shrink-0 flex items-center gap-1.5 min-w-0">
                  <button
                    onClick={() => removeCity(city.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title={t('explore.comparison.removeCity')}
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                  <span className="text-xs truncate text-foreground font-medium">
                    {flag} {city.name}
                  </span>
                </div>
                <div className="flex-1 relative h-7 rounded bg-muted/40">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${Math.max(3, Math.min(97, position))}%` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(40,85%,52%)] shadow-[0_0_6px_hsl(40,85%,52%/0.5)] border border-[hsl(40,85%,62%)]" />
                    <span className="absolute -bottom-3 text-[9px] font-mono text-muted-foreground whitespace-nowrap">
                      {formatTime(time, use24HourFormat)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add city */}
        {selectedCities.length < 15 && (
          <div className="pt-2">
            {!showCityPicker ? (
              <button
                onClick={() => setShowCityPicker(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('explore.comparison.addCity')}
              </button>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    placeholder={t('settings.searchCity')}
                    className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <button onClick={() => { setShowCityPicker(false); setCitySearch(''); }}>
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {availableCities.slice(0, 30).map(city => (
                    <button
                      key={`${city.name}-${city.country}`}
                      onClick={() => addCity(city)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <span>{COUNTRY_FLAGS[city.country] || ''}</span>
                      <span className="text-foreground">{city.name}</span>
                      <span className="text-muted-foreground">{city.country}</span>
                    </button>
                  ))}
                  {availableCities.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">{t('settings.noCityFound')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ STATS BAR ═══ */}
      {stats && (
        <div className="px-3 sm:px-4 py-2 border-t border-border/50 bg-muted/30">
          {/* Mobile: stacked stats */}
          <div className="sm:hidden space-y-0.5 text-[10px] text-muted-foreground">
            <div className="flex justify-between">
              <span><span className="font-semibold text-foreground">{t('explore.comparison.earliest')}:</span> {stats.earliest.city.name}</span>
              <span className="font-mono">{formatTime(stats.earliest.time, use24HourFormat)}</span>
            </div>
            <div className="flex justify-between">
              <span><span className="font-semibold text-foreground">{t('explore.comparison.latest')}:</span> {stats.latest.city.name}</span>
              <span className="font-mono">{formatTime(stats.latest.time, use24HourFormat)}</span>
            </div>
            <div className="text-center pt-0.5">
              <span className="font-semibold text-foreground">{t('explore.comparison.spread')}:</span>{' '}
              <span className="font-mono font-semibold text-[hsl(40,85%,38%)] dark:text-[hsl(40,80%,60%)]">
                {stats.spreadH > 0 ? `${stats.spreadH}h ` : ''}{stats.spreadM}m
              </span>
            </div>
          </div>
          {/* Desktop: inline stats */}
          <div className="hidden sm:flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{t('explore.comparison.earliest')}:</span>{' '}
              {stats.earliest.city.name} — {formatTime(stats.earliest.time, use24HourFormat)}
            </span>
            <span>
              <span className="font-semibold text-foreground">{t('explore.comparison.latest')}:</span>{' '}
              {stats.latest.city.name} — {formatTime(stats.latest.time, use24HourFormat)}
            </span>
            <span>
              <span className="font-semibold text-foreground">{t('explore.comparison.spread')}:</span>{' '}
              {stats.spreadH > 0 ? `${stats.spreadH}h ` : ''}{stats.spreadM}m
            </span>
          </div>
        </div>
      )}

      <div className="gold-border-strip" />
    </div>
  );
};
