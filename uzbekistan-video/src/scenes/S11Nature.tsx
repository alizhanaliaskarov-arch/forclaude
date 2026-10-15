import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, easeInOut, ip, rnd} from '../theme';
import {Pill, Sun, Title, dunePath, ridgePath} from '../components';

const Desert: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="s11-sky1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F7E6CF" />
        <stop offset="1" stopColor="#F3C9A0" />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#s11-sky1)" />
    <Sun cx={1450} cy={300} r={80} color="#FFF6E2" glow="#FFE0B0" />
    <path d={dunePath(560, 30, 0.003, 0.5 + f * 0.002)} fill="#E09A6C" />
    <path d={dunePath(660, 46, 0.0024, 2.1)} fill="#D9774A" />
    <path d={dunePath(800, 60, 0.002, 4.2)} fill="#C5603A" />
    <path d={dunePath(940, 40, 0.0032, 1.3)} fill="#A94D2E" />
    {/* saxaul shrubs */}
    {[260, 720, 1250, 1640].map((x, i) => (
      <g key={x} transform={`translate(${x}, ${790 + (i % 2) * 90})`} stroke="#5A3A22" strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M0,0 L0,-50 M0,-30 L-30,-70 M0,-40 L26,-80 M-30,-70 L-46,-82 M26,-80 L40,-96" />
        <circle cx={-34} cy={-76} r={16} fill="#7C8C4A" stroke="none" />
        <circle cx={30} cy={-88} r={14} fill="#7C8C4A" stroke="none" />
      </g>
    ))}
  </g>
);

const Mountains: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="s11-sky2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5E9BD6" />
        <stop offset="1" stopColor="#D8ECF8" />
      </linearGradient>
      <linearGradient id="s11-snow1" gradientUnits="userSpaceOnUse" x1="0" y1="260" x2="0" y2="560">
        <stop offset="0.35" stopColor="#FFFFFF" />
        <stop offset="0.5" stopColor="#A9BED8" />
        <stop offset="1" stopColor="#8EA7C6" />
      </linearGradient>
      <linearGradient id="s11-snow2" gradientUnits="userSpaceOnUse" x1="0" y1="380" x2="0" y2="700">
        <stop offset="0.3" stopColor="#FFFFFF" />
        <stop offset="0.45" stopColor="#7E9BBE" />
        <stop offset="1" stopColor="#5E7FA6" />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#s11-sky2)" />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={((300 + i * 700 + f * 1.2) % 2200) - 140} cy={200 + i * 60} rx={150} ry={34} fill="#fff" opacity={0.8} />
    ))}
    <path d={ridgePath(560, 300, 3, 140)} fill="url(#s11-snow1)" />
    <path d={ridgePath(700, 300, 9, 180)} fill="url(#s11-snow2)" />
    <path d={dunePath(850, 50, 0.003, 0.7)} fill="#5E8C61" />
    <path d={dunePath(960, 40, 0.004, 2.7)} fill="#4A7550" />
    {Array.from({length: 26}).map((_, i) => {
      const x = rnd(i + 2) * 1920;
      const y = 860 + rnd(i + 9) * 180;
      const s = 0.6 + rnd(i) * 0.7;
      return <path key={i} d={`M${x},${y - 90 * s} L${x + 28 * s},${y} L${x - 28 * s},${y} Z`} fill="#2F5A3A" />;
    })}
  </g>
);

const Fergana: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="s11-sky3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#BFE0F2" />
        <stop offset="1" stopColor="#F4F8EC" />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#s11-sky3)" />
    <path d={ridgePath(520, 160, 21, 160)} fill="#B8CBE0" />
    {/* fields in perspective */}
    <path d="M0,560 L1920,560 L1920,1080 L0,1080 Z" fill="#9CC46B" />
    {Array.from({length: 14}).map((_, i) => (
      <path
        key={i}
        d={`M${960 + (i - 7) * 60},560 L${960 + (i - 7) * 60 + 30},560 L${960 + (i - 7) * 330 + 160},1080 L${960 + (i - 7) * 330},1080 Z`}
        fill={i % 2 ? '#88B85A' : '#B4D27E'}
      />
    ))}
    {/* blossoming apricot trees */}
    {Array.from({length: 11}).map((_, i) => {
      const row = i < 5 ? 0 : 1;
      const x = row === 0 ? 220 + i * 370 : 80 + (i - 5) * 340;
      const y = row === 0 ? 690 : 900;
      const s = row === 0 ? 0.75 : 1.15;
      return (
        <g key={i} transform={`translate(${x}, ${y}) scale(${s})`}>
          <rect x={-10} y={-90} width={20} height={100} fill="#6B4A2F" />
          {Array.from({length: 9}).map((_, k) => (
            <circle
              key={k}
              cx={(rnd(i * 9 + k) - 0.5) * 140}
              cy={-140 + (rnd(i * 5 + k) - 0.5) * 90}
              r={46 + rnd(k + i) * 20}
              fill={k % 3 === 0 ? '#FFFFFF' : k % 3 === 1 ? '#F7C6D4' : '#EFA3BC'}
            />
          ))}
        </g>
      );
    })}
    {/* falling petals */}
    {Array.from({length: 26}).map((_, i) => {
      const x = (rnd(i) * 1920 + f * 2) % 1920;
      const y = (rnd(i + 5) * 1080 + f * (2 + rnd(i) * 2)) % 1080;
      return <ellipse key={i} cx={x} cy={y} rx={6} ry={3.5} fill="#F7C6D4" transform={`rotate(${f * 4 + i * 20} ${x} ${y})`} />;
    })}
  </g>
);

export const S11Nature: React.FC<SceneProps> = ({f}) => {
  const pan = ip(f, [80, 100], [0, 1], easeInOut) + ip(f, [170, 190], [0, 1], easeInOut);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="s11-panel">
            <rect x={0} y={0} width={1920} height={1080} />
          </clipPath>
        </defs>
        <g transform={`translate(${-pan * 1920}, 0)`}>
          <g clipPath="url(#s11-panel)">
            <Desert f={f} />
          </g>
          <g transform="translate(1920, 0)">
            <g clipPath="url(#s11-panel)">
              <Mountains f={f} />
            </g>
          </g>
          <g transform="translate(3840, 0)">
            <g clipPath="url(#s11-panel)">
              <Fergana f={f} />
            </g>
          </g>
        </g>
      </svg>
      <Title text="Пески, снежные горы и сады" f={f} start={6} x={110} y={70} size={72} maxWidth={1800} />
      <Pill text="Кызылкум — «красный песок»" x={112} y={205} anchor="left" f={f} start={18} end={86} bg="#A94D2E" size={34} />
      <Pill text="до 4643 м" x={112} y={205} anchor="left" f={f} start={100} end={176} bg={C.azureDeep} size={34} />
      <Pill text="Ферганская долина" x={112} y={205} anchor="left" f={f} start={190} bg="#4A7550" size={34} />
    </AbsoluteFill>
  );
};
