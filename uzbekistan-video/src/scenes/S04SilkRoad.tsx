import React from 'react';
import {AbsoluteFill} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeOutBack, ip} from '../theme';
import {Badge, Parchment, Pill, Title} from '../components';
import {Camel, Dome, Minaret, Portal} from '../illustrations';
import {byName, countries, PLACES} from '../geo';

const proj = geoMercator().fitExtent(
  [
    [40, 150],
    [1880, 1060],
  ],
  {type: 'MultiPoint', coordinates: [[49, 35.5], [79, 46.5]]},
);
const path = geoPath(proj);
const LAND = countries.map((c) => path(c) ?? '');
const UZ = path(byName('Uzbekistan')) ?? '';
const P = (lonlat: [number, number]) => proj(lonlat) as [number, number];

// east → west: from China towards Europe
const ROUTE: [number, number][] = [
  P([82, 40.2]),
  P(PLACES.kashgar),
  P([72.8, 40.5]),
  P([69.6, 40.2]),
  P(PLACES.samarkand),
  P(PLACES.bukhara),
  P([62.2, 40.3]),
  P(PLACES.khiva),
  P([56.5, 42.2]),
  P([52.4, 41.6]),
  P([46.0, 42.6]),
];
const SEG = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
const TOTAL_LEN = SEG.reduce((a, b) => a + b, 0);
const pointAt = (len: number): [number, number, number] => {
  let acc = 0;
  for (let i = 0; i < SEG.length; i++) {
    if (acc + SEG[i] >= len) {
      const k = (len - acc) / SEG[i];
      const [x0, y0] = ROUTE[i];
      const [x1, y1] = ROUTE[i + 1];
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, Math.atan2(y1 - y0, x1 - x0)];
    }
    acc += SEG[i];
  }
  const l = ROUTE[ROUTE.length - 1];
  return [l[0], l[1], Math.PI];
};
const lenAtIndex = (idx: number) => SEG.slice(0, idx).reduce((a, b) => a + b, 0);

type City = {name: string; idx: number; at: [number, number]; dx: number; dy: number; art: 'sam' | 'bux' | 'khi'};
const CITIES: City[] = [
  {name: 'Самарканд', idx: 4, at: P(PLACES.samarkand), dx: 150, dy: -250, art: 'sam'},
  {name: 'Бухара', idx: 5, at: P(PLACES.bukhara), dx: -130, dy: -250, art: 'bux'},
  {name: 'Хива', idx: 7, at: P(PLACES.khiva), dx: -130, dy: -250, art: 'khi'},
];

const Medallion: React.FC<{art: City['art']; r: number}> = ({art, r}) => {
  const id = `med-${art}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <circle r={r} />
        </clipPath>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art === 'khi' ? '#BFE0F2' : '#F7D58E'} />
          <stop offset="1" stopColor={art === 'khi' ? '#F3E7CC' : '#FBEFD3'} />
        </linearGradient>
      </defs>
      <circle r={r + 10} fill="#fff" />
      <circle r={r + 10} fill="none" stroke={C.gold} strokeWidth={4} />
      <g clipPath={`url(#${id})`}>
        <rect x={-r} y={-r} width={2 * r} height={2 * r} fill={`url(#${id}-sky)`} />
        {art === 'sam' ? (
          <g transform={`translate(0, ${r * 0.62}) scale(${r / 300})`}>
            <Dome cx={0} y={-300} r={110} />
            <Portal cx={0} y={0} w={260} h={300} />
            <Minaret cx={-210} y={0} h={360} w={48} />
            <Minaret cx={210} y={0} h={360} w={48} />
          </g>
        ) : null}
        {art === 'bux' ? (
          <g transform={`translate(0, ${r * 0.7}) scale(${r / 300})`}>
            <Dome cx={150} y={-120} r={100} />
            <rect x={-260} y={-150} width={520} height={150} fill="#E3BC86" />
            <Minaret cx={-60} y={0} h={520} w={86} tone="#D9A866" cap="#D9A866" />
          </g>
        ) : null}
        {art === 'khi' ? (
          <g transform={`translate(0, ${r * 0.72}) scale(${r / 300})`}>
            {/* Kalta Minor: squat, fully tiled */}
            <path d="M-170,0 L-150,-300 L50,-300 L70,0 Z" fill={C.turq} />
            {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((k) => (
              <rect key={k} x={-165 + k * 14} y={-300 * k - 12} width={230 - k * 28} height={22} fill={k % 0.3 < 0.01 ? C.azure : '#2E9C6A'} />
            ))}
            <Minaret cx={180} y={0} h={520} w={60} tone="#E3BC86" />
            <rect x={-300} y={-110} width={600} height={110} fill="#D2A06A" />
            {Array.from({length: 12}).map((_, i) => (
              <rect key={i} x={-300 + i * 52} y={-130} width={30} height={24} fill="#D2A06A" />
            ))}
          </g>
        ) : null}
      </g>
    </g>
  );
};

export const S04SilkRoad: React.FC<SceneProps> = ({f}) => {
  const len = ip(f, [6, 250], [0, TOTAL_LEN], (t) => t);
  // partial route path
  let acc = 0;
  const pts: [number, number][] = [ROUTE[0]];
  for (let i = 0; i < SEG.length; i++) {
    if (acc + SEG[i] <= len) {
      pts.push(ROUTE[i + 1]);
      acc += SEG[i];
    } else {
      const [x, y] = pointAt(len);
      pts.push([x, y]);
      break;
    }
  }
  const d = `M${pts.map((p) => p.join(',')).join('L')}`;
  const head = pointAt(len);
  const final = f >= 258;
  const samScale = ip(f, [262, 290], [1, 1.35], easeOutBack);

  return (
    <AbsoluteFill>
      <Parchment id="s4" />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="s4-ink">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={3} />
          </filter>
        </defs>
        <g filter="url(#s4-ink)">
          {LAND.map((p, i) => (
            <path key={i} d={p} fill="#E9D3A2" stroke="#8B5E34" strokeWidth={1.6} strokeOpacity={0.55} />
          ))}
          <path d={UZ} fill="#D9B97A" fillOpacity={0.55} stroke="#7A4A22" strokeWidth={2.4} />
        </g>
        {/* compass rose */}
        <g transform="translate(1720, 930)" opacity={0.6}>
          <circle r={70} fill="none" stroke="#7A4A22" strokeWidth={2} />
          <path d="M0,-90 L14,0 L0,90 L-14,0 Z" fill="#7A4A22" />
          <path d="M-90,0 L0,14 L90,0 L0,-14 Z" fill="#A8743F" />
        </g>
        {/* route */}
        <path d={d} fill="none" stroke="#7A2E14" strokeWidth={6} strokeDasharray="18 12" strokeLinecap="round" />
        {CITIES.map((c) => {
          const reached = len >= lenAtIndex(c.idx) - 2;
          return (
            <circle key={c.name} cx={c.at[0]} cy={c.at[1]} r={reached ? 13 : 0} fill={C.brick} stroke="#fff" strokeWidth={4} />
          );
        })}
        {/* caravan */}
        {!final || f < 300
          ? [0, 1, 2].map((k) => {
              const p = pointAt(Math.max(0, len - k * 64));
              return <Camel key={k} x={p[0]} y={p[1] - 4} s={0.62} step={f * 0.5 + k} color="#4E2E16" flip />;
            })
          : null}
        {/* medallions */}
        {CITIES.map((c) => {
          const t0 = 6 + (lenAtIndex(c.idx) / TOTAL_LEN) * 244;
          const s = f < t0 ? 0 : easeOutBack(clamp((f - t0) / 14));
          const mx = c.at[0] + c.dx;
          const my = c.at[1] + c.dy;
          const extra = c.art === 'sam' ? samScale : 1;
          return (
            <g key={c.name}>
              <line x1={c.at[0]} y1={c.at[1]} x2={mx} y2={my} stroke="#7A4A22" strokeWidth={3} opacity={s} strokeDasharray="4 6" />
              <g transform={`translate(${mx}, ${my}) scale(${s * extra})`}>
                <Medallion art={c.art} r={105} />
              </g>
            </g>
          );
        })}
        {/* arrows: from China / to Europe */}
        <text x={1830} y={330} textAnchor="end" fontFamily={F.body} fontWeight={800} fontSize={30} fill="#7A4A22" opacity={ip(f, [4, 16], [0, 1]) * (1 - ip(f, [250, 262], [0, 1]))}>
          ← из Китая
        </text>
        <text x={90} y={520} fontFamily={F.body} fontWeight={800} fontSize={30} fill="#7A4A22" opacity={ip(f, [236, 250], [0, 1])}>
          в Европу ←
        </text>
      </svg>
      {CITIES.map((c) => {
        const t0 = 6 + (lenAtIndex(c.idx) / TOTAL_LEN) * 244;
        const extra = c.art === 'sam' ? samScale : 1;
        return (
          <Pill key={c.name} text={c.name} x={c.at[0] + c.dx} y={c.at[1] + c.dy + 140 * extra} f={f} start={t0 + 6} bg="#5B3216" size={30} />
        );
      })}
      <Badge big="3000+" small="лет Самарканду" x={1660} y={300} f={f} start={276} bg={C.turqDeep} bigSize={72} />
      <Badge big="≈2780" small="лет Риму" x={1660} y={520} f={f} start={292} bg={C.ochre} bigSize={72} />
      <Title text="Великий шёлковый путь" f={f} start={4} end={258} x={110} y={70} size={70} color="#4A2A12" />
      <Title text="Самарканд старше Рима" f={f} start={262} x={110} y={70} size={78} color="#4A2A12" accent="старше" accentColor={C.turqDeep} />
    </AbsoluteFill>
  );
};
