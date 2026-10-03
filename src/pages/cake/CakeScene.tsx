/* The realistic cake scene, drawn as SVG (640 x 500).
   Pure drawing: all state comes in through props. */

interface Props {
  name: string;          // written on the cake
  photo: string;         // framed photo on the table
  lit: boolean[];        // one entry per candle
  lightsOn: boolean;     // room lights (after the candles are out)
  cutting: boolean;      // knife animation running
  served: boolean;       // slice is on the plate
  onCandle: (i: number) => void;
}

const CX = 320;
const pt = (cx: number, cy: number, rx: number, ry: number, t: number): [number, number] =>
  [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];

/* ---- Fixed decoration positions (computed once) ---- */

// Chocolate drips along the front edge of the top tier
const DRIP = [18, 32, 14, 38, 22, 28, 16, 36, 20, 30, 15, 34, 24];
const DRIPS = DRIP.map((len, i) => {
  const t = 0.06 * Math.PI + (i * 0.88 * Math.PI) / (DRIP.length - 1);
  const [x, y] = pt(CX, 185, 112, 21, t);
  const w = [7, 9, 6, 10, 8, 9, 6, 10, 7, 9, 6, 9, 8][i];
  return { x, y: y + 4, len, w };
});

// Piped rosettes on the ledge between the tiers (skip where the berries sit)
const LEDGE = Array.from({ length: 15 }, (_, i) => pt(CX, 291, 142, 25, (i / 14) * Math.PI))
  .filter(([x]) => !(x > 196 && x < 252) && !(x > 386 && x < 420));
// Pearl border at the base of the bottom tier
const PEARLS = Array.from({ length: 26 }, (_, i) => pt(CX, 396, 165, 30, (i / 25) * Math.PI));
// Strawberries resting on the ledge
const BERRIES: [number, number, number][] = [[214, 309, -18], [238, 314, 8], [404, 312, 14]];

// Fairy-light string across the wall
const BULBS = Array.from({ length: 15 }, (_, i) => {
  const t = (i + 0.5) / 15;
  const x = 640 * t;
  const y = 34 + 4 * 64 * t * (1 - t); // simple sag
  return { x, y: y + 8, c: ['#ffd27a', '#d7f56f', '#fff1c9', '#ffb3c7', '#b9e6ff'][i % 5], d: (i % 5) * 0.3 };
});

// Candle positions on top of the cake, back ones first so front ones overlap
function candleSpots(n: number) {
  if (n === 1) return [{ i: 0, x: CX, y: 186 }];
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2 + Math.PI / 2;
    const [x, y] = pt(CX, 184, n <= 3 ? 40 : 66, n <= 3 ? 7 : 11, t);
    return { i, x, y };
  }).sort((a, b) => a.y - b.y);
}

const FLAME = 'M0,-26 C5,-17 8,-9 6,-3 C4.5,1.5 -4.5,1.5 -6,-3 C-8,-9 -5,-17 0,-26 Z';
const BERRY = 'M0,-9 C7,-9 10,-2 7,5 C4.5,10 1.5,12 0,12 C-1.5,12 -4.5,10 -7,5 C-10,-2 -7,-9 0,-9 Z';
const LEAF = 'M0,-9 L-6,-13 L-2,-9 L-7,-7 L0,-8 L7,-7 L2,-9 L6,-13 Z';

export function CakeScene({ name, photo, lit, lightsOn, cutting, served, onCandle }: Props) {
  const spots = candleSpots(lit.length);
  const litCount = lit.filter(Boolean).length;
  const litFrac = lit.length ? litCount / lit.length : 0;
  const display = name.charAt(0) + name.slice(1).toLowerCase();

  return (
    <svg className={`cake-svg ${lightsOn ? 'lights-on' : ''}`} viewBox="0 0 640 500" role="img" aria-label={`Birthday cake for ${display}`}>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e3527" /><stop offset="1" stopColor="#0e1a13" /></linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6e4a31" /><stop offset="1" stopColor="#2f1d11" /></linearGradient>
        <linearGradient id="stand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b9c0c6" /><stop offset=".45" stopColor="#ffffff" /><stop offset="1" stopColor="#a9b1b8" /></linearGradient>
        <radialGradient id="plate" cx=".45" cy=".4" r=".7"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#cfd5da" /></radialGradient>
        <linearGradient id="cream" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d3c0a8" /><stop offset=".18" stopColor="#f2e7d9" /><stop offset=".42" stopColor="#fffbf5" /><stop offset=".72" stopColor="#efe3d3" /><stop offset="1" stopColor="#c7b199" />
        </linearGradient>
        <radialGradient id="creamTop" cx=".42" cy=".35" r=".75"><stop offset="0" stopColor="#fffefb" /><stop offset="1" stopColor="#eadcc9" /></radialGradient>
        <linearGradient id="pistachio" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9db884" /><stop offset=".2" stopColor="#cfe2bb" /><stop offset=".44" stopColor="#eef6e4" /><stop offset=".72" stopColor="#d2e5c0" /><stop offset="1" stopColor="#93ae7b" />
        </linearGradient>
        <radialGradient id="ganache" cx=".38" cy=".3" r=".8"><stop offset="0" stopColor="#7a4a2e" /><stop offset=".6" stopColor="#3f2113" /><stop offset="1" stopColor="#24110a" /></radialGradient>
        <linearGradient id="drip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4d2918" /><stop offset="1" stopColor="#2a130a" /></linearGradient>
        <radialGradient id="rosette" cx=".38" cy=".32" r=".7"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e2d4c2" /></radialGradient>
        <radialGradient id="rosetteGreen" cx=".38" cy=".32" r=".7"><stop offset="0" stopColor="#eef8e2" /><stop offset="1" stopColor="#a9c98e" /></radialGradient>
        <radialGradient id="pearl" cx=".35" cy=".3" r=".7"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d4ccc0" /></radialGradient>
        <radialGradient id="berry" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#ff6f6f" /><stop offset=".6" stopColor="#d61f3a" /><stop offset="1" stopColor="#8e0f22" /></radialGradient>
        <linearGradient id="candleShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset=".4" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".32" />
        </linearGradient>
        {['#9ad677', '#ff9fb8', '#b9a4ff'].map((c, k) => (
          <pattern key={c} id={`stripe${k}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
            <rect width="8" height="8" fill="#fdf8f0" /><rect width="3.2" height="8" fill={c} />
          </pattern>
        ))}
        <radialGradient id="flame" cx=".5" cy=".78" r=".75">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".25" stopColor="#fff5c4" /><stop offset=".55" stopColor="#ffc94a" /><stop offset=".85" stopColor="#ff8a1e" /><stop offset="1" stopColor="#ff6414" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameGlow"><stop offset="0" stopColor="#ffd28a" stopOpacity=".8" /><stop offset="1" stopColor="#ff9a3c" stopOpacity="0" /></radialGradient>
        <radialGradient id="candleLight" cx=".5" cy=".35" r=".6"><stop offset="0" stopColor="#ffb257" stopOpacity=".55" /><stop offset="1" stopColor="#ff9040" stopOpacity="0" /></radialGradient>
        <radialGradient id="roomLight" cx=".5" cy="0" r="1"><stop offset="0" stopColor="#fff1cf" stopOpacity=".28" /><stop offset="1" stopColor="#fff1cf" stopOpacity="0" /></radialGradient>
        <linearGradient id="sponge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf4ea" /><stop offset=".07" stopColor="#fbf4ea" />
          <stop offset=".07" stopColor="#ecc78c" /><stop offset=".3" stopColor="#e2b874" />
          <stop offset=".3" stopColor="#fff6e6" /><stop offset=".36" stopColor="#fff6e6" />
          <stop offset=".36" stopColor="#c8475b" /><stop offset=".41" stopColor="#b33a4e" />
          <stop offset=".41" stopColor="#ecc78c" /><stop offset=".64" stopColor="#e2b874" />
          <stop offset=".64" stopColor="#fff6e6" /><stop offset=".7" stopColor="#fff6e6" />
          <stop offset=".7" stopColor="#ecc78c" /><stop offset="1" stopColor="#d9a961" />
        </linearGradient>
        <linearGradient id="gapShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".45" /><stop offset="1" stopColor="#000" stopOpacity=".08" /></linearGradient>
        <linearGradient id="frameWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a06a40" /><stop offset="1" stopColor="#5a3820" /></linearGradient>
        <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8d969f" /><stop offset=".45" stopColor="#ffffff" /><stop offset=".6" stopColor="#c9d0d7" /><stop offset="1" stopColor="#7f8892" /></linearGradient>
        <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="blur2"><feGaussianBlur stdDeviation="1.6" /></filter>
        <clipPath id="photoClip"><rect x="-46" y="-138" width="92" height="124" /></clipPath>
      </defs>

      {/* Room */}
      <rect width="640" height="332" fill="url(#wall)" />
      <path d="M0,34 Q320,162 640,34" fill="none" stroke="#1a1a14" strokeWidth="1.4" opacity=".8" />
      {BULBS.map((b, k) => (
        <g key={k} transform={`translate(${b.x},${b.y})`}>
          <circle className="bulb-glow" r="14" fill={b.c} opacity=".35" filter="url(#blur8)" style={{ animationDelay: `${b.d}s` }} />
          <rect x="-2.5" y="-9" width="5" height="4" rx="1" fill="#2b2b22" />
          <ellipse className="bulb" ry="6" rx="4.2" fill={b.c} />
        </g>
      ))}
      <rect y="330" width="640" height="170" fill="url(#wood)" />
      {[352, 378, 410, 446, 482].map(y => <path key={y} d={`M0,${y} Q160,${y - 4} 320,${y + 2} T640,${y}`} stroke="#000" strokeOpacity=".12" fill="none" />)}
      <rect y="329" width="640" height="3" fill="#8a6244" opacity=".7" />

      {/* Framed photo */}
      <g transform="translate(92,430) rotate(-6)">
        <ellipse cx="4" cy="2" rx="62" ry="8" fill="#000" opacity=".45" filter="url(#blur2)" />
        <rect x="-58" y="-150" width="116" height="150" rx="4" fill="url(#frameWood)" />
        <rect x="-50" y="-142" width="100" height="134" fill="#fbf7f0" />
        <image href={photo} x="-46" y="-138" width="92" height="124" preserveAspectRatio="xMidYMid slice" clipPath="url(#photoClip)" />
        <rect x="-58" y="-150" width="116" height="150" rx="4" fill="none" stroke="#fff" strokeOpacity=".15" />
      </g>

      {/* Cake stand */}
      <ellipse cx={CX} cy="460" rx="175" ry="20" fill="#000" opacity=".5" filter="url(#blur8)" />
      <ellipse cx={CX} cy="452" rx="78" ry="13" fill="url(#stand)" />
      <path d={`M302,414 L338,414 L352,450 L288,450 Z`} fill="url(#stand)" />
      <ellipse cx={CX} cy="411" rx="202" ry="35" fill="#aab2b9" />
      <ellipse cx={CX} cy="405" rx="202" ry="34" fill="url(#plate)" />

      {/* Bottom tier */}
      <path d="M155,290 L155,396 A165,30 0 0 0 485,396 L485,290 Z" fill="url(#cream)" />
      <ellipse cx={CX} cy="290" rx="165" ry="30" fill="url(#creamTop)" />
      {[312, 338, 366].map(y => <path key={y} d={`M162,${y} A158,28 0 0 0 478,${y}`} fill="none" stroke="#000" strokeOpacity=".035" strokeWidth="5" />)}
      <text x={CX} y="346" textAnchor="middle" className="cake-writing small">Happy Birthday</text>
      <text x={CX} y="383" textAnchor="middle" className="cake-writing">{display}</text>
      {PEARLS.map(([x, y], k) => <circle key={k} cx={x} cy={y} r="6.5" fill="url(#pearl)" />)}

      {/* The gap where the slice was taken */}
      {served && (
        <g className="cut-gap">
          <polygon points="330,291 400,316 444,310" fill="#3a2315" />
          <polygon points="400,316 444,310 444,415 400,421" fill="url(#sponge)" />
          <polygon points="400,316 444,310 444,415 400,421" fill="url(#gapShade)" />
        </g>
      )}

      {/* Rosettes on the ledge */}
      {LEDGE.map(([x, y], k) => (
        <g key={k} transform={`translate(${x},${y})`}>
          <circle r="9" fill={k % 2 ? 'url(#rosetteGreen)' : 'url(#rosette)'} />
          <path d="M-4,0 A4,4 0 1 1 4,0 A2.5,2.5 0 1 1 -1,0" fill="none" stroke="#000" strokeOpacity=".09" strokeWidth="1.4" />
        </g>
      ))}

      {/* Top tier with chocolate ganache */}
      <path d="M208,185 L208,282 A112,21 0 0 0 432,282 L432,185 Z" fill="url(#pistachio)" />
      {DRIPS.map((d, k) => (
        <path key={k} d={`M${d.x - d.w / 2},${d.y - 6} L${d.x - d.w / 2},${d.y + d.len - d.w / 2} A${d.w / 2},${d.w / 2} 0 0 0 ${d.x + d.w / 2},${d.y + d.len - d.w / 2} L${d.x + d.w / 2},${d.y - 6} Z`} fill="url(#drip)" />
      ))}
      <path d="M432,185 A112,21 0 0 1 208,185 L208,194 A112,21 0 0 0 432,194 Z" fill="url(#drip)" />
      <ellipse cx={CX} cy="185" rx="112" ry="21" fill="url(#ganache)" />
      <ellipse cx="292" cy="179" rx="44" ry="6" fill="#fff" opacity=".12" />

      {/* Strawberries */}
      {BERRIES.map(([x, y, r], k) => (
        <g key={k} transform={`translate(${x},${y}) rotate(${r})`}>
          <path d={BERRY} fill="url(#berry)" />
          {[[-3, -2], [3, -1], [0, 3], [-4, 4], [4, 5], [0, -5]].map(([sx, sy], s) => <ellipse key={s} cx={sx} cy={sy} rx=".8" ry="1.2" fill="#ffe28a" opacity=".8" />)}
          <path d={LEAF} fill="#3f8a3a" />
        </g>
      ))}

      {/* Candles (bodies) */}
      {spots.map(({ i, x, y }) => (
        <g key={i} className="candle" onClick={() => lit[i] && onCandle(i)}>
          <rect x={x - 4.5} y={y - 50} width="9" height="50" rx="1.5" fill={`url(#stripe${i % 3})`} />
          <rect x={x - 4.5} y={y - 50} width="9" height="50" rx="1.5" fill="url(#candleShade)" />
          <ellipse cx={x} cy={y - 50} rx="4.5" ry="1.6" fill="#fffaf2" />
          <path d={`M${x - 4.5},${y - 49} q1,6 2,0`} fill="#fffaf2" />
          <path d={`M${x},${y - 50} q1,-4 -0.5,-7`} stroke="#2a1a10" strokeWidth="1.3" fill="none" />
          <rect x={x - 12} y={y - 90} width="24" height="92" fill="transparent" />
        </g>
      ))}

      {/* Plate with the served slice */}
      <g transform="translate(0,0)">
        <ellipse cx="560" cy="462" rx="70" ry="12" fill="#000" opacity=".4" filter="url(#blur2)" />
        <ellipse cx="560" cy="456" rx="66" ry="14" fill="#aab2b9" />
        <ellipse cx="560" cy="453" rx="66" ry="13" fill="url(#plate)" />
        {served && (
          <g className="slice">
            <polygon points="526,450 584,450 584,394 526,394" fill="url(#sponge)" />
            <polygon points="584,450 606,438 606,384 584,394" fill="url(#cream)" />
            <polygon points="526,394 584,394 606,384 552,378" fill="url(#creamTop)" />
            <circle cx="568" cy="386" r="6" fill="url(#rosette)" />
            <circle cx="595" cy="440" r="4" fill="url(#pearl)" />
          </g>
        )}
      </g>

      {/* Knife */}
      <g className={`knife ${cutting ? 'go' : ''}`}>
        <path d="M-6,-120 L6,-120 L7,-8 Q0,8 -7,-8 Z" fill="url(#blade)" />
        <rect x="-8" y="-128" width="16" height="9" rx="2" fill="#c9ced3" />
        <rect x="-6" y="-196" width="12" height="70" rx="5" fill="#3a2418" />
        <circle cy="-178" r="1.8" fill="#d9c2a0" /><circle cy="-148" r="1.8" fill="#d9c2a0" />
      </g>

      {/* Lighting: dark room lit by candles, then lights come on */}
      <rect width="640" height="500" fill="#000" className="fade-layer" opacity={lightsOn ? 0 : 0.34} pointerEvents="none" />
      <rect width="640" height="500" fill="url(#candleLight)" className="fade-layer" opacity={litFrac} pointerEvents="none" />
      <rect width="640" height="500" fill="url(#roomLight)" className="fade-layer" opacity={lightsOn ? 1 : 0} pointerEvents="none" />

      {/* Flames + smoke (on top of the lighting so they glow) */}
      {spots.map(({ i, x, y }) => (
        <g key={i} transform={`translate(${x},${y - 57})`} onClick={() => lit[i] && onCandle(i)} className="candle">
          {lit[i] ? (
            <g>
              <circle className="flame-glow" r="26" fill="url(#flameGlow)" style={{ animationDelay: `${(i % 4) * 0.2}s` }} />
              <g className="flame" style={{ animationDelay: `${(i % 3) * 0.05}s` }}>
                <path d={FLAME} fill="url(#flame)" />
                <ellipse cy="-3" rx="2.2" ry="3.6" fill="#7aa8ff" opacity=".75" />
              </g>
            </g>
          ) : (
            <path className="smoke" d="M0,0 C-6,-12 6,-22 0,-34 C-6,-46 5,-56 0,-70" style={{ animationDelay: `${(i % 3) * 0.1}s` }} />
          )}
        </g>
      ))}
    </svg>
  );
}
