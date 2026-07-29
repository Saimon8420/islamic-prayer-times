import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  ShareableCard,
  SHARE_CARD_WIDTH,
  SHARE_CARD_HEIGHT,
  type SharePrayerRow,
} from './ShareableCard';
import {
  SHARE_BACKGROUNDS,
  DEFAULT_SHARE_BACKGROUND,
  getShareBackground,
  type ShareBackgroundId,
} from '../../data/shareBackgrounds';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useHijriDate } from '../../hooks/useHijriDate';
import { selectContextualVerse } from '../../services/verseSelectionService';
import {
  calculatePrayerTimes,
  getNextPrayer,
  formatPrayerTime,
  PRAYER_NAMES,
} from '../../services/prayerService';

interface ShareCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAIN_PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export const ShareCardDialog = ({ open, onOpenChange }: ShareCardDialogProps) => {
  const location = useStore((s) => s.location);
  const calculationMethod = useStore((s) => s.calculationMethod);
  const madhab = useStore((s) => s.madhab);
  const use24HourFormat = useStore((s) => s.use24HourFormat);
  const { t, language } = useTranslation();
  const { hijriDate } = useHijriDate();

  const [bgId, setBgId] = useState<ShareBackgroundId>(DEFAULT_SHARE_BACKGROUND);
  const [status, setStatus] = useState<'idle' | 'working' | 'saved' | 'failed'>('idle');

  const cardRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  // Fit the 1080px-wide card into whatever width the dialog gives us.
  useLayoutEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / SHARE_CARD_WIDTH);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const bg = getShareBackground(bgId);
  const locale = language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US';

  // ── Compute the card's data from the current app state ──
  const cardData = useMemo(() => {
    if (!location) return null;
    const now = new Date();
    const prayerTimes = calculatePrayerTimes(
      location.lat,
      location.lon,
      now,
      calculationMethod,
      madhab,
    );
    const next = getNextPrayer(location.lat, location.lon, calculationMethod, madhab);

    const timeMap: Record<(typeof MAIN_PRAYERS)[number], Date> = {
      Fajr: prayerTimes.fajr,
      Sunrise: prayerTimes.sunrise,
      Dhuhr: prayerTimes.dhuhr,
      Asr: prayerTimes.asr,
      Maghrib: prayerTimes.maghrib,
      Isha: prayerTimes.isha,
    };

    const prayers: SharePrayerRow[] = MAIN_PRAYERS.map((key) => {
      const names = PRAYER_NAMES[key];
      const name =
        language === 'bn'
          ? t(`prayer.names.${key}` as 'prayer.names.Fajr')
          : language === 'ar'
          ? names.ar
          : names.en;
      return {
        key,
        name,
        // Don't duplicate the Arabic label when the UI language is already Arabic.
        arabic: language === 'ar' ? '' : names.ar,
        time: formatPrayerTime(timeMap[key], use24HourFormat),
        isNext: next?.name === key,
      };
    });

    const gregorian = now.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const hijriMonth =
      language === 'ar'
        ? hijriDate.monthName.ar
        : language === 'bn'
        ? hijriDate.monthName.bn
        : hijriDate.monthName.en;
    const hijriEra = language === 'ar' ? 'هـ' : language === 'bn' ? 'হিজরি' : 'AH';
    const hijri = `${hijriDate.day} ${hijriMonth} ${hijriDate.year} ${hijriEra}`;

    const selection = selectContextualVerse(now, prayerTimes, hijriDate);
    const verse = selection
      ? {
          arabic: selection.verse.arabic,
          translation:
            language === 'bn'
              ? selection.verse.translationBn
              : selection.verse.translation,
          reference: selection.verse.reference.trim(),
        }
      : null;

    return { prayers, gregorian, hijri, verse };
  }, [
    location,
    calculationMethod,
    madhab,
    use24HourFormat,
    language,
    locale,
    hijriDate,
    t,
  ]);

  const locationName = location?.name || t('common.unknownLocation');

  const filename = 'falah-prayer-times.png';

  const generateBlob = useCallback(async (): Promise<Blob | null> => {
    const node = cardRef.current;
    if (!node) return null;
    // Ensure Arabic/Bengali webfonts are ready before rasterizing.
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* non-fatal */
      }
    }
    return toBlob(node, {
      width: SHARE_CARD_WIDTH,
      height: SHARE_CARD_HEIGHT,
      pixelRatio: 1,
      cacheBust: true,
    });
  }, []);

  const buildText = useCallback((): string => {
    if (!cardData) return '';
    const line = '─────────────────────────';
    const rows = cardData.prayers.map((p) => {
      const label = p.arabic ? `${p.name}` : p.name;
      const dots = '·'.repeat(Math.max(2, 20 - label.length - p.time.length));
      return `${label} ${dots} ${p.time}`;
    });
    return [
      `🕌 ${t('share.title')} — Falah`,
      line,
      cardData.gregorian,
      cardData.hijri,
      `📍 ${locationName}`,
      line,
      ...rows,
      ...(cardData.verse
        ? [line, `"${cardData.verse.translation}" — ${cardData.verse.reference}`]
        : []),
    ].join('\n');
  }, [cardData, locationName, t]);

  const flash = (next: 'saved' | 'failed') => {
    setStatus(next);
    setTimeout(() => setStatus('idle'), 2200);
  };

  const handleShareImage = useCallback(async () => {
    setStatus('working');
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error('no blob');
      const file = new File([blob], filename, { type: 'image/png' });
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: t('share.title'),
          text: buildText(),
        });
        setStatus('idle');
      } else {
        // Fallback: download the PNG
        triggerDownload(blob);
        flash('saved');
      }
    } catch (err) {
      // AbortError = user dismissed the share sheet; not a failure.
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      flash('failed');
    }
  }, [generateBlob, buildText, t]);

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownload = useCallback(async () => {
    setStatus('working');
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error('no blob');
      triggerDownload(blob);
      flash('saved');
    } catch {
      flash('failed');
    }
  }, [generateBlob]);

  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildText());
      flash('saved');
    } catch {
      flash('failed');
    }
  }, [buildText]);

  const busy = status === 'working';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('share.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('share.dialogDescription')}</DialogDescription>
        </DialogHeader>

        {cardData ? (
          <>
            {/* Live preview */}
            <div
              ref={viewportRef}
              className="mx-auto w-full max-w-[320px] rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10"
              style={{ height: SHARE_CARD_HEIGHT * scale }}
            >
              <div
                style={{
                  width: SHARE_CARD_WIDTH,
                  height: SHARE_CARD_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                <ShareableCard
                  ref={cardRef}
                  bg={bg}
                  language={language}
                  brand="Falah"
                  tagline={t('share.title')}
                  gregorian={cardData.gregorian}
                  hijri={cardData.hijri}
                  location={locationName}
                  prayers={cardData.prayers}
                  verse={cardData.verse}
                  footer={t('share.cardFooter')}
                />
              </div>
            </div>

            {/* Background picker */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {t('share.chooseBackground')}
              </p>
              <div className="flex items-center gap-2.5">
                {SHARE_BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBgId(b.id)}
                    title={t(`share.bg.${b.id}` as 'share.bg.emerald')}
                    aria-label={t(`share.bg.${b.id}` as 'share.bg.emerald')}
                    className={
                      'h-10 w-10 rounded-full transition-all ' +
                      (bgId === b.id
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                        : 'ring-1 ring-black/10 hover:scale-105')
                    }
                    style={{ background: b.swatch }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleShareImage}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="5.8" y1="7" x2="10.2" y2="4" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="5.8" y1="9" x2="10.2" y2="12" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {busy
                  ? t('share.preparing')
                  : status === 'saved'
                  ? t('share.saved')
                  : status === 'failed'
                  ? t('share.failed')
                  : t('share.shareImage')}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg border border-border bg-muted/40 font-medium hover:bg-muted active:scale-[0.99] transition disabled:opacity-60"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                    <path d="M8 1v9M4.5 7L8 10.5 11.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.5 12.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {t('share.download')}
                </button>
                <button
                  type="button"
                  onClick={handleCopyText}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg border border-border bg-muted/40 font-medium hover:bg-muted active:scale-[0.99] transition disabled:opacity-60"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                    <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  {t('share.copyText')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {t('common.unknownLocation')}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
