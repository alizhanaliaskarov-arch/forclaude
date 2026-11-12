import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {BRAND, C, F, FPS, H, W, clamp, easeOutBack, rnd} from './theme';
import timing from './voice-timing.json';

export const Grain: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 0.08}) => {
  const ox = Math.floor(rnd(frame * 3.1) * 540);
  const oy = Math.floor(rnd(frame * 7.7) * 960);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('grain.png')})`,
        backgroundSize: '1080px 1920px',
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Fill: React.FC<{bg: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({
  bg,
  children,
  style,
}) => <AbsoluteFill style={{background: bg, width: W, height: H, overflow: 'hidden', ...style}}>{children}</AbsoluteFill>;

// RGB-split text
export const Glitchy: React.FC<{amount: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  amount,
  children,
  style,
}) => (
  <div
    style={{
      ...style,
      textShadow:
        amount > 0.1 ? `${amount}px 0 0 rgba(255,46,99,.9), ${-amount}px 0 0 rgba(43,75,255,.9)` : 'none',
    }}
  >
    {children}
  </div>
);

// centred line of text at an absolute top
export const Line: React.FC<{
  top: number;
  size: number;
  color?: string;
  font?: 'display' | 'cond';
  weight?: number;
  spacing?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({top, size, color = C.white, font = 'cond', weight = 700, spacing = '0.02em', style, children}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 0,
      width: W,
      textAlign: 'center',
      fontFamily: F[font],
      fontWeight: weight,
      fontSize: size,
      lineHeight: `${Math.round(size * 1.08)}px`,
      letterSpacing: spacing,
      color,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

// tear-off calendar sheet
export const Sheet: React.FC<{
  w?: number;
  label: string;
  big: string;
  head?: string;
  style?: React.CSSProperties;
}> = ({w = 560, label, big, head = C.pink, style}) => (
  <div
    style={{
      width: w,
      height: w * 1.1,
      background: C.white,
      borderRadius: w * 0.06,
      overflow: 'hidden',
      boxShadow: `0 ${w * 0.05}px ${w * 0.12}px rgba(0,0,0,.45)`,
      ...style,
    }}
  >
    <div
      style={{
        height: w * 0.24,
        background: head,
        color: C.white,
        fontFamily: F.cond,
        fontWeight: 700,
        fontSize: w * 0.105,
        lineHeight: `${w * 0.24}px`,
        textAlign: 'center',
        letterSpacing: '0.14em',
      }}
    >
      {label}
    </div>
    <div
      style={{
        height: w * 0.86,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F.display,
        fontWeight: 900,
        fontSize: w * 0.46,
        letterSpacing: '-0.04em',
        color: C.ink,
      }}
    >
      {big}
    </div>
  </div>
);

// Wordmark: skewed brand name with an upward "jerk" arrow
export const Wordmark: React.FC<{size?: number; color?: string; accent?: string; reveal?: number; f?: number}> = ({
  size = 170,
  color = C.white,
  accent = C.yellow,
  reveal = 1,
  f = 999,
}) => {
  const letters = BRAND.split('');
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'skewX(-8deg)'}}>
      {letters.map((ch, i) => {
        const t = clamp((f - i * 3) / 8);
        const y = (1 - easeOutBack(t)) * size * 1.4;
        return (
          <span
            key={i}
            style={{
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: size,
              lineHeight: `${size * 1.1}px`,
              letterSpacing: '-0.04em',
              color,
              display: 'inline-block',
              transform: `translateY(${y}px) scaleY(${1 + (1 - t) * 0.5})`,
              opacity: f >= i * 3 ? reveal : 0,
            }}
          >
            {ch}
          </span>
        );
      })}
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 100 100"
        style={{
          marginLeft: size * 0.06,
          marginBottom: size * 0.3,
          transform: `translate(${(1 - clamp((f - 16) / 7)) * -60}px, ${(1 - easeOutBack(clamp((f - 16) / 7))) * 90}px)`,
          opacity: f >= 16 ? reveal : 0,
        }}
      >
        <path d="M14 86 L72 28 M30 22 L78 22 L78 70" stroke={accent} strokeWidth={20} fill="none" strokeLinecap="square" />
      </svg>
    </div>
  );
};

// Subtitles follow the real voice timing written by audio/make_voice.py
const SUBS = timing as {start: number; end: number; text: string}[];
export const Subtitles: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / FPS;
  const i = SUBS.findIndex((s, k) => {
    const next = SUBS[k + 1];
    const hold = Math.min(s.end + 0.35, next ? next.start - 0.03 : 1e9);
    return t >= s.start - 0.03 && t < hold;
  });
  if (i < 0) return null;
  const s = SUBS[i];
  const k = clamp((t - s.start + 0.03) * FPS / 4);
  return (
    <div style={{position: 'absolute', top: 1356, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          maxWidth: 940,
          background: 'rgba(11,11,16,.94)',
          border: '3px solid rgba(255,255,255,.14)',
          color: C.white,
          fontFamily: F.cond,
          fontWeight: 500,
          fontSize: 50,
          lineHeight: '62px',
          padding: '14px 34px 18px',
          borderRadius: 20,
          textAlign: 'center',
          letterSpacing: '0.01em',
          transform: `scale(${0.9 + 0.1 * easeOutBack(k)})`,
          opacity: k,
        }}
      >
        {s.text}
      </div>
    </div>
  );
};
