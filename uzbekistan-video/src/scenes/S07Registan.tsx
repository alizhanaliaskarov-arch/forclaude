import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, easeInOut, ip, rnd} from '../theme';
import {MajolicaTile, Pill, Sun, Title} from '../components';
import {Dome, Madrasa, Minaret} from '../illustrations';

const Birds: React.FC<{f: number; seed?: number}> = ({f, seed = 1}) => (
  <g stroke="#3B2A20" strokeWidth={3} fill="none" strokeLinecap="round">
    {Array.from({length: 7}).map((_, i) => {
      const x = ((rnd(i + seed) * 1920 + f * (2 + rnd(i) * 2)) % 2100) - 100;
      const y = 200 + rnd(i * 3 + seed) * 220 + Math.sin(f * 0.1 + i) * 10;
      const w = Math.sin(f * 0.5 + i) * 8;
      return <path key={i} d={`M${x - 14},${y - w} Q${x - 6},${y - 6} ${x},${y} Q${x + 6},${y - 6} ${x + 14},${y - w}`} />;
    })}
  </g>
);

const Registan: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="s7-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5E8FC8" />
        <stop offset="0.55" stopColor="#F2C27A" />
        <stop offset="1" stopColor="#F8DDA9" />
      </linearGradient>
      <linearGradient id="s7-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D9B27A" />
        <stop offset="1" stopColor="#B98A52" />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#s7-sky)" />
    <Sun cx={1560} cy={560} r={90} color="#FFE9B8" glow="#FFC870" />
    <Birds f={f} />
    {/* side madrasas (Ulugbek left, Sher-Dor right) and Tilya-Kori with its dome in the middle */}
    <Madrasa cx={960} y={780} s={0.82} dome />
    <g transform="translate(330, 830)">
      <Madrasa cx={0} y={0} s={0.72} />
    </g>
    <g transform="translate(1590, 830)">
      <Madrasa cx={0} y={0} s={0.72} />
    </g>
    {/* square */}
    <path d="M0,820 L1920,820 L1920,1080 L0,1080 Z" fill="url(#s7-ground)" />
    {Array.from({length: 12}).map((_, i) => (
      <line key={i} x1={960 + (i - 6) * 70} y1={820} x2={960 + (i - 6) * 330} y2={1080} stroke="#A57A45" strokeWidth={2} opacity={0.5} />
    ))}
    {[860, 920, 1000].map((y) => (
      <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke="#A57A45" strokeWidth={2} opacity={0.4} />
    ))}
    {/* people for scale */}
    {[700, 760, 1180, 1240, 1300].map((x, i) => (
      <g key={x} transform={`translate(${x + Math.sin(f * 0.03 + i) * 6}, ${900 + (i % 2) * 30})`}>
        <circle cy={-46} r={9} fill="#3B2A20" />
        <rect x={-8} y={-36} width={16} height={36} rx={6} fill={[C.azure, C.brick, C.turq][i % 3]} />
      </g>
    ))}
  </g>
);

const IchanKala: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="s7-day" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8EC3EA" />
        <stop offset="1" stopColor="#F3E7CC" />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#s7-day)" />
    <Birds f={f} seed={4} />
    {/* Islam Khodja minaret (tall, striped) */}
    <Minaret cx={1380} y={760} h={620} w={70} tone="#E3BC86" />
    {[0.2, 0.32, 0.44, 0.56, 0.68, 0.8].map((k) => (
      <rect key={k} x={1380 - 33 + k * 4} y={760 - 620 * k} width={66 - k * 8} height={14} fill={C.turq} />
    ))}
    {/* Kalta Minor: wide, unfinished, fully tiled */}
    <path d="M520,780 L548,420 L792,420 L820,780 Z" fill={C.turq} />
    {Array.from({length: 8}).map((_, i) => (
      <rect key={i} x={524 + i * 3.5} y={440 + i * 42} width={292 - i * 7} height={20} fill={i % 2 ? C.azure : '#2E9C6A'} />
    ))}
    <rect x={540} y={406} width={260} height={20} fill={C.brick} />
    <Dome cx={1000} y={700} r={90} />
    <Dome cx={1660} y={720} r={70} />
    {/* clay wall with towers */}
    <path d="M0,760 L1920,760 L1920,1080 L0,1080 Z" fill="#C9935A" />
    {Array.from({length: 40}).map((_, i) => (
      <path key={i} d={`M${i * 50},760 L${i * 50},735 Q${i * 50 + 18},720 ${i * 50 + 36},735 L${i * 50 + 36},760 Z`} fill="#C9935A" />
    ))}
    {[180, 620, 1060, 1500].map((x) => (
      <g key={x}>
        <path d={`M${x - 70},1080 L${x - 60},700 Q${x},670 ${x + 60},700 L${x + 70},1080 Z`} fill="#B98049" />
        {Array.from({length: 4}).map((_, i) => (
          <path key={i} d={`M${x - 60 + i * 32},700 L${x - 60 + i * 32},680 Q${x - 46 + i * 32},668 ${x - 32 + i * 32},680 L${x - 32 + i * 32},700 Z`} fill="#B98049" />
        ))}
      </g>
    ))}
    <rect x={0} y={900} width={1920} height={180} fill="#B07A44" opacity={0.6} />
  </g>
);

export const S07Registan: React.FC<SceneProps> = ({f}) => {
  const push = ip(f, [0, 200], [1, 1.12], easeInOut);
  const tile = f >= 196 && f < 256;
  const khiva = f >= 248;
  const tileZoom = ip(f, [196, 256], [1.4, 1], easeInOut);
  const turq = 1 - ip(f, [0, 16], [0, 1]);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {f < 204 ? (
          <g transform={`translate(960, 700) scale(${push}) translate(-960, -700)`}>
            <Registan f={f} />
          </g>
        ) : null}
        {tile ? (
          <g opacity={ip(f, [196, 206], [0, 1]) * (1 - ip(f, [246, 256], [0, 1]))}>
            <g transform={`translate(960, 540) scale(${tileZoom}) rotate(${(f - 196) * 0.08}) translate(-960, -540)`}>
              {Array.from({length: 9}).map((_, r) =>
                Array.from({length: 15}).map((__, c) => (
                  <MajolicaTile key={`${r}-${c}`} x={-280 + c * 170} y={-260 + r * 170} s={170} flip={(r + c) % 2 === 1} />
                )),
              )}
            </g>
            {/* glaze shine */}
            <rect x={-600 + (f - 196) * 50} y={-200} width={220} height={1600} fill="#fff" opacity={0.25} transform="rotate(20)" />
          </g>
        ) : null}
        {khiva ? (
          <g opacity={ip(f, [248, 260], [0, 1])} transform={`translate(960, 700) scale(${ip(f, [248, 390], [1.08, 1])}) translate(-960, -700)`}>
            <IchanKala f={f} />
          </g>
        ) : null}
        {/* turquoise from the match-cut dome */}
        {turq > 0 ? <rect width={1920} height={1080} fill={C.turq} opacity={turq} /> : null}
      </svg>
      <Title text="Самая благородная площадь мира" f={f} start={14} end={200} x={110} y={70} size={70} color={C.ink} maxWidth={1800} />
      <Pill text="Регистан · Самарканд" x={112} y={205} anchor="left" f={f} start={40} end={196} bg={C.azureDeep} size={32} />
      <Title text="Город-музей за стеной" f={f} start={262} x={110} y={70} size={70} color={C.ink} />
      <Pill text="Ичан-Кала · Хива" x={112} y={205} anchor="left" f={f} start={270} bg={C.brick} size={32} />
    </AbsoluteFill>
  );
};
