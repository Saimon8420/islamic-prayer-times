import { Heart, ExternalLink, Code2, Globe } from 'lucide-react';

// Crescent Star Icon
const CrescentStarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 3a9 9 0 0 0 9 9 9 9 0 0 1-9 9 9 9 0 0 1 0-18z" />
    <path d="M16 8l.5 1.5L18 10l-1.5.5L16 12l-.5-1.5L14 10l1.5-.5L16 8z" fill="currentColor" opacity="0.8" />
  </svg>
);

const developerProjects = [
  {
    name: 'Al Quran',
    url: 'https://al-quran-client-site-e1g4.vercel.app/',
    description: 'Complete Quran with translations',
  },
  {
    name: 'Hadith Explorer',
    url: 'https://hadith-explorer-bay.vercel.app/',
    description: 'Search & browse Hadith collections',
  },
];

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 islamic-gradient-gold" />

      {/* Main footer */}
      <div className="islamic-gradient text-white">
        <div className="container px-4 py-6">
          {/* Top grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CrescentStarIcon />
                <h3 className="text-base font-bold">Prayer Times</h3>
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                A comprehensive Islamic prayer times and fasting schedule application.
                Get accurate prayer times, Qibla direction, and fasting schedules for
                your location.
              </p>
            </div>

            {/* Powered By */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Powered By</h3>
              <div className="space-y-1.5">
                <div>
                  <a
                    href="https://github.com/batoulapps/adhan-js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 transition-colors text-xs font-medium"
                  >
                    Adhan Library
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-white/60 text-[11px]">
                    Islamic prayer time calculations
                  </p>
                </div>
                <div>
                  <a
                    href="https://github.com/AliYmn/hijri-converter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 transition-colors text-xs font-medium"
                  >
                    hijri-converter
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-white/60 text-[11px]">
                    Hijri calendar date conversions
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Features</h3>
              <ul className="space-y-1 text-[11px] text-white/70">
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                  Accurate prayer times based on location
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                  12 calculation methods supported
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                  Qibla direction finder
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                  Fasting times &amp; Hijri calendar
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                  Offline-capable local calculations
                </li>
              </ul>
            </div>

            {/* Developer */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5" />
                Developer
              </h3>
              <p className="text-white/70 text-[11px] leading-relaxed mb-2">
                Built with care by a passionate developer focused on creating meaningful
                Islamic web applications.
              </p>
              <div className="space-y-1.5">
                <a
                  href="https://my-portfolio-seven-delta-60.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 transition-colors text-xs font-medium"
                >
                  <Globe className="h-3 w-3" />
                  Portfolio
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {developerProjects.map((project) => (
                    <a
                      key={project.name}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/60 hover:text-secondary transition-colors text-[11px]"
                      title={project.description}
                    >
                      <span className="w-1 h-1 rounded-full bg-secondary/60 shrink-0" />
                      {project.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="islamic-divider my-4">
            <span className="px-3 text-secondary">
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" fill="currentColor" />
              </svg>
            </span>
          </div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/60">
            <p className="flex items-center gap-1.5">
              Made with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> for the
              Muslim Ummah
            </p>
            <p className="arabic-text text-sm">بسم الله الرحمن الرحيم</p>
            <p>
              &copy; {new Date().getFullYear()} Prayer Times
            </p>
          </div>

          {/* Attribution */}
          <div className="mt-3 text-center text-[10px] text-white/40">
            Prayer times calculated using{' '}
            <a
              href="https://github.com/batoulapps/adhan-js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary/70 hover:underline"
            >
              Adhan
            </a>
            {' '}&middot;{' '}
            Hijri dates by{' '}
            <a
              href="https://github.com/AliYmn/hijri-converter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary/70 hover:underline"
            >
              hijri-converter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
