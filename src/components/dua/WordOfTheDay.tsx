import { useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { quranWords } from '../../data/quranWords';
import { useTranslation } from '../../i18n/useTranslation';

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
    <Card className="fade-in">
      {/* faint heritage watermark, top-right */}
      <div className="girih-watermark pointer-events-none absolute right-3 top-3 h-16 w-16 sm:h-20 sm:w-20" />

      <CardContent className="relative px-4 py-4 sm:px-6 sm:py-5">
        <p className="label-mono !text-secondary">{t('wordOfTheDay.title')}</p>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          {/* ── LEFT: the word (hero) ── */}
          <div className="flex-1 text-center sm:text-start">
            <p className="arabic-text text-4xl font-semibold leading-snug text-primary sm:text-5xl" dir="rtl">
              {todayWord.word}
            </p>
            <p className="mt-1.5 text-sm font-medium italic text-secondary sm:text-base">
              {todayWord.transliteration} —{' '}
              <span className="font-semibold not-italic text-foreground">{meaning}</span>
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground sm:justify-start">
              <span className="arabic-text tracking-[0.2em] opacity-80" dir="rtl">{todayWord.root}</span>
              <span className="opacity-40">|</span>
              <span>{t('wordOfTheDay.foundInQuran').replace('{count}', String(todayWord.quranCount))}</span>
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div className="heritage-rule sm:hidden" />
          <div className="hidden w-px self-stretch bg-gradient-to-b from-transparent via-border to-transparent sm:block" />

          {/* ── RIGHT: example verse ── */}
          <div className="flex-1 space-y-1.5 text-center sm:text-end">
            <p className="arabic-text text-base leading-relaxed text-foreground/90 sm:text-lg" dir="rtl">
              {todayWord.exampleArabic}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {exampleTranslation}
            </p>
            <p className="label-mono !text-primary">{todayWord.exampleRef}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
