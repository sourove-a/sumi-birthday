import { useEffect, useState } from 'react';
import type { Config } from '../data';
import { photosOf } from '../lib/derive';

/** Full-screen loader: waits for the main photos + fonts (max 7s). */
export function Loader({ cfg }: { cfg: Config }) {
  const [pct, setPct] = useState(0);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const srcs = [...new Set(photosOf(cfg).slice(0, 10).map(p => p.src).concat(cfg.cakePhoto))];
    const total = srcs.length + 1;
    const started = Date.now();
    let done = 0;
    let finished = false;
    const timers: number[] = [];
    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      setFading(true);
      timers.push(window.setTimeout(() => setGone(true), 800));
    };
    const step = () => {
      done++;
      setPct(Math.round((done / total) * 100));
      if (done >= total) timers.push(window.setTimeout(finish, Math.max(0, 1600 - (Date.now() - started))));
    };
    srcs.forEach(src => { const img = new Image(); img.onload = img.onerror = step; img.src = src; });
    document.fonts.ready.then(step, step);
    timers.push(window.setTimeout(finish, 7000));
    return () => timers.forEach(clearTimeout);
  }, []); // run once, on first load

  if (gone) return null;
  return (
    <div className={`loader ${fading ? 'out' : ''}`}>
      <div className="loader-ring"><span>{(cfg.name || 'S').charAt(0)}</span></div>
      <div className="loader-name">{cfg.name}</div>
      <div className="loader-bar"><div style={{ width: pct + '%' }} /></div>
      <div className="loader-note">একটু দাঁড়াও…</div>
    </div>
  );
}
