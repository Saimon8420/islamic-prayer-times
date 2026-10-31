import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { gregorianToHijri, hijriToGregorian, HIJRI_MONTHS } from '../../services/hijriService';
import { useTranslation } from '../../i18n/useTranslation';
import { Icon } from '../icons';
import { PageHead } from '../shared';
import { useNow, localeFor } from '../lib';

type EventKey = 'newYear' | 'ashura' | 'rajab' | 'shaban' | 'ramadan' | 'lastTen' | 'eidFitr' | 'arafah' | 'eidAdha';
const EVENTS: { m: number; d: number; key: EventKey }[] = [
  { m: 1, d: 1, key: 'newYear' }, { m: 1, d: 10, key: 'ashura' }, { m: 7, d: 1, key: 'rajab' }, { m: 8, d: 1, key: 'shaban' },
  { m: 9, d: 1, key: 'ramadan' }, { m: 9, d: 21, key: 'lastTen' }, { m: 10, d: 1, key: 'eidFitr' }, { m: 12, d: 9, key: 'arafah' }, { m: 12, d: 10, key: 'eidAdha' },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** hijri (y, m, d) -> local gregorian date, honouring the user's moon-sighting adjustment */
const toG = (y: number, m: number, d: number, adj: number) => { const g = hijriToGregorian(y, m, d); g.setDate(g.getDate() - adj); return g; };

export function CalendarScreen() {
  const { t, language } = useTranslation();
  const now = useNow(60000);
  const adj = useStore((s) => s.hijriAdjustment);
  const locale = localeFor(language);
  const lang = language === 'en' ? 'en' : language;
  const todayH = gregorianToHijri(now, adj);
  const [view, setView] = useState({ y: todayH.year, m: todayH.month });
  const [sel, setSel] = useState<number | null>(null);

  const days = useMemo(() => {
    const out: { d: number; g: Date }[] = [];
    for (let d = 1; d <= 30; d++) {
      const g = toG(view.y, view.m, d, adj);
      const back = gregorianToHijri(g, adj);
      if (back.month !== view.m) break; // month has 29 days
      out.push({ d, g });
    }
    return out;
  }, [view.y, view.m, adj]);

  const isCurrent = view.y === todayH.year && view.m === todayH.month;
  const selDay = sel ?? (isCurrent ? todayH.day : 1);
  const selG = days.find((x) => x.d === selDay)?.g ?? days[0].g;
  const eventOn = (m: number, d: number) => EVENTS.find((e) => e.m === m && e.d === d);
  const selEvent = eventOn(view.m, selDay);
  const today0 = startOfDay(now).getTime();

  const upcoming = useMemo(() => {
    const list = EVENTS.flatMap((e) => [todayH.year, todayH.year + 1].map((y) => ({ ...e, g: toG(y, e.m, e.d, adj) })))
      .filter((e) => startOfDay(e.g).getTime() >= today0)
      .sort((a, b) => a.g.getTime() - b.g.getTime());
    return list.slice(0, 5);
  }, [todayH.year, today0, adj]);

  const move = (delta: number) => {
    let m = view.m + delta, y = view.y;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setView({ y, m });
    setSel(null);
  };

  const monthName = HIJRI_MONTHS[view.m as keyof typeof HIJRI_MONTHS];
  const gRange = `${days[0].g.toLocaleDateString(locale, { month: 'long' })} – ${days[days.length - 1].g.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}`;
  const lead = days[0].g.getDay();
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i).toLocaleDateString(locale, { weekday: 'short' }));

  return (
    <>
      <PageHead title={t('ui.nav.calendar')} subtitle={t('ui.calendar.subtitle', { month: monthName[lang], year: view.y, greg: gRange })}>
        {!isCurrent && <button type="button" className="fl-btn ghost" onClick={() => { setView({ y: todayH.year, m: todayH.month }); setSel(null); }}>{t('ui.calendar.thisMonth')}</button>}
      </PageHead>
      <div className="fl-cols">
        <div className="fl-card fl-cal">
          <div className="fl-cal-top">
            <button type="button" className="fl-iconbtn" aria-label={t('ui.calendar.prevMonth')} onClick={() => move(-1)}><Icon name="back" className="fl-ico fl-flip" /></button>
            <div className="m"><b>{monthName[lang]} {view.y}</b><span lang="ar">{monthName.ar}</span></div>
            <button type="button" className="fl-iconbtn" aria-label={t('ui.calendar.nextMonth')} onClick={() => move(1)}><Icon name="chev" className="fl-ico fl-flip" /></button>
          </div>
          <div className="fl-cgrid">
            {weekdays.map((w) => <div key={w} className="wdl">{w}</div>)}
            {Array.from({ length: lead }, (_, i) => <div key={`e${i}`} />)}
            {days.map(({ d, g }) => {
              const gt = startOfDay(g).getTime();
              const ev = eventOn(view.m, d);
              const white = d >= 13 && d <= 15;
              const label = `${d} ${monthName[lang]}, ${g.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}${ev ? `, ${t(`ui.calendar.${ev.key}`)}` : white ? `, ${t('ui.calendar.whiteDay')}` : ''}`;
              return (
                <button key={d} type="button" className={`fl-cday ${gt === today0 ? 'today' : gt < today0 ? 'past' : ''}`} aria-pressed={selDay === d} aria-label={label} onClick={() => setSel(d)}>
                  <b className="tnum">{d}</b>
                  <small className="tnum">{g.toLocaleDateString(locale, g.getDate() === 1 ? { day: 'numeric', month: 'short' } : { day: 'numeric' })}</small>
                  {(white || ev) && <span className="dot" style={ev ? { background: 'var(--emerald)' } : undefined} />}
                </button>
              );
            })}
          </div>
          <div className="fl-legend">
            <span><i style={{ background: 'var(--emerald)' }} />{t('ui.calendar.today')}</span>
            <span><i style={{ background: 'var(--gold-fill)' }} />{t('ui.calendar.whiteDays')}</span>
          </div>
        </div>

        <div>
          <h2 className="fl-sh">{selDay} {monthName[lang]}</h2>
          <div className="fl-card">
            <div className="fl-row">
              <div className="lt">
                <b>{selG.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b>
                <span>{selEvent ? t(`ui.calendar.${selEvent.key}`) : selDay >= 13 && selDay <= 15 ? t('ui.calendar.whiteDay') : t('ui.calendar.noOccasion')}</span>
              </div>
              {startOfDay(selG).getTime() === today0 && <span className="fl-pill">{t('ui.calendar.today')}</span>}
            </div>
          </div>
          <h2 className="fl-sh">{t('ui.calendar.comingUp')}</h2>
          <div className="fl-card">
            {upcoming.map((e) => {
              const n = Math.round((startOfDay(e.g).getTime() - today0) / 86400000);
              return (
                <div key={`${e.key}${e.g.getTime()}`} className="fl-row">
                  <div className="lt"><b>{t(`ui.calendar.${e.key}`)}</b><span>{e.g.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
                  <span className={`fl-pill ${e.m === 9 || e.m === 10 || e.m === 12 ? '' : 'gold'}`}>{t('ui.calendar.inDays', { n })}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
