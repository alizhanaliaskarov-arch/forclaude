import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeInOut, easeOutBack, ip} from '../theme';
import {Pill, Title, star8} from '../components';

const VP = {x: 960, y: 470};
const sl = (s: number) => ({
  l: VP.x + (0 - VP.x) * s,
  r: VP.x + (1920 - VP.x) * s,
  t: VP.y + (0 - VP.y) * s,
  b: VP.y + (1080 - VP.y) * s,
});
const DEPTHS = [1.0, 0.66, 0.47, 0.355, 0.28, 0.23];
const FAR = 0.2;

const quad = (a: [number, number], b: [number, number], c: [number, number], d: [number, number]) =>
  `M${a.join(',')} L${b.join(',')} L${c.join(',')} L${d.join(',')} Z`;

const Station: React.FC<{f: number}> = ({f}) => {
  const far = sl(FAR);
  return (
    <g>
      <defs>
        <radialGradient id="s13-glow">
          <stop offset="0" stopColor="#FFE7A8" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FFE7A8" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="s13-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3F4C" />
          <stop offset="1" stopColor="#1C2029" />
        </linearGradient>
      </defs>
      {/* ceiling, floor */}
      <rect width={1920} height={1080} fill="#14203A" />
      <path d={quad([0, 1080], [1920, 1080], [far.r, far.b], [far.l, far.b])} fill="url(#s13-floor)" />
      {/* floor pattern lines */}
      {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
        <line key={k} x1={VP.x + k * 300} y1={1080} x2={VP.x + k * 60 * FAR * 5} y2={far.b} stroke="#545A68" strokeWidth={2} opacity={0.5} />
      ))}
      {/* far wall mosaic */}
      <rect x={far.l} y={far.t} width={far.r - far.l} height={far.b - far.t} fill={C.azureDeep} />
      <path d={star8(VP.x, (far.t + far.b) / 2 - 10, 60, 0.7)} fill={C.gold} />
      <path d={star8(VP.x, (far.t + far.b) / 2 - 10, 36, 0.7)} fill={C.turq} />
      {/* walls between slices */}
      {DEPTHS.map((s, i) => {
        const a = sl(s);
        const b = sl(i < DEPTHS.length - 1 ? DEPTHS[i + 1] : FAR);
        const wallTop = (q: ReturnType<typeof sl>) => q.t + (q.b - q.t) * 0.12;
        const wallBot = (q: ReturnType<typeof sl>) => q.t + (q.b - q.t) * 0.78;
        return (
          <g key={s}>
            {/* left glazed wall */}
            <path d={quad([a.l, wallTop(a)], [b.l, wallTop(b)], [b.l, wallBot(b)], [a.l, wallBot(a)])} fill={i % 2 ? C.turqDeep : C.turq} />
            {/* right glazed wall */}
            <path d={quad([a.r, wallTop(a)], [b.r, wallTop(b)], [b.r, wallBot(b)], [a.r, wallBot(a)])} fill={i % 2 ? C.turqDeep : C.turq} />
            {/* medallions */}
            {[a.l + (b.l - a.l) * 0.5, a.r + (b.r - a.r) * 0.5].map((mx, k) => {
              const sc = (s + (i < DEPTHS.length - 1 ? DEPTHS[i + 1] : FAR)) / 2;
              const my = VP.y + (330 - VP.y) * sc;
              return (
                <g key={k}>
                  <ellipse cx={mx} cy={my} rx={70 * sc} ry={110 * sc} fill="#fff" />
                  <ellipse cx={mx} cy={my} rx={58 * sc} ry={96 * sc} fill={C.azure} />
                  <circle cx={mx} cy={my - 18 * sc} r={26 * sc} fill="#fff" />
                  <path d={`M${mx - 40 * sc},${my + 60 * sc} Q${mx},${my + 10 * sc} ${mx + 40 * sc},${my + 60 * sc} Z`} fill="#fff" />
                </g>
              );
            })}
            {/* columns at this depth */}
            {[a.l + (a.r - a.l) * 0.16, a.r - (a.r - a.l) * 0.16].map((cx, k) => {
              const w = 70 * s;
              return (
                <g key={`c${k}`}>
                  <rect x={cx - w / 2} y={a.t + (a.b - a.t) * 0.08} width={w} height={(a.b - a.t) * 0.84} fill="#E9E4DA" />
                  <rect x={cx - w / 2} y={a.t + (a.b - a.t) * 0.08} width={w * 0.3} height={(a.b - a.t) * 0.84} fill="#fff" opacity={0.6} />
                  <rect x={cx - w * 0.75} y={a.t + (a.b - a.t) * 0.08} width={w * 1.5} height={20 * s} fill={C.gold} />
                </g>
              );
            })}
          </g>
        );
      })}
      {/* chandeliers along the centre line */}
      {DEPTHS.slice(0, 5).map((s, i) => {
        const s2 = (s + DEPTHS[i + 1]) / 2;
        const q = sl(s2);
        const cy = q.t + (q.b - q.t) * 0.2;
        const on = clamp((f - (8 + i * 8)) / 4);
        const flick = on < 1 ? (Math.floor(f) % 2) * on : 1;
        return (
          <g key={s}>
            <line x1={VP.x} y1={q.t} x2={VP.x} y2={cy} stroke="#8A7A50" strokeWidth={4 * s2} />
            <circle cx={VP.x} cy={cy} r={260 * s2} fill="url(#s13-glow)" opacity={flick} />
            <ellipse cx={VP.x} cy={cy} rx={120 * s2} ry={30 * s2} fill="none" stroke={C.gold} strokeWidth={10 * s2} />
            {Array.from({length: 9}).map((_, k) => {
              const ang = (k / 9) * Math.PI * 2;
              return (
                <circle
                  key={k}
                  cx={VP.x + Math.cos(ang) * 120 * s2}
                  cy={cy + Math.sin(ang) * 30 * s2 + 14 * s2}
                  r={14 * s2}
                  fill={flick > 0.5 ? '#FFF4CF' : '#555'}
                />
              );
            })}
            {/* floor reflection */}
            <ellipse cx={VP.x} cy={q.b - (q.b - q.t) * 0.05} rx={150 * s2} ry={14 * s2} fill="#FFE7A8" opacity={0.25 * flick} />
          </g>
        );
      })}
    </g>
  );
};

const PhoneHand: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
    <rect x={-90} y={-160} width={180} height={320} rx={26} fill="#11151C" />
    <rect x={-78} y={-146} width={156} height={292} rx={18} fill="#2A3A5C" />
    <circle cx={0} cy={110} r={22} fill="none" stroke="#fff" strokeWidth={5} />
    <path d="M-120,120 Q-130,60 -90,40 L-90,180 Q-110,200 -130,170 Z" fill="#C98E5C" />
    <path d="M120,120 Q130,60 90,40 L90,180 Q110,200 130,170 Z" fill="#C98E5C" />
  </g>
);

export const S13Metro: React.FC<SceneProps> = ({f}) => {
  const dolly = ip(f, [0, 300], [1, 1.32], easeInOut);
  const lights = ip(f, [4, 50], [0.15, 1]);
  const phones = ip(f, [140, 166], [0, 1], easeOutBack) * (1 - ip(f, [262, 280], [0, 1]));
  const flash = f >= 178 && f < 183 ? 1 - (f - 178) / 5 : f >= 206 && f < 211 ? 1 - (f - 206) / 5 : 0;
  const card = ip(f, [282, 304], [0, 1], easeOutBack);
  const b1 = ip(f, [300, 330], [0, 8.0], easeInOut);
  const b2 = ip(f, [312, 350], [0, 11.7], easeInOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <g opacity={lights} transform={`translate(${VP.x}, ${VP.y}) scale(${dolly}) translate(${-VP.x}, ${-VP.y})`}>
          <Station f={f} />
        </g>
        {phones > 0 ? (
          <g>
            <PhoneHand x={560} y={1080 - phones * 300} rot={-8} />
            <PhoneHand x={1400} y={1080 - phones * 260} rot={10} />
          </g>
        ) : null}
        {flash > 0 ? <rect width={1920} height={1080} fill="#fff" opacity={flash * 0.7} /> : null}
        {card > 0 ? (
          <g>
            <rect width={1920} height={1080} fill="#0A1222" opacity={card * 0.55} />
            <g transform={`translate(1430, 560) scale(${card})`}>
              <rect x={-360} y={-330} width={720} height={640} rx={36} fill="#fff" />
              <text x={-300} y={-250} fontFamily={F.body} fontWeight={800} fontSize={40} fill={C.ink}>
                Иностранные туристы, млн
              </text>
              {[
                ['2024', b1, C.azureLight, 8.0],
                ['2025', b2, C.turq, 11.7],
              ].map(([yr, v, col, full], i) => {
                const h = ((v as number) / 12) * 380;
                const x = -200 + i * 260;
                return (
                  <g key={yr as string}>
                    <rect x={x} y={230 - h} width={160} height={h} rx={14} fill={col as string} />
                    <text x={x + 80} y={215 - h} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={54} fill={C.ink} opacity={(v as number) > 0.5 ? 1 : 0}>
                      {Math.min(v as number, full as number).toFixed(1).replace('.', ',')}
                    </text>
                    <text x={x + 80} y={280} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={36} fill={C.inkSoft}>
                      {yr as string}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        ) : null}
      </svg>
      <Title text="Больше 40 лет — ни одного фото" f={f} start={30} end={282} x={110} y={70} size={70} color="#fff" shadow maxWidth={1700} accent="40" accentColor={C.goldLight} />
      <Pill text="1977 → 2018" x={112} y={210} anchor="left" f={f} start={150} end={282} bg={C.gold} color={C.ink} size={36} />
      <Title text="Рекорд туристов" f={f} start={290} x={110} y={70} size={76} color="#fff" shadow />
    </AbsoluteFill>
  );
};
