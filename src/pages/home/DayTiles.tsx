import { useApp } from '../../context';
import {
  UNITS, birthDay, birthMonth, birthdayPhase, countdown, dateLabel, dayProgress, daysToNext, msLeft, waitProgress, weekdayBn,
} from '../../lib/derive';
import { useNow } from '../../lib/hooks';
import { toBn } from '../../lib/utils';
import { Icon } from '../../components/ui';

/** A line that matches how close the birthday is. */
function headline(ms: number): [string, string] {
  const days = Math.floor(ms / 864e5);
  if (ms < 60e3) return ['এই তো…', 'চোখ রাখো ঘড়ির দিকে'];
  if (ms < 36e5) return ['আর একটু…', 'এক ঘণ্টাও বাকি নেই'];
  if (ms < 864e5) return ['আজ রাত বারোটায়!', 'আজকের রাতটা একটু অন্যরকম'];
  if (ms < 2 * 864e5) return ['কালকেই!', 'আর মাত্র একটা ঘুম'];
  return [`আর ${toBn(days)} দিন`, 'তারপর তোমার দিন'];
}

/** Flip-clock countdown -> birthday celebration -> "until next year". */
export function CountdownTile() {
  const { cfg } = useApp();
  const now = useNow();
  const phase = birthdayPhase(cfg, now);
  const ms = msLeft(cfg, now);
  const cd = countdown(cfg, now);

  if (phase === 'today') {
    const p = dayProgress(cfg, now);
    return (
      <div className="tile tile-count is-today">
        <div className="tile-head"><span className="label" style={{ color: 'var(--lime)' }}>It's today</span><span className="count-date">{dateLabel(cfg)}</span></div>
        <div className="today-big"><span className="today-cake">🎂</span>আজ তোমার দিন</div>
        <div className="count-sub">শুভ জন্মদিন, {cfg.name.charAt(0) + cfg.name.slice(1).toLowerCase()}! পুরো দিনটা তোমার।</div>
        <Progress value={p} label={`দিনটার ${toBn(Math.round(p * 100))}% পার হলো, বাকিটা উপভোগ করো`} />
      </div>
    );
  }

  if (phase === 'after') {
    const next = daysToNext(cfg, now);
    return (
      <div className="tile tile-count">
        <div className="tile-head"><span className="label" style={{ color: 'var(--lime)' }}>Until next time</span><span className="count-date">{dateLabel(cfg)}</span></div>
        <div className="count-headline">দিনটা চলে গেছে,<br />উদযাপন শেষ হয়নি</div>
        <div className="count-sub">আবার {toBn(Number(birthDay(cfg)))} {birthMonth(cfg)} আসবে, আর {toBn(next)} দিন পর। আমি এখনই অপেক্ষা শুরু করলাম।</div>
      </div>
    );
  }

  const [title, sub] = headline(ms);
  const p = waitProgress(cfg, now);
  return (
    <div className="tile tile-count">
      <div className="tile-head"><span className="label" style={{ color: 'var(--lime)' }}>Countdown</span><span className="count-date">{dateLabel(cfg)}</span></div>
      <div className="count-headline">{title}</div>
      <div className="flip-clock">
        {UNITS.map(([k, , bn], i) => (
          <div key={k} className="flip-unit">
            <div className="flip-digits">
              {cd[k].split('').map((d, j) => <span key={j} className="flip-card"><span key={d} className="roll">{toBn(d)}</span></span>)}
            </div>
            <span className="flip-label">{bn}</span>
            {i < UNITS.length - 1 && <span className="flip-colon" aria-hidden="true">:</span>}
          </div>
        ))}
      </div>
      <Progress value={p} label={`এক বছরের অপেক্ষা, ${toBn(Math.floor(p * 100))}% শেষ · ${sub}`} />
    </div>
  );
}

function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div className="count-progress">
      <div className="count-bar"><i style={{ width: `${Math.max(2, value * 100)}%` }} /></div>
      <span>{label}</span>
    </div>
  );
}

/** Tear-off calendar page for the birthday date. */
export function DayTile() {
  const { cfg } = useApp();
  const weekday = weekdayBn(cfg);
  const year = new Date(cfg.date).getFullYear();
  return (
    <div className="tile tile-day">
      <div className="cal">
        <div className="cal-rings" aria-hidden="true"><i /><i /><i /></div>
        <div className="cal-head">{birthMonth(cfg)}</div>
        <div className="cal-body">
          <strong>{birthDay(cfg)}</strong>
          {weekday && <span className="cal-weekday">{year ? toBn(year) + '-এ পড়েছে ' : 'পড়েছে '}{weekday}ে</span>}
        </div>
        <span className="cal-heart"><Icon name="favorite" fill /></span>
        <span className="cal-fold" aria-hidden="true" />
      </div>
      <span className="cal-note">ক্যালেন্ডারের সবচেয়ে প্রিয় পাতা</span>
    </div>
  );
}
