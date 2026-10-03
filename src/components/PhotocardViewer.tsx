/* Full-screen view of one photocard: tilt it, tap to flip, arrows to browse. */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context';
import { photosOf } from '../lib/derive';
import { useSwipe } from '../lib/hooks';
import { buzz } from '../lib/utils';
import { Photocard } from './Photocard';
import { Icon } from './ui';

export function PhotocardViewer({ index, onChange, onClose }: { index: number; onChange: (i: number) => void; onClose: () => void }) {
  const { cfg, confetti } = useApp();
  const photos = photosOf(cfg);
  const n = photos.length;
  const i = ((index % n) + n) % n;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setFlipped(false); }, [i]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange(i + 1);
      if (e.key === 'ArrowLeft') onChange(i - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [i, onChange, onClose]);

  const swipe = useSwipe(() => onChange(i + 1), () => onChange(i - 1));

  const flip = () => {
    if (swipe.swiped()) return;
    askMotionPermission();
    if (!flipped) confetti(30);
    buzz(12);
    setFlipped(f => !f);
  };

  // Portal to <body>: page animations would otherwise trap a fixed overlay
  return createPortal(
    <div className="pc-viewer" {...swipe.handlers} onClick={() => { if (!swipe.swiped()) onClose(); }}>
      <button className="icon-btn pc-close" aria-label="বন্ধ করো" onClick={onClose}><Icon name="close" /></button>
      <div onClick={e => e.stopPropagation()}>
        <Photocard key={i} cfg={cfg} photo={photos[i]} index={i} total={n} flipped={flipped} onClick={flip} className="pc-big" gyro />
      </div>
      <div className="pc-viewer-hint">Tap করলে উল্টাবে · ফোনটা একটু হেলাও</div>
      <div className="lightbox-nav" onClick={e => e.stopPropagation()}>
        <button className="icon-btn" onClick={() => onChange(i - 1)} aria-label="আগের card"><Icon name="arrow_back" /></button>
        <span className="pc-count">{i + 1} / {n}</span>
        <button className="icon-btn" onClick={() => onChange(i + 1)} aria-label="পরের card"><Icon name="arrow_forward" /></button>
      </div>
    </div>,
    document.body,
  );
}

/** iPhone asks once before giving motion data; ask inside the first tap. */
let motionAsked = false;
function askMotionPermission() {
  if (motionAsked) return;
  motionAsked = true;
  const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
  D?.requestPermission?.().catch(() => { /* denied: card still tilts with touch */ });
}