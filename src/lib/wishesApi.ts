/* Shared wishes through Supabase (free). Turned on when website/.env has
   VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — see README for the 2-minute setup.
   Without them, wishes are saved only in the visitor's own browser. */
import type { Wish } from '../data';

const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const sharedWishes = !!(URL && KEY);

const headers = (): Record<string, string> => ({
  apikey: KEY!,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
});

interface Row { name: string; text: string; emoji: string; color: number | null; created_at: string }

export async function fetchWishes(): Promise<Wish[]> {
  const res = await fetch(`${URL}/rest/v1/wishes?select=name,text,emoji,color,created_at&order=created_at.asc&limit=500`, { headers: headers() });
  if (!res.ok) throw new Error('fetch failed: ' + res.status);
  const rows: Row[] = await res.json();
  return rows.map(r => ({ name: r.name, text: r.text, emoji: r.emoji, color: r.color ?? undefined, at: Date.parse(r.created_at) }));
}

export async function sendWish(w: Wish): Promise<void> {
  const res = await fetch(`${URL}/rest/v1/wishes`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify({ name: w.name.slice(0, 40), text: w.text.slice(0, 600), emoji: w.emoji.slice(0, 16), color: w.color ?? 0 }),
  });
  if (!res.ok) throw new Error('send failed: ' + res.status);
}
