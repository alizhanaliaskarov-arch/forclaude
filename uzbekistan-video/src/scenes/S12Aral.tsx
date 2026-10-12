import React from 'react';
import {AbsoluteFill} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import type {SceneProps} from '../Root';
import {C, F, easeInOut, ip, mix, rnd} from '../theme';
import {Badge, Pill, Title} from '../components';
import {DesertShips} from '../illustrations';
import {ARAL_1960, ARAL_NORTH_NOW, ARAL_WEST_NOW, BARSAKELMES, byName, PLACES, ringPath} from '../geo';

const BOX: [[number, number], [number, number]] = [
  [760, 150],
  [1840, 1030],
];
const proj = geoMercator().fitExtent(BOX, {type: 'MultiPoint', coordinates: [[57.4, 43.1], [62.4, 47.1]]});
const path = geoPath(proj);
const P = (p: [number, number]) => proj(p) as [number, number];
const KZ = path(byName('Kazakhstan')) ?? '';
const UZ = path(byName('Uzbekistan')) ?? '';
const SEA60 = ringPath(ARAL_1960, P);
const NORTH = ringPath(ARAL_NORTH_NOW, P);
const WEST = ringPath(ARAL_WEST_NOW, P);
const MUY = P(PLACES.muynak);
const ISLAND = ringPath(BARSAKELMES, P);

const MapLayer: React.FC<{now: boolean}> = ({now}) => (
  <g>
    <rect x={BOX[0][0]} y={BOX[0][1]} width={BOX[1][0] - BOX[0][0]} height={BOX[1][1] - BOX[0][1]} fill="#E9DCC0" />
    <path d={KZ} fill="#EADFC6" stroke="#B59A6A" strokeWidth={2} />
    <path d={UZ} fill="#F0E2C2" stroke="#B59A6A" strokeWidth={2} />
    {now ? (
      <g>
        <path d={SEA60} fill="#F4EEE2" stroke="#C9B48A" strokeWidth={3} strokeDasharray="10 8" />
        {Array.from({length: 60}).map((_, i) => (
          <circle key={i} cx={MUY[0] + 60 + rnd(i) * 420} cy={MUY[1] - 520 + rnd(i + 3) * 560} r={2 + rnd(i + 7) * 3} fill="#fff" opacity={0.7} />
        ))}
        <path d={NORTH} fill="#5E97CF" stroke={C.azureDeep} strokeWidth={3} />
        <path d={WEST} fill="#5E97CF" stroke={C.azureDeep} strokeWidth={3} />
      </g>
    ) : (
      <g>
        <path d={SEA60} fill="#5E97CF" stroke={C.azureDeep} strokeWidth={3} />
        <path d={ISLAND} fill="#F0E2C2" stroke={C.azureDeep} strokeWidth={2} />
      </g>
    )}
    <text x={BOX[1][0] - 24} y={BOX[1][1] - 20} textAnchor="end" fontFamily={F.body} fontWeight={700} fontSize={22} fill="#8A7550">
      схема
    </text>
    {/* Muynak */}
    <circle cx={MUY[0]} cy={MUY[1]} r={12} fill={C.brick} stroke="#fff" strokeWidth={4} />
    <text x={MUY[0] - 20} y={MUY[1] + 50} textAnchor="end" fontFamily={F.body} fontWeight={800} fontSize={30} fill={C.ink}>
      Муйнак
    </text>
    <text x={P([60.2, 47.0])[0]} y={P([60.2, 47.0])[1] + 10} fontFamily={F.body} fontWeight={700} fontSize={26} fill="#8A7550">
      Казахстан
    </text>
    <text x={P([60.6, 43.3])[0]} y={P([60.6, 43.3])[1]} fontFamily={F.body} fontWeight={700} fontSize={26} fill="#8A7550">
      Узбекистан
    </text>
  </g>
);

export const S12Aral: React.FC<SceneProps> = ({f}) => {
  const zoom = ip(f, [0, 160], [1.0, 1.14], easeInOut);
  const mapIn = ip(f, [146, 164], [0, 1]);
  const slider = ip(f, [258, 360], [0, 1], easeInOut);
  const sx = mix(BOX[0][0], BOX[1][0], slider);
  const black = ip(f, [426, 450], [0, 1]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {f < 166 ? <DesertShips f={f * 1.6} cool zoom={zoom} /> : null}
      {f >= 146 ? (
        <AbsoluteFill style={{opacity: mapIn, background: C.paper}}>
          <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
            <defs>
              <clipPath id="s12-now">
                <rect x={0} y={0} width={sx} height={1080} />
              </clipPath>
              <clipPath id="s12-box">
                <rect x={BOX[0][0]} y={BOX[0][1]} width={BOX[1][0] - BOX[0][0]} height={BOX[1][1] - BOX[0][1]} rx={24} />
              </clipPath>
            </defs>
            <g clipPath="url(#s12-box)">
              <MapLayer now={false} />
              <g clipPath="url(#s12-now)">
                <MapLayer now />
              </g>
            </g>
            {slider > 0 && slider < 1 ? (
              <g>
                <line x1={sx} y1={BOX[0][1]} x2={sx} y2={BOX[1][1]} stroke="#fff" strokeWidth={6} />
                <circle cx={sx} cy={(BOX[0][1] + BOX[1][1]) / 2} r={30} fill="#fff" stroke={C.ink} strokeWidth={3} />
                <path d={`M${sx - 12},${590} l-10,0 M${sx + 12},590 l10,0`} stroke={C.ink} strokeWidth={4} />
              </g>
            ) : null}
          </svg>
          <Pill text="1960" x={BOX[1][0] - 30} y={BOX[0][1] + 44} anchor="right" f={f} start={170} end={350} bg={C.azureDeep} size={32} />
          {slider > 0.02 ? <Pill text="сегодня" x={BOX[0][0] + 30} y={BOX[0][1] + 44} anchor="left" f={f} start={262} bg={C.brick} size={32} /> : null}
          <Badge big="№4" small="озеро мира в 1960-х" x={390} y={480} f={f} start={156} end={258} bg={C.azure} bigSize={96} />
          <Badge big="−90%" small="площади моря" x={390} y={480} f={f} start={364} bg={C.brick} bigSize={110} />
        </AbsoluteFill>
      ) : null}
      <Title text="Здесь было море" f={f} start={22} x={110} y={70} size={84} color={f >= 160 ? C.ink : C.ink} />
      {black > 0 ? <AbsoluteFill style={{background: '#000', opacity: black}} /> : null}
    </AbsoluteFill>
  );
};
