import { useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { useApp } from '../context';
import { DEF, type Config, type Effects, type Paper } from '../data';
import { photosOf } from '../lib/derive';
import { clone, compressImage } from '../lib/utils';
import { hasCloudSync, saveCloudConfig } from '../lib/config';
import { sharedWishes } from '../lib/wishesApi';
import { Icon } from '../components/ui';
import { PAPERS, PAPER_NAMES, PaperThumb, paperOf } from './home/QuoteNotes';

type Tab = 'general' | 'photos' | 'content' | 'story' | 'words' | 'wishes' | 'quiz' | 'backup';

interface TabItem {
  id: Tab;
  icon: string;
  label: string;
  sub: string;
  badge?: (cfg: Config) => number | string | null;
}

const TABS: TabItem[] = [
  { id: 'general', icon: 'tune', label: 'সাধারণ সেটিংস', sub: 'নাম, তারিখ, গান ও ইফেক্ট' },
  { id: 'photos', icon: 'photo_library', label: 'ছবি গ্যালারি', sub: 'Hero, 3D Orbit ও অ্যালবাম', badge: c => c.photos.length },
  { id: 'content', icon: 'edit_note', label: 'মূল লেখা ও চিঠি', sub: 'হোমপেজ, রোমান্টিক চিঠি ও গিফট' },
  { id: 'story', icon: 'timeline', label: 'আমাদের গল্প', sub: 'টাইমলাইন ও স্মৃতির মাইলস্টোন', badge: c => (c.story || []).length },
  { id: 'words', icon: 'format_quote', label: 'প্রিয় লাইন ও চিরকুট', sub: 'খাতার পাতা ও স্ট্যাটাস নোট', badge: c => (c.quotes || []).length },
  { id: 'wishes', icon: 'volunteer_activism', label: 'উইশ ও বার্তা', sub: 'বন্ধুদের শুভেচ্ছা ও বার্তা', badge: c => (c.wishes || []).length },
  { id: 'quiz', icon: 'quiz', label: 'কুইজ গেম', sub: 'তাকে কতটা চেনো?', badge: c => (c.quiz || []).length },
  { id: 'backup', icon: 'cloud_sync', label: 'ক্লাউড ও ব্যাকআপ', sub: 'Supabase ডেটাবেজ ও JSON' },
];

/* Keys of Config that hold plain text */
type TextKey = { [K in keyof Config]: Config[K] extends string ? K : never }[keyof Config];
/* Lists we can edit item by item */
type ListKey = 'photos' | 'timeline' | 'story' | 'wishes' | 'quotes' | 'quiz';

/* Stay logged in (and on the same tab) while moving between pages. */
const session: { authed: boolean; tab: Tab } = { authed: false, tab: 'general' };

export function Admin() {
  const { go, cfg, toast } = useApp();
  const [authed, setAuthedState] = useState(session.authed);
  const [tab, setTabState] = useState<Tab>(session.tab);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  const setAuthed = (v: boolean) => { session.authed = v; setAuthedState(v); };
  const setTab = (v: Tab) => { session.tab = v; setTabState(v); };

  const handleForceCloudSync = async () => {
    setCloudSyncing(true);
    const ok = await saveCloudConfig(cfg);
    setCloudSyncing(false);
    if (ok) {
      toast('Supabase ক্লাউডে সফলভাবে সেভ হয়েছে! ✓');
    } else {
      toast('ক্লাউড সিঙ্ক করতে সমস্যা হয়েছে, ইন্টারনেট চেক করুন');
    }
  };

  return (
    <section className="page admin-page" data-screen-label="10 Admin">
      <div className="admin-shell">
        {/* Top Header */}
        <header className="admin-top-bar">
          <div className="admin-title-group">
            <div className="admin-badge">
              <span className="admin-pulse-dot" />
              <span>ADMIN CONTROL CENTER</span>
            </div>
            <h2>অ্যাডমিন কন্ট্রোল প্যানেল</h2>
            <p className="admin-subtitle">
              ওয়েবসাইটের সমস্ত ছবি, গান, চিঠি ও কনটেন্ট এখান থেকে সহজে পরিবর্তন করুন।
            </p>
          </div>

          <div className="admin-top-actions">
            {authed && (
              <button
                className={`btn btn-mint admin-sync-btn ${cloudSyncing ? 'loading' : ''}`}
                onClick={handleForceCloudSync}
                title="সরাসরি Supabase ডেটাবেজে সেভ করুন"
                disabled={cloudSyncing}
              >
                <Icon name={cloudSyncing ? 'sync' : 'cloud_done'} className={cloudSyncing ? 'spin' : ''} />
                <span>{cloudSyncing ? 'সিঙ্ক হচ্ছে...' : 'Cloud Sync'}</span>
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => go('home')}>
              <Icon name="visibility" />
              <span>ওয়েবসাইট দেখুন</span>
            </button>
            {authed && (
              <button className="btn btn-outline" onClick={() => setAuthed(false)} title="লক করুন">
                <Icon name="lock" />
                <span>লক করুন</span>
              </button>
            )}
          </div>
        </header>

        {/* Live Cloud Status Banner */}
        {authed && (
          <div className="admin-status-banner">
            <div className="admin-status-info">
              <span className="admin-live-tag">
                <Icon name="cloud_queue" />
                {hasCloudSync ? '🟢 Supabase Cloud Live Connected' : '🟡 Local Storage Active'}
              </span>
              <span className="admin-status-text">
                সব পরিবর্তন সাথে সাথে স্বয়ংক্রিয়ভাবে ডেটাবেজে সংরক্ষিত হচ্ছে। ভিজিটররা সরাসরি আপডেট দেখতে পাবে।
              </span>
            </div>
            <div className="admin-quick-links">
              <button className="admin-quick-pill" onClick={() => go('home')}><Icon name="home" /> Home</button>
              <button className="admin-quick-pill" onClick={() => go('gallery')}><Icon name="photo_library" /> Gallery</button>
              <button className="admin-quick-pill" onClick={() => go('cake')}><Icon name="cake" /> Cake</button>
              <button className="admin-quick-pill" onClick={() => go('letter')}><Icon name="mail" /> Letter</button>
              <button className="admin-quick-pill" onClick={() => go('wishes')}><Icon name="favorite" /> Wishes</button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {!authed ? (
          <LockBox onUnlock={() => setAuthed(true)} />
        ) : (
          <div className="admin-main-layout">
            {/* Scrollable Tabs */}
            <div className="admin-tabs-wrapper">
              <div className="admin-tabs-nav" role="tablist">
                {TABS.map(item => {
                  const count = item.badge ? item.badge(cfg) : null;
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`admin-tab-btn ${active ? 'active' : ''}`}
                      onClick={() => setTab(item.id)}
                      role="tab"
                      aria-selected={active}
                    >
                      <span className="admin-tab-icon"><Icon name={item.icon} /></span>
                      <span className="admin-tab-text">
                        <span className="admin-tab-title">{item.label}</span>
                        <span className="admin-tab-sub">{item.sub}</span>
                      </span>
                      {count !== null && <span className="admin-tab-badge">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tab Panel */}
            <div className="admin-panel-container">
              {tab === 'general' && <GeneralTab />}
              {tab === 'photos' && <PhotosTab />}
              {tab === 'content' && <ContentTab />}
              {tab === 'story' && <StoryTab />}
              {tab === 'words' && <WordsTab />}
              {tab === 'wishes' && <WishesTab />}
              {tab === 'quiz' && <QuizTab />}
              {tab === 'backup' && <BackupTab onForceSync={handleForceCloudSync} isSyncing={cloudSyncing} />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ==================== LOCK BOX ==================== */

function LockBox({ onUnlock }: { onUnlock: () => void }) {
  const { cfg, toast } = useApp();
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);

  const tryUnlock = () => {
    if (pass === cfg.passcode) {
      setError(false);
      onUnlock();
      toast('স্বাগতম! অ্যাডমিন প্যানেল আনলক হয়েছে ✓');
    } else {
      setError(true);
      toast('ভুল passcode! আবার চেষ্টা করুন');
    }
  };

  return (
    <div className="admin-lock-card">
      <div className="lock-icon-halo">
        <Icon name="lock" />
      </div>
      <h3>অ্যাডমিন প্যানেল আনলক করুন</h3>
      <p className="lock-sub">
        ওয়েবসাইটের ছবি, বার্তা, গান ও ডিজাইন পরিবর্তন করতে সিকিউরিটি পাসকোড প্রবেশ করান।
      </p>

      <div className="lock-input-group">
        <div className={`lock-input-wrap ${error ? 'has-error' : ''}`}>
          <Icon name="key" className="lock-field-icon" />
          <input
            className="lock-field"
            type={showPass ? 'text' : 'password'}
            placeholder="পাসকোড লিখুন..."
            value={pass}
            onChange={e => {
              setPass(e.target.value);
              if (error) setError(false);
            }}
            onKeyDown={e => e.key === 'Enter' && tryUnlock()}
            autoFocus
          />
          <button
            type="button"
            className="lock-eye-btn"
            onClick={() => setShowPass(!showPass)}
            title={showPass ? 'লুকান' : 'দেখুন'}
          >
            <Icon name={showPass ? 'visibility_off' : 'visibility'} />
          </button>
        </div>

        {error && (
          <div className="lock-error-text">
            <Icon name="error" /> ভুল পাসকোড! সঠিক পাসকোড দিয়ে আনলক করুন।
          </div>
        )}

        <div className="lock-hint-row">
          <span>ডিফল্ট পাসকোড:</span>
          <button
            type="button"
            className="lock-hint-chip"
            onClick={() => { setPass('sumi07'); setError(false); }}
          >
            <code>sumi07</code> (ক্লিক করে বসান)
          </button>
        </div>
      </div>

      <button className="btn btn-mint lock-submit-btn" onClick={tryUnlock}>
        <Icon name="lock_open" />
        <span>প্যানেল আনলক করুন</span>
      </button>
    </div>
  );
}

/* ==================== FORM HELPERS ==================== */

function Card({
  icon,
  title,
  sub,
  extra,
  children,
}: {
  icon: string;
  title: string;
  sub?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title-group">
          <div className="admin-card-icon">
            <Icon name={icon} />
          </div>
          <div>
            <h3 className="admin-card-title">{title}</h3>
            {sub && <p className="admin-card-sub">{sub}</p>}
          </div>
        </div>
        {extra && <div className="admin-card-extra">{extra}</div>}
      </div>
      <div className="admin-card-body">{children}</div>
    </div>
  );
}

function Field({
  label,
  k,
  type = 'text',
  full = false,
  placeholder,
  hint,
  extra,
}: {
  label: string;
  k: TextKey | 'candles';
  type?: string;
  full?: boolean;
  placeholder?: string;
  hint?: string;
  extra?: InputHTMLAttributes<HTMLInputElement>;
}) {
  const { cfg, update } = useApp();
  return (
    <div className={`admin-field-group ${full ? 'col-full' : ''}`}>
      <label className="admin-field-label">
        <span>{label}</span>
      </label>
      <input
        className="field admin-input"
        type={type}
        value={String(cfg[k] ?? '')}
        placeholder={placeholder}
        {...extra}
        onChange={e => {
          const v = e.target.value;
          update(c => { (c as unknown as Record<string, string>)[k] = v; });
        }}
      />
      {hint && <span className="admin-field-hint">{hint}</span>}
    </div>
  );
}

function Area({
  label,
  k,
  rows = 3,
  full = true,
  placeholder,
  hint,
}: {
  label: string;
  k: TextKey;
  rows?: number;
  full?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const { cfg, update } = useApp();
  return (
    <div className={`admin-field-group ${full ? 'col-full' : ''}`}>
      <label className="admin-field-label">
        <span>{label}</span>
      </label>
      <textarea
        className="field admin-textarea"
        rows={rows}
        value={cfg[k]}
        placeholder={placeholder}
        onChange={e => {
          const v = e.target.value;
          update(c => { c[k] = v; });
        }}
      />
      {hint && <span className="admin-field-hint">{hint}</span>}
    </div>
  );
}

function ListArea({
  label,
  k,
  sep,
  rows = 4,
  full = true,
  placeholder,
  hint,
}: {
  label: string;
  k: 'reasons' | 'tags' | 'status';
  sep: string;
  rows?: number;
  full?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const { cfg, update } = useApp();
  const list = cfg[k] || [];
  return (
    <div className={`admin-field-group ${full ? 'col-full' : ''}`}>
      <div className="admin-field-label-row">
        <label className="admin-field-label">{label}</label>
        <span className="admin-count-pill">{list.length}টি এন্ট্রি</span>
      </div>
      <textarea
        className="field admin-textarea"
        rows={rows}
        placeholder={placeholder}
        value={list.join(sep)}
        onChange={e => {
          const v = e.target.value;
          update(c => {
            c[k] = v.split(sep).map(s => s.trim()).filter(Boolean);
          });
        }}
      />
      {hint && <span className="admin-field-hint">{hint}</span>}
    </div>
  );
}

function ItemField<L extends ListKey>({
  list,
  i,
  k,
  area = false,
  rows = 3,
  placeholder,
  style,
}: {
  list: L;
  i: number;
  k: string;
  area?: boolean;
  rows?: number;
  placeholder?: string;
  style?: CSSProperties;
}) {
  const { cfg, update } = useApp();
  const item = cfg[list][i] as unknown as Record<string, string>;
  const set = (v: string) => update(c => { (c[list][i] as unknown as Record<string, string>)[k] = v; });
  return area ? (
    <textarea
      className="field admin-textarea"
      rows={rows}
      value={item[k] || ''}
      placeholder={placeholder}
      style={style}
      onChange={e => set(e.target.value)}
    />
  ) : (
    <input
      className="field admin-input"
      value={item[k] || ''}
      placeholder={placeholder}
      style={style}
      onChange={e => set(e.target.value)}
    />
  );
}

function DelButton({ list, i, confirmMsg }: { list: ListKey; i: number; confirmMsg?: string }) {
  const { update, toast } = useApp();
  const handleDel = () => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    update(c => { c[list].splice(i, 1); });
    toast('মুছে ফেলা হয়েছে');
  };
  return (
    <button className="admin-tool-btn danger" title="মুছে ফেলুন" onClick={handleDel}>
      <Icon name="delete" />
    </button>
  );
}

function ImagePicker({
  className,
  title,
  children,
  multiple = false,
  onFiles,
}: {
  className?: string;
  title?: string;
  children: ReactNode;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
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

/* ==================== TAB 1: GENERAL ==================== */

function GeneralTab() {
  const { cfg, update, fireworks, confetti, showGate, musicPlaying, toggleMusic, toast } = useApp();
  const [showPass, setShowPass] = useState(false);

  const Toggle = ({ label, desc, on, flip }: { label: string; desc?: string; on: boolean; flip: () => void }) => (
    <button type="button" className={`admin-toggle-card ${on ? 'active' : ''}`} onClick={flip}>
      <div className="admin-toggle-info">
        <span className="admin-toggle-title">{label}</span>
        {desc && <span className="admin-toggle-desc">{desc}</span>}
      </div>
      <span className="switch" />
    </button>
  );

  const effect = (k: keyof Effects) => () => update(c => { c.effects[k] = !c.effects[k]; });

  return (
    <div className="admin-tab-stack">
      {/* Profile & Birthday Identity */}
      <Card
        icon="face"
        title="জন্মদিনের ব্যক্তি ও পরিচয়"
        sub="ওয়েবসাইটের টাইটেল, হিরো সেকশন এবং জন্মদিনের সময় নির্ধারণ করুন"
      >
        <div className="admin-grid-2">
          <Field label="ছোট ডাকনাম (Nickname)" k="name" placeholder="সুমি" hint="টাইটেল ও বাটনগুলোতে দেখাবে" />
          <Field label="পুরো নাম (Full Name)" k="fullName" placeholder="মোসাঃ সামিয়া রহমান (সুমি)" hint="ব্যানার ও অফিসিয়াল কার্ডে দেখাবে" />
          <Field label="কার পক্ষ থেকে (Sender)" k="sender" placeholder="সৌরভ" hint="চিঠির শেষে ও ব্যানারে প্রদর্শিত হবে" />
          <Field
            label="Birthday Date & Time"
            k="date"
            type="datetime-local"
            hint="কাউন্টডাউন টাইমার এই সময়ের সাথে মিলিয়ে চলে"
            extra={{ style: { colorScheme: 'dark' } }}
          />
        </div>
      </Card>

      {/* Music & Cake Settings */}
      <Card
        icon="library_music"
        title="ব্যাকগ্রাউন্ড মিউজিক ও কেক সেটিংস"
        sub="YouTube মিউজিক ও কেকের মোমবাতি সংখ্যা"
      >
        <div className="admin-grid-2">
          <div className="col-full">
            <Field
              label="YouTube Music Link"
              k="music"
              full
              placeholder="https://www.youtube.com/watch?v=..."
              hint="YouTube ভিডিও বা মিউজিক লিংক দিন। ভিজিটররা প্লে বাটনে চাপলে এটি বাজবে।"
            />
            <div className="admin-inline-tools" style={{ marginTop: 8 }}>
              <button
                type="button"
                className={`btn ${musicPlaying ? 'btn-mint' : 'btn-ghost'}`}
                onClick={toggleMusic}
              >
                <Icon name={musicPlaying ? 'pause_circle' : 'play_circle'} />
                <span>{musicPlaying ? 'মিউজিক বন্ধ করুন' : 'মিউজিক টেস্ট করুন'}</span>
              </button>
              {cfg.music && (
                <a
                  href={cfg.music}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon name="open_in_new" />
                  <span>লিঙ্ক খুলে দেখুন</span>
                </a>
              )}
            </div>
          </div>

          <Field
            label="কেকের মোমবাতি সংখ্যা (১ থেকে ৯)"
            k="candles"
            type="number"
            placeholder="7"
            hint="কেক পেজে কয়টি মোমবাতি জ্বলবে"
            extra={{ min: 1, max: 9 }}
          />

          <div className="admin-field-group">
            <label className="admin-field-label">অ্যাডমিন পাসকোড (Security Passcode)</label>
            <div className="admin-passcode-wrap">
              <input
                className="field admin-input"
                type={showPass ? 'text' : 'password'}
                value={cfg.passcode}
                placeholder="sumi07"
                onChange={e => {
                  const v = e.target.value;
                  update(c => { c.passcode = v; });
                }}
              />
              <button
                type="button"
                className="admin-pass-toggle"
                onClick={() => setShowPass(!showPass)}
              >
                <Icon name={showPass ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
            <span className="admin-field-hint">প্যানেলে লগইন করার জন্য এই পাসকোডটি লাগবে।</span>
          </div>
        </div>
      </Card>

      {/* Visual Effects & Animations */}
      <Card
        icon="auto_awesome"
        title="স্পেশাল ইফেক্টস ও ম্যাজিক অ্যানিমেশন"
        sub="ওয়েবসাইটের কণা, আতশবাজি, পেটাল বৃষ্টি ও গেট স্ক্রিন নিয়ন্ত্রণ"
      >
        <div className="admin-toggle-grid">
          <Toggle
            label="🌸 Floating Emoji ও আলোর কণা"
            desc="হোমপেজে চারপাশ দিয়ে নরম ফুল ও আলোর কণা ভাসবে"
            on={cfg.effects.particles}
            flip={effect('particles')}
          />
          <Toggle
            label="🎆 Fireworks / আতশবাজি"
            desc="হোমপেজে ঢুকলে এবং কেক কাটার পর রঙিন আতশবাজি ফুটবে"
            on={cfg.effects.fireworks}
            flip={effect('fireworks')}
          />
          <Toggle
            label="🎊 Confetti / রঙিন কাগজের বৃষ্টি"
            desc="আনন্দঘন মুহূর্তে রঙিন কাগজ ঝরে পড়বে"
            on={cfg.effects.confetti}
            flip={effect('confetti')}
          />
          <Toggle
            label="✨ Cursor Sparkle (মাউস স্পার্কল)"
            desc="কম্পিউটারে মাউস নাড়ালে পেছনে স্পার্কল ছড়াবে"
            on={cfg.effects.cursor}
            flip={effect('cursor')}
          />
          <Toggle
            label="⏳ রাত ১২টার আগে Website Lock"
            desc="জন্মদিনের নির্দিষ্ট সময়ের আগে শুধুমাত্র কাউন্টডাউন দেখাবে"
            on={!!cfg.lock}
            flip={() => update(c => { c.lock = !c.lock; })}
          />
        </div>

        <div className="admin-actions-bar">
          <button
            type="button"
            className="btn btn-mint"
            onClick={() => {
              fireworks(12);
              confetti(240);
              toast('Fireworks ও Confetti টেস্ট হচ্ছে! 🎆');
            }}
          >
            <Icon name="celebration" />
            <span>Fireworks & Confetti টেস্ট করুন</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={showGate}>
            <Icon name="hourglass_top" />
            <span>Countdown স্ক্রিন প্রিভিউ</span>
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ==================== TAB 2: PHOTOS ==================== */

function PhotosTab() {
  const { cfg, update, toast } = useApp();

  const addPhotos = async (files: File[]) => {
    toast(`${files.length}টি ছবি অপটিমাইজ করা হচ্ছে...`);
    for (const f of files) {
      const src = await compressImage(f);
      update(c => { c.photos.push({ src, caption: '', poem: '' }); });
    }
    toast(`${files.length}টি নতুন ছবি সফলভাবে যুক্ত হয়েছে! ✓`);
  };

  const setImage = (fn: (c: Config, src: string) => void) => async (files: File[]) => {
    toast('ছবি আপডেট করা হচ্ছে...');
    const src = await compressImage(files[0]);
    update(c => fn(c, src));
    toast('ছবি সফলভাবে পরিবর্তন হয়েছে! ✓');
  };

  const move = (i: number, dir: -1 | 1) => {
    update(c => {
      const j = i + dir;
      if (j < 0 || j >= c.photos.length) return;
      const [it] = c.photos.splice(i, 1);
      c.photos.splice(j, 0, it);
    });
  };

  return (
    <div className="admin-tab-stack">
      {/* Upload Banner Card */}
      <Card
        icon="add_photo_alternate"
        title="ছবি আপলোড ও গ্যালারি ম্যানেজমেন্ট"
        sub="সব ছবি মোবাইল ও ডেস্কটপের জন্য স্বয়ংক্রিয়ভাবে অপটিমাইজ হয়"
      >
        <div className="admin-upload-zone">
          <ImagePicker className="admin-upload-dropzone" multiple onFiles={addPhotos}>
            <div className="admin-upload-icon-box">
              <Icon name="cloud_upload" />
            </div>
            <h4>নতুন ছবি যোগ করতে এখানে ক্লিক করুন</h4>
            <p>এক সাথে একাধিক ছবি নির্বাচন করতে পারেন (JPG, PNG, WebP)</p>
            <span className="btn btn-mint" style={{ marginTop: 8 }}>
              <Icon name="add" /> ছবি নির্বাচন করুন
            </span>
          </ImagePicker>
        </div>

        <div className="admin-info-banner" style={{ marginTop: 14 }}>
          <Icon name="info" />
          <div>
            <strong>ছবির অবস্থান গাইড:</strong>
            <p>
              • <strong>#১ম ছবি:</strong> হোমপেজের মূল হিরো ছবি হিসেবে বড় দেখায়。<br />
              • <strong>#১ম থেকে #১০ম ছবি:</strong> হোমপেজের 3D অরবিটে ঘোরে。<br />
              • <strong>সবগুলো ছবি:</strong> গ্যালারি পেজে অ্যালবাম ও ফটোকার্ড হিসেবে প্রদর্শিত হয়।
            </p>
          </div>
        </div>
      </Card>

      {/* Special Feature Photos */}
      <Card
        icon="star"
        title="স্পেশাল পেজের ছবিসমূহ"
        sub="কেক পেজ ও সিক্রেট গিফট বক্সের কাস্টম ছবি"
      >
        <div className="admin-special-photos-grid">
          <div className="admin-special-card">
            <div className="admin-special-preview">
              <img src={cfg.cakePhoto} alt="Cake character" />
            </div>
            <div className="admin-special-body">
              <h4>🎂 Cake Page Character ছবি</h4>
              <p>কেক পেজের উপরে ভাসমান ক্যারেক্টার ছবি</p>
              <ImagePicker
                className="btn btn-ghost"
                onFiles={setImage((c, src) => { c.cakePhoto = src; })}
              >
                <Icon name="swap_horiz" />
                <span>ছবি বদলান</span>
              </ImagePicker>
            </div>
          </div>

          <div className="admin-special-card">
            <div className="admin-special-preview">
              <img src={cfg.giftPhoto} alt="Gift card" />
            </div>
            <div className="admin-special-body">
              <h4>🎁 Gift Box সারপ্রাইজ ছবি</h4>
              <p>গিফট বক্স খুললে যে ছবি দেখা যাবে</p>
              <ImagePicker
                className="btn btn-ghost"
                onFiles={setImage((c, src) => { c.giftPhoto = src; })}
              >
                <Icon name="swap_horiz" />
                <span>ছবি বদলান</span>
              </ImagePicker>
            </div>
          </div>
        </div>
      </Card>

      {/* Photo Cards Grid */}
      <Card
        icon="collections"
        title={`গ্যালারির ছবিসমূহ (${cfg.photos.length}টি)`}
        sub="ছবিগুলোর ক্রম সাজান, ক্যাপশন এবং রোমান্টিক কবিতা লিখুন"
      >
        <div className="admin-photo-cards-grid">
          {cfg.photos.map((p, i) => {
            const isHero = i === 0;
            const isOrbit = i > 0 && i < 10;
            return (
              <div key={i} className={`admin-photo-card ${isHero ? 'is-hero' : ''}`}>
                <div className="admin-photo-img-wrap">
                  <img src={p.src} alt={`Photo ${i + 1}`} loading="lazy" />
                  <div className="admin-photo-badge">
                    #{i + 1} {isHero ? '• Hero ছবি' : isOrbit ? '• 3D Orbit' : ''}
                  </div>
                </div>

                <div className="admin-photo-inputs">
                  <ItemField list="photos" i={i} k="caption" placeholder="ক্যাপশন (যেমন: সুন্দর স্মৃতি...)" />
                  <ItemField
                    list="photos"
                    i={i}
                    k="poem"
                    area
                    rows={2}
                    placeholder="ছবির সাথে রোমান্টিক লাইন বা কবিতা..."
                  />
                </div>

                <div className="admin-photo-tools">
                  <button
                    className="admin-tool-btn"
                    title="আগে আনুন (Move Up)"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <Icon name="arrow_upward" />
                  </button>
                  <button
                    className="admin-tool-btn"
                    title="পরে নিন (Move Down)"
                    disabled={i === cfg.photos.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <Icon name="arrow_downward" />
                  </button>
                  <ImagePicker
                    className="admin-tool-btn"
                    title="এই ছবি বদলান"
                    onFiles={setImage((c, src) => { c.photos[i].src = src; })}
                  >
                    <Icon name="swap_horiz" />
                  </ImagePicker>
                  <DelButton
                    list="photos"
                    i={i}
                    confirmMsg={`ছবি #${i + 1} মুছে ফেলতে চান?`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ==================== TAB 3: CONTENT ==================== */

function ContentTab() {
  const { cfg, update, toast } = useApp();

  const setTimelinePhoto = (i: number) => async (files: File[]) => {
    const src = await compressImage(files[0]);
    update(c => { c.timeline[i].photo = src; });
    toast('টাইমলাইনের ছবি আপডেট হয়েছে');
  };

  const addMemory = () => {
    update(c => {
      c.timeline.push({
        year: '২০২৪',
        title: 'নতুন মধুর স্মৃতি',
        text: 'সেদিনের সেই বিশেষ মুহূর্তটি...',
        photo: photosOf(c)[0]?.src || '',
      });
    });
    toast('নতুন মেমোরি কার্ড যুক্ত হয়েছে');
  };

  return (
    <div className="admin-tab-stack">
      {/* Home Page Copywriting */}
      <Card
        icon="auto_stories"
        title="হোমপেজের মূল লেখা ও টেক্সট"
        sub="টাইটেল, কাব্যিক লাইন ও ভাসমান ইমোজি"
      >
        <div className="admin-grid-2">
          <Field
            label="Home-এর শীর্ষ লাইন (Kicker)"
            k="heroKicker"
            placeholder="আজকের দিনটা শুধুই তোমার..."
            hint="নামের ঠিক উপরে ছোট সোনালী অক্ষরে দেখায়"
          />
          <Field
            label="নামের নিচে ঘুরে ঘুরে আসা লাইন (কমা দিয়ে আলাদা)"
            k="heroWords"
            placeholder="আমার রাজকন্যা, আমার চাঁদের কণা, সবচেয়ে প্রিয় মানুষ"
            hint="নামের নিচে অ্যানিমেট হয়ে একটির পর একটি আসবে"
          />
          <Area
            label="হোমপেজের কাব্যিক নোট (Note)"
            k="heroNote"
            rows={2}
            full
            placeholder="তোমার হাসিতে আমার পুরো পৃথিবী আলোকিত হয়..."
          />
          <Area
            label="হোমপেজের মূল কবিতা (Hero Poem)"
            k="heroSub"
            rows={4}
            full
            placeholder="তোমার জন্মদিন ভালোবাসায় ভরে উঠুক..."
          />
          <Field
            label="ভাসমান ইমোজি সেট (Floating Emojis)"
            k="emojis"
            full
            placeholder="🌸✨💖🌷🌙🦋"
            hint="হোমপেজ ও উইশ কার্ডে এই ইমোজিগুলো ভেসে বেড়াবে"
            extra={{ style: { fontSize: 20 } }}
          />
        </div>
      </Card>

      {/* The Love Letter */}
      <Card
        icon="mail"
        title="ভালোবাসার চিঠি (The Love Letter)"
        sub="খামের ভেতরের মূল প্রেমপত্র ও ধন্যবাদ বার্তা"
      >
        <div className="admin-stack">
          <Area
            label="চিঠির প্রারম্ভিক বার্তা (Letter Intro)"
            k="letterIntro"
            rows={2}
            placeholder="প্রিয় সুমি, আজ তোমার জন্মদিনে..."
            hint="খাম খোলার সাথে সাথে এই সুন্দর বার্তাটি দেখা যাবে"
          />
          <Area
            label="পুরো প্রেমপত্র (Full Love Letter)"
            k="letter"
            rows={10}
            placeholder="তোমার সাথে কাটানো প্রতিটি মুহূর্ত..."
            hint="চিঠি পেজে সুন্দর ফন্টে খাতার পাতার মতো করে প্রদর্শিত হবে"
          />
          <Area
            label="চিঠির সমাপ্তি লাইন (Ending Thanks Note)"
            k="thanksText"
            rows={3}
            placeholder="ইতি, তোমার চিরদিনের..."
            hint="চিঠির সর্বশেষে স্বাক্ষরের উপরে থাকবে"
          />
        </div>
      </Card>

      {/* Secret Gift & Cake Page */}
      <Card
        icon="redeem"
        title="সারপ্রাইজ গিফট ও কেক পেজের টেক্সট"
        sub="গিফট বক্স খুললে যে গোপন বার্তা দেখতে পাবে"
      >
        <div className="admin-grid-2">
          <Field
            label="Cake Page Title"
            k="cakeTitle"
            placeholder="Make a Wish & Blow the Candle"
          />
          <Field
            label="Secret Gift Box Title"
            k="giftTitle"
            placeholder="তোমার জন্য ছোট্ট একটি সারপ্রাইজ উপহার"
          />
          <Area
            label="গিফট বক্সের গোপন বার্তা (Gift Message)"
            k="giftText"
            rows={4}
            full
            placeholder="তুমি আমার জীবনের সেরা উপহার..."
          />
        </div>
      </Card>

      {/* Reasons & Tags */}
      <Card
        icon="favorite"
        title="ভালোবাসার কারণ ও মেমোরি ট্যাগস"
        sub="হোমপেজের 'ভালোবাসার কারণ' এবং ট্যাগ পিলস"
      >
        <div className="admin-grid-2">
          <ListArea
            label="ভালোবাসার কারণসমূহ (প্রতি লাইনে একটি)"
            k="reasons"
            sep={'\n'}
            rows={7}
            placeholder="তোমার মিষ্টি হাসির জন্য&#10;তোমার গভীর মায়ার জন্য"
            hint="প্রতিটি লাইনের জন্য আলাদা একটি সুন্দর কার্ড তৈরি হবে"
          />
          <div className="admin-stack">
            <ListArea
              label="Memory Tags (কমা দিয়ে আলাদা করুন)"
              k="tags"
              sep=","
              rows={4}
              placeholder="Queen, Cute Smile, Forever, My Life"
              hint="কমা দিয়ে লিখলে সুন্দর ট্যাগে রূপান্তরিত হবে"
            />
            <div className="admin-tags-preview-box">
              <span className="admin-preview-label">লাইভ ট্যাগ প্রিভিউ:</span>
              <div className="admin-tags-pills">
                {(cfg.tags || []).map((t, i) => (
                  <span key={i} className="admin-tag-pill">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Memory Timeline Cards on Home */}
      <Card
        icon="history_edu"
        title="হোমপেজের স্মৃতির চিঠি (Memory Cards)"
        sub="হোমপেজের খামের নিচের স্মৃতির কার্ডগুলো"
        extra={
          <button type="button" className="btn btn-mint btn-sm" onClick={addMemory}>
            <Icon name="add" /> মেমোরি কার্ড যোগ করুন
          </button>
        }
      >
        <div className="admin-timeline-stack">
          {(cfg.timeline || []).map((t, i) => (
            <div key={i} className="admin-timeline-card">
              <ImagePicker
                className="admin-timeline-thumb"
                title="ছবি বদলান"
                onFiles={setTimelinePhoto(i)}
              >
                <img src={t.photo} alt={t.title} />
                <span className="admin-thumb-overlay"><Icon name="swap_horiz" /></span>
              </ImagePicker>
              <div className="admin-timeline-inputs">
                <div className="admin-grid-2">
                  <ItemField list="timeline" i={i} k="year" placeholder="সময় / সাল (যেমন: ২০২৪)" />
                  <ItemField list="timeline" i={i} k="title" placeholder="শিরোনাম (Title)" />
                </div>
                <ItemField list="timeline" i={i} k="text" area rows={2} placeholder="সেই বিশেষ মুহূর্তের স্মৃতি..." />
              </div>
              <div className="admin-card-actions">
                <DelButton
                  list="timeline"
                  i={i}
                  confirmMsg="এই মেমোরি কার্ডটি মুছে ফেলতে চান?"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ==================== TAB 4: STORY ==================== */

function StoryTab() {
  const { cfg, update, toast } = useApp();

  const setPhoto = (i: number) => async (files: File[]) => {
    const src = await compressImage(files[0]);
    update(c => { c.story[i].photo = src; });
    toast('মাইলস্টোনের ছবি আপডেট হয়েছে');
  };

  const add = () => {
    update(c => {
      c.story = c.story || [];
      c.story.push({
        date: 'নতুন বিশেষ দিন',
        title: 'মধুর একটি মুহূর্ত',
        text: 'সেদিন আমাদের পরিচয় আর ভালোবাসার গল্প শুরু হয়েছিল...',
        photo: photosOf(c)[0]?.src || '',
      });
    });
    toast('নতুন মাইলস্টোন দিন যুক্ত হয়েছে');
  };

  const move = (i: number, dir: -1 | 1) => {
    update(c => {
      const j = i + dir;
      if (j < 0 || j >= c.story.length) return;
      const [it] = c.story.splice(i, 1);
      c.story.splice(j, 0, it);
    });
  };

  return (
    <div className="admin-tab-stack">
      <Card
        icon="timeline"
        title="আমাদের গল্প (Love Story Milestones)"
        sub="হোমপেজের 'আমাদের গল্প' টাইমলাইন সেকশন। বিশেষ তারিখ ও মুহূর্তগুলো সাজিয়ে রাখুন।"
        extra={
          <button type="button" className="btn btn-mint btn-sm" onClick={add}>
            <Icon name="add" /> নতুন মাইলস্টোন যোগ করুন
          </button>
        }
      >
        <div className="admin-story-stack">
          {(cfg.story || []).map((s, i) => (
            <div key={i} className="admin-story-card">
              <div className="admin-story-step-badge">#{i + 1}</div>
              <ImagePicker
                className="admin-story-thumb"
                title="ছবি বদলান"
                onFiles={setPhoto(i)}
              >
                <img src={s.photo} alt={s.title} />
                <span className="admin-thumb-overlay"><Icon name="swap_horiz" /></span>
              </ImagePicker>
              <div className="admin-story-body">
                <div className="admin-grid-2">
                  <ItemField list="story" i={i} k="date" placeholder="কবে (যেমন: ১২ মার্চ ২০২৩)" />
                  <ItemField list="story" i={i} k="title" placeholder="শিরোনাম (যেমন: প্রথম দেখা)" />
                </div>
                <ItemField
                  list="story"
                  i={i}
                  k="text"
                  area
                  rows={3}
                  placeholder="সেদিন কী ঘটেছিল, অনুভূতিগুলো লিখুন..."
                />
              </div>
              <div className="admin-story-tools">
                <button
                  className="admin-tool-btn"
                  title="উপরে নিন"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <Icon name="arrow_upward" />
                </button>
                <button
                  className="admin-tool-btn"
                  title="নিচে নিন"
                  disabled={i === (cfg.story || []).length - 1}
                  onClick={() => move(i, 1)}
                >
                  <Icon name="arrow_downward" />
                </button>
                <DelButton
                  list="story"
                  i={i}
                  confirmMsg="এই মাইলস্টোনটি মুছে ফেলতে চান?"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ==================== TAB 5: WORDS ==================== */

function WordsTab() {
  const { cfg, update, toast } = useApp();
  const quotes = cfg.quotes || [];

  const addQuote = () => {
    update(c => {
      c.quotes = c.quotes || [];
      c.quotes.unshift({
        text: 'নতুন প্রিয় লাইন...',
        orig: '',
        author: '',
        paper: '',
      });
    });
    toast('নতুন চিরকুট যোগ হয়েছে');
  };

  const move = (i: number, dir: -1 | 1) => {
    update(c => {
      const j = i + dir;
      if (j < 0 || j >= c.quotes.length) return;
      [c.quotes[i], c.quotes[j]] = [c.quotes[j], c.quotes[i]];
    });
  };

  const setPaper = (i: number, paper: Paper | '') => {
    update(c => { c.quotes[i].paper = paper; });
  };

  return (
    <div className="admin-tab-stack">
      <Card
        icon="format_quote"
        title="প্রিয় লাইন ও চিরকুট (Paper Notes)"
        sub="হোমপেজের 'Favourite lines' অংশে খাতার পাতার মতো সুন্দর চিরকুটে লেখা হিসেবে দেখাবে।"
        extra={
          <button type="button" className="btn btn-mint btn-sm" onClick={addQuote}>
            <Icon name="add" /> নতুন চিরকুট যোগ করুন
          </button>
        }
      >
        <div className="admin-quotes-stack">
          {quotes.map((q, i) => (
            <div key={i} className="admin-quote-card">
              <div className="admin-quote-header">
                <span className="admin-quote-badge">
                  পাতা #{i + 1} • {PAPER_NAMES[paperOf(q, i)]}
                </span>
                <div className="admin-inline-tools">
                  <button
                    className="admin-tool-btn"
                    title="উপরে"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <Icon name="arrow_upward" />
                  </button>
                  <button
                    className="admin-tool-btn"
                    title="নিচে"
                    disabled={i === quotes.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <Icon name="arrow_downward" />
                  </button>
                  <DelButton list="quotes" i={i} confirmMsg="এই চিরকুটটি মুছে ফেলতে চান?" />
                </div>
              </div>

              <ItemField
                list="quotes"
                i={i}
                k="text"
                area
                rows={3}
                placeholder="চিরকুটের লাইনগুলো লিখুন (Enter দিয়ে নতুন লাইন)..."
              />

              <div className="admin-grid-2">
                <ItemField list="quotes" i={i} k="orig" placeholder="মূল ভাষায় লাইন (ঐচ্ছিক)" />
                <ItemField list="quotes" i={i} k="author" placeholder="লেখকের নাম (না জানলে খালি রাখুন)" />
              </div>

              <div className="admin-paper-selector">
                <span className="admin-paper-label">খাতার পাতার স্টাইল:</span>
                <div className="paper-pick" role="radiogroup">
                  <button
                    className={!q.paper ? 'on' : ''}
                    onClick={() => setPaper(i, '')}
                    title="নিজে থেকে বদলাবে"
                  >
                    <span className="paper-auto"><Icon name="autorenew" /></span>
                    <span>স্বয়ংক্রিয়</span>
                  </button>
                  {PAPERS.map(p => (
                    <button
                      key={p}
                      className={q.paper === p ? 'on' : ''}
                      onClick={() => setPaper(i, p)}
                    >
                      <PaperThumb paper={p} />
                      <span>{PAPER_NAMES[p]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {q.paper && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => {
                    const chosen = q.paper as Paper;
                    update(c => { c.quotes.forEach(x => { x.paper = chosen; }); });
                    toast(`সব পাতায় ${PAPER_NAMES[chosen]} সেট করা হয়েছে`);
                  }}
                >
                  <Icon name="select_all" />
                  <span>সব পাতায় {PAPER_NAMES[q.paper as Paper]} প্রয়োগ করুন</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Birthday Status Updates */}
      <Card
        icon="chat"
        title="Birthday Status লাইনসমূহ"
        sub="ওয়েবসাইটে ঘুরতে থাকা স্ট্যাটাস ও অনুভূতি"
      >
        <ListArea
          label="Birthday Status (প্রতি লাইনে একটি)"
          k="status"
          sep={'\n'}
          rows={6}
          placeholder="আজ শুধুই আনন্দ!&#10;শুভ জন্মদিন রাজকন্যা!"
          hint="প্রতিটি লাইন ভিজিটরদের স্ক্রিনে সুন্দরভাবে দেখাবে"
        />
      </Card>
    </div>
  );
}

/* ==================== TAB 6: WISHES ==================== */

function WishesTab() {
  const { cfg, update, toast } = useApp();

  const addWish = () => {
    update(c => {
      c.wishes = c.wishes || [];
      c.wishes.push({
        name: 'সৌরভ',
        text: 'তোমার জীবনের প্রতিটি দিন হোক অফুরন্ত ভালোবাসায় ভরা!',
        emoji: '💖',
      });
    });
    toast('নতুন ডিফল্ট উইশ যোগ হয়েছে');
  };

  return (
    <div className="admin-tab-stack">
      <Card
        icon="volunteer_activism"
        title="উইশ ও বার্তা (Birthday Wishes)"
        sub="ভিজিটর ও বন্ধুদের শুভকামনা বার্তা"
        extra={
          <button type="button" className="btn btn-mint btn-sm" onClick={addWish}>
            <Icon name="add" /> নতুন উইশ যোগ করুন
          </button>
        }
      >
        <div className="admin-info-banner">
          <Icon name="cloud_done" />
          <div>
            <strong>অনলাইন উইশ কানেকশন:</strong>
            <p>
              {sharedWishes
                ? 'অনলাইন উইশ সক্রিয় আছে! ভিজিটরদের পাঠানো লাইভ বার্তাগুলো সরাসরি Supabase Table (wishes)-এ জমা হচ্ছে। নিচে শুধুমাত্র সাইটের প্রাথমিক ডিফল্ট উইশগুলো সাজাতে পারবেন।'
                : 'এই বার্তাগুলো লোকাল ব্রাউজারে সংরক্ষিত হচ্ছে। সবার পাঠানো বার্তা একত্রিত রাখতে Supabase ডেটাবেজ যুক্ত রয়েছে।'}
            </p>
          </div>
        </div>

        <div className="admin-wishes-stack">
          {(cfg.wishes || []).map((_, i) => (
            <div key={i} className="admin-wish-card">
              <div className="admin-wish-emoji-wrap">
                <ItemField
                  list="wishes"
                  i={i}
                  k="emoji"
                  placeholder="💖"
                  style={{ width: 44, textAlign: 'center', fontSize: 20 }}
                />
              </div>
              <div className="admin-wish-inputs">
                <ItemField list="wishes" i={i} k="name" placeholder="নাম (যেমন: সৌরভ)" />
                <ItemField list="wishes" i={i} k="text" area rows={2} placeholder="শুভেচ্ছা বার্তা..." />
              </div>
              <DelButton list="wishes" i={i} confirmMsg="এই বার্তাটি মুছে ফেলতে চান?" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ==================== TAB 7: QUIZ ==================== */

function QuizTab() {
  const { cfg, update, toast } = useApp();

  const addQuestion = () => {
    update(c => {
      c.quiz = c.quiz || [];
      c.quiz.push({
        q: 'সুমির প্রিয় শখ কী?',
        opts: 'গান শোনা | বই পড়া | ভ্রমণ | ছবি তোলা',
        a: 0,
      });
    });
    toast('নতুন কুইজ প্রশ্ন যুক্ত হয়েছে');
  };

  return (
    <div className="admin-tab-stack">
      <Card
        icon="quiz"
        title="কুইজ গেম (How Well Do You Know Her?)"
        sub="Wishes পেজে ইন্টারঅ্যাক্টিভ গেম হিসেবে প্রদর্শিত হয়।"
        extra={
          <button type="button" className="btn btn-mint btn-sm" onClick={addQuestion}>
            <Icon name="add" /> নতুন প্রশ্ন যোগ করুন
          </button>
        }
      >
        <div className="admin-info-banner">
          <Icon name="help" />
          <div>
            <strong>কুইজ তৈরির নিয়ম:</strong>
            <p>
              অপশনগুলো <code>|</code> (পাইপ চিহ্ন) দিয়ে আলাদা করুন (যেমন: <code>A | B | C | D</code>)।
              ডানের ঘরে সঠিক উত্তরের নম্বর (১, ২, ৩, বা ৪) লিখুন।
            </p>
          </div>
        </div>

        <div className="admin-quiz-stack">
          {(cfg.quiz || []).map((q, i) => {
            const rawOpts = (q.opts || '').split('|').map(s => s.trim()).filter(Boolean);
            const correctNum = (+q.a || 0) + 1;
            return (
              <div key={i} className="admin-quiz-card">
                <div className="admin-quiz-header">
                  <span className="admin-quiz-badge">প্রশ্ন #{i + 1}</span>
                  <DelButton list="quiz" i={i} confirmMsg="এই প্রশ্নটি মুছে ফেলতে চান?" />
                </div>

                <ItemField list="quiz" i={i} k="q" placeholder="প্রশ্ন লিখুন (যেমন: সুমির প্রিয় ফুল কী?)" />

                <div className="admin-grid-2">
                  <ItemField
                    list="quiz"
                    i={i}
                    k="opts"
                    placeholder="গোলাপ | বেলি | শাপলা | টিউলিপ"
                  />
                  <div className="admin-quiz-answer-picker">
                    <label className="admin-field-label">সঠিক উত্তর নম্বর:</label>
                    <input
                      className="field admin-input"
                      type="number"
                      min={1}
                      max={Math.max(1, rawOpts.length)}
                      value={correctNum}
                      onChange={e => {
                        const a = Math.max(0, (parseInt(e.target.value, 10) || 1) - 1);
                        update(c => { c.quiz[i].a = a; });
                      }}
                    />
                  </div>
                </div>

                {rawOpts.length > 0 && (
                  <div className="admin-quiz-preview-opts">
                    {rawOpts.map((opt, idx) => (
                      <span
                        key={idx}
                        className={`admin-quiz-opt-pill ${idx + 1 === correctNum ? 'is-correct' : ''}`}
                      >
                        {idx + 1}. {opt} {idx + 1 === correctNum ? '✓ (সঠিক)' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ==================== TAB 8: BACKUP ==================== */

function BackupTab({ onForceSync, isSyncing }: { onForceSync: () => void; isSyncing: boolean }) {
  const { cfg, replaceConfig, toast } = useApp();

  const exportCfg = () => {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sumi-birthday-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast('কনফিগ JSON ফাইল ডাউনলোড হয়েছে ✓');
  };

  const importCfg = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      replaceConfig({ ...cfg, ...data, v: 9 });
      toast('কনফিগ সফলভাবে ইমপোর্ট হয়েছে! ✓');
    } catch {
      toast('ভুল ফাইল! শুধুমাত্র ভ্যালিড JSON ফাইল দিন');
    }
  };

  const reset = () => {
    if (!confirm('সতর্কতা: আপনার করা সমস্ত এডিট মুছে সাইটের আসল ডিফল্ট অবস্থায় ফিরে যাবে। আপনি কি নিশ্চিত?')) return;
    replaceConfig(clone(DEF));
    toast('ডিফল্ট সেটিংসে ফিরিয়ে নেওয়া হয়েছে ✓');
  };

  return (
    <div className="admin-tab-stack">
      {/* Cloud Sync Status Card */}
      <Card
        icon="cloud_sync"
        title="Supabase ক্লাউড ডেটাবেজ সিঙ্ক"
        sub="সার্ভার ও ক্লাউডের সাথে রিয়েলটাইম সংযোগ"
      >
        <div className="admin-cloud-box">
          <div className="admin-cloud-status">
            <span className="admin-pulse-dot" />
            <div>
              <h4>{hasCloudSync ? '🟢 ক্লাউড ডেটাবেজ কানেক্টেড' : '🟡 লোকাল মোড'}</h4>
              <p>
                আপনার ব্রাউজারে করা প্রতিটি পরিবর্তন সরাসরি Supabase Cloud-এ সংরক্ষণ হচ্ছে।
                অন্য যেকোনো মোবাইল বা ডিভাইস থেকে ওয়েবসাইট ভিজিট করলে এই পরিবর্তনগুলো লাইভ দেখতে পাওয়া যাবে।
              </p>
            </div>
          </div>
          <button
            className={`btn btn-mint ${isSyncing ? 'loading' : ''}`}
            onClick={onForceSync}
            disabled={isSyncing}
          >
            <Icon name={isSyncing ? 'sync' : 'cloud_upload'} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'এখনই Cloud Sync করুন'}</span>
          </button>
        </div>
      </Card>

      {/* JSON File Export / Import */}
      <Card
        icon="save"
        title="JSON ব্যাকআপ ও রিস্টোর"
        sub="সম্পূর্ণ ওয়েবসাইট ডেটা এক ক্লিকে ডাউনলোড বা আপলোড করুন"
      >
        <div className="admin-backup-actions">
          <button className="btn btn-mint" onClick={exportCfg}>
            <Icon name="download" />
            <span>Export Settings (JSON ডাউনলোড)</span>
          </button>
          <label className="btn btn-ghost file-btn">
            <Icon name="upload" />
            <span>Import Settings (JSON আপলোড)</span>
            <input type="file" accept=".json,application/json" onChange={importCfg} hidden />
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card
        icon="warning"
        title="বিপদজনক জোন (Danger Zone)"
        sub="সাইটের সমস্ত পরিবর্তন মুছে দিয়ে আসল ডিফল্ট অবস্থায় ফেরা"
      >
        <div className="admin-danger-box">
          <p>
            যদি কখনো কোনো সমস্যা হয় বা নতুন করে শুরু করতে চান, তাহলে নিচের বাটনে চাপলে সমস্ত পরিবর্তন মুছে যাবে।
          </p>
          <button className="btn btn-danger" onClick={reset}>
            <Icon name="restart_alt" />
            <span>সব কিছু মুছে Default-এ ফেরত নিন</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
