/** Falah logo: an eight-point star (Rub el Hizb) with the sun rising inside it. */
const STAR = (() => {
  let d = '';
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2, r = i % 2 ? 28 * 0.76 : 28;
    d += `${i ? 'L' : 'M'}${(32 + r * Math.cos(a)).toFixed(2)} ${(32 + r * Math.sin(a)).toFixed(2)}`;
  }
  return d + 'Z';
})();

/** The mark alone, drawn in `color` with a gold sun. */
export function FalahMark({ size = 24, color = 'currentColor', sun = '#e3a13b' }: { size?: number; color?: string; sun?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" width={size} height={size}>
      <path d={STAR} fill="none" stroke={color} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M19 38a13 13 0 0 1 26 0Z" fill={sun} />
      <path d="M15 38h34" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 18v4M22.5 22l2.6 3M41.5 22l-2.6 3" stroke={sun} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** The app icon: the mark on the emerald badge. Same everywhere (sidebar, welcome, share card, launcher). */
export function FalahLogo({ size = 42 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: size * 0.28, flex: 'none',
        display: 'inline-grid', placeItems: 'center',
        background: 'linear-gradient(145deg, #0f7a52, #0b5c3e)',
        boxShadow: `0 ${size * 0.15}px ${size * 0.4}px -${size * 0.15}px rgba(11, 92, 62, .6)`,
      }}
    >
      <FalahMark size={size * 0.72} color="#ffffff" />
    </span>
  );
}
