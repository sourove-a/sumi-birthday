/* K-pop (BTS style) holographic photocard: tilts with the pointer, foil shine, flips to a purple back. */
import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import type { Config, Photo } from '../data';
import { shortDate, targetTime } from '../lib/derive';
import { pad } from '../lib/utils';

interface Props {
  cfg: Config;
  photo: Photo;
  index: number;      // 0-based number in the collection
  total: number;
  flipped?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  /** Tilt with the phone's motion sensor (used for the big card). */
  gyro?: boolean;
}

export function Photocard({ cfg, photo, index, total, flipped = false, onClick, className = '', style, gyro = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const year = new Date(targetTime(cfg)).getFullYear() || '';
  const name = cfg.name.charAt(0) + cfg.name.slice(1).toLowerCase();

  // px/py: 0..1 position -> tilt angle + where the foil shine sits
  const tilt = (px: number, py: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', `${(0.5 - py) * 18}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 22}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
    el.classList.add('active');
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' && gyro) return; // on phones the motion sensor drives it
    const r = e.currentTarget.getBoundingClientRect();
    tilt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };

  // Phone tilt: gamma = left/right, beta = forward/back (held at ~45°)
  useEffect(() => {
    if (!gyro) return;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const on = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt(clamp(0.5 + e.gamma / 50), clamp(0.5 + (e.beta - 45) / 60));
    };
    addEventListener('deviceorientation', on);
    return () => removeEventListener('deviceorientation', on);
  }, [gyro]);
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    ['--rx', '--ry', '--mx', '--my'].forEach(p => el.style.removeProperty(p));
    el.classList.remove('active');
  };

  return (
    <div ref={ref} className={`pc ${flipped ? 'flipped' : ''} ${className}`} style={style}
      onPointerMove={move} onPointerLeave={leave} onClick={onClick}>
      <div className="pc-tilt">
        <div className="pc-flip">
          {/* Front */}
          <div className="pc-face pc-front">
            <div className="pc-photo">
              <img src={photo.src} alt={photo.caption} loading="lazy" draggable={false} />
              <div className="pc-top"><span>{cfg.name}</span><span>💜</span></div>
              <div className="pc-bottom">
                <b>{name}</b>
                <small>{shortDate(cfg)} · Ver. {pad(index + 1)}</small>
              </div>
            </div>
            <div className="pc-holo" />
            <div className="pc-glare" />
          </div>

          {/* Back */}
          <div className="pc-face pc-back">
            <div className="pc-back-inner">
              <span className="pc-back-top">Birthday Edition · {year}</span>
              <strong>{cfg.name}</strong>
              <em>Borahae 💜</em>
              {photo.caption && <p>{photo.caption}</p>}
              <div className="pc-barcode" />
              <span className="pc-back-no">No. {pad(index + 1)} / {pad(total)}</span>
            </div>
            <div className="pc-holo" />
          </div>
        </div>
      </div>
    </div>
  );
}
