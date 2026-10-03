import { useRef, useState, type PointerEvent } from 'react';
import { useApp } from '../../context';
import { FILM_ORG } from '../../data';
import { photosOf } from '../../lib/derive';
import { useOnScreen, useSwipe } from '../../lib/hooks';
import { pad } from '../../lib/utils';
import { Icon } from '../../components/ui';

/** Instagram-story style slideshow: 5s per photo, tap sides / swipe to move, hold to pause. */
export function Film() {
  const { cfg } = useApp();
  const photos = photosOf(cfg);
  const n = photos.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef(0);
  const held = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(boxRef);
  const cur = ((index % n) + n) % n;
  const running = playing && !holding && visible; // pause while held or scrolled away

  const swipe = useSwipe(() => setIndex(cur + 1), () => setIndex(cur - 1));

  // Hold for a moment = pause (like stories); a quick tap still works as before
  const down = (e: PointerEvent) => {
    swipe.handlers.onPointerDown(e);
    held.current = false;
    holdTimer.current = window.setTimeout(() => { held.current = true; setHolding(true); }, 250);
  };
  const up = (e: PointerEvent) => {
    clearTimeout(holdTimer.current);
    setHolding(false);
    swipe.handlers.onPointerUp(e);
  };
  const tap = (step: number) => { if (!held.current && !swipe.swiped()) setIndex(cur + step); };

  return (
    <div ref={boxRef} className={`film ${running ? '' : 'paused'}`}
      onPointerDown={down} onPointerUp={up} onPointerCancel={up} onPointerLeave={() => { clearTimeout(holdTimer.current); setHolding(false); }}>
      {photos.map((p, i) => (
        <div key={i} className={`slide ${i === cur ? 'on' : ''}`}>
          <img src={p.src} alt="" loading="lazy" draggable={false} style={{ transformOrigin: FILM_ORG[i % FILM_ORG.length] }} />
          <div className="slide-cap">
            <span className="label">Scene {pad(i + 1)}</span>
            <strong>{p.caption}</strong>
            <span>{(p.poem || '').split('\n')[0]}</span>
          </div>
        </div>
      ))}

      <div className="film-bars">
        {photos.map((_, i) => (
          <div key={i} className={i < cur ? 'done' : i === cur ? 'active' : ''}>
            {/* new key per slide = the progress animation restarts */}
            <i key={i === cur ? 'a' + index : 'i'} onAnimationEnd={i === cur ? () => setIndex(cur + 1) : undefined} />
          </div>
        ))}
      </div>

      <div className="film-head">
        <div className="film-who">
          <img src={photos[0].src} alt="" />
          <div><b>{cfg.name}</b><small>by {cfg.sender}</small></div>
        </div>
        <span className="film-count">{pad(cur + 1)} / {pad(n)}</span>
      </div>

      {holding && <div className="film-hold"><Icon name="pause" fill /></div>}
      <button className="film-tap prev" onClick={() => tap(-1)} aria-label="আগের ছবি" />
      <button className="film-tap next" onClick={() => tap(1)} aria-label="পরের ছবি" />
      <button className="film-play" onPointerDown={e => e.stopPropagation()} onClick={() => setPlaying(p => !p)} aria-label="Play / pause">
        <Icon name={playing ? 'pause' : 'play_arrow'} fill />
      </button>
    </div>
  );
}
