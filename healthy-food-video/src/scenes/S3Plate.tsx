import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as A from '../art';
import {Bokeh, Chip, SceneProps, SceneTitle, Stage, WarmLight} from '../fx';
import {H, W, easeInOut, ip, kf, lineAt, pop, drop} from '../theme';

const PX = 820;
const PY = 560;
const R = 370; // plate radius on screen at zoom 1

type Drop = [React.FC<A.P>, number, number, number, number]; // comp, dx, dy (from plate centre), scale, rot
const VEG: Drop[] = [
  [A.Lettuce, -200, -150, 1.5, -10],
  [A.Lettuce, -230, 110, 1.4, 30],
  [A.Broccoli, -150, -40, 1.25, 0],
  [A.Broccoli, -260, -20, 1.0, 20],
  [A.Tomato, -110, -220, 0.8, 10],
  [A.Tomato, -60, 170, 0.75, -20],
  [A.Carrot, -150, 210, 1.0, 70],
  [A.Carrot, -110, 250, 0.95, 80],
  [A.Strawberry, -60, -120, 0.6, 20],
  [A.Strawberry, -40, 50, 0.6, -10],
];
const CUKE: [number, number][] = [[-250, -200], [-170, 120], [-70, -40], [-300, 90]];

export const S3Plate: React.FC<SceneProps> = ({f, dur}) => {
  const L = (n: number) => lineAt('plate', n);
  const tV = L(1) + 10;
  const tP = L(2) + 20;
  const tG = L(4) + 25;
  const tF = L(6) + 20;
  const z = kf(f, [[0, 1.2], [L(1), 1.0], [L(7), 1.0], [dur, 0.94]], easeInOut);
  const cx = kf(f, [[0, PX], [L(1), PX - 30], [L(2), PX + 40], [L(4), PX + 40], [L(6), PX + 110], [L(7), PX + 90]], easeInOut);
  const cy = kf(f, [[0, PY], [L(2), PY + 20], [L(4), PY - 20], [L(6), PY + 30], [L(7), PY]], easeInOut);
  const toS = (x: number, y: number): [number, number] => [(x - cx) * z + W / 2, (y - cy) * z + H / 2];
  const sc = R / 100;
  const divider = ip(f, [L(0) + 10, L(0) + 40], [0, 1]);
  const lab = (a: number) => Math.min(ip(f, [a + 6, a + 26], [0, 1]), 1);
  const [vx, vy] = toS(PX - 250, PY - R - 46);
  const [px, py] = toS(PX + R + 50, PY + 190);
  const [gx, gy] = toS(PX + R + 50, PY - 190);
  const [fx, fy] = toS(PX + R + 445, PY + 270);
  return (
    <AbsoluteFill>
      <Stage cam={[z, cx, cy]}>
        <A.Linen w={W + 1400} h={H + 1000} x={-700} y={-500} color="#EEF3E6" />
        <A.Napkin x={PX - 560} y={PY + 360} s={1.4} r={-12} />
        <A.Fork x={PX - 470} y={PY - 30} s={1.7} r={-4} />
        <A.Knife x={PX + 560} y={PY - 430} s={1.1} r={-90} />
        <A.Plate x={PX} y={PY} s={sc} />
        {/* section guides */}
        <g opacity={divider * 0.6}>
          <path d={`M${PX} ${PY - R * 0.78}V${PY + R * 0.78}M${PX} ${PY}H${PX + R * 0.78}`} stroke="#D7DED2" strokeWidth="5" strokeDasharray="14 12" />
        </g>
        {/* vegetables & fruit: left half */}
        {VEG.map(([Comp, dx, dy, s, r], i) => {
          const a = tV + i * 6;
          return <Comp key={i} x={PX + dx} y={PY + dy + drop(f, a, 120)} s={s * pop(f, a, 16)} r={r} />;
        })}
        {CUKE.map(([dx, dy], i) => (
          <A.CucumberSlice key={i} x={PX + dx} y={PY + dy + drop(f, tV + 60 + i * 5, 100)} s={0.8 * pop(f, tV + 60 + i * 5, 14)} />
        ))}
        {/* protein: bottom-right quarter */}
        <A.Salmon x={PX + 165} y={PY + 120 + drop(f, tP, 120)} s={1.15 * pop(f, tP)} r={-30} />
        <A.Egg x={PX + 110} y={PY + 260 + drop(f, tP + 14, 100)} s={0.85 * pop(f, tP + 14)} r={10} />
        <A.Egg x={PX + 220} y={PY + 245 + drop(f, tP + 22, 100)} s={0.85 * pop(f, tP + 22)} r={-20} />
        <A.Beans x={PX + 285} y={PY + 70 + drop(f, tP + 34, 80)} s={0.9 * pop(f, tP + 34)} />
        {/* whole grains: top-right quarter */}
        <A.Rice brown x={PX + 165} y={PY - 150 + drop(f, tG, 100)} s={1.55 * pop(f, tG)} />
        <A.Bread x={PX + 280} y={PY - 70 + drop(f, tG + 18, 100)} s={0.9 * pop(f, tG + 18)} r={30} />
        {/* healthy fats */}
        <A.Avocado x={PX + 110} y={PY - 300 + drop(f, tF + 10, 80)} s={0.7 * pop(f, tF + 10)} r={40} />
        <A.BowlTop x={PX + R + 450} y={PY + 110} s={0.75 * pop(f, tF)} color="#2A7A3E">
          <A.Almonds s={1.6} n={12} />
        </A.BowlTop>
        <A.OliveOil x={PX + R + 430} y={PY - 190} s={1.1 * pop(f, tF + 20)} r={0} />
      </Stage>
      <WarmLight f={f} />
      <Bokeh f={f} seed={8} n={5} />
      <SceneTitle f={f} dur={dur} n="2" title="Build a balanced plate" hold={L(1)} />
      <Chip x={vx} y={vy} anchor="center" o={lab(tV)} dark>
        ½ Vegetables &amp; fruit
      </Chip>
      <Chip x={px} y={py} o={lab(tP)}>
        ¼ Protein
      </Chip>
      <Chip x={gx} y={gy} o={lab(tG)}>
        ¼ Whole grains
      </Chip>
      <Chip x={fx} y={fy} anchor="center" o={lab(tF + 10)}>
        + Healthy fats
      </Chip>
      <Chip x={W / 2} y={H - 290} anchor="center" size={36} dark o={Math.min(ip(f, [L(7) + 40, L(7) + 60], [0, 1]), ip(f, [dur - 20, dur], [1, 0]))}>
        No measuring needed
      </Chip>
    </AbsoluteFill>
  );
};
