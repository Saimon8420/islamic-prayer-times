import { useState, useMemo, useRef } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { duas, categories, type DuaCategory } from "../../data/duas";
import { useTranslation } from "../../i18n/useTranslation";

/* ═══════════════════════════════════════════
   DECORATIVE SVG COMPONENTS
   ═══════════════════════════════════════════ */

const ArabesqueCorner = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 0L20 10L10 20Z" fill="rgba(200,168,78,0.25)" />
    <path d="M0 0L40 5L35 15L15 35L5 40Z" fill="rgba(200,168,78,0.12)" />
    <path d="M40 5L35 15L50 20L60 10Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <path d="M5 40L15 35L20 50L10 60Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
    <circle cx="20" cy="20" r="6" stroke="rgba(200,168,78,0.15)" strokeWidth="0.5" fill="none" />
  </svg>
);

const HangingLantern = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 30 60" fill="none" className={className}>
    <line x1="15" y1="0" x2="15" y2="12" stroke="rgba(200,168,78,0.4)" strokeWidth="1" />
    <path d="M10 12h10l-1 3H11z" fill="rgba(200,168,78,0.5)" />
    <path d="M9 15Q9 10 15 10Q21 10 21 15v18Q21 40 15 44Q9 40 9 33z" fill="rgba(200,168,78,0.15)" stroke="rgba(200,168,78,0.35)" strokeWidth="1" />
    <ellipse cx="15" cy="25" rx="4" ry="8" fill="rgba(200,168,78,0.12)" />
  </svg>
);

const TessellationOverlay = () => (
  <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Cpath d='M30 30L37.5 37.5L30 45L22.5 37.5Z'/%3E%3Cpath d='M30 45L37.5 52.5L30 60L22.5 52.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
  }} />
);

// Open book with dua/supplication icon
const DuaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
    <path d="M2 4c2-1 4.5-1.5 7-.5C10.5 4 11.5 5 12 5.5c.5-.5 1.5-1.5 3-2 2.5-1 5-.5 7 .5v14c-2-.8-4.5-1-7 0-1.5.5-2.5 1.5-3 2-.5-.5-1.5-1.5-3-2-2.5-1-5-.2-7 0V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 5.5V20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M7 8.5c1-.3 2-.3 3 0M7 11.5c1-.3 2-.3 3 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M14 8.5c1-.3 2-.3 3 0M14 11.5c1-.3 2-.3 3 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </svg>
);

// Star divider
const StarDivider = () => (
  <div className="flex items-center my-2 sm:my-3">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(40,70%,50%,0.25)]" />
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 mx-2 text-[hsl(40,85%,52%)] opacity-25">
      <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(40,70%,50%,0.25)]" />
  </div>
);

function getDuaOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return duas[dayOfYear % duas.length];
}

const categoryCounts: Record<string, number> = {};
for (const dua of duas) {
  categoryCounts[dua.category] = (categoryCounts[dua.category] || 0) + 1;
}

const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; iconBg: string; badge: string }
> = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badge: "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/50",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    badge: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/50",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-300",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    badge: "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    badge: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
    badge: "text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/50",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-300",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    badge: "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/50",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-300",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    badge: "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-950/30",
    text: "text-teal-700 dark:text-teal-300",
    iconBg: "bg-teal-100 dark:bg-teal-900/50",
    badge: "text-teal-700 bg-teal-100 dark:text-teal-300 dark:bg-teal-900/50",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-300",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/50",
    badge: "text-cyan-700 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-900/50",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    text: "text-sky-700 dark:text-sky-300",
    iconBg: "bg-sky-100 dark:bg-sky-900/50",
    badge: "text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/50",
  },
  lime: {
    bg: "bg-lime-50 dark:bg-lime-950/30",
    text: "text-lime-700 dark:text-lime-300",
    iconBg: "bg-lime-100 dark:bg-lime-900/50",
    badge: "text-lime-700 bg-lime-100 dark:text-lime-300 dark:bg-lime-900/50",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-700 dark:text-violet-300",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    badge: "text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/50",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-700 dark:text-yellow-300",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
    badge: "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    text: "text-pink-700 dark:text-pink-300",
    iconBg: "bg-pink-100 dark:bg-pink-900/50",
    badge: "text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/50",
  },
  fuchsia: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/50",
    badge: "text-fuchsia-700 bg-fuchsia-100 dark:text-fuchsia-300 dark:bg-fuchsia-900/50",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    badge: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50",
  },
};

export function DuaCollection() {
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDuaId, setExpandedDuaId] = useState<number | null>(null);
  const [duaOfDayDismissed, setDuaOfDayDismissed] = useState(false);
  const { t } = useTranslation();
  const pillsRef = useRef<HTMLDivElement>(null);

  const scrollPills = (direction: 'left' | 'right') => {
    if (!pillsRef.current) return;
    const amount = 200;
    pillsRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const duaOfTheDay = useMemo(() => getDuaOfTheDay(), []);

  const filteredDuas = useMemo(() => {
    let result = duas;

    if (selectedCategory !== "all") {
      result = result.filter((d) => d.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.translation.toLowerCase().includes(query) ||
          d.transliteration.toLowerCase().includes(query),
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  const getCategoryInfo = (categoryId: DuaCategory) =>
    categories.find((c) => c.id === categoryId)!;

  const getStyles = (color: string) =>
    CATEGORY_STYLES[color] || CATEGORY_STYLES.emerald;

  const activeCategoryLabel =
    selectedCategory === "all"
      ? t('dua.allCategories')
      : t(`dua.categories.${selectedCategory}` as 'dua.categories.prayer');

  return (
    <Card className="islamic-border overflow-hidden fade-in">
      {/* ═══ HEADER — Arabian gradient with decorations ═══ */}
      <div
        className="relative overflow-hidden px-4 py-3 sm:px-5 sm:py-4"
        style={{
          background: 'linear-gradient(135deg, hsl(222, 30%, 10%) 0%, hsl(222, 25%, 16%) 40%, hsl(230, 20%, 12%) 100%)',
        }}
      >
        <TessellationOverlay />

        {/* Arabesque corners */}
        <ArabesqueCorner className="absolute top-0 left-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50" />
        <ArabesqueCorner className="absolute top-0 right-0 w-10 h-10 sm:w-14 sm:h-14 opacity-50 -scale-x-100" />

        {/* Hanging lantern */}
        <div className="absolute top-0 right-[12%] w-3 h-6 sm:w-4 sm:h-8 opacity-30 hidden sm:block" style={{ animation: 'lantern-sway 4.5s ease-in-out infinite' }}>
          <HangingLantern className="w-full h-full" />
        </div>

        {/* Crescent */}
        <div className="absolute -top-3 -right-3 w-14 h-14 sm:w-20 sm:h-20 opacity-[0.06] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#c8a84e">
            <path d="M70 15 A35 35 0 1 0 70 85 A28 28 0 1 1 70 15" />
            <polygon points="78,42 81,50 90,50 83,55 86,64 78,58 70,64 73,55 66,50 75,50" />
          </svg>
        </div>

        {/* Mosque skyline */}
        <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-6 pointer-events-none">
          <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="w-full h-full" fill="white" fillOpacity="0.05">
            <path d="M0,40 L0,30 L20,30 L20,20 L22,10 L24,20 L24,30 L60,30 Q70,30 75,25 Q85,12 95,25 Q100,30 110,30 L140,30 L140,22 L142,12 L144,22 L144,30 L200,30 L210,26 Q220,18 230,26 L240,30 L280,30 L280,20 L282,8 L284,20 L284,30 L340,30 Q350,30 355,25 Q370,10 385,25 Q390,30 400,30 L440,30 L440,22 L442,10 L444,22 L444,30 L500,30 L510,26 Q520,16 530,26 L540,30 L570,30 Q580,30 585,25 Q595,14 600,25 L600,40 Z" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
            <DuaIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">{t('dua.title')}</h2>
            <p className="text-[10px] sm:text-xs text-white/50 leading-tight mt-0.5">
              {t('dua.subtitle')}
            </p>
          </div>
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-2.5 sm:py-1 border border-white/10 shrink-0">
            <p className="text-xs sm:text-sm text-white/70 arabic-text leading-tight">الدعاء هو العبادة</p>
          </div>
        </div>
      </div>

      {/* Gold border strip */}
      <div className="gold-border-strip" />

      {/* ═══ BODY ═══ */}
      <CardContent className="px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 relative">
        {/* Arabesque watermark */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="#996b2f" stroke="#996b2f" strokeWidth="0.5">
            <path d="M50 5L60 20L77 10L70 28L90 25L78 40L95 50L78 60L90 75L70 72L77 90L60 80L50 95L40 80L23 90L30 72L10 75L22 60L5 50L22 40L10 25L30 28L23 10L40 20Z" />
            <circle cx="50" cy="50" r="15" fill="none" />
          </svg>
        </div>

        {/* Dua of the Day */}
        {!duaOfDayDismissed && !searchQuery && selectedCategory === "all" && (
          <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4 mb-3 sm:mb-4 fade-in">
            <button
              onClick={() => setDuaOfDayDismissed(true)}
              className="absolute top-2 end-2 text-muted-foreground hover:text-foreground text-xs px-1.5 py-0.5 rounded"
            >
              &times;
            </button>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wide">
                {t('dua.duaOfTheDay')}
              </span>
            </div>
            <p className="arabic-text text-base sm:text-lg leading-loose text-foreground">
              {duaOfTheDay.arabic}
            </p>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
              {duaOfTheDay.translation}
            </p>
            <span className="inline-block mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1">
              {duaOfTheDay.reference}
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('dua.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 sm:ps-10 pe-4 py-2 sm:py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Category Pills with scroll arrows */}
        <div className="relative flex items-center gap-1 mb-3 sm:mb-4">
          {/* Left arrow */}
          <button
            onClick={() => scrollPills('left')}
            className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 shadow-sm"
            aria-label="Scroll left"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Scrollable pills */}
          <div
            ref={pillsRef}
            className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide flex-1"
          >
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "islamic-gradient text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t('dua.all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "islamic-gradient text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span className="me-1 sm:me-1.5">{cat.icon}</span>
                {t(`dua.categories.${cat.id}` as 'dua.categories.prayer')}
                <span className="ms-1 opacity-70">
                  ({categoryCounts[cat.id] || 0})
                </span>
              </button>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollPills('right')}
            className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 shadow-sm"
            aria-label="Scroll right"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Result Count */}
        <p className="text-xs sm:text-sm text-muted-foreground/70 mb-2 sm:mb-3">
          {filteredDuas.length === 1
            ? t('dua.duaCount', { count: filteredDuas.length })
            : t('dua.duasCount', { count: filteredDuas.length })}{" "}
          {t('dua.inCategory')}{" "}
          <span className="font-semibold text-foreground">
            {activeCategoryLabel}
          </span>
        </p>

        <StarDivider />

        {/* Dua List */}
        <div className="max-h-[65vh] overflow-y-auto space-y-2 sm:space-y-3 pe-1">
          {filteredDuas.length === 0 ? (
            <div className="text-center py-10 sm:py-12 text-muted-foreground">
              <p className="text-base sm:text-lg">{t('dua.noDuasFound')}</p>
              <p className="text-xs sm:text-sm mt-1">{t('dua.tryDifferent')}</p>
            </div>
          ) : (
            filteredDuas.map((dua) => {
              const catInfo = getCategoryInfo(dua.category);
              const styles = getStyles(catInfo.color);
              const isExpanded = expandedDuaId === dua.id;

              return (
                <button
                  key={dua.id}
                  onClick={() => setExpandedDuaId(isExpanded ? null : dua.id)}
                  className={`w-full text-start rounded-xl border border-border/60 bg-card p-3 sm:p-4 transition-all hover:shadow-md ${
                    isExpanded ? "shadow-md ring-1 ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    {/* Category Icon */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg flex-shrink-0 ${styles.iconBg}`}
                    >
                      {catInfo.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Arabic Text */}
                      <p className="arabic-text text-lg sm:text-xl leading-loose text-foreground">
                        {dua.arabic}
                      </p>

                      {/* Translation */}
                      <p
                        className={`mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground ${
                          isExpanded ? "" : "line-clamp-2"
                        }`}
                      >
                        {dua.translation}
                      </p>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-2.5 sm:mt-3 space-y-2.5 sm:space-y-3 fade-in">
                          {/* Transliteration */}
                          <div className="bg-muted/40 rounded-lg p-2.5 sm:p-3">
                            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-0.5 sm:mb-1">
                              {t('dua.transliteration')}
                            </p>
                            <p className="text-xs sm:text-sm italic text-foreground/80">
                              {dua.transliteration}
                            </p>
                          </div>

                          {/* History */}
                          {dua.history && (
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5 sm:p-3">
                              <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
                                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                                <p className="text-[10px] sm:text-xs font-semibold text-primary">
                                  {t('dua.backgroundHistory')}
                                </p>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {dua.history}
                              </p>
                            </div>
                          )}

                          {/* Reference */}
                          <span className="inline-block text-[10px] sm:text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1">
                            {dua.reference}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expand Indicator */}
                    <div className="flex-shrink-0 mt-1 text-muted-foreground/50">
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
