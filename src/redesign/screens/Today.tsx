import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useTracker, dayKey, type TrackedPrayer } from '../../store/useTracker';
import { gregorianToHijri, getDaysUntilRamadan, getDaysUntilEidFitr, getDaysUntilEidAdha, isRamadan } from '../../services/hijriService';
import { calculateQibla, calculateDistanceToMakkah } from '../../services/prayerService';
import { selectContextualVerse } from '../../services/verseSelectionService';
import { useTranslation } from '../../i18n/useTranslation';
import { Icon } from '../icons';
import { useNow, usePrayerDay, useFormatTime, useDuration, useToast, localeFor, type PrayerSlot } from '../lib';

const SKY: Record<string, [string, string, string]> = {
  night: ['#b5c1e8 0%,#dce2f4 60%', '#ffffff', 'rgba(220,226,255,.55)'],
  fajr: ['#cbc0ee 0%,#f2d3dc 55%', '#fff6ec', 'rgba(255,214,200,.6)'],
  sunrise: ['#ffd6aa 0%,#ffe9d2 55%', '#ffd18a', 'rgba(255,200,130,.45)'],
  dhuhr: ['#b8dbfa 0%,#e0effc 55%', '#fff4c9', 'rgba(255,233,160,.55)'],
  asr: ['#c7dcf2 0%,#f8e4c0 55%', '#ffc773', 'rgba(255,190,110,.45)'],
  maghrib: ['#f2b8ab 0%,#fcd8bd 55%', '#ff9d6b', 'rgba(255,140,100,.45)'],
  isha: ['#b9c2e8 0%,#dde2f4 55%', '#f4f6ff', 'rgba(200,210,255,.6)'],
};

const mins = (d: Date) => d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;

/** Which part of the day it is, for the sky colour. */
function period(now: Date, s: PrayerSlot[]) {
  const t = now.getTime(), at = (k: string) => s.find((x) => x.key === k)!.time.getTime();
  if (t < at('fajr') - 15 * 60000) return 'night';
  if (t < at('sunrise')) return 'fajr';
  if (t < at('sunrise') + 100 * 60000) return 'sunrise';
  if (t < at('asr')) return 'dhuhr';
  if (t < at('maghrib') - 30 * 60000) return 'asr';
  if (t < at('isha')) return 'maghrib';
  return 'isha';
}

function skyStyle(now: Date, slots: PrayerSlot[]) {
  const [g, sun, glow] = SKY[period(now, slots)];
  return { '--sky': `linear-gradient(160deg,${g.replace(/ \d+%/g, '')})`, '--sun': sun, '--sun-glow': glow } as React.CSSProperties;
}

function MiniCompass({ deg }: { deg: number }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="t-mini-compass">
      <circle cx="32" cy="32" r="29" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      {[0, 90, 180, 270].map((a) => <line key={a} x1="32" y1="5" x2="32" y2="10" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" transform={`rotate(${a} 32 32)`} />)}
      <g transform={`rotate(${deg} 32 32)`}>
        <path d="M32 12 36.5 32h-9Z" fill="var(--emerald)" />
        <path d="M27.5 32h9L32 52Z" fill="var(--dim)" />
        <rect x="27.5" y="3" width="9" height="9" rx="1.5" fill="#141414" />
        <rect x="27.5" y="5.6" width="9" height="1.8" fill="#e3a13b" />
      </g>
      <circle cx="32" cy="32" r="3.5" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
}

export function TodayScreen({ onOpenSettings, onNavigate }: { onOpenSettings: () => void; onNavigate: (r: 'fasting' | 'qibla' | 'calendar') => void }) {
  const { t, language } = useTranslation();
  const now = useNow(1000);
  const [offset, setOffset] = useState(0);
  const viewDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
  const today = usePrayerDay(now);
  const shown = usePrayerDay(viewDate);
  const tomorrow = usePrayerDay(new Date(now.getTime() + 86400000));
  const fmt = useFormatTime();
  const dur = useDuration();
  const toast = useToast();
  const locationName = useStore((s) => s.location?.name ?? '');
  const alerts = useStore((s) => s.prayerAlerts);
  const setAlert = useStore((s) => s.setPrayerAlert);
  const notificationsOn = useStore((s) => s.notificationsEnabled);
  const hijriAdj = useStore((s) => s.hijriAdjustment);
  const loc = useStore((s) => s.location);
  const log = useTracker((s) => s.log);
  const togglePrayed = useTracker((s) => s.togglePrayed);

  if (!today || !shown || !tomorrow) return null;
  const locale = localeFor(language);
  const isToday = offset === 0, isFuture = offset > 0;
  const slots = today.slots, t0 = now.getTime();

  // current prayer = the last one that has started; before Fajr it is still last night's Isha
  let ci = -1;
  slots.forEach((s, i) => { if (t0 >= s.time.getTime()) ci = i; });
  const cur = ci === -1 ? slots[5] : slots[ci];
  const next = ci === -1 ? slots[0] : ci === 5 ? tomorrow.slots[0] : slots[ci + 1];

  const key = dayKey(viewDate);
  const marks = log[key] ?? {};

  const mark = (p: TrackedPrayer, name: string) => {
    const was = !!marks[p];
    togglePrayed(key, p);
    if (navigator.vibrate) navigator.vibrate(12);
    if (!was) toast(t('ui.today.marked', { prayer: name }));
  };
  const bell = (s: PrayerSlot) => {
    const on = !alerts?.[s.key];
    setAlert(s.key, on);
    toast(on && !notificationsOn ? t('ui.today.alertsNeedOn') : t(on ? 'ui.today.alertOn' : 'ui.today.alertOff', { prayer: s.name }));
  };

  // ── sun-path curve (230 → 1180 minutes covers Fajr to Isha everywhere practical)
  const ds = shown.slots, A = Math.min(230, mins(ds[0].time) - 30), B = Math.max(1180, mins(ds[5].time) + 40);
  const x = (m: number) => 24 + ((Math.min(B, Math.max(A, m)) - A) / (B - A)) * 542;
  const y = (m: number) => 108 - Math.sin(Math.PI * Math.min(1, Math.max(0, (m - A) / (B - A)))) * 86;
  const nowM = isToday ? mins(now) : isFuture ? A : B;
  let solid = '', dotted = '';
  for (let m = A; m <= B; m += 5) {
    const seg = `${m === A ? 'M' : 'L'}${x(m).toFixed(1)} ${y(m).toFixed(1)}`;
    if (m <= Math.max(nowM, A)) solid += seg;
    dotted += seg;
  }
  const nextIdx = isToday ? (ci === -1 ? 0 : ci === 5 ? -1 : ci + 1) : -1;

  const hijri = gregorianToHijri(viewDate, hijriAdj, isToday ? today.times.maghrib : undefined);
  const hijriText = `${hijri.day} ${hijri.monthName[language === 'en' ? 'en' : language]} ${hijri.year}`;


  // side cards
  const imsak = today.times.imsak.getTime(), iftar = today.times.maghrib.getTime();
  const fasting = t0 >= imsak && t0 < iftar;
  const fastPct = Math.min(1, Math.max(0, (t0 - imsak) / (iftar - imsak)));
  const fastLine = fasting ? t('ui.today.iftarIn', { time: dur(iftar - t0) }) : t0 < imsak ? t('ui.today.suhoorIn', { time: dur(imsak - t0) }) : t('ui.today.fastOver');
  const qibla = loc ? Math.round(calculateQibla(loc.lat, loc.lon)) : 0;
  const km = loc ? calculateDistanceToMakkah(loc.lat, loc.lon) : 0;
  const hijriNow = gregorianToHijri(now, hijriAdj, today.times.maghrib);
  const verse = selectContextualVerse(now, today.times, hijriNow).verse;
  const occasions = [
    { n: getDaysUntilRamadan(hijriAdj, today.times.maghrib), key: 'ui.today.ramadanIn' as const },
    { n: getDaysUntilEidFitr(hijriAdj, today.times.maghrib), key: 'ui.today.eidFitrIn' as const },
    { n: getDaysUntilEidAdha(hijriAdj, today.times.maghrib), key: 'ui.today.eidAdhaIn' as const },
  ].filter((o) => o.n != null && o.n > 0).sort((a, b) => (a.n ?? 0) - (b.n ?? 0));
  const inRamadan = isRamadan(hijriAdj, today.times.maghrib);
  const occ = occasions[0];

  return (
    <div className="fl-today2">
      <section className="t-hero2" style={skyStyle(now, slots)}>
        <div className="sun" aria-hidden="true" />
        <div className="t-hero-info">
          <button type="button" className="fl-locbtn" onClick={onOpenSettings} aria-label={`${locationName}. ${t('ui.today.changeLocation')}`}>
            <Icon name="pin" />{locationName}
          </button>
          <span className="t-now-pill"><i />{t('ui.today.nowLabel')}</span>
          <div className="fl-now">
            {cur.name}
            {language !== 'ar' && <span className="ar" lang="ar">{cur.arabic}</span>}
          </div>
          <div className="fl-until">
            {(() => {
              const parts = t('ui.today.until', { time: '\u0001', prayer: next.name }).split('\u0001');
              return <>{parts[0]}<b>{dur(next.time.getTime() - t0)}</b>{parts[1]}</>;
            })()}
          </div>
          <div className="t-next-chip"><Icon name="bell" />{t('ui.today.nextAt', { prayer: next.name, time: fmt(next.time) })}</div>
        </div>
        <div className="t-curve">
          <svg viewBox="0 0 590 140" role="img" aria-label={t('ui.today.curve')}>
            <path d={dotted} fill="none" stroke="var(--ink-3)" strokeOpacity=".55" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
            <path d={solid} fill="none" stroke="var(--ink)" strokeWidth="2.8" strokeLinecap="round" />
            {ds.map((s, i) => {
              const m = mins(s.time), past = m <= nowM, isNext = i === nextIdx, below = i === 1 || i === 5;
              const anchor = i === 0 ? 'end' : i === 1 ? 'start' : i === 5 ? 'end' : 'middle';
              return (
                <g key={s.key}>
                  <circle cx={x(m)} cy={y(m)} r={isNext ? 6.5 : 5} fill={past ? 'var(--ink)' : 'var(--bg)'} stroke={isNext ? 'var(--emerald)' : past ? 'var(--ink)' : 'var(--ink-3)'} strokeWidth="2.6" />
                  <text x={x(m)} y={y(m) + (below ? 26 : -15)} dx={i === 0 ? -7 : i === 1 ? 7 : i === 5 ? 4 : 0} textAnchor={anchor} fontSize="12.5" fontWeight="800" fill={isNext ? 'var(--emerald)' : 'var(--ink)'} style={{ fontFamily: 'var(--font)' }}>{s.name}</text>
                </g>
              );
            })}
            {isToday && nowM > A && nowM < B && (
              <>
                <circle cx={x(nowM)} cy={y(nowM)} r="10" fill="var(--bg)" stroke="var(--ink)" strokeWidth="3" />
                <circle cx={x(nowM)} cy={y(nowM)} r="3.5" fill="var(--gold-fill)" />
              </>
            )}
          </svg>
        </div>
      </section>

      <div className="t-grid">
        <section className="fl-card t-list2" aria-label={t('ui.today.todayTimes')}>
          <div className="t-day">
            <button type="button" className="fl-iconbtn" aria-label={t('ui.today.prevDay')} onClick={() => setOffset((o) => o - 1)}><Icon name="back" className="fl-ico fl-flip" /></button>
            <div className="d">
              <b>{viewDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</b>
              <span>{hijriText}</span>
              {!isToday && <div><button type="button" onClick={() => setOffset(0)}>{t('ui.today.backToToday')}</button></div>}
            </div>
            <button type="button" className="fl-iconbtn" aria-label={t('ui.today.nextDay')} onClick={() => setOffset((o) => o + 1)}><Icon name="chev" className="fl-ico fl-flip" /></button>
          </div>
          <div className="fl-plist">
            {ds.map((s, i) => {
              const started = s.time.getTime() <= t0 || offset < 0;
              const isNow = isToday && i === ci;
              const past = isToday ? started && !isNow : offset < 0;
              const end = i < 5 ? ds[i + 1].time : tomorrow.slots[0].time;
              return (
                <div key={s.key} className={`fl-prow ${past ? 'past' : ''} ${isNow ? 'now' : ''}`}>
                  {s.isPrayer ? (
                    <button type="button" className="fl-check" aria-label={t('ui.today.prayedLabel', { prayer: s.name })} aria-pressed={!!marks[s.key as TrackedPrayer]} disabled={!started || isFuture} onClick={() => mark(s.key as TrackedPrayer, s.name)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </button>
                  ) : (
                    <span className="fl-check na" aria-hidden="true" />
                  )}
                  <div className="fl-pname">
                    {s.name}
                    {isNow && <> <span className="fl-pill">{t('ui.today.now')}</span></>}
                    <small>
                      {!s.isPrayer ? t('ui.today.fajrEnds') : isNow ? t('ui.today.ends', { time: fmt(end) }) : language === 'ar' ? t('ui.today.ends', { time: fmt(end) }) : <span className="ar-ui" lang="ar">{s.arabic}</span>}
                    </small>
                  </div>
                  <div className="fl-ptime tnum">{fmt(s.time)}</div>
                  <button type="button" className="fl-bell" aria-label={t('ui.today.alertLabel', { prayer: s.name })} aria-pressed={!!alerts?.[s.key]} onClick={() => bell(s)}>
                    <Icon name={alerts?.[s.key] ? 'bell' : 'bellOff'} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="t-side">
          <button type="button" className="fl-card t-tile" onClick={() => onNavigate('fasting')}>
            <div className="t-tile-head"><span className="t-ic gold"><Icon name="fasting" /></span><b>{t('ui.today.fastingToday')}</b><Icon name="chev" className="fl-chev fl-flip" /></div>
            <div className="t-fast-times">
              <div><span>{t('ui.fasting.suhoorEnds')}</span><b className="tnum">{fmt(today.times.imsak)}</b></div>
              <div><span>{t('ui.fasting.iftar')}</span><b className="tnum">{fmt(today.times.maghrib)}</b></div>
            </div>
            <div className="t-bar"><i style={{ width: `${fastPct * 100}%` }} /></div>
            <p>{fastLine}</p>
          </button>

          <button type="button" className="fl-card t-tile t-qibla" onClick={() => onNavigate('qibla')}>
            <MiniCompass deg={qibla} />
            <div className="lt"><b>{t('ui.today.qiblaCard')} · {qibla}°</b><span>{t('ui.today.qiblaFrom', { deg: qibla, km: km.toLocaleString() })}</span></div>
            <Icon name="chev" className="fl-chev fl-flip" />
          </button>

          <article className="t-verse">
            <span className="t-verse-k">{verse.type === 'ayah' ? t('ui.today.verse') : t('ui.today.hadith')}</span>
            <p className="ar" lang="ar">{verse.arabic}</p>
            <p className="tr">{language === 'bn' ? verse.translationBn : verse.translation}</p>
            <small>{verse.reference}</small>
          </article>

          {(inRamadan || occ) && (
            <button type="button" className="fl-card t-tile t-occ" onClick={() => onNavigate('calendar')}>
              <span className="t-ic"><Icon name="calendar" /></span>
              <div className="lt"><b>{inRamadan ? t('ui.today.ramadanNow') : t(occ.key, { n: occ.n ?? 0 })}</b><span>{t('ui.today.calendarLink')}</span></div>
              <Icon name="chev" className="fl-chev fl-flip" />
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
