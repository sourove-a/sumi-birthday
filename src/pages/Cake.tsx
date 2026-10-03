import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context';
import { PHASE } from '../data';
import { BlowDetector } from '../lib/blow';
import { candleCount } from '../lib/derive';
import { buzz } from '../lib/utils';
import { Icon, SectionHead } from '../components/ui';
import { CakeScene } from './cake/CakeScene';

/** wish (candles burning) -> blown (lights on) -> cutting (knife) -> served (slice on plate) */
type Stage = 'wish' | 'blown' | 'cutting' | 'served';

export function Cake() {
  const { cfg, fireworks, confetti, toast } = useApp();
  const n = candleCount(cfg);
  const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(true));
  const [stage, setStage] = useState<Stage>('wish');
  const [mic, setMic] = useState<'off' | 'starting' | 'on'>('off');
  const [level, setLevel] = useState(0);
  const detector = useRef<BlowDetector | null>(null);
  const timers = useRef<number[]>([]);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const stopMic = useCallback(() => { detector.current?.stop(); detector.current = null; setMic('off'); setLevel(0); }, []);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stopMic();
    setLit(Array(n).fill(true));
    setStage('wish');
  }, [n, stopMic]);

  // New candle count from Admin -> start over; leaving the page -> clean up
  useEffect(() => { reset(); }, [reset]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); detector.current?.stop(); }, []);

  /* ---- Blowing ---- */
  const blowOne = useCallback((which?: number) => {
    setLit(prev => {
      const on = prev.map((v, i) => (v ? i : -1)).filter(i => i >= 0);
      if (!on.length) return prev;
      const i = which !== undefined && prev[which] ? which : on[(Math.random() * on.length) | 0];
      const next = [...prev];
      next[i] = false;
      buzz(15);
      return next;
    });
  }, []);

  const blowAll = () => lit.forEach((_, k) => later(120 + k * 170, () => blowOne()));

  const startMic = async () => {
    setMic('starting');
    try {
      const d = new BlowDetector();
      detector.current = d;
      await d.start(
        v => setLevel(Math.round(v * 20) / 20),
        () => { blowOne(); blowOne(); }, // a good puff takes out two candles
      );
      setMic('on');
    } catch {
      detector.current = null;
      setMic('off');
      toast('Mic চালু হলো না, button চেপে ফুঁ দাও');
    }
  };

  // All candles out -> wish granted
  useEffect(() => {
    if (stage !== 'wish' || lit.some(Boolean)) return;
    stopMic();
    setStage('blown');
    buzz([30, 50, 30, 50, 60]);
    fireworks(7);
    confetti(200);
  }, [lit, stage, stopMic, fireworks, confetti]);

  /* ---- Cutting ---- */
  const cut = () => {
    setStage('cutting');
    later(700, () => buzz(20));
    later(1500, () => buzz(20));
    later(2200, () => { setStage('served'); confetti(100); });
  };

  const someOut = lit.some(v => !v);
  const phaseKey = stage === 'wish' ? (someOut ? 'blow' : 'wish') : stage === 'blown' ? 'granted' : stage === 'cutting' ? 'cut' : 'served';
  const [phaseA, phaseB] = PHASE[phaseKey];

  return (
    <section className="page center-page" data-screen-label="02 Cake">
      <SectionHead eyebrow="Chapter 01 · Cake" text="আগে wish, তারপর ফুঁ।"
        title={<span style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: 'clamp(50px,7.6vw,96px)', letterSpacing: '-.015em' }}>{cfg.cakeTitle}</span>} />

      <div className="cake-stage">
        <div className="cake-phase">
          <strong>{phaseA}{phaseKey === 'served' ? ', ' + cfg.name : ''}</strong>
          <em>{phaseB}</em>
        </div>
        <CakeScene
          name={cfg.name}
          photo={cfg.cakePhoto}
          lit={lit}
          lightsOn={stage !== 'wish'}
          cutting={stage === 'cutting'}
          served={stage === 'served'}
          onCandle={i => stage === 'wish' && blowOne(i)}
        />

        <div className="cake-controls">
          {stage === 'wish' && mic !== 'on' && (
            <>
              {BlowDetector.supported() && (
                <button className="btn btn-dark" onClick={startMic} disabled={mic === 'starting'} title="ফোনের mic-এ ফুঁ দিলে মোমবাতি নিভে যাবে">
                  <Icon name="mic" />সত্যি সত্যি ফুঁ দাও
                </button>
              )}
              <button className="btn btn-lemon" onClick={blowAll}><Icon name="air" />Tap করে ফুঁ দাও</button>
              <span className="cake-hint">অথবা একটা একটা মোমবাতিতে tap করো</span>
            </>
          )}
          {stage === 'wish' && mic === 'on' && (
            <div className="mic-panel">
              <span className="mic-dot" />
              <span>শুনছি… মোমবাতির দিকে জোরে ফুঁ দাও</span>
              <span className="mic-meter"><i style={{ width: `${Math.min(100, level * 180)}%` }} /></span>
              <button className="icon-btn" title="Mic বন্ধ করো" onClick={stopMic}><Icon name="mic_off" /></button>
            </div>
          )}
          {stage === 'blown' && (
            <button className="btn btn-dark cake-cut-btn" onClick={cut}><Icon name="restaurant" />Cake কাটো</button>
          )}
        </div>

        <button className="icon-btn replay" title="আবার জ্বালাও" onClick={reset}><Icon name="replay" /></button>
      </div>
    </section>
  );
}
