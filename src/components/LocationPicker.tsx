import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BD_LOCATIONS, groupByDistrict, type BdLocation } from '../data/bdLocations';
import { CITIES, type City } from '../data/cities';
import { useTranslation } from '../i18n/useTranslation';
import { cn } from '../lib/utils';

interface LocationPickerProps {
  onPick: (lat: number, lon: number, label: string) => void;
}

type Tab = 'bd' | 'intl';

export const LocationPicker = ({ onPick }: LocationPickerProps) => {
  const { t, language } = useTranslation();
  const [tab, setTab] = useState<Tab>('bd');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const raw = query.trim();
  const q = raw.toLowerCase();

  const bdResults = useMemo(() => {
    if (!raw) return [];
    return BD_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nameBn.includes(raw) ||
        l.district.toLowerCase().includes(q) ||
        l.districtBn.includes(raw),
    ).slice(0, 80);
  }, [raw, q]);

  const bdGroups = useMemo(() => groupByDistrict(BD_LOCATIONS), []);

  const intlResults = useMemo(() => {
    const base = CITIES.filter((c) => c.country !== 'Bangladesh');
    if (!raw) return base.slice(0, 50);
    return base.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
    );
  }, [raw, q]);

  const pickBd = (l: BdLocation) => {
    const label = language === 'bn' ? `${l.nameBn}, ${l.districtBn}` : `${l.name}, ${l.district}`;
    onPick(l.lat, l.lon, label);
    setQuery('');
  };
  const pickIntl = (c: City) => {
    onPick(c.lat, c.lon, `${c.name}, ${c.country}`);
    setQuery('');
  };

  return (
    <div className="space-y-2 rounded-lg border border-dashed p-3">
      <div>
        <p className="text-xs font-medium">{t('settings.chooseCity')}</p>
        <p className="text-[11px] text-muted-foreground">{t('settings.chooseCityDesc')}</p>
      </div>

      {/* Bangladesh / International toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => { setTab('bd'); setQuery(''); }}
          className={cn(
            'rounded px-2 py-1 text-xs font-medium transition-colors',
            tab === 'bd' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
          )}
        >
          {t('settings.locationTabBd')}
        </button>
        <button
          type="button"
          onClick={() => { setTab('intl'); setQuery(''); }}
          className={cn(
            'rounded px-2 py-1 text-xs font-medium transition-colors',
            tab === 'intl' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
          )}
        >
          {t('settings.locationTabIntl')}
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={tab === 'bd' ? t('settings.searchUpazila') : t('settings.searchCity')}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />

      {tab === 'bd' ? (
        raw ? (
          bdResults.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted-foreground">{t('settings.noCityFound')}</p>
          ) : (
            <ul className="max-h-52 overflow-y-auto rounded-md border bg-background/50">
              {bdResults.map((l) => (
                <li key={`${l.name}-${l.district}`}>
                  <button
                    type="button"
                    onClick={() => pickBd(l)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <span>{language === 'bn' ? l.nameBn : l.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'bn' ? l.districtBn : l.district}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="max-h-52 overflow-y-auto rounded-md border bg-background/50">
            {bdGroups.map((g) => (
              <div key={g.district}>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === g.district ? null : g.district)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-muted focus:bg-muted focus:outline-none"
                >
                  <span>{language === 'bn' ? g.districtBn : g.district}</span>
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', expanded === g.district && 'rotate-180')}
                  />
                </button>
                {expanded === g.district && (
                  <ul className="bg-muted/30">
                    {g.upazilas.map((l) => (
                      <li key={`${l.name}-${l.district}`}>
                        <button
                          type="button"
                          onClick={() => pickBd(l)}
                          className="flex w-full items-center px-5 py-1.5 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                        >
                          {language === 'bn' ? l.nameBn : l.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )
      ) : intlResults.length === 0 ? (
        <p className="px-1 py-2 text-xs text-muted-foreground">{t('settings.noCityFound')}</p>
      ) : (
        <ul className="max-h-52 overflow-y-auto rounded-md border bg-background/50">
          {intlResults.map((c) => (
            <li key={`${c.name}-${c.country}-${c.lat}`}>
              <button
                type="button"
                onClick={() => pickIntl(c)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
              >
                <span>{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
