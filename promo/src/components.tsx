import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {C, F, H, W, rnd} from './theme';

// jittering film grain over everything
export const Grain: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 0.09}) => {
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

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.45}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 130%)`,
      pointerEvents: 'none',
    }}
  />
);

// RGB-split text helper
export const Glitchy: React.FC<{
  amount: number; // px
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({amount, children, style}) => (
  <div
    style={{
      ...style,
      textShadow:
        amount > 0.1
          ? `${amount}px 0 0 rgba(255,40,70,.85), ${-amount}px 0 0 rgba(0,230,255,.85)`
          : 'none',
    }}
  >
    {children}
  </div>
);

// Wordmark ОДИН built from fixed-width letter boxes so we know where the О counter is
export const LOGO_FS = 226;
export const LOGO_BOX = 236;
export const LOGO_W = LOGO_BOX * 4;
export const LOGO_DOT_DX = 0;
export const LOGO_DOT_DY = 0; // tuned vs. font metrics
export const LOGO_DOT_R = 28;

export const Wordmark: React.FC<{
  color?: string;
  dotColor?: string;
  letterStyle?: (i: number) => React.CSSProperties;
  dotStyle?: React.CSSProperties;
  showDot?: boolean;
}> = ({color = C.cream, dotColor = C.orange, letterStyle, dotStyle, showDot = true}) => {
  const letters = ['О', 'Д', 'И', 'Н'];
  return (
    <div style={{position: 'relative', width: LOGO_W, height: LOGO_FS * 1.1, display: 'flex'}}>
      {letters.map((l, i) => (
        <div
          key={i}
          style={{
            width: LOGO_BOX,
            height: LOGO_FS * 1.1,
            textAlign: 'center',
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: LOGO_FS,
            lineHeight: `${LOGO_FS * 1.1}px`,
            color,
            letterSpacing: '-0.02em',
            ...(letterStyle ? letterStyle(i) : {}),
          }}
        >
          {l}
        </div>
      ))}
      {showDot && (
        <div
          style={{
            position: 'absolute',
            left: LOGO_BOX / 2 - LOGO_DOT_R + LOGO_DOT_DX,
            top: (LOGO_FS * 1.1) / 2 - LOGO_DOT_R + LOGO_DOT_DY,
            width: LOGO_DOT_R * 2,
            height: LOGO_DOT_R * 2,
            borderRadius: '50%',
            background: dotColor,
            ...dotStyle,
          }}
        />
      )}
    </div>
  );
};

// Phone mock-up (flat, children render inside the screen)
export const PHONE_W = 540;
export const PHONE_H = 1090;
export const Phone: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  screenBg?: string;
}> = ({children, style, screenBg = C.cream}) => (
  <div
    style={{
      position: 'relative',
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 92,
      background: '#1d1d24',
      border: '5px solid #3a3a45',
      boxShadow: '0 60px 140px rgba(0,0,0,.65), inset 0 0 0 10px #0a0a0d',
      padding: 14,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 78,
        background: screenBg,
        overflow: 'hidden',
      }}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: '50%',
          width: 150,
          height: 40,
          marginLeft: -75,
          borderRadius: 24,
          background: '#000',
        }}
      />
    </div>
  </div>
);

// task card used all over the film
export const TaskCard: React.FC<{
  title: string;
  tag?: string;
  w?: number;
  h?: number;
  bg?: string;
  fg?: string;
  fs?: number;
  style?: React.CSSProperties;
  done?: boolean;
}> = ({title, tag, w = 640, h = 150, bg = C.cream, fg = C.ink, fs = 40, style, done}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: h * 0.28,
      background: bg,
      color: fg,
      display: 'flex',
      alignItems: 'center',
      padding: `0 ${h * 0.24}px`,
      boxSizing: 'border-box',
      gap: h * 0.2,
      fontFamily: F.cond,
      fontWeight: 700,
      fontSize: fs,
      textTransform: 'uppercase',
      letterSpacing: '0.01em',
      boxShadow: '0 18px 40px rgba(0,0,0,.35)',
      ...style,
    }}
  >
    <div
      style={{
        width: h * 0.34,
        height: h * 0.34,
        borderRadius: h * 0.1,
        border: `${Math.max(4, h * 0.04)}px solid ${fg}`,
        flexShrink: 0,
        background: done ? fg : 'transparent',
      }}
    />
    <div style={{flex: 1, whiteSpace: 'nowrap'}}>{title}</div>
    {tag && (
      <div
        style={{
          fontFamily: F.mono,
          fontWeight: 800,
          fontSize: fs * 0.42,
          background: C.orange,
          color: C.ink,
          padding: `${fs * 0.1}px ${fs * 0.28}px`,
          borderRadius: 999,
        }}
      >
        {tag}
      </div>
    )}
  </div>
);

export const Fill: React.FC<{bg: string; children?: React.ReactNode}> = ({bg, children}) => (
  <AbsoluteFill style={{background: bg, width: W, height: H}}>{children}</AbsoluteFill>
);
