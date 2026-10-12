import {Easing, interpolate} from 'remotion';

export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const TOTAL = 180 * FPS;

export const C = {
  turq: '#1AA7A1',
  turqDeep: '#0E7C7B',
  turqLight: '#7FD1C9',
  azure: '#1F5FA8',
  azureDeep: '#163E73',
  azureLight: '#9CC3E6',
  gold: '#D4A537',
  goldLight: '#EBCB7A',
  ochre: '#C4772E',
  brick: '#A65A2E',
  sand: '#E8C48A',
  sandLight: '#F3DFB5',
  paper: '#FBF8F2',
  ink: '#1B2330',
  inkSoft: '#4A5363',
  night: '#0F1B33',
  rust: '#8A4A2B',
  red: '#C8372D',
  white: '#FFFFFF',
};

export const F = {
  display: "'Unbounded', sans-serif",
  body: "'Manrope', sans-serif",
};

export const sec = (s: number) => Math.round(s * FPS);

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

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOutBack = Easing.out(Easing.back(1.7));
export const easeIn = Easing.in(Easing.cubic);
export const linear = (t: number) => t;

// deterministic pseudo random 0..1
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
