import React from 'react';
import {C, H, W, rnd} from './theme';
import {dunePath} from './components';

/* ───────────── Rusty ship (side view), origin = keel centre ───────────── */
export const Ship: React.FC<{scale?: number; tilt?: number; x: number; y: number; tone?: number}> = ({
  scale = 1,
  tilt = -4,
  x,
  y,
  tone = 0,
}) => {
  const hull = tone ? '#6E5546' : C.rust;
  const hullDark = tone ? '#4E3D33' : '#5E2F1C';
  const cabin = tone ? '#B9AFA4' : '#D9CBB4';
  return (
    <g transform={`translate(${x}, ${y}) rotate(${tilt}) scale(${scale})`}>
      {/* hull */}
      <path
        d="M-380,-150 L360,-160 Q420,-165 440,-215 L455,-215 Q440,-120 380,-40 Q330,10 240,20 L-300,20 Q-370,10 -390,-60 Z"
        fill={hull}
      />
      <path d="M-380,-150 L360,-160 Q420,-165 440,-215 L455,-215 L452,-200 Q415,-140 360,-138 L-382,-128 Z" fill={hullDark} />
      {/* rust streaks */}
      {Array.from({length: 14}).map((_, i) => (
        <rect
          key={i}
          x={-340 + i * 50 + rnd(i) * 20}
          y={-125}
          width={6 + rnd(i + 9) * 8}
          height={40 + rnd(i + 3) * 90}
          fill={hullDark}
          opacity={0.55}
          rx={3}
        />
      ))}
      {/* waterline stripe */}
      <path d="M-388,-40 L392,-46 Q385,-30 378,-24 L-372,-18 Z" fill={tone ? '#5A4A40' : '#6B2E1A'} />
      {/* portholes */}
      {[-250, -170, -90, -10, 70].map((px) => (
        <circle key={px} cx={px} cy={-95} r={11} fill="#2a1a12" stroke={hullDark} strokeWidth={4} />
      ))}
      {/* wheelhouse */}
      <rect x={-260} y={-290} width={220} height={140} fill={cabin} />
      <rect x={-240} y={-268} width={50} height={44} fill="#3a2a22" />
      <rect x={-175} y={-268} width={50} height={44} fill="#3a2a22" />
      <rect x={-110} y={-268} width={50} height={44} fill="#3a2a22" />
      <rect x={-270} y={-302} width={240} height={16} fill={hullDark} />
      <rect x={-200} y={-200} width={140} height={10} fill={hull} opacity={0.6} />
      {/* funnel */}
      <path d="M-20,-150 L10,-260 L70,-260 L60,-150 Z" fill={hull} />
      <rect x={6} y={-275} width={68} height={18} fill={hullDark} />
      {/* mast */}
      <rect x={200} y={-420} width={12} height={265} fill={hullDark} />
      <rect x={140} y={-380} width={132} height={9} fill={hullDark} />
      <line x1={206} y1={-420} x2={430} y2={-205} stroke={hullDark} strokeWidth={3} />
      <line x1={206} y1={-420} x2={-30} y2={-262} stroke={hullDark} strokeWidth={3} />
      {/* rail */}
      {Array.from({length: 16}).map((_, i) => (
        <rect key={i} x={-30 + i * 25} y={-185} width={4} height={30} fill={hullDark} />
      ))}
      <rect x={-30} y={-188} width={400} height={5} fill={hullDark} />
    </g>
  );
};

/* ───────────── Desert with ships (scene 1 + scene 12) ───────────── */
export const DesertShips: React.FC<{f: number; cool?: boolean; zoom: number; sand?: boolean}> = ({
  f,
  cool = false,
  zoom,
  sand = true,
}) => {
  const sky1 = cool ? '#E9EDF0' : '#FBF3E4';
  const sky2 = cool ? '#D9D2C4' : '#F4D9A6';
  const d1 = cool ? '#D8C7A8' : '#EBCB94';
  const d2 = cool ? '#CDB792' : '#DFAE6C';
  const d3 = cool ? '#B99F78' : '#C98E4E';
  const cx = 1010;
  const cy = 700;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id={`sky-${cool}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky1} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
        <linearGradient id={`shade-${cool}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#5a3412" stopOpacity={0.25} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#sky-${cool})`} />
      <g transform={`translate(${cx}, ${cy}) scale(${zoom}) translate(${-cx}, ${-cy})`}>
        {/* sun */}
        <circle cx={420} cy={300} r={230} fill={cool ? '#fff' : '#FFE6B0'} opacity={0.35} />
        <circle cx={420} cy={300} r={110} fill={cool ? '#F4F1EA' : '#FFF1CF'} />
        {/* far dunes */}
        <path d={dunePath(610, 26, 0.004, 1.2)} fill={d1} opacity={0.8} />
        <Ship x={1560} y={640} scale={0.32} tilt={3} tone={1} />
        <path d={dunePath(660, 34, 0.003, 2.4)} fill={d1} />
        {/* hero ship */}
        <Ship x={cx} y={745} scale={1} tilt={-5} tone={cool ? 1 : 0} />
        <path d={dunePath(760, 30, 0.0035, 0.3)} fill={d2} />
        <path d={dunePath(860, 40, 0.0025, 3.6)} fill={d3} />
        <path d={dunePath(860, 40, 0.0025, 3.6)} fill={`url(#shade-${cool})`} />
        {/* ripples */}
        {Array.from({length: 18}).map((_, i) => (
          <path
            key={i}
            d={`M${rnd(i) * W},${900 + rnd(i + 4) * 160} q60,-14 120,0`}
            stroke="#a8713a"
            strokeWidth={3}
            fill="none"
            opacity={0.35}
          />
        ))}
      </g>
      {/* blowing sand */}
      {sand
        ? Array.from({length: 70}).map((_, i) => {
            const speed = 6 + rnd(i) * 10;
            const x = ((rnd(i + 2) * W + f * speed) % (W + 100)) - 50;
            const y = 520 + rnd(i + 5) * 520 + Math.sin(f * 0.08 + i) * 8;
            return <ellipse key={i} cx={x} cy={y} rx={10 + rnd(i) * 14} ry={1.6} fill="#fff" opacity={0.35} />;
          })
        : null}
    </svg>
  );
};

/* ───────────── Architecture pieces ───────────── */

/** Ribbed turquoise dome on a drum. (cx, base y) */
export const Dome: React.FC<{cx: number; y: number; r: number; color?: string; ribs?: boolean}> = ({
  cx,
  y,
  r,
  color = C.turq,
  ribs = true,
}) => {
  const drumH = r * 0.55;
  const top = y - drumH;
  return (
    <g>
      <rect x={cx - r * 0.86} y={top} width={r * 1.72} height={drumH} fill={C.azure} />
      <rect x={cx - r * 0.86} y={top + drumH * 0.2} width={r * 1.72} height={drumH * 0.22} fill={C.paper} opacity={0.7} />
      <path
        d={`M${cx - r},${top} C${cx - r * 1.08},${top - r * 0.9} ${cx - r * 0.35},${top - r * 1.35} ${cx},${top - r * 1.55} C${cx + r * 0.35},${top - r * 1.35} ${cx + r * 1.08},${top - r * 0.9} ${cx + r},${top} Z`}
        fill={color}
      />
      {ribs
        ? [-0.6, -0.3, 0, 0.3, 0.6].map((k) => (
            <path
              key={k}
              d={`M${cx + k * r},${top} Q${cx + k * r * 0.9},${top - r * 0.95} ${cx},${top - r * 1.52}`}
              stroke={C.turqDeep}
              strokeWidth={r * 0.05}
              fill="none"
              opacity={0.55}
            />
          ))
        : null}
      <path
        d={`M${cx - r * 0.55},${top - r * 0.2} C${cx - r * 0.6},${top - r * 0.8} ${cx - r * 0.25},${top - r * 1.15} ${cx - r * 0.05},${top - r * 1.3}`}
        stroke="#fff"
        strokeWidth={r * 0.07}
        fill="none"
        opacity={0.35}
        strokeLinecap="round"
      />
      <rect x={cx - 3} y={top - r * 1.8} width={6} height={r * 0.3} fill={C.gold} />
    </g>
  );
};

/** Minaret (tapered tower with lantern). base centre (cx, y) */
export const Minaret: React.FC<{cx: number; y: number; h: number; w: number; tone?: string; cap?: string}> = ({
  cx,
  y,
  h,
  w,
  tone = C.sand,
  cap = C.turq,
}) => (
  <g>
    <path d={`M${cx - w / 2},${y} L${cx - w * 0.38},${y - h} L${cx + w * 0.38},${y - h} L${cx + w / 2},${y} Z`} fill={tone} />
    {[0.25, 0.45, 0.65, 0.82].map((k) => (
      <rect key={k} x={cx - w * 0.47 + k * w * 0.06} y={y - h * k} width={w * (0.94 - k * 0.12)} height={h * 0.035} fill={k > 0.6 ? cap : C.azure} />
    ))}
    <rect x={cx - w * 0.55} y={y - h - w * 0.25} width={w * 1.1} height={w * 0.28} fill={C.brick} />
    <path d={`M${cx - w * 0.42},${y - h - w * 0.25} Q${cx},${y - h - w * 1.1} ${cx + w * 0.42},${y - h - w * 0.25} Z`} fill={cap} />
  </g>
);

/** Pishtaq (portal) with pointed arch and tile frame. centre bottom (cx, y) */
export const Portal: React.FC<{cx: number; y: number; w: number; h: number; face?: string}> = ({
  cx,
  y,
  w,
  h,
  face = '#E6C38E',
}) => {
  const aw = w * 0.52;
  const ah = h * 0.66;
  return (
    <g>
      <rect x={cx - w / 2} y={y - h} width={w} height={h} fill={face} />
      {/* tile frame */}
      <rect x={cx - w / 2 + w * 0.05} y={y - h + w * 0.05} width={w * 0.9} height={h - w * 0.05} fill={C.azure} />
      <rect x={cx - w / 2 + w * 0.08} y={y - h + w * 0.08} width={w * 0.84} height={h - w * 0.08} fill={C.turq} />
      {/* pattern band */}
      {Array.from({length: 8}).map((_, i) => (
        <rect
          key={i}
          x={cx - w / 2 + w * 0.08 + i * (w * 0.84 / 8)}
          y={y - h + w * 0.1}
          width={w * 0.84 / 16}
          height={w * 0.84 / 16}
          fill={C.gold}
          transform={`rotate(45 ${cx - w / 2 + w * 0.08 + i * (w * 0.84 / 8) + w * 0.0262} ${y - h + w * 0.126})`}
        />
      ))}
      {/* arch niche */}
      <path
        d={`M${cx - aw / 2},${y} L${cx - aw / 2},${y - ah * 0.62} Q${cx - aw / 2},${y - ah * 0.95} ${cx},${y - ah} Q${cx + aw / 2},${y - ah * 0.95} ${cx + aw / 2},${y - ah * 0.62} L${cx + aw / 2},${y} Z`}
        fill={C.azureDeep}
      />
      <path
        d={`M${cx - aw * 0.36},${y} L${cx - aw * 0.36},${y - ah * 0.5} Q${cx - aw * 0.36},${y - ah * 0.78} ${cx},${y - ah * 0.84} Q${cx + aw * 0.36},${y - ah * 0.78} ${cx + aw * 0.36},${y - ah * 0.5} L${cx + aw * 0.36},${y} Z`}
        fill="#0d2a52"
      />
      {/* muqarnas hint */}
      {Array.from({length: 5}).map((_, i) => (
        <circle key={i} cx={cx - aw * 0.28 + i * aw * 0.14} cy={y - ah * 0.6} r={aw * 0.05} fill={C.turqLight} opacity={0.5} />
      ))}
    </g>
  );
};

/** One madrasa facade: portal + side wings with arcades + optional dome + corner minarets */
export const Madrasa: React.FC<{cx: number; y: number; s: number; dome?: boolean; minarets?: boolean}> = ({
  cx,
  y,
  s,
  dome = false,
  minarets = true,
}) => {
  const wingW = 260 * s;
  const wingH = 170 * s;
  return (
    <g>
      {dome ? <Dome cx={cx} y={y - 330 * s} r={120 * s} /> : null}
      {/* wings */}
      {[-1, 1].map((side) => (
        <g key={side}>
          <rect x={side < 0 ? cx - 150 * s - wingW : cx + 150 * s} y={y - wingH} width={wingW} height={wingH} fill="#E3BC86" />
          {[0, 1, 2].map((k) => {
            const ax = (side < 0 ? cx - 150 * s - wingW : cx + 150 * s) + 25 * s + k * 80 * s;
            return (
              <g key={k}>
                <path
                  d={`M${ax},${y - 20 * s} L${ax},${y - 105 * s} Q${ax + 30 * s},${y - 140 * s} ${ax + 60 * s},${y - 105 * s} L${ax + 60 * s},${y - 20 * s} Z`}
                  fill={C.azure}
                />
                <path
                  d={`M${ax + 8 * s},${y - 20 * s} L${ax + 8 * s},${y - 100 * s} Q${ax + 30 * s},${y - 126 * s} ${ax + 52 * s},${y - 100 * s} L${ax + 52 * s},${y - 20 * s} Z`}
                  fill="#123563"
                />
              </g>
            );
          })}
          <rect x={side < 0 ? cx - 150 * s - wingW : cx + 150 * s} y={y - wingH} width={wingW} height={14 * s} fill={C.turq} />
        </g>
      ))}
      {minarets ? (
        <>
          <Minaret cx={cx - 150 * s - wingW - 10 * s} y={y} h={330 * s} w={44 * s} />
          <Minaret cx={cx + 150 * s + wingW + 10 * s} y={y} h={330 * s} w={44 * s} />
        </>
      ) : null}
      <Portal cx={cx} y={y} w={300 * s} h={330 * s} />
    </g>
  );
};

/** Camel silhouette. origin = feet centre. */
export const Camel: React.FC<{x: number; y: number; s?: number; step?: number; color?: string; flip?: boolean}> = ({
  x,
  y,
  s = 1,
  step = 0,
  color = '#6B4426',
  flip = false,
}) => {
  const a = Math.sin(step) * 10;
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -s : s}, ${s})`} fill={color}>
      {/* legs */}
      <rect x={-36} y={-60} width={8} height={60} transform={`rotate(${a} -32 -60)`} />
      <rect x={-20} y={-60} width={8} height={60} transform={`rotate(${-a} -16 -60)`} />
      <rect x={18} y={-60} width={8} height={60} transform={`rotate(${-a} 22 -60)`} />
      <rect x={32} y={-60} width={8} height={60} transform={`rotate(${a} 36 -60)`} />
      {/* body + humps */}
      <path d="M-46,-58 Q-50,-92 -24,-100 Q-12,-132 4,-102 Q16,-130 32,-100 Q50,-96 48,-58 Z" />
      {/* neck + head */}
      <path d="M40,-80 Q62,-90 64,-118 Q66,-134 80,-134 L92,-128 Q94,-122 84,-120 Q74,-118 74,-104 Q72,-80 48,-64 Z" />
      {/* load */}
      <rect x={-22} y={-114} width={44} height={16} rx={4} fill={C.ochre} />
      <rect x={-10} y={-122} width={20} height={10} rx={3} fill={C.turq} />
    </g>
  );
};

/** Piala (tea bowl) with cobalt "cotton" pattern. centre top rim (cx, y), radius r */
export const Piala: React.FC<{cx: number; y: number; r: number; fill?: number; id?: string}> = ({
  cx,
  y,
  r,
  fill = 0,
  id = 'p',
}) => {
  const bowl = `M${cx - r},${y} Q${cx - r * 0.96},${y + r * 0.95} ${cx - r * 0.32},${y + r * 1.02} L${cx + r * 0.32},${y + r * 1.02} Q${cx + r * 0.96},${y + r * 0.95} ${cx + r},${y} Z`;
  const level = y + r * 0.98 - fill * r * 0.88;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-in`}>
          <path d={bowl} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={y + r * 1.1} rx={r * 0.4} ry={r * 0.08} fill="#000" opacity={0.12} />
      <path d={bowl} fill="#FFFFFF" />
      {/* cotton boll pattern */}
      <g clipPath={`url(#${id}-in)`}>
        {[-0.62, -0.2, 0.22, 0.64].map((k, i) => (
          <g key={i} transform={`translate(${cx + k * r}, ${y + r * 0.5})`}>
            {[0, 1, 2, 3].map((j) => (
              <ellipse
                key={j}
                cx={0}
                cy={-r * 0.11}
                rx={r * 0.07}
                ry={r * 0.12}
                fill="#1d4f9c"
                transform={`rotate(${j * 90 + 45})`}
              />
            ))}
            <circle r={r * 0.05} fill="#fff" />
          </g>
        ))}
        <rect x={cx - r} y={y + r * 0.12} width={r * 2} height={r * 0.06} fill="#1d4f9c" />
        <rect x={cx - r} y={y + r * 0.86} width={r * 2} height={r * 0.05} fill="#1d4f9c" />
      </g>
      {/* rim + tea surface (seen slightly from above) */}
      <ellipse cx={cx} cy={y} rx={r} ry={r * 0.22} fill="#F4F4F4" stroke="#1d4f9c" strokeWidth={r * 0.03} />
      {fill > 0.02 ? (
        <ellipse
          cx={cx}
          cy={y + (level - y) * 0.18}
          rx={r * (0.55 + 0.42 * fill)}
          ry={r * 0.18 * (0.55 + 0.42 * fill)}
          fill="#B5651D"
        />
      ) : null}
    </g>
  );
};

/** Round non bread with stamped centre. */
export const Non: React.FC<{cx: number; cy: number; r: number; half?: 'l' | 'r'; seed?: number}> = ({
  cx,
  cy,
  r,
  half,
  seed = 1,
}) => {
  const clip = half === 'l' ? `M${cx - r - 4},${cy - r - 4} L${cx + 6},${cy - r - 4} L${cx - 8},${cy - r * 0.3} L${cx + 10},${cy + r * 0.2} L${cx - 4},${cy + r + 4} L${cx - r - 4},${cy + r + 4} Z`
    : half === 'r' ? `M${cx + r + 4},${cy - r - 4} L${cx + 6},${cy - r - 4} L${cx - 8},${cy - r * 0.3} L${cx + 10},${cy + r * 0.2} L${cx - 4},${cy + r + 4} L${cx + r + 4},${cy + r + 4} Z`
    : undefined;
  const id = `non-${half ?? 'f'}-${seed}-${Math.round(cx)}`;
  return (
    <g>
      {clip ? (
        <defs>
          <clipPath id={id}>
            <path d={clip} />
          </clipPath>
        </defs>
      ) : null}
      <g clipPath={clip ? `url(#${id})` : undefined}>
        <circle cx={cx} cy={cy} r={r} fill="#C9802F" />
        <circle cx={cx} cy={cy} r={r * 0.9} fill="#DD9A45" />
        <circle cx={cx} cy={cy} r={r * 0.62} fill="#EFC27E" />
        {Array.from({length: 40}).map((_, i) => {
          const a = rnd(i + seed * 50) * Math.PI * 2;
          const d = Math.sqrt(rnd(i * 3 + seed)) * r * 0.55;
          return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={r * 0.025} fill="#B06A22" />;
        })}
        {Array.from({length: 24}).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return <circle key={i} cx={cx + Math.cos(a) * r * 0.76} cy={cy + Math.sin(a) * r * 0.76} r={r * 0.03} fill="#3a2a1a" opacity={0.7} />;
        })}
      </g>
    </g>
  );
};
