import { useEffect, useRef, type PointerEvent } from 'react';
import { useApp } from '../context';
import { photosOf } from '../lib/derive';
import { pad } from '../lib/utils';
import { Icon, Reveal, SectionHead } from '../components/ui';
import { PhotocardGrid } from './home/Photocards';

export function Gallery() {
  const { cfg, openLightbox } = useApp();
  const photos = photosOf(cfg);
  const R = Math.round(90 / Math.tan(Math.PI / Math.max(photos.length, 3))) + 36;

  // 3D ring: slow auto-spin, drag to rotate with momentum
  const ringRef = useRef<HTMLDivElement>(null);
  const spin = useRef({ a: 0, v: 0, drag: null as null | { x: number; a: number }, moved: false });

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const g = spin.current;
      if (!g.drag) { g.v = g.v * 0.95 + -0.12 * 0.05; g.a += g.v; }
      if (ringRef.current) ringRef.current.style.transform = `rotateY(${g.a}deg)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const down = (e: PointerEvent) => { spin.current.drag = { x: e.clientX, a: spin.current.a }; spin.current.moved = false; spin.current.v = 0; };
  const move = (e: PointerEvent) => {
    const g = spin.current;
    if (!g.drag) return;
    const dx = e.clientX - g.drag.x;
    if (Math.abs(dx) > 6) g.moved = true;
    const next = g.drag.a + dx * 0.35;
    g.v = next - g.a;
    g.a = next;
  };
  const up = () => { spin.current.drag = null; setTimeout(() => { spin.current.moved = false; }, 50); };

  return (
    <section className="page center-page" data-screen-label="03 Gallery">
      <SectionHead eyebrow="Chapter 02 · Photos" bn title={<>সব ছবি <span className="hl">এক জায়গায়</span></>} text="যেটা ভালো লাগে, tap করে বড় করে দেখো।">
        <div className="chip-hint"><Icon name="swipe" />আঙুল দিয়ে টেনে ঘোরাও</div>
      </SectionHead>

      <div className="carousel" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}>
        <div className="ring" ref={ringRef}>
          {photos.map((p, i) => (
            <img key={i} src={p.src} alt="" draggable={false}
              style={{ transform: `rotateY(${(i * 360) / photos.length}deg) translateZ(${R}px)` }}
              onClick={() => { if (!spin.current.moved) openLightbox(i); }} />
          ))}
        </div>
      </div>

      <div style={{ width: '100%', marginTop: 'clamp(40px,6vw,72px)' }}><PhotocardGrid /></div>

      <div style={{ marginTop: 'clamp(40px,6vw,72px)' }}>
        <SectionHead eyebrow="Behind the photos" bn level={3} title={<>ছবির পেছনের <span className="hl">কথা</span></>} />
      </div>
      <div className="journal">
        {photos.map((p, i) => (
          <Reveal key={i} as="figure" onClick={() => openLightbox(i)}>
            <div className="journal-card">
              <img src={p.src} alt="" loading="lazy" />
              <div className="journal-num">{pad(i + 1)}</div>
              <figcaption>
                <strong>{p.caption}</strong>
                <i />
                <p>{p.poem}</p>
              </figcaption>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
