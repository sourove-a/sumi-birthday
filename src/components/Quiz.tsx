import { useState } from 'react';
import { useApp } from '../context';
import { buzz } from '../lib/utils';
import { Icon, Reveal, SectionHead } from './ui';

/** "How well do you know her?" game. Questions come from cfg.quiz (edit in Admin → Quiz). */
export function Quiz() {
  const { cfg, confetti, fireworks } = useApp();
  const quiz = (cfg.quiz || []).filter(q => q.q.trim());
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!quiz.length) return null;

  const q = quiz[Math.min(qi, quiz.length - 1)];
  const answer = +q.a;
  const options = (q.opts || '').split('|').map(x => x.trim()).filter(Boolean);
  const shortName = cfg.name.charAt(0) + cfg.name.slice(1).toLowerCase();

  const choose = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    if (i === answer) { setScore(s => s + 1); confetti(50); buzz(25); }
    else buzz([10, 40, 10]);
  };
  const next = () => {
    setPick(null);
    if (qi + 1 >= quiz.length) { setDone(true); fireworks(5); }
    else setQi(qi + 1);
  };
  const restart = () => { setQi(0); setPick(null); setScore(0); setDone(false); };

  const optionClass = (i: number) => {
    if (pick === null) return 'quiz-opt';
    if (i === answer) return 'quiz-opt right';
    if (i === pick) return 'quiz-opt wrong';
    return 'quiz-opt dim';
  };

  return (
    <Reveal className="block" style={{ alignItems: 'center' }}>
      <SectionHead eyebrow="A small game" bn title={<>{shortName}-কে <span className="hl">কতটা চেনো?</span></>}
        text="দেখি কে ওকে সবচেয়ে ভালো চেনে।" />

      <div className="panel quiz">
        {done ? (
          <div className="quiz-done">
            <span className="label" style={{ color: 'var(--lime)' }}>Your score</span>
            <strong>{score} / {quiz.length}</strong>
            <p>{score === quiz.length ? 'পুরো নম্বর! তুমি সত্যিই ওকে চেনো।' : 'ভালো চেষ্টা! আরেকবার খেলে দেখো।'}</p>
            <button className="btn btn-mint" onClick={restart}><Icon name="replay" />আবার খেলো</button>
          </div>
        ) : (
          <>
            <div className="quiz-top">
              <span className="label" style={{ color: 'var(--lime)' }}>প্রশ্ন {qi + 1} / {quiz.length}</span>
              <span className="quiz-score"><Icon name="favorite" fill />{score}</span>
            </div>
            <div className="quiz-bar"><div style={{ width: `${(qi / quiz.length) * 100}%` }} /></div>
            <h3 className="quiz-q">{q.q}</h3>
            <div className="quiz-opts">
              {options.map((t, i) => (
                <button key={i} className={optionClass(i)} onClick={() => choose(i)} disabled={pick !== null}>
                  <span className="quiz-letter">{String.fromCharCode(65 + i)}</span>{t}
                  {pick !== null && i === answer && <Icon name="check_circle" fill />}
                  {pick === i && i !== answer && <Icon name="cancel" fill />}
                </button>
              ))}
            </div>
            {pick !== null && (
              <div className="quiz-foot">
                <span className={pick === answer ? 'quiz-ok' : 'quiz-no'}>{pick === answer ? 'একদম ঠিক!' : 'উঁহু, হলো না'}</span>
                <button className="btn btn-mint" onClick={next}>
                  {qi + 1 >= quiz.length ? 'Result দেখো' : 'পরের প্রশ্ন'}<Icon name="arrow_forward" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Reveal>
  );
}
