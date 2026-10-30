/**
 * Food & kitchen illustrations. Every item is drawn around (0,0) at roughly 100 units wide;
 * place it with x / y / s (scale) / r (rotation, degrees) / o (opacity).
 * Shading uses gradients from <Defs/> (soft top-left window light, warm shadows).
 */
import React from 'react';
import {rnd} from './theme';

export type P = {x?: number; y?: number; s?: number; r?: number; o?: number; sh?: boolean};
const tf = ({x = 0, y = 0, s = 1, r = 0}: P) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;
const G: React.FC<P & {children: React.ReactNode}> = ({children, o = 1, ...p}) =>
  o <= 0.001 || (p.s ?? 1) <= 0.001 ? null : (
    <g transform={tf(p)} opacity={o}>
      {children}
    </g>
  );
/** soft contact shadow, offset toward the bottom-right (light from top-left) */
const Sh: React.FC<{rx: number; ry?: number; dx?: number; dy?: number; show?: boolean}> = ({rx, ry, dx = 8, dy = 12, show = true}) =>
  show ? <ellipse cx={dx} cy={dy} rx={rx * 1.12} ry={(ry ?? rx) * 1.12} fill="url(#gSh)" /> : null;

const rg = (id: string, c0: string, c1: string, c2: string, cx = '34%', cy = '30%') => (
  <radialGradient id={id} cx={cx} cy={cy} r="75%">
    <stop offset="0" stopColor={c0} />
    <stop offset="0.55" stopColor={c1} />
    <stop offset="1" stopColor={c2} />
  </radialGradient>
);

export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="gSh" cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor="#3A2410" stopOpacity="0.34" />
      <stop offset="0.6" stopColor="#3A2410" stopOpacity="0.14" />
      <stop offset="1" stopColor="#3A2410" stopOpacity="0" />
    </radialGradient>
    {rg('gRed', '#FF8A70', '#E0392C', '#A71E1A')}
    {rg('gApple', '#FF9A7A', '#D8352B', '#8E1A17')}
    {rg('gOrange', '#FFD08A', '#F59A23', '#C8690F')}
    {rg('gLemon', '#FFF6B0', '#F6D63C', '#D7A912')}
    {rg('gGreen', '#9FDB6A', '#4E9F3D', '#2A6A2A')}
    {rg('gDGreen', '#7CC25A', '#327A32', '#1D4F22')}
    {rg('gPurple', '#B48AD8', '#6E3E96', '#3F1F5C')}
    {rg('gBlue', '#8AA2E6', '#3E58A8', '#22336B')}
    {rg('gYellow', '#FFF2A6', '#F7D44A', '#DDA821')}
    {rg('gAvoSkin', '#86A94A', '#4E7224', '#2F4A14')}
    {rg('gAvo', '#F2F5B4', '#D3E58A', '#9CC25B', '50%', '50%')}
    {rg('gPit', '#B98252', '#8A5A2E', '#5E3A1A')}
    {rg('gSalmon', '#FFB89A', '#F08A6C', '#D2654A')}
    {rg('gChicken', '#F4D3A0', '#E1AE6E', '#B97F42')}
    {rg('gBread', '#F7E1B5', '#E9C78C', '#D5A766', '50%', '50%')}
    {rg('gOat', '#FBF1DC', '#EEDDBA', '#D9C094', '50%', '45%')}
    {rg('gYog', '#FFFFFF', '#F6F4EE', '#E3DED2', '45%', '40%')}
    {rg('gChoc', '#8A5A3A', '#5B3A23', '#3A2414')}
    {rg('gPink', '#FFD3DE', '#F4A6B8', '#D97C93')}
    {rg('gCake', '#FFF4DA', '#F5DFAF', '#E2C383')}
    {rg('gPlate', '#FFFFFF', '#F7F7F2', '#E1E4DA', '45%', '40%')}
    {rg('gNut', '#E2B07A', '#B97D45', '#8A5426')}
    <linearGradient id="gWood" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#D7A974" />
      <stop offset="0.5" stopColor="#C8945E" />
      <stop offset="1" stopColor="#B07B48" />
    </linearGradient>
    <linearGradient id="gBoard" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#EBC894" />
      <stop offset="1" stopColor="#D4A66C" />
    </linearGradient>
    <linearGradient id="gCarrot" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#F9A54A" />
      <stop offset="0.5" stopColor="#F0862A" />
      <stop offset="1" stopColor="#C9611A" />
    </linearGradient>
    <linearGradient id="gWater" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#BFE3EC" stopOpacity="0.85" />
      <stop offset="0.45" stopColor="#EAF8FB" stopOpacity="0.7" />
      <stop offset="1" stopColor="#A9D6E2" stopOpacity="0.9" />
    </linearGradient>
    <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
      <stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0.12" />
      <stop offset="0.8" stopColor="#FFFFFF" stopOpacity="0.08" />
      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.45" />
    </linearGradient>
    <linearGradient id="gCuke" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#6FA64A" />
      <stop offset="1" stopColor="#2F6A2C" />
    </linearGradient>
    <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#5D646B" />
      <stop offset="0.5" stopColor="#3B4147" />
      <stop offset="1" stopColor="#24282C" />
    </linearGradient>
    <linearGradient id="gCan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#9E2A2A" />
      <stop offset="0.35" stopColor="#E0524A" />
      <stop offset="1" stopColor="#8A1F22" />
    </linearGradient>
  </defs>
);

/* ───────────── fruit ───────────── */

export const Tomato: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={50} show={p.sh !== false} />
    <path d="M0-44C30-46 52-26 52 4C52 32 30 50 0 50C-30 50-52 32-52 4C-52-26-30-46 0-44Z" fill="url(#gRed)" />
    <path d="M-30 30C-14 44 14 44 30 30" stroke="#B5241D" strokeOpacity="0.35" strokeWidth="4" fill="none" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx="0" cy="-12" rx="5" ry="14" fill="#3E8A33" transform={`translate(0 -34) rotate(${a})`} />
    ))}
    <circle cx="0" cy="-34" r="5" fill="#2F6A27" />
    <ellipse cx="-22" cy="-14" rx="12" ry="7" fill="#FFFFFF" opacity="0.45" transform="rotate(-35 -22 -14)" />
  </G>
);

export const Apple: React.FC<P & {green?: boolean}> = ({green, ...p}) => (
  <G {...p}>
    <Sh rx={54} show={p.sh !== false} />
    <path d="M0-32C22-52 58-40 56-2C54 34 28 56 0 46C-28 56-54 34-56-2C-58-40-22-52 0-32Z" fill={green ? 'url(#gGreen)' : 'url(#gApple)'} />
    <path d="M0-32C2-46 6-54 12-60" stroke="#6B4A2B" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M8-50C22-66 46-62 50-50C34-40 18-42 8-50Z" fill="#4E9F3D" />
    <ellipse cx="-26" cy="-14" rx="12" ry="8" fill="#FFFFFF" opacity="0.4" transform="rotate(-40 -26 -14)" />
  </G>
);

export const Orange: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={50} show={p.sh !== false} />
    <circle r="50" fill="url(#gOrange)" />
    {Array.from({length: 22}, (_, i) => (
      <circle key={i} cx={(rnd(i) - 0.5) * 70} cy={(rnd(i + 40) - 0.5) * 70} r="2" fill="#B85E0C" opacity="0.18" />
    ))}
    <circle cx="6" cy="-40" r="4" fill="#8A6A2A" opacity="0.7" />
    <path d="M6-42C16-56 34-58 42-50C30-40 16-40 6-42Z" fill="#3E8A33" />
    <ellipse cx="-20" cy="-18" rx="13" ry="8" fill="#FFFFFF" opacity="0.4" transform="rotate(-35 -20 -18)" />
  </G>
);

export const Lemon: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={54} ry={38} show={p.sh !== false} />
    <path d="M-58 0C-50-4-46-30 0-34C46-30 50-4 58 0C50 4 46 30 0 34C-46 30-50 4-58 0Z" fill="url(#gLemon)" />
    <ellipse cx="-14" cy="-14" rx="16" ry="7" fill="#FFFFFF" opacity="0.45" transform="rotate(-12 -14 -14)" />
  </G>
);

export const LemonSlice: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={48} show={p.sh === true} />
    <circle r="48" fill="#E9B824" />
    <circle r="43" fill="#FFF6CC" />
    <circle r="39" fill="#FBDC5A" />
    {Array.from({length: 9}, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      return <line key={i} x1="0" y1="0" x2={Math.cos(a) * 39} y2={Math.sin(a) * 39} stroke="#FFF3B8" strokeWidth="4" />;
    })}
    <circle r="6" fill="#FFF6CC" />
  </G>
);

export const Banana: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={56} ry={26} dy={16} show={p.sh !== false} />
    <path d="M-60-24C-36 26 34 34 60-8C62-14 56-18 52-14C26 12-28 8-50-30Z" fill="url(#gYellow)" />
    <path d="M-50-30C-26 4 26 8 52-14" stroke="#C99A1C" strokeWidth="3" fill="none" opacity="0.6" />
    <path d="M-60-24L-52-34L-48-28Z" fill="#6B4A2B" />
    <circle cx="60" cy="-10" r="4" fill="#5A3E22" />
  </G>
);

export const Grapes: React.FC<P> = (p) => {
  const pts: [number, number][] = [];
  [[4, -30], [3, -8], [4, 14], [3, 36], [2, 56]].forEach(([n, y], row) => {
    for (let i = 0; i < n; i++) pts.push([(i - (n - 1) / 2) * 26 + (row % 2 ? 0 : 0), y]);
  });
  return (
    <G {...p}>
      <Sh rx={52} ry={60} show={p.sh !== false} />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="15" fill="url(#gPurple)" />
          <circle cx={x - 5} cy={y - 5} r="4" fill="#FFFFFF" opacity="0.4" />
        </g>
      ))}
      <path d="M0-44C2-58 10-66 22-70" stroke="#6B5A2B" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M4-56C-14-76-40-70-44-58C-28-48-10-48 4-56Z" fill="#5BAA3E" />
    </G>
  );
};

export const Strawberry: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={40} ry={46} show={p.sh !== false} />
    <path d="M0 50C-30 32-46 2-42-20C-38-40 38-40 42-20C46 2 30 32 0 50Z" fill="url(#gRed)" />
    {Array.from({length: 14}, (_, i) => {
      const x = ((i % 4) - 1.5) * 18 + (Math.floor(i / 4) % 2 ? 9 : 0);
      const y = -18 + Math.floor(i / 4) * 16;
      return Math.abs(x) < 34 - Math.max(0, y) * 0.5 ? <ellipse key={i} cx={x} cy={y} rx="2.4" ry="3.6" fill="#FFE39A" /> : null;
    })}
    {[-60, -25, 0, 25, 60].map((a) => (
      <ellipse key={a} cx="0" cy="-10" rx="7" ry="16" fill="#3E8A33" transform={`translate(0 -32) rotate(${a})`} />
    ))}
  </G>
);

export const Eggplant: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={40} ry={62} show={p.sh !== false} />
    <path d="M-6-40C26-44 44-6 40 26C36 56 14 66-4 64C-30 62-44 40-38 10C-34-14-28-38-6-40Z" fill="url(#gPurple)" />
    <ellipse cx="-14" cy="0" rx="8" ry="22" fill="#FFFFFF" opacity="0.28" transform="rotate(12 -14 0)" />
    <path d="M-22-38C-12-54 12-56 22-40C14-30 0-28-22-38Z" fill="#4E8F3D" />
    <path d="M0-50C0-62 4-70 10-74" stroke="#4E8F3D" strokeWidth="7" fill="none" strokeLinecap="round" />
  </G>
);

export const Blueberry: React.FC<P> = (p) => (
  <G {...p}>
    <circle r="13" fill="url(#gBlue)" />
    <circle cx="0" cy="-3" r="4" fill="#22336B" />
    <circle cx="-4" cy="-5" r="3" fill="#FFFFFF" opacity="0.35" />
  </G>
);

export const Avocado: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={46} ry={58} show={p.sh !== false} />
    <path d="M0-60C22-60 32-36 38-12C48 26 30 60 0 60C-30 60-48 26-38-12C-32-36-22-60 0-60Z" fill="url(#gAvoSkin)" />
    <path d="M0-52C17-52 26-32 31-10C40 22 25 52 0 52C-25 52-40 22-31-10C-26-32-17-52 0-52Z" fill="url(#gAvo)" />
    <circle cx="0" cy="14" r="20" fill="url(#gPit)" />
    <circle cx="-6" cy="8" r="5" fill="#FFFFFF" opacity="0.3" />
  </G>
);

/* ───────────── vegetables ───────────── */

export const Broccoli: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={52} show={p.sh !== false} />
    <path d="M-12 6L-16 58Q0 66 16 58L12 6Z" fill="#A9CC6A" />
    <path d="M-4 20L-30 2M4 22L28 4" stroke="#A9CC6A" strokeWidth="10" strokeLinecap="round" />
    {[[-30, -4, 24], [30, -4, 24], [0, -26, 30], [-16, 12, 20], [16, 12, 20], [-22, -26, 18], [22, -28, 18]].map(([x, y, r], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r} fill="url(#gDGreen)" />
        <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.28} fill="#8ACB5E" opacity="0.5" />
      </g>
    ))}
  </G>
);

export const Carrot: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={18} ry={56} show={p.sh !== false} />
    <path d="M-16-48Q0-54 16-48L5 56Q0 64-5 56Z" fill="url(#gCarrot)" />
    <path d="M-10-26H6M-8 0H4M-6 24H3" stroke="#C9611A" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <path d="M0-50L-14-78M0-50L0-84M0-50L14-78M0-50L-24-70M0-50L24-70" stroke="#4E9F3D" strokeWidth="6" strokeLinecap="round" />
  </G>
);

export const Pepper: React.FC<P & {color?: string}> = ({color, ...p}) => (
  <G {...p}>
    <Sh rx={46} ry={50} show={p.sh !== false} />
    <path d="M-42-22C-50 18-32 52-12 50C-2 56 10 56 14 50C34 52 52 18 44-22C38-42-36-42-42-22Z" fill={color ?? 'url(#gRed)'} />
    <path d="M-14-30C-18 6-14 34-8 46M14-30C18 6 14 34 8 46" stroke="#000" strokeOpacity="0.12" strokeWidth="4" fill="none" />
    <path d="M-16-36C-6-44 6-44 16-36C8-30-8-30-16-36Z" fill="#2F6A27" />
    <path d="M0-40C0-52 4-60 12-64" stroke="#3E8A33" strokeWidth="8" fill="none" strokeLinecap="round" />
    <ellipse cx="-24" cy="-6" rx="7" ry="16" fill="#FFFFFF" opacity="0.35" />
  </G>
);

export const Cucumber: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={70} ry={20} show={p.sh !== false} />
    <rect x="-70" y="-17" width="140" height="34" rx="17" fill="url(#gCuke)" />
    {Array.from({length: 8}, (_, i) => (
      <circle key={i} cx={-54 + i * 15} cy={((i % 2) - 0.5) * 12} r="1.8" fill="#D4EAB0" opacity="0.6" />
    ))}
    <rect x="-60" y="-12" width="110" height="5" rx="2.5" fill="#FFFFFF" opacity="0.2" />
  </G>
);

export const CucumberSlice: React.FC<P> = (p) => (
  <G {...p}>
    <circle r="38" fill="#3E7A36" />
    <circle r="33" fill="#CDE6A2" />
    <circle r="19" fill="#E6F2C9" />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2;
      return <ellipse key={i} cx={Math.cos(a) * 11} cy={Math.sin(a) * 11} rx="2.5" ry="4" fill="#B7D486" transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * 11} ${Math.sin(a) * 11})`} />;
    })}
  </G>
);

export const Leaf: React.FC<P & {fill?: string}> = ({fill = 'url(#gGreen)', ...p}) => (
  <G {...p}>
    <path d="M0-62C38-40 38 40 0 62C-38 40-38-40 0-62Z" fill={fill} />
    <path d="M0-56V56M0-20L18-34M0 4L20-10M0 28L16 16M0-20L-18-34M0 4L-20-10M0 28L-16 16" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="3" fill="none" />
  </G>
);

/** frilly lettuce leaf */
export const Lettuce: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M0-60C20-62 30-46 44-48C58-30 50-14 60 0C52 18 58 32 42 46C26 50 18 62 0 60C-18 62-26 50-42 46C-58 32-52 18-60 0C-50-14-58-30-44-48C-30-46-20-62 0-60Z" fill="#7DC251" />
    <path d="M0-50C14-50 22-38 34-38C44-24 38-12 46 0C40 14 44 26 32 36C20 40 14 50 0 48C-14 50-20 40-32 36C-44 26-40 14-46 0C-38-12-44-24-34-38C-22-38-14-50 0-50Z" fill="#A6DB72" />
    <path d="M0-46V46M0-10L24-26M0 14L26 2M0-10L-24-26M0 14L-26 2" stroke="#E4F5C6" strokeWidth="4" strokeLinecap="round" fill="none" />
  </G>
);

export const Mint: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M0 50V-40" stroke="#3E7A36" strokeWidth="4" />
    {[[-1, 26, 1], [1, 6, 1], [-1, -14, 0.9], [1, -30, 0.8]].map(([side, y, sc], i) => (
      <g key={i} transform={`translate(0 ${y}) rotate(${side * 55}) scale(${sc})`}>
        <path d="M0 0C14-6 22-22 18-34C6-34-6-20 0 0Z" fill="#3FA34D" />
        <path d="M0 0L14-28" stroke="#8BD38F" strokeWidth="2" />
      </g>
    ))}
    <path d="M0-40C-8-52-4-62 0-66C4-62 8-52 0-40Z" fill="#4FB55A" />
  </G>
);

/* ───────────── protein, grains, fats ───────────── */

export const Egg: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={44} ry={36} show={p.sh !== false} />
    <ellipse rx="44" ry="34" fill="#FFFDF7" stroke="#EDE6D6" strokeWidth="3" />
    <circle cx="2" cy="2" r="19" fill="#F4B000" />
    <circle cx="-4" cy="-4" r="7" fill="#FFD25A" />
  </G>
);

export const Salmon: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={96} ry={50} show={p.sh !== false} />
    <path d="M-96-16C-80-54 70-62 100-20C114 2 98 36 62 46C2 60-80 48-96 18C-100 8-100-6-96-16Z" fill="url(#gSalmon)" />
    {[-60, -24, 12, 48].map((x, i) => (
      <path key={i} d={`M${x}-40C${x + 20}-12 ${x + 22} 18 ${x + 8} 44`} stroke="#FFD9C8" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.85" />
    ))}
    <path d="M-80 30C-30 46 40 42 80 26" stroke="#C9573C" strokeWidth="5" fill="none" opacity="0.4" />
    <path d="M30-30c8-6 18-6 24 0c-8 4-16 4-24 0Z" fill="#5BAA3E" />
    <circle cx="-30" cy="-20" r="3" fill="#2E2A24" /><circle cx="0" cy="10" r="3" fill="#2E2A24" /><circle cx="40" cy="4" r="3" fill="#2E2A24" />
  </G>
);

export const Chicken: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={70} ry={34} show={p.sh !== false} />
    {[-48, -16, 16, 48].map((x, i) => (
      <g key={i} transform={`translate(${x} 0) rotate(${8 - i * 4})`}>
        <rect x="-16" y="-34" width="32" height="68" rx="10" fill="url(#gChicken)" />
        <rect x="-16" y="-34" width="10" height="68" rx="5" fill="#FBE8C6" opacity="0.7" />
        <path d="M-12-14L12-22M-12 8L12 0" stroke="#8A5426" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      </g>
    ))}
  </G>
);

export const Beans: React.FC<P> = (p) => (
  <G {...p}>
    {Array.from({length: 26}, (_, i) => {
      const a = rnd(i * 3) * Math.PI * 2;
      const d = Math.sqrt(rnd(i * 3 + 1)) * 46;
      return (
        <g key={i} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d}) rotate(${rnd(i * 7) * 180})`}>
          <ellipse rx="11" ry="7" fill={i % 3 ? '#8A2E2A' : '#E1C08A'} />
          <ellipse cx="-3" cy="-2" rx="4" ry="2" fill="#FFFFFF" opacity="0.3" />
        </g>
      );
    })}
  </G>
);

export const Chickpeas: React.FC<P> = (p) => (
  <G {...p}>
    {Array.from({length: 18}, (_, i) => {
      const a = rnd(i * 5) * Math.PI * 2;
      const d = Math.sqrt(rnd(i * 5 + 2)) * 40;
      return (
        <g key={i}>
          <circle cx={Math.cos(a) * d} cy={Math.sin(a) * d} r="10" fill="#D9A55B" />
          <circle cx={Math.cos(a) * d - 3} cy={Math.sin(a) * d - 3} r="4" fill="#EBC687" />
        </g>
      );
    })}
  </G>
);

/** mound of rice / grains seen from above, radius ~ 70 */
export const Rice: React.FC<P & {brown?: boolean}> = ({brown, ...p}) => (
  <G {...p}>
    <Sh rx={72} show={p.sh !== false} />
    <circle r="70" fill={brown ? '#E5CFA3' : '#F7F2E4'} />
    {Array.from({length: 110}, (_, i) => {
      const a = rnd(i * 2) * Math.PI * 2;
      const d = Math.sqrt(rnd(i * 2 + 1)) * 64;
      return (
        <ellipse
          key={i}
          cx={Math.cos(a) * d}
          cy={Math.sin(a) * d}
          rx="7"
          ry="3.4"
          fill={brown ? (i % 3 ? '#D8BC86' : '#C7A36A') : i % 4 ? '#FFFFFF' : '#EFE8D6'}
          transform={`rotate(${rnd(i * 9) * 180} ${Math.cos(a) * d} ${Math.sin(a) * d})`}
        />
      );
    })}
    <ellipse cx="-22" cy="-24" rx="30" ry="18" fill="#FFFFFF" opacity="0.25" />
  </G>
);

export const Bread: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={56} show={p.sh !== false} />
    <path d="M-50 54L-50-14C-62-24-62-56-30-60C-16-62-8-56 0-56C8-56 16-62 30-60C62-56 62-24 50-14L50 54Z" fill="#B97A3E" />
    <path d="M-42 46L-42-12C-52-22-52-48-28-52C-14-54-6-48 0-48C6-48 14-54 28-52C52-48 52-22 42-12L42 46Z" fill="url(#gBread)" />
    {Array.from({length: 14}, (_, i) => (
      <ellipse key={i} cx={(rnd(i + 3) - 0.5) * 70} cy={(rnd(i + 30) - 0.5) * 80} rx="3" ry="2" fill="#B98C4E" opacity="0.5" />
    ))}
  </G>
);

export const Almonds: React.FC<P & {n?: number}> = ({n = 9, ...p}) => (
  <G {...p}>
    {Array.from({length: n}, (_, i) => {
      const a = rnd(i * 11) * Math.PI * 2;
      const d = Math.sqrt(rnd(i * 11 + 4)) * 34;
      return (
        <g key={i} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d}) rotate(${rnd(i * 13) * 360})`}>
          <path d="M0-16C10-8 10 10 0 16C-10 10-10-8 0-16Z" fill="url(#gNut)" />
          <path d="M0-12V12" stroke="#8A5426" strokeWidth="1.5" opacity="0.5" />
        </g>
      );
    })}
  </G>
);

export const Walnuts: React.FC<P & {n?: number}> = ({n = 6, ...p}) => (
  <G {...p}>
    {Array.from({length: n}, (_, i) => {
      const a = rnd(i * 17) * Math.PI * 2;
      const d = Math.sqrt(rnd(i * 17 + 4)) * 30;
      return (
        <g key={i} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d}) rotate(${rnd(i * 19) * 360})`}>
          <path d="M-14-6C-16-16-4-18 0-12C4-18 16-16 14-6C18 4 8 14 0 10C-8 14-18 4-14-6Z" fill="#C79A5E" />
          <path d="M0-10V8M-8-4C-4 0-4 4-8 6M8-4C4 0 4 4 8 6" stroke="#8A6234" strokeWidth="2" fill="none" />
        </g>
      );
    })}
  </G>
);

export const OliveOil: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={30} ry={30} dy={90} show={p.sh !== false} />
    <path d="M-12-90H12V-62C30-50 34-30 34 0V84Q34 96 22 96H-22Q-34 96-34 84V0C-34-30-30-50-12-62Z" fill="#C8B43A" opacity="0.92" />
    <path d="M-28 10H28V84Q28 90 22 90H-22Q-28 90-28 84Z" fill="#A99520" />
    <rect x="-14" y="-104" width="28" height="18" rx="4" fill="#2F5A2A" />
    <rect x="-24" y="20" width="48" height="40" rx="6" fill="#F6F1DE" />
    <circle cx="0" cy="40" r="10" fill="#6E8A2E" />
    <rect x="-26" y="-30" width="8" height="100" rx="4" fill="#FFFFFF" opacity="0.28" />
  </G>
);

/* ───────────── dishes & tableware ───────────── */

/** plate seen from above, outer radius 100 at s=1 */
export const Plate: React.FC<P & {rim?: string}> = ({rim = '#E3E9E0', ...p}) => (
  <G {...p}>
    <circle cx="8" cy="14" r="110" fill="url(#gSh)" />
    <circle r="100" fill="url(#gPlate)" />
    <circle r="78" fill="#FCFCF8" stroke={rim} strokeWidth="2.5" />
  </G>
);

/** bowl seen from above, radius 100 at s=1; children are drawn inside (clipped by eye, not mask) */
export const BowlTop: React.FC<P & {color?: string; inner?: string; children?: React.ReactNode}> = ({color = '#2A7A3E', inner = '#F4F1E8', children, ...p}) => (
  <G {...p}>
    <circle cx="10" cy="16" r="112" fill="url(#gSh)" />
    <circle r="100" fill={color} />
    <circle r="86" fill={inner} />
    <path d="M-60-60A86 86 0 0 1 60-60" stroke="#000" strokeOpacity="0.08" strokeWidth="18" fill="none" />
    {children}
    <path d="M-70 50A86 86 0 0 0 40 76" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="5" fill="none" />
  </G>
);

export const Board: React.FC<P & {w?: number; h?: number}> = ({w = 420, h = 260, ...p}) => (
  <G {...p}>
    <rect x={-w / 2 + 12} y={-h / 2 + 18} width={w} height={h} rx="28" fill="url(#gSh)" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="28" fill="url(#gBoard)" />
    {[0.25, 0.5, 0.75].map((k) => (
      <path key={k} d={`M${-w / 2 + 30} ${-h / 2 + h * k}C${-w / 6} ${-h / 2 + h * k - 8} ${w / 6} ${-h / 2 + h * k + 8} ${w / 2 - 30} ${-h / 2 + h * k}`} stroke="#B98A52" strokeOpacity="0.35" strokeWidth="2" fill="none" />
    ))}
    <circle cx={w / 2 - 30} cy={-h / 2 + 30} r="9" fill="#B98A52" opacity="0.5" />
  </G>
);

export const Knife: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M-120-10H40L60 10H-120Z" fill="#DCE1E4" />
    <path d="M-120-10H40L44-4H-120Z" fill="#FFFFFF" opacity="0.6" />
    <rect x="58" y="-10" width="90" height="22" rx="8" fill="#5B3A23" />
    <circle cx="80" cy="1" r="3" fill="#D8C6A8" /><circle cx="120" cy="1" r="3" fill="#D8C6A8" />
  </G>
);

export const Fork: React.FC<P> = (p) => (
  <G {...p}>
    <rect x="-4" y="-10" width="8" height="120" rx="4" fill="#C9CFD3" />
    <path d="M-14-70V-24Q-14-8 0-8Q14-8 14-24V-70" stroke="#C9CFD3" strokeWidth="5" fill="none" />
    <path d="M-5-70V-28M5-70V-28" stroke="#C9CFD3" strokeWidth="4" />
  </G>
);

export const Spoon: React.FC<P> = (p) => (
  <G {...p}>
    <rect x="-4" y="-6" width="8" height="120" rx="4" fill="#C9CFD3" />
    <ellipse cx="0" cy="-34" rx="20" ry="30" fill="#C9CFD3" />
    <ellipse cx="-5" cy="-40" rx="7" ry="14" fill="#FFFFFF" opacity="0.5" />
  </G>
);

export const Napkin: React.FC<P & {color?: string}> = ({color = '#E9F3E4', ...p}) => (
  <G {...p}>
    <rect x="-90" y="-90" width="180" height="180" rx="10" fill={color} />
    {[-60, -30, 0, 30, 60].map((v) => (
      <g key={v}>
        <line x1={v} y1="-90" x2={v} y2="90" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="3" />
        <line x1="-90" y1={v} x2="90" y2={v} stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="3" />
      </g>
    ))}
  </G>
);

/** glass seen from the side; fill 0..1; height 300 at s=1, base at y=150 */
export const Glass: React.FC<P & {fill?: number; children?: React.ReactNode; id?: string}> = ({fill = 0.8, children, id = 'gl', ...p}) => {
  const top = -150;
  const wl = 150 - 290 * fill;
  const halfAt = (y: number) => 92 - ((y - top) / 300) * 20; // slightly tapered glass
  return (
    <G {...p}>
      <ellipse cx="0" cy="156" rx="96" ry="14" fill="#2B3A30" opacity="0.14" />
      <clipPath id={`${id}-clip`}>
        <path d={`M${-halfAt(wl)} ${wl}L${-72} 146H72L${halfAt(wl)} ${wl}Z`} />
      </clipPath>
      <path d={`M${-halfAt(wl)} ${wl}L-72 146H72L${halfAt(wl)} ${wl}Z`} fill="url(#gWater)" />
      <g clipPath={`url(#${id}-clip)`}>{children}</g>
      {fill > 0.02 && <ellipse cx="0" cy={wl} rx={halfAt(wl)} ry="10" fill="#E6F6F9" stroke="#B9D6DC" strokeWidth="2" opacity="0.95" />}
      <path d="M-92-150L-74 150H74L92-150" fill="url(#gGlass)" stroke="#B9D6DC" strokeWidth="4" />
      <ellipse cx="0" cy="-150" rx="92" ry="12" fill="none" stroke="#C9E2E7" strokeWidth="4" />
      <path d="M-78-120L-64 128" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" opacity="0.55" />
      <path d="M70-100L62 60" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
    </G>
  );
};

/** reusable water bottle, side view, height ~320, base at y=160 */
export const Bottle: React.FC<P> = (p) => (
  <G {...p}>
    <ellipse cx="0" cy="164" rx="62" ry="10" fill="#2B3A30" opacity="0.14" />
    <rect x="-56" y="-110" width="112" height="270" rx="30" fill="#4FA36A" />
    <rect x="-56" y="-40" width="112" height="120" fill="#3E8E58" />
    <rect x="-36" y="-150" width="72" height="46" rx="12" fill="#E9F3E4" />
    <rect x="-20" y="-168" width="40" height="22" rx="8" fill="#CFDCCB" />
    <rect x="-44" y="-96" width="12" height="230" rx="6" fill="#FFFFFF" opacity="0.28" />
    <path d="M-10 0C6-14 26-10 30 6C14 14-2 12-10 0Z" fill="#E9F3E4" opacity="0.9" />
  </G>
);

/** soda can, side view, base at y=110 */
export const Can: React.FC<P> = (p) => (
  <G {...p}>
    <ellipse cx="0" cy="114" rx="56" ry="9" fill="#2B3A30" opacity="0.14" />
    <rect x="-50" y="-100" width="100" height="210" rx="12" fill="url(#gCan)" />
    <rect x="-46" y="-112" width="92" height="20" rx="8" fill="#C9CFD3" />
    <path d="M-50 -10C-20 20 20-40 50-10V40C20 10-20 70-50 40Z" fill="#FFFFFF" opacity="0.85" />
    <rect x="-40" y="-90" width="10" height="190" rx="5" fill="#FFFFFF" opacity="0.25" />
  </G>
);

/** pitcher with water, lemon and cucumber, side view, base at y=170 */
export const Pitcher: React.FC<P> = (p) => (
  <G {...p}>
    <ellipse cx="0" cy="174" rx="110" ry="14" fill="#2B3A30" opacity="0.14" />
    <path d="M-90-110L-100 160H100L90-110Z" fill="url(#gWater)" />
    <LemonSlice x={-30} y={20} s={0.6} r={20} o={0.85} />
    <CucumberSlice x={40} y={80} s={0.6} o={0.85} />
    <Mint x={20} y={-40} s={0.7} r={30} o={0.9} />
    <LemonSlice x={-40} y={110} s={0.55} r={-10} o={0.85} />
    <path d="M-96-170L-106 160H106L96-170L60-196H-60Z" fill="url(#gGlass)" stroke="#B9D6DC" strokeWidth="4" />
    <path d="M96-140C150-130 154-10 100 10" stroke="#B9D6DC" strokeWidth="14" fill="none" />
    <path d="M-80-140L-86 130" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
  </G>
);

/* ───────────── treats ───────────── */

export const CakeSlice: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={80} ry={40} dy={50} show={p.sh !== false} />
    <path d="M-80 20L60-50L80 40L-60 90Z" fill="#7A4A2E" />
    <path d="M-80 20L60-50L80 40L-60 90Z" fill="url(#gCake)" transform="translate(0 -6)" />
    <path d="M-78 40L66-24M-74 64L72 6" stroke="#E07A9A" strokeWidth="9" />
    <path d="M-86 14L60-58L84 30L-62 82Z" fill="#FBEFF3" transform="translate(0 -18) scale(1 0.5)" />
    <path d="M-84-6L60-78L82 -32L-60 34Z" fill="#FFF6F8" />
    <Strawberry x={40} y={-60} s={0.4} r={-15} sh={false} />
  </G>
);

export const Chocolate: React.FC<P> = (p) => (
  <G {...p}>
    <Sh rx={70} ry={50} show={p.sh !== false} />
    <rect x="-70" y="-48" width="140" height="96" rx="8" fill="#4A2E1B" />
    {[0, 1, 2].map((i) =>
      [0, 1].map((j) => <rect key={`${i}${j}`} x={-64 + i * 44} y={-42 + j * 44} width="40" height="40" rx="5" fill="url(#gChoc)" />),
    )}
    <rect x="-64" y="-42" width="40" height="8" rx="3" fill="#FFFFFF" opacity="0.15" />
  </G>
);

export const IceCream: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M-48 0L0 150L48 0Z" fill="#D9A15A" />
    <path d="M-40 20L28 4M-30 54L34 34M-20 88L26 70M-34 2L14 132M-6 2L28 104M24 2L38 40" stroke="#B57D3A" strokeWidth="4" />
    <path d="M-60 4C-74-40-40-74-8-62C6-96 58-90 62-50C80-30 68 6 50 8C20 18-30 18-60 4Z" fill="url(#gPink)" />
    <path d="M-60 4C-48 18-34 10-22 20C-8 30 6 12 20 22C34 30 46 14 56 8" fill="url(#gPink)" />
    <path d="M-40-30C-34-48-16-54-4-48" stroke="#FFE3EA" strokeWidth="8" fill="none" strokeLinecap="round" />
    <circle cx="10" cy="-78" r="14" fill="#C8302A" />
    <path d="M10-92C12-104 20-110 28-112" stroke="#5BAA3E" strokeWidth="4" fill="none" />
  </G>
);

/* ───────────── kitchen ───────────── */

/** frying pan seen from above, radius 120; children are the food inside */
export const Pan: React.FC<P & {children?: React.ReactNode}> = ({children, ...p}) => (
  <G {...p}>
    <circle cx="10" cy="16" r="134" fill="url(#gSh)" />
    <rect x="110" y="-16" width="190" height="32" rx="16" fill="#2B2F33" />
    <circle r="124" fill="url(#gSteel)" />
    <circle r="108" fill="#33393E" />
    <ellipse cx="-30" cy="-40" rx="60" ry="30" fill="#FFFFFF" opacity="0.06" />
    {children}
  </G>
);

/** soft rising steam wisps; f = frame for animation */
export const Steam: React.FC<P & {f: number; n?: number}> = ({f, n = 3, ...p}) => (
  <G {...p}>
    {Array.from({length: n}, (_, i) => {
      const ph = ((f / 90 + i / n) % 1 + 1) % 1;
      const y = -ph * 160;
      const op = Math.sin(ph * Math.PI) * 0.5;
      const x = (i - (n - 1) / 2) * 34 + Math.sin(f / 30 + i * 2) * 10;
      return (
        <path
          key={i}
          d={`M${x} ${y}c-14-20 14-34 0-54c-12-18 10-30 2-46`}
          stroke="#FFFFFF"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity={op}
        />
      );
    })}
  </G>
);

/** wicker basket, front view, ~300 wide; children drawn behind front lip */
export const Basket: React.FC<P & {children?: React.ReactNode}> = ({children, ...p}) => (
  <G {...p}>
    <ellipse cx="0" cy="118" rx="170" ry="16" fill="#2B3A30" opacity="0.15" />
    <path d="M-150-40C-150-170 150-170 150-40" stroke="#A9773F" strokeWidth="16" fill="none" />
    {children}
    <path d="M-160-30H160L130 110H-130Z" fill="#C8924F" />
    {[-10, 20, 50, 80].map((y) => (
      <path key={y} d={`M${-156 + (y + 30) * 0.2} ${y}H${156 - (y + 30) * 0.2}`} stroke="#A9773F" strokeWidth="6" />
    ))}
    {[-120, -80, -40, 0, 40, 80, 120].map((x) => (
      <path key={x} d={`M${x}-30L${x * 0.82} 110`} stroke="#B98446" strokeWidth="5" />
    ))}
    <rect x="-166" y="-44" width="332" height="24" rx="12" fill="#D9A462" />
  </G>
);

/** glass jar, side view, base at y=120 */
export const Jar: React.FC<P & {children?: React.ReactNode}> = ({children, ...p}) => (
  <G {...p}>
    <ellipse cx="0" cy="124" rx="80" ry="10" fill="#2B3A30" opacity="0.14" />
    {children}
    <rect x="-76" y="-90" width="152" height="210" rx="26" fill="url(#gGlass)" stroke="#C9E2E7" strokeWidth="4" />
    <rect x="-64" y="-122" width="128" height="36" rx="8" fill="#6DBE45" />
    <rect x="-60" y="-70" width="10" height="170" rx="5" fill="#FFFFFF" opacity="0.4" />
  </G>
);

/** small sprout that grows with g in 0..1 */
export const Sprout: React.FC<P & {g: number}> = ({g, ...p}) => {
  const h = 30 + g * 140;
  const l = Math.max(0, (g - 0.2) / 0.8);
  return (
    <G {...p}>
      <path d="M-70 0H70L56 90H-56Z" fill="#C46A3E" />
      <rect x="-78" y="-14" width="156" height="26" rx="8" fill="#D9804F" />
      <ellipse cx="0" cy="-12" rx="62" ry="8" fill="#5B3A23" />
      <path d={`M0-12C-4 ${-12 - h * 0.5} 4 ${-12 - h * 0.8} 0 ${-12 - h}`} stroke="#4E9F3D" strokeWidth="8" fill="none" strokeLinecap="round" />
      {l > 0 && (
        <>
          <path d={`M0 ${-12 - h * 0.55}c-20-10-50-8-62 10c22 12 48 8 62-10Z`} fill="#6DBE45" transform={`scale(${l})`} style={{transformOrigin: `0px ${-12 - h * 0.55}px`}} />
          <path d={`M0 ${-12 - h * 0.85}c20-14 52-12 64 6c-22 14-50 10-64-6Z`} fill="#8BCB55" transform={`scale(${l})`} style={{transformOrigin: `0px ${-12 - h * 0.85}px`}} />
        </>
      )}
      {g > 0.75 && <Leaf x={0} y={-12 - h - 18} s={(g - 0.75) * 1.4} fill="#6DBE45" />}
    </G>
  );
};

/** open recipe book (no readable text: drawn lines and a small picture) */
export const Book: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M-250 150L-240-130C-160-150-60-140 0-110C60-140 160-150 240-130L250 150C160 130 60 140 0 170C-60 140-160 130-250 150Z" fill="#2A7A3E" />
    <path d="M-232 132L-224-120C-150-136-60-128 0-100V156C-60 128-150 120-232 132Z" fill="#FBF6EC" />
    <path d="M232 132L224-120C150-136 60-128 0-100V156C60 128 150 120 232 132Z" fill="#F6F0E2" />
    <circle cx="-120" cy="-30" r="58" fill="#FFFFFF" stroke="#E2D9C4" strokeWidth="3" />
    <Tomato x={-138} y={-40} s={0.32} sh={false} />
    <Broccoli x={-100} y={-24} s={0.34} sh={false} />
    <Lettuce x={-128} y={-6} s={0.28} />
    {[-110, -80, -50, -20, 10, 40, 70].map((y, i) => (
      <rect key={y} x="40" y={y} width={i % 3 === 2 ? 110 : 150} height="8" rx="4" fill="#CFC6B2" />
    ))}
    {[60, 84, 108].map((y) => (
      <rect key={y} x="-200" y={y - 10} width="150" height="8" rx="4" fill="#CFC6B2" />
    ))}
  </G>
);

/* ───────────── backgrounds ───────────── */

/** warm wooden table top filling w×h from (0,0) */
export const WoodTable: React.FC<{w: number; h: number; x?: number; y?: number; plank?: number}> = ({w, h, x = 0, y = 0, plank = 210}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} fill="url(#gWood)" />
    {Array.from({length: Math.ceil(h / plank) + 1}, (_, i) => (
      <g key={i}>
        <rect y={i * plank} width={w} height="5" fill="#8C5E33" opacity="0.35" />
        {Array.from({length: 5}, (_, j) => {
          const yy = i * plank + 30 + j * 36 + rnd(i * 10 + j) * 10;
          const off = rnd(i * 31 + j) * 600;
          return (
            <path
              key={j}
              d={`M0 ${yy}C${w * 0.25 + off} ${yy - 8} ${w * 0.5 - off / 2} ${yy + 10} ${w} ${yy - 4}`}
              stroke="#9C6B3C"
              strokeOpacity={0.14 + rnd(i + j * 7) * 0.1}
              strokeWidth={2 + rnd(i * 3 + j) * 2}
              fill="none"
            />
          );
        })}
      </g>
    ))}
  </g>
);

/** light linen tablecloth with soft weave lines */
export const Linen: React.FC<{w: number; h: number; x?: number; y?: number; color?: string}> = ({w, h, x = 0, y = 0, color = '#F4EFE4'}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} fill={color} />
    {Array.from({length: Math.ceil(w / 60)}, (_, i) => (
      <rect key={i} x={i * 60} width="2" height={h} fill="#D9CFBC" opacity="0.35" />
    ))}
    {Array.from({length: Math.ceil(h / 60)}, (_, i) => (
      <rect key={i} y={i * 60} width={w} height="2" fill="#D9CFBC" opacity="0.35" />
    ))}
  </g>
);
