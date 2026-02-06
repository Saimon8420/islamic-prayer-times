import { useState, useMemo } from 'react';
import { gregorianToHijri } from '../../services/hijriService';
import { useStore } from '../../store/useStore';
import { locales } from '../../i18n';

type OccasionType = 'ramadan' | 'laylatulQadr' | 'eidUlFitr' | 'eidUlAdha' | 'dayOfArafah' | 'daysOfTashriq';

interface OccasionConfig {
  type: OccasionType;
  gradient: string;
  arabicGreeting: string;
}

// Site-consistent gradients using the app's HSL palette
const OCCASION_GRADIENTS = {
  // Warm gold — Ramadan's blessed warmth
  ramadan: 'linear-gradient(135deg, hsl(43, 96%, 38%), hsl(38, 92%, 46%), hsl(43, 80%, 36%))',
  // Deep dark night green — the majestic Night of Power
  laylatulQadr: 'linear-gradient(135deg, hsl(160, 40%, 8%), hsl(158, 50%, 15%), hsl(170, 35%, 10%))',
  // Vibrant primary Islamic green — Eid celebration
  eidUlFitr: 'linear-gradient(135deg, hsl(158, 64%, 28%), hsl(173, 58%, 36%), hsl(158, 64%, 30%))',
  // Green blending into gold — festive sacrifice
  eidUlAdha: 'linear-gradient(135deg, hsl(158, 55%, 28%), hsl(50, 60%, 38%), hsl(158, 50%, 26%))',
  // Deep teal — spiritual contemplation
  dayOfArafah: 'linear-gradient(135deg, hsl(173, 50%, 20%), hsl(160, 45%, 16%), hsl(173, 58%, 22%))',
  // Lighter teal/accent — continuation of Eid days
  daysOfTashriq: 'linear-gradient(135deg, hsl(173, 50%, 32%), hsl(158, 45%, 35%), hsl(173, 55%, 28%))',
} as const;

function detectOccasion(): OccasionConfig | null {
  const hijri = gregorianToHijri(new Date());
  const { month, day } = hijri;

  // Priority: Laylatul Qadr > Ramadan, Eid > Tashriq
  if (month === 9 && [21, 23, 25, 27, 29].includes(day)) {
    return { type: 'laylatulQadr', gradient: OCCASION_GRADIENTS.laylatulQadr, arabicGreeting: 'ليلة القدر' };
  }
  if (month === 9) {
    return { type: 'ramadan', gradient: OCCASION_GRADIENTS.ramadan, arabicGreeting: 'رمضان مبارك' };
  }
  if (month === 10 && day === 1) {
    return { type: 'eidUlFitr', gradient: OCCASION_GRADIENTS.eidUlFitr, arabicGreeting: 'عيد مبارك' };
  }
  if (month === 12 && day === 9) {
    return { type: 'dayOfArafah', gradient: OCCASION_GRADIENTS.dayOfArafah, arabicGreeting: 'يوم عرفة' };
  }
  if (month === 12 && day === 10) {
    return { type: 'eidUlAdha', gradient: OCCASION_GRADIENTS.eidUlAdha, arabicGreeting: 'عيد أضحى مبارك' };
  }
  if (month === 12 && day >= 11 && day <= 13) {
    return { type: 'daysOfTashriq', gradient: OCCASION_GRADIENTS.daysOfTashriq, arabicGreeting: 'أيام التشريق' };
  }

  return null;
}

// --- Inline SVG Decorations ---

const StarsSvg = () => (
  <>
    <svg className="absolute top-3 left-4 w-2 h-2 text-white/60" style={{ animation: 'twinkle 2s ease-in-out infinite' }} viewBox="0 0 8 8" fill="currentColor">
      <circle cx="4" cy="4" r="2" />
    </svg>
    <svg className="absolute top-6 right-12 w-1.5 h-1.5 text-white/50" style={{ animation: 'twinkle 3s ease-in-out infinite 0.5s' }} viewBox="0 0 8 8" fill="currentColor">
      <circle cx="4" cy="4" r="2" />
    </svg>
    <svg className="absolute top-10 left-1/4 w-1 h-1 text-white/40" style={{ animation: 'twinkle 2.5s ease-in-out infinite 1s' }} viewBox="0 0 8 8" fill="currentColor">
      <circle cx="4" cy="4" r="2" />
    </svg>
    <svg className="absolute bottom-16 right-1/4 w-1.5 h-1.5 text-white/50" style={{ animation: 'twinkle 2s ease-in-out infinite 1.5s' }} viewBox="0 0 8 8" fill="currentColor">
      <circle cx="4" cy="4" r="2" />
    </svg>
    <svg className="absolute top-4 left-1/2 w-1 h-1 text-white/30" style={{ animation: 'twinkle 3.5s ease-in-out infinite 0.7s' }} viewBox="0 0 8 8" fill="currentColor">
      <circle cx="4" cy="4" r="2" />
    </svg>
  </>
);

const CrescentMoonSvg = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute text-white/15 ${className}`} style={{ animation: 'float 4s ease-in-out infinite' }} viewBox="0 0 40 40" fill="currentColor" width="40" height="40">
    <path d="M28 6a16 16 0 1 0 0 28 12 12 0 0 1 0-28z" />
  </svg>
);

const LanternSvg = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute text-yellow-300/20 ${className}`} style={{ animation: 'float 5s ease-in-out infinite 1s' }} viewBox="0 0 24 48" fill="currentColor" width="16" height="32">
    <rect x="8" y="0" width="8" height="4" rx="1" />
    <path d="M6 4h12l2 8v20l-2 8H6l-2-8V12z" fillOpacity="0.6" />
    <rect x="11" y="2" width="2" height="6" fill="currentColor" fillOpacity="0.8" />
  </svg>
);

const MosqueSvg = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute text-white/10 ${className}`} viewBox="0 0 80 50" fill="currentColor" width="80" height="50">
    <path d="M40 5 Q30 15 20 25 L20 50 L60 50 L60 25 Q50 15 40 5z" />
    <rect x="10" y="30" width="6" height="20" />
    <rect x="64" y="30" width="6" height="20" />
    <circle cx="13" cy="28" r="4" />
    <circle cx="67" cy="28" r="4" />
  </svg>
);

const MountainSvg = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute text-white/10 ${className}`} viewBox="0 0 100 40" fill="currentColor" width="100" height="40">
    <path d="M0 40 L25 8 L40 25 L55 5 L75 22 L100 40z" />
  </svg>
);

function OccasionGraphics({ type }: { type: OccasionType }) {
  switch (type) {
    case 'ramadan':
      return (
        <>
          <CrescentMoonSvg className="top-2 right-6" />
          <LanternSvg className="top-0 left-6" />
          <LanternSvg className="top-2 right-24" />
          <StarsSvg />
        </>
      );
    case 'laylatulQadr':
      return (
        <>
          <CrescentMoonSvg className="top-2 right-6" />
          <StarsSvg />
          <svg className="absolute top-8 left-8 w-2 h-2 text-yellow-200/60" style={{ animation: 'twinkle 1.5s ease-in-out infinite' }} viewBox="0 0 10 10" fill="currentColor">
            <polygon points="5,0 6.5,3.5 10,3.5 7,6 8.5,10 5,7.5 1.5,10 3,6 0,3.5 3.5,3.5" />
          </svg>
          <svg className="absolute bottom-20 right-8 w-2 h-2 text-yellow-200/40" style={{ animation: 'twinkle 2s ease-in-out infinite 0.8s' }} viewBox="0 0 10 10" fill="currentColor">
            <polygon points="5,0 6.5,3.5 10,3.5 7,6 8.5,10 5,7.5 1.5,10 3,6 0,3.5 3.5,3.5" />
          </svg>
        </>
      );
    case 'eidUlFitr':
    case 'eidUlAdha':
      return (
        <>
          <CrescentMoonSvg className="top-2 right-6" />
          <MosqueSvg className="bottom-0 left-0" />
          <StarsSvg />
        </>
      );
    case 'dayOfArafah':
      return (
        <>
          <MountainSvg className="bottom-0 right-0" />
          <StarsSvg />
          <CrescentMoonSvg className="top-2 right-6" />
        </>
      );
    case 'daysOfTashriq':
      return (
        <>
          <CrescentMoonSvg className="top-2 right-6" />
          <StarsSvg />
        </>
      );
  }
}

export function IslamicOccasionBanner() {
  const [dismissed, setDismissed] = useState(false);
  const language = useStore((state) => state.language);
  const occasion = useMemo(() => detectOccasion(), []);

  if (!occasion || dismissed) return null;

  const t = locales[language].occasions;
  const data = t[occasion.type];

  return (
    <div
      className="relative overflow-hidden rounded-xl text-white px-4 py-3 fade-in"
      style={{ background: occasion.gradient, animation: 'glow-pulse 4s ease-in-out infinite' }}
    >
      <OccasionGraphics type={occasion.type} />

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white/80 hover:text-white text-xs"
        aria-label={t.dismiss}
      >
        ✕
      </button>

      <div className="relative z-[1] space-y-2.5">
        {/* Greeting */}
        <div className="text-center">
          <p className="arabic-text text-xl font-bold text-white/95 leading-snug">
            {occasion.arabicGreeting}
          </p>
          <h3 className="text-base font-semibold leading-tight">{data.greeting}</h3>
          <p className="text-xs text-white/75 mt-0.5">{data.subtitle}</p>
        </div>

        {/* Dua */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
            <span>📖</span>
            <span>{t.duaLabel}</span>
            <span className="text-[10px] text-white/55 ml-auto">{data.duaReference}</span>
          </div>
          <p className="arabic-text text-base text-center text-white/95 leading-relaxed">
            {data.duaArabic}
          </p>
          <p className="text-xs text-white/75 text-center italic">
            {data.duaTranslation}
          </p>
        </div>

        {/* Rituals */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
            <span>✦</span>
            <span>{t.ritualsLabel}</span>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {data.rituals.map((ritual, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-white/80">
                <span className="mt-1 w-1 h-1 rounded-full bg-white/50 flex-shrink-0" />
                {ritual}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
