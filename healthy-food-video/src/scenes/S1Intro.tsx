import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as A from '../art';
import {Bokeh, Chip, SceneProps, Stage, WarmLight} from '../fx';
import {C, F, H, W, easeInOut, ip, kf, lineAt, pop, rnd} from '../theme';

type Item = [React.FC<A.P>, number, number, number, number]; // comp, x, y, scale, rot

/** a generous ring of fresh produce around the centre of a wooden table (also used by the outro) */
export const RING: Item[] = [
  [A.Lettuce, 230, 170, 1.9, -20],
  [A.Tomato, 420, 120, 1.15, 10],
  [A.Tomato, 520, 200, 0.95, -30],
  [A.Broccoli, 300, 400, 1.5, 15],
  [A.Carrot, 150, 600, 1.35, 60],
  [A.Carrot, 230, 680, 1.3, 75],
  [A.Avocado, 380, 860, 1.25, -30],
  [A.Lemon, 600, 960, 1.15, 20],
  [A.Grapes, 820, 980, 1.25, 80],
  [A.Strawberry, 1030, 960, 0.9, -20],
  [A.Strawberry, 1110, 1000, 0.85, 25],
  [A.Orange, 1280, 950, 1.2, 0],
  [A.Banana, 1500, 920, 1.6, -15],
  [A.Pepper, 1720, 780, 1.2, 25],
  [A.Cucumber, 1760, 560, 1.4, 80],
  [A.Apple, 1690, 330, 1.15, -10],
  [A.Apple, 1800, 190, 0.95, 20],
  [A.Broccoli, 1520, 140, 1.25, -25],
  [A.Lemon, 1340, 90, 1.0, -40],
  [A.Orange, 700, 90, 0.95, 0],
  [A.Mint, 880, 70, 1.2, 70],
  [A.Mint, 1120, 70, 1.1, -60],
  [A.Tomato, 160, 880, 0.9, 0],
  [A.Avocado, 1880, 960, 1.1, 40],
];

export const ProduceTable: React.FC<{f: number; start?: number; spread?: number}> = ({f, start = 0, spread = 1}) => (
  <>
    <A.WoodTable w={W + 1200} h={H + 800} x={-600} y={-400} />
    <A.Linen w={760} h={1500} x={W / 2 - 380} y={-210} color="#F3EEE2" />
    {RING.map(([Comp, x, y, s, r], i) => {
      const a = start + 4 + i * 3 + Math.round(rnd(i) * 6);
      const k = pop(f, a, 22);
      const dx = (x - W / 2) * (spread - 1);
      const dy = (y - H / 2) * (spread - 1);
      return <Comp key={i} x={x + dx} y={y + dy - (1 - k) * 40} s={s * k} r={r + Math.sin(f / 120 + i) * 1.5} />;
    })}
    {[...Array(14)].map((_, i) => (
      <A.Blueberry key={`b${i}`} x={960 + Math.cos(i * 0.8) * (430 + (i % 3) * 30)} y={540 + Math.sin(i * 0.8) * (400 + (i % 2) * 40)} s={pop(f, start + 30 + i * 2) * 1.2} />
    ))}
  </>
);

export const S1Intro: React.FC<SceneProps> = ({f, dur}) => {
  const L = (n: number) => lineAt('intro', n);
  const z = kf(f, [[0, 1.32], [dur, 1.04]], easeInOut);
  const rot = kf(f, [[0, -3], [dur, 1.5]], easeInOut);
  const tIn = ip(f, [40, 80], [0, 1]);
  const tOut = ip(f, [dur - 40, dur - 10], [1, 0]);
  const chips = ['Fresh food', 'Balanced meals', 'Water', 'Small habits'];
  return (
    <AbsoluteFill>
      <Stage cam={[z, W / 2, H / 2]} rot={rot}>
        <ProduceTable f={f} />
      </Stage>
      <WarmLight f={f} />
      <Bokeh f={f} seed={2} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: tIn * tOut}}>
        <div
          style={{
            background: 'rgba(251, 248, 240, 0.9)',
            borderRadius: 48,
            padding: '56px 90px 60px',
            boxShadow: '0 30px 80px rgba(60, 35, 10, 0.25)',
            textAlign: 'center',
            transform: `translateY(${(1 - tIn) * 30}px) scale(${0.96 + tIn * 0.04})`,
          }}
        >
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, textTransform: 'uppercase', color: C.green}}>Eat well · Feel well</div>
          <div style={{fontFamily: F.display, fontSize: 128, lineHeight: 1.04, color: C.greenDeep, marginTop: 14}}>
            Healthy Food,
            <br />
            <span style={{color: C.green}}>Healthy Life</span>
          </div>
        </div>
      </AbsoluteFill>
      {chips.map((c, i) => (
        <Chip key={c} x={W / 2 + (i - 1.5) * 330} y={H / 2 + 280} anchor="center" size={32} dark o={ip(f, [L(3) + 20 + i * 22, L(3) + 40 + i * 22], [0, 1]) * tOut}>
          {c}
        </Chip>
      ))}
    </AbsoluteFill>
  );
};
