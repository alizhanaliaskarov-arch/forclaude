import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as A from '../art';
import {Bokeh, Chip, SceneProps, SceneTitle, Stage, WarmLight} from '../fx';
import {H, W, easeInOut, ip, kf, lineAt, pop, rnd} from '../theme';

const COUNTER = 800; // counter top y (side view)
const GX = 960;

const TeaCup: React.FC<A.P & {f: number}> = ({f, ...p}) => (
  <g transform={`translate(${p.x ?? 0} ${p.y ?? 0}) scale(${p.s ?? 1})`} opacity={p.o ?? 1}>
    <ellipse cx="0" cy="6" rx="130" ry="16" fill="#E9E4D8" />
    <ellipse cx="0" cy="0" rx="120" ry="12" fill="#F7F4EC" />
    <path d="M-90-110H90L70-10Q60 0 40 0H-40Q-60 0-70-10Z" fill="#F7F4EC" stroke="#E1DACB" strokeWidth="3" />
    <path d="M88-90C130-90 130-30 76-34" stroke="#E1DACB" strokeWidth="14" fill="none" />
    <ellipse cx="0" cy="-110" rx="90" ry="12" fill="#C98F4E" />
    <ellipse cx="0" cy="-110" rx="90" ry="12" fill="#E6B877" opacity="0.4" />
    <path d="M30-110L50-160" stroke="#D9CFBC" strokeWidth="2" />
    <rect x="44" y="-178" width="24" height="22" rx="3" fill="#6DBE45" />
    <A.Steam f={f} y={-130} s={0.7} />
  </g>
);

const Watermelon: React.FC<A.P> = (p) => (
  <g transform={`translate(${p.x ?? 0} ${p.y ?? 0}) scale(${p.s ?? 1}) rotate(180)`} opacity={p.o ?? 1}>
    <path d="M-110 0A110 110 0 0 0 110 0Z" fill="#3E8A33" />
    <path d="M-100 0A100 100 0 0 0 100 0Z" fill="#DFF0C4" />
    <path d="M-92 0A92 92 0 0 0 92 0Z" fill="#F0525C" />
    {[[-50, 24], [-20, 40], [14, 34], [46, 22], [-4, 62], [30, 60]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx="4" ry="7" fill="#2E2A24" />
    ))}
  </g>
);

export const S5Water: React.FC<SceneProps> = ({f, dur}) => {
  const L = (n: number) => lineAt('water', n);
  const pourA = L(0) - 10;
  const pourB = L(1) + 60;
  const fill = ip(f, [pourA + 12, pourB], [0.02, 0.82], easeInOut);
  const tLemon = L(3) + 30;
  const tMint = L(3) + 70;
  const tCuke = L(3) + 110;
  const z = kf(f, [[0, 1.12], [L(1), 1.02], [L(2), 0.94], [L(3), 1.12], [L(4), 0.9], [L(5), 0.96], [dur, 1.02]], easeInOut);
  const cx = kf(f, [[0, GX], [L(2), GX + 120], [L(3), GX], [L(4), GX], [L(5), GX + 60]], easeInOut);
  const cy = kf(f, [[0, 600], [L(3), 580], [L(4), 600]], easeInOut);
  const bottleX = ip(f, [L(2) + 40, L(2) + 80], [2600, 1340], easeInOut);
  const teaO = ip(f, [L(4) + 10, L(4) + 35], [0, 1]);
  const melonO = ip(f, [L(4) + 50, L(4) + 75], [0, 1]);
  const canIn = ip(f, [L(5) - 50, L(5) - 20], [0, 1]);
  const canOut = ip(f, [L(5) + 30, L(5) + 70], [0, 1], easeInOut);
  const lemonY = (t0: number, y1: number) => ip(f, [t0, t0 + 22], [-260, y1], easeInOut) + Math.sin((f - t0) / 40) * 6 * ip(f, [t0 + 22, t0 + 40], [0, 1]);
  const splash = (t0: number) => {
    const k = ip(f, [t0 + 18, t0 + 40], [0, 1]);
    if (k <= 0 || k >= 1) return null;
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const a = -Math.PI / 2 + (i - 2.5) * 0.4;
      return <circle key={i} cx={GX + Math.cos(a) * 90 * k} cy={COUNTER - 30 - 240 * 0.82 - 10 + Math.sin(a) * 60 * k + 120 * k * k} r={6 * (1 - k)} fill="#DFF4F8" />;
    });
  };
  const wl = COUNTER - 10 - 290 * fill * 0.9; // water line in world coordinates (glass scale 0.9)
  return (
    <AbsoluteFill>
      <Stage cam={[z, cx, cy]} bg="#F5EFE3">
        {/* wall + window with daylight */}
        <rect x="-800" y="-600" width="3600" height="1400" fill="#F4ECDD" />
        <rect x="160" y="40" width="760" height="560" rx="16" fill="#E3D6C0" />
        <rect x="186" y="66" width="708" height="508" fill="#CFE9F2" />
        <rect x="186" y="66" width="708" height="508" fill="url(#gWater)" opacity="0.5" />
        <path d="M186 470C320 420 420 470 560 430C700 390 800 440 894 410V574H186Z" fill="#A8D88A" opacity="0.7" />
        <path d="M186 520C340 490 480 520 620 496C760 472 820 500 894 490V574H186Z" fill="#6DBE45" opacity="0.6" />
        <rect x="532" y="66" width="16" height="508" fill="#E3D6C0" />
        <rect x="186" y="312" width="708" height="16" fill="#E3D6C0" />
        <path d="M200 70L1400 900L1800 900L700 70Z" fill="#FFF3D6" opacity="0.28" />
        <path d="M420 70L1650 900L1850 900L740 70Z" fill="#FFF3D6" opacity="0.18" />
        {/* plant on the sill */}
        <g transform="translate(300 600)">
          <path d="M-40 0H40L30 70H-30Z" fill="#C46A3E" />
          <A.Leaf x={-20} y={-50} s={0.7} r={-30} fill="#4E9F3D" />
          <A.Leaf x={22} y={-60} s={0.8} r={25} fill="#6DBE45" />
          <A.Leaf x={0} y={-80} s={0.7} r={0} fill="#3F8F3A" />
        </g>
        <rect x="160" y="596" width="760" height="26" rx="6" fill="#E3D6C0" />
        {/* counter */}
        <rect x="-800" y={COUNTER} width="3600" height="600" fill="url(#gWood)" />
        <rect x="-800" y={COUNTER} width="3600" height="18" fill="#E2B987" />
        <rect x="-800" y={COUNTER + 18} width="3600" height="8" fill="#8C5E33" opacity="0.3" />
        {/* pour stream from a pitcher above */}
        <g opacity={Math.min(ip(f, [pourA - 20, pourA], [0, 1]), ip(f, [pourB, pourB + 20], [1, 0]))}>
          <path d={`M${GX - 4} 206Q${GX - 10} ${(206 + wl) / 2} ${GX} ${wl + 6}`} stroke="#CFEAF2" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d={`M${GX - 6} 210Q${GX - 11} ${(206 + wl) / 2} ${GX - 3} ${wl}`} stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
          <A.Pitcher x={GX + 144} y={266} s={0.8} r={-38} />
        </g>
        {/* glass with water, lemon, mint, cucumber, bubbles */}
        <A.Glass x={GX} y={COUNTER - 140} s={0.9} fill={fill} id="waterglass">
          {Array.from({length: 10}, (_, i) => {
            const sp = 0.6 + rnd(i) * 0.8;
            const ph = ((f * sp) / 120 + rnd(i + 9)) % 1;
            return <circle key={i} cx={-50 + rnd(i + 3) * 100} cy={140 - ph * 280} r={3 + rnd(i + 5) * 4} fill="#FFFFFF" opacity={0.55 * Math.sin(ph * Math.PI)} />;
          })}
          <A.LemonSlice x={-18} y={lemonY(tLemon, 10)} s={0.95} r={f / 6} o={pop(f, tLemon - 4, 8)} />
          <A.Mint x={34} y={lemonY(tMint, -60)} s={0.95} r={30 + Math.sin(f / 50) * 6} o={pop(f, tMint - 4, 8)} />
          <A.CucumberSlice x={20} y={lemonY(tCuke, 80)} s={0.8} o={pop(f, tCuke - 4, 8)} />
        </A.Glass>
        {splash(tLemon)}
        {splash(tMint)}
        <A.Mint x={GX + 140} y={COUNTER - 20} s={0.9} r={80} o={pop(f, L(3) + 10)} />
        <A.LemonSlice x={GX - 170} y={COUNTER - 6} s={0.7} r={0} o={pop(f, L(3) + 10)} />
        <A.Bottle x={bottleX} y={COUNTER - 162} s={1.0} />
        <TeaCup f={f} x={GX - 420} y={COUNTER} s={0.9 * (0.9 + teaO * 0.1)} o={teaO} />
        <Watermelon x={GX + 590} y={COUNTER + 2} s={0.8} o={melonO} />
        <A.Can x={GX + 820 + canOut * 900} y={COUNTER - 112} s={1.0} o={canIn * (1 - canOut)} r={canOut * 12} />
      </Stage>
      <WarmLight f={f} tint="rgba(255, 228, 180, 0.32)" />
      <Bokeh f={f} seed={14} n={6} color="255, 246, 220" />
      <SceneTitle f={f} dur={dur} n="4" title="Drink water" hold={L(2)} />
      {[
        ['Start your morning with water', L(2) + 10, L(3) - 6],
        ['Keep a bottle close', L(2) + 60, L(3) - 6],
        ['Lemon · Mint · Cucumber', L(3) + 30, L(4) - 6],
        ['Herbal tea & water-rich foods', L(4) + 30, L(5) - 6],
        ['Water instead of sugary drinks', L(5) + 30, dur],
      ].map(([t, a, b], i) => (
        <Chip key={i} x={W / 2} y={i === 1 ? 250 : 170} anchor="center" dark={i % 2 === 0} size={36} o={Math.min(ip(f, [a as number, (a as number) + 18], [0, 1]), ip(f, [(b as number) - 14, b as number], [1, 0]))}>
          {t}
        </Chip>
      ))}
    </AbsoluteFill>
  );
};
