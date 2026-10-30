import {Easing, interpolate} from 'remotion';
import timeline from './timeline.json';

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export type Line = {scene: string; start: number; end: number; text: string};
export type SceneT = {id: string; start: number; end: number};
export const TL = timeline as {scenes: SceneT[]; lines: Line[]; total: number};
export const TOTAL = Math.ceil(TL.total * FPS);

export const C = {
  green: '#2A7A3E',
  greenDeep: '#1E4632',
  leaf: '#6DBE45',
  mint: '#A8D88A',
  paper: '#F6FAF3',
  cream: '#FBF6EC',
  ink: '#1E2B22',
  warm: '#F7C978',
};

export const F = {
  display: "'DM Serif Display', Georgia, serif",
  body: "'Nunito Sans', Arial, sans-serif",
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const ip = (
  f: number,
  inR: [number, number],
  outR: [number, number],
  easing: (t: number) => number = Easing.out(Easing.cubic),
) => interpolate(f, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeInOutS = Easing.inOut(Easing.sin);
export const easeOutBack = Easing.out(Easing.back(1.5));

/** multi-keyframe eased interpolation: keys = [[frame, value], ...] */
export const kf = (f: number, keys: [number, number][], easing = easeInOutS) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) return v0 + (v1 - v0) * easing((f - f0) / Math.max(1e-6, f1 - f0));
  }
  return keys[keys.length - 1][1];
};

// deterministic pseudo random 0..1
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** frame (scene-local) at which the n-th voice line of a scene starts */
export const lineAt = (scene: string, n: number, offset = 0) => {
  const sc = TL.scenes.find((s) => s.id === scene)!;
  const ls = TL.lines.filter((l) => l.scene === scene);
  const l = ls[Math.min(n, ls.length - 1)];
  return Math.round((l.start - sc.start + offset) * FPS);
};

/** pop-in scale 0 -> 1 with a soft overshoot, starting at frame a */
export const pop = (f: number, a: number, d = 18) => ip(f, [a, a + d], [0, 1], easeOutBack);
/** drop-in: returns y offset (from -h to 0) with gentle settle */
export const drop = (f: number, a: number, h = 160, d = 20) => ip(f, [a, a + d], [-h, 0], Easing.out(Easing.back(1.2)));
