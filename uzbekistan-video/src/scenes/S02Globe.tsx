import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {geoGraticule10, geoInterpolate, geoOrthographic, geoPath} from 'd3-geo';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeInOut, ip, mix} from '../theme';
import {Pill, Title} from '../components';
import {byName, countries, PLACES} from '../geo';

const UZ = byName('Uzbekistan');
const LI = byName('Liechtenstein');
const GRAT = geoGraticule10();

// sea → Pakistan → (border 1) Afghanistan → (border 2) Uzbekistan
const ROUTE: [number, number][] = [
  [66.2, 23.6],
  PLACES.karachi,
  [66.95, 30.2],
  [66.45, 30.93], // Chaman: Pakistan / Afghanistan
  [65.7, 31.62],
  [66.6, 34.5],
  [67.1, 36.7],
  [67.28, 37.22], // Termez: Afghanistan / Uzbekistan
  [66.96, 38.6],
];
const BORDERS = [3, 7];

const segLen = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
const total = segLen.reduce((a, b) => a + b, 0);

const partialRoute = (t: number): [number, number][] => {
  const target = t * total;
  const pts: [number, number][] = [ROUTE[0]];
  let acc = 0;
  for (let i = 0; i < segLen.length; i++) {
    if (acc + segLen[i] <= target) {
      pts.push(ROUTE[i + 1]);
      acc += segLen[i];
    } else {
      const k = (target - acc) / segLen[i];
      pts.push(geoInterpolate(ROUTE[i], ROUTE[i + 1])(k) as [number, number]);
      break;
    }
  }
  return pts;
};
const progressAt = (idx: number) => segLen.slice(0, idx).reduce((a, b) => a + b, 0) / total;

export const S02Globe: React.FC<SceneProps> = ({f}) => {
  // rotation keyframes
  const toEurope = ip(f, [68, 128], [0, 1], easeInOut);
  const back = ip(f, [182, 210], [0, 1], Easing.in(Easing.cubic));
  let lon = mix(mix(67.5, 65, clamp(f / 68)), 9.5, toEurope);
  let lat = mix(mix(22, 30, clamp(f / 68)), 47.2, toEurope);
  lon = mix(lon, 64, back);
  lat = mix(lat, 41, back);
  const radius = mix(mix(1050, 780, toEurope), 2900, back);

  const proj = geoOrthographic()
    .scale(radius)
    .translate([960, 660])
    .rotate([-lon, -lat])
    .clipAngle(90);
  const path = geoPath(proj);

  const lineT = ip(f, [6, 66], [0, 1], Easing.inOut(Easing.quad));
  const line = path({type: 'LineString', coordinates: partialRoute(Math.max(0.001, lineT))}) ?? '';

  const li = proj(PLACES.liechtenstein);
  const liVisible = f >= 132 && f < 186;
  const pulse = (f - 132) / 22;

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="ocean" cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="#DCEBF6" />
            <stop offset="1" stopColor="#A9CBE8" />
          </radialGradient>
        </defs>
        <circle cx={960} cy={660} r={radius + 26} fill={C.turq} opacity={0.08} />
        <path d={path({type: 'Sphere'}) ?? ''} fill="url(#ocean)" />
        <path d={path(GRAT) ?? ''} fill="none" stroke="#fff" strokeWidth={1} opacity={0.5} />
        {countries.map((c, i) => (
          <path key={i} d={path(c) ?? ''} fill="#F2E4C8" stroke="#FFFFFF" strokeWidth={0.8} />
        ))}
        <path d={path(UZ) ?? ''} fill={C.turq} stroke={C.turqDeep} strokeWidth={1.5} />
        <path d={path(LI) ?? ''} fill={C.gold} stroke={C.brick} strokeWidth={2} />
        <path d={line} fill="none" stroke={C.brick} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" />
        {BORDERS.map((idx, k) => {
          const p = proj(ROUTE[idx]);
          const show = lineT >= progressAt(idx);
          if (!p || !show || back > 0.3) return null;
          const s = clamp((f - 6 - progressAt(idx) * 60) / 8);
          return (
            <g key={k} transform={`translate(${p[0]}, ${p[1]}) scale(${s})`}>
              <circle r={26} fill={C.brick} stroke="#fff" strokeWidth={4} />
              <text y={11} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={30} fill="#fff">
                {k + 1}
              </text>
            </g>
          );
        })}
        {liVisible && li ? (
          <g transform={`translate(${li[0]}, ${li[1]})`}>
            {[0, 0.5].map((o) => {
              const ph = (pulse + o) % 1;
              return <circle key={o} r={10 + ph * 70} fill="none" stroke={C.gold} strokeWidth={5} opacity={1 - ph} />;
            })}
            <circle r={9} fill={C.gold} stroke="#fff" strokeWidth={3} />
          </g>
        ) : null}
      </svg>
      {liVisible && li ? <Pill text="Лихтенштейн" x={li[0] + 40} y={li[1] - 70} f={f} start={138} anchor="left" bg={C.gold} color={C.ink} size={36} /> : null}
      {f >= 60 && f < 100 ? (
        <Pill text="Узбекистан" x={(proj([64.5, 41.8]) ?? [0, 0])[0]} y={(proj([64.5, 41.8]) ?? [0, 0])[1]} f={f} start={60} bg={C.turqDeep} size={30} end={100} />
      ) : null}
      <Title text="Таких стран — всего две" f={f} start={8} end={186} x={960} y={70} align="center" size={78} maxWidth={1700} />
    </AbsoluteFill>
  );
};
