import { useEffect, useState, type ReactNode } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { isNativePlatform } from '../services/platformService';
import { CALCULATION_METHODS } from '../services/prayerService';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';
import { MonthlySchedule } from '../components/MonthlySchedule';
import { PrayerComparison } from '../components/explore/PrayerComparison';
import { AthanGlobe } from '../components/explore/AthanGlobe';
import { Icon, CrescentMark, type IconName } from './icons';
import { ToastProvider, PageHead, Segmented } from './shared';
import { TodayScreen } from './screens/Today';
import { QiblaScreen } from './screens/Qibla';
import { FastingScreen } from './screens/Fasting';
import { CalendarScreen } from './screens/Calendar';
import { DuasScreen } from './screens/Duas';
import { SettingsScreen } from './screens/Settings';

export type Route = 'today' | 'qibla' | 'fasting' | 'calendar' | 'duas' | 'schedule' | 'explore' | 'settings' | 'more';
const ROUTES: Route[] = ['today', 'qibla', 'fasting', 'calendar', 'duas', 'schedule', 'explore', 'settings', 'more'];
const SIDE: Route[] = ['today', 'qibla', 'fasting', 'calendar', 'duas', 'schedule', 'explore', 'settings'];
const TABS: Route[] = ['today', 'qibla', 'fasting', 'duas', 'more'];
const UNDER_MORE: Route[] = ['more', 'calendar', 'schedule', 'explore', 'settings'];

const fromHash = (): Route => { const h = location.hash.slice(1) as Route; return ROUTES.includes(h) ? h : 'today'; };

function ExploreScreen() {
  const { t } = useTranslation();
  const [view, setView] = useState<'comparison' | 'globe'>('comparison');
  return (
    <>
      <PageHead title={t('ui.nav.explore')} subtitle={t('ui.more.exploreSub')}>
        <Segmented label={t('ui.nav.explore')} value={view} onChange={setView} options={[{ value: 'comparison', label: t('explore.tabComparison') }, { value: 'globe', label: t('explore.tabGlobe') }]} />
      </PageHead>
      <div className="fl-legacy">{view === 'comparison' ? <PrayerComparison /> : <AthanGlobe />}</div>
    </>
  );
}

function MoreScreen({ go }: { go: (r: Route) => void }) {
  const { t } = useTranslation();
  const items: { r: Route; icon: IconName; sub: string; tone: string }[] = [
    { r: 'calendar', icon: 'calendar', sub: t('ui.more.calendarSub'), tone: 'var(--gold-soft)' },
    { r: 'schedule', icon: 'schedule', sub: t('ui.more.scheduleSub'), tone: 'var(--emerald-soft)' },
    { r: 'explore', icon: 'explore', sub: t('ui.more.exploreSub'), tone: 'var(--surface)' },
    { r: 'settings', icon: 'settings', sub: t('ui.more.settingsSub'), tone: 'var(--surface)' },
  ];
  return (
    <>
      <PageHead title={t('ui.nav.more')} />
      <div className="fl-card">
        {items.map((it) => (
          <button key={it.r} type="button" className="fl-row" onClick={() => go(it.r)}>
            <span className="fl-iconbtn" style={{ background: it.tone, color: 'var(--ink)' }}><Icon name={it.icon} /></span>
            <div className="lt"><b>{t(`ui.nav.${it.r}` as 'ui.nav.today')}</b><span>{it.sub}</span></div>
            <Icon name="chev" className="fl-chev" />
          </button>
        ))}
      </div>
    </>
  );
}

export function AppShell({ locationPrompt }: { locationPrompt?: ReactNode }) {
  const { t } = useTranslation();
  const location = useStore((s) => s.location);
  const method = useStore((s) => s.calculationMethod);
  const [route, setRoute] = useState<Route>(fromHash);
  const [history, setHistory] = useState<Route[]>([fromHash()]);

  const go = (r: Route) => {
    setRoute(r);
    setHistory((h) => (h[h.length - 1] === r ? h : [...h.slice(-19), r]));
    window.history.replaceState(null, '', `#${r}`);
    window.scrollTo(0, 0);
  };

  // phone-only "More" page has no meaning on wide screens
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const fix = () => { if (mq.matches && route === 'more') go('today'); };
    fix();
    mq.addEventListener('change', fix);
    return () => mq.removeEventListener('change', fix);
  }, [route]);

  // Android back button: previous screen, then Today, then exit
  useEffect(() => {
    if (!isNativePlatform()) return;
    let handle: { remove: () => void } | undefined;
    let cancelled = false;
    CapacitorApp.addListener('backButton', () => {
      if (history.length > 1) {
        const h = history.slice(0, -1);
        setHistory(h);
        setRoute(h[h.length - 1]);
        return;
      }
      if (route !== 'today') { setHistory(['today']); setRoute('today'); return; }
      CapacitorApp.exitApp();
    }).then((h) => { if (cancelled) h.remove(); else handle = h; });
    return () => { cancelled = true; handle?.remove(); };
  }, [history, route]);

  const label = (r: Route) => t(`ui.nav.${r}` as 'ui.nav.today');
  const methodName = CALCULATION_METHODS.find((m) => m.id === method)?.name ?? method;
  let screen: ReactNode;
  if (!location) screen = locationPrompt;
  else if (route === 'today') screen = <TodayScreen onOpenSettings={() => go('settings')} onNavigate={go} />;
  else if (route === 'qibla') screen = <QiblaScreen />;
  else if (route === 'fasting') screen = <FastingScreen onOpenSettings={() => go('settings')} />;
  else if (route === 'calendar') screen = <CalendarScreen />;
  else if (route === 'duas') screen = <DuasScreen />;
  else if (route === 'schedule') screen = <><PageHead title={label('schedule')} subtitle={t('ui.more.scheduleSub')} /><div className="fl-legacy"><MonthlySchedule /></div></>;
  else if (route === 'explore') screen = <ExploreScreen />;
  else if (route === 'settings') screen = <SettingsScreen />;
  else screen = <MoreScreen go={go} />;

  return (
    <div className="fl">
      <ToastProvider>
        <div className="fl-shell">
          <aside className="fl-side" aria-label={t('ui.nav.main')}>
            <div className="fl-brand">
              <span className="fl-mark"><CrescentMark /></span>
              <div><b>{t('common.appName')}</b><span lang="ar">فلاح</span></div>
            </div>
            <nav style={{ display: 'grid', gap: 4 }}>
              {SIDE.map((r) => (
                <button key={r} type="button" className="fl-nav" aria-current={route === r ? 'page' : undefined} onClick={() => go(r)}>
                  <Icon name={r as IconName} />{label(r)}
                </button>
              ))}
            </nav>
            <div className="grow" />
            {location && (
              <button type="button" className="fl-loc-card" onClick={() => go('settings')}>
                <b>{location.name}</b>
                <span>{methodName}</span>
              </button>
            )}
          </aside>
          <main className="fl-main">
            <div className="fl-page">{screen}</div>
          </main>
        </div>
        {location && (
          <nav className="fl-tabbar" aria-label={t('ui.nav.main')}>
            {TABS.map((r) => {
              const on = r === route || (r === 'more' && UNDER_MORE.includes(route));
              return (
                <button key={r} type="button" className="fl-tab" aria-current={on ? 'page' : undefined} onClick={() => go(r)}>
                  <Icon name={r as IconName} />{label(r)}
                </button>
              );
            })}
          </nav>
        )}
      </ToastProvider>
    </div>
  );
}
