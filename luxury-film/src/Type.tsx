import React from 'react';
import {C, F, clamp, easeOut, easeOutQuint, ip, rnd, smooth} from './theme';

/** Brushed-silver text fill with a highlight that travels across it (`sheen` 0..1). */
const metal = (sheen: number): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, #8e9198 0%, #d7dadf 30%, #f7f8fa ${20 + sheen * 60}%, #b9bcc2 ${32 + sheen * 60}%, #8a8d93 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

const centerRow: React.CSSProperties = {position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center'};

/** 02 — "FORM.": clean mask reveal from below, settle, then dissolve into fine particles. */
export const MaskWord: React.FC<{t: number; text: string; start: number; dissolve: number; y: number; size: number}> = ({t, text, start, dissolve, y, size}) => {
  if (t < start || t > dissolve + 1.2) return null;
  const chars = Array.from(text);
  const d = clamp((t - dissolve) / 0.9);
  const w = size * 0.62 * chars.length * 1.4;
  return (
    <div style={{...centerRow, top: y}}>
      <div style={{position: 'relative', display: 'flex', gap: size * 0.22}}>
        {chars.map((ch, i) => {
          const k = ip(t, [start + i * 0.08, start + 0.9 + i * 0.08], [0, 1], easeOutQuint);
          return (
            <div key={i} style={{overflow: 'hidden', height: size * 1.05}}>
              <div
                style={{
                  fontFamily: F.serif,
                  fontWeight: 300,
                  fontSize: size,
                  lineHeight: 1.05,
                  transform: `translateY(${(1 - k) * 105}%)`,
                  opacity: 1 - d,
                  filter: d > 0 ? `blur(${d * 6}px)` : undefined,
                  ...metal(clamp((t - start) / 2.2)),
                }}
              >
                {ch}
              </div>
            </div>
          );
        })}
        {d > 0 ? (
          <svg width={w} height={size * 2.4} style={{position: 'absolute', left: '50%', top: -size * 0.6, marginLeft: -w / 2, overflow: 'visible'}}>
            {Array.from({length: 160}).map((_, i) => {
              const x0 = (0.12 + rnd(i) * 0.76) * w;
              const y0 = size * 0.62 + (rnd(i * 3) - 0.5) * size * 0.8;
              const dx = (rnd(i * 5) - 0.5) * 140 * d;
              const dy = -(30 + rnd(i * 7) * 160) * d;
              const o = Math.sin(Math.PI * clamp(d * 1.1 - rnd(i * 9) * 0.1)) * 0.9;
              return <circle key={i} cx={x0 + dx} cy={y0 + dy} r={0.8 + rnd(i * 11) * 1.4} fill={C.platinum} opacity={o} />;
            })}
          </svg>
        ) : null}
      </div>
    </div>
  );
};

/** 03 — wide-spaced uppercase line that breathes in, with a hairline under it. */
export const WideLine: React.FC<{t: number; text: string; start: number; end: number; y: number; size: number}> = ({t, text, start, end, y, size}) => {
  if (t < start || t > end) return null;
  const a = ip(t, [start, start + 1.4], [0, 1], smooth) * ip(t, [end - 0.8, end], [1, 0]);
  const sp = ip(t, [start, end], [0.62, 0.48], easeOut);
  return (
    <div style={{...centerRow, top: y, flexDirection: 'column', alignItems: 'center', opacity: a}}>
      <div style={{fontFamily: F.sans, fontWeight: 200, fontSize: size, letterSpacing: `${sp}em`, marginRight: `-${sp}em`, color: C.platinum, whiteSpace: 'nowrap'}}>{text}</div>
      <div style={{marginTop: size * 0.9, height: 1, width: ip(t, [start + 0.4, start + 2.2], [0, 320], smooth), background: `linear-gradient(90deg, transparent, ${C.silver}, transparent)`}} />
    </div>
  );
};

/** 04 — letters fly in through depth, rotate subtly and lock into a composition. */
export const DepthWord: React.FC<{t: number; text: string; start: number; end: number; y: number; size: number}> = ({t, text, start, end, y, size}) => {
  if (t < start || t > end) return null;
  const chars = Array.from(text);
  const out = ip(t, [end - 0.5, end], [1, 0]);
  return (
    <div style={{...centerRow, top: y, perspective: 1400, opacity: out}}>
      <div style={{display: 'flex', transformStyle: 'preserve-3d'}}>
        {chars.map((ch, i) => {
          const k = ip(t, [start + i * 0.09, start + 1.1 + i * 0.09], [0, 1], easeOutQuint);
          const z = (1 - k) * -1800;
          const ry = (1 - k) * (rnd(i) - 0.5) * 120;
          const tx = (1 - k) * (rnd(i * 3) - 0.5) * 900;
          const ty = (1 - k) * (rnd(i * 5) - 0.5) * 700;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontFamily: F.sans,
                fontWeight: 300,
                fontSize: size,
                letterSpacing: '0.34em',
                color: C.platinum,
                opacity: clamp(k * 1.6),
                transform: `translate3d(${tx}px, ${ty}px, ${z}px) rotateY(${ry}deg)`,
                ...metal(clamp((t - start - 1) / 1.6)),
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** 05 — letter-by-letter, soft depth, a metallic highlight sweeping across. */
export const MetalLine: React.FC<{t: number; lines: string[]; start: number; end: number; y: number; size: number; step?: number}> = ({
  t,
  lines,
  start,
  end,
  y,
  size,
  step = 0.07,
}) => {
  if (t < start || t > end) return null;
  const out = ip(t, [end - 0.7, end], [1, 0]);
  let n = 0;
  return (
    <div style={{...centerRow, top: y, flexDirection: 'column', alignItems: 'center', gap: size * 0.2, opacity: out}}>
      {lines.map((ln, li) => (
        <div key={li} style={{display: 'flex', whiteSpace: 'pre', textShadow: '0 6px 24px rgba(0,0,0,0.6)'}}>
          {Array.from(ln).map((ch, i) => {
            const at = start + (n++) * step;
            const k = ip(t, [at, at + 0.5], [0, 1], easeOut);
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  fontFamily: F.serif,
                  fontWeight: 400,
                  fontSize: size,
                  letterSpacing: '0.16em',
                  opacity: k,
                  transform: `translateY(${(1 - k) * 18}px) scale(${1 + (1 - k) * 0.04})`,
                  filter: k < 1 ? `blur(${(1 - k) * 5}px)` : undefined,
                  ...metal(clamp((t - start - 1.2) / 2.5)),
                }}
              >
                {ch === ' ' ? ' ' : ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** 06 — small editorial caption. */
export const Caption: React.FC<{t: number; text: string; start: number; end: number; y: number}> = ({t, text, start, end, y}) => {
  if (t < start || t > end) return null;
  const a = ip(t, [start, start + 0.8], [0, 1]) * ip(t, [end - 0.6, end], [1, 0]);
  return (
    <div style={{...centerRow, top: y, opacity: a}}>
      <div style={{fontFamily: F.sans, fontWeight: 300, fontSize: 24, letterSpacing: '0.42em', marginRight: '-0.42em', color: C.silver, transform: `translateY(${(1 - a) * 6}px)`}}>{text}</div>
    </div>
  );
};

/** 07 — confident statement, two lines, minimal motion. */
export const Statement: React.FC<{t: number; a: string; b: string; start: number; end: number; y: number; size: number}> = ({t, a, b, start, end, y, size}) => {
  if (t < start || t > end) return null;
  const k1 = ip(t, [start, start + 0.9], [0, 1], smooth);
  const k2 = ip(t, [start + 1.0, start + 1.9], [0, 1], smooth);
  const out = ip(t, [end - 0.7, end], [1, 0]);
  const st = (k: number): React.CSSProperties => ({
    fontFamily: F.serif,
    fontWeight: 300,
    fontSize: size,
    letterSpacing: '0.2em',
    marginRight: '-0.2em',
    color: C.platinum,
    opacity: k * out,
    transform: `translateY(${(1 - k) * 14}px)`,
    whiteSpace: 'nowrap',
  });
  return (
    <div style={{...centerRow, top: y, flexDirection: 'column', alignItems: 'center', gap: size * 0.1}}>
      <div style={st(k1)}>{a}</div>
      <div style={st(k2)}>{b}</div>
    </div>
  );
};
