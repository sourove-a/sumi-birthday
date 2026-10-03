/* Fixed UI around the pages: top bar, dock, next-chapter card, lightbox, toast, veil. */
import { useEffect } from 'react';
import { useApp } from '../context';
import { CH, PAGES, type PageId } from '../data';
import { photosOf, shortDate } from '../lib/derive';
import { useSwipe } from '../lib/hooks';
import { Icon } from './ui';

export function TopBar({ onAdmin }: { onAdmin: () => void }) {
  const { cfg, musicPlaying, toggleMusic } = useApp();
  return (
    <header className="topbar">
      <button className={`music-btn ${musicPlaying ? 'playing' : ''}`} onClick={toggleMusic}>
        <Icon name={musicPlaying ? 'music_note' : 'music_off'} />
        <span className="txt">{musicPlaying ? 'Music' : 'Play music'}</span>
        <span className="eq"><i /><i /><i /></span>
      </button>
      <div className="name-chip">{cfg.name}&nbsp;·&nbsp;{shortDate(cfg)}</div>
      <button className="icon-btn" title="Admin panel" onClick={onAdmin}><Icon name="tune" /></button>
    </header>
  );
}

export function Dock() {
  const { page, go } = useApp();
  const i = PAGES.findIndex(p => p[0] === page);
  return (
    <nav className="dock">
      <div className="dock-inner" style={{ ['--i' as string]: Math.max(0, i) }}>
        <div className="dock-ind" style={{ opacity: i >= 0 ? 1 : 0 }} />
        {PAGES.map(([id, ic, label]) => (
          <button key={id} className={id === page ? 'on' : ''} title={label} onClick={() => go(id)}>
            <Icon name={ic} /><small>{label}</small>
          </button>
        ))}
      </div>
    </nav>
  );
}

/** Big card that leads to the next page. */
export function NextChapter() {
  const { page, go } = useApp();
  const i = PAGES.findIndex(p => p[0] === page);
  if (i < 1) return null;
  const last = i === PAGES.length - 1;
  const next: PageId = last ? 'home' : PAGES[i + 1][0];
  return (
    <div className="next-wrap">
      <button className="next-btn" onClick={() => go(next)}>
        <span>
          <span className="label">{last ? "That's all, for now" : 'Next'}</span>
          <strong>{last ? 'আবার প্রথম থেকে' : CH[i][0]}</strong>
          <small>{last ? 'আরেকবার দেখতে চাইলে' : CH[i][1]}</small>
        </span>
        <Icon name="arrow_outward" />
      </button>
    </div>
  );
}

export function Lightbox({ index, onChange, onClose }: { index: number; onChange: (i: number) => void; onClose: () => void }) {
  const { cfg } = useApp();
  const photos = photosOf(cfg);
  const n = photos.length;
  const i = ((index % n) + n) % n;
  const ph = photos[i];
  const swipe = useSwipe(() => onChange(i + 1), () => onChange(i - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange(i + 1);
      if (e.key === 'ArrowLeft') onChange(i - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [i, onChange, onClose]);

  return (
    <div className="lightbox" {...swipe.handlers} onClick={() => { if (!swipe.swiped()) onClose(); }}>
      <img src={ph.src} alt={ph.caption} />
      <strong>{ph.caption}</strong>
      <p>{ph.poem}</p>
      <div className="lightbox-nav">
        <button className="icon-btn" onClick={e => { e.stopPropagation(); onChange(i - 1); }} aria-label="আগের ছবি"><Icon name="arrow_back" /></button>
        <button className="icon-btn" onClick={e => { e.stopPropagation(); onChange(i + 1); }} aria-label="পরের ছবি"><Icon name="arrow_forward" /></button>
      </div>
    </div>
  );
}

export const Toast = ({ msg }: { msg: string }) => <div className="toast">{msg}</div>;

/** Curtain shown while switching pages. */
export const Veil = ({ name }: { name: string }) =>
  <div className="veil"><span>{name}</span></div>;
