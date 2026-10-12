import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import type {SceneProps} from '../Root';
import {C, F, clamp, ip} from '../theme';
import {Pill, Title} from '../components';
import {byName, countries, NEIGHBOURS, PLACES} from '../geo';

const UZ = byName('Uzbekistan');
const proj = geoMercator().fitExtent(
  [
    [640, 170],
    [1880, 1010],
  ],
  {
    type: 'MultiPoint',
    coordinates: [
      [53, 35],
      [77, 46.5],
    ],
  },
);
const path = geoPath(proj);
const LAND = countries.map((c) => path(c) ?? '');
const UZP = path(UZ) ?? '';
const NB = NEIGHBOURS.map(([n]) => path(byName(n)) ?? '');
const LABEL_AT: [number, number][] = [
  [66.5, 45.6],
  [74.6, 41.75],
  [71.4, 38.75],
  [64.6, 35.9],
  [58.6, 39.2],
];

export const S03Numbers: React.FC<SceneProps> = ({f}) => {
  const zoom = ip(f, [0, 24], [1.35, 1], Easing.out(Easing.cubic));
  const tash = proj(PLACES.tashkent) as [number, number];
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <rect width={1920} height={1080} fill="#DCEBF6" />
        <g transform={`translate(${tash[0]}, ${tash[1]}) scale(${zoom}) translate(${-tash[0]}, ${-tash[1]})`}>
          {LAND.map((d, i) => (
            <path key={i} d={d} fill="#F2E4C8" stroke="#fff" strokeWidth={1.4} />
          ))}
          {NB.map((d, i) => {
            const t = clamp((f - (140 + i * 16)) / 10);
            return (
              <path key={i} d={d} fill={C.goldLight} fillOpacity={t * 0.55} stroke={C.gold} strokeWidth={t * 5} strokeLinejoin="round" />
            );
          })}
          <path d={UZP} fill={C.turq} stroke={C.turqDeep} strokeWidth={3} />
          {/* Tashkent */}
          <circle cx={tash[0]} cy={tash[1]} r={10 + ((f % 30) / 30) * 26} fill="none" stroke={C.azureDeep} strokeWidth={4} opacity={1 - (f % 30) / 30} />
          <circle cx={tash[0]} cy={tash[1]} r={11} fill={C.azureDeep} stroke="#fff" strokeWidth={4} />
        </g>
        {/* left white panel so the headline reads on a clean ground */}
        <rect x={0} y={0} width={700} height={1080} fill={C.paper} opacity={0.94} />
        <path d="M700,0 L760,0 L700,1080 Z" fill={C.paper} opacity={0.94} />
      </svg>
      <Pill text="Ташкент · столица" x={tash[0] - 26} y={tash[1] - 46} f={f} start={70} anchor="right" bg={C.azureDeep} size={30} />
      {NEIGHBOURS.map(([, ru], i) => {
        const p = proj(LABEL_AT[i]) as [number, number];
        return (
          <Pill
            key={ru}
            text={
              <span>
                {ru}
                <span style={{color: C.gold}}>стан</span>
              </span>
            }
            x={p[0]}
            y={p[1]}
            f={f}
            start={142 + i * 16}
            bg={C.ink}
            size={30}
          />
        );
      })}
      <Title text="38 млн человек" f={f} start={6} x={110} y={250} size={84} maxWidth={560} />
      <Title text="5 соседей" f={f} start={136} x={110} y={450} size={84} maxWidth={560} color={C.gold} />
      <div
        style={{
          position: 'absolute',
          left: 112,
          top: 680,
          width: 520,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 30,
          lineHeight: 1.4,
          color: C.inkSoft,
          opacity: ip(f, [30, 44], [0, 1]),
        }}
      >
        38,2 млн — население
        <br />
        на 1 января 2026 года
      </div>
    </AbsoluteFill>
  );
};
