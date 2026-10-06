import { useState, useEffect, useRef, useMemo, type PointerEvent, type MouseEvent } from 'react';
import { useApp } from '../context';
import { photosOf } from '../lib/derive';
import { buzz, pad, toBn } from '../lib/utils';
import { Icon, Reveal, SectionHead } from '../components/ui';
import { Photocard } from '../components/Photocard';
import { PhotocardViewer } from '../components/PhotocardViewer';

type ViewMode = 'album' | 'orbit' | 'photocards' | 'journal';
type FilterTag = 'all' | 'fav' | 'nature' | 'special';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export function Gallery() {
  const { cfg, openLightbox, confetti, toast } = useApp();
  const photos = photosOf(cfg);

  // View mode & filters
  const [view, setView] = useState<ViewMode>('album');
  const [filter, setFilter] = useState<FilterTag>('all');
  const [activeOrbitIndex, setActiveOrbitIndex] = useState(0);
  const [autoSpin, setAutoSpin] = useState(true);
  const [pcOpen, setPcOpen] = useState<number | null>(null);

  // Likes system (persisted in localStorage)
  const [likes, setLikes] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('sumi_photo_likes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Floating hearts
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  // Cinematic Slideshow state
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePlaying, setSlidePlaying] = useState(true);

  // Handle Likes
  const handleLike = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    const emojis = ['💖', '🌸', '✨', '💜', '🥰'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const heartId = Date.now() + Math.random();

    setFloatingHearts(prev => [...prev, { id: heartId, x, y, emoji: randomEmoji }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== heartId));
    }, 1100);

    setLikes(prev => {
      const current = prev[index] || 0;
      const next = { ...prev, [index]: current + 1 };
      try { localStorage.setItem('sumi_photo_likes', JSON.stringify(next)); } catch {}
      return next;
    });

    buzz(25);
    const count = (likes[index] || 0) + 1;
    if (count % 4 === 0) {
      confetti(40);
      toast('অনেক ভালোবাসা পৌঁছে গেছে! 💌');
    }
  };

  // Filtered photos
  const filteredIndices = useMemo(() => {
    return photos.map((_, i) => {
      if (filter === 'all') return i;
      if (filter === 'fav' && [0, 1, 3, 4].includes(i)) return i; // curated favourites
      if (filter === 'nature' && [0, 2, 3, 5, 7].includes(i)) return i; // clouds, sky, flower
      if (filter === 'special' && [1, 4, 6, 8].includes(i)) return i; // childhood, red dupatta, drum
      return null;
    }).filter((x): x is number => x !== null);
  }, [photos, filter]);

  // 3D Carousel (Orbit)
  const ringRef = useRef<HTMLDivElement>(null);
  const spin = useRef({ a: 0, v: 0, drag: null as null | { x: number; a: number }, moved: false });
  const R = Math.round(90 / Math.tan(Math.PI / Math.max(photos.length, 3))) + 36;
  const anglePerItem = 360 / photos.length;

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const g = spin.current;
      if (!g.drag && autoSpin && view === 'orbit') {
        g.v = g.v * 0.95 + -0.15 * 0.05;
        g.a += g.v;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${g.a}deg)`;
      }

      // Calculate the photo closest to viewer (front)
      const normalizedAngle = ((-g.a % 360) + 360) % 360;
      const frontIndex = Math.round(normalizedAngle / anglePerItem) % photos.length;
      setActiveOrbitIndex(frontIndex);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoSpin, anglePerItem, photos.length, view]);

  const down = (e: PointerEvent) => {
    spin.current.drag = { x: e.clientX, a: spin.current.a };
    spin.current.moved = false;
    spin.current.v = 0;
  };
  const move = (e: PointerEvent) => {
    const g = spin.current;
    if (!g.drag) return;
    const dx = e.clientX - g.drag.x;
    if (Math.abs(dx) > 6) g.moved = true;
    const next = g.drag.a + dx * 0.35;
    g.v = next - g.a;
    g.a = next;
  };
  const up = () => {
    spin.current.drag = null;
    setTimeout(() => { spin.current.moved = false; }, 50);
  };

  const stepOrbit = (direction: number) => {
    spin.current.a += direction * anglePerItem;
    spin.current.v = 0;
    buzz(15);
  };

  // Slideshow timer
  useEffect(() => {
    if (!slideshowOpen || !slidePlaying) return;
    const id = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % photos.length);
    }, 4000);
    return () => clearInterval(id);
  }, [slideshowOpen, slidePlaying, photos.length]);

  const activeOrbitPhoto = photos[activeOrbitIndex] || photos[0];

  return (
    <section className="page center-page" data-screen-label="03 Gallery">
      {/* Header */}
      <SectionHead
        eyebrow="Chapter 02 · Memories In Frame"
        bn
        title={<>সুমির <span className="hl">ফটো অ্যালবাম</span> 📸</>}
        text="প্রতিটি ছবির পেছনে একটি করে গল্প, প্রতিটি হাসির পেছনে একমুঠো ভালোবাসা।"
      >
        <div className="chip-hint">
          <Icon name="favorite" fill />
          <span>{toBn(photos.length)}টি স্মৃতি · ট্যাপ করে বড় করে দেখো</span>
        </div>
      </SectionHead>

      {/* Floating Hearts in Screen */}
      {floatingHearts.map(h => (
        <span
          key={h.id}
          className="floating-heart-el"
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
        >
          {h.emoji}
        </span>
      ))}

      <div className="gallery-wrap">
        {/* Top Control Center: Mode Tabs + Slideshow + Filters */}
        <div className="gallery-top-ctrl">
          <div className="gallery-mode-tabs" role="tablist">
            <button
              className={`gallery-mode-tab ${view === 'album' ? 'active' : ''}`}
              onClick={() => { setView('album'); buzz(10); }}
            >
              <Icon name="grid_view" />স্মার্ট অ্যালবাম
            </button>
            <button
              className={`gallery-mode-tab ${view === 'orbit' ? 'active' : ''}`}
              onClick={() => { setView('orbit'); buzz(10); }}
            >
              <Icon name="3d_rotation" />৩৬০° অরবিট
            </button>
            <button
              className={`gallery-mode-tab ${view === 'photocards' ? 'active' : ''}`}
              onClick={() => { setView('photocards'); buzz(10); }}
            >
              <Icon name="style" />ফটোকার্ড
            </button>
            <button
              className={`gallery-mode-tab ${view === 'journal' ? 'active' : ''}`}
              onClick={() => { setView('journal'); buzz(10); }}
            >
              <Icon name="auto_stories" />স্মৃতির ডায়েরি
            </button>
          </div>

          <div className="gallery-sub-bar">
            {/* Category Filter Pills (Only for album / journal) */}
            <div className="gallery-filters">
              <button
                className={`gallery-filter-pill ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                সবগুলো ({toBn(photos.length)})
              </button>
              <button
                className={`gallery-filter-pill ${filter === 'fav' ? 'active' : ''}`}
                onClick={() => setFilter('fav')}
              >
                💖 প্রিয় ছবি
              </button>
              <button
                className={`gallery-filter-pill ${filter === 'nature' ? 'active' : ''}`}
                onClick={() => setFilter('nature')}
              >
                ☁️ প্রকৃতি ও আকাশ
              </button>
              <button
                className={`gallery-filter-pill ${filter === 'special' ? 'active' : ''}`}
                onClick={() => setFilter('special')}
              >
                ✨ বিশেষ স্মৃতি
              </button>
            </div>

            {/* Slideshow Button */}
            <button
              className="gallery-slideshow-trigger"
              onClick={() => { setSlideIndex(0); setSlideshowOpen(true); confetti(30); }}
            >
              <Icon name="play_circle" fill />স্মৃতির স্লাইডশো ▶
            </button>
          </div>
        </div>

        {/* VIEW 1: SMART ALBUM GRID */}
        {view === 'album' && (
          <div className="smart-grid">
            {filteredIndices.map(i => {
              const p = photos[i];
              const likeCount = likes[i] || 0;
              return (
                <Reveal key={i}>
                  <div className="smart-card" onClick={() => openLightbox(i)}>
                    <img className="smart-card-img" src={p.src} alt={p.caption} loading="lazy" />
                    <div className="smart-card-top">
                      <span className="smart-card-badge">#{toBn(i + 1)}</span>
                      <button
                        className={`smart-like-btn ${likeCount > 0 ? 'has-likes' : ''}`}
                        onClick={e => handleLike(e, i)}
                        title="Love this photo"
                      >
                        <Icon name="favorite" fill />
                        <span>{toBn(likeCount)}</span>
                      </button>
                    </div>
                    <div className="smart-card-grad" />
                    <div className="smart-card-bottom">
                      <div className="smart-card-title">{p.caption}</div>
                      {p.poem && <p className="smart-card-preview">{p.poem}</p>}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* VIEW 2: 3D ORBIT CAROUSEL */}
        {view === 'orbit' && (
          <div style={{ width: '100%' }}>
            <div
              className="carousel"
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerLeave={up}
              onPointerCancel={up}
            >
              <div className="ring" ref={ringRef}>
                {photos.map((p, i) => (
                  <img
                    key={i}
                    src={p.src}
                    alt={p.caption}
                    draggable={false}
                    style={{
                      transform: `rotateY(${(i * 360) / photos.length}deg) translateZ(${R}px)`,
                      borderColor: i === activeOrbitIndex ? 'var(--neon)' : 'rgba(232, 245, 214, .85)',
                    }}
                    onClick={() => {
                      if (!spin.current.moved) openLightbox(i);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Orbit Controls */}
            <div className="orbit-ctrl-bar">
              <button
                className="orbit-btn"
                onClick={() => stepOrbit(1)}
                aria-label="Previous"
                title="আগের ছবি"
              >
                <Icon name="arrow_back" />
              </button>
              <button
                className={`orbit-toggle-spin ${autoSpin ? 'active' : ''}`}
                onClick={() => setAutoSpin(!autoSpin)}
              >
                <Icon name={autoSpin ? 'pause' : 'play_arrow'} />
                {autoSpin ? 'ঘূর্ণন থামাও' : 'ঘোরাও'}
              </button>
              <button
                className="orbit-btn"
                onClick={() => stepOrbit(-1)}
                aria-label="Next"
                title="পরের ছবি"
              >
                <Icon name="arrow_forward" />
              </button>
            </div>

            {/* Active Spotlight Card */}
            <div className="orbit-spotlight">
              <span className="smart-card-badge" style={{ margin: '0 auto' }}>
                #{toBn(activeOrbitIndex + 1)} · {activeOrbitPhoto.caption}
              </span>
              <h3>{activeOrbitPhoto.caption}</h3>
              {activeOrbitPhoto.poem && <p>{activeOrbitPhoto.poem}</p>}
              <div className="orbit-spotlight-actions">
                <button
                  className="btn btn-dark"
                  onClick={() => openLightbox(activeOrbitIndex)}
                >
                  <Icon name="zoom_in" />বড় করে দেখো
                </button>
                <button
                  className="smart-like-btn"
                  onClick={e => handleLike(e, activeOrbitIndex)}
                >
                  <Icon name="favorite" fill />
                  <span>{toBn(likes[activeOrbitIndex] || 0)} Love</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: BTS PHOTOCARDS */}
        {view === 'photocards' && (
          <div className="pc-section pc-section-grid" style={{ width: '100%' }}>
            <div className="pc-section-head">
              <span className="pc-eyebrow">The Limited Edition</span>
              <h2>সুমির স্পেশাল <span>photocard</span> 💜</h2>
              <p>BTS স্টাইল হলোগ্রাফিক কার্ড। ট্যাপ করে সামনে-পেছনে উল্টে দেখো।</p>
            </div>
            <div className="pc-grid">
              {photos.map((p, i) => (
                <Reveal key={i}>
                  <Photocard
                    cfg={cfg}
                    photo={p}
                    index={i}
                    total={photos.length}
                    onClick={() => setPcOpen(i)}
                  />
                </Reveal>
              ))}
            </div>
            {pcOpen !== null && (
              <PhotocardViewer
                index={pcOpen}
                onChange={setPcOpen}
                onClose={() => setPcOpen(null)}
              />
            )}
          </div>
        )}

        {/* VIEW 4: POETIC JOURNAL */}
        {view === 'journal' && (
          <div className="journal">
            {filteredIndices.map(i => {
              const p = photos[i];
              return (
                <Reveal key={i} as="figure" onClick={() => openLightbox(i)}>
                  <div className="journal-card">
                    <img src={p.src} alt={p.caption} loading="lazy" />
                    <div className="journal-num">{pad(i + 1)}</div>
                    <figcaption>
                      <strong>{p.caption}</strong>
                      <i />
                      <p>{p.poem}</p>
                    </figcaption>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {/* FULLSCREEN CINEMATIC SLIDESHOW MODAL */}
      {slideshowOpen && (
        <div className="cinematic-slideshow" onClick={() => setSlideshowOpen(false)}>
          <div className="css-top" onClick={e => e.stopPropagation()}>
            <div className="smart-card-badge">
              {toBn(slideIndex + 1)} / {toBn(photos.length)}
            </div>
            <div className="css-progress-wrap">
              <div
                className="css-progress-bar"
                style={{ width: `${((slideIndex + 1) / photos.length) * 100}%` }}
              />
            </div>
            <button
              className="css-close"
              onClick={() => setSlideshowOpen(false)}
              aria-label="Close slideshow"
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="css-main" onClick={e => e.stopPropagation()}>
            <img
              className="css-img"
              src={photos[slideIndex].src}
              alt={photos[slideIndex].caption}
            />
            <div className="css-caption-box">
              <h3>{photos[slideIndex].caption}</h3>
              {photos[slideIndex].poem && <p>{photos[slideIndex].poem}</p>}
            </div>
          </div>

          <div className="css-controls" onClick={e => e.stopPropagation()}>
            <button
              className="icon-btn"
              onClick={() => {
                setSlideIndex(prev => (prev - 1 + photos.length) % photos.length);
                buzz(15);
              }}
              title="Previous"
            >
              <Icon name="arrow_back" />
            </button>
            <button
              className="icon-btn"
              style={{ background: 'var(--lime)', color: 'var(--ink)' }}
              onClick={() => setSlidePlaying(!slidePlaying)}
              title={slidePlaying ? 'Pause' : 'Play'}
            >
              <Icon name={slidePlaying ? 'pause' : 'play_arrow'} fill />
            </button>
            <button
              className="icon-btn"
              onClick={() => {
                setSlideIndex(prev => (prev + 1) % photos.length);
                buzz(15);
              }}
              title="Next"
            >
              <Icon name="arrow_forward" />
            </button>
            <button
              className="smart-like-btn"
              style={{ marginLeft: 10, padding: '10px 18px', fontSize: 14 }}
              onClick={e => handleLike(e, slideIndex)}
            >
              <Icon name="favorite" fill />
              <span>{toBn(likes[slideIndex] || 0)} Love</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
