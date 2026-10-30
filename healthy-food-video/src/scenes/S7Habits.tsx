import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as A from '../art';
import {Bokeh, Chip, SceneProps, SceneTitle, Stage, WarmLight} from '../fx';
import {C, F, H, W, easeInOut, ip, kf, lineAt, pop, drop} from '../theme';

const SP = 1500; // spacing between vignettes on the counter
const VX = [960, 960 + SP, 960 + 2 * SP, 960 + 3 * SP, 960 + 4 * SP, 960 + 5 * SP];
const Y = 560;
const LABELS = ['Cook at home', '+1 vegetable', 'Smart snacks', 'Try a new recipe', 'Less added sugar & salt', 'Progress, not perfection'];

/** top-down stone counter */
const Counter: React.FC = () => (
  <>
    <rect x="-1400" y="-1600" width="11000" height="4400" fill="#EDE8DF" />
    {Array.from({length: 40}, (_, i) => (
      <path key={i} d={`M${-1400 + i * 280} -1600C${-1200 + i * 280} 0 ${-1500 + i * 280} 1200 ${-1300 + i * 280} 2800`} stroke="#D8D0C2" strokeOpacity="0.5" strokeWidth="3" fill="none" />
    ))}
  </>
);

export const S7Habits: React.FC<SceneProps> = ({f, dur}) => {
  const L = (n: number) => lineAt('habits', n);
  const at = [L(1), L(2), L(3), L(4), L(5), L(6)];
  const keys: [number, number][] = [[0, VX[0] - 300]];
  at.forEach((a, i) => {
    keys.push([a - 12, i === 0 ? VX[0] - 200 : VX[i - 1]]);
    keys.push([a + 28, VX[i]]);
  });
  keys.push([L(7), VX[5]]);
  keys.push([L(7) + 45, VX[5] - 470]);
  const cx = kf(f, keys, easeInOut);
  const z = kf(f, [[0, 0.85], [L(1), 1.1], [L(7), 1.1], [L(7) + 45, 1.0], [dur, 1.04]], easeInOut);
  const card = ip(f, [L(7) + 15, L(7) + 40], [0, 1]);
  const sizzle = (i: number) => Math.sin(f / 3 + i * 2) * 1.5;
  return (
    <AbsoluteFill>
      <Stage cam={[z, cx, Y]} bg="#EDE8DF">
        <Counter />
        {/* 1 · cook at home */}
        <A.Board x={VX[0] + 330} y={Y + 120} w={460} h={300} r={-8} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={VX[0] + 230 + i * 50} y={Y + 80 + (i % 2) * 30} width="34" height="70" rx="12" fill={i % 2 ? '#F6D63C' : '#E0392C'} transform={`rotate(${-8 + i * 10} ${VX[0] + 247 + i * 50} ${Y + 115})`} />)}
        <A.Knife x={VX[0] + 380} y={Y + 230} s={1.2} r={-10} />
        <A.Pan x={VX[0] - 220} y={Y - 30} s={1.5}>
          {[[-50, -30], [30, -50], [50, 30], [-20, 40], [0, -5], [-60, 20]].map(([x, y], i) => (
            <A.Broccoli key={i} x={x + sizzle(i)} y={y} s={0.42} sh={false} r={i * 40} />
          ))}
          {[[-30, -60], [60, -10], [20, 60], [-70, -5]].map(([x, y], i) => (
            <rect key={i} x={x + sizzle(i + 5)} y={y} width="16" height="36" rx="6" fill="#E0392C" transform={`rotate(${i * 50} ${x} ${y})`} />
          ))}
          {[[10, 30], [-40, 60], [70, -40]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y + sizzle(i + 8)} r="10" fill="#F0862A" />
          ))}
        </A.Pan>
        <A.Steam f={f} x={VX[0] - 240} y={Y - 120} s={2.2} n={4} />
        <A.Spoon x={VX[0] - 60} y={Y - 180} s={1.3} r={40 + Math.sin(f / 20) * 10} />
        {/* 2 · add a vegetable */}
        <A.Plate x={VX[1]} y={Y} s={3.0} />
        <A.Rice brown x={VX[1] + 70} y={Y - 80} s={1.1} />
        <A.Chicken x={VX[1] - 60} y={Y + 80} s={0.9} r={20} />
        <A.Broccoli x={VX[1] - 120} y={Y - 90 + drop(f, at[1] + 30, 200)} s={1.0 * pop(f, at[1] + 30)} />
        <A.Broccoli x={VX[1] + 120} y={Y + 70 + drop(f, at[1] + 42, 200)} s={0.85 * pop(f, at[1] + 42)} r={30} />
        <A.Tomato x={VX[1] - 20} y={Y - 160 + drop(f, at[1] + 54, 200)} s={0.6 * pop(f, at[1] + 54)} />
        {/* 3 · snacks */}
        <A.Jar x={VX[2] - 300} y={Y - 40} s={1.2}>
          <rect x="-66" y="-40" width="132" height="152" rx="18" fill="#C79A5E" opacity="0.4" />
          <A.Walnuts x={0} y={40} s={1.6} n={10} />
        </A.Jar>
        <A.BowlTop x={VX[2] + 40} y={Y - 30} s={1.4 * pop(f, at[2] + 20)} color="#2A7A3E" inner="#FFFFFF">
          <circle r="80" fill="url(#gYog)" />
          <A.Blueberry x={-20} y={-20} s={1.1} /><A.Blueberry x={14} y={10} s={1.1} /><A.Blueberry x={-6} y={26} s={1.1} /><A.Strawberry x={30} y={-26} s={0.4} sh={false} />
        </A.BowlTop>
        <A.Apple x={VX[2] + 340} y={Y - 150} s={1.3 * pop(f, at[2] + 35)} />
        <A.Banana x={VX[2] + 330} y={Y + 140} s={1.5 * pop(f, at[2] + 45)} r={-10} />
        <A.Almonds x={VX[2] - 20} y={Y + 230} s={1.3 * pop(f, at[2] + 55)} n={10} />
        <A.Grapes x={VX[2] - 360} y={Y + 260} s={1.0 * pop(f, at[2] + 60)} r={60} />
        {/* 4 · new recipe */}
        <A.Book x={VX[3]} y={Y - 30} s={1.3} />
        <A.Tomato x={VX[3] - 400} y={Y + 270} s={0.9 * pop(f, at[3] + 25)} />
        <A.Pepper x={VX[3] - 230} y={Y + 300} s={0.9 * pop(f, at[3] + 35)} r={-10} />
        <A.Lemon x={VX[3] + 380} y={Y + 260} s={0.9 * pop(f, at[3] + 45)} r={20} />
        <A.Carrot x={VX[3] + 420} y={Y - 260} s={1.0 * pop(f, at[3] + 55)} r={60} />
        <A.Mint x={VX[3] + 230} y={Y + 300} s={1.0 * pop(f, at[3] + 60)} r={-60} />
        {/* 5 · shopping basket */}
        <A.Basket x={VX[4]} y={Y + 60} s={1.5}>
          <A.Lettuce x={-80} y={-70} s={1.0} r={-20} />
          <A.Apple x={10} y={-60} s={0.8} sh={false} />
          <A.Carrot x={90} y={-90} s={0.9} r={30} sh={false} />
          <A.Orange x={-20} y={-30} s={0.7} sh={false} />
          <A.Broccoli x={80} y={-40} s={0.7} sh={false} />
        </A.Basket>
        <A.Can x={VX[4] + 420} y={Y + 80} s={1.0} o={ip(f, [at[4] + 30, at[4] + 60], [1, 0.25])} r={ip(f, [at[4] + 30, at[4] + 60], [0, 12])} />
        <A.Bottle x={VX[4] - 430} y={Y + 40} s={0.95} />
        {/* 6 · progress */}
        <A.Sprout x={VX[5]} y={Y + 120} s={1.6} g={ip(f, [at[5] + 10, at[5] + 90], [0.05, 1], easeInOut)} />
      </Stage>
      <WarmLight f={f} tint="rgba(255, 226, 176, 0.3)" />
      <Bokeh f={f} seed={21} n={5} />
      <SceneTitle f={f} dur={dur} n="6" title="Start small" hold={L(1) + 20} />
      {LABELS.map((t, i) => {
        const on = Math.min(ip(f, [at[i] + 20, at[i] + 38], [0, 1]), i < 5 ? ip(f, [at[i + 1] - 4, at[i + 1] + 10], [1, 0]) : ip(f, [L(7) - 4, L(7) + 10], [1, 0]));
        return (
          <Chip key={t} x={W / 2} y={H - 290} anchor="center" dark size={42} o={on}>
            {t}
          </Chip>
        );
      })}
      {card > 0 && (
        <div style={{position: 'absolute', left: 120, top: 190, width: 740, opacity: card, transform: `translateY(${(1 - card) * 24}px)`, background: 'rgba(253, 254, 251, 0.95)', borderRadius: 36, padding: '40px 52px 44px', boxShadow: '0 24px 60px rgba(60, 40, 10, 0.18)'}}>
          <div style={{fontFamily: F.display, fontSize: 58, color: C.greenDeep, marginBottom: 18}}>Small steps add up</div>
          {LABELS.map((t, i) => {
            const tick = ip(f, [L(7) + 40 + i * 14, L(7) + 52 + i * 14], [0, 1]);
            return (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, height: 60}}>
                <div style={{width: 40, height: 40, borderRadius: '50%', border: `4px solid ${C.green}`, background: tick > 0.5 ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{opacity: tick}}>
                    <path d="M4 12.5L10 18L20 6" stroke={C.paper} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tick} />
                  </svg>
                </div>
                <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 34, color: C.greenDeep}}>{t}</div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
