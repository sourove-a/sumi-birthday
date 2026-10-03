import type { Config } from '../data';
import { dateLabel, nameParts } from '../lib/derive';
import { Icon } from './ui';

/** Top strip of the lime "window" card (gate + home hero). */
export function WindowBar({ cfg }: { cfg: Config }) {
  return (
    <div className="window-bar">
      <div className="brand"><span className="brand-mark">{(cfg.name || 'S').charAt(0)}</span>{cfg.name}'s Day</div>
      <div className="window-meta"><span>{dateLabel(cfg)}</span><span>Made by {cfg.sender}</span></div>
    </div>
  );
}

export function Badge({ children }: { children: string }) {
  return <div className="badge"><b>For you</b>{children}<Icon name="chevron_right" /></div>;
}

export function HeroTitle({ cfg }: { cfg: Config }) {
  const n = nameParts(cfg);
  return <h1 className="hero-title">Happy Birthday,<br />{n.lead} <em>{n.last}</em></h1>;
}
