import { useStore } from '../../store/useStore';
import { useTracker } from '../../store/useTracker';
import { getUpcomingWhiteDays } from '../../services/hijriService';
import { useTranslation } from '../../i18n/useTranslation';
import { Icon } from '../icons';
import { PageHead } from '../shared';
import { useNow, usePrayerDay, useFormatTime, useToast, hms, localeFor } from '../lib';

export function FastingScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { t, language } = useTranslation();
  const now = useNow(1000);
  const today = usePrayerDay(now);
  const tomorrow = usePrayerDay(new Date(now.getTime() + 86400000));
  const fmt = useFormatTime();
  const toast = useToast();
  const locationName = useStore((s) => s.location?.name ?? '');
  const notificationsOn = useStore((s) => s.notificationsEnabled);
  const hijriAdj = useStore((s) => s.hijriAdjustment);
  const makeup = useTracker((s) => s.makeupFasts);
  const setMakeup = useTracker((s) => s.setMakeupFasts);
  if (!today || !tomorrow) return null;

  const locale = localeFor(language);
  const imsak = today.times.imsak.getTime(), iftar = today.times.maghrib.getTime(), t0 = now.getTime();
  const fasting = t0 >= imsak && t0 < iftar;
  const nextImsak = t0 < imsak ? imsak : tomorrow.times.imsak.getTime();
  const left = fasting ? iftar - t0 : nextImsak - t0;
  const f = fasting ? (t0 - imsak) / (iftar - imsak) : 0;
  const lenMin = Math.round((iftar - imsak) / 60000);
  const C = 2 * Math.PI * 104;
  const suhoorShown = fasting || t0 < imsak ? today.times.imsak : tomorrow.times.imsak;

  // the next 7 days, highlighting Mondays and Thursdays
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() + i); return d; });
  const white = getUpcomingWhiteDays(3, hijriAdj, today.times.maghrib);
  const daysFrom = (d: Date) => Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000);

  const step = (delta: number) => {
    setMakeup(makeup + delta);
    toast(delta < 0 ? t('ui.fasting.madeUp') : t('ui.fasting.added'));
  };

  return (
    <>
      <PageHead title={t('common.tabs.fasting')} subtitle={`${now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })} · ${locationName}`} />
      <div className="fl-cols">
        <div className="fl-card fl-fast">
          <div className="fl-fring">
            <svg viewBox="0 0 240 240" aria-hidden="true">
              <defs><linearGradient id="fl-fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3a13b" /><stop offset="1" stopColor="#0f7a52" /></linearGradient></defs>
              <circle cx="120" cy="120" r="104" fill="none" stroke="var(--line)" strokeWidth="14" />
              <circle cx="120" cy="120" r="104" fill="none" stroke="url(#fl-fg)" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - f)} />
            </svg>
            <div className="c"><div>
              <small>{fasting ? t('ui.fasting.iftarIn') : t('ui.fasting.suhoorIn')}</small>
              <b className="tnum" aria-live="off">{hms(left)}</b>
              <span>{fasting ? t('ui.fasting.ofFast', { n: Math.round(f * 100) }) : t('ui.fasting.eatBefore', { time: fmt(suhoorShown) })}</span>
            </div></div>
          </div>
          <div className="fl-ftiles">
            <div className="fl-ftile"><span><Icon name="sunrise" />{t('ui.fasting.suhoorEnds')}</span><b className="tnum">{fmt(suhoorShown)}</b></div>
            <div className="fl-ftile"><span><Icon name="sunset" />{t('ui.fasting.iftar')}</span><b className="tnum">{fmt(today.times.maghrib)}</b></div>
          </div>
          <p>{t('ui.fasting.length', { h: Math.floor(lenMin / 60), m: lenMin % 60 })}</p>
        </div>

        <div>
          <h2 className="fl-sh">{t('ui.fasting.alerts')}</h2>
          <div className="fl-card">
            <button type="button" className="fl-row" onClick={onOpenSettings}>
              <div className="lt"><b>{t('settings.prayerNotifications')}</b><span>{t('ui.fasting.alertsSub')}</span></div>
              <span className="rv">{notificationsOn ? t('ui.settings.adhanOn') : t('ui.settings.off')}<Icon name="chev" className="fl-chev" /></span>
            </button>
          </div>

          <h2 className="fl-sh">{t('ui.fasting.thisWeek')} <span>{t('ui.fasting.sunnahNote')}</span></h2>
          <div className="fl-card fl-sunnah">
            {week.map((d, i) => (
              <div key={i} className={i === 0 ? 't' : d.getDay() === 1 || d.getDay() === 4 ? 's' : ''}>
                {d.toLocaleDateString(locale, { weekday: 'short' })}<b className="tnum">{d.toLocaleDateString(locale, { day: 'numeric' })}</b>
              </div>
            ))}
          </div>

          <h2 className="fl-sh">{t('ui.fasting.whiteDays')} <span>{t('ui.fasting.whiteDaysSub')}</span></h2>
          <div className="fl-card">
            {white.map((w) => {
              const n = daysFrom(w.gregorianDate);
              return (
                <div key={w.gregorianDate.toISOString()} className="fl-row">
                  <div className="lt"><b>{w.hijriDate.day} {w.hijriDate.monthName[language === 'en' ? 'en' : language]}</b><span>{w.gregorianDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
                  <span className="fl-pill gold">{n === 0 ? t('ui.fasting.today') : n === 1 ? t('ui.fasting.tomorrow') : t('ui.fasting.inDays', { n })}</span>
                </div>
              );
            })}
          </div>

          <h2 className="fl-sh">{t('ui.fasting.makeup')}</h2>
          <div className="fl-card">
            <div className="fl-row">
              <div className="lt"><b>{makeup ? t('ui.fasting.makeupLeft', { n: makeup }) : t('ui.fasting.makeupNone')}</b><span>{t('ui.fasting.makeupSub')}</span></div>
              <div className="fl-stepper">
                <button type="button" className="fl-iconbtn" aria-label={t('ui.fasting.oneLess')} disabled={makeup === 0} onClick={() => step(-1)}><Icon name="minus" /></button>
                <b className="tnum" aria-live="polite">{makeup}</b>
                <button type="button" className="fl-iconbtn" aria-label={t('ui.fasting.oneMore')} onClick={() => step(1)}><Icon name="plus" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
