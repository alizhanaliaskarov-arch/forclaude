import timing from './timing.json';
import events from './events.json';
import geometry from './geometry.json';

export const FPS: number = timing.fps;
export const TOTAL: number = timing.durationInFrames;

export type SceneId = 'intro' | 'silhouette' | 'light' | 'aero' | 'wheels' | 'details' | 'verdict';
export const SCENE_IDS: SceneId[] = ['intro', 'silhouette', 'light', 'aero', 'wheels', 'details', 'verdict'];

export const SCENES = Object.fromEntries(
  (timing.scenes as unknown as [SceneId, number, number][]).map(([id, a, b]) => [id, {start: a, end: b}]),
) as Record<SceneId, {start: number; end: number}>;

export const CUES = timing.cues as unknown as [number, number, string][];
export const EV = events.scenes as unknown as Record<SceneId, Record<string, number>>;

export type Side = 'ur' | 'ul' | 'dr' | 'dl';
export type CalloutDef = {
  scene: SceneId;
  cue: number;
  f: number;
  x: number;
  y: number;
  label: string;
  side: Side;
  life?: number;
  t: number;
};

/** callouts of a scene; t = seconds from the scene start (synced to the spoken word) */
export const calloutsFor = (id: SceneId): CalloutDef[] =>
  (events.callouts as unknown as Omit<CalloutDef, 't'>[])
    .filter((c) => c.scene === id)
    .map((c) => {
      const [a, b] = CUES[c.cue];
      return {...c, t: a + c.f * (b - a) - SCENES[id].start};
    });

export const SILHOUETTE = geometry.silhouette as {d: string; length: number};

export const CHAPTERS: [SceneId, string, string][] = [
  ['silhouette', '01', 'СИЛУЭТ'],
  ['light', '02', 'СВЕТ'],
  ['aero', '03', 'АЭРОДИНАМИКА'],
  ['wheels', '04', 'КОЛЁСА'],
  ['details', '05', 'ЦВЕТ И ДЕТАЛИ'],
  ['verdict', '', 'ИТОГ'],
];

// small easing helpers
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
