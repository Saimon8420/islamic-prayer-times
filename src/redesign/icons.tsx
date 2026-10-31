/** Outline icons for the redesigned screens (one family, one stroke width). */

const PATHS = {
  today: <><path d="M3 12h3M18 12h3M12 3v3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1" /><path d="M7 17a5 5 0 0 1 10 0" /><path d="M3 21h18" /></>,
  qibla: <><path d="M12 3 4 7v10l8 4 8-4V7z" /><path d="m4 7 8 4 8-4M12 11v10" /><path d="m4 10.5 8 4 8-4" /></>,
  fasting: <><path d="M14 3a8 8 0 1 0 7 11.5A6.5 6.5 0 0 1 14 3Z" /><path d="m18.5 3.5.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" /></>,
  calendar: <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M14 13.2a3 3 0 1 0 1.8 3.8 2.4 2.4 0 0 1-1.8-3.8Z" /></>,
  duas: <><path d="M11 21V8.5a1.5 1.5 0 0 0-3 0V13l-2-2.5a1.4 1.4 0 0 0-2.2 1.8L7 17v4" /><path d="M13 21V8.5a1.5 1.5 0 0 1 3 0V13l2-2.5a1.4 1.4 0 0 1 2.2 1.8L17 17v4" /><path d="M12 2v2.5M9.5 3.5l.8 1.2M14.5 3.5l-.8 1.2" /></>,
  schedule: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></>,
  explore: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  more: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
  chev: <path d="m9 18 6-6-6-6" />,
  back: <path d="m15 18-6-6 6-6" />,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>,
  bellOff: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /><path d="m3 3 18 18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  bookmark: <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />,
  copy: <><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  rotl: <><path d="M3 12a9 9 0 1 0 9-9" /><path d="M3 3v6h6" /></>,
  rotr: <><path d="M21 12a9 9 0 1 1-9-9" /><path d="M21 3v6h-6" /></>,
  sunrise: <path d="M12 2v6M4.9 10.9l1.4 1.4M2 18h2M20 18h2M17.7 12.3l1.4-1.4M16 18a4 4 0 0 0-8 0M22 22H2M8 6l4-4 4 4" />,
  sunset: <path d="M12 10V2M4.9 10.9l1.4 1.4M2 18h2M20 18h2M17.7 12.3l1.4-1.4M16 18a4 4 0 0 0-8 0M22 22H2M16 6l-4 4-4-4" />,
  compass: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  play: <path d="M7 4v16l13-8z" />,
  stop: <rect width="12" height="12" x="6" y="6" rx="1" />,
  refresh: <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'fl-ico', filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}

export function FlameIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.8 2-5 .2 1.6 1 3 2.5 3.5C11 7 12 2 12 2Z" />
    </svg>
  );
}

/** Falah logo: an eight-point star (Rub el Hizb) with the sun rising inside it. */
export function CrescentMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64">
      <path d="M32.00 4.00L40.14 12.34L51.80 12.20L51.66 23.86L60.00 32.00L51.66 40.14L51.80 51.80L40.14 51.66L32.00 60.00L23.86 51.66L12.20 51.80L12.34 40.14L4.00 32.00L12.34 23.86L12.20 12.20L23.86 12.34Z" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinejoin="round" /><path d="M19 38a13 13 0 0 1 26 0Z" fill="#e3a13b" /><path d="M15 38h34" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /><path d="M32 18v4M22.5 22l2.6 3M41.5 22l-2.6 3" stroke="#e3a13b" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
