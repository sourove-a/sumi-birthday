/* Load / save the editable config in localStorage & Supabase Cloud. */
import { DEF, KEY, NEW_QUOTE_V9, TEXT_KEYS, type Config, type PageId } from '../data';
import { clone } from './utils';

const PAGE_KEY = 'sumi_page';
const PAGE_IDS: PageId[] = ['home', 'cake', 'gallery', 'wishes', 'letter', 'admin'];

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasCloudSync = Boolean(SUPABASE_URL && SUPABASE_KEY);

const cloudHeaders = (): Record<string, string> => ({
  apikey: SUPABASE_KEY!,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
});

/** Fetches global live config from Supabase Cloud */
export async function fetchCloudConfig(): Promise<Config | null> {
  if (!hasCloudSync) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_config?id=eq.1&select=cfg`, {
      headers: cloudHeaders(),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (rows && rows.length > 0 && rows[0]?.cfg) {
      return rows[0].cfg as Config;
    }
  } catch (err) {
    console.warn('Could not fetch cloud config:', err);
  }
  return null;
}

/** Saves global live config to Supabase Cloud */
export async function saveCloudConfig(cfg: Config): Promise<boolean> {
  if (!hasCloudSync) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_config`, {
      method: 'POST',
      headers: {
        ...cloudHeaders(),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: 1,
        cfg,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save cloud config:', err);
    return false;
  }
}

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

/** Saves locally in browser AND syncs to Supabase Cloud for all visitors */
export function saveConfig(cfg: Config): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {
    /* storage full */
  }

  // Cloud sync
  if (hasCloudSync) {
    saveCloudConfig(cfg);
  }

  return true;
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
