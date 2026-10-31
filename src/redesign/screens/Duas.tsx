import { useMemo, useState } from 'react';
import { duas, categories, type DuaCategory } from '../../data/duas';
import { useTracker } from '../../store/useTracker';
import { useTranslation } from '../../i18n/useTranslation';
import { Icon } from '../icons';
import { PageHead } from '../shared';
import { useToast } from '../lib';

const DHIKR = [
  { ar: 'سُبْحَانَ اللَّهِ', key: 'subhanallah' },
  { ar: 'الْحَمْدُ لِلَّهِ', key: 'alhamdulillah' },
  { ar: 'اللَّهُ أَكْبَرُ', key: 'allahuakbar' },
] as const;
const PAGE = 12;

export function DuasScreen() {
  const { t, language } = useTranslation();
  const toast = useToast();
  const saved = useTracker((s) => s.savedDuas);
  const toggleSaved = useTracker((s) => s.toggleSavedDua);
  const [cat, setCat] = useState<'all' | 'saved' | DuaCategory>('all');
  const [shown, setShown] = useState(PAGE);
  const [count, setCount] = useState(0);
  const [set, setSet] = useState(0);

  const list = useMemo(
    () => duas.filter((d) => cat === 'all' || (cat === 'saved' ? saved.includes(d.id) : d.category === cat)),
    [cat, saved],
  );
  const catLabel = (id: DuaCategory) => {
    const c = categories.find((x) => x.id === id)!;
    if (language === 'ar') return c.labelAr;
    const k = `dua.categories.${id}` as 'dua.categories.prayer';
    const v = t(k);
    return v === k ? c.label : v;
  };

  const tap = () => {
    let n = count + 1, s = set;
    if (n > 33) { n = 1; s = (s + 1) % 3; }
    setCount(n);
    setSet(s);
    if (navigator.vibrate) navigator.vibrate(n === 33 ? [30, 60, 30] : 10);
  };
  const C = 2 * Math.PI * 52;
  const dh = DHIKR[set];

  return (
    <>
      <PageHead title={t('ui.duas.title')} subtitle={t('ui.duas.subtitle')} />
      <div className="fl-card fl-tasbih">
        <button type="button" className="fl-tbtn" onClick={tap} aria-label={t('ui.duas.count', { name: t(`ui.duas.${dh.key}`), n: count })}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="var(--surface)" stroke="var(--line)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--emerald)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - count / 33)} style={{ transition: 'stroke-dashoffset .25s' }} />
          </svg>
          <b className="tnum">{count}</b>
        </button>
        <div>
          <div className="ar" lang="ar">{dh.ar}</div>
          <p>{t(`ui.duas.${dh.key}`)} · {t('ui.duas.progress', { n: count, s: set + 1 })}</p>
          <button type="button" className="fl-btn ghost" onClick={() => { setCount(0); setSet(0); }}><Icon name="reset" />{t('ui.duas.startAgain')}</button>
        </div>
      </div>

      <div className="fl-chips" role="group" aria-label={t('ui.duas.title')}>
        <button type="button" className="fl-chip" aria-pressed={cat === 'all'} onClick={() => { setCat('all'); setShown(PAGE); }}>{t('ui.duas.all')}</button>
        <button type="button" className="fl-chip" aria-pressed={cat === 'saved'} onClick={() => { setCat('saved'); setShown(PAGE); }}>{t('ui.duas.saved')}{saved.length ? ` · ${saved.length}` : ''}</button>
        {categories.map((c) => (
          <button key={c.id} type="button" className="fl-chip" aria-pressed={cat === c.id} onClick={() => { setCat(c.id); setShown(PAGE); }}>{catLabel(c.id)}</button>
        ))}
      </div>

      <div className="fl-duas">
        {list.length === 0 && <div className="fl-soft fl-empty">{t('ui.duas.noSaved')}</div>}
        {list.slice(0, shown).map((d) => {
          const isSaved = saved.includes(d.id);
          const name = catLabel(d.category);
          return (
            <article key={d.id} className="fl-card fl-dua">
              <div className="top">
                <b>{name}</b>
                <div style={{ display: 'flex' }}>
                  <button type="button" className="fl-iconbtn" aria-label={t('ui.duas.copy', { name })} onClick={() => { navigator.clipboard?.writeText(`${d.arabic}\n\n${d.translation}\n— ${d.reference}`); toast(t('ui.duas.copied')); }}><Icon name="copy" /></button>
                  <button type="button" className="fl-iconbtn" aria-label={t('ui.duas.save', { name })} aria-pressed={isSaved} style={isSaved ? { color: 'var(--emerald)' } : undefined} onClick={() => { toggleSaved(d.id); toast(isSaved ? t('ui.duas.removed') : t('ui.duas.savedToast')); }}><Icon name="bookmark" filled={isSaved} /></button>
                </div>
              </div>
              <div className="ar" lang="ar">{d.arabic}</div>
              <p>{d.translation}</p>
              <small>{d.reference}</small>
            </article>
          );
        })}
      </div>
      {list.length > shown && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button type="button" className="fl-btn ghost" onClick={() => setShown((n) => n + PAGE)}>{t('ui.duas.showMore')}</button>
        </div>
      )}
    </>
  );
}
