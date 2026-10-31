/**
 * Share-card background themes.
 *
 * Each theme is a self-contained palette used by <ShareableCard> to render a
 * 1080×1350 (4:5 portrait) image. Colors are explicit (hex/rgba) — never theme
 * CSS variables — so the exported PNG looks identical regardless of whether the
 * app is in light or dark mode. Decorative motifs (skyline, crescent, stars) are
 * chosen per `id` inside ShareableCard.
 */

export type ShareBackgroundId = 'emerald' | 'midnight' | 'golden' | 'parchment' | 'ocean' | 'dusk' | 'sand' | 'paper';

export interface ShareBackground {
  id: ShareBackgroundId;
  /** English label; localized labels come from i18n share.bg.<id>. */
  label: string;
  /** CSS background for the whole card. */
  gradient: string;
  /** Primary text (headings, prayer names, times). */
  text: string;
  /** Secondary text (dates, references, captions). */
  muted: string;
  /** Gold accent for ornaments, dividers, the active highlight. */
  accent: string;
  /** Hairline color for borders and row separators. */
  hairline: string;
  /** Soft fill behind rows / verse panel. */
  panel: string;
  /** Small gradient shown in the picker swatch. */
  swatch: string;
}

export const SHARE_BACKGROUNDS: ShareBackground[] = [
  {
    id: 'emerald',
    label: 'Emerald',
    gradient: 'linear-gradient(160deg, #1B7A45 0%, #12603a 42%, #0C3D22 100%)',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.66)',
    accent: '#e6c565',
    hairline: 'rgba(230,197,101,0.28)',
    panel: 'rgba(255,255,255,0.06)',
    swatch: 'linear-gradient(160deg, #1B7A45, #0C3D22)',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    gradient: 'linear-gradient(165deg, #16264d 0%, #131a3a 45%, #0b1027 100%)',
    text: '#ffffff',
    muted: 'rgba(226,232,255,0.60)',
    accent: '#e8cd74',
    hairline: 'rgba(232,205,116,0.26)',
    panel: 'rgba(255,255,255,0.05)',
    swatch: 'linear-gradient(160deg, #1c2c57, #0b1027)',
  },
  {
    id: 'golden',
    label: 'Golden Hour',
    gradient: 'linear-gradient(165deg, #7a3b12 0%, #a85d1c 40%, #d68a34 78%, #e8a94b 100%)',
    text: '#fff8ec',
    muted: 'rgba(255,246,231,0.72)',
    accent: '#fff0c2',
    hairline: 'rgba(255,240,194,0.34)',
    panel: 'rgba(255,255,255,0.10)',
    swatch: 'linear-gradient(160deg, #a85d1c, #e8a94b)',
  },
  {
    id: 'parchment',
    label: 'Parchment',
    gradient: 'linear-gradient(165deg, #f6f0e2 0%, #efe6d1 50%, #e6d9bd 100%)',
    text: '#0c3d22',
    muted: 'rgba(12,61,34,0.62)',
    accent: '#a77b1e',
    hairline: 'rgba(167,123,30,0.30)',
    panel: 'rgba(12,61,34,0.045)',
    swatch: 'linear-gradient(160deg, #f6f0e2, #e6d9bd)',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    gradient: 'linear-gradient(165deg, #0e5a6b 0%, #0b4357 45%, #082a3d 100%)',
    text: '#ffffff',
    muted: 'rgba(220,244,248,0.66)',
    accent: '#7fe0d3',
    hairline: 'rgba(127,224,211,0.28)',
    panel: 'rgba(255,255,255,0.06)',
    swatch: 'linear-gradient(160deg, #0e5a6b, #082a3d)',
  },
  {
    id: 'dusk',
    label: 'Dusk',
    gradient: 'linear-gradient(170deg, #2b2460 0%, #6b3274 45%, #c0566e 82%, #e88a5c 100%)',
    text: '#ffffff',
    muted: 'rgba(255,236,240,0.72)',
    accent: '#ffd59e',
    hairline: 'rgba(255,213,158,0.32)',
    panel: 'rgba(255,255,255,0.09)',
    swatch: 'linear-gradient(160deg, #2b2460, #e88a5c)',
  },
  {
    id: 'sand',
    label: 'Sand',
    gradient: 'linear-gradient(165deg, #fbf3e4 0%, #f3e3c6 60%, #e9cfa3 100%)',
    text: '#3a2414',
    muted: 'rgba(58,36,20,0.62)',
    accent: '#b5651d',
    hairline: 'rgba(181,101,29,0.28)',
    panel: 'rgba(58,36,20,0.05)',
    swatch: 'linear-gradient(160deg, #fbf3e4, #e9cfa3)',
  },
  {
    id: 'paper',
    label: 'Paper',
    gradient: 'linear-gradient(180deg, #ffffff 0%, #f4f6fa 100%)',
    text: '#0f1b33',
    muted: 'rgba(15,27,51,0.58)',
    accent: '#0f7a52',
    hairline: 'rgba(15,27,51,0.12)',
    panel: 'rgba(15,122,82,0.07)',
    swatch: 'linear-gradient(160deg, #ffffff, #e6e9f0)',
  },
];

/** Light backgrounds need dark ornaments. */
export const isLightBackground = (id: ShareBackgroundId) => id === 'parchment' || id === 'sand' || id === 'paper';

export const DEFAULT_SHARE_BACKGROUND: ShareBackgroundId = 'emerald';

export function getShareBackground(id: ShareBackgroundId): ShareBackground {
  return SHARE_BACKGROUNDS.find((b) => b.id === id) ?? SHARE_BACKGROUNDS[0];
}
