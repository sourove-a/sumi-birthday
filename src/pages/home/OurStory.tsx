import { useApp } from '../../context';
import { Icon, Reveal, SectionHead } from '../../components/ui';

/** "Our story" timeline: a line down the middle, moments alternate left / right. */
export function OurStory() {
  const { cfg, openLightbox } = useApp();
  const items = (cfg.story || []).filter(s => s.title.trim() || s.text.trim());
  if (!items.length) return null;

  return (
    <div className="block" style={{ alignItems: 'center' }}>
      <Reveal>
        <SectionHead eyebrow="07 · Us" bn title={<>আমাদের <span className="hl">গল্প</span></>}
          text="শুরু থেকে আজ পর্যন্ত, ছোট ছোট কিছু দিন।" />
      </Reveal>
      <div className="story">
        {items.map((s, i) => (
          <Reveal key={i} className="story-item">
            <span className="story-node"><Icon name="favorite" fill /></span>
            <div className="story-card">
              {s.photo && (
                <div className="story-photo" onClick={() => {
                  const idx = cfg.photos.findIndex(p => p.src === s.photo);
                  if (idx >= 0) openLightbox(idx);
                }}>
                  <img src={s.photo} alt="" loading="lazy" />
                </div>
              )}
              <div className="story-body">
                <span className="story-date">{s.date}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
        <Reveal className="story-end"><Icon name="all_inclusive" /><span>এখনো লেখা চলছে…</span></Reveal>
      </div>
    </div>
  );
}
