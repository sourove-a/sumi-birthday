/* Small helpers used everywhere. */

export const pad = (n: number): string => String(n).padStart(2, '0');

export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

export const rand = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];

/** Trim each line and drop empty ones. */
export const cleanLines = (list: string[] | undefined): string[] =>
  (list || []).map(x => x.trim()).filter(Boolean);

/** Emoji-safe split (keeps 👩‍❤️‍👨 etc. together). */
export function graphemes(s: string): string[] {
  try {
    return [...new Intl.Segmenter().segment(s || '')].map(x => x.segment).filter(x => x.trim());
  } catch {
    return Array.from(s || '').filter(x => x.trim());
  }
}

/** YouTube link -> 11 character video id. */
export function ytId(url: string): string | null {
  const u = (url || '').trim();
  const m = u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(u) ? u : null;
}

export const isAudioFile = (url: string): boolean => /\.(mp3|m4a|ogg|wav)(\?|$)/i.test((url || '').trim());

/** Resize an uploaded photo so it fits in localStorage. */
export function compressImage(file: File, max = 1100): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Copy text, with a fallback for old browsers / http pages. */
export function copyText(text: string): Promise<void> {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) throw new Error('copy failed');
  };
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallback());
  }
  return new Promise(resolve => { fallback(); resolve(); });
}

/** Short phone vibration for big moments (Android; ignored elsewhere). */
export function buzz(pattern: number | number[]): void {
  try { navigator.vibrate?.(pattern); } catch { /* not allowed */ }
}

/** 12 -> "১২" */
export const toBn = (v: number | string): string => String(v).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

/** "এইমাত্র", "৫ মিনিট আগে", "২ দিন আগে" ... */
export function timeAgo(at: number, now = Date.now()): string {
  const s = Math.max(0, (now - at) / 1000);
  if (s < 60) return 'এইমাত্র';
  if (s < 3600) return toBn(Math.floor(s / 60)) + ' মিনিট আগে';
  if (s < 86400) return toBn(Math.floor(s / 3600)) + ' ঘণ্টা আগে';
  if (s < 86400 * 30) return toBn(Math.floor(s / 86400)) + ' দিন আগে';
  return new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
