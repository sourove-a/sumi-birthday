/* Canvas effects: floating emoji, petals, bokeh, fireworks, confetti, cursor sparkle. */
import { COLORS } from '../data';
import { rand } from './utils';

interface Options {
  /** Show ambient petals/emoji right now? (Home page + setting on) */
  ambient: () => boolean;
  emojis: () => string[];
}

type Bokeh = { x: number; y: number; vy: number; r: number; a: number; c: string; ph: number };
type Petal = { x: number; y: number; vy: number; vx: number; r: number; a: number; c: string; rot: number; vr: number; ph: number; fl: number };
type Floaty = { x: number; y: number; vy: number; s: number; e: string; a: number; ph: number };
type Rocket = { x: number; y: number; vx: number; vy: number; c: string };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; d: number; c: string; s: number };
type Trail = { x: number; y: number; life: number; s: number; c: string };
type Confetto = { x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; c: string; ph: number };

const PETAL_COLORS = ['#ffffff', '#f2f8e6', '#ecf5a8', '#e6f5c4', '#fff6d8', '#d6efb8'];

export class EffectsEngine {
  private ctx: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private raf = 0;
  private cleared = false;
  private bokeh: Bokeh[] = [];
  private petals: Petal[] = [];
  private floats: Floaty[] = [];
  private rockets: Rocket[] = [];
  private sparks: Spark[] = [];
  private trail: Trail[] = [];
  private conf: Confetto[] = [];
  private readonly onResize = () => this.resize();

  constructor(private canvas: HTMLCanvasElement, private opts: Options) {
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    addEventListener('resize', this.onResize);
    for (let i = 0; i < 8; i++) this.floats.push(this.newFloat(true));
    for (let i = 0; i < 22; i++) this.petals.push(this.newPetal(true));
    for (let i = 0; i < 24; i++) this.bokeh.push(this.newBokeh(true));
    this.loop();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    removeEventListener('resize', this.onResize);
  }

  fireworks(n = 6): void {
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        this.rockets.push({
          x: this.W * (0.15 + Math.random() * 0.7), y: this.H + 10,
          vx: (Math.random() - 0.5) * 2, vy: -(Math.sqrt(this.H) * 0.42 + Math.random() * 3), c: rand(COLORS),
        });
      }, i * 280);
    }
  }

  confetti(n = 150): void {
    for (let i = 0; i < n; i++) {
      this.conf.push({
        x: Math.random() * this.W, y: -20 - Math.random() * this.H * 0.6,
        vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2,
        w: 6 + Math.random() * 6, h: 10 + Math.random() * 8, c: rand(COLORS), ph: Math.random() * 6,
      });
    }
  }

  sparkle(x: number, y: number): void {
    this.trail.push({ x, y, life: 1, s: 1.5 + Math.random() * 2.5, c: rand(COLORS) });
  }

  private resize(): void {
    const d = Math.min(devicePixelRatio || 1, 1.5);
    this.W = innerWidth;
    this.H = innerHeight;
    this.canvas.width = this.W * d;
    this.canvas.height = this.H * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  private newFloat(init: boolean): Floaty {
    const em = this.opts.emojis();
    return { x: Math.random() * this.W, y: init ? Math.random() * this.H : this.H + 30, vy: -(0.2 + Math.random() * 0.45), s: 14 + Math.random() * 14, e: (em.length ? rand(em) : '') || '✨', a: 0.22 + Math.random() * 0.3, ph: Math.random() * 6 };
  }
  private newBokeh(init: boolean): Bokeh {
    return { x: Math.random() * this.W, y: init ? Math.random() * this.H : this.H + 20, vy: -(0.1 + Math.random() * 0.3), r: 1 + Math.random() * 2.5, a: 0.3 + Math.random() * 0.5, c: rand(COLORS), ph: Math.random() * 6 };
  }
  private newPetal(init: boolean): Petal {
    return { x: Math.random() * this.W - (init ? 0 : 80), y: init ? Math.random() * this.H : -20, vy: 0.45 + Math.random() * 0.7, vx: 0.15 + Math.random() * 0.35, r: 5 + Math.random() * 6, a: 0.5 + Math.random() * 0.4, c: rand(PETAL_COLORS), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.04, ph: Math.random() * 6, fl: Math.random() * 6 };
  }

  private loop = (): void => {
    this.raf = requestAnimationFrame(this.loop);
    const { ctx, W, H } = this;
    const ambient = this.opts.ambient();
    const busy = this.rockets.length || this.sparks.length || this.conf.length || this.trail.length;
    if ((!ambient && !busy) || document.hidden) {
      if (!this.cleared) { ctx.clearRect(0, 0, W, H); this.cleared = true; }
      return;
    }
    this.cleared = false;
    ctx.clearRect(0, 0, W, H);

    if (ambient) this.drawAmbient();

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    this.drawFireworks();
    ctx.globalCompositeOperation = 'source-over';
    this.drawConfetti();
    ctx.globalAlpha = 1;
  };

  private drawAmbient(): void {
    const { ctx, W, H } = this;
    for (const b of this.bokeh) {
      b.y += b.vy; b.ph += 0.02;
      if (b.y < -10) Object.assign(b, this.newBokeh(false));
      ctx.globalAlpha = b.a * (0.6 + 0.4 * Math.sin(b.ph));
      ctx.fillStyle = b.c;
      ctx.beginPath(); ctx.arc(b.x + Math.sin(b.ph) * 8, b.y, b.r, 0, 7); ctx.fill();
    }
    for (const p of this.petals) {
      p.y += p.vy; p.x += p.vx + Math.sin((p.ph += 0.02)) * 0.6; p.rot += p.vr; p.fl += 0.04;
      if (p.y > H + 20 || p.x > W + 30) Object.assign(p, this.newPetal(false));
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(p.fl)) * 0.8 + 0.2);
      ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.textAlign = 'center';
    for (const f of this.floats) {
      f.y += f.vy; f.ph += 0.015;
      ctx.globalAlpha = f.a; ctx.font = f.s + 'px serif';
      ctx.fillText(f.e, f.x + Math.sin(f.ph) * 18, f.y);
      if (f.y < -40) Object.assign(f, this.newFloat(false));
    }
  }

  private drawFireworks(): void {
    const { ctx } = this;
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.x += r.vx; r.y += r.vy; r.vy += 0.12;
      ctx.fillStyle = r.c; ctx.beginPath(); ctx.arc(r.x, r.y, 2.4, 0, 7); ctx.fill();
      this.sparks.push({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 0.6, life: 0.5, d: 0.03, c: '#ffcf7a', s: 1.4 });
      if (r.vy >= -1) {
        // Burst
        this.rockets.splice(i, 1);
        const n = 80 + ((Math.random() * 40) | 0);
        const c2 = rand(COLORS);
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2, sp = 2 + Math.random() * 4.4;
          this.sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, d: 0.01 + Math.random() * 0.01, c: Math.random() < 0.3 ? c2 : r.c, s: 2 });
        }
      }
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.045; p.x += p.vx; p.y += p.vy; p.life -= p.d;
      if (p.life <= 0) { this.sparks.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.life * 1.4); ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (0.5 + p.life * 0.5), 0, 7); ctx.fill();
    }
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const p = this.trail[i];
      p.life -= 0.035; p.y -= 0.4;
      if (p.life <= 0) { this.trail.splice(i, 1); continue; }
      ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s * p.life, 0, 7); ctx.fill();
    }
  }

  private drawConfetti(): void {
    const { ctx, H } = this;
    for (let i = this.conf.length - 1; i >= 0; i--) {
      const p = this.conf[i];
      p.x += p.vx + Math.sin((p.ph += 0.05)) * 0.6; p.y += p.vy; p.r += p.vr;
      if (p.y > H + 20) { this.conf.splice(i, 1); continue; }
      ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(p.ph * 2));
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }
}
