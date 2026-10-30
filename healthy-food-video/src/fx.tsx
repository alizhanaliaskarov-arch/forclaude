import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {Defs} from './art';
import {C, F, H, TL, W, clamp, ip, easeInOut} from './theme';

export type SceneProps = {f: number; dur: number};

const FACES: [string, string, number][] = [
  ['DM Serif Display', 'dm-serif-display-latin-400-normal.woff2', 400],
  ['Nunito Sans', 'nunito-sans-latin-600-normal.woff2', 600],
  ['Nunito Sans', 'nunito-sans-latin-700-normal.woff2', 700],
  ['Nunito Sans', 'nunito-sans-latin-800-normal.woff2', 800],
];
export const fontCss = FACES.map(
  ([fam, file, w]) => `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;src:url(${staticFile(`fonts/${file}`)}) format('woff2');}`,
).join('\n');

/** injects the @font-face rules and holds rendering until the fonts are ready */
export const FontLoader: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FACES.map(([fam, , w]) => document.fonts.load(`${w} 100px '${fam}'`, 'Healthy'))).then(() => continueRender(handle));
  }, [handle]);
  return <style>{fontCss}</style>;
};

/** full-frame SVG stage with shared gradients; cam = [zoom, centerX, centerY] in world units */
export const Stage: React.FC<{cam?: [number, number, number]; rot?: number; children: React.ReactNode; bg?: string}> = ({cam = [1, W / 2, H / 2], rot = 0, children, bg = C.cream}) => {
  const [z, cx, cy] = cam;
  return (
    <AbsoluteFill style={{background: bg}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <Defs />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${z}) rotate(${rot}) translate(${-cx} ${-cy})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

/** warm natural light: soft window glow from top-left, gentle vignette, slow light drift (no flicker) */
export const WarmLight: React.FC<{f: number; tint?: string; strength?: number}> = ({f, tint = 'rgba(255, 214, 150, 0.30)', strength = 1}) => {
  const lx = 22 + Math.sin(f / 240) * 4;
  const ly = 12 + Math.cos(f / 300) * 3;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at ${lx}% ${ly}%, ${tint}, rgba(255,214,150,0) 70%)`, mixBlendMode: 'screen', opacity: strength}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,32,10,0.28) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,240,215,0.06), rgba(120,70,20,0.06))', mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};

/** soft out-of-focus light orbs drifting slowly */
export const Bokeh: React.FC<{f: number; n?: number; color?: string; seed?: number}> = ({f, n = 7, color = '255, 236, 200', seed = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: n}, (_, i) => {
      const r = 60 + ((i * 37 + seed * 13) % 90);
      const x = ((i * 283 + seed * 97) % W) + Math.sin(f / 200 + i) * 30;
      const y = ((i * 167 + seed * 53) % H) + Math.cos(f / 260 + i * 1.7) * 24;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x - r,
            top: y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${color},0.22), rgba(${color},0) 70%)`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

/** small rounded label chip (deliberate on-screen text, never random) */
export const Chip: React.FC<{x: number; y: number; o: number; children: React.ReactNode; dark?: boolean; size?: number; anchor?: 'left' | 'center' | 'right'}> = ({x, y, o, children, dark, size = 34, anchor = 'left'}) =>
  o <= 0.001 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${anchor === 'left' ? 0 : anchor === 'center' ? -50 : -100}%, -50%) translateY(${(1 - o) * 14}px)`,
        opacity: o,
        background: dark ? 'rgba(30, 70, 50, 0.92)' : 'rgba(253, 254, 251, 0.94)',
        color: dark ? C.paper : C.greenDeep,
        fontFamily: F.body,
        fontWeight: 800,
        fontSize: size,
        padding: `${size * 0.34}px ${size * 0.8}px`,
        borderRadius: 999,
        boxShadow: '0 10px 30px rgba(40, 30, 10, 0.18)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );

/** scene title, top-left: eyebrow + title, fades in and out */
export const SceneTitle: React.FC<{f: number; dur: number; n: string; title: string; hold?: number}> = ({f, dur, n, title, hold}) => {
  const end = hold ?? dur - 30;
  const o = Math.min(ip(f, [10, 34], [0, 1]), ip(f, [end - 20, end], [1, 0]));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 96, top: 80, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 18,
          background: 'rgba(253, 254, 251, 0.92)',
          padding: '16px 34px 16px 18px',
          borderRadius: 999,
          boxShadow: '0 10px 30px rgba(40, 30, 10, 0.16)',
        }}
      >
        <div style={{width: 52, height: 52, borderRadius: '50%', background: C.green, color: C.paper, fontFamily: F.body, fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
        <div style={{fontFamily: F.display, fontSize: 44, color: C.greenDeep, lineHeight: 1}}>{title}</div>
      </div>
    </div>
  );
};

/** subtitles that follow the voice-over exactly */
export const Captions: React.FC<{t: number}> = ({t}) => {
  const line = TL.lines.find((l) => t >= l.start - 0.05 && t < l.end + 0.35);
  if (!line) return null;
  const fa = (t - line.start + 0.05) * 30;
  const fb = (line.end + 0.35 - t) * 30;
  const o = Math.min(clamp(fa / 5), clamp(fb / 5));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 54, display: 'flex', justifyContent: 'center', opacity: o, zIndex: 1000}}>
      <div
        style={{
          maxWidth: 1480,
          background: 'rgba(22, 38, 28, 0.74)',
          color: '#FBFBF6',
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.3,
          padding: '14px 36px 16px',
          borderRadius: 20,
          textAlign: 'center',
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

/** crossfade wrapper used by Root */
export const fadeIn = (f: number, xf: number) => ip(f, [-xf, 0], [0, 1], easeInOut);
