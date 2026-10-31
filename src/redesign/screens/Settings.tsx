import { useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LocationPicker } from '../../components/LocationPicker';
import { useStore, type PrayerAlertKey } from '../../store/useStore';
import { useLocation } from '../../hooks/useLocation';
import { CALCULATION_METHODS } from '../../services/prayerService';
import { REGULAR_ADHAN_SOUNDS, FAJR_ADHAN_SOUNDS } from '../../services/notificationService';
import { useTranslation } from '../../i18n/useTranslation';
import { LANGUAGE_OPTIONS } from '../../i18n';
import type { Language } from '../../i18n/types';
import { developerProjects } from '../../data/developerProjects';
import { Icon } from '../icons';
import { PageHead, Switch, Segmented } from '../shared';
import { PRAYER_KEYS, usePrayerDay } from '../lib';

export function SettingsScreen() {
  const { t } = useTranslation();
  const s = useStore();
  const loc = useLocation();
  const day = usePrayerDay(new Date());
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const stop = () => { audio.current?.pause(); audio.current = null; setPlaying(null); };
  const preview = (id: string, file?: string) => {
    if (playing === id) return stop();
    stop();
    if (!file) return;
    const a = new Audio(file);
    a.addEventListener('ended', () => setPlaying(null));
    a.play().catch(() => {});
    audio.current = a;
    setPlaying(id);
  };
  useEffect(() => stop, []); // stop sound when leaving the page

  const adhanRow = (label: string, desc: string, value: string, set: (v: string) => void, list: typeof REGULAR_ADHAN_SOUNDS) => {
    const cur = list.find((a) => a.id === value);
    return (
      <div className="fl-row" style={{ flexWrap: 'wrap' }}>
        <div className="lt" style={{ minWidth: 180 }}><b>{label}</b><span>{desc}</span></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 220px' }}>
          <Select value={value} onValueChange={(v) => { stop(); set(v); }}>
            <SelectTrigger className="h-11 flex-1"><SelectValue placeholder={t('settings.selectAdhan')} /></SelectTrigger>
            <SelectContent>{list.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
          </Select>
          {cur?.file && (
            <button type="button" className="fl-iconbtn" style={{ background: 'var(--surface)' }} aria-label={playing === value ? t('ui.settings.stop') : t('ui.settings.preview')} onClick={() => preview(value, cur.file)}>
              <Icon name={playing === value ? 'stop' : 'play'} filled />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHead title={t('settings.title')} subtitle={t('ui.settings.subtitle')} />
      <div className="fl-cols">
        <div>
          <h2 className="fl-sh">{t('settings.location')}</h2>
          <div className="fl-card">
            <div className="fl-row">
              <span className="fl-iconbtn" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)' }}><Icon name="pin" /></span>
              <div className="lt"><b>{loc.name || t('common.unknownLocation')}</b><span>{t('settings.chooseCityDesc')}</span></div>
              <button type="button" className="fl-iconbtn" aria-label={t('ui.settings.locationAuto')} onClick={loc.requestLocation} disabled={loc.loading}>
                <Icon name="refresh" className={`fl-ico ${loc.loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div style={{ padding: '4px 18px 16px' }} className="fl-legacy">
              <LocationPicker onPick={(lat, lon, label) => loc.setCityLocation(lat, lon, label)} />
            </div>
          </div>

          <h2 className="fl-sh">{t('ui.settings.prayerTimes')}</h2>
          <div className="fl-card">
            <div className="fl-row" style={{ flexWrap: 'wrap' }}>
              <div className="lt" style={{ minWidth: 180 }}><b>{t('settings.calculationMethod')}</b><span>{t('settings.calculationMethodDesc')}</span></div>
              <div style={{ flex: '1 1 220px' }}>
                <Select value={s.calculationMethod} onValueChange={(v) => s.setCalculationMethod(v as typeof s.calculationMethod)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={t('settings.selectMethod')} /></SelectTrigger>
                  <SelectContent>{CALCULATION_METHODS.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="fl-row" style={{ flexWrap: 'wrap' }}>
              <div className="lt"><b>{t('settings.juristicSchool')}</b><span>{t('settings.juristicSchoolDesc')}</span></div>
              <Segmented label={t('settings.juristicSchool')} value={s.madhab} onChange={s.setMadhab} options={[{ value: 'Shafi', label: t('ui.settings.standard') }, { value: 'Hanafi', label: t('ui.settings.hanafi') }]} />
            </div>
            <div className="fl-row">
              <div className="lt"><b>{t('settings.hijriAdjustment')}</b><span>{t('settings.hijriAdjustmentDesc')}</span></div>
              <div className="fl-stepper">
                <button type="button" className="fl-iconbtn" aria-label="−1" disabled={s.hijriAdjustment <= -2} onClick={() => s.setHijriAdjustment(s.hijriAdjustment - 1)}><Icon name="minus" /></button>
                <b className="tnum">{s.hijriAdjustment > 0 ? `+${s.hijriAdjustment}` : s.hijriAdjustment}</b>
                <button type="button" className="fl-iconbtn" aria-label="+1" disabled={s.hijriAdjustment >= 2} onClick={() => s.setHijriAdjustment(s.hijriAdjustment + 1)}><Icon name="plus" /></button>
              </div>
            </div>
          </div>

          <h2 className="fl-sh">{t('ui.settings.appearance')}</h2>
          <div className="fl-card">
            <div className="fl-row" style={{ flexWrap: 'wrap' }}>
              <div className="lt"><b>{t('settings.theme')}</b></div>
              <Segmented label={t('settings.theme')} value={s.theme} onChange={s.setTheme} options={[{ value: 'light', label: t('settings.themeLight') }, { value: 'dark', label: t('settings.themeDark') }, { value: 'system', label: t('settings.themeSystem') }]} />
            </div>
            <div className="fl-row" style={{ flexWrap: 'wrap' }}>
              <div className="lt"><b>{t('settings.language')}</b></div>
              <Segmented label={t('settings.language')} value={s.language} onChange={(v) => s.setLanguage(v as Language)} options={LANGUAGE_OPTIONS.map((l) => ({ value: l.id, label: l.nativeLabel }))} />
            </div>
            <div className="fl-row"><div className="lt"><b>{t('settings.timeFormat24')}</b><span>{t('settings.timeFormat24Desc')}</span></div><Switch label={t('settings.timeFormat24')} checked={s.use24HourFormat} onChange={s.setUse24HourFormat} /></div>
          </div>
        </div>

        <div>
          <h2 className="fl-sh">{t('ui.settings.alerts')}</h2>
          <div className="fl-card">
            <div className="fl-row"><div className="lt"><b>{t('settings.prayerNotifications')}</b><span>{t('settings.prayerNotificationsDesc')}</span></div><Switch label={t('settings.prayerNotifications')} checked={s.notificationsEnabled} onChange={s.setNotificationsEnabled} /></div>
            {s.notificationsEnabled && (
              <>
                {adhanRow(t('settings.adhanSound'), t('settings.adhanSoundDesc'), s.selectedAdhan, s.setSelectedAdhan, REGULAR_ADHAN_SOUNDS)}
                {adhanRow(t('settings.fajrAdhanSound'), t('settings.fajrAdhanSoundDesc'), s.selectedFajrAdhan, s.setSelectedFajrAdhan, FAJR_ADHAN_SOUNDS)}
              </>
            )}
          </div>

          <h2 className="fl-sh">{t('ui.settings.perPrayer')}</h2>
          <div className="fl-card">
            {PRAYER_KEYS.map((k: PrayerAlertKey) => {
              const name = day?.slots.find((x) => x.key === k)?.name ?? k;
              const on = !!s.prayerAlerts?.[k];
              return (
                <div key={k} className="fl-row">
                  <div className="lt"><b>{name}</b><span>{!on || !s.notificationsEnabled ? t('ui.settings.off') : k === 'sunrise' ? t('ui.settings.reminder') : t('ui.settings.adhanOn')}</span></div>
                  <Switch label={t('ui.today.alertLabel', { prayer: name })} checked={on} disabled={!s.notificationsEnabled} onChange={(v) => s.setPrayerAlert(k, v)} />
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 22, display: 'grid', gap: 12 }}>
            <button type="button" className="fl-btn ghost" onClick={s.resetSettings}>{t('settings.resetDefaults')}</button>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{t('settings.infoText')}</p>
          </div>

          <h2 className="fl-sh">{t('footer.developer')}</h2>
          <div className="fl-card">
            <a className="fl-row" href="https://my-portfolio-seven-delta-60.vercel.app/" target="_blank" rel="noopener noreferrer"><div className="lt"><b>{t('footer.portfolio')}</b><span>{t('footer.developerDesc')}</span></div><Icon name="chev" className="fl-chev" /></a>
            {developerProjects.map((p) => (
              <a key={p.name} className="fl-row" href={p.url} target="_blank" rel="noopener noreferrer"><div className="lt"><b>{p.name}</b><span>{p.description}</span></div><Icon name="chev" className="fl-chev" /></a>
            ))}
          </div>
          <p style={{ margin: '14px 4px 0', fontSize: 12.5, color: 'var(--ink-3)' }}>
            {t('footer.attribution')} <a href="https://github.com/batoulapps/adhan-js" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--emerald)', fontWeight: 700 }}>Adhan</a> · {t('footer.hijriDatesBy')} <a href="https://github.com/AliYmn/hijri-converter" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--emerald)', fontWeight: 700 }}>hijri-converter</a>
          </p>
        </div>
      </div>
    </>
  );
}
