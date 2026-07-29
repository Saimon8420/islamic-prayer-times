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

  const activeCategoryLabel =
    selectedCategory === "all"
      ? t('dua.allCategories')
      : t(`dua.categories.${selectedCategory}` as 'dua.categories.prayer');

  return (
    <Card className="fade-in">
      {/* faint heritage watermark, top-right */}
      <div className="girih-watermark pointer-events-none absolute right-3 top-3 h-20 w-20 sm:h-28 sm:w-28" />

      {/* ═══ HEADER ═══ */}
      <div className="relative p-4 pb-0 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-mono !text-secondary">{t('dua.title')}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t('dua.subtitle')}
            </p>
          </div>
          <p className="arabic-text shrink-0 text-base font-semibold text-secondary sm:text-lg">
            الدعاء هو العبادة
          </p>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <CardContent className="relative px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4">
        {/* Dua of the Day */}
        {!duaOfDayDismissed && !searchQuery && selectedCategory === "all" && (
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/[0.06] p-4 mb-3 sm:mb-4 fade-in">
            <button
              onClick={() => setDuaOfDayDismissed(true)}
              className="absolute top-2 end-2 z-10 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              &times;
            </button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              {/* meta: label · translation · reference */}
              <div className="order-2 min-w-0 flex-1 sm:order-1">
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="label-mono !text-primary">{t('dua.duaOfTheDay')}</span>
                </div>
                <p className="text-sm text-muted-foreground sm:text-[15px]">
                  {duaOfTheDay.translation}
                </p>
                <span className="mt-2.5 inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] tabular-nums text-primary">
                  {duaOfTheDay.reference}
                </span>
              </div>

              {/* the arabic dua — hero, on the right */}
              <div className="order-1 sm:order-2 sm:flex-[1.1]">
                <p
                  className="arabic-text text-center text-xl leading-loose text-foreground sm:text-end sm:text-2xl"
                  dir="rtl"
                >
                  {duaOfTheDay.arabic}
                </p>
              </div>
            </div>
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
            className="w-full ps-9 sm:ps-10 pe-4 py-2 sm:py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </div>

        {/* Category Pills with scroll arrows */}
        <div className="relative flex items-center gap-1 mb-3 sm:mb-4">
          {/* Left arrow */}
          <button
            onClick={() => scrollPills('left')}
            className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border"
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
              className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors border ${
                selectedCategory === "all"
                  ? "border-secondary/40 bg-secondary/15 text-secondary"
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {t('dua.all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? "border-secondary/40 bg-secondary/15 text-secondary"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70"
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
            className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border"
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

        <div className="heritage-rule my-3" />

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
              const isExpanded = expandedDuaId === dua.id;

              return (
                <button
                  key={dua.id}
                  onClick={() => setExpandedDuaId(isExpanded ? null : dua.id)}
                  className={`w-full text-start rounded-xl border bg-card/50 p-3 sm:p-4 transition-colors ${
                    isExpanded
                      ? "border-primary/30 bg-primary/[0.04]"
                      : "border-border hover:bg-foreground/[0.03]"
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    {/* Category Icon */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg flex-shrink-0 bg-muted/40 border border-border">
                      {catInfo.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Arabic Text — the focus */}
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
                            <p className="label-mono mb-1">
                              {t('dua.transliteration')}
                            </p>
                            <p className="text-xs sm:text-sm italic text-foreground/80">
                              {dua.transliteration}
                            </p>
                          </div>

                          {/* History */}
                          {dua.history && (
                            <div className="bg-primary/[0.06] border border-primary/15 rounded-lg p-2.5 sm:p-3">
                              <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
                                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                                <p className="label-mono !text-primary">
                                  {t('dua.backgroundHistory')}
                                </p>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {dua.history}
                              </p>
                            </div>
                          )}

                          {/* Reference */}
                          <span className="inline-block font-mono text-[10px] sm:text-xs tabular-nums text-primary bg-primary/10 rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1">
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
