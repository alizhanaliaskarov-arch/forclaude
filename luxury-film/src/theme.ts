import {Easing, interpolate} from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION = 60;
export const TOTAL = DURATION * FPS;
export const BPM = 96; // soundtrack tempo: 1 beat = 0.625 s, 1 bar = 2.5 s

export const BRAND = 'OBSIDIAN';

export const C = {
  black: '#050506',
  obsidian: '#0B0B0D',
  graphite: '#2A2B2F',
  silver: '#C9CCD1',
  platinum: '#EEF0F2',
  champagne: '#CDB68A',
};

export const F = {
  serif: "'Cormorant Garamond', 'Times New Roman', serif",
  sans: "'Inter', 'Helvetica Neue', sans-serif",
};

/** vertical field of view (degrees) of a full-frame lens shooting a 9:16 frame (36 mm tall sensor side) */
export const lens = (mm: number) => (2 * Math.atan(18 / mm) * 180) / Math.PI;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const ip = (t: number, inR: number[], outR: number[], easing: (x: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(t, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
export const easeOutQuint = Easing.out(Easing.poly(5));
export const easeIn = Easing.in(Easing.cubic);
export const smooth = Easing.bezier(0.45, 0, 0.15, 1); // long, decelerating "luxury" curve
export const linear = (x: number) => x;

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
