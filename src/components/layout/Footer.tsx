import { useState } from 'react';
import { Heart, ExternalLink, Code2, Globe, ChevronDown, Sparkles, Star } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

// Crescent Star Icon
const CrescentStarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-primary">
    <path d="M12 3a9 9 0 0 0 9 9 9 9 0 0 1-9 9 9 9 0 0 1 0-18z" />
    <path d="M16 8l.5 1.5L18 10l-1.5.5L16 12l-.5-1.5L14 10l1.5-.5L16 8z" fill="currentColor" opacity="0.8" />
  </svg>
);

// 8-Pointed Star SVG
const EightPointedStar = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 0l2.5 7.5L22 7.5l-5.5 4L19 19l-7-4.5L5 19l2.5-7.5L2 7.5l7.5 0z" opacity="0.8" />
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
  {
    name: 'Awqat',
    url: 'https://awqat-dev.vercel.app',
    description: 'Design shareable prayer & fasting timetables',
  },
];

type SectionId = 'about' | 'powered' | 'features' | 'developer';

export const Footer = () => {
  const { t } = useTranslation();
  // Mobile-only collapsible state — closed by default. Desktop ignores this.
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set());
  const isOpen = (id: SectionId) => openSections.has(id);
  const toggle = (id: SectionId) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const SectionHeader = ({
    id,
    children,
  }: {
    id: SectionId;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => toggle(id)}
      className="w-full flex items-center justify-between gap-2 lg:cursor-default lg:pointer-events-none"
      aria-expanded={isOpen(id)}
    >
      <span className="flex items-center gap-1.5 text-sm font-semibold font-display text-foreground">
        {children}
      </span>
      <ChevronDown
        className={`h-4 w-4 text-muted-foreground lg:hidden transition-transform ${
          isOpen(id) ? 'rotate-180' : ''
        }`}
      />
    </button>
  );

  const sectionBody = (id: SectionId) =>
    `${isOpen(id) ? 'block' : 'hidden'} lg:block mt-2`;

  return (
    <footer className="relative mt-10 border-t border-border/70 bg-card/30 backdrop-blur-sm">
      <div className="container px-4 py-6 sm:py-8">
        {/* Top grid — 2 cols on mobile to halve height, 4 on desktop */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {/* About */}
          <div>
            <SectionHeader id="about">
              <CrescentStarIcon />
              {t('common.appName')}
            </SectionHeader>
            <p className={`${sectionBody('about')} text-muted-foreground text-xs leading-relaxed`}>
              {t('footer.about')}
            </p>
          </div>

          {/* Powered By */}
          <div>
            <SectionHeader id="powered">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t('footer.poweredBy')}
            </SectionHeader>
            <div className={`${sectionBody('powered')} space-y-1.5`}>
              <div>
                <a
                  href="https://github.com/batoulapps/adhan-js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 transition-colors text-xs font-medium"
                >
                  {t('footer.adhanLibrary')}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-muted-foreground/80 text-[11px]">
                  {t('footer.adhanLibraryDesc')}
                </p>
              </div>
              <div>
                <a
                  href="https://github.com/AliYmn/hijri-converter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 transition-colors text-xs font-medium"
                >
                  {t('footer.hijriConverter')}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-muted-foreground/80 text-[11px]">
                  {t('footer.hijriConverterDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <SectionHeader id="features">
              <Star className="h-3.5 w-3.5 text-primary" />
              {t('footer.features')}
            </SectionHeader>
            <ul className={`${sectionBody('features')} space-y-1 text-[11px] text-muted-foreground`}>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rotate-45 bg-secondary/70 shrink-0" />
                {t('footer.featureAccurate')}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rotate-45 bg-secondary/70 shrink-0" />
                {t('footer.featureMethods')}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rotate-45 bg-secondary/70 shrink-0" />
                {t('footer.featureQibla')}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rotate-45 bg-secondary/70 shrink-0" />
                {t('footer.featureFasting')}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rotate-45 bg-secondary/70 shrink-0" />
                {t('footer.featureOffline')}
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div>
            <SectionHeader id="developer">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              {t('footer.developer')}
            </SectionHeader>
            <div className={sectionBody('developer')}>
              <p className="text-muted-foreground text-[11px] leading-relaxed mb-2">
                {t('footer.developerDesc')}
              </p>
              <div className="space-y-1.5">
                <a
                  href="https://my-portfolio-seven-delta-60.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 transition-colors text-xs font-medium"
                >
                  <Globe className="h-3 w-3" />
                  {t('footer.portfolio')}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {developerProjects.map((project) => (
                    <a
                      key={project.name}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-secondary transition-colors text-[11px]"
                      title={project.description}
                    >
                      <span className="w-1.5 h-1.5 rotate-45 bg-secondary/50 shrink-0" />
                      {project.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arabesque Divider with 8-pointed star */}
        <div className="islamic-divider my-3 sm:my-4">
          <span className="px-3 text-primary/70">
            <EightPointedStar />
          </span>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <p className="flex items-center gap-1.5">
            {t('footer.madeWith')} <Heart className="h-3 w-3 text-red-400 fill-red-400" /> {t('footer.forUmmah')}
          </p>
          <p className="arabic-text text-sm text-muted-foreground/70">بسم الله الرحمن الرحيم</p>
          <p>
            &copy; {new Date().getFullYear()} {t('common.appName')}
          </p>
        </div>

        {/* Attribution */}
        <div className="mt-3 text-center text-[10px] text-muted-foreground/60">
          {t('footer.attribution')}{' '}
          <a
            href="https://github.com/batoulapps/adhan-js"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary/70 hover:underline"
          >
            Adhan
          </a>
          {' '}&middot;{' '}
          {t('footer.hijriDatesBy')}{' '}
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
    </footer>
  );
};
