import { Heart, ExternalLink } from 'lucide-react';

// Crescent Star Icon
const CrescentStarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 3a9 9 0 0 0 9 9 9 9 0 0 1-9 9 9 9 0 0 1 0-18z" />
    <path d="M16 8l.5 1.5L18 10l-1.5.5L16 12l-.5-1.5L14 10l1.5-.5L16 8z" fill="currentColor" opacity="0.8" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 islamic-gradient-gold" />

      {/* Main footer */}
      <div className="islamic-gradient text-white">
        <div className="container px-4 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CrescentStarIcon />
                <h3 className="text-xl font-bold">Prayer Times</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                A comprehensive Islamic prayer times and fasting schedule application.
                Get accurate prayer times, Qibla direction, and fasting schedules for
                your location. All calculations are performed locally on your device.
              </p>
            </div>

            {/* Powered By */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Powered By
              </h3>
              <div className="space-y-2">
                <a
                  href="https://github.com/batoulapps/adhan-js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors"
                >
                  Adhan Library
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="text-white/70 text-sm">
                  Open-source library for accurate Islamic prayer time calculations.
                </p>
                <a
                  href="https://github.com/AliYmn/hijri-converter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors"
                >
                  hijri-converter
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="text-white/70 text-sm">
                  Accurate Hijri (Islamic) calendar date conversions.
                </p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Accurate prayer times based on location
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  12 calculation methods supported
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Qibla direction finder
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Fasting times (Sahur & Iftar)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Hijri calendar & White Days
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Offline-capable local calculations
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="islamic-divider my-8">
            <span className="px-4 text-secondary">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" fill="currentColor" />
              </svg>
            </span>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
            <p className="flex items-center gap-2">
              Made with <Heart className="h-4 w-4 text-red-400 fill-red-400" /> for the
              Muslim Ummah
            </p>
            <p className="arabic-text text-lg">بسم الله الرحمن الرحيم</p>
            <p>
              &copy; {new Date().getFullYear()} Prayer Times
            </p>
          </div>

          {/* Attribution */}
          <div className="mt-6 text-center text-xs text-white/50">
            Prayer times calculated using{' '}
            <a
              href="https://github.com/batoulapps/adhan-js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline"
            >
              Adhan
            </a>
            {' '}&middot;{' '}
            Hijri dates by{' '}
            <a
              href="https://github.com/AliYmn/hijri-converter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline"
            >
              hijri-converter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
