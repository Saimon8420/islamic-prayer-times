import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useHijriDate } from '../../hooks/useHijriDate';
import { locales } from '../../i18n';

type OccasionType = 'ramadan' | 'laylatulQadr' | 'eidUlFitr' | 'eidUlAdha' | 'dayOfArafah' | 'daysOfTashriq';

interface OccasionConfig {
  type: OccasionType;
  gradient: string;
  arabicGreeting: string;
}

// Arabian/Mamluk gradients — deep, rich, layered
const OCCASION_GRADIENTS = {
  ramadan: 'linear-gradient(135deg, hsl(38, 75%, 30%) 0%, hsl(40, 80%, 38%) 40%, hsl(35, 70%, 28%) 100%)',
  laylatulQadr: 'linear-gradient(135deg, hsl(222, 40%, 8%) 0%, hsl(230, 35%, 14%) 40%, hsl(222, 40%, 10%) 100%)',
  eidUlFitr: 'linear-gradient(135deg, hsl(158, 60%, 22%) 0%, hsl(160, 50%, 28%) 40%, hsl(155, 55%, 20%) 100%)',
  eidUlAdha: 'linear-gradient(135deg, hsl(158, 50%, 22%) 0%, hsl(40, 60%, 32%) 50%, hsl(155, 45%, 20%) 100%)',
  dayOfArafah: 'linear-gradient(135deg, hsl(222, 35%, 12%) 0%, hsl(220, 30%, 18%) 40%, hsl(222, 35%, 10%) 100%)',
  daysOfTashriq: 'linear-gradient(135deg, hsl(158, 45%, 24%) 0%, hsl(160, 40%, 30%) 40%, hsl(155, 45%, 22%) 100%)',
} as const;

function detectOccasion(hijri: { month: number; day: number }): OccasionConfig | null {
  const { month, day } = hijri;

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

// ── Decorative SVG Elements ──

// Arabesque corner ornament
const ArabesqueCorner = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute pointer-events-none ${className}`} viewBox="0 0 80 80" fill="none" width="80" height="80">
    <path d="M0 0Q20 0 40 20Q60 0 80 0L80 10Q60 10 45 25Q55 35 55 50Q55 65 40 80L30 80Q45 65 45 50Q45 35 35 25Q20 10 0 10Z" fill="rgba(200,168,78,0.12)" />
    <path d="M0 0Q15 0 30 15Q45 0 60 0" stroke="rgba(200,168,78,0.2)" strokeWidth="0.8" fill="none" />
    <circle cx="40" cy="20" r="2" fill="rgba(200,168,78,0.15)" />
  </svg>
);

// Hanging lantern with warm glow
const HangingLanternSvg = ({ className = '', delay = '0s' }: { className?: string; delay?: string }) => (
  <svg className={`absolute pointer-events-none ${className}`} style={{ animation: `lantern-sway 5s ease-in-out infinite`, animationDelay: delay }} viewBox="0 0 28 55" fill="none" width="20" height="40">
    {/* Chain */}
    <line x1="14" y1="0" x2="14" y2="10" stroke="rgba(200,168,78,0.4)" strokeWidth="0.8" />
    {/* Cap */}
    <path d="M9 10h10l-1 3H10z" fill="rgba(200,168,78,0.5)" />
    {/* Body */}
    <path d="M8 13Q8 9 14 9Q20 9 20 13v16Q20 36 14 40Q8 36 8 29z" fill="rgba(200,168,78,0.12)" stroke="rgba(200,168,78,0.3)" strokeWidth="0.8" />
    {/* Inner glow */}
    <ellipse cx="14" cy="22" rx="3.5" ry="7" fill="rgba(255,220,120,0.1)" />
    {/* Lattice pattern */}
    <line x1="14" y1="13" x2="14" y2="29" stroke="rgba(200,168,78,0.15)" strokeWidth="0.4" />
    <line x1="8" y1="21" x2="20" y2="21" stroke="rgba(200,168,78,0.15)" strokeWidth="0.4" />
    {/* Bottom tip */}
    <path d="M12 38l2 5 2-5" fill="rgba(200,168,78,0.3)" />
  </svg>
);

// Crescent moon with star
const CrescentWithStar = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute pointer-events-none ${className}`} style={{ animation: 'float 6s ease-in-out infinite' }} viewBox="0 0 50 50" fill="none" width="45" height="45">
    <path d="M30 8a16 16 0 1 0 0 28 12 12 0 0 1 0-28z" fill="rgba(200,168,78,0.12)" />
    {/* Star beside crescent */}
    <polygon points="42,15 43.5,19 48,19 44.5,22 46,26 42,23.5 38,26 39.5,22 36,19 40.5,19" fill="rgba(200,168,78,0.15)" />
  </svg>
);

// 8-pointed star accent
const EightStarAccent = ({ className = '', size = 12, opacity = 0.15 }: { className?: string; size?: number; opacity?: number }) => (
  <svg className={`absolute pointer-events-none ${className}`} viewBox="0 0 24 24" width={size} height={size} fill={`rgba(200,168,78,${opacity})`}>
    <path d="M12 0l2.5 7.5L22 7.5l-5.5 4L19 19l-7-4.5L5 19l2.5-7.5L2 7.5l7.5 0z" />
  </svg>
);

// Twinkling gold stars
const GoldStars = () => (
  <>
    <EightStarAccent className="top-3 left-[15%]" size={8} opacity={0.2} />
    <EightStarAccent className="top-5 right-[20%]" size={6} opacity={0.12} />
    <EightStarAccent className="bottom-12 left-[10%]" size={7} opacity={0.1} />
    <EightStarAccent className="top-8 left-[45%]" size={5} opacity={0.08} />
    <EightStarAccent className="bottom-16 right-[15%]" size={9} opacity={0.12} />
    {/* Twinkling dots */}
    <svg className="absolute top-4 left-[30%] w-1.5 h-1.5" style={{ animation: 'twinkle 2.5s ease-in-out infinite' }} viewBox="0 0 8 8" fill="rgba(200,168,78,0.5)">
      <circle cx="4" cy="4" r="2" />
    </svg>
    <svg className="absolute top-6 right-[35%] w-1 h-1" style={{ animation: 'twinkle 3s ease-in-out infinite 0.7s' }} viewBox="0 0 8 8" fill="rgba(200,168,78,0.4)">
      <circle cx="4" cy="4" r="2" />
    </svg>
    <svg className="absolute bottom-20 left-[55%] w-1 h-1" style={{ animation: 'twinkle 2s ease-in-out infinite 1.2s' }} viewBox="0 0 8 8" fill="rgba(200,168,78,0.35)">
      <circle cx="4" cy="4" r="2" />
    </svg>
  </>
);

// Mosque silhouette for horizon
const MosqueSilhouetteSvg = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute pointer-events-none ${className}`} viewBox="0 0 120 45" fill="rgba(255,255,255,0.06)" width="120" height="45">
    {/* Left minaret */}
    <rect x="5" y="18" width="4" height="27" />
    <polygon points="7,10 10,18 4,18" />
    <circle cx="7" cy="9" r="1.5" />
    {/* Dome */}
    <ellipse cx="35" cy="22" rx="18" ry="14" />
    <rect x="33" y="8" width="4" height="8" rx="1" />
    {/* Right minaret */}
    <rect x="58" y="20" width="4" height="25" />
    <polygon points="60,12 63,20 57,20" />
    <circle cx="60" cy="11" r="1.2" />
    {/* Second smaller dome */}
    <ellipse cx="85" cy="28" rx="12" ry="10" />
    <rect x="83" y="18" width="3" height="6" rx="1" />
    {/* Far minaret */}
    <rect x="105" y="22" width="3" height="23" />
    <polygon points="106.5,14 109,22 104,22" />
  </svg>
);

// Mountain (Arafah)
const MountainSvg = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute pointer-events-none ${className}`} viewBox="0 0 120 45" fill="rgba(255,255,255,0.06)" width="120" height="45">
    <path d="M0 45 L20 12 L35 28 L50 5 L70 20 L85 8 L100 25 L120 45z" />
    {/* Snow caps */}
    <path d="M48 8L50 5L52 8Q50 10 48 8z" fill="rgba(255,255,255,0.04)" />
    <path d="M83 11L85 8L87 11Q85 13 83 11z" fill="rgba(255,255,255,0.04)" />
  </svg>
);

function OccasionGraphics({ type }: { type: OccasionType }) {
  switch (type) {
    case 'ramadan':
      return (
        <>
          <ArabesqueCorner className="top-0 left-0" />
          <ArabesqueCorner className="bottom-0 right-0 rotate-180" />
          <HangingLanternSvg className="top-0 left-[8%]" />
          <HangingLanternSvg className="top-0 right-[15%]" delay="1.2s" />
          <HangingLanternSvg className="top-0 left-[40%] hidden sm:block" delay="0.6s" />
          <CrescentWithStar className="top-1 right-2" />
          <GoldStars />
          <MosqueSilhouetteSvg className="bottom-0 left-[5%] opacity-60" />
        </>
      );
    case 'laylatulQadr':
      return (
        <>
          <ArabesqueCorner className="top-0 left-0" />
          <ArabesqueCorner className="bottom-0 right-0 rotate-180" />
          <CrescentWithStar className="top-1 right-2" />
          <GoldStars />
          {/* Extra bright stars for Night of Power */}
          <EightStarAccent className="top-4 left-[20%]" size={14} opacity={0.25} />
          <EightStarAccent className="top-6 right-[25%]" size={11} opacity={0.2} />
          <EightStarAccent className="bottom-14 left-[35%]" size={10} opacity={0.18} />
          <HangingLanternSvg className="top-0 left-[6%]" />
          <HangingLanternSvg className="top-0 right-[12%]" delay="0.8s" />
        </>
      );
    case 'eidUlFitr':
    case 'eidUlAdha':
      return (
        <>
          <ArabesqueCorner className="top-0 left-0" />
          <ArabesqueCorner className="bottom-0 right-0 rotate-180" />
          <CrescentWithStar className="top-1 right-2" />
          <MosqueSilhouetteSvg className="bottom-0 left-[3%] opacity-70" />
          <GoldStars />
          <HangingLanternSvg className="top-0 left-[10%]" />
          <HangingLanternSvg className="top-0 right-[18%]" delay="1s" />
        </>
      );
    case 'dayOfArafah':
      return (
        <>
          <ArabesqueCorner className="top-0 left-0" />
          <ArabesqueCorner className="bottom-0 right-0 rotate-180" />
          <MountainSvg className="bottom-0 right-[2%] opacity-80" />
          <CrescentWithStar className="top-1 right-2" />
          <GoldStars />
        </>
      );
    case 'daysOfTashriq':
      return (
        <>
          <ArabesqueCorner className="top-0 left-0" />
          <ArabesqueCorner className="bottom-0 right-0 rotate-180" />
          <CrescentWithStar className="top-1 right-2" />
          <GoldStars />
          <MosqueSilhouetteSvg className="bottom-0 right-[5%] opacity-50" />
        </>
      );
  }
}

// Gold ornamental divider inside the banner
const BannerDivider = () => (
  <div className="flex items-center gap-2 py-1">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
    <svg viewBox="0 0 20 20" className="w-3 h-3 text-white/30 shrink-0" fill="currentColor">
      <path d="M10 0l2.5 7.5L20 7.5l-5.5 4L17 19l-7-4.5L3 19l2.5-7.5L0 7.5l7.5 0z" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
  </div>
);

// ── Preview component: renders all 6 occasions for design review ──
export function PreviewAllOccasions() {
  const language = useStore((state) => state.language);
  const t = locales[language].occasions;
  const allTypes: OccasionType[] = ['ramadan', 'laylatulQadr', 'eidUlFitr', 'eidUlAdha', 'dayOfArafah', 'daysOfTashriq'];

  return (
    <div className="space-y-4">
      {allTypes.map((type) => {
        const data = t[type];
        const gradient = OCCASION_GRADIENTS[type];
        const arabicGreetings: Record<OccasionType, string> = {
          ramadan: 'رمضان مبارك', laylatulQadr: 'ليلة القدر', eidUlFitr: 'عيد مبارك',
          eidUlAdha: 'عيد أضحى مبارك', dayOfArafah: 'يوم عرفة', daysOfTashriq: 'أيام التشريق',
        };
        return <SingleBanner key={type} type={type} gradient={gradient} arabicGreeting={arabicGreetings[type]} data={data} />;
      })}
    </div>
  );
}

function SingleBanner({ type, gradient, arabicGreeting, data }: {
  type: OccasionType; gradient: string; arabicGreeting: string;
  data: { greeting: string; subtitle: string; duaReference: string; duaArabic: string; duaTranslation: string; rituals: string[] };
}) {
  const [expanded, setExpanded] = useState(false);
  const t_labels = locales[useStore((state) => state.language)].occasions;

  return (
    <div className="relative overflow-hidden rounded-2xl text-white fade-in" style={{ background: gradient }}>
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        border: '1.5px solid rgba(200,168,78,0.2)',
        boxShadow: 'inset 0 0 30px rgba(200,168,78,0.06), 0 0 20px rgba(200,168,78,0.08)',
      }} />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.8'%3E%3Cpath d='M30 0L45 15L30 30L15 15Z'/%3E%3Cpath d='M0 30L15 45L0 60L-15 45Z'/%3E%3Cpath d='M60 30L75 45L60 60L45 45Z'/%3E%3Ccircle cx='30' cy='30' r='5'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <OccasionGraphics type={type} />
      <div className="relative z-[1] px-5 py-4 space-y-3">
        <div className="text-center pt-1">
          <p className="arabic-text text-2xl font-bold text-white/95 leading-snug drop-shadow-sm">{arabicGreeting}</p>
          <h3 className="text-lg font-bold leading-tight mt-0.5 drop-shadow-sm">{data.greeting}</h3>
          <p className="text-xs text-white/65 mt-1 max-w-md mx-auto">{data.subtitle}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="sm:hidden w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-white/60 hover:text-white/80 transition-colors">
          <span>{expanded ? '▲' : '▼'}</span>
          <span>{expanded ? 'Show less' : 'See dua & actions'}</span>
        </button>
        <div className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out sm:!max-h-none sm:!opacity-100 ${expanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 sm:max-h-none sm:opacity-100'}`}>
          <BannerDivider />
          <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(200,168,78,0.15)' }}>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/85">
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor" opacity="0.7"><path d="M3 1h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V3a2 2 0 012-2zm1 3v2h8V4H4zm0 4v1h6V8H4zm0 3v1h4v-1H4z" /></svg>
                  {t_labels.duaLabel}
                </div>
                <span className="text-[10px] text-white/40 font-medium tracking-wide">{data.duaReference}</span>
              </div>
              <p className="arabic-text text-lg text-center text-white/95 leading-relaxed py-1">{data.duaArabic}</p>
              <p className="text-xs text-white/60 text-center italic leading-relaxed">{data.duaTranslation}</p>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(200,168,78,0.12)' }}>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/85">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="rgba(200,168,78,0.7)"><path d="M8 0l2 5h5.5l-4.5 3.5 1.5 5.5-4.5-3-4.5 3 1.5-5.5L0 5h5.5z" /></svg>
                {t_labels.ritualsLabel}
              </div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {data.rituals.map((ritual, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rotate-45 bg-white/30 flex-shrink-0" />
                    {ritual}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
    <div
      className="relative overflow-hidden rounded-2xl text-white fade-in"
      style={{ background: occasion.gradient }}
    >
      {/* Arabesque border — gold outline */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        border: '1.5px solid rgba(200,168,78,0.2)',
        boxShadow: 'inset 0 0 30px rgba(200,168,78,0.06), 0 0 20px rgba(200,168,78,0.08)',
      }} />

      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.8'%3E%3Cpath d='M30 0L45 15L30 30L15 15Z'/%3E%3Cpath d='M0 30L15 45L0 60L-15 45Z'/%3E%3Cpath d='M60 30L75 45L60 60L45 45Z'/%3E%3Ccircle cx='30' cy='30' r='5'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <OccasionGraphics type={occasion.type} />

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/15 hover:bg-black/25 backdrop-blur-sm transition-colors text-white/70 hover:text-white text-xs border border-white/10"
        aria-label={t.dismiss}
      >
        ✕
      </button>

      <div className="relative z-[1] px-5 py-4 space-y-3">
        {/* ── Greeting Section (always visible) ── */}
        <div className="text-center pt-1">
          <p className="arabic-text text-2xl font-bold text-white/95 leading-snug drop-shadow-sm">
            {occasion.arabicGreeting}
          </p>
          <h3 className="text-lg font-bold leading-tight mt-0.5 drop-shadow-sm">{data.greeting}</h3>
          <p className="text-xs text-white/65 mt-1 max-w-md mx-auto">{data.subtitle}</p>
        </div>

        {/* ── Expand/Collapse toggle (mobile only) ── */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="sm:hidden w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-white/60 hover:text-white/80 transition-colors"
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
          <BannerDivider />

          {/* ── Dua Section ── */}
          <div className="relative rounded-xl overflow-hidden" style={{
            background: 'rgba(0,0,0,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(200,168,78,0.15)',
          }}>
            {/* Arabesque accent inside dua card */}
            <div className="absolute top-0 right-0 w-12 h-12 opacity-[0.06] pointer-events-none" style={{
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 5L60 20L77 10L70 28L90 25L78 40L95 50L78 60L90 75L70 72L77 90L60 80L50 95L40 80L23 90L30 72L10 75L22 60L5 50L22 40L10 25L30 28L23 10L40 20Z' fill='%23c8a84e'/%3E%3C/svg%3E") no-repeat center`,
              backgroundSize: 'contain',
            }} />

            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/85">
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor" opacity="0.7">
                    <path d="M3 1h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V3a2 2 0 012-2zm1 3v2h8V4H4zm0 4v1h6V8H4zm0 3v1h4v-1H4z" />
                  </svg>
                  {t.duaLabel}
                </div>
                <span className="text-[10px] text-white/40 font-medium tracking-wide">{data.duaReference}</span>
              </div>
              <p className="arabic-text text-lg text-center text-white/95 leading-relaxed py-1">
                {data.duaArabic}
              </p>
              <p className="text-xs text-white/60 text-center italic leading-relaxed">
                {data.duaTranslation}
              </p>
            </div>
          </div>

          {/* ── Rituals Section ── */}
          <div className="relative rounded-xl overflow-hidden" style={{
            background: 'rgba(0,0,0,0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(200,168,78,0.12)',
          }}>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/85">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="rgba(200,168,78,0.7)">
                  <path d="M8 0l2 5h5.5l-4.5 3.5 1.5 5.5-4.5-3-4.5 3 1.5-5.5L0 5h5.5z" />
                </svg>
                {t.ritualsLabel}
              </div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {data.rituals.map((ritual, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <span className="mt-1.5 w-1.5 h-1.5 rotate-45 bg-white/30 flex-shrink-0" />
                    {ritual}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

