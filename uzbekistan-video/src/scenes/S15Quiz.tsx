import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeOutBack, ip} from '../theme';
import {IkatStrip} from '../components';

const QS: [string, string][] = [
  ['Откуда слово «алгоритм»?', 'аль-Хорезми'],
  ['Почему чая — полпиалы?', 'из уважения'],
  ['Вторая страна без моря дважды?', 'Лихтенштейн'],
];
const Q0 = 62;
const QLEN = 98;
const THINK = 78;

export const S15Quiz: React.FC<SceneProps> = ({f}) => {
  const pauseOut = ip(f, [54, 64], [0, 1]);
  const qi = clamp(Math.floor((f - Q0) / QLEN), 0, 2);
  const t = f - Q0 - qi * QLEN;
  const inQ = f >= Q0;
  const qIn = ip(t, [0, 10], [0, 1], Easing.out(Easing.cubic));
  const ring = clamp(t / THINK);
  const ans = t >= THINK;
  const ansS = easeOutBack(clamp((t - THINK) / 10));
  const R = 70;
  const circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{background: C.azureDeep}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <IkatStrip x={0} y={0} width={1920} height={70} seed={21} bg={C.turqDeep} />
        <IkatStrip x={0} y={1010} width={1920} height={70} seed={22} bg={C.turqDeep} />
        {/* pause */}
        {f < 66 ? (
          <g transform={`translate(960, 470) scale(${easeOutBack(clamp(f / 12)) * (1 - pauseOut)})`}>
            <circle r={150} fill="#fff" />
            <rect x={-56} y={-62} width={36} height={124} rx={10} fill={C.azureDeep} />
            <rect x={20} y={-62} width={36} height={124} rx={10} fill={C.azureDeep} />
          </g>
        ) : null}
        {inQ ? (
          <g opacity={qIn}>
            {/* progress dots */}
            {QS.map((_, i) => (
              <circle key={i} cx={900 + i * 60} cy={180} r={14} fill={i <= qi ? C.gold : '#ffffff40'} />
            ))}
            {/* timer ring */}
            <g transform="translate(960, 690)">
              <circle r={R} fill="none" stroke="#ffffff30" strokeWidth={14} />
              {!ans ? (
                <circle
                  r={R}
                  fill="none"
                  stroke={C.gold}
                  strokeWidth={14}
                  strokeDasharray={`${circ * (1 - ring)} ${circ}`}
                  transform="rotate(-90)"
                  strokeLinecap="round"
                />
              ) : null}
              {!ans ? (
                <text y={22} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={62} fill="#fff">
                  {Math.max(1, 3 - Math.floor(ring * 3))}
                </text>
              ) : null}
            </g>
          </g>
        ) : null}
      </svg>
      {f < 66 ? (
        <div
          style={{
            position: 'absolute',
            top: 680,
            width: '100%',
            textAlign: 'center',
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 76,
            color: '#fff',
            opacity: ip(f, [6, 16], [0, 1]) * (1 - pauseOut),
          }}
        >
          Поставь на паузу!
        </div>
      ) : null}
      {inQ ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: 300,
              left: 160,
              right: 160,
              textAlign: 'center',
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 84,
              lineHeight: 1.15,
              color: '#fff',
              opacity: qIn,
              transform: `translateY(${(1 - qIn) * 40}px)`,
            }}
          >
            {QS[qi][0]}
          </div>
          {ans ? (
            <div style={{position: 'absolute', top: 690, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div
                style={{
                  transform: `translateY(-50%) scale(${ansS})`,
                  background: C.turq,
                  color: '#fff',
                  fontFamily: F.display,
                  fontWeight: 800,
                  fontSize: 72,
                  padding: '18px 54px 24px',
                  borderRadius: 60,
                  boxShadow: '0 14px 40px rgba(0,0,0,0.3)',
                }}
              >
                {QS[qi][1]}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
