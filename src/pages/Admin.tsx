import { useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { useApp } from '../context';
import { DEF, type Config, type Effects, type Paper } from '../data';
import { photosOf } from '../lib/derive';
import { clone, compressImage } from '../lib/utils';
import { sharedWishes } from '../lib/wishesApi';
import { Icon } from '../components/ui';
import { PAPERS, PAPER_NAMES, PaperThumb, paperOf } from './home/QuoteNotes';

type Tab = 'general' | 'photos' | 'content' | 'story' | 'wishes' | 'words' | 'quiz' | 'backup';
const TABS: [Tab, string, string][] = [
  ['general', 'settings', 'General'], ['photos', 'image', 'Photos'], ['content', 'edit_note', 'লেখা ও Story'], ['story', 'timeline', 'আমাদের গল্প'],
  ['wishes', 'volunteer_activism', 'Wishes'], ['words', 'format_quote', 'প্রিয় লাইন ও Status'], ['quiz', 'quiz', 'Quiz'], ['backup', 'save', 'Backup'],
];

/* Keys of Config that hold plain text */
type TextKey = { [K in keyof Config]: Config[K] extends string ? K : never }[keyof Config];
/* Lists we can edit item by item */
type ListKey = 'photos' | 'timeline' | 'story' | 'wishes' | 'quotes' | 'quiz';

/* Stay logged in (and on the same tab) while moving between pages. */
const session: { authed: boolean; tab: Tab } = { authed: false, tab: 'general' };

export function Admin() {
  const { go } = useApp();
  const [authed, setAuthedState] = useState(session.authed);
  const [tab, setTabState] = useState<Tab>(session.tab);
  const setAuthed = (v: boolean) => { session.authed = v; setAuthedState(v); };
  const setTab = (v: Tab) => { session.tab = v; setTabState(v); };

  return (
    <section className="page admin" data-screen-label="10 Admin">
      <div className="admin-head">
        <div>
          <div className="label">Admin panel</div>
          <h2>সব কিছু এখান থেকে বদলাও</h2>
        </div>
        <button className="btn btn-ghost" onClick={() => go('home')}><Icon name="arrow_back" />Website দেখো</button>
      </div>

      {!authed ? <LockBox onUnlock={() => setAuthed(true)} /> : (
        <>
          <div className="tabs">
            {TABS.map(([id, ic, label]) => (
              <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}><Icon name={ic} />{label}</button>
            ))}
          </div>
          <div className="panel">
            {tab === 'general' && <GeneralTab />}
            {tab === 'photos' && <PhotosTab />}
            {tab === 'content' && <ContentTab />}
            {tab === 'story' && <StoryTab />}
            {tab === 'wishes' && <WishesTab />}
            {tab === 'words' && <WordsTab />}
            {tab === 'quiz' && <QuizTab />}
            {tab === 'backup' && <BackupTab />}
          </div>
        </>
      )}
    </section>
  );
}

function LockBox({ onUnlock }: { onUnlock: () => void }) {
  const { cfg, toast } = useApp();
  const [pass, setPass] = useState('');
  const tryUnlock = () => (pass === cfg.passcode ? onUnlock() : toast('ভুল passcode'));
  return (
    <div className="lock-box">
      <div><Icon name="lock" />Passcode দাও</div>
      <input className="field" type="password" placeholder="Passcode" value={pass}
        onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && tryUnlock()} />
      <button className="btn btn-mint" onClick={tryUnlock}>Unlock</button>
    </div>
  );
}

/* ---------- Form helpers ---------- */

function Field({ label, k, type = 'text', full = false, placeholder, extra }: {
  label: string; k: TextKey | 'candles'; type?: string; full?: boolean; placeholder?: string; extra?: InputHTMLAttributes<HTMLInputElement>;
}) {
  const { cfg, update } = useApp();
  return (
    <label className={full ? 'full' : ''}>{label}
      <input className="field" type={type} value={String(cfg[k] ?? '')} placeholder={placeholder} {...extra}
        onChange={e => { const v = e.target.value; update(c => { (c as unknown as Record<string, string>)[k] = v; }); }} />
    </label>
  );
}

function Area({ label, k, rows = 3, full = true }: { label: string; k: TextKey; rows?: number; full?: boolean }) {
  const { cfg, update } = useApp();
  return (
    <label className={full ? 'full' : ''}>{label}
      <textarea className="field" rows={rows} value={cfg[k]} onChange={e => { const v = e.target.value; update(c => { c[k] = v; }); }} />
    </label>
  );
}

/** Textarea bound to a string[] (one item per line, or comma separated). */
function ListArea({ label, k, sep, rows = 3, full = true }: { label: string; k: 'reasons' | 'tags' | 'status'; sep: string; rows?: number; full?: boolean }) {
  const { cfg, update } = useApp();
  return (
    <label className={full ? 'full' : ''}>{label}
      <textarea className="field" rows={rows} value={(cfg[k] || []).join(sep)}
        onChange={e => { const v = e.target.value; update(c => { c[k] = v.split(sep); }); }} />
    </label>
  );
}

/** Input / textarea for one field of one list item. */
function ItemField<L extends ListKey>({ list, i, k, area = false, rows = 3, placeholder, style }: {
  list: L; i: number; k: string; area?: boolean; rows?: number; placeholder?: string; style?: CSSProperties;
}) {
  const { cfg, update } = useApp();
  const item = cfg[list][i] as unknown as Record<string, string>;
  const set = (v: string) => update(c => { (c[list][i] as unknown as Record<string, string>)[k] = v; });
  return area
    ? <textarea className="field" rows={rows} value={item[k] || ''} placeholder={placeholder} style={style} onChange={e => set(e.target.value)} />
    : <input className="field" value={item[k] || ''} placeholder={placeholder} style={style} onChange={e => set(e.target.value)} />;
}

function DelButton({ list, i }: { list: ListKey; i: number }) {
  const { update } = useApp();
  return <button className="mini del" title="মুছে ফেলো" onClick={() => update(c => { c[list].splice(i, 1); })}><Icon name="delete" /></button>;
}

/** Hidden file input inside a clickable label. */
function ImagePicker({ className, title, children, multiple = false, onFiles }: {
  className?: string; title?: string; children: ReactNode; multiple?: boolean; onFiles: (files: File[]) => void;
}) {
  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (files.length) onFiles(files);
  };
  return (
    <label className={className} title={title}>
      {children}
      <input type="file" accept="image/*" multiple={multiple} onChange={change} hidden />
    </label>
  );
}

/* ---------- Tabs ---------- */

function GeneralTab() {
  const { cfg, update, fireworks, confetti, showGate } = useApp();
  const Toggle = ({ label, on, flip }: { label: string; on: boolean; flip: () => void }) => (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={flip}><span>{label}</span><span className="switch" /></button>
  );
  const effect = (k: keyof Effects) => () => update(c => { c.effects[k] = !c.effects[k]; });

  return (
    <>
      <div className="form-grid">
        <Field label="ছোট নাম" k="name" />
        <Field label="পুরো নাম" k="fullName" />
        <Field label="কার পক্ষ থেকে" k="sender" />
        <Field label="Birthday date + time" k="date" type="datetime-local" extra={{ style: { colorScheme: 'dark' } }} />
        <Field label="YouTube music link" k="music" full placeholder="https://youtube.com/watch?v=..." />
        <Field label="Candle সংখ্যা (১-৯)" k="candles" type="number" extra={{ min: 1, max: 9 }} />
        <Field label="Admin passcode" k="passcode" />
      </div>
      <div className="admin-sub">Effects ও settings</div>
      <div className="toggles">
        <Toggle label="Floating emoji ও আলো (Home)" on={cfg.effects.particles} flip={effect('particles')} />
        <Toggle label="Fireworks / আতশবাজি" on={cfg.effects.fireworks} flip={effect('fireworks')} />
        <Toggle label="Confetti" on={cfg.effects.confetti} flip={effect('confetti')} />
        <Toggle label="Cursor sparkle (Home)" on={cfg.effects.cursor} flip={effect('cursor')} />
        <Toggle label="রাত ১২টার আগে website lock" on={!!cfg.lock} flip={() => update(c => { c.lock = !c.lock; })} />
      </div>
      <div className="admin-actions">
        <button className="btn btn-mint" onClick={() => { fireworks(10); confetti(220); }}><Icon name="celebration" />Fireworks test</button>
        <button className="btn btn-ghost" onClick={showGate}><Icon name="hourglass_top" />Countdown screen দেখো</button>
      </div>
    </>
  );
}

function PhotosTab() {
  const { cfg, update, toast } = useApp();

  const addPhotos = async (files: File[]) => {
    for (const f of files) {
      const src = await compressImage(f);
      update(c => { c.photos.push({ src, caption: '', poem: '' }); });
    }
    toast(files.length + 'টা ছবি যোগ হয়েছে');
  };
  const setImage = (fn: (c: Config, src: string) => void) => async (files: File[]) => {
    const src = await compressImage(files[0]);
    update(c => fn(c, src));
  };
  const moveUp = (i: number) => i && update(c => { const [it] = c.photos.splice(i, 1); c.photos.splice(i - 1, 0, it); });

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="admin-note">প্রথম ছবিটা Home-এর বড় ছবি। প্রথম ১০টা Home-এ 3D-তে ঘোরে, সবগুলো Gallery-তে থাকে। ↑ দিয়ে order বদলাও।</div>
      <ImagePicker className="btn btn-mint file-btn" multiple onFiles={addPhotos}><Icon name="add_photo_alternate" />নতুন ছবি যোগ করো</ImagePicker>
      <div className="photo-grid">
        {cfg.photos.map((p, i) => (
          <div key={i} className="item">
            <img src={p.src} alt="" />
            <ItemField list="photos" i={i} k="caption" placeholder="Caption" />
            <ItemField list="photos" i={i} k="poem" area placeholder="ছবির কবিতা" />
            <div className="item-tools">
              <button className="mini" title="আগে আনো" onClick={() => moveUp(i)}><Icon name="arrow_upward" /></button>
              <ImagePicker className="mini pick" title="বদলাও" onFiles={setImage((c, src) => { c.photos[i].src = src; })}><Icon name="swap_horiz" /></ImagePicker>
              <DelButton list="photos" i={i} />
            </div>
          </div>
        ))}
      </div>
      <div className="special-photos">
        <ImagePicker onFiles={setImage((c, src) => { c.cakePhoto = src; })}><img src={cfg.cakePhoto} alt="" />Cake page-এর character ছবি</ImagePicker>
        <ImagePicker onFiles={setImage((c, src) => { c.giftPhoto = src; })}><img src={cfg.giftPhoto} alt="" />Gift box-এর ছবি</ImagePicker>
      </div>
    </div>
  );
}

function ContentTab() {
  const { cfg, update } = useApp();
  const setPhoto = (i: number) => async (files: File[]) => {
    const src = await compressImage(files[0]);
    update(c => { c.timeline[i].photo = src; });
  };
  const addMemory = () => update(c => {
    c.timeline.push({ year: 'নতুন', title: 'New memory', text: 'এখানে লেখো...', photo: photosOf(c)[0].src });
  });

  return (
    <>
      <div className="form-grid wide">
        <Field label="Home-এর ছোট লাইন" k="heroKicker" />
        <Area label="Home-এর ছোট্ট লেখা (নামের নিচে)" k="heroNote" rows={2} />
        <Field label="Cake page title" k="cakeTitle" />
        <Area label="Home-এর কবিতা" k="heroSub" rows={5} />
        <Field label="নামের নিচে ঘুরে ঘুরে আসা লাইন (কমা দিয়ে আলাদা)" k="heroWords" full />
        <ListArea label="ভালোবাসার কারণ (প্রতি লাইনে একটা)" k="reasons" sep={'\n'} rows={6} />
        <Area label="স্মৃতির চিঠির শুরুর লাইন" k="letterIntro" />
        <ListArea label="Tags (কমা দিয়ে আলাদা করো)" k="tags" sep="," full={false} />
        <Field label="Floating emoji (Home + wish picker)" k="emojis" extra={{ style: { fontSize: 20 } }} />
        <Area label="চিঠি" k="letter" rows={12} />
        <Field label="Gift title" k="giftTitle" />
        <Area label="Gift message" k="giftText" full={false} />
        <Area label="চিঠির শেষ লাইন" k="thanksText" rows={4} />
      </div>
      <div className="admin-row">
        <div className="admin-sub" style={{ margin: 0, fontSize: 16 }}>স্মৃতির চিঠি (Home page)</div>
        <button className="btn btn-mint" onClick={addMemory}><Icon name="add" />Memory</button>
      </div>
      <div className="stack" style={{ marginTop: 10 }}>
        {(cfg.timeline || []).map((t, i) => (
          <div key={i} className="item row">
            <ImagePicker className="pick" title="ছবি বদলাও" onFiles={setPhoto(i)}><img src={t.photo} alt="" /></ImagePicker>
            <div className="grow">
              <div className="inline">
                <ItemField list="timeline" i={i} k="year" placeholder="সময়" style={{ width: 130 }} />
                <ItemField list="timeline" i={i} k="title" placeholder="Title" style={{ flex: 1 }} />
              </div>
              <ItemField list="timeline" i={i} k="text" area />
            </div>
            <DelButton list="timeline" i={i} />
          </div>
        ))}
      </div>
    </>
  );
}

function WishesTab() {
  const { cfg } = useApp();
  return (
    <div className="stack">
      <div className="admin-note">{sharedWishes
        ? 'Online wish চালু আছে। বন্ধুদের পাঠানো wish গুলো Supabase dashboard → Table editor → wishes থেকে মুছতে পারবে। এখানে শুধু নিজের লেখা default wish গুলো।'
        : 'এই wish গুলো শুধু এই browser-এ থাকে। সবার wish এক জায়গায় দেখাতে README-র Supabase অংশটা দেখো।'}</div>
      {(cfg.wishes || []).map((_, i) => (
        <div key={i} className="item row">
          <ItemField list="wishes" i={i} k="emoji" style={{ width: 52, textAlign: 'center', fontSize: 18 }} />
          <ItemField list="wishes" i={i} k="name" style={{ width: 150 }} />
          <div className="grow"><ItemField list="wishes" i={i} k="text" area rows={2} /></div>
          <DelButton list="wishes" i={i} />
        </div>
      ))}
    </div>
  );
}

function WordsTab() {
  const { cfg, update } = useApp();
  const quotes = cfg.quotes || [];
  const addQuote = () => update(c => { (c.quotes = c.quotes || []).unshift({ text: 'নতুন লাইন...', orig: '', author: '', paper: '' }); });
  const move = (i: number, step: number) => update(c => {
    const j = i + step;
    if (j < 0 || j >= c.quotes.length) return;
    [c.quotes[i], c.quotes[j]] = [c.quotes[j], c.quotes[i]];
  });
  const setPaper = (i: number, paper: Paper | '') => update(c => { c.quotes[i].paper = paper; });

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="admin-row" style={{ margin: 0 }}>
        <div className="admin-note" style={{ maxWidth: 560 }}>
          প্রিয় লাইন বা নিজের মনের কথা যোগ করো। Home-এর "Favourite lines" অংশে খাতার পাতায় লেখা হয়ে দেখাবে।
          লেখকের নাম না জানলে ঘরটা খালি রাখো। নতুন লাইন সবার উপরে যোগ হয়।
        </div>
        <button className="btn btn-mint" onClick={addQuote}><Icon name="add" />নতুন লাইন</button>
      </div>
      {quotes.map((q, i) => (
        <div key={i} className="item" style={{ padding: 12, borderRadius: 16, gap: 6 }}>
          <div className="admin-row" style={{ margin: 0 }}>
            <span className="admin-note">পাতা {i + 1} · {PAPER_NAMES[paperOf(q, i)]}</span>
            <div className="inline">
              <button className="mini" title="উপরে" onClick={() => move(i, -1)} disabled={i === 0}><Icon name="arrow_upward" /></button>
              <button className="mini" title="নিচে" onClick={() => move(i, 1)} disabled={i === quotes.length - 1}><Icon name="arrow_downward" /></button>
              <DelButton list="quotes" i={i} />
            </div>
          </div>
          <ItemField list="quotes" i={i} k="text" area rows={4} placeholder="লাইনটা লেখো (Enter দিয়ে নতুন লাইন)" />
          <ItemField list="quotes" i={i} k="orig" placeholder="মূল ভাষায় লাইন (না দিলেও চলবে)" />
          <ItemField list="quotes" i={i} k="author" placeholder="লেখকের নাম (না জানলে খালি রাখো)" />
          <div className="paper-pick" role="radiogroup" aria-label="পাতার ধরন">
            <button className={!q.paper ? 'on' : ''} onClick={() => setPaper(i, '')} title="নিজে থেকে বদলাবে">
              <span className="paper-auto"><Icon name="autorenew" /></span>নিজে থেকে
            </button>
            {PAPERS.map(p => (
              <button key={p} className={q.paper === p ? 'on' : ''} onClick={() => setPaper(i, p)}>
                <PaperThumb paper={p} />{PAPER_NAMES[p]}
              </button>
            ))}
          </div>
          {q.paper && (
            <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', height: 38, fontSize: 13 }}
              onClick={() => update(c => { c.quotes.forEach(x => { x.paper = q.paper; }); })}>
              <Icon name="select_all" />সব পাতায় {PAPER_NAMES[q.paper]} দাও
            </button>
          )}
        </div>
      ))}
      {quotes.some(q => q.paper) && (
        <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', height: 40, fontSize: 14 }}
          onClick={() => update(c => { c.quotes.forEach(x => { x.paper = ''; }); })}>
          <Icon name="autorenew" />সব পাতা আবার নিজে থেকে মিশিয়ে দাও
        </button>
      )}
      <div className="form-grid" style={{ marginTop: 10 }}>
        <ListArea label="Birthday status (প্রতি লাইনে একটা)" k="status" sep={'\n'} rows={6} />
      </div>
    </div>
  );
}

function QuizTab() {
  const { cfg, update } = useApp();
  const addQuestion = () => update(c => { (c.quiz = c.quiz || []).push({ q: 'নতুন প্রশ্ন?', opts: 'A|B|C|D', a: 0 }); });
  return (
    <div className="stack">
      <div className="admin-row" style={{ margin: 0 }}>
        <div className="admin-note">Option গুলো | দিয়ে আলাদা করো। ডানের ঘরে সঠিক option-এর নম্বর (1, 2, 3…)। Quiz-টা Wishes page-এ দেখায়।</div>
        <button className="btn btn-mint" onClick={addQuestion}><Icon name="add" />প্রশ্ন</button>
      </div>
      {(cfg.quiz || []).map((q, i) => (
        <div key={i} className="item" style={{ padding: 12, borderRadius: 16, gap: 6 }}>
          <div className="inline">
            <ItemField list="quiz" i={i} k="q" placeholder="প্রশ্ন" style={{ flex: 1 }} />
            <DelButton list="quiz" i={i} />
          </div>
          <div className="inline">
            <ItemField list="quiz" i={i} k="opts" placeholder="A | B | C | D" style={{ flex: 1 }} />
            <input className="field" type="number" min={1} title="সঠিক উত্তর" style={{ width: 70 }} value={(+q.a || 0) + 1}
              onChange={e => { const a = Math.max(0, (parseInt(e.target.value, 10) || 1) - 1); update(c => { c.quiz[i].a = a; }); }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StoryTab() {
  const { cfg, update } = useApp();
  const setPhoto = (i: number) => async (files: File[]) => {
    const src = await compressImage(files[0]);
    update(c => { c.story[i].photo = src; });
  };
  const add = () => update(c => {
    (c.story = c.story || []).push({ date: 'তারিখ', title: 'নতুন দিন', text: 'এখানে লেখো…', photo: photosOf(c)[0].src });
  });
  const moveUp = (i: number) => i && update(c => { const [it] = c.story.splice(i, 1); c.story.splice(i - 1, 0, it); });

  return (
    <div className="stack">
      <div className="admin-row" style={{ margin: 0 }}>
        <div className="admin-note">Home page-এর "আমাদের গল্প" অংশ। উপর থেকে নিচে সময় অনুযায়ী সাজাও। সব মুছে দিলে অংশটা লুকিয়ে যাবে।</div>
        <button className="btn btn-mint" onClick={add}><Icon name="add" />দিন যোগ করো</button>
      </div>
      {(cfg.story || []).map((s, i) => (
        <div key={i} className="item row">
          <ImagePicker className="pick" title="ছবি বদলাও" onFiles={setPhoto(i)}><img src={s.photo} alt="" /></ImagePicker>
          <div className="grow">
            <div className="inline">
              <ItemField list="story" i={i} k="date" placeholder="কবে (যেমন ১২ মার্চ ২০২৩)" style={{ width: 170 }} />
              <ItemField list="story" i={i} k="title" placeholder="Title" style={{ flex: 1 }} />
            </div>
            <ItemField list="story" i={i} k="text" area placeholder="সেদিন কী হয়েছিল…" />
          </div>
          <div className="stack" style={{ gap: 6 }}>
            <button className="mini" title="উপরে আনো" onClick={() => moveUp(i)}><Icon name="arrow_upward" /></button>
            <DelButton list="story" i={i} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BackupTab() {
  const { cfg, replaceConfig, toast } = useApp();

  const exportCfg = () => {
    const blob = new Blob([JSON.stringify(cfg)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sumi-birthday-settings.json';
    a.click();
  };
  const importCfg = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      replaceConfig({ ...cfg, ...data, v: 9 });
      toast('Settings import হয়েছে');
    } catch {
      toast('File-টা ঠিক না');
    }
  };
  const reset = () => {
    if (!confirm('সব change মুছে default-এ ফিরবে। নিশ্চিত?')) return;
    replaceConfig(clone(DEF));
    toast('Default-এ ফেরানো হয়েছে');
  };

  return (
    <div className="stack" style={{ gap: 14, maxWidth: 620 }}>
      <p className="admin-note" style={{ margin: 0, fontSize: 15, lineHeight: 1.7 }}>
        সব change এই browser-এ save হয়। অন্য device-এ একই জিনিস দেখাতে Export করো, তারপর file-টা সেখানে Import করো।
      </p>
      <div className="admin-actions" style={{ margin: 0 }}>
        <button className="btn btn-mint" onClick={exportCfg}><Icon name="download" />Export settings</button>
        <label className="btn btn-ghost file-btn"><Icon name="upload" />Import settings<input type="file" accept=".json,application/json" onChange={importCfg} hidden /></label>
        <button className="btn btn-danger" onClick={reset}><Icon name="restart_alt" />সব default-এ ফেরাও</button>
      </div>
    </div>
  );
}
