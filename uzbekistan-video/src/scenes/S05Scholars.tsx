import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeInOut, easeOutBack, ip, mix, rnd} from '../theme';
import {Badge, Pill, Stars, Title} from '../components';

const WORD = 'алгоритм';

const Phone: React.FC<{f: number}> = ({f}) => {
  const scroll = ip(f, [0, 44], [0, 520], easeInOut);
  const typed = WORD.slice(0, clamp(Math.floor((f - 46) / 4), 0, WORD.length));
  const cursor = Math.floor(f / 8) % 2 === 0;
  const cards = [C.turq, C.gold, C.azure, C.ochre, C.turqDeep, C.brick, C.azureLight];
  return (
    <g>
      <rect x={-230} y={-440} width={460} height={880} rx={64} fill={C.ink} />
      <rect x={-206} y={-416} width={412} height={832} rx={46} fill="#fff" />
      <defs>
        <clipPath id="ph-screen">
          <rect x={-206} y={-416} width={412} height={832} rx={46} />
        </clipPath>
      </defs>
      <g clipPath="url(#ph-screen)">
        <g transform={`translate(0, ${-scroll})`}>
          {cards.map((col, i) => (
            <g key={i} transform={`translate(0, ${-250 + i * 250})`}>
              <rect x={-180} y={0} width={360} height={170} rx={20} fill={col} opacity={0.85} />
              <circle cx={-130} cy={210} r={18} fill="#E3E6EA" />
              <rect x={-100} y={198} width={200} height={12} rx={6} fill="#E3E6EA" />
              <rect x={-100} y={218} width={130} height={10} rx={5} fill="#EEF0F2" />
            </g>
          ))}
        </g>
        {/* search bar */}
        <g opacity={ip(f, [36, 44], [0, 1])}>
          <rect x={-206} y={-416} width={412} height={150} fill="#fff" />
          <rect x={-180} y={-350} width={360} height={70} rx={35} fill="#F1F3F5" stroke={C.turq} strokeWidth={3} />
          <circle cx={-142} cy={-317} r={14} fill="none" stroke={C.inkSoft} strokeWidth={4} />
          <line x1={-132} y1={-307} x2={-122} y2={-297} stroke={C.inkSoft} strokeWidth={4} strokeLinecap="round" />
          <text x={-108} y={-304} fontFamily={F.body} fontWeight={700} fontSize={36} fill={C.ink}>
            {typed}
            {cursor && f > 40 ? '|' : ''}
          </text>
        </g>
      </g>
      <rect x={-60} y={-404} width={120} height={22} rx={11} fill={C.ink} />
    </g>
  );
};

const Scholar: React.FC<{r: number}> = ({r}) => (
  <g>
    <defs>
      <clipPath id="sch">
        <circle r={r} />
      </clipPath>
    </defs>
    <circle r={r + 12} fill={C.gold} />
    <circle r={r} fill="#EAD7AE" />
    <g clipPath="url(#sch)">
      {/* body */}
      <path d={`M${-r * 0.9},${r} Q${-r * 0.8},${r * 0.3} 0,${r * 0.25} Q${r * 0.8},${r * 0.3} ${r * 0.9},${r} Z`} fill={C.azureDeep} />
      <path d={`M${-r * 0.2},${r * 0.28} L0,${r} L${r * 0.2},${r * 0.28} Z`} fill={C.turq} />
      {/* face */}
      <ellipse cx={0} cy={-r * 0.08} rx={r * 0.3} ry={r * 0.36} fill="#C98E5C" />
      {/* beard */}
      <path d={`M${-r * 0.3},${-r * 0.05} Q${-r * 0.28},${r * 0.42} 0,${r * 0.5} Q${r * 0.28},${r * 0.42} ${r * 0.3},${-r * 0.05} Q0,${r * 0.12} ${-r * 0.3},${-r * 0.05} Z`} fill="#3B2A20" />
      {/* turban */}
      <ellipse cx={0} cy={-r * 0.42} rx={r * 0.42} ry={r * 0.26} fill="#F7F3EA" />
      <path d={`M${-r * 0.4},${-r * 0.4} Q0,${-r * 0.2} ${r * 0.4},${-r * 0.4}`} stroke="#D8CFBF" strokeWidth={r * 0.05} fill="none" />
      <path d={`M${-r * 0.36},${-r * 0.52} Q0,${-r * 0.34} ${r * 0.38},${-r * 0.5}`} stroke="#D8CFBF" strokeWidth={r * 0.04} fill="none" />
    </g>
  </g>
);

const Book: React.FC<{f: number}> = ({f}) => {
  const open = ip(f, [0, 20], [0.2, 1], easeOutBack);
  return (
    <g>
      <ellipse cx={0} cy={250} rx={560} ry={40} fill="#000" opacity={0.12} />
      <g transform={`scale(${open}, 1)`}>
        <path d="M0,-260 Q-260,-300 -520,-250 L-520,240 Q-260,200 0,240 Z" fill="#FFF8EA" stroke="#C9A46A" strokeWidth={4} />
        <path d="M0,-260 Q260,-300 520,-250 L520,240 Q260,200 0,240 Z" fill="#FFF8EA" stroke="#C9A46A" strokeWidth={4} />
        <rect x={-6} y={-262} width={12} height={505} fill="#C9A46A" />
        {/* left page: herb drawing */}
        <g transform="translate(-270, 10)">
          <path d="M0,170 Q-10,40 10,-150" stroke={C.turqDeep} strokeWidth={6} fill="none" />
          {[-110, -60, -10, 40, 90].map((y, i) => (
            <g key={y}>
              <ellipse cx={i % 2 ? 40 : -36} cy={y} rx={42} ry={16} fill={C.turq} transform={`rotate(${i % 2 ? -30 : 30} ${i % 2 ? 40 : -36} ${y})`} />
            </g>
          ))}
          <circle cx={10} cy={-160} r={24} fill={C.ochre} />
          <circle cx={10} cy={-160} r={10} fill={C.gold} />
        </g>
        {/* right page: text lines */}
        {Array.from({length: 11}).map((_, i) => (
          <rect key={i} x={70} y={-200 + i * 38} width={380 - (i % 3) * 50} height={10} rx={5} fill="#B8A88A" opacity={0.7} />
        ))}
        <rect x={70} y={-236} width={160} height={18} rx={6} fill={C.brick} opacity={0.7} />
      </g>
      <path d="M40,-262 L40,-120 L60,-140 L80,-120 L80,-262 Z" fill={C.red} opacity={open > 0.9 ? 1 : 0} />
    </g>
  );
};

export const S05Scholars: React.FC<SceneProps> = ({f}) => {
  // phases
  const phoneOut = ip(f, [100, 122], [0, 1], Easing.in(Easing.cubic));
  const night = ip(f, [296, 318], [0, 1], easeInOut);
  const chainOut = ip(f, [206, 222], [0, 1], Easing.in(Easing.cubic));
  const bookIn = f >= 214 && f < 306;
  const bookOut = ip(f, [292, 306], [0, 1]);

  // typed word flies from the phone search bar to the bottom of the chain
  const fly = ip(f, [104, 132], [0, 1], easeInOut);
  const wordX = mix(960 + (-108 + 70) * 0.9, 1250, fly);
  const wordY = mix(610 - 304 * 0.9, 770, fly);
  const wordSize = mix(32, 96, fly);

  const bg = night > 0 ? `rgb(${mix(251, 15, night)}, ${mix(248, 27, night)}, ${mix(242, 51, night)})` : C.paper;

  return (
    <AbsoluteFill style={{background: bg}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {/* phone */}
        {f < 124 ? (
          <g transform={`translate(${960 - phoneOut * 700}, ${610}) scale(${0.9 - phoneOut * 0.3})`} opacity={1 - phoneOut}>
            <Phone f={f} />
          </g>
        ) : null}
        {/* al-Khwarizmi */}
        {f >= 118 && f < 224 ? (
          <g opacity={1 - chainOut} transform={`translate(0, ${-chainOut * 80})`}>
            <g transform={`translate(520, 560) scale(${easeOutBack(clamp((f - 120) / 16))})`}>
              <Scholar r={210} />
            </g>
            <text
              x={1250}
              y={360}
              textAnchor="middle"
              fontFamily={F.display}
              fontWeight={800}
              fontSize={92}
              fill={C.gold}
              opacity={ip(f, [136, 148], [0, 1])}
            >
              аль-Хорезми
            </text>
            <path d="M1250,400 L1250,470 M1232,452 L1250,474 L1268,452" stroke={C.inkSoft} strokeWidth={5} fill="none" opacity={ip(f, [146, 154], [0, 1])} />
            <text
              x={1250}
              y={560}
              textAnchor="middle"
              fontFamily={F.body}
              fontWeight={700}
              fontStyle="italic"
              fontSize={64}
              fill={C.inkSoft}
              opacity={ip(f, [150, 162], [0, 1])}
            >
              Algoritmi
            </text>
            <path d="M1250,600 L1250,670 M1232,652 L1250,674 L1268,652" stroke={C.inkSoft} strokeWidth={5} fill="none" opacity={ip(f, [160, 168], [0, 1])} />
          </g>
        ) : null}
        {f >= 104 && f < 224 ? (
          <text
            x={wordX}
            y={wordY}
            textAnchor={fly > 0.5 ? 'middle' : 'start'}
            fontFamily={fly > 0.5 ? F.display : F.body}
            fontWeight={800}
            fontSize={wordSize}
            fill={fly > 0.5 ? C.turq : C.ink}
            opacity={1 - chainOut}
          >
            {WORD}
          </text>
        ) : null}
        {/* Ibn Sina */}
        {bookIn ? (
          <g transform={`translate(960, ${560 - bookOut * 60})`} opacity={1 - bookOut}>
            <Book f={f - 214} />
          </g>
        ) : null}
        {/* Ulugbek: star trails + observatory */}
        {night > 0 ? (
          <g opacity={night}>
            <Stars f={f} rot={(f - 296) * 0.12} cx={1500} cy={260} n={260} seed={5} />
            {/* trails */}
            {Array.from({length: 40}).map((_, i) => {
              const rr = 80 + rnd(i) * 900;
              const a0 = rnd(i + 3) * 360;
              const a1 = a0 + (f - 296) * 0.35;
              const p = (a: number) => [1500 + Math.cos((a * Math.PI) / 180) * rr, 260 + Math.sin((a * Math.PI) / 180) * rr];
              const [x0, y0] = p(a0);
              const [x1, y1] = p(a1);
              return (
                <path key={i} d={`M${x0},${y0} A${rr},${rr} 0 0 1 ${x1},${y1}`} stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.35} />
              );
            })}
            {/* observatory drum */}
            <g transform="translate(700, 1080)">
              <ellipse cx={0} cy={-330} rx={430} ry={70} fill="#2B3A5C" />
              <rect x={-430} y={-330} width={860} height={330} fill="#22304E" />
              {Array.from({length: 9}).map((_, i) => (
                <path
                  key={i}
                  d={`M${-380 + i * 90},-60 L${-380 + i * 90},-200 Q${-350 + i * 90},-250 ${-320 + i * 90},-200 L${-320 + i * 90},-60 Z`}
                  fill="#121C33"
                />
              ))}
              <rect x={-430} y={-330} width={860} height={22} fill={C.turqDeep} />
              {/* meridian arc (the sextant) */}
              <path d="M-120,0 A520,520 0 0 1 400,-520" stroke={C.gold} strokeWidth={34} fill="none" />
              <path d="M-120,0 A520,520 0 0 1 400,-520" stroke="#F6E2A6" strokeWidth={6} fill="none" strokeDasharray="2 22" />
            </g>
          </g>
        ) : null}
      </svg>
      <Title text="Слово «алгоритм» — родом отсюда" f={f} start={10} end={214} x={110} y={60} size={66} maxWidth={1700} accent="«алгоритм»" />
      <Pill text="Ибн Сина" x={960} y={170} f={f} start={226} end={304} bg={C.brick} size={40} />
      <Pill text="Улугбек · 1437" x={330} y={170} f={f} start={318} bg={C.gold} color={C.ink} size={40} />
      <Badge big="≈1 мин" small="ошибка в длине года" x={1470} y={640} f={f} start={372} bg={C.turqDeep} bigSize={88} />
    </AbsoluteFill>
  );
};
