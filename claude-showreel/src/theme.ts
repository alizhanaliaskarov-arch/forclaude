import {Easing, interpolate} from 'remotion';

export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const TOTAL = 300 * FPS;
export const BPM = 120; // the soundtrack is locked to this: 1 beat = 15 frames, 1 bar = 60 frames

export const C = {
  night: '#07080C',
  night2: '#0E1018',
  panel: '#151823',
  line: '#262B3A',
  ivory: '#F4EFE6',
  paper: '#FBF7F0',
  mute: '#8C93A6',
  coral: '#E8774F',
  coralDeep: '#C25A35',
  amber: '#F5B85C',
  violet: '#7B6CFF',
  cyan: '#3FD0C9',
  green: '#46D483',
  red: '#FF5D6C',
  pink: '#FF7AB6',
  blue: '#4D8DFF',
};

export const F = {
  display: "'Unbounded', sans-serif",
  body: "'Manrope', 'WenQuanYi Zen Hei', 'IPAGothic', 'DejaVu Sans', 'FreeSerif', sans-serif",
  mono: "'JetBrains Mono', 'DejaVu Sans Mono', monospace",
  intl: "'Manrope', 'WenQuanYi Zen Hei', 'IPAGothic', 'DejaVu Sans', 'FreeSerif', sans-serif",
};

export const sec = (s: number) => Math.round(s * FPS);
export const beat = (b: number) => Math.round(b * 15);

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const ip = (
  f: number,
  inR: number[],
  outR: number[],
  easing: (t: number) => number = Easing.out(Easing.cubic),
) =>
  interpolate(f, inR, outR, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
export const easeOutExpo = Easing.out(Easing.exp);
export const easeOutBack = Easing.out(Easing.back(1.7));
export const easeIn = Easing.in(Easing.cubic);
export const linear = (t: number) => t;

// deterministic pseudo random 0..1
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0..1 pulse that peaks on every beat and decays over `len` frames */
export const pulse = (f: number, len = 8, every = 15) => {
  const p = ((f % every) + every) % every;
  return p < len ? 1 - p / len : 0;
};
