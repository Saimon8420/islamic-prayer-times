import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useHijriDate } from '../../hooks/useHijriDate';
import { locales } from '../../i18n';

type OccasionType = 'ramadan' | 'laylatulQadr' | 'eidUlFitr' | 'eidUlAdha' | 'dayOfArafah' | 'daysOfTashriq';

interface OccasionConfig {
  type: OccasionType;
  arabicGreeting: string;
}

function detectOccasion(hijri: { month: number; day: number }): OccasionConfig | null {
  const { month, day } = hijri;

  if (month === 9 && [21, 23, 25, 27, 29].includes(day)) {
    return { type: 'laylatulQadr', arabicGreeting: 'ليلة القدر' };
  }
  if (month === 9) {
    return { type: 'ramadan', arabicGreeting: 'رمضان مبارك' };
  }
  if (month === 10 && day === 1) {
    return { type: 'eidUlFitr', arabicGreeting: 'عيد مبارك' };
  }
  if (month === 12 && day === 9) {
    return { type: 'dayOfArafah', arabicGreeting: 'يوم عرفة' };
  }
  if (month === 12 && day === 10) {
    return { type: 'eidUlAdha', arabicGreeting: 'عيد أضحى مبارك' };
  }
  if (month === 12 && day >= 11 && day <= 13) {
    return { type: 'daysOfTashriq', arabicGreeting: 'أيام التشريق' };
  }

  return null;
}

export function IslamicOccasionBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const language = useStore((state) => state.language);
  const { hijriDate } = useHijriDate();
  const occasion = useMemo(() => detectOccasion(hijriDate), [hijriDate]);

  if (!occasion || dismissed) return null;

  const t = locales[language].occasions;
  const data = t[occasion.type];

  return (
    <div className="obs-panel overflow-hidden fade-in">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted/40 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
        aria-label={t.dismiss}
      >
        ✕
      </button>

      <div className="space-y-3 p-5">
        {/* ── Greeting Section (always visible) ── */}
        <div className="pt-1 text-center">
          <p className="arabic-text text-2xl font-semibold leading-snug text-secondary">
            {occasion.arabicGreeting}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-foreground">
            {data.greeting}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">{data.subtitle}</p>
        </div>

        {/* ── Expand/Collapse toggle (mobile only) ── */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:hidden"
        >
          <span>{expanded ? '▲' : '▼'}</span>
          <span>{expanded ? 'Show less' : 'See dua & actions'}</span>
        </button>

        {/* ── Collapsible content: hidden on mobile by default, always visible on sm+ ── */}
        <div
          className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out sm:!max-h-none sm:!opacity-100 ${
            expanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 sm:max-h-none sm:opacity-100'
          }`}
        >
          <div className="heritage-rule" />

          {/* ── Dua Section ── */}
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="label-mono !text-secondary">{t.duaLabel}</span>
              <span className="label-mono">{data.duaReference}</span>
            </div>
            <p className="arabic-text mt-2 text-center text-lg leading-relaxed text-foreground">
              {data.duaArabic}
            </p>
            <p className="mt-1 text-center text-xs leading-relaxed text-muted-foreground">
              {data.duaTranslation}
            </p>
          </div>

          {/* ── Rituals Section ── */}
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
            <span className="label-mono !text-primary">{t.ritualsLabel}</span>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {data.rituals.map((ritual, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-primary/50" />
                  {ritual}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
