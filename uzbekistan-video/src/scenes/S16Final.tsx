import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, easeInOut, ip} from '../theme';
import {IkatStrip, Sun, Title} from '../components';
import {Piala} from '../illustrations';

const Chaikhana: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="s16-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3E5E9E" />
        <stop offset="0.5" stopColor="#E98F6A" />
        <stop offset="1" stopColor="#F9CF8E" />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#s16-sky)" />
    <Sun cx={960} cy={640 + f * 0.25} r={170} color="#FFE3A6" glow="#FFB870" />
    {/* arcade silhouette */}
    <rect x={0} y={700} width={1920} height={380} fill="#3B2418" />
    {Array.from({length: 9}).map((_, i) => {
      const x = i * 240 - 40;
      return (
        <g key={i}>
          <rect x={x} y={380} width={40} height={340} fill="#3B2418" />
          <path d={`M${x + 40},500 Q${x + 140},380 ${x + 240},500 L${x + 240},380 L${x + 40},380 Z`} fill="#3B2418" />
        </g>
      );
    })}
    <rect x={0} y={340} width={1920} height={50} fill="#3B2418" />
    {/* topchan with carpet */}
    <rect x={300} y={760} width={1320} height={40} fill="#5A3622" />
    <rect x={340} y={720} width={1240} height={44} fill="#9C2B33" />
    <rect x={340} y={728} width={1240} height={8} fill={C.gold} />
    {/* lanterns */}
    {[420, 960, 1500].map((x, i) => (
      <g key={x}>
        <line x1={x} y1={390} x2={x} y2={450} stroke="#2A170F" strokeWidth={3} />
        <circle cx={x} cy={470} r={60} fill="#FFD27A" opacity={0.25 + 0.08 * Math.sin(f * 0.2 + i)} />
        <ellipse cx={x} cy={470} rx={18} ry={24} fill="#FFCF6B" />
      </g>
    ))}
  </g>
);

export const S16Final: React.FC<SceneProps> = ({f}) => {
  const grow = ip(f, [0, 170], [0.8, 1.15], easeInOut);
  const white = ip(f, [176, 192], [0, 1], Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <Chaikhana f={f} />
        {/* hands offering the piala */}
        <g transform={`translate(960, 760) scale(${grow}) translate(-960, -760)`}>
          {[1, -1].map((side) => (
            <g key={side} transform={`translate(960, 0) scale(${side}, 1) translate(-960, 0)`}>
              {/* forearm in an azure sleeve with an ikat cuff */}
              <path d="M560,1100 L700,1100 L900,900 L820,830 Z" fill="#B97A4C" />
              <path d="M520,1100 L700,1100 L800,1000 L700,930 Z" fill={C.azure} />
              <path d="M700,930 L800,1000 L770,1030 L668,962 Z" fill={C.gold} />
              <path d="M690,945 L790,1012 M680,955 L782,1021" stroke={C.turqDeep} strokeWidth={5} strokeDasharray="10 8" />
              {/* palm cupping the bowl */}
              <ellipse cx={860} cy={880} rx={120} ry={62} fill="#C48A5A" transform="rotate(-24 860 880)" />
            </g>
          ))}
          <Piala cx={960} y={700} r={190} fill={0.5} id="s16p" />
          {[1, -1].map((side) => (
            <g key={side} transform={`translate(960, 0) scale(${side}, 1) translate(-960, 0)`}>
              {/* thumbs over the rim */}
              <path d="M790,860 Q770,790 812,770 Q836,780 832,820 Z" fill="#C48A5A" />
            </g>
          ))}
          {/* steam */}
          {Array.from({length: 5}).map((_, i) => {
            const life = ((f * 0.8 + i * 18) % 90) / 90;
            return (
              <path
                key={i}
                d={`M${900 + i * 30},${680 - life * 200} q20,-30 0,-60 q-20,-30 0,-60`}
                stroke="#fff"
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                opacity={(1 - life) * 0.55}
              />
            );
          })}
        </g>
        {white > 0 ? (
          <g opacity={white}>
            <rect width={1920} height={1080} fill={C.paper} />
            <IkatStrip x={0} y={760} width={1920} height={110} seed={31} bg={C.azureDeep} />
          </g>
        ) : null}
      </svg>
      <Title text="До сердца — одна пиала чая" f={f} start={96} end={180} x={960} y={110} align="center" size={86} color="#fff" shadow maxWidth={1800} accent="одна пиала" accentColor={C.goldLight} />
      {white > 0 ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: 330,
              width: '100%',
              textAlign: 'center',
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 150,
              letterSpacing: -3,
              color: C.azure,
              opacity: white,
              transform: `translateY(${(1 - ip(f, [180, 200], [0, 1])) * 30}px)`,
            }}
          >
            Узбекистан
          </div>
          <div
            style={{
              position: 'absolute',
              top: 560,
              width: '100%',
              textAlign: 'center',
              fontFamily: F.body,
              fontWeight: 800,
              fontSize: 56,
              color: C.ochre,
              opacity: ip(f, [190, 206], [0, 1]),
            }}
          >
            Приезжайте.
          </div>
          <div
            style={{
              position: 'absolute',
              top: 892,
              width: '100%',
              textAlign: 'center',
              fontFamily: F.body,
              fontWeight: 500,
              fontSize: 22,
              color: C.inkSoft,
              opacity: ip(f, [196, 210], [0, 0.85]),
            }}
          >
            Озвучка: RHVoice «Александр» (диктор Александр Карлов), CC BY-SA 4.0 · Карты: Natural Earth · Музыка: оригинальная
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
