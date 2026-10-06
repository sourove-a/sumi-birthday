import type { Paper, Quote } from '../../data';
import { pad, toBn } from '../../lib/utils';
import { Icon } from '../../components/ui';

/** Order used when a line has no paper picked ("নিজে থেকে"). */
export const PAPERS: Paper[] = [
  'khata',
  'sticky',
  'notepad',
  'dotted',
  'diary',
  'grid',
  'kraft',
  'airmail',
  'chalk',
  'parchment',
  'midnight',
  'polaroid',
  'sakura',
  'gazette',
];

export const PAPER_NAMES: Record<Paper, string> = {
  khata: 'খাতা',
  notepad: 'Notepad',
  diary: 'ডায়েরি',
  grid: 'গ্রাফ খাতা',
  sticky: 'Sticky note',
  kraft: 'Kraft কাগজ',
  airmail: 'Airmail চিঠি',
  chalk: 'Chalkboard',
  dotted: 'Bullet journal',
  parchment: 'রাজকীয় পার্চমেন্ট',
  midnight: 'নীল জোছনা আকাশ',
  polaroid: 'পোলারয়েড ফ্রেম',
  sakura: 'সাকুরা জলরং',
  gazette: 'ভিন্টেজ গেজেট',
};

export const paperOf = (q: Quote, i: number): Paper => q.paper || PAPERS[i % PAPERS.length];

/** The little extras on each kind of page (holes, spiral, tape, pin, ribbon, moon ...). */
function Decor({ paper }: { paper: Paper }) {
  switch (paper) {
    case 'khata':
      return <span className="qn-holes" aria-hidden="true"><i /><i /><i /></span>;
    case 'notepad':
      return <span className="qn-spiral" aria-hidden="true" />;
    case 'diary':
      return <span className="qn-tape" aria-hidden="true" />;
    case 'grid':
      return <span className="qn-clip" aria-hidden="true" />;
    case 'sticky':
      return <span className="qn-pin" aria-hidden="true" />;
    case 'kraft':
      return (
        <>
          <span className="qn-twine" aria-hidden="true" />
          <span className="qn-seal" aria-hidden="true"><Icon name="favorite" fill /></span>
        </>
      );
    case 'airmail':
      return <span className="qn-stamp" aria-hidden="true"><Icon name="favorite" fill /><small>প্রিয়</small></span>;
    case 'chalk':
      return null;
    case 'dotted':
      return <span className="qn-washi" aria-hidden="true" />;
    case 'parchment':
      return (
        <>
          <span className="qn-ribbon" aria-hidden="true" />
          <span className="qn-filigree" aria-hidden="true">❦</span>
        </>
      );
    case 'midnight':
      return <span className="qn-moonclip" aria-hidden="true"><i className="qn-moon-shape" /></span>;
    case 'polaroid':
      return <span className="qn-rosetape" aria-hidden="true"><Icon name="favorite" fill /></span>;
    case 'sakura':
      return <span className="qn-pressedflower" aria-hidden="true">🌸</span>;
    case 'gazette':
      return (
        <>
          <span className="qn-gazette-head" aria-hidden="true">★ LOVE CHRONICLE ★</span>
          <span className="qn-safetypin" aria-hidden="true" />
        </>
      );
  }
}

/** Favourite lines written on different notebook pages. */
export function QuoteNotes({ quotes }: { quotes: Quote[] }) {
  return (
    <div className="qn-wall">
      {quotes.map((q, i) => {
        const paper = paperOf(q, i);
        const tilt = [-1.2, 0.8, -0.6, 1.1, -0.9, 0.7][i % 6];
        const skipDoodle = paper === 'kraft' || paper === 'airmail' || paper === 'gazette' || paper === 'polaroid';

        return (
          <figure key={i} className={`qn qn-${paper}`} style={{ ['--tilt' as string]: `${tilt}deg` }}>
            <Decor paper={paper} />
            {!skipDoodle && <Icon name="favorite" className="qn-doodle" />}
            <blockquote>
              <p>{q.text}</p>
              {(q.orig || '').trim() && <small>{q.orig}</small>}
            </blockquote>
            <figcaption>
              <span className="qn-page">পাতা {toBn(pad(i + 1))}</span>
              {q.author.trim() && <span className="qn-author">— {q.author}</span>}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

/** Tiny page sample for the admin style picker. */
export const PaperThumb = ({ paper }: { paper: Paper }) => (
  <span className={`qn qn-${paper} qn-thumb`} aria-hidden="true" />
);
