import { useMemo } from 'react';
import { getDailyVerse } from '../../data/dailyVerses';
import { useTranslation } from '../../i18n/useTranslation';

export const DailyVerse = () => {
  const { t, language } = useTranslation();
  const verse = useMemo(() => getDailyVerse(), []);

  const translation = language === 'bn' ? verse.translationBn
    : language === 'ar' ? verse.translation
    : verse.translation;

  const typeLabel = verse.type === 'ayah' ? t('dailyVerse.ayah') : t('dailyVerse.hadith');

  return (
    <div className="islamic-border rounded-xl overflow-hidden fade-in">
      <div
        className="relative px-3 py-2.5 sm:px-4 sm:py-3 overflow-hidden"
        style={{
          background: verse.type === 'ayah'
            ? 'linear-gradient(135deg, hsl(158,50%,16%) 0%, hsl(160,45%,22%) 50%, hsl(155,50%,14%) 100%)'
            : 'linear-gradient(135deg, hsl(222,30%,14%) 0%, hsl(225,28%,20%) 50%, hsl(220,30%,12%) 100%)',
        }}
      >
        {/* Tessellation overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8a84e' stroke-width='0.5'%3E%3Cpath d='M30 0L37.5 7.5L30 15L22.5 7.5Z'/%3E%3Cpath d='M30 15L37.5 22.5L30 30L22.5 22.5Z'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative corner arabesque */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 opacity-[0.08] pointer-events-none">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M80 0L60 10L70 20Z" fill="rgba(200,168,78,0.5)" />
            <path d="M80 0L40 5L45 15L65 35L75 40Z" fill="rgba(200,168,78,0.3)" />
            <circle cx="60" cy="20" r="3" fill="rgba(200,168,78,0.4)" />
          </svg>
        </div>

        {/* Bottom left arabesque */}
        <div className="absolute bottom-0 left-0 w-14 h-14 sm:w-16 sm:h-16 opacity-[0.06] pointer-events-none rotate-180">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M80 0L60 10L70 20Z" fill="rgba(200,168,78,0.5)" />
            <path d="M80 0L40 5L45 15L65 35L75 40Z" fill="rgba(200,168,78,0.3)" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center shrink-0" style={{
                background: 'rgba(200,168,78,0.12)',
                border: '1px solid rgba(200,168,78,0.2)',
              }}>
                {verse.type === 'ayah' ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                    <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" stroke="rgba(200,168,78,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                    <path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.2 48.2 0 0 0 5.023-.458c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.009Z" stroke="rgba(200,168,78,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-white/90">{t('dailyVerse.title')}</p>
            </div>
            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{
              background: 'rgba(200,168,78,0.15)',
              color: 'rgba(200,168,78,0.9)',
              border: '1px solid rgba(200,168,78,0.2)',
            }}>
              {typeLabel}
            </span>
          </div>

          {/* Arabic text */}
          <p className="text-sm sm:text-base leading-relaxed text-white/90 arabic-text text-center mb-2 px-1" dir="rtl">
            {verse.arabic}
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(200,168,78,0.3)] to-transparent" />
            <svg viewBox="0 0 16 16" className="w-1.5 h-1.5 text-[rgba(200,168,78,0.5)]">
              <path d="M8 0L9.5 5.5L16 8L9.5 10.5L8 16L6.5 10.5L0 8L6.5 5.5Z" fill="currentColor" />
            </svg>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(200,168,78,0.3)] to-transparent" />
          </div>

          {/* Translation */}
          <p className="text-xs sm:text-sm text-white/70 text-center leading-snug italic mb-1 px-1">
            &ldquo;{translation}&rdquo;
          </p>

          {/* Reference */}
          <p className="text-[9px] sm:text-[10px] text-center font-medium" style={{ color: 'rgba(200,168,78,0.7)' }}>
            — {verse.reference}
          </p>
        </div>
      </div>
      <div className="gold-border-strip" />
    </div>
  );
};
