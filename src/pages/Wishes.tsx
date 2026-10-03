import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context';
import { WISH_BG, type Wish } from '../data';
import { useNow } from '../lib/hooks';
import { buzz, graphemes, timeAgo, toBn } from '../lib/utils';
import { fetchWishes, sendWish, sharedWishes } from '../lib/wishesApi';
import { Quiz } from '../components/Quiz';
import { Icon, SectionHead } from '../components/ui';

const MAX_NAME = 40;
const MAX_TEXT = 600;
const COOLDOWN = 20_000; // shared mode: one wish per 20s from the same visitor
const DAY = 864e5;

const keyOf = (w: Wish) => `${w.at ?? 0}|${w.name}|${w.text.slice(0, 24)}`;

export function Wishes() {
  const { cfg, update, confetti, toast } = useApp();
  const shortName = cfg.name.charAt(0) + cfg.name.slice(1).toLowerCase();

  /* ---- Composer ---- */
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('💖');
  const [color, setColor] = useState(0);
  const [sending, setSending] = useState(false);
  const lastSent = useRef({ at: 0, text: '' });

  /* ---- Online wishes ---- */
  const [online, setOnline] = useState<Wish[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(sharedWishes ? 'loading' : 'idle');
  const load = useCallback(() => {
    if (!sharedWishes) return;
    fetchWishes()
      .then(list => { setOnline(list); setStatus('ready'); })
      .catch(() => setStatus(s => (s === 'ready' ? s : 'error'))); // keep showing old data if we had some
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  /* ---- Posting ---- */
  const [fresh, setFresh] = useState<string | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  const post = async () => {
    const clean = text.trim();
    if (!clean) return toast('আগে দু-লাইন লেখো');
    if (clean === lastSent.current.text) return toast('এটা তো একবার পাঠিয়েছো 🙂');
    if (sharedWishes && Date.now() - lastSent.current.at < COOLDOWN) return toast('একটু পরে আবার পাঠাও');

    const wish: Wish = { name: name.trim() || 'A friend', text: clean, emoji, color, at: Date.now() };
    if (sharedWishes) {
      setSending(true);
      try {
        await sendWish(wish);
        setOnline(list => [...list, wish]);
      } catch {
        setSending(false);
        return toast('পাঠানো গেল না, আবার চেষ্টা করো');
      }
      setSending(false);
    } else {
      update(c => { c.wishes.push(wish); });
    }

    lastSent.current = { at: Date.now(), text: clean };
    setFresh(keyOf(wish));
    setName('');
    setText('');
    confetti(70);
    buzz(20);
    toast('Wish পৌঁছে গেছে 💌');
    // Show the new note landing on the wall
    setTimeout(() => wallRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    setTimeout(() => setFresh(null), 4000);
  };

  const all = [...(cfg.wishes || []), ...online].reverse(); // newest first
  const emojis = graphemes(cfg.emojis);
  const loadingFirst = status === 'loading' && !online.length;

  return (
    <section className="page wishes-page" data-screen-label="05 Wishes">
      <SectionHead eyebrow="Chapter 03 · Wishes" bn title={<>দু-লাইন <span className="hl">লিখে যাও</span></>}
        text={`${shortName}-কে কিছু বলার থাকলে এখানে লেখো। ও পড়বে।`}>
        <div className="wish-meta">
          <span className="wish-count"><Icon name="mail" fill />{toBn(all.length)}টা চিরকুট এসেছে</span>
          <span className="wish-mode" title={sharedWishes ? 'সব wish এক জায়গায় জমা হয়' : 'Online wish চালু নেই'}>
            <Icon name={sharedWishes ? 'public' : 'smartphone'} />
            {sharedWishes ? 'সবাই দেখতে পাবে' : 'এই browser-এ save হবে'}
          </span>
        </div>
      </SectionHead>

      {/* Composer: form + live preview */}
      <div className="composer">
        <div className="composer-form">
          <div className="composer-title"><Icon name="edit" />চিরকুট লেখো</div>
          <input className="field" value={name} maxLength={MAX_NAME} onChange={e => setName(e.target.value)} placeholder="তোমার নাম" />
          <div className="field-wrap">
            <textarea className="field" rows={4} value={text} maxLength={MAX_TEXT} onChange={e => setText(e.target.value)}
              placeholder={`${shortName}-কে কী বলতে চাও…`} />
            <span className={`counter ${text.length > MAX_TEXT - 60 ? 'warn' : ''}`}>{toBn(text.length)}/{toBn(MAX_TEXT)}</span>
          </div>

          <div className="pick-row">
            <span className="pick-label">Emoji</span>
            <div className="emoji-pick">
              {emojis.map(e => (
                <button key={e} className={e === emoji ? 'on' : ''} onClick={() => setEmoji(e)} aria-label={e}>{e}</button>
              ))}
            </div>
          </div>
          <div className="pick-row">
            <span className="pick-label">রং</span>
            <div className="color-pick">
              {WISH_BG.map((t, i) => (
                <button key={i} className={i === color ? 'on' : ''} style={{ background: t.bg }} onClick={() => setColor(i)} aria-label={`রং ${i + 1}`} />
              ))}
            </div>
          </div>

          <button className="btn btn-mint send-btn" onClick={post} disabled={sending}>
            <Icon name="send" />{sending ? 'পাঠাচ্ছি…' : 'Wish পাঠাও'}
          </button>
        </div>

        <div className="composer-preview" aria-hidden="true">
          <span className="preview-label">এভাবে দেখাবে</span>
          <Note wish={{ name: name.trim() || 'তোমার নাম', text: text.trim() || 'তোমার কথাগুলো এখানে দেখা যাবে…', emoji, color }}
            tilt={-1.5} placeholder={!text.trim()} />
        </div>
      </div>

      {/* Wall */}
      <div className="wall-head" ref={wallRef}>
        <div className="eyebrow">সবার চিরকুট</div>
      </div>

      {loadingFirst ? (
        <div className="wall">{[0, 1, 2].map(i => <div key={i} className="wish skeleton" />)}</div>
      ) : status === 'error' && !online.length && !all.length ? (
        <div className="wall-empty">
          <Icon name="cloud_off" />
          <p>Wish গুলো আনা গেল না।</p>
          <button className="btn btn-ghost" onClick={() => { setStatus('loading'); load(); }}><Icon name="refresh" />আবার চেষ্টা করো</button>
        </div>
      ) : !all.length ? (
        <div className="wall-empty">
          <Icon name="edit_note" />
          <p>এখনো কেউ লেখেনি। প্রথম চিরকুটটা তুমিই লেখো!</p>
        </div>
      ) : (
        <div className="wall">
          {all.map((w, i) => (
            <Note key={keyOf(w) + i} wish={w} index={i} tilt={((i % 3) - 1) * 1.4} fresh={fresh === keyOf(w)} />
          ))}
        </div>
      )}

      <div style={{ marginTop: 'clamp(56px,8vw,96px)' }}><Quiz /></div>
    </section>
  );
}

/** One pinned note on the wall (also used for the live preview). */
function Note({ wish, index = 0, tilt = 0, fresh = false, placeholder = false }: {
  wish: Wish; index?: number; tilt?: number; fresh?: boolean; placeholder?: boolean;
}) {
  const now = useNow(60_000);
  const t = WISH_BG[(wish.color ?? index) % WISH_BG.length];
  const isNew = !!wish.at && now - wish.at < DAY;

  return (
    <article className={`wish ${fresh ? 'fresh' : ''} ${placeholder ? 'placeholder' : ''}`}
      style={{ background: t.bg, color: t.fg, ['--tilt' as string]: `${tilt}deg` }}>
      <span className="wish-tape" />
      <div className="wish-top">
        <span className="wish-emoji">{wish.emoji}</span>
        {isNew && !placeholder && <span className="wish-new">নতুন</span>}
        <span className="wish-quote">”</span>
      </div>
      <p>{wish.text}</p>
      <div className="wish-foot">
        <span className="wish-sign" style={{ color: t.sig }}>— {wish.name}</span>
        {wish.at && !placeholder && <time>{timeAgo(wish.at, now)}</time>}
      </div>
    </article>
  );
}
