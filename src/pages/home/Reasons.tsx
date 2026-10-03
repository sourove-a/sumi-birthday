import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context';
import { buzz, cleanLines, pad, toBn } from '../../lib/utils';
import { Icon, Reveal, SectionHead } from '../../components/ui';

/** Card face colours (front) — cycles through the site palette. */
const FACES = [
  { bg: '#cbec95', ink: '#0f2218' },
  { bg: '#ecf5a8', ink: '#0f2218' },
  { bg: '#f2f8e6', ink: '#0f2218' },
  { bg: '#9ad677', ink: '#0f2218' },
];
/** One small icon per reason on the open side. */
const ICONS = ['sentiment_very_satisfied', 'spa', 'auto_awesome', 'mood', 'favorite', 'visibility', 'all_inclusive'];

/** "05 · Why you": cards that flip open one by one, with a little surprise when all are open. */
export function Reasons() {
  const { cfg, confetti, fireworks } = useApp();
  const reasons = cleanLines(cfg.reasons);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [seen, setSeen] = useState<Record<number, boolean>>({});
  const seenCount = reasons.filter((_, i) => seen[i]).length;
  const allSeen = reasons.length > 0 && seenCount === reasons.length;

  const flip = (i: number) => {
    const opening = !open[i];
    setOpen(o => ({ ...o, [i]: opening }));
    if (opening) {
      setSeen(s => ({ ...s, [i]: true }));
      confetti(22);
      buzz(12);
    }
  };

  // The moment the last card is opened
  const celebrated = useRef(false);
  useEffect(() => {
    if (!allSeen || celebrated.current) return;
    celebrated.current = true;
    const t = setTimeout(() => { fireworks(5); confetti(140); buzz([30, 50, 30, 50, 60]); }, 700);
    return () => clearTimeout(t);
  }, [allSeen, fireworks, confetti]);

  const openAll = () => {
    const all = Object.fromEntries(reasons.map((_, i) => [i, true]));
    setOpen(all);
    setSeen(all);
  };

  if (!reasons.length) return null;

  return (
    <Reveal className="block reasons-block">
      <SectionHead eyebrow="05 · Tap the cards" bn title={<>কেন <span className="hl">তুমিই</span>?</>}
        text="অনেক কারণ আছে। কয়েকটা লিখে রাখলাম, একটা একটা করে খোলো।" />

      <div className="rc-progress" aria-live="polite">
        <div className="rc-hearts">
          {reasons.map((_, i) => <Icon key={i} name="favorite" fill={!!seen[i]} className={seen[i] ? 'on' : ''} />)}
        </div>
        <span>{allSeen ? 'সবগুলো খোলা হয়ে গেছে' : `${toBn(seenCount)}/${toBn(reasons.length)} খোলা হয়েছে`}</span>
        {!allSeen && seenCount > 0 && <button className="rc-all" onClick={openAll}>সবগুলো খোলো</button>}
      </div>

      <div className="rc-grid">
        {reasons.map((t, i) => {
          const face = FACES[i % FACES.length];
          const no = pad(i + 1);
          return (
            <button key={i} className={`rc ${open[i] ? 'open' : ''}`} onClick={() => flip(i)}
              style={{ ['--d' as string]: `${i * 70}ms` }} aria-label={open[i] ? t : `কারণ ${no}, খুলতে tap করো`}>
              <div className="rc-inner">
                {/* Closed side */}
                <div className="rc-face rc-front" style={{ background: face.bg, color: face.ink }}>
                  <span className="rc-corner tl">{no}</span>
                  <span className="rc-corner br">{no}</span>
                  <span className="rc-seal"><Icon name="favorite" fill /></span>
                  <span className="rc-tap">tap করো</span>
                  <span className="rc-shine" />
                </div>
                {/* Open side */}
                <div className="rc-face rc-back">
                  <span className="rc-icon"><Icon name={ICONS[i % ICONS.length]} /></span>
                  <p>{t}</p>
                  <span className="rc-label">কারণ {toBn(no)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {allSeen && (
        <div className="rc-final">
          <Icon name="favorite" fill />
          <p>বাকি কারণগুলো লিখে শেষ করা যাবে না।<br />ওগুলো সামনাসামনি বলবো।</p>
        </div>
      )}
    </Reveal>
  );
}
