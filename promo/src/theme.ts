import {Easing, interpolate} from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const BEAT = 15; // 120 BPM @ 30fps — every cut sits on this grid
export const TOTAL = 750;

export const C = {
  ink: '#0C0C0F',
  ink2: '#17171C',
  cream: '#F3EEE3',
  orange: '#FF4A1C',
  lime: '#C6FF3D',
  red: '#FF2A2A',
  grey: '#8B8A86',
};

export const F = {
  display: "'Unbounded', sans-serif",
  cond: "'Oswald', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// Reels UI keeps clear of the top ~250px and bottom ~420px
export const SAFE_TOP = 270;
export const SAFE_BOT = 1480;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const ip = (
  f: number,
  inR: [number, number],
  outR: [number, number],
  easing: (t: number) => number = Easing.out(Easing.cubic),
) =>
  interpolate(f, inR, outR, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const easeOutBack = Easing.out(Easing.back(1.9));
export const easeOutExpo = Easing.out(Easing.exp);
export const easeInExpo = Easing.in(Easing.exp);
export const easeInOut = Easing.inOut(Easing.cubic);

// deterministic pseudo random 0..1
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// beat-synced zoom "punch": 1 on the beat, decays quickly
export const punch = (frame: number, amp = 0.05, decay = 4, offset = 0) => {
  const p = (((frame - offset) % BEAT) + BEAT) % BEAT;
  return 1 + amp * Math.exp(-p / decay);
};

// slam-in: scale from big to 1 with overshoot and opacity
export const slam = (f: number, start: number, from = 1.5, dur = 7) => {
  const t = clamp((f - start) / dur);
  const s = from + (1 - from) * easeOutBack(t);
  return {scale: s, opacity: f < start ? 0 : 1};
};
