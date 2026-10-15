import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeInOut, easeOutBack, ip, mix} from '../theme';
import {Stars, Title} from '../components';

const lerpColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(mix(v, pb[i], t))).join(',')})`;
};

const NODES = ['Бабур', 'сын', 'внук', 'правнук', 'праправнук'];

const Taj: React.FC<{domeColor: string}> = ({domeColor}) => (
  <g>
    {/* plinth */}
    <rect x={-460} y={-40} width={920} height={40} fill="#EFE7DA" />
    {/* minarets */}
    {[-420, -300, 300, 420].map((x) => {
      const h = Math.abs(x) > 400 ? 330 : 0;
      if (!h) return null;
      return (
        <g key={x}>
          <rect x={x - 16} y={-40 - h} width={32} height={h} fill="#F8F3EA" />
          {[0.3, 0.6, 0.9].map((k) => (
            <rect key={k} x={x - 22} y={-40 - h * k} width={44} height={10} fill="#E3D8C6" />
          ))}
          <path d={`M${x - 22},${-40 - h} Q${x},${-40 - h - 60} ${x + 22},${-40 - h} Z`} fill="#F8F3EA" />
        </g>
      );
    })}
    {/* main body */}
    <rect x={-250} y={-300} width={500} height={260} fill="#FBF7F0" />
    <path d="M-250,-300 L-310,-250 L-310,-40 L-250,-40 Z" fill="#EFE7DA" />
    <path d="M250,-300 L310,-250 L310,-40 L250,-40 Z" fill="#EFE7DA" />
    {/* central iwan */}
    <path d="M-90,-40 L-90,-200 Q-90,-270 0,-285 Q90,-270 90,-200 L90,-40 Z" fill="#E6DCCB" />
    <path d="M-60,-40 L-60,-180 Q-60,-235 0,-245 Q60,-235 60,-180 L60,-40 Z" fill="#D6C9B3" />
    {[-190, 190].map((x) => (
      <path key={x} d={`M${x - 40},-60 L${x - 40},-160 Q${x},-200 ${x + 40},-160 L${x + 40},-60 Z`} fill="#E6DCCB" />
    ))}
    {/* small domes */}
    {[-170, 170].map((x) => (
      <g key={x}>
        <rect x={x - 34} y={-340} width={68} height={40} fill="#FBF7F0" />
        <path d={`M${x - 40},-340 Q${x},-420 ${x + 40},-340 Z`} fill="#FBF7F0" />
      </g>
    ))}
    {/* main dome (onion) */}
    <rect x={-120} y={-360} width={240} height={60} fill="#FBF7F0" />
    <path d="M-140,-360 C-190,-460 -90,-560 0,-600 C90,-560 190,-460 140,-360 Z" fill={domeColor} />
    <rect x={-3} y={-650} width={6} height={52} fill={C.gold} />
  </g>
);

export const S06Babur: React.FC<SceneProps> = ({f}) => {
  const dawn = ip(f, [20, 210], [0, 1], easeInOut);
  const top = lerpColor('#0F1B33', '#F2B872', dawn);
  const bot = lerpColor('#22304E', '#FBE7C2', dawn);
  const lineT = ip(f, [70, 190], [0, 1], (t) => t);
  const tajRise = ip(f, [180, 236], [0, 1], Easing.out(Easing.cubic));
  // final match-cut: dome fills the frame and turns turquoise
  const zoom = ip(f, [262, 300], [0, 1], Easing.in(Easing.cubic));
  const domeColor = zoom > 0 ? lerpColor('#FBF7F0', C.turq, clamp(zoom * 1.6)) : '#FBF7F0';
  const tajS = 0.75 * (1 + zoom * 12);
  const domeY = -470; // dome centre in Taj coordinates
  const ty = 1035 + (1 - tajRise) * 700;

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="s6-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={top} />
            <stop offset="1" stopColor={bot} />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s6-sky)" />
        <g opacity={1 - dawn}>
          <Stars f={f} rot={f * 0.05} cx={1500} cy={260} n={240} seed={5} />
        </g>
        <circle cx={1500} cy={900} r={160} fill="#FFE2A6" opacity={dawn * 0.8} />
        {/* family tree */}
        <g opacity={1 - zoom * 2}>
          <line x1={300} y1={360} x2={mix(300, 1620, lineT)} y2={360} stroke={C.gold} strokeWidth={8} strokeLinecap="round" />
          {NODES.map((n, i) => {
            const x = 300 + i * 330;
            const t0 = i === 0 ? 20 : 70 + (i / 4) * 120 - 8;
            const s = easeOutBack(clamp((f - t0) / 12));
            const big = i === 0 || i === 4;
            const r = big ? 84 : 44;
            return (
              <g key={n} transform={`translate(${x}, 360) scale(${s})`}>
                <circle r={r + 8} fill={C.gold} />
                <circle r={r} fill={i === 0 ? C.azureDeep : i === 4 ? C.turqDeep : '#3A4A6B'} />
                {big ? (
                  <g>
                    <ellipse cx={0} cy={-14} rx={r * 0.5} ry={r * 0.3} fill="#F7F3EA" />
                    <ellipse cx={0} cy={18} rx={r * 0.3} ry={r * 0.34} fill="#C98E5C" />
                    <path d={`M${-r * 0.6},${r} Q0,${r * 0.2} ${r * 0.6},${r}`} fill={C.gold} />
                  </g>
                ) : null}
                <text
                  y={r + 58}
                  textAnchor="middle"
                  fontFamily={F.body}
                  fontWeight={800}
                  fontSize={big ? 40 : 32}
                  fill={dawn > 0.45 ? C.ink : '#fff'}
                >
                  {n}
                </text>
              </g>
            );
          })}
          <text x={300} y={232} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={28} fill={dawn > 0.3 ? C.inkSoft : '#C9D3E6'} opacity={ip(f, [30, 44], [0, 1])}>
            Андижан, 1483
          </text>
        </g>
        {/* Taj Mahal */}
        <g transform={`translate(960, ${mix(ty + domeY * 0.75, 540, zoom) - domeY * tajS}) scale(${tajS})`}>
          <Taj domeColor={domeColor} />
        </g>
      </svg>
      <Title
        text="Его праправнук построил Тадж-Махал"
        f={f}
        start={10}
        end={268}
        x={960}
        y={66}
        align="center"
        size={70}
        maxWidth={1800}
        color={dawn > 0.4 ? C.ink : '#fff'}
        accent="Тадж-Махал"
        accentColor={dawn > 0.4 ? C.brick : C.goldLight}
      />
    </AbsoluteFill>
  );
};
