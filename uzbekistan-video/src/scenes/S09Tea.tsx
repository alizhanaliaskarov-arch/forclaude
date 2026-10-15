import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, easeInOut, ip} from '../theme';
import {IkatStrip, Pill, Title} from '../components';
import {Piala} from '../illustrations';

const Teapot: React.FC<{tilt: number}> = ({tilt}) => (
  <g transform={`rotate(${tilt})`}>
    {/* spout */}
    <path d="M-150,10 Q-250,-10 -300,-110 L-276,-122 Q-232,-50 -140,-40 Z" fill="#fff" stroke="#1d4f9c" strokeWidth={5} />
    {/* handle */}
    <path d="M150,-60 Q260,-60 250,40 Q240,120 140,110" fill="none" stroke="#1d4f9c" strokeWidth={22} strokeLinecap="round" />
    {/* body */}
    <ellipse cx={0} cy={20} rx={175} ry={140} fill="#fff" stroke="#1d4f9c" strokeWidth={5} />
    {[-90, -30, 30, 90].map((x, i) => (
      <g key={i} transform={`translate(${x}, ${30 + (i % 2) * 30})`}>
        {[0, 1, 2, 3].map((j) => (
          <ellipse key={j} cx={0} cy={-16} rx={10} ry={17} fill="#1d4f9c" transform={`rotate(${j * 90 + 45})`} />
        ))}
        <circle r={7} fill="#fff" />
      </g>
    ))}
    <rect x={-175} y={-40} width={350} height={10} fill="#1d4f9c" />
    {/* lid */}
    <ellipse cx={0} cy={-112} rx={80} ry={22} fill="#fff" stroke="#1d4f9c" strokeWidth={5} />
    <circle cx={0} cy={-140} r={16} fill="#1d4f9c" />
  </g>
);

export const S09Tea: React.FC<SceneProps> = ({f}) => {
  // pour 0→0.5, freeze, guest sips, host refills
  const pour1 = ip(f, [14, 96], [0, 0.5], easeInOut);
  const sip = ip(f, [176, 196], [0, 0.28], easeInOut);
  const pour2 = ip(f, [214, 262], [0, 0.28], easeInOut);
  const level = pour1 - sip + pour2;
  const pouring = (f >= 8 && f < 100) || (f >= 208 && f < 266);
  const tilt = f < 100 ? ip(f, [0, 12], [0, -32]) - ip(f, [92, 104], [0, -32]) : ip(f, [200, 212], [0, -32]) - ip(f, [258, 270], [0, -32]);
  const freeze = f >= 100 && f < 170;
  const q = ip(f, [104, 116], [0, 1], Easing.out(Easing.back(2)));
  const zoom = 1 + (freeze ? ip(f, [100, 168], [0, 0.06]) : f >= 170 ? 0.06 - ip(f, [170, 200], [0, 0.06]) : 0);

  // spout tip (after rotation) roughly at teapot origin + rotated (-300, -110)
  const a = (tilt * Math.PI) / 180;
  const tx = 1180 + (-300 * Math.cos(a) - -110 * Math.sin(a));
  const ty = 330 + (-300 * Math.sin(a) + -110 * Math.cos(a));
  const streamOn = pouring && Math.abs(tilt) > 24;

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="s9-bg" cx="50%" cy="60%" r="70%">
            <stop offset="0" stopColor="#F4FBFA" />
            <stop offset="1" stopColor="#CBE9E5" />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#s9-bg)" />
        <g transform={`translate(960, 600) scale(${zoom}) translate(-960, -600)`} style={{filter: freeze ? `saturate(${1 - ip(f, [100, 110], [0, 0.35])})` : undefined}}>
          {/* table cloth with ikat band */}
          <rect x={0} y={790} width={1920} height={290} fill="#F6EBD6" />
          <IkatStrip x={0} y={830} width={1920} height={90} seed={7} bg={C.azureDeep} />
          {/* stream */}
          {streamOn ? (
            <path
              d={`M${tx},${ty} Q${tx + 10},${ty + 180} 860,${700 - level * 120}`}
              stroke="#B5651D"
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
              opacity={0.95}
            />
          ) : null}
          <Piala cx={860} y={640} r={190} fill={level} id="s9p" />
          {/* a second, empty piala for the host */}
          <Piala cx={430} y={720} r={110} fill={0.45} id="s9p2" />
          <g transform={`translate(1180, 330)`}>
            <Teapot tilt={tilt} />
          </g>
          {/* half-line marker */}
          {freeze ? (
            <g opacity={q}>
              <line x1={1070} y1={640 + 190 * 0.98 - 0.5 * 190 * 0.88} x2={1200} y2={640 + 190 * 0.98 - 0.5 * 190 * 0.88} stroke={C.red} strokeWidth={5} strokeDasharray="12 10" />
              <text x={1214} y={652 + 190 * 0.98 - 0.5 * 190 * 0.88} fontFamily={F.display} fontWeight={800} fontSize={44} fill={C.red}>
                ½
              </text>
            </g>
          ) : null}
        </g>
        {freeze ? (
          <g transform={`translate(1560, 560) scale(${q})`}>
            <circle r={120} fill={C.gold} />
            <text y={56} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={170} fill="#fff">
              ?
            </text>
          </g>
        ) : null}
      </svg>
      <Title text="Почему не до краёв?" f={f} start={22} x={110} y={70} size={84} accent="краёв?" accentColor={C.turqDeep} />
      <Pill text="знак уважения" x={1560} y={560} f={f} start={172} bg={C.turqDeep} size={46} />
      <Pill text="и подливать снова" x={1560} y={660} f={f} start={222} bg={C.gold} color={C.ink} size={34} />
    </AbsoluteFill>
  );
};
