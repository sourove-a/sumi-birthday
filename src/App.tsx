import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { AppContext, useApp, type AppApi } from './context';
import type { Config, PageId } from './data';
import { fetchCloudConfig, loadConfig, loadPage, saveConfig, savePage } from './lib/config';
import { isBirthday, isLocked, targetTime } from './lib/derive';
import { EffectsEngine } from './lib/effects';
import { useNow } from './lib/hooks';
import { MusicPlayer } from './lib/music';
import { buzz, clone, graphemes } from './lib/utils';
import { Dock, Lightbox, NextChapter, Toast, TopBar, Veil } from './components/Chrome';
import { Gate } from './components/Gate';
import { Admin } from './pages/Admin';
import { Cake } from './pages/Cake';
import { Gallery } from './pages/Gallery';
import { Home } from './pages/Home';
import { Letter } from './pages/Letter';
import { Wishes } from './pages/Wishes';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const VIEWS: Record<PageId, () => ReactElement> = {
  home: Home, cake: Cake, gallery: Gallery, wishes: Wishes, letter: Letter, admin: Admin,
};

export function App() {
  const [cfg, setCfg] = useState<Config>(loadConfig);
  const [page, setPage] = useState<PageId>(loadPage);
  const [entered, setEntered] = useState(false);
  const [veilId, setVeilId] = useState(0);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Sync latest cloud config from Supabase on mount
  useEffect(() => {
    fetchCloudConfig().then(cloudCfg => {
      if (cloudCfg) {
        setCfg(prev => ({ ...prev, ...cloudCfg }));
      }
    });
  }, []);

  // Refs let long-lived callbacks (canvas, timers) read the latest values
  const live = useRef({ cfg, page, entered });
  live.current = { cfg, page, entered };
  const fx = useRef<EffectsEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toastTimer = useRef(0);
  const goTimers = useRef<number[]>([]);

  /* ---- Toast ---- */
  const showToast = useCallback((msg: string) => {
    setToast({ msg, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  /* ---- Config (auto-saved & cloud synced) ---- */
  const update = useCallback((fn: (c: Config) => void) => {
    setCfg(prev => {
      const next = clone(prev);
      fn(next);
      if (!saveConfig(next)) setTimeout(() => showToast('Storage full! ছবি কম বা ছোট দাও'), 0);
      return next;
    });
  }, [showToast]);

  const replaceConfig = useCallback((c: Config) => { saveConfig(c); setCfg(c); }, []);

  /* ---- Effects canvas ---- */
  useEffect(() => {
    const engine = new EffectsEngine(canvasRef.current!, {
      // Petals/emoji only on Home, and never for people who asked for less motion
      ambient: () => live.current.cfg.effects.particles && !reducedMotion && (live.current.page === 'home' || !live.current.entered),
      emojis: () => graphemes(live.current.cfg.emojis),
    });
    fx.current = engine;
    const onMove = (e: MouseEvent) => {
      const { cfg: c, page: p, entered: en } = live.current;
      if (c.effects.cursor && (p === 'home' || !en) && Math.random() < 0.6) engine.sparkle(e.clientX, e.clientY);
    };
    addEventListener('mousemove', onMove);
    return () => { engine.destroy(); removeEventListener('mousemove', onMove); };
  }, []);

  const fireworks = useCallback((n = 6) => { if (live.current.cfg.effects.fireworks) fx.current?.fireworks(n); }, []);
  const confetti = useCallback((n = 150) => { if (live.current.cfg.effects.confetti) fx.current?.confetti(n); }, []);

  /* ---- Music ---- */
  const music = useRef<MusicPlayer | null>(null);
  const player = () => (music.current ??= new MusicPlayer(setMusicPlaying, showToast));
  // Get the player ready before the first tap, so the tap can start the sound on phones
  useEffect(() => { if (MusicPlayer.canPlay(live.current.cfg.music)) player().preload(live.current.cfg.music); }, []);
  const toggleMusic = useCallback(() => {
    const m = player();
    if (m.playing) return m.pause();
    const url = live.current.cfg.music || '';
    if (!MusicPlayer.canPlay(url)) return showToast('Admin panel-এ music link দাও');
    m.start(url);
  }, [showToast]);

  /* ---- Navigation with curtain ---- */
  const go = useCallback((p: PageId) => {
    if (p === live.current.page) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    goTimers.current.forEach(clearTimeout);
    setVeilId(id => id + 1);
    goTimers.current = [
      window.setTimeout(() => {
        setPage(p);
        setLightbox(null);
        savePage(p);
        window.scrollTo(0, 0);
      }, 420),
      window.setTimeout(() => setVeilId(id => -Math.abs(id)), 950), // negative = hidden
    ];
  }, []);

  const enter = useCallback(() => {
    const c = live.current.cfg;
    if (isLocked(c, Date.now())) return;
    setEntered(true); // music waits for the ♪ button — no autoplay
    setTimeout(() => { fireworks(isBirthday(c, Date.now()) ? 9 : 5); confetti(160); }, 300);
  }, [fireworks, confetti]);

  const openAdmin = useCallback(() => { setEntered(true); go('admin'); }, [go]);

  const api = useMemo<AppApi>(() => ({
    cfg, update, replaceConfig, page, go, entered,
    showGate: () => setEntered(false),
    toast: showToast, fireworks, confetti,
    openLightbox: setLightbox,
    musicPlaying, toggleMusic,
  }), [cfg, update, replaceConfig, page, go, entered, showToast, fireworks, confetti, musicPlaying, toggleMusic]);

  const View = VIEWS[page];

  return (
    <AppContext.Provider value={api}>
      <div className="sky" aria-hidden="true" />
      <canvas id="fx" ref={canvasRef} aria-hidden="true" />
      <ScrollProgress page={page} />
      <BirthdayWatcher />
      {veilId > 0 && <Veil key={veilId} name={cfg.name} />}
      {!entered && <Gate onEnter={enter} onAdmin={openAdmin} />}
      <TopBar onAdmin={openAdmin} />

      <main>
        <View key={page} />
        {entered && <NextChapter />}
      </main>

      {entered && <Dock />}
      {lightbox !== null && <Lightbox index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} />}
      {toast && <Toast key={toast.id} msg={toast.msg} />}
    </AppContext.Provider>
  );
}

/** Thin bar at the top showing how far you've scrolled. */
function ScrollProgress({ page }: { page: PageId }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    };
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, [page]);
  return <div className="progress" aria-hidden="true"><div ref={bar} /></div>;
}

/** Fires fireworks the moment the birthday starts. */
function BirthdayWatcher() {
  const api = useApp();
  const now = useNow();
  const fired = useRef(false);

  useEffect(() => {
    const t = targetTime(api.cfg);
    if (!fired.current && now >= t && now - t < 864e5) {
      fired.current = true;
      // Fires on the countdown screen too, the moment it turns 12
      api.fireworks(10); api.confetti(220); buzz([40, 60, 40, 60, 80]);
    }
  }, [now, api]);
  return null;
}
