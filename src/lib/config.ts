/* Load / save the editable config in localStorage. */
import { DEF, KEY, NEW_QUOTE_V9, TEXT_KEYS, type Config, type PageId } from '../data';
import { clone } from './utils';

const PAGE_KEY = 'sumi_page';
const PAGE_IDS: PageId[] = ['home', 'cake', 'gallery', 'wishes', 'letter', 'admin'];

export function loadConfig(): Config {
  let c = clone(DEF);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null') as (Partial<Config> & Record<string, unknown>) | null;
    if (saved) {
      // v8 saves: add the new favourite line on top, keep everything else they edited
      if (saved.v === 8 && Array.isArray(saved.quotes) && !saved.quotes.some(q => q.text === NEW_QUOTE_V9)) {
        saved.quotes.unshift({ text: NEW_QUOTE_V9, orig: '', author: '' });
      }
      // Saves older than v8: drop outdated texts so the new defaults show
      if ((saved.v || 0) < 8) {
        TEXT_KEYS.forEach(k => delete saved[k]);
        delete saved.letterIntro;
        if (saved.wishes?.length === 1 && saved.wishes[0].name === 'SOUROVE') delete saved.wishes;
        if (Array.isArray(saved.photos)) {
          saved.photos = saved.photos.map(p => {
            const d = DEF.photos.find(x => x.src === p.src);
            return d ? { ...p, caption: d.caption, poem: d.poem } : p;
          });
        }
      }
      c = { ...c, ...saved, v: 9, effects: { ...c.effects, ...(saved.effects || {}) } } as Config;
    }
  } catch {
    /* broken JSON -> defaults */
  }
  return c;
}

/** Returns false when the browser storage is full. */
export function saveConfig(cfg: Config): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
    return true;
  } catch {
    return false;
  }
}

export function loadPage(): PageId {
  try {
    const p = localStorage.getItem(PAGE_KEY) as PageId | null;
    return p && PAGE_IDS.includes(p) ? p : 'home';
  } catch {
    return 'home';
  }
}

export function savePage(p: PageId): void {
  try { localStorage.setItem(PAGE_KEY, p); } catch { /* ignore */ }
}
