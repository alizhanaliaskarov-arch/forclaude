import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, H, W, clamp, easeOutBack, easeOutExpo, ip, rnd} from './theme';

/* ───────────── finishing layers ───────────── */

/** Animated film grain — a new seed every frame. */
export const Grain: React.FC<{f: number; opacity?: number}> = ({f, opacity = 0.07}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity, zIndex: 900}}>
    <svg width={W} height={H}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 97} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      zIndex: 890,
      background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Soft colour glows drifting in the background. */
export const Aurora: React.FC<{f: number; colors?: string[]; opacity?: number; base?: string}> = ({
  f,
  colors = [C.coral, C.violet, C.cyan],
  opacity = 0.55,
  base = C.night,
}) => (
  <AbsoluteFill style={{background: base, overflow: 'hidden'}}>
    {colors.map((c, i) => {
      const x = 50 + Math.sin(f / (90 + i * 23) + i * 2.1) * 30;
      const y = 50 + Math.cos(f / (110 + i * 17) + i * 1.3) * 26;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: 1100,
            height: 1100,
            marginLeft: -550,
            marginTop: -550,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c} 0%, transparent 62%)`,
            opacity: opacity * (0.7 + 0.3 * Math.sin(f / 40 + i)),
            filter: 'blur(40px)',
          }}
        />
      );
    })}
  </AbsoluteFill>
);

/** Perspective floor grid. */
export const GridFloor: React.FC<{f: number; color?: string; opacity?: number; speed?: number}> = ({
  f,
  color = C.violet,
  opacity = 0.35,
  speed = 2,
}) => {
  const lines = [];
  for (let i = -20; i <= 20; i++) lines.push(<line key={'v' + i} x1={W / 2 + i * 40} y1={0} x2={W / 2 + i * 400} y2={700} />);
  const off = (f * speed) % 60;
  for (let j = 0; j < 14; j++) {
    const z = j * 60 + off;
    const y = 700 * Math.pow(z / 840, 2.2);
    lines.push(<line key={'h' + j} x1={-200} y1={y} x2={W + 200} y2={y} opacity={clamp(z / 300)} />);
  }
  return (
    <svg
      width={W}
      height={700}
      style={{position: 'absolute', left: 0, bottom: 0, opacity}}
      stroke={color}
      strokeWidth={1.5}
    >
      <defs>
        <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={1} />
          <stop offset="0.5" stopColor="#000" stopOpacity={0} />
        </linearGradient>
      </defs>
      {lines}
      <rect width={W} height={700} fill="url(#gf)" stroke="none" style={{mixBlendMode: 'multiply'}} />
    </svg>
  );
};

/* ───────────── typography ───────────── */

/** Kinetic headline: each letter rises in with a stagger. */
export const Kinetic: React.FC<{
  text: string;
  f: number;
  size?: number;
  color?: string;
  weight?: number;
  stagger?: number;
  font?: string;
  style?: React.CSSProperties;
  out?: number; // frame where the letters start leaving (relative to f)
  spacing?: number;
}> = ({text, f, size = 120, color = C.ivory, weight = 800, stagger = 1.6, font = F.display, style, out, spacing = -0.02}) => {
  const chars = Array.from(text);
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        color,
        lineHeight: 1.05,
        letterSpacing: `${spacing}em`,
        whiteSpace: 'pre',
        display: 'flex',
        justifyContent: 'center',
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const lf = f - i * stagger;
        let y = ip(lf, [0, 16], [0.9, 0], easeOutExpo);
        let o = ip(lf, [0, 8], [0, 1]);
        let blur = ip(lf, [0, 12], [12, 0]);
        if (out !== undefined) {
          const of = f - out - i * stagger * 0.5;
          y -= ip(of, [0, 10], [0, 0.6]);
          o *= ip(of, [0, 8], [1, 0]);
          blur += ip(of, [0, 10], [0, 10]);
        }
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}em)`,
              opacity: o,
              filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
            }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        );
      })}
    </div>
  );
};

/** Scene index label in the corner: "04 — КОД" */
export const SceneTag: React.FC<{f: number; n: string; label: string; color?: string; dark?: boolean}> = ({
  f,
  n,
  label,
  color = C.coral,
  dark,
}) => {
  const o = ip(f, [6, 20], [0, 1]);
  const w = ip(f, [6, 30], [0, 120], easeOutExpo);
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        top: 72,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        opacity: o,
        zIndex: 700,
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: 24,
        letterSpacing: '0.2em',
        color: dark ? '#222' : C.ivory,
      }}
    >
      <span style={{color}}>{n}</span>
      <span style={{width: w, height: 2, background: color, display: 'inline-block'}} />
      <span>{label}</span>
    </div>
  );
};

/* ───────────── UI chrome ───────────── */

export const Window: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  light?: boolean;
}> = ({x, y, w, h, title, children, style, light}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 22,
      background: light ? '#FFFFFF' : 'rgba(21,24,35,0.92)',
      border: `1px solid ${light ? '#E5E0D6' : 'rgba(255,255,255,0.09)'}`,
      boxShadow: '0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      ...style,
    }}
  >
    <div
      style={{
        height: 54,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 22px',
        borderBottom: `1px solid ${light ? '#EEE8DD' : 'rgba(255,255,255,0.06)'}`,
        fontFamily: F.mono,
        fontSize: 20,
        color: light ? '#8A8478' : C.mute,
      }}
    >
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <span key={c} style={{width: 15, height: 15, borderRadius: 8, background: c, display: 'inline-block'}} />
      ))}
      <span style={{marginLeft: 16}}>{title}</span>
    </div>
    <div style={{position: 'relative', height: h - 54}}>{children}</div>
  </div>
);

/** The wordmark used across the film: a caret that blinks next to the name. */
export const Wordmark: React.FC<{f: number; size?: number; color?: string; caret?: string; reveal?: number}> = ({
  f,
  size = 180,
  color = C.ivory,
  caret = C.coral,
  reveal = 1,
}) => {
  const name = 'Claude';
  const shown = Math.round(name.length * clamp(reveal));
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{display: 'flex', alignItems: 'center', fontFamily: F.display, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.03em'}}>
      <span>{name.slice(0, shown)}</span>
      <span
        style={{
          display: 'inline-block',
          width: size * 0.12,
          height: size * 0.95,
          marginLeft: size * 0.08,
          background: caret,
          borderRadius: size * 0.02,
          opacity: blink || reveal < 1 ? 1 : 0.15,
          boxShadow: `0 0 ${size * 0.4}px ${caret}`,
        }}
      />
    </div>
  );
};

/** Pop-in scale for chips/cards. */
export const pop = (f: number, at: number, len = 14) => ip(f, [at, at + len], [0, 1], easeOutBack);

export const Chip: React.FC<{text: string; color?: string; f: number; at: number; style?: React.CSSProperties}> = ({
  text,
  color = C.coral,
  f,
  at,
  style,
}) => {
  const s = pop(f, at);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 28px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        border: `1.5px solid ${color}`,
        color: C.ivory,
        fontFamily: F.body,
        fontWeight: 700,
        fontSize: 30,
        transform: `scale(${s})`,
        opacity: clamp(s * 2),
        ...style,
      }}
    >
      <span style={{width: 12, height: 12, borderRadius: 6, background: color, boxShadow: `0 0 16px ${color}`}} />
      {text}
    </div>
  );
};

/* ───────────── particles ───────────── */

export const Dust: React.FC<{f: number; n?: number; color?: string; seed?: number; speed?: number; size?: number}> = ({
  f,
  n = 70,
  color = C.ivory,
  seed = 1,
  speed = 0.4,
  size = 3,
}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    {Array.from({length: n}).map((_, i) => {
      const r0 = rnd(i + seed * 100);
      const r1 = rnd(i * 3.1 + seed);
      const r2 = rnd(i * 7.7 + seed * 3);
      const x = (r0 * W + Math.sin(f / 60 + i) * 20 + f * speed * (r2 - 0.5)) % W;
      const y = (((r1 * H - f * speed * (0.5 + r2)) % H) + H) % H;
      return <circle key={i} cx={x} cy={y} r={size * (0.4 + r2)} fill={color} opacity={0.15 + 0.5 * r2 * (0.6 + 0.4 * Math.sin(f / 9 + i))} />;
    })}
  </svg>
);

/* ───────────── subtitles ───────────── */

export type Cue = {start: number; end: number; text: string};

export const Captions: React.FC<{frame: number; cues: Cue[]; fps: number}> = ({frame, cues, fps}) => {
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start - 0.05 && t < c.end + 0.25);
  if (!cue) return null;
  const fa = (t - cue.start + 0.05) * fps;
  const fb = (cue.end + 0.25 - t) * fps;
  const o = Math.min(clamp(fa / 4), clamp(fb / 5));
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 54,
        display: 'flex',
        justifyContent: 'center',
        opacity: o,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          background: 'rgba(7, 8, 12, 0.66)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 36,
          lineHeight: 1.3,
          padding: '12px 32px 14px',
          borderRadius: 16,
          textAlign: 'center',
          transform: `translateY(${(1 - clamp(fa / 6)) * 10}px)`,
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
