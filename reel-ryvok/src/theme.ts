import {Easing, interpolate} from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const BEAT = 15; // 120 BPM @ 30fps
export const TOTAL = 810; // 27 s

// ---- change these to rebrand the reel ----
export const BRAND = 'РЫВОК';
export const TAGLINE = 'ЛИЧНОЕ НАСТАВНИЧЕСТВО';
export const NICK = '@твой_ник';

export const C = {
  ink: '#0B0B10',
  blue: '#2B4BFF',
  yellow: '#E8FF3A',
  pink: '#FF2E63',
  white: '#FFFFFF',
  grey: '#8D8FA3',
};

export const F = {
  display: "'Unbounded', sans-serif",
  cond: "'Oswald', sans-serif",
};

// Reels UI covers the top ~250px and bottom ~420px
export const SAFE_TOP = 270;
export const SAFE_BOT = 1480;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const ip = (
  f: number,
  inR: [number, number],
  outR: [number, number],
  easing: (t: number) => number = Easing.out(Easing.cubic),
) => interpolate(f, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const easeOutBack = Easing.out(Easing.back(1.9));
export const easeOutExpo = Easing.out(Easing.exp);
export const easeInExpo = Easing.in(Easing.exp);

export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// beat-synced zoom punch: 1+amp on the beat, decays quickly
export const punch = (frame: number, amp = 0.05, decay = 4, offset = 0) => {
  const p = (((frame - offset) % BEAT) + BEAT) % BEAT;
  return 1 + amp * Math.exp(-p / decay);
};

// 0 before start, overshooting 0..1 after
export const pop = (f: number, start: number, dur = 8) => (f < start ? 0 : easeOutBack(clamp((f - start) / dur)));

// decaying camera shake
export const shake = (f: number, start: number, amp = 30, dur = 10) => {
  const t = f - start;
  if (t < 0 || t >= dur) return {x: 0, y: 0};
  const k = amp * (1 - t / dur);
  return {x: (rnd(f * 1.3) - 0.5) * k, y: (rnd(f * 2.7 + 5) - 0.5) * k};
};
