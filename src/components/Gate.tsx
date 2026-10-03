import { useApp } from '../context';
import { UNITS, birthdayPhase, countdown, isLocked } from '../lib/derive';
import { useNow } from '../lib/hooks';
import { Icon, Roll } from './ui';
import { Badge, HeroTitle, WindowBar } from './WindowBar';

/** First screen: countdown + "open the sky" button. */
export function Gate({ onEnter, onAdmin }: { onEnter: () => void; onAdmin: () => void }) {
  const { cfg } = useApp();
  const now = useNow();
  const cd = countdown(cfg, now);
  const locked = isLocked(cfg, now);
  const phase = birthdayPhase(cfg, now);

  return (
    <section className="gate" data-screen-label="00 Countdown">
      <div className="window">
        <WindowBar cfg={cfg} />
        <div className="gate-body">
          <Badge>শুধু তোমার জন্য বানানো</Badge>
          <HeroTitle cfg={cfg} />
        </div>
        {phase === 'before' && (
          <div className="gate-tiles">
            {UNITS.map(([k, en, bn]) => (
              <div className="gate-tile" key={k}><strong><Roll v={cd[k]} /></strong><span>{en} · {bn}</span></div>
            ))}
          </div>
        )}
        <div className="gate-foot">
          {phase === 'before' && <p>আর একটু অপেক্ষা।<br />রাত বারোটা বাজলেই খুলে যাবে।</p>}
          {phase === 'today' && <p>অবশেষে দিনটা এলো।<br />আজ শুধু তোমার।</p>}
          {phase === 'after' && <p>দিনটা চলে গেছে, কিন্তু<br />এই ছোট্ট পৃথিবীটা তোমারই থাকবে।</p>}
          <button className={`btn btn-dark ${phase === 'today' ? 'btn-glow' : ''}`} onClick={onEnter} disabled={locked}>
            {locked ? 'বারোটা বাজুক আগে' : 'খুলে দেখো'}<Icon name="chevron_right" />
          </button>
        </div>
      </div>
      <div className="gate-hint"><Icon name="headphones" />ভেতরে গিয়ে ♪ চাপলে গান বাজবে</div>
      <button className="icon-btn gate-admin" title="Admin" onClick={onAdmin}><Icon name="tune" /></button>
    </section>
  );
}
