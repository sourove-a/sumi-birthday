/* Values calculated from the config (dates, names, lists). */
import { IMG, type Config, type Photo } from '../data';
import { pad } from './utils';

export const photosOf = (cfg: Config): Photo[] =>
  cfg.photos?.length ? cfg.photos : [{ src: IMG(7), caption: '', poem: '' }];

export const photoAt = (cfg: Config, i: number): Photo => {
  const p = photosOf(cfg);
  return p[((i % p.length) + p.length) % p.length];
};

export const targetTime = (cfg: Config): number => new Date(cfg.date).getTime() || 0;
export const msLeft = (cfg: Config, now: number): number => Math.max(0, targetTime(cfg) - now);
/** before the day · the 24 hours of the day · after it has passed */
export type Phase = 'before' | 'today' | 'after';
export function birthdayPhase(cfg: Config, now: number): Phase {
  const t = targetTime(cfg);
  if (now < t) return 'before';
  return now < t + 864e5 ? 'today' : 'after';
}
export const isBirthday = (cfg: Config, now: number): boolean => birthdayPhase(cfg, now) === 'today';
/** The lock only applies before midnight — never again after the day. */
export const isLocked = (cfg: Config, now: number): boolean => !!cfg.lock && now < targetTime(cfg);

/** How much of the year-long wait (last birthday -> this one) is done, 0..1. */
export function waitProgress(cfg: Config, now: number): number {
  const t = targetTime(cfg);
  const prev = new Date(t);
  prev.setFullYear(prev.getFullYear() - 1);
  return Math.min(1, Math.max(0, (now - prev.getTime()) / (t - prev.getTime())));
}

/** How much of the birthday itself has gone by, 0..1. */
export const dayProgress = (cfg: Config, now: number): number =>
  Math.min(1, Math.max(0, (now - targetTime(cfg)) / 864e5));

/** Days until the next birthday on the same date (used after the day has passed). */
export function daysToNext(cfg: Config, now: number): number {
  const d = new Date(targetTime(cfg));
  while (d.getTime() + 864e5 <= now) d.setFullYear(d.getFullYear() + 1);
  return Math.max(0, Math.ceil((d.getTime() - now) / 864e5));
}

const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const bnDigits = (v: number) => String(v).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
/** "০৭ অক্টোবর ২০২৬" */
export const bnDate = (cfg: Config): string => {
  const d = new Date(targetTime(cfg));
  return isNaN(d.getTime()) ? '' : `${bnDigits(d.getDate()).padStart(2, '০')} ${BN_MONTHS[d.getMonth()]} ${bnDigits(d.getFullYear())}`;
};

const WEEKDAYS =['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
export const weekdayBn = (cfg: Config): string => {
  const d = new Date(targetTime(cfg));
  return isNaN(d.getTime()) ? '' : WEEKDAYS[d.getDay()];
};

const validDate = (cfg: Config): Date | null => {
  const d = new Date(targetTime(cfg));
  return isNaN(d.getTime()) ? null : d;
};
export const dateLabel = (cfg: Config): string =>
  validDate(cfg)?.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) ?? '';
export const shortDate = (cfg: Config): string => {
  const d = validDate(cfg);
  return d ? pad(d.getDate()) + '.' + pad(d.getMonth() + 1) : '';
};
export const birthDay = (cfg: Config): string => { const d = validDate(cfg); return d ? pad(d.getDate()) : ''; };
export const birthMonth = (cfg: Config): string => validDate(cfg)?.toLocaleDateString('en-GB', { month: 'long' }) ?? '';

/** "KHADIZA SUMI" -> { lead: "Khadiza", last: "Sumi" } */
export function nameParts(cfg: Config): { lead: string; last: string } {
  const words = (cfg.fullName || cfg.name || '').trim().split(/\s+/).filter(Boolean)
    .map(w => (/[a-z]/i.test(w) ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w));
  return { lead: words.slice(0, -1).join(' '), last: words[words.length - 1] || '' };
}

export const heroWordsOf = (cfg: Config): string[] =>
  (cfg.heroWords || '').split(',').map(x => x.trim()).filter(Boolean);

export const candleCount = (cfg: Config): number => Math.max(1, Math.min(9, +cfg.candles || 5));

export type Unit = 'd' | 'h' | 'm' | 's';
export const UNITS: [Unit, string, string][] = [
  ['d', 'Days', 'দিন'], ['h', 'Hours', 'ঘণ্টা'], ['m', 'Minutes', 'মিনিট'], ['s', 'Seconds', 'সেকেন্ড'],
];

export function countdown(cfg: Config, now: number): Record<Unit, string> {
  const d = msLeft(cfg, now);
  return {
    d: pad(Math.floor(d / 864e5)),
    h: pad(Math.floor(d / 36e5) % 24),
    m: pad(Math.floor(d / 6e4) % 60),
    s: pad(Math.floor(d / 1e3) % 60),
  };
}
