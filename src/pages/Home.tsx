import { useApp } from '../context';
import type { Photo } from '../data';
import { dateLabel, photoAt, photosOf } from '../lib/derive';
import { cleanLines, copyText, pad } from '../lib/utils';
import { Icon, Reveal, SectionHead } from '../components/ui';
import { CountdownTile, DayTile } from './home/DayTiles';
import { Film } from './home/Film';
import { Hero } from './home/Hero';
import { OurStory } from './home/OurStory';
import { PhotocardFan } from './home/Photocards';
import { QuoteNotes } from './home/QuoteNotes';
import { Reasons } from './home/Reasons';

export function Home() {
  return (
    <section className="page home" data-screen-label="01 Home">
      <Hero />
      <ForYouToday />
      <Reveal className="block">
        <SectionHead eyebrow="02 · Photos" bn title={<>তোমার কিছু <span className="hl">ছবি</span></>}
          text="তোমার ফোন থেকে চুরি করা। রাগ করো না।" />
        <Film />
      </Reveal>
      <PhotocardFan />
      <Ribbons />
      <PhotoStrips />
      <Words />
      <Reasons />
      <MemoryLetter />
      <OurStory />
      <Closing />
    </section>
  );
}

/* ---- 01 Bento cards ---- */
function ForYouToday() {
  const { cfg, openLightbox, musicPlaying, toggleMusic } = useApp();
  const fav = photoAt(cfg, 1);

  return (
    <Reveal className="block">
      <SectionHead eyebrow="01 · Today" bn title={<>আজ শুধু <span className="hl">তুমি</span></>}
        text="বাকি সব কাজ আজ পরে হবে।" />
      <div className="bento">
        <div className="bento-row">
          <div className="tile tile-poem lift">
            <div className="tile-head"><span className="label" style={{ color: 'var(--moss)' }}>Written for you</span><Icon name="favorite" fill /></div>
            <p>{cfg.heroSub}</p>
            <div className="sign">— {cfg.sender}</div>
          </div>
          <div className="tile tile-photo" onClick={() => openLightbox(1)}>
            <img src={fav.src} alt="" />
            <div className="tile-photo-cap">
              <div><span className="label" style={{ color: 'var(--lemon)' }}>My favourite photo</span><strong>{fav.caption}</strong></div>
              <span className="round-arrow"><Icon name="arrow_outward" /></span>
            </div>
          </div>
        </div>
        <div className="bento-row">
          <CountdownTile />
          <DayTile />
          <button className="tile tile-song lift" onClick={toggleMusic}>
            <span className="label" style={{ color: 'var(--leaf)' }}>Our song</span>
            <span className="play-disc"><Icon name={musicPlaying ? 'pause' : 'play_arrow'} fill /></span>
            <span>
              <span style={{ display: 'block', fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontSize: 28, lineHeight: 1.1 }}>আমাদের গান</span>
              <span style={{ display: 'block', marginTop: 6, fontFamily: 'var(--f-bn)', fontSize: 15, lineHeight: 1.5, color: 'var(--moss)' }}>
                {musicPlaying ? 'বাজছে… শুনতে শুনতে নিচে নামো' : 'Tap করলে বাজবে'}
              </span>
            </span>
          </button>
        </div>
      </div>
    </Reveal>
  );
}

/* ---- Two tilted scrolling ribbons with tags ---- */
function Ribbons() {
  const { cfg } = useApp();
  const tags = cleanLines(cfg.tags);
  const items = [...tags, ...tags].map((t, i) => <span key={i}>{t}</span>);
  return (
    <div className="ribbons" aria-hidden="true">
      <div className="ribbon back"><div className="ribbon-track">{items}</div></div>
      <div className="ribbon front"><div className="ribbon-track">{items}</div></div>
    </div>
  );
}

/* ---- 03 Endless photo strips ---- */
function PhotoStrips() {
  const { cfg, openLightbox } = useApp();
  const photos = photosOf(cfg);
  const strip = (list: Photo[]) => [...list, ...list].map((p, i) => (
    <div key={i} className="strip-item" onClick={() => openLightbox(photos.indexOf(p))}>
      <img src={p.src} alt="" loading="lazy" />
    </div>
  ));
  return (
    <Reveal className="strips">
      <SectionHead eyebrow="03 · More photos" bn title={<>সবগুলোতেই <span className="hl">সুন্দর</span></>} text="একটাও বাদ দিতে পারলাম না।" />
      <div className="strip"><div className="strip-track">{strip(photos)}</div></div>
      <div className="strip rev"><div className="strip-track">{strip(photos.slice().reverse())}</div></div>
    </Reveal>
  );
}

/* ---- 04 Quotes + copyable statuses ---- */
function Words() {
  const { cfg, toast } = useApp();
  const quotes = (cfg.quotes || []).filter(q => (q.text || '').trim());
  const statuses = cleanLines(cfg.status);
  const copy = (t: string) => copyText(t).then(
    () => toast('Copy হয়েছে, এবার status দাও'),
    () => toast('Copy হলো না, লেখাটা হাতে select করো'),
  );

  return (
    <Reveal className="block">
      <SectionHead eyebrow="04 · Favourite lines" bn title={<>ওরা আগেই <span className="hl">বলে গেছে</span></>}
        text="কিছু কথা কবিদের, কিছু আমার মনের। গুছিয়ে বলতে পারি না, তাই এখানে জমিয়ে রাখলাম।" />
      <QuoteNotes quotes={quotes} />
      <div className="sub-head"><div className="eyebrow">For your status</div><p>যেটা ভালো লাগে copy করে নাও।</p></div>
      <div className="statuses">
        {statuses.map((t, i) => (
          <div key={i} className="status">
            <img src={photoAt(cfg, i * 2 + 2).src} alt="" loading="lazy" />
            <div className="status-top"><span className="label">Status {pad(i + 1)}</span><Icon name="favorite" fill /></div>
            <div className="status-body">
              <p>{t}</p>
              <button className="copy-btn" onClick={() => copy(t)}><Icon name="content_copy" />Copy</button>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ---- 06 Handwritten memory letter ---- */
function MemoryLetter() {
  const { cfg } = useApp();
  return (
    <div className="block" style={{ alignItems: 'center', gap: 24 }}>
      <Reveal>
        <SectionHead eyebrow="06 · Looking back" bn title={<>একটু <span style={{ color: 'var(--lemon)' }}>পিছনে ফিরি</span></>} />
      </Reveal>
      <article className="memo">
        <div className="wax"><Icon name="favorite" fill /></div>
        <div className="memo-dear">প্রিয় {cfg.name},</div>
        <p className="memo-p">{cfg.letterIntro}</p>
        <div className="memories">
          {(cfg.timeline || []).map((t, i) => (
            <Reveal key={i} className="memory">
              <figure className="polaroid" style={{ margin: 0 }}>
                <img src={t.photo} alt="" loading="lazy" />
                <figcaption>{t.year}</figcaption>
              </figure>
              <div className="memory-text">
                <div className="memory-num">{pad(i + 1)}</div>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="memo-end">
          <p>{cfg.thanksText}</p>
          <div className="iti">ইতি,</div>
          <div className="who">{cfg.sender}</div>
        </div>
      </article>
    </div>
  );
}

/* ---- Closing card + footer ---- */
function Closing() {
  const { cfg, go, fireworks, confetti } = useApp();
  const photos = photosOf(cfg);
  return (
    <Reveal className="block" style={{ gap: 'clamp(56px,8vw,96px)' }}>
      <div className="closing">
        <div className="closing-text">
          <span className="label" style={{ color: 'var(--moss)' }}>One last thing</span>
          <h2>Cake টা কাটা বাকি</h2>
          <p>চোখ বন্ধ করে একটা wish করো। কী চাইলে, আমাকে বলতে হবে না।</p>
          <div className="closing-actions">
            <button className="btn btn-arrow" onClick={() => go('cake')}>চলো কাটি<span><Icon name="arrow_outward" /></span></button>
            <button className="btn btn-outline" onClick={() => { fireworks(10); confetti(220); }}><Icon name="celebration" />আতশবাজি</button>
          </div>
        </div>
        <div className="closing-photo"><img src={photoAt(cfg, Math.min(4, photos.length - 1)).src} alt="" /></div>
      </div>
      <footer className="footer">
        <div className="footer-big">Happy Birthday</div>
        <div className="footer-small">Made with <Icon name="favorite" fill /> by <b>{cfg.sender}</b><span>· {dateLabel(cfg)}</span></div>
      </footer>
    </Reveal>
  );
}
