import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as A from '../art';
import {Bokeh, Chip, SceneProps, SceneTitle, Stage, WarmLight} from '../fx';
import {H, W, clamp, easeInOut, kf, ip, lineAt, pop} from '../theme';

type It = {C: React.FC<A.P>; x: number; y: number; s: number; r: number; band: number};
const GX = [600, 1400, 2200, 3000, 3800]; // red, orange, yellow, green, purple/blue
const it = (C: React.FC<A.P>, band: number, dx: number, y: number, s: number, r = 0): It => ({C, x: GX[band] + dx, y, s, r, band});

const ITEMS: It[] = [
  it(A.Tomato, 0, -200, 380, 1.5), it(A.Tomato, 0, -20, 330, 1.25, 20), it(A.Apple, 0, 170, 420, 1.5, -10), it(A.Strawberry, 0, -120, 620, 1.2, 15), it(A.Strawberry, 0, 40, 660, 1.1, -20), it(A.Pepper, 0, 220, 680, 1.4, 20), it(A.Tomato, 0, -260, 720, 1.0), it(A.Apple, 0, -320, 520, 1.1, 15), it(A.Strawberry, 0, 300, 300, 1.0, 30),
  it(A.Carrot, 1, -220, 450, 1.7, 30), it(A.Carrot, 1, -120, 480, 1.7, 40), it(A.Orange, 1, 60, 360, 1.5), it(A.Orange, 1, 200, 520, 1.35, 30), it(A.Orange, 1, 0, 640, 1.2), it(A.Carrot, 1, -200, 740, 1.5, 80), it(A.Orange, 1, 230, 740, 1.1),
  it(A.Lemon, 2, -210, 360, 1.45, -20), it(A.Lemon, 2, -30, 450, 1.3, 30), it(A.Banana, 2, 170, 360, 1.9, -20), it(A.LemonSlice, 2, -170, 640, 1.2), it(A.Banana, 2, 120, 640, 1.7, 15), it(A.Pepper, 2, -10, 720, 1.2, -20),
  it(A.Broccoli, 3, -220, 380, 1.6), it(A.Lettuce, 3, 0, 330, 1.6, 20), it(A.Avocado, 3, 200, 420, 1.4, -20), it(A.Cucumber, 3, -150, 640, 1.5, -15), it(A.Apple, 3, 80, 660, 1.3, 10), it(A.Broccoli, 3, 240, 700, 1.3, 30),
  it(A.Grapes, 4, -200, 420, 1.6, 10), it(A.Eggplant, 4, 30, 380, 1.5, -20), it(A.Grapes, 4, 230, 450, 1.3, 10), it(A.Eggplant, 4, -60, 680, 1.3, 30),
];

export const S2Produce: React.FC<SceneProps> = ({f, dur}) => {
  const L = (n: number) => lineAt('produce', n);
  // camera: group by group while the colors are named, then pull back
  const cx = kf(f, [[0, 300], [L(1) - 10, 600], [L(1) + 30, 600], [L(1) + 160, 3800], [L(2), 3800], [L(4), 2400], [L(5), 2200]], easeInOut);
  const z = kf(f, [[0, 1.12], [L(1), 1.0], [L(1) + 160, 1.0], [L(2) + 30, 0.72], [L(4), 0.48], [L(5), 0.45], [L(5) + 80, 0.86], [dur, 0.82]], easeInOut);
  const cy = kf(f, [[0, 540], [L(4), 540], [L(5), 560], [L(5) + 80, 760]], easeInOut);
  const arc = ip(f, [L(5), L(5) + 80], [0, 1], easeInOut);
  const bands = ip(f, [L(5) + 20, L(5) + 90], [0, 1], easeInOut);
  // rainbow arcs, centre (RX, RY), red outermost
  const RX = 2200;
  const RY = 1180;
  const radius = [830, 690, 550, 410, 275];
  const pastel = ['#F6B3A6', '#F9CB98', '#F7E49A', '#C9E6A8', '#D3C2EA'];
  const bandCount = [0, 0, 0, 0, 0];
  const bandTotals = [0, 0, 0, 0, 0];
  ITEMS.forEach((i) => bandTotals[i.band]++);
  return (
    <AbsoluteFill>
      <Stage cam={[z, cx, cy]}>
        <A.WoodTable w={7000} h={4400} x={-1300} y={-1600} />
        <A.Linen w={4300} h={1300} x={50} y={140} color="#F5F0E5" />
        {radius.map((r, b) => (
          <path key={b} d={`M${RX - r} ${RY}A${r} ${r * 0.95} 0 0 1 ${RX + r} ${RY}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - bands} stroke={pastel[b]} strokeWidth="128" strokeLinecap="round" fill="none" opacity={0.75} />
        ))}
        {ITEMS.map((p, k) => {
          const idx = bandCount[p.band]++;
          const n = bandTotals[p.band];
          const ang = Math.PI * (0.9 - (idx / Math.max(1, n - 1)) * 0.8);
          const tx = RX + Math.cos(ang) * radius[p.band];
          const ty = RY - Math.sin(ang) * radius[p.band] * 0.95;
          const t = clamp(arc * 1.6 - (k / ITEMS.length) * 0.6);
          const e = easeInOut(t);
          const a = 6 + (p.band * 6 + idx) * 3;
          const s = (p.s * (1 - e) + (p.band === 4 ? 1.0 : 1.1) * e) * pop(f, a, 22);
          return <p.C key={k} x={p.x + (tx - p.x) * e} y={p.y + (ty - p.y) * e - Math.sin(e * Math.PI) * 120} s={s} r={p.r * (1 - e) + Math.sin(f / 110 + k) * 1.5} />;
        })}
        {[...Array(9)].map((_, i) => (
          <A.Blueberry key={i} x={GX[4] + 120 + (i % 3) * 30} y={660 + Math.floor(i / 3) * 28} s={pop(f, 40 + i * 2) * (1 - arc) * 1.6} />
        ))}
      </Stage>
      <WarmLight f={f} />
      <Bokeh f={f} seed={5} />
      <SceneTitle f={f} dur={dur} n="1" title="Fresh fruits & vegetables" hold={L(2)} />
      {['Fresh', 'Frozen', 'Canned*'].map((c, i) => (
        <Chip key={c} x={W / 2 + (i - 1) * 250} y={H - 300} anchor="center" o={Math.min(ip(f, [L(3) + 10 + i * 14, L(3) + 28 + i * 14], [0, 1]), ip(f, [L(4) - 10, L(4) + 8], [1, 0]))}>
          {c}
        </Chip>
      ))}
      <Chip x={W / 2} y={H - 236} anchor="center" size={26} o={Math.min(ip(f, [L(3) + 50, L(3) + 70], [0, 1]), ip(f, [L(4) - 10, L(4) + 8], [1, 0]))}>
        *without added sugar or salt
      </Chip>
      <Chip x={W / 2} y={H - 290} anchor="center" dark o={Math.min(ip(f, [L(4) + 20, L(4) + 40], [0, 1]), ip(f, [L(5) - 10, L(5) + 8], [1, 0]))}>
        + 1 new fruit or vegetable each week
      </Chip>
      <Chip x={W / 2} y={770} anchor="center" size={48} dark o={Math.min(ip(f, [L(5) + 70, L(5) + 95], [0, 1]), ip(f, [L(6) + 50, L(6) + 66], [1, 0]))}>
        Eat a rainbow
      </Chip>
      <Chip x={W / 2} y={770} anchor="center" size={48} dark o={ip(f, [L(6) + 72, L(6) + 92], [0, 1])}>
        Variety &amp; balance
      </Chip>
    </AbsoluteFill>
  );
};
