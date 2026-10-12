import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, H, W, clamp, easeInOut, easeOutBack, ip, rnd} from './theme';

/* ───────────── Text ───────────── */

type TitleProps = {
  text: string;
  f: number;
  start?: number;
  end?: number;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
  shadow?: boolean;
  weight?: number;
  accent?: string; // word(s) to colour
  accentColor?: string;
};

/** Headline that rises word by word, optional exit fade. Max ~7 words. */
export const Title: React.FC<TitleProps> = ({
  text,
  f,
  start = 0,
  end,
  x = 110,
  y = 90,
  size = 74,
  color = C.ink,
  align = 'left',
  maxWidth = 1300,
  shadow = false,
  weight = 700,
  accent,
  accentColor = C.turq,
}) => {
  const words = text.split(' ');
  const out = end === undefined ? 1 : 1 - ip(f, [end - 8, end], [0, 1]);
  const left = align === 'center' ? x - maxWidth / 2 : align === 'right' ? x - maxWidth : x;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: y,
        width: maxWidth,
        textAlign: align,
        fontFamily: F.display,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.12,
        letterSpacing: -1,
        color,
        opacity: out,
        textShadow: shadow ? '0 4px 24px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.35)' : undefined,
      }}
    >
      {words.map((w, i) => {
        const t = ip(f, [start + i * 3, start + i * 3 + 14], [0, 1]);
        const isAcc = accent !== undefined && accent.split(' ').includes(w);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'top',
              paddingBottom: size * 0.12,
              marginBottom: -size * 0.12,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - t) * 110}%)`,
                color: isAcc ? accentColor : undefined,
              }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Small rounded label (map names, captions inside scenes). */
export const Pill: React.FC<{
  text: React.ReactNode;
  x: number;
  y: number;
  f: number;
  start: number;
  bg?: string;
  color?: string;
  size?: number;
  anchor?: 'center' | 'left' | 'right';
  end?: number;
}> = ({text, x, y, f, start, bg = C.ink, color = C.white, size = 30, anchor = 'center', end}) => {
  const t = clamp((f - start) / 10);
  const s = f < start ? 0 : 0.6 + 0.4 * easeOutBack(t);
  const o = end === undefined ? 1 : 1 - ip(f, [end - 6, end], [0, 1]);
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) scale(${s})`,
        transformOrigin: anchor === 'left' ? 'left center' : anchor === 'right' ? 'right center' : 'center',
        background: bg,
        color,
        fontFamily: F.body,
        fontWeight: 800,
        fontSize: size,
        padding: `${size * 0.32}px ${size * 0.7}px`,
        borderRadius: size,
        whiteSpace: 'nowrap',
        opacity: (f < start ? 0 : 1) * o,
        boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      }}
    >
      {text}
    </div>
  );
};

/** Big number badge, pops in. */
export const Badge: React.FC<{
  big: string;
  small: string;
  x: number;
  y: number;
  f: number;
  start: number;
  bg?: string;
  color?: string;
  bigSize?: number;
  end?: number;
}> = ({big, small, x, y, f, start, bg = C.turq, color = C.white, bigSize = 84, end}) => {
  const t = clamp((f - start) / 12);
  const s = f < start ? 0 : easeOutBack(t);
  const o = end === undefined ? 1 : 1 - ip(f, [end - 8, end], [0, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s})`,
        background: bg,
        color,
        borderRadius: 28,
        padding: '22px 40px 26px',
        textAlign: 'center',
        boxShadow: '0 14px 40px rgba(0,0,0,0.22)',
        opacity: o,
      }}
    >
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: bigSize, lineHeight: 1}}>{big}</div>
      <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 30, marginTop: 10, opacity: 0.92}}>{small}</div>
    </div>
  );
};

/* ───────────── Captions (voice-over subtitles) ───────────── */

export type Cue = [number, number, string]; // absolute seconds

export const Captions: React.FC<{frame: number; cues: Cue[]; fps: number}> = ({frame, cues, fps}) => {
  const t = frame / fps;
  const cue = cues.find(([a, b]) => t >= a && t < b);
  if (!cue) return null;
  const [a, b, text] = cue;
  const fa = (t - a) * fps;
  const fb = (b - t) * fps;
  const o = Math.min(clamp(fa / 4), clamp(fb / 4));
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 58,
        display: 'flex',
        justifyContent: 'center',
        opacity: o,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          background: 'rgba(14, 20, 32, 0.72)',
          color: '#fff',
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 38,
          lineHeight: 1.3,
          padding: '14px 34px 16px',
          borderRadius: 18,
          textAlign: 'center',
          transform: `translateY(${(1 - clamp(fa / 6)) * 10}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ───────────── Ornament ───────────── */

/** Ikat "abr" motif: a diamond built from jittered horizontal strokes (the blurred, cloud-like edge). */
export const IkatMotif: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  seed: number;
  layers?: string[];
}> = ({cx, cy, w, h, seed, layers = [C.gold, C.turq, C.paper, C.azure]}) => {
  const rows = 26;
  return (
    <g>
      {layers.map((col, li) => {
        const k = 1 - li * 0.24;
        const lw = w * k;
        const lh = h * k;
        return (
          <g key={li} fill={col}>
            {Array.from({length: rows}).map((_, r) => {
              const v = (r + 0.5) / rows;
              const width = lw * (1 - Math.abs(2 * v - 1));
              const j = (rnd(seed * 31 + li * 7 + r) - 0.5) * lw * 0.16;
              const j2 = (rnd(seed * 17 + li * 3 + r * 5) - 0.5) * lw * 0.12;
              return (
                <rect
                  key={r}
                  x={cx - width / 2 + j}
                  y={cy - lh / 2 + r * (lh / rows)}
                  width={Math.max(0, width + j2)}
                  height={lh / rows + 0.6}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

/** Horizontal strip of ikat motifs (SVG group). */
export const IkatStrip: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  bg?: string;
  seed?: number;
  palette?: string[][];
}> = ({x, y, width, height, bg = C.azureDeep, seed = 1, palette}) => {
  const step = height * 0.62;
  const n = Math.ceil(width / step) + 1;
  const pals = palette ?? [
    [C.gold, C.turq, C.paper, C.azure],
    [C.turq, C.paper, C.ochre, C.azureDeep],
    [C.paper, C.gold, C.turqDeep, C.gold],
  ];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={bg} />
      {Array.from({length: n}).map((_, i) => (
        <IkatMotif
          key={i}
          cx={x + i * step + step / 2}
          cy={y + height / 2}
          w={step * 0.96}
          h={height * 0.9}
          seed={seed * 100 + i}
          layers={pals[i % pals.length]}
        />
      ))}
    </g>
  );
};

/** Full-screen ikat wipe centred on local frame 0 (covers screen around f=0). */
export const IkatWipe: React.FC<{f: number; half?: number; angle?: number; wave?: boolean}> = ({
  f,
  half = 14,
  angle = -12,
  wave = false,
}) => {
  if (f < -half || f > half) return null;
  const t = (f + half) / (2 * half);
  const bandW = 2600;
  const x = -bandW - 400 + t * (W + bandW + 800);
  const cols = 9;
  const colW = bandW / cols;
  return (
    <AbsoluteFill style={{zIndex: 900, pointerEvents: 'none'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(${x}, 0) rotate(${angle} ${bandW / 2} ${H / 2})`}>
          {Array.from({length: cols}).map((_, i) => {
            const dy = wave ? Math.sin(i * 0.9 + t * 6) * 60 : 0;
            return (
              <g key={i} transform={`translate(${i * colW}, ${dy - 300}) rotate(90 ${colW / 2} ${colW / 2})`}>
                <IkatStrip
                  x={0}
                  y={-colW}
                  width={H + 600}
                  height={colW}
                  seed={i + 3}
                  bg={[C.azureDeep, C.turqDeep, C.ochre][i % 3]}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** 8-pointed star path (girih) */
export const star8 = (cx: number, cy: number, r: number, inner = 0.72) => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * inner;
    pts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`);
  }
  return `M${pts.join('L')}Z`;
};

/** Majolica tile (square) with 8-point star, used as corner accents and full patterns. */
export const MajolicaTile: React.FC<{x: number; y: number; s: number; flip?: boolean}> = ({x, y, s, flip}) => {
  const c = s / 2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={s} height={s} fill={flip ? C.azureDeep : C.paper} />
      <path d={star8(c, c, s * 0.46, 0.7)} fill={flip ? C.turq : C.azure} />
      <path d={star8(c, c, s * 0.3, 0.68)} fill={flip ? C.paper : C.turq} />
      <circle cx={c} cy={c} r={s * 0.1} fill={C.gold} />
      {[0, 1, 2, 3].map((k) => {
        const cx = k % 2 === 0 ? 0 : s;
        const cy = k < 2 ? 0 : s;
        return <circle key={k} cx={cx} cy={cy} r={s * 0.16} fill={flip ? C.gold : C.turqDeep} />;
      })}
    </g>
  );
};

/** Corner border of majolica tiles. */
export const MajolicaCorners: React.FC<{s?: number; opacity?: number}> = ({s = 56, opacity = 1}) => {
  const corners: [number, number, number, number][] = [
    [0, 0, 1, 1],
    [W, 0, -1, 1],
    [0, H, 1, -1],
    [W, H, -1, -1],
  ];
  return (
    <g opacity={opacity}>
      {corners.map(([x, y, sx, sy], i) => (
        <g key={i} transform={`translate(${x}, ${y}) scale(${sx}, ${sy})`}>
          <MajolicaTile x={0} y={0} s={s} />
          <MajolicaTile x={s} y={0} s={s} flip />
          <MajolicaTile x={0} y={s} s={s} flip />
        </g>
      ))}
    </g>
  );
};

/** Parchment background with fibre noise and vignette. */
export const Parchment: React.FC<{id?: string}> = ({id = 'parch'}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <defs>
      <filter id={`${id}-n`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves={4} seed={4} />
        <feColorMatrix
          values="0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.18  0 0 0 0.55 0"
        />
      </filter>
      <radialGradient id={`${id}-v`} cx="50%" cy="50%" r="75%">
        <stop offset="55%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#4a2a10" stopOpacity={0.45} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="#EAD7AE" />
    <rect width={W} height={H} filter={`url(#${id}-n)`} opacity={0.35} />
    <rect width={W} height={H} fill={`url(#${id}-v)`} />
  </svg>
);

/** Soft sun disc */
export const Sun: React.FC<{cx: number; cy: number; r: number; color?: string; glow?: string}> = ({
  cx,
  cy,
  r,
  color = '#FFE3A3',
  glow = '#FFD27A',
}) => (
  <g>
    <circle cx={cx} cy={cy} r={r * 2.6} fill={glow} opacity={0.18} />
    <circle cx={cx} cy={cy} r={r * 1.6} fill={glow} opacity={0.25} />
    <circle cx={cx} cy={cy} r={r} fill={color} />
  </g>
);

/** Stars field */
export const Stars: React.FC<{n?: number; f: number; rot?: number; cx?: number; cy?: number; seed?: number}> = ({
  n = 220,
  f,
  rot = 0,
  cx = W / 2,
  cy = H * 1.1,
  seed = 1,
}) => (
  <g transform={`rotate(${rot} ${cx} ${cy})`}>
    {Array.from({length: n}).map((_, i) => {
      const x = rnd(i * 3 + seed) * W * 1.6 - W * 0.3;
      const y = rnd(i * 7 + seed * 2) * H * 1.4 - H * 0.4;
      const r = 0.8 + rnd(i * 11 + seed) * 2.2;
      const tw = 0.55 + 0.45 * Math.sin(f * 0.15 + i);
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={tw} />;
    })}
  </g>
);

/** Dune layer path: smooth hills across the width */
export const dunePath = (y: number, amp: number, freq: number, phase: number, bottom = H + 10) => {
  const pts: string[] = [];
  for (let x = -40; x <= W + 40; x += 40) {
    const yy = y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.35;
    pts.push(`${x},${yy.toFixed(1)}`);
  }
  return `M-40,${bottom} L${pts.join(' L')} L${W + 40},${bottom} Z`;
};

/** Mountains path (jagged) */
export const ridgePath = (y: number, amp: number, seed: number, step = 60, bottom = H + 10) => {
  const pts: string[] = [];
  for (let x = -60, i = 0; x <= W + 60; x += step, i++) {
    const yy = y - rnd(seed * 13 + i) * amp - (i % 2 === 0 ? amp * 0.25 : 0);
    pts.push(`${x},${yy.toFixed(1)}`);
  }
  return `M-60,${bottom} L${pts.join(' L')} L${W + 60},${bottom} Z`;
};

export const Fill: React.FC<{color: string; opacity?: number}> = ({color, opacity = 1}) => (
  <AbsoluteFill style={{background: color, opacity}} />
);

export const easeIO = easeInOut;
