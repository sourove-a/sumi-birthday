import { useEffect, useRef } from 'react';
import { useApp } from '../../context';
import { heroWordsOf, photosOf, shortDate } from '../../lib/derive';
import { useNow, useViewportWidth } from '../../lib/hooks';
import { Icon } from '../../components/ui';
import { Badge, HeroTitle, WindowBar } from '../../components/WindowBar';

/** Orbit sizes depend on the column width. */
function heroSizes(vw: number) {
  const colW = vw >= 880 ? Math.min(542, (Math.min(vw, 1120) - 37) / 2) : Math.min(vw - 36, 760);
  const orbD = Math.round(Math.min(360, colW * 0.6));
  const R = Math.round(Math.min(300, colW * 0.47));
  const w = Math.round(Math.max(58, orbD * 0.24));
  return { orbD, R, w, h: Math.round(w * 1.3), stageH: Math.round(orbD + Math.max(190, orbD * 0.6)) };
}

const PINS = [[14, 40], [85, 30], [70, 87]];

export function Hero() {
  const { cfg, go } = useApp();
  const photos = photosOf(cfg);
  const orbit = photos.slice(0, 10);
  const words = heroWordsOf(cfg);
  const tags = (cfg.tags || []).map(t => t.trim()).filter(Boolean).slice(0, 5);
  const vw = useViewportWidth();
  const now = useNow();
  const wordIndex = words.length ? Math.floor(now / 3000) % words.length : 0;
  const s = heroSizes(vw);

  // Tilt the 3D scene with the mouse
  const tiltRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      if (tiltRef.current) tiltRef.current.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 12}deg)`;
    };
    addEventListener('mousemove', onMove);
    return () => removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="window">
      <WindowBar cfg={cfg} />
      <div className="hero-grid">
        <div className="hero-main">
          <Badge>{cfg.heroKicker}</Badge>
          <HeroTitle cfg={cfg} />
          <div className="hero-actions">
            <button className="btn btn-dark" onClick={() => go('cake')}>Cake কাটবে চলো<Icon name="chevron_right" /></button>
            <button className="btn btn-lemon" onClick={() => go('gallery')}>ছবিগুলো দেখো</button>
          </div>
        </div>

        <div className="hero-stage" style={{ minHeight: s.stageH }}>
          <div className="glow" />
          <div className="hero-persp">
            <div className="hero-tilt" ref={tiltRef}>
              <div className="orbit-axis">
                <div className="orbit-ring" style={{ left: -s.R, top: -s.R, width: s.R * 2, height: s.R * 2 }} />
                <div className="orbit-spin">
                  {orbit.map((p, i) => (
                    <img key={i} src={p.src} alt="" style={{
                      left: -s.w / 2, top: -s.h / 2, width: s.w, height: s.h,
                      transform: `rotateY(${(i * 360) / orbit.length}deg) translateZ(${s.R}px)`,
                    }} />
                  ))}
                </div>
              </div>
              <div className="orb" style={{ width: s.orbD, height: s.orbD }}>
                <img src={photos[0].src} alt={cfg.name} />
                <div className="orb-gloss"><i /><i /></div>
                {PINS.map(([l, t]) => <span key={l} className="orb-pin" style={{ left: l + '%', top: t + '%' }} />)}
              </div>
            </div>
          </div>
          <div className="float" style={{ left: '7%', top: '9%' }}>
            <div className="float-tile" style={{ width: 64, height: 64, background: 'var(--lemon)', transform: 'rotate(-10deg)' }}><Icon name="redeem" /></div>
          </div>
          <div className="float" style={{ right: '7%', top: '11%', animationDuration: '6s', animationDelay: '.8s' }}>
            <div className="float-tile" style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--cream)', transform: 'rotate(12deg)', color: '#3f7a3a' }}><Icon name="favorite" fill /></div>
          </div>
          <div className="float" style={{ left: '6%', bottom: '8%', animationDuration: '5.6s', animationDelay: '.4s' }}>
            <div className="float-pill"><span><Icon name="cake" /></span>{cfg.name} · {shortDate(cfg)}</div>
          </div>
        </div>

        <div className="hero-side">
          <div className="dots">{words.map((_, i) => <i key={i} className={i === wordIndex ? 'on' : ''} />)}</div>
          <div className="words">{words.map((w, i) => <div key={i} className={i === wordIndex ? 'on' : ''}>{w}</div>)}</div>
          <p className="hero-note">{cfg.heroNote}</p>
          <div className="tagline">{tags.map((t, i) => <span key={i}>{t}</span>)}</div>
        </div>
      </div>
    </div>
  );
}
