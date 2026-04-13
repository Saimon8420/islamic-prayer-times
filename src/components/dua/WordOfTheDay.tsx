import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { quranWords } from '../../data/quranWords';
import { useTranslation } from '../../i18n/useTranslation';

/* ═══════════════════════════════════════════
   DECORATIVE SVG COMPONENTS
   ═══════════════════════════════════════════ */

const ArabesqueCorner = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 0L20 10L10 20Z" fill="rgba(200,168,78,0.25)" />
    <path d="M0 0L40 5L35 15L15 35L5 40Z" fill="rgba(200,168,78,0.12)" />
    <path d="M40 5L35 15L50 20L60 10Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <path d="M5 40L15 35L20 50L10 60Z" stroke="rgba(200,168,78,0.2)" strokeWidth="0.5" fill="rgba(200,168,78,0.06)" />
    <circle cx="20" cy="20" r="3" fill="rgba(200,168,78,0.2)" />
    <circle cx="20" cy="20" r="6" stroke="rgba(200,168,78,0.15)" strokeWidth="0.5" fill="none" />
  </svg>
);

const EightPointStar = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
  </svg>
);

/* ═══════════════════════════════════════════
   WORD OF THE DAY COMPONENT
   ═══════════════════════════════════════════ */

export function WordOfTheDay() {
  const { t, language } = useTranslation();

  const todayWord = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return quranWords[dayOfYear % quranWords.length];
  }, []);

  const meaning = language === 'bn' ? todayWord.meaningBn : todayWord.meaning;
  const exampleTranslation = language === 'bn' ? todayWord.exampleTranslationBn : todayWord.exampleTranslation;

  return (
    <Card className="islamic-border relative overflow-hidden">
      {/* Arabesque corners */}
      <ArabesqueCorner className="absolute top-0 left-0 w-12 h-12 opacity-60" />
      <ArabesqueCorner className="absolute top-0 right-0 w-12 h-12 opacity-60 -scale-x-100" />
      <ArabesqueCorner className="absolute bottom-0 left-0 w-10 h-10 opacity-40 -scale-y-100" />
      <ArabesqueCorner className="absolute bottom-0 right-0 w-10 h-10 opacity-40 scale-[-1]" />

      {/* Header strip */}
      <div className="islamic-gradient-header gold-border-strip px-4 py-2.5 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[hsl(var(--gold))]" />
        <h3 className="text-sm font-semibold text-white/95 tracking-wide">
          {t('wordOfTheDay.title')}
        </h3>
      </div>

      <CardContent className="px-4 py-3 md:py-4">
        <div className="max-w-md mx-auto text-center space-y-2.5">
          {/* Hero: Arabic word + transliteration + meaning — tightly grouped */}
          <div className="space-y-0.5">
            <p className="text-3xl arabic-text leading-snug text-[hsl(var(--primary))] dark:text-[hsl(var(--gold))]" dir="rtl">
              {todayWord.word}
            </p>
            <p className="text-sm font-medium italic text-[hsl(var(--primary))] dark:text-emerald-400">
              {todayWord.transliteration} — <span className="not-italic font-semibold text-foreground">{meaning}</span>
            </p>
          </div>

          {/* Meta line: root + frequency — single compact row */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="arabic-text tracking-[0.2em] opacity-80" dir="rtl">{todayWord.root}</span>
            <span className="opacity-40">|</span>
            <span>{t('wordOfTheDay.foundInQuran').replace('{count}', String(todayWord.quranCount))}</span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2.5 px-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/25 to-transparent" />
            <EightPointStar className="w-2 h-2 text-[hsl(var(--gold))] opacity-40" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/25 to-transparent" />
          </div>

          {/* Example verse — compact */}
          <div className="space-y-1">
            <p className="text-sm arabic-text leading-relaxed text-foreground/85" dir="rtl">
              {todayWord.exampleArabic}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {exampleTranslation}
            </p>
            <p className="text-[11px] font-medium text-[hsl(var(--gold))] opacity-80">
              {todayWord.exampleRef}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
