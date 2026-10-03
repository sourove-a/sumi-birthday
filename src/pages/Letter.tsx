import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context';
import { bnDate, photoAt, shortDate } from '../lib/derive';
import { buzz } from '../lib/utils';
import { Icon, SectionHead } from '../components/ui';

export function Letter() {
  return (
    <>
      <LetterSection />
      <Gift />
    </>
  );
}

/* ================= Letter ================= */

type Stage = 'sealed' | 'opening' | 'reading';

/** Split the letter into greeting / paragraphs / closing lines. */
function parseLetter(text: string) {
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  let greeting = '';
  let closing = '';
  if (blocks.length && blocks[0].length < 40 && /^(প্রিয়|dear)/i.test(blocks[0])) greeting = blocks.shift()!;
  if (blocks.length > 1 && blocks[blocks.length - 1].length < 70) closing = blocks.pop()!;
  return { greeting, paras: blocks, closing };
}

/** Uneven (deckle) bottom edge for the paper, same on every visit. */
const DECKLE = (() => {
  const pts = ['0% 0%', '100% 0%'];
  for (let i = 0; i <= 40; i++) {
    const x = 100 - i * 2.5;
    const y = 100 - (((i * 37) % 7) / 7) * 1.1;
    pts.push(`${x}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(',')})`;
})();

function LetterSection() {
  const { cfg, confetti } = useApp();
  const [stage, setStage] = useState<Stage>('sealed');
  const [shown, setShown] = useState(0);
  const { greeting, paras, closing } = useMemo(() => parseLetter(cfg.letter || ''), [cfg.letter]);
  const done = shown >= paras.length;
  const sheetRef = useRef<HTMLElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const follow = useRef(true);

  /* Break the seal -> flap opens -> letter slides out -> reading view */
  const open = () => {
    if (stage !== 'sealed') return;
    setStage('opening');
    buzz([20, 30, 20]);
    confetti(40);
    setTimeout(() => {
      setStage('reading');
      setShown(0);
      follow.current = true;
      setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }, 1700);
  };

  // Paragraphs appear one by one; longer ones get a little more time
  useEffect(() => {
    if (stage !== 'reading' || done) return;
    const len = paras[shown]?.length ?? 0;
    const wait = shown === 0 ? 900 : Math.min(3800, 1100 + len * 18);
    const t = setTimeout(() => setShown(s => s + 1), wait);
    return () => clearTimeout(t);
  }, [stage, shown, done, paras]);

  // Keep the newest paragraph in view — stop as soon as she scrolls herself
  useEffect(() => {
    if (stage !== 'reading') return;
    const stop = () => { follow.current = false; };
    addEventListener('wheel', stop, { passive: true });
    addEventListener('touchmove', stop, { passive: true });
    return () => { removeEventListener('wheel', stop); removeEventListener('touchmove', stop); };
  }, [stage]);
  useEffect(() => {
    if (stage !== 'reading' || !follow.current || !shown) return;
    const last = sheetRef.current?.querySelectorAll('.ls-body p')[shown - 1] as HTMLElement | undefined;
    if (!last) return;
    const below = last.getBoundingClientRect().bottom - (innerHeight - 140);
    if (below > 0) window.scrollBy({ top: below, behavior: 'smooth' });
  }, [shown, stage]);

  const showAll = () => { follow.current = false; setShown(paras.length); };
  const reread = () => { setShown(0); follow.current = true; sheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const fold = () => {
    setStage('sealed');
    setShown(0);
    setTimeout(() => envRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  const shortName = cfg.name.charAt(0) + cfg.name.slice(1).toLowerCase();

  return (
    <section className="page center-page letter-page" data-screen-label="06 Letter">
      <SectionHead eyebrow="Chapter 04 · Letter" bn title={<>তোমার জন্য <span className="hl">একটা চিঠি</span></>}
        text={stage === 'reading' ? 'আস্তে আস্তে পড়ো। তাড়া নেই।' : 'সিলটা ভাঙলেই খুলে যাবে।'} />

      {stage !== 'reading' && (
        <div className="env-wrap" ref={envRef}>
          <button className={`env ${stage}`} onClick={open} aria-label="খামটা খোলো">
            <span className="env-back" />
            <span className="env-letter" aria-hidden="true">
              <span className="env-letter-greet">প্রিয় {shortName},</span>
              <i /><i /><i /><i />
            </span>
            <span className="env-pocket" />
            <span className="env-flap" />
            <span className="env-address">
              <small>To,</small>
              <b>{shortName}</b>
              <small>শুধু তোমার জন্য</small>
            </span>
            <span className="env-stamp" aria-hidden="true">
              <Icon name="favorite" fill />
              <span className="env-postmark">{shortDate(cfg)}</span>
            </span>
            <span className="env-seal" aria-hidden="true">
              <span className="half l">{cfg.sender.charAt(0)}</span>
              <span className="half r">{cfg.sender.charAt(0)}</span>
            </span>
          </button>
          <p className="env-hint"><Icon name="touch_app" />{stage === 'opening' ? 'খুলছে…' : 'সিলটায় tap করো'}</p>
        </div>
      )}

      {stage === 'reading' && (
        <article className="ls" ref={sheetRef}>
          <div className="ls-paper" style={{ clipPath: DECKLE }}>
            <figure className="ls-photo">
              <img src={photoAt(cfg, 5).src} alt="" />
              <figcaption>{cfg.name}</figcaption>
            </figure>
            <span className="ls-date">{bnDate(cfg)}</span>
            {greeting && <h3 className="ls-greet">{greeting}</h3>}

            <div className="ls-body">
              {paras.map((p, i) => <p key={i} className={i < shown ? 'in' : ''}>{p}</p>)}
            </div>

            <div className={`ls-end ${done ? 'in' : ''}`}>
              {closing && <p className="ls-closing">{closing}</p>}
              <div className="ls-sign">{cfg.sender}<svg viewBox="0 0 160 20" aria-hidden="true"><path d="M2 14 C 40 4, 80 20, 120 8 S 150 10, 158 6" /></svg></div>
            </div>

            <svg className="ls-flower" viewBox="0 0 90 120" aria-hidden="true">
              <path d="M45 118 C 44 90, 40 70, 46 44" className="stem" />
              <path d="M44 86 C 30 80, 24 70, 22 62 C 32 64, 40 72, 44 86 Z" className="leaf" />
              {[0, 72, 144, 216, 288].map(r => <ellipse key={r} cx="46" cy="30" rx="8" ry="15" transform={`rotate(${r} 46 44)`} className="petal" />)}
              <circle cx="46" cy="44" r="5" className="core" />
            </svg>
          </div>

          <div className="ls-tools">
            {!done && <button className="btn btn-ghost" onClick={showAll}><Icon name="unfold_more" />সবটা একসাথে দেখাও</button>}
            {done && <button className="btn btn-ghost" onClick={reread}><Icon name="replay" />আবার পড়ো</button>}
            {done && <button className="btn btn-mint" onClick={fold}><Icon name="mail" />ভাঁজ করে খামে রাখো</button>}
          </div>
        </article>
      )}
    </section>
  );
}

/* ================= Gift ================= */

function Gift() {
  const { cfg, fireworks, confetti } = useApp();
  const [state, setState] = useState<'closed' | 'shaking' | 'open'>('closed');
  const shortName = cfg.name.charAt(0) + cfg.name.slice(1).toLowerCase();

  const click = () => {
    if (state === 'shaking') return;
    if (state === 'open') return setState('closed');
    setState('shaking');
    buzz([15, 40, 15, 40, 15]);
    setTimeout(() => { setState('open'); buzz(60); fireworks(5); confetti(200); }, 650);
  };

  return (
    <section className="page center-page gift-page" data-screen-label="05 Gift">
      <SectionHead eyebrow="One more thing" bn title={<>আর একটা <span style={{ color: 'var(--lemon)' }}>বাক্স</span></>}
        text="অনেকদিন ধরে একটা কথা বলতে চাইছিলাম। এখানে রেখে দিলাম।" />
      <button className={`gift ${state === 'closed' ? '' : state}`} onClick={click} aria-label={state === 'open' ? 'বাক্সটা বন্ধ করো' : 'বাক্সটা খোলো'}>
        <span className="gift-rays" />
        <span className="gift-flash" />
        <span className="gift-floor" />
        <span className="gift-box"><span className="ribbon-v" /></span>
        <span className="gift-lid">
          <span className="ribbon-v" />
          <span className="bow"><i /><i /><b /></span>
        </span>
        <span className="gift-tag">To: {shortName}</span>
      </button>
      {state !== 'open' && <p className="env-hint"><Icon name="touch_app" />tap করে খোলো</p>}
      {state === 'open' && (
        <div className="gift-card">
          <img src={cfg.giftPhoto} alt="" />
          <div>
            <h3>{cfg.giftTitle}</h3>
            <p>{cfg.giftText}</p>
            <div className="gift-sign">— {cfg.sender}</div>
          </div>
        </div>
      )}
    </section>
  );
}
