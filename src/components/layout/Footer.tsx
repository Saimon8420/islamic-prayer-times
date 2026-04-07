import { useState } from 'react';
import { Heart, ExternalLink, Code2, Globe, ChevronDown, Sparkles, Star } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

// Crescent Star Icon
const CrescentStarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
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
      <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
        {children}
      </span>
      <ChevronDown
        className={`h-4 w-4 text-white/60 lg:hidden transition-transform ${
          isOpen(id) ? 'rotate-180' : ''
        }`}
      />
    </button>
  );

  const sectionBody = (id: SectionId) =>
    `${isOpen(id) ? 'block' : 'hidden'} lg:block mt-2`;

  return (
    <footer className="relative overflow-hidden">
      {/* Ornamental gold border strip */}
      <div className="gold-border-strip" />

      {/* Mosque skyline silhouette transition */}
      <div className="islamic-gradient-header relative">
        {/* Mosque skyline at top of footer */}
        <div className="absolute top-0 left-0 right-0 h-10 overflow-hidden">
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-full" fill="rgba(200,168,78,0.08)">
            <path d="M0,40 L0,30 L60,30 L60,20 Q75,5 90,20 L90,30 L150,30 L150,18 L154,8 L158,18 L158,30 L250,30 Q270,30 280,22 Q300,8 320,22 Q330,30 350,30 L420,30 L420,16 L424,6 L428,16 L428,30 L520,30 L540,24 Q560,12 580,24 L600,30 L680,30 Q700,30 710,22 Q730,5 750,22 Q760,30 780,30 L840,30 L840,18 L844,6 L848,18 L848,30 L940,30 L960,24 Q980,12 1000,24 L1020,30 L1100,30 L1100,20 Q1115,5 1130,20 L1130,30 L1200,30 L1200,40 Z" />
          </svg>
        </div>

        <div className="container px-4 py-4 pt-10 sm:py-6 sm:pt-12">
          {/* Top grid — 2 cols on mobile to halve height, 4 on desktop */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {/* About */}
            <div>
              <SectionHeader id="about">
                <CrescentStarIcon />
                {t('common.appName')}
              </SectionHeader>
              <p className={`${sectionBody('about')} text-white/60 text-xs leading-relaxed`}>
                {t('footer.about')}
              </p>
            </div>

            {/* Powered By */}
            <div>
              <SectionHeader id="powered">
                <Sparkles className="h-3.5 w-3.5" />
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
                  <p className="text-white/50 text-[11px]">
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
                  <p className="text-white/50 text-[11px]">
                    {t('footer.hijriConverterDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <SectionHeader id="features">
                <Star className="h-3.5 w-3.5" />
                {t('footer.features')}
              </SectionHeader>
              <ul className={`${sectionBody('features')} space-y-1 text-[11px] text-white/60`}>
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
                <Code2 className="h-3.5 w-3.5" />
                {t('footer.developer')}
              </SectionHeader>
              <div className={sectionBody('developer')}>
              <p className="text-white/60 text-[11px] leading-relaxed mb-2">
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
                      className="inline-flex items-center gap-1 text-white/50 hover:text-secondary transition-colors text-[11px]"
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
          <div className="islamic-divider my-2 sm:my-4">
            <span className="px-3 text-secondary">
              <EightPointedStar />
            </span>
          </div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/50">
            <p className="flex items-center gap-1.5">
              {t('footer.madeWith')} <Heart className="h-3 w-3 text-red-400 fill-red-400" /> {t('footer.forUmmah')}
            </p>
            <p className="arabic-text text-sm text-white/40">بسم الله الرحمن الرحيم</p>
            <p>
              &copy; {new Date().getFullYear()} {t('common.appName')}
            </p>
          </div>

          {/* Attribution */}
          <div className="mt-3 text-center text-[10px] text-white/35">
            {t('footer.attribution')}{' '}
            <a
              href="https://github.com/batoulapps/adhan-js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary/60 hover:underline"
            >
              Adhan
            </a>
            {' '}&middot;{' '}
            {t('footer.hijriDatesBy')}{' '}
            <a
              href="https://github.com/AliYmn/hijri-converter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary/60 hover:underline"
            >
              hijri-converter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
