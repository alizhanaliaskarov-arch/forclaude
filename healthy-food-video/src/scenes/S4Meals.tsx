import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as A from '../art';
import {Bokeh, Chip, SceneProps, SceneTitle, Stage, WarmLight} from '../fx';
import {H, W, easeInOut, ip, kf, lineAt, pop, drop} from '../theme';

const BX = 960;
const LX = 960 + 1920;
const DX = 960 + 3840;
const Y = 560;

/** whole-grain wrap cut in half, seen from above */
const Wrap: React.FC<A.P> = (p) => (
  <g transform={`translate(${p.x ?? 0} ${p.y ?? 0}) rotate(${p.r ?? 0}) scale(${p.s ?? 1})`} opacity={p.o ?? 1}>
    <ellipse cx="10" cy="16" rx="150" ry="70" fill="url(#gSh)" />
    <rect x="-150" y="-58" width="300" height="116" rx="58" fill="#D9B27A" />
    <rect x="-150" y="-58" width="300" height="30" rx="15" fill="#E8CA96" />
    <path d="M-140-20H140" stroke="#B98A4E" strokeWidth="3" opacity="0.4" />
    <g transform="translate(150 0)">
      <ellipse rx="34" ry="58" fill="#E8CA96" />
      <ellipse rx="27" ry="50" fill="#7DC251" />
      <ellipse cx="-4" cy="-14" rx="12" ry="16" fill="#E0392C" />
      <ellipse cx="6" cy="16" rx="12" ry="18" fill="#F4D3A0" />
    </g>
  </g>
);

const Cup: React.FC<A.P & {f: number}> = ({f, ...p}) => (
  <g transform={`translate(${p.x ?? 0} ${p.y ?? 0}) scale(${p.s ?? 1})`}>
    <circle cx="8" cy="12" r="78" fill="url(#gSh)" />
    <rect x="58" y="-14" width="48" height="28" rx="14" fill="#F2EFE6" stroke="#DCE5D6" strokeWidth="3" />
    <circle r="70" fill="#F2EFE6" stroke="#DCE5D6" strokeWidth="3" />
    <circle r="56" fill="#C98F4E" />
    <circle r="56" fill="#E6B877" opacity="0.5" />
    <A.Steam f={f} y={-40} s={0.8} />
  </g>
);

export const S4Meals: React.FC<SceneProps> = ({f, dur}) => {
  const L = (n: number) => lineAt('meals', n);
  const cx = kf(f, [[0, BX - 200], [L(1), BX], [L(2) - 10, BX], [L(2) + 40, LX], [L(3) - 10, LX], [L(3) + 40, DX], [L(4), DX], [L(4) + 60, LX]], easeInOut);
  const z = kf(f, [[0, 0.9], [L(1), 1.08], [L(2), 1.08], [L(2) + 20, 0.92], [L(2) + 50, 1.08], [L(3) + 20, 0.92], [L(3) + 50, 1.08], [L(4), 1.0], [L(4) + 60, 0.385], [dur, 0.365]], easeInOut);
  // time-of-day light: soft morning gold -> bright noon -> amber evening
  const tod = (cx - BX) / (DX - BX);
  const tint = tod < 0.5 ? `rgba(255, ${226 - tod * 20}, ${170 + tod * 60}, ${0.32 - tod * 0.16})` : `rgba(255, ${216 - (tod - 0.5) * 70}, ${200 - (tod - 0.5) * 180}, ${0.24 + (tod - 0.5) * 0.3})`;
  const tB = L(1) + 15;
  const tL = L(2) + 45;
  const tD = L(3) + 45;
  const toS = (x: number, y: number): [number, number] => [(x - cx) * z + W / 2, (y - Y) * z + H / 2];
  const over = ip(f, [L(4) + 50, L(4) + 70], [0, 1]);
  return (
    <AbsoluteFill>
      <Stage cam={[z, cx, Y]}>
        <A.WoodTable w={9000} h={4200} x={-1900} y={-1500} />
        {/* breakfast */}
        <A.Napkin x={BX - 420} y={Y + 200} s={1.5} r={8} color="#FCEFD8" />
        <A.BowlTop x={BX - 60} y={Y} s={2.3} color="#F2EFE6" inner="#EEDDBA">
          <circle r="80" fill="url(#gOat)" />
          {[[-30, -20], [-6, 14], [-40, 26]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y + drop(f, tB + i * 5, 40)}) scale(${pop(f, tB + i * 5)})`}>
              <circle r="14" fill="#FBEBA6" stroke="#EAD27A" strokeWidth="2" />
              <circle r="3" fill="#C9A65A" />
            </g>
          ))}
          {[[24, -26], [36, -6], [20, 8], [44, 16], [8, -40]].map(([x, y], i) => (
            <A.Blueberry key={i} x={x} y={y + drop(f, tB + 20 + i * 3, 40)} s={0.7 * pop(f, tB + 20 + i * 3)} />
          ))}
          <A.Strawberry x={20} y={40 + drop(f, tB + 40, 40)} s={0.32 * pop(f, tB + 40)} r={30} sh={false} />
          <A.Almonds x={-10} y={-50} s={0.5 * pop(f, tB + 50)} n={5} />
        </A.BowlTop>
        <A.Spoon x={BX + 250} y={Y + 80} s={1.4} r={20} />
        <A.BowlTop x={BX + 380} y={Y - 220} s={1.0 * pop(f, L(1) + 70)} color="#2A7A3E" inner="#FFFFFF">
          <circle r="80" fill="url(#gYog)" />
          <A.Blueberry x={-20} y={-10} s={0.9} /><A.Blueberry x={10} y={14} s={0.9} /><A.Strawberry x={20} y={-24} s={0.3} sh={false} />
        </A.BowlTop>
        <Cup f={f} x={BX - 480} y={Y - 270} s={1.1} />
        <A.Banana x={BX + 420} y={Y + 300} s={1.5} r={-20} />
        {/* lunch */}
        <A.BowlTop x={LX - 120} y={Y} s={2.5} color="#FFFFFF" inner="#F7F7F2">
          <A.Lettuce x={-30} y={-20} s={0.9} r={20} />
          <A.Lettuce x={30} y={20} s={0.8} r={-40} />
          {[[-40, 30], [40, -30], [0, 46]].map(([x, y], i) => (
            <A.Tomato key={i} x={x} y={y + drop(f, tL + i * 5, 40)} s={0.32 * pop(f, tL + i * 5)} sh={false} />
          ))}
          {[[-50, -30], [50, 30], [-10, -54]].map(([x, y], i) => (
            <A.CucumberSlice key={i} x={x} y={y + drop(f, tL + 15 + i * 4, 40)} s={0.4 * pop(f, tL + 15 + i * 4)} />
          ))}
          <A.Chicken x={6} y={-4 + drop(f, tL + 30, 40)} s={0.6 * pop(f, tL + 30)} r={-20} sh={false} />
          <A.Chickpeas x={-40} y={0} s={0.5 * pop(f, tL + 40)} />
        </A.BowlTop>
        <A.Board x={LX + 420} y={Y + 40} w={420} h={260} r={-6} />
        <Wrap x={LX + 410} y={Y + 40 + drop(f, tL + 60, 60)} s={0.95 * pop(f, tL + 60)} r={-6} />
        <A.Fork x={LX - 500} y={Y + 40} s={1.5} r={-8} />
        <A.Glass x={LX + 430} y={Y - 300} s={0.55} fill={0.7} id="lunchglass" />
        {/* dinner */}
        <A.Plate x={DX - 60} y={Y} s={3.4} />
        <A.Rice brown x={DX + 40} y={Y - 110} s={1.3 * pop(f, tD)} />
        <A.Salmon x={DX - 130} y={Y + 30 + drop(f, tD + 15, 60)} s={1.25 * pop(f, tD + 15)} r={-20} />
        {[[110, 70], [60, 160], [170, 150]].map(([x, y], i) => (
          <A.Broccoli key={i} x={DX + x - 60} y={Y + y - 30 + drop(f, tD + 30 + i * 6, 60)} s={0.85 * pop(f, tD + 30 + i * 6)} r={i * 30} />
        ))}
        <A.LemonSlice x={DX - 240} y={Y - 120} s={0.55 * pop(f, tD + 50)} />
        <A.Steam f={f} x={DX - 80} y={Y - 80} s={1.6} o={ip(f, [tD + 30, tD + 60], [0, 0.9])} />
        <A.Fork x={DX - 500} y={Y} s={1.6} r={-6} />
        <A.Knife x={DX + 440} y={Y + 20} s={1.2} r={-88} />
        <A.Glass x={DX + 380} y={Y - 330} s={0.55} fill={0.75} id="dinnerglass" />
        <A.Napkin x={DX - 460} y={Y - 300} s={1.1} r={-14} color="#E9F3E4" />
      </Stage>
      <WarmLight f={f} tint={tint} />
      <Bokeh f={f} seed={11} n={5} />
      <SceneTitle f={f} dur={dur} n="3" title="Simple healthy meals" hold={L(1) + 30} />
      <Chip x={W / 2} y={H - 290} anchor="center" dark size={40} o={Math.min(ip(f, [L(1) + 10, L(1) + 30], [0, 1]), ip(f, [L(2) + 10, L(2) + 25], [1, 0]))}>
        Breakfast
      </Chip>
      <Chip x={W / 2} y={H - 290} anchor="center" dark size={40} o={Math.min(ip(f, [L(2) + 50, L(2) + 70], [0, 1]), ip(f, [L(3) + 10, L(3) + 25], [1, 0]))}>
        Lunch
      </Chip>
      <Chip x={W / 2} y={H - 290} anchor="center" dark size={40} o={Math.min(ip(f, [L(3) + 50, L(3) + 70], [0, 1]), ip(f, [L(4) + 10, L(4) + 25], [1, 0]))}>
        Dinner
      </Chip>
      {([['Breakfast', BX], ['Lunch', LX], ['Dinner', DX]] as [string, number][]).map(([t, x], i) => {
        const [sx, sy] = toS(x, Y + 500);
        return (
          <Chip key={t} x={sx} y={sy} anchor="center" dark size={34} o={over * ip(f, [L(4) + 60 + i * 12, L(4) + 78 + i * 12], [0, 1])}>
            {t}
          </Chip>
        );
      })}
      <Chip x={W / 2} y={150} anchor="center" size={38} o={ip(f, [L(5) + 30, L(5) + 50], [0, 1])}>
        Your foods · Your culture · A balanced plate
      </Chip>
    </AbsoluteFill>
  );
};
