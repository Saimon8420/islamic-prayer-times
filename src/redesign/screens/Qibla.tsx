import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { calculateQibla, calculateDistanceToMakkah } from '../../services/prayerService';
import { useTranslation } from '../../i18n/useTranslation';
import { QiblaMap } from '../../components/qibla/QiblaMap';
import { Icon } from '../icons';
import { PageHead } from '../shared';

type OrientationEventIOS = DeviceOrientationEvent & { webkitCompassHeading?: number };
type PermissionCapable = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

export function QiblaScreen() {
  const { t } = useTranslation();
  const location = useStore((s) => s.location);
  const qibla = location ? Math.round(calculateQibla(location.lat, location.lon)) : 0;
  const distance = location ? calculateDistanceToMakkah(location.lat, location.lon) : 0;
  const [heading, setHeading] = useState(() => (qibla + 323) % 360);
  const [live, setLive] = useState(false);
  const dial = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);

  // follow the phone's compass once the user turns it on
  useEffect(() => {
    if (!live) return;
    const onAbs = (e: DeviceOrientationEvent) => { if (e.alpha != null) setHeading((360 - e.alpha) % 360); };
    const onIos = (e: DeviceOrientationEvent) => { const h = (e as OrientationEventIOS).webkitCompassHeading; if (h != null) setHeading(h); };
    window.addEventListener('deviceorientationabsolute', onAbs as EventListener);
    window.addEventListener('deviceorientation', onIos);
    return () => { window.removeEventListener('deviceorientationabsolute', onAbs as EventListener); window.removeEventListener('deviceorientation', onIos); };
  }, [live]);

  const startCompass = async () => {
    const D = window.DeviceOrientationEvent as PermissionCapable | undefined;
    if (D?.requestPermission) { try { if ((await D.requestPermission()) !== 'granted') return; } catch { return; } }
    setLive(true);
  };

  const h = ((heading % 360) + 360) % 360;
  const diff = ((qibla - h + 540) % 360) - 180;
  const hit = Math.abs(diff) < 4;
  const dirName = (deg: number) => t(`ui.qibla.${['north', 'east', 'south', 'west'][Math.round(deg / 90) % 4]}` as 'ui.qibla.north');

  const ticks = [];
  for (let a = 0; a < 360; a += 5) {
    const r = ((a - 90) * Math.PI) / 180, r2 = a % 30 ? 142 : 132;
    ticks.push(<line key={a} x1={170 + 150 * Math.cos(r)} y1={170 + 150 * Math.sin(r)} x2={170 + r2 * Math.cos(r)} y2={170 + r2 * Math.sin(r)} stroke="var(--ink)" strokeOpacity={a % 30 ? 0.25 : 0.7} strokeWidth={a % 30 ? 1.2 : 2} />);
    if (a % 90 === 0) {
      const rx = 170 + 114 * Math.cos(r), ry = 170 + 114 * Math.sin(r);
      ticks.push(<text key={`l${a}`} x={rx} y={ry + 6} textAnchor="middle" fontSize="17" fontWeight="800" fill={a ? 'var(--ink-3)' : 'var(--danger)'} transform={`rotate(${a} ${rx} ${ry})`} style={{ fontFamily: 'var(--font)' }}>{'NESW'[a / 90]}</text>);
    }
  }
  const qa = ((qibla - 90) * Math.PI) / 180;

  return (
    <>
      <PageHead title={t('common.tabs.qibla')} subtitle={t('ui.qibla.subtitle')} />
      <div className="fl-cols">
        <div className="fl-card fl-compass">
          <div
            ref={dial}
            className="fl-dial"
            role="img"
            aria-label={t('ui.qibla.dialLabel', { h: Math.round(h), q: qibla })}
            onPointerDown={(e) => { if (live) return; drag.current = e.clientX; dial.current?.setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (drag.current == null) return; const dx = e.clientX - drag.current; drag.current = e.clientX; setHeading((v) => v - dx * 0.5); }}
            onPointerUp={() => { drag.current = null; }}
          >
            <svg className="pointer" viewBox="0 0 20 24" aria-hidden="true"><path d="M10 24 0 4a11 11 0 0 1 20 0Z" fill="currentColor" /></svg>
            <div className="q-ring" style={{ transform: `rotate(${-heading}deg)` }}>
              <svg viewBox="0 0 340 340" aria-hidden="true">
                <circle cx="170" cy="170" r="160" fill="var(--raised)" stroke="var(--line)" strokeWidth="2" />
                {ticks}
                <g transform={`translate(${170 + 150 * Math.cos(qa)} ${170 + 150 * Math.sin(qa)}) rotate(${qibla})`}>
                  <circle r="24" fill="var(--bg)" stroke="var(--line)" />
                  <rect x="-10" y="-10" width="20" height="20" rx="2" fill="#141414" />
                  <rect x="-10" y="-5" width="20" height="3.4" fill="#e3a13b" />
                </g>
              </svg>
            </div>
            <div className="center"><div><b className="tnum">{Math.round(h)}°</b><small>{t('ui.qibla.facing')}</small></div></div>
          </div>
          <div className={`fl-qmsg ${hit ? 'hit' : ''}`} aria-live="polite">
            {hit ? t('ui.qibla.onTarget') : t(diff > 0 ? 'ui.qibla.turnRight' : 'ui.qibla.turnLeft', { deg: Math.round(Math.abs(diff)) })}
            <span>{hit ? t('ui.qibla.onTargetSub') : live ? t('ui.qibla.compassOn') : t('ui.qibla.hint')}</span>
          </div>
          <div className="fl-qctrls">
            {!live && (
              <>
                <button type="button" className="fl-btn ghost" onClick={() => setHeading((v) => v - 10)}><Icon name="rotl" />{t('ui.qibla.left10')}</button>
                <button type="button" className="fl-btn ghost" onClick={() => setHeading((v) => v + 10)}>{t('ui.qibla.right10')}<Icon name="rotr" /></button>
              </>
            )}
            {'DeviceOrientationEvent' in window && !live && (
              <button type="button" className="fl-btn" onClick={startCompass}><Icon name="compass" />{t('ui.qibla.useCompass')}</button>
            )}
          </div>
        </div>

        <div>
          <h2 className="fl-sh">{t('ui.qibla.yourQibla')}</h2>
          <div className="fl-card">
            <div className="fl-row"><div className="lt"><b>{t('ui.qibla.direction')}</b><span>{t('ui.qibla.directionSub')}</span></div><span className="rv tnum">{qibla}° · {dirName(qibla)}</span></div>
            <div className="fl-row"><div className="lt"><b>{t('ui.qibla.distance')}</b><span>{t('ui.qibla.distanceSub')}</span></div><span className="rv tnum">{distance.toLocaleString()} km</span></div>
            <div className="fl-row"><div className="lt"><b>{t('ui.qibla.location')}</b><span>{location?.name}</span></div><span className="rv tnum">{location ? `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°` : ''}</span></div>
          </div>
          <h2 className="fl-sh">{t('ui.qibla.accuracy')}</h2>
          <div className="fl-card">
            <div className="fl-row"><div className="lt"><b>{t('ui.qibla.flat')}</b><span>{t('ui.qibla.flatSub')}</span></div></div>
            <div className="fl-row"><div className="lt"><b>{t('ui.qibla.calibrate')}</b><span>{t('ui.qibla.calibrateSub')}</span></div></div>
          </div>
        </div>
      </div>
      <h2 className="fl-sh" style={{ marginTop: 32 }}>{t('ui.qibla.map')}</h2>
      <div className="fl-legacy"><QiblaMap /></div>
    </>
  );
}
