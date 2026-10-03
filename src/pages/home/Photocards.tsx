import { useState } from 'react';
import { useApp } from '../../context';
import { photosOf } from '../../lib/derive';
import { Photocard } from '../../components/Photocard';
import { PhotocardViewer } from '../../components/PhotocardViewer';
import { Icon, Reveal } from '../../components/ui';

/** Purple "photocard collection" block: five cards held like a fan. */
export function PhotocardFan() {
  const { cfg, go } = useApp();
  const photos = photosOf(cfg);
  const fan = photos.slice(0, 5);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Reveal className="pc-section">
      <div className="pc-section-head">
        <span className="pc-eyebrow">Photocard collection · Purple edition</span>
        <h2>তোমার নিজের <span>photocard</span> 💜</h2>
        <p>BTS তোমার এত প্রিয়, তাই এবার তোমার নিজের photocard বানিয়ে দিলাম। একটা একটা করে tap করে দেখো।</p>
      </div>

      <div className="pc-fan">
        {fan.map((p, i) => {
          const o = i - (fan.length - 1) / 2; // -2 .. 2
          return (
            <div key={i} className="pc-fan-slot" style={{
              ['--fan' as string]: `translateX(${o * 58}%) translateY(${Math.abs(o) * 16}px) rotate(${o * 8}deg)`,
              zIndex: 10 - Math.abs(o),
            }}>
              <Photocard cfg={cfg} photo={p} index={i} total={photos.length} onClick={() => setOpen(i)} />
            </div>
          );
        })}
      </div>

      <button className="pc-more" onClick={() => go('gallery')}>পুরো collection দেখো<Icon name="arrow_forward" /></button>

      {open !== null && <PhotocardViewer index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </Reveal>
  );
}

/** Grid of every photo as a photocard (Gallery page). */
export function PhotocardGrid() {
  const { cfg } = useApp();
  const photos = photosOf(cfg);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="pc-section pc-section-grid">
      <div className="pc-section-head">
        <span className="pc-eyebrow">The full collection</span>
        <h2>সবগুলো <span>photocard</span></h2>
        <p>{photos.length}টা card, সবগুলোই limited edition। শুধু একজনের জন্য। 💜</p>
      </div>
      <div className="pc-grid">
        {photos.map((p, i) => (
          <Reveal key={i}>
            <Photocard cfg={cfg} photo={p} index={i} total={photos.length} onClick={() => setOpen(i)} />
          </Reveal>
        ))}
      </div>
      {open !== null && <PhotocardViewer index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}
