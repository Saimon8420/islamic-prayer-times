import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { isLightBackground, type ShareBackground } from '../../data/shareBackgrounds';
import { FalahLogo } from '../FalahLogo';

/* ══════════════════════════════════════════════════════════
   ShareableCard — a fixed 1080×1350 (4:5 portrait) card that
   is rendered to a PNG via html-to-image. Purely presentational:
   every value arrives pre-formatted through props, and every color
   comes from the `bg` palette (never theme CSS vars) so the export
   looks identical in light or dark mode.
   ══════════════════════════════════════════════════════════ */

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

export type ShareSize = 'post' | 'story' | 'square';
export const SHARE_SIZES: Record<ShareSize, number> = { post: 1350, story: 1920, square: 1080 };

export interface ShareOptions {
  size: ShareSize;
  style: 'classic' | 'minimal';
  showVerse: boolean;
  showArabic: boolean;
  showHijri: boolean;
  message: string;
}

const LATIN_FONT =
  "'Manrope Variable', 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const ARABIC_FONT = "'Noto Sans Arabic', 'Scheherazade New', 'Amiri', serif";
const BENGALI_FONT = "'Noto Sans Bengali', 'Manrope Variable', system-ui, sans-serif";

export interface SharePrayerRow {
  key: string;
  name: string;
  arabic: string;
  time: string;
  isNext?: boolean;
}

export interface ShareVerse {
  arabic: string;
  translation: string;
  reference: string;
}

export interface ShareableCardProps {
  bg: ShareBackground;
  language: 'en' | 'bn' | 'ar';
  brand: string; // "Falah"
  tagline: string; // localized "Prayer Times"
  gregorian: string; // "Tuesday, July 8, 2026"
  hijri: string; // "23 Muharram 1448 AH"
  location: string;
  prayers: SharePrayerRow[];
  verse: ShareVerse | null;
  footer: string; // localized footer note
  options: ShareOptions;
}

const isLight = (bg: ShareBackground) => isLightBackground(bg.id);

const ArabesqueCorner = ({
  accent,
  style,
}: {
  accent: string;
  style?: CSSProperties;
}) => (
  <svg viewBox="0 0 120 120" width={120} height={120} fill="none" style={style} aria-hidden>
    <path d="M0 0L34 16L16 34Z" fill={accent} opacity={0.32} />
    <path d="M0 0L62 8L54 24L24 54L8 62Z" fill={accent} opacity={0.14} />
    <path
      d="M62 8L54 24L78 30L92 16Z"
      stroke={accent}
      strokeWidth={0.8}
      opacity={0.28}
      fill="none"
    />
    <circle cx={30} cy={30} r={5} fill={accent} opacity={0.28} />
    <circle cx={30} cy={30} r={9} stroke={accent} strokeWidth={0.8} opacity={0.2} fill="none" />
  </svg>
);

const StarDivider = ({ accent }: { accent: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 16 }}>
    <div
      style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(to right, transparent, ${accent}66)`,
      }}
    />
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden>
      <path
        d="M12 0L14.2 8.2L24 12L14.2 15.8L12 24L9.8 15.8L0 12L9.8 8.2Z"
        fill={accent}
        opacity={0.7}
      />
    </svg>
    <div
      style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(to left, transparent, ${accent}66)`,
      }}
    />
  </div>
);

/* ── Bottom decoration chosen per background id ── */
const BottomDecoration = ({ bg }: { bg: ShareBackground }) => {
  if (bg.id === 'paper') return null;
  if (bg.id === 'midnight' || bg.id === 'ocean') {
    // Crescent + scattered stars
    return (
      <svg
        viewBox="0 0 1080 220"
        width={SHARE_CARD_WIDTH}
        height={220}
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, pointerEvents: 'none' }}
        aria-hidden
      >
        <path
          d="M905 70a58 58 0 1 0 40 100 46 46 0 1 1-40-100z"
          fill={bg.accent}
          opacity={0.16}
        />
        {[
          [140, 120],
          [250, 70],
          [360, 140],
          [470, 90],
          [610, 130],
          [720, 80],
          [820, 150],
        ].map(([cx, cy], i) => (
          <path
            key={i}
            d={`M${cx} ${cy - 7}l2 5 5 2-5 2-2 5-2-5-5-2 5-2z`}
            fill={bg.accent}
            opacity={0.35}
          />
        ))}
      </svg>
    );
  }
  if (bg.id === 'golden' || bg.id === 'dusk') {
    // Soft sun glow rising from the base
    return (
      <div
        style={{
          position: 'absolute',
          bottom: -260,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 640,
          height: 640,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,244,214,0.55) 0%, rgba(255,244,214,0) 68%)',
          pointerEvents: 'none',
        }}
      />
    );
  }
  // emerald & parchment: mosque skyline silhouette
  return (
    <svg
      viewBox="0 0 1200 80"
      width={SHARE_CARD_WIDTH}
      height={130}
      preserveAspectRatio="none"
      style={{ position: 'absolute', bottom: 0, left: 0, pointerEvents: 'none' }}
      fill={isLight(bg) ? '#0c3d22' : '#ffffff'}
      fillOpacity={isLight(bg) ? 0.06 : 0.08}
      aria-hidden
    >
      <path d="M0,80 L0,60 L40,60 L40,40 L44,20 L48,40 L48,60 L80,60 L100,50 Q120,30 140,50 L160,60 L200,60 L200,45 L204,25 L208,45 L208,60 L280,60 Q300,60 310,50 Q330,25 350,50 Q360,60 380,60 L420,60 L420,40 L424,18 L428,40 L428,60 L500,60 L520,55 Q540,40 560,55 L580,60 L640,60 L640,45 L644,22 L648,45 L648,60 L700,60 Q720,60 730,50 Q760,20 790,50 Q800,60 820,60 L860,60 L860,38 L864,16 L868,38 L868,60 L940,60 L960,52 Q980,35 1000,52 L1020,60 L1060,60 L1060,42 L1064,22 L1068,42 L1068,60 L1120,60 Q1140,60 1150,50 Q1170,30 1190,50 L1200,60 L1200,80 Z" />
    </svg>
  );
};

export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ bg, language, brand, tagline, gregorian, hijri, location, prayers, verse, footer, options }, ref) => {
    const latin = language === 'bn' ? BENGALI_FONT : LATIN_FONT;
    const height = SHARE_SIZES[options.size];
    const square = options.size === 'square', story = options.size === 'story';
    const classic = options.style === 'classic';
    const rowPad = square ? '11px 26px' : story ? '24px 30px' : '17px 26px';
    const showVerse = options.showVerse && !!verse && !square;

    return (
      <div
        ref={ref}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        style={{
          position: 'relative',
          width: SHARE_CARD_WIDTH,
          height,
          overflow: 'hidden',
          background: bg.gradient,
          color: bg.text,
          fontFamily: latin,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding: square ? '52px 64px 44px' : '64px 64px 56px',
          justifyContent: story ? 'center' : undefined,
        }}
      >
        {classic && (
          <>
        {/* Corner ornaments */}
            <ArabesqueCorner accent={bg.accent} style={{ position: 'absolute', top: 0, left: 0 }} />
            <ArabesqueCorner
              accent={bg.accent}
              style={{ position: 'absolute', top: 0, right: 0, transform: 'scaleX(-1)' }}
            />
            <BottomDecoration bg={bg} />
    
            {/* Thin gold frame */}
            <div
              style={{
                position: 'absolute',
                inset: 28,
                border: `1px solid ${bg.hairline}`,
                borderRadius: 24,
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* ── Brand ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            marginBottom: 8,
          }}
        >
          <FalahLogo size={square ? 70 : 84} />
          <div style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
            <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.1 }}>
              {brand}
            </div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 500,
                color: bg.accent,
                letterSpacing: 3,
                textTransform: 'uppercase',
              }}
            >
              {tagline}
            </div>
          </div>
        </div>

        {/* ── Date + location ── */}
        <div style={{ position: 'relative', textAlign: 'center', marginTop: 18 }}>
          <div style={{ fontSize: 30, fontWeight: 600 }}>{gregorian}</div>
          {options.showHijri && <div style={{ fontSize: 23, color: bg.muted, marginTop: 6 }}>{hijri}</div>}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              marginTop: 16,
              padding: '8px 20px',
              borderRadius: 999,
              background: bg.panel,
              border: `1px solid ${bg.hairline}`,
              fontSize: 23,
              fontWeight: 500,
            }}
          >
            <svg viewBox="0 0 16 16" width={19} height={19} aria-hidden>
              <path
                d="M8 1C4.7 1 2 3.7 2 7c0 4.5 6 8 6 8s6-3.5 6-8c0-3.3-2.7-6-6-6zm0 8.5A2.5 2.5 0 1 1 8 4.5a2.5 2.5 0 0 1 0 5z"
                fill={bg.accent}
              />
            </svg>
            {location}
          </div>
        </div>

        {options.message.trim() && (
          <div style={{ position: 'relative', textAlign: 'center', marginTop: 22, fontSize: square ? 34 : 40, fontWeight: 800, color: bg.accent, lineHeight: 1.25 }}>
            {options.message.trim()}
          </div>
        )}

        <div style={{ position: 'relative', margin: square ? '18px 0 12px' : '26px 0 20px' }}>
          {classic ? <StarDivider accent={bg.accent} /> : <div style={{ height: 1, background: bg.hairline }} />}
        </div>

        {/* ── Prayer times ── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {prayers.map((p, i) => (
            <div
              key={p.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: rowPad,
                borderRadius: 16,
                background: p.isNext ? bg.panel : 'transparent',
                border: p.isNext ? `1px solid ${bg.hairline}` : '1px solid transparent',
                marginTop: i === 0 ? 0 : 4,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 33,
                    fontWeight: 600,
                    color: p.isNext ? bg.accent : bg.text,
                  }}
                >
                  {p.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                <span
                  style={{
                    fontFamily: ARABIC_FONT,
                    direction: 'rtl',
                    fontSize: 30,
                    color: bg.muted,
                  }}
                >
                  {options.showArabic ? p.arabic : ''}
                </span>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 168,
                    textAlign: language === 'ar' ? 'left' : 'right',
                    color: p.isNext ? bg.accent : bg.text,
                  }}
                >
                  {p.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Verse of the day ── */}
        {showVerse && verse && (
          <>
            <div style={{ position: 'relative', margin: '22px 0 18px' }}>
              {classic ? <StarDivider accent={bg.accent} /> : <div style={{ height: 1, background: bg.hairline }} />}
            </div>
            <div
              style={{
                position: 'relative',
                textAlign: 'center',
                padding: '4px 12px',
              }}
            >
              <div
                style={{
                  fontFamily: ARABIC_FONT,
                  direction: 'rtl',
                  fontSize: 38,
                  lineHeight: 1.7,
                  color: bg.text,
                  marginBottom: 14,
                }}
              >
                {verse.arabic}
              </div>
              <div
                style={{
                  fontSize: 23,
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  color: bg.muted,
                }}
              >
                &ldquo;{verse.translation}&rdquo;
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: bg.accent,
                  marginTop: 10,
                }}
              >
                — {verse.reference}
              </div>
            </div>
          </>
        )}

        {/* ── Footer ── */}
        <div
          style={{
            position: 'relative',
            marginTop: story ? 48 : 'auto',
            paddingTop: 18,
            textAlign: 'center',
            fontSize: 18,
            color: bg.muted,
            letterSpacing: 0.4,
          }}
        >
          {footer}
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = 'ShareableCard';
