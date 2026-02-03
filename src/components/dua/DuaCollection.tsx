import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { duas, categories, type DuaCategory } from "../../data/duas";
import { useTranslation } from "../../i18n/useTranslation";

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
    badge:
      "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/50",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    badge:
      "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/50",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-300",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    badge:
      "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50",
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
    badge:
      "text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/50",
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
    badge:
      "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50",
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
    badge:
      "text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/50",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-700 dark:text-yellow-300",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
    badge:
      "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50",
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
    badge:
      "text-fuchsia-700 bg-fuchsia-100 dark:text-fuchsia-300 dark:bg-fuchsia-900/50",
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
    <div className="space-y-4">
      {/* Header */}
      <div className="islamic-gradient-dark rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">{t('dua.title')}</h2>
        <p className="arabic-text text-lg mt-1 opacity-80">الدعاء هو العبادة</p>
        <p className="text-sm mt-1 opacity-60">
          {t('dua.subtitle')}
        </p>
      </div>

      {/* Dua of the Day */}
      {!duaOfDayDismissed && !searchQuery && selectedCategory === "all" && (
        <div className="relative rounded-xl border-2 border-primary/20 bg-primary/5 p-4 fade-in">
          <button
            onClick={() => setDuaOfDayDismissed(true)}
            className="absolute top-2 end-2 text-muted-foreground hover:text-foreground text-xs px-1.5 py-0.5 rounded"
          >
            &times;
          </button>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {t('dua.duaOfTheDay')}
            </span>
          </div>
          <p className="arabic-text text-lg leading-loose text-foreground">
            {duaOfTheDay.arabic}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {duaOfTheDay.translation}
          </p>
          <span className="inline-block mt-2 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
            {duaOfTheDay.reference}
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('dua.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? "islamic-gradient text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span className="me-1.5">{cat.icon}</span>
            {t(`dua.categories.${cat.id}` as 'dua.categories.prayer')}
            <span className="ms-1 opacity-70">
              ({categoryCounts[cat.id] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Result Count */}
      <p className="text-sm text-muted-foreground">
        {filteredDuas.length === 1
          ? t('dua.duaCount', { count: filteredDuas.length })
          : t('dua.duasCount', { count: filteredDuas.length })}{" "}
        {t('dua.inCategory')}{" "}
        <span className="font-medium text-foreground">
          {activeCategoryLabel}
        </span>
      </p>

      {/* Dua List */}
      <div className="max-h-[65vh] overflow-y-auto space-y-3 pe-1">
        {filteredDuas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">{t('dua.noDuasFound')}</p>
            <p className="text-sm mt-1">{t('dua.tryDifferent')}</p>
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
                className={`w-full text-start rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md ${
                  isExpanded ? "shadow-md ring-1 ring-primary/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${styles.iconBg}`}
                  >
                    {catInfo.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Arabic Text */}
                    <p className="arabic-text text-xl leading-loose text-foreground">
                      {dua.arabic}
                    </p>

                    {/* Translation */}
                    <p
                      className={`mt-2 text-sm text-muted-foreground ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {dua.translation}
                    </p>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3 fade-in">
                        {/* Transliteration */}
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {t('dua.transliteration')}
                          </p>
                          <p className="text-sm italic text-foreground/80">
                            {dua.transliteration}
                          </p>
                        </div>

                        {/* History */}
                        {dua.history && (
                          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                              <p className="text-xs font-medium text-primary">
                                {t('dua.backgroundHistory')}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {dua.history}
                            </p>
                          </div>
                        )}

                        {/* Reference */}
                        <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                          {dua.reference}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expand Indicator */}
                  <div className="flex-shrink-0 mt-1 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
