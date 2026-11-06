import {BASE, VIEW_H, W} from './theme';

/** t: seconds from scene start, (cx, cy): source px at the centre of the picture, z: zoom (1 = full width) */
export type Key = {t: number; cx: number; cy: number; z: number};
export type Cam = {cx: number; cy: number; s: number}; // s: screen px per source px

const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

export const camAt = (keys: Key[], t: number): Cam => {
  let a = keys[0];
  let b = keys[0];
  let u = 0;
  if (t >= keys[keys.length - 1].t) {
    a = b = keys[keys.length - 1];
  } else if (t > keys[0].t) {
    for (let i = 0; i < keys.length - 1; i++) {
      if (t >= keys[i].t && t < keys[i + 1].t) {
        a = keys[i];
        b = keys[i + 1];
        u = easeInOutSine((t - a.t) / (b.t - a.t));
        break;
      }
    }
  }
  const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * u);
  const s = BASE * z;
  const hw = W / 2 / s;
  const hh = VIEW_H / 2 / s;
  const cx = Math.min(1536 - hw, Math.max(hw, a.cx + (b.cx - a.cx) * u));
  const cy = Math.min(1024 - hh, Math.max(hh, a.cy + (b.cy - a.cy) * u));
  return {cx, cy, s};
};

export const toScreen = (cam: Cam, x: number, y: number) => ({
  x: W / 2 + (x - cam.cx) * cam.s,
  y: 540 + (y - cam.cy) * cam.s,
});
