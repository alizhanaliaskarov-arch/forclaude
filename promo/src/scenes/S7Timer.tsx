import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeInOut, easeOutBack, easeOutExpo, ip, punch, rnd} from '../theme';

const CX = 540;
const CY = 1010;
const R = 300;
const MSG = ['Новое сообщение', 'Скидка −50%!', '3 пропущенных', 'Вас упомянули', 'Обновите iOS', 'Лайк на фото', 'Срочно ответьте', 'Напоминание'];
// [hitFrame, angleDeg]
const HITS: [number, number][] = [
  [6, 172], [12, 8], [18, 120], [24, 35], [30, 150], [37, 70], [44, 190], [51, 345],
];

// 14-16s: a focus timer; the ring deflects every notification
export const S7Timer: React.FC<{f: number}> = ({f}) => {
  const ringIn = easeOutBack(clamp(f / 12));
  const p = easeInOut(clamp((f - 4) / 52));
  const secs = Math.round(1500 * (1 - p));
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const circ = 2 * Math.PI * R;
  const cam = punch(f, 0.03, 4);
  const t1 = easeOutBack(clamp((f - 2) / 8));
  const t2 = easeOutBack(clamp((f - 10) / 8));

  return (
    <AbsoluteFill style={{background: f < 12 ? C.lime : C.ink, overflow: 'hidden'}}>
      {/* ink bars sweep across the lime of the previous scene */}
      {f < 12 &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: i * 321,
              height: 322,
              width: 1080 * easeOutExpo(clamp((f - i * 0.8) / 6)),
              background: C.ink,
            }}
          />
        ))}
      <AbsoluteFill style={{transform: `scale(${cam})`}}>
        {/* headline */}
        <div style={{position: 'absolute', top: 270, width: '100%', textAlign: 'center'}}>
          <div style={{height: 200, overflow: 'hidden'}}>
            <div
              style={{
                fontFamily: F.cond,
                fontWeight: 700,
                fontSize: 200,
                lineHeight: '200px',
                color: C.cream,
                transform: `translateY(${(1 - t1) * 220}px)`,
                letterSpacing: '0.01em',
              }}
            >
              25 МИНУТ
            </div>
          </div>
          <div style={{height: 200, overflow: 'hidden'}}>
            <div
              style={{
                fontFamily: F.cond,
                fontWeight: 700,
                fontSize: 200,
                lineHeight: '200px',
                color: C.orange,
                transform: `translateY(${(1 - t2) * 220}px)`,
                letterSpacing: '0.01em',
              }}
            >
              БЕЗ ШУМА.
            </div>
          </div>
        </div>

        {/* ring */}
        <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0}}>
          <g transform={`translate(${CX} ${CY}) scale(${ringIn}) rotate(-90)`}>
            <circle r={R} fill="none" stroke="rgba(243,238,227,.14)" strokeWidth="38" />
            <circle
              r={R}
              fill="none"
              stroke={C.orange}
              strokeWidth="38"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * p}
            />
          </g>
          {/* ripples on every deflection */}
          {HITS.map(([h, a], i) => {
            const t = f - h;
            if (t < 0 || t > 14) return null;
            const rr = R + 20 + t * 14;
            return (
              <circle
                key={i}
                cx={CX}
                cy={CY}
                r={rr}
                fill="none"
                stroke={C.lime}
                strokeWidth={6 * (1 - t / 14)}
                opacity={(1 - t / 14) * 0.9}
                strokeDasharray={`${220} ${2000}`}
                transform={`rotate(${a - 18} ${CX} ${CY})`}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            top: CY - 90,
            width: '100%',
            textAlign: 'center',
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 170,
            lineHeight: '180px',
            color: C.cream,
            letterSpacing: '-0.04em',
            opacity: ringIn,
          }}
        >
          {mm}:{ss}
        </div>

        {/* bouncing notifications */}
        {HITS.map(([h, a], i) => {
          const t = f - (h - 14);
          if (t < 0 || t > 40) return null;
          const rad = (a * Math.PI) / 180;
          const dx = Math.cos(rad);
          const dy = Math.sin(rad);
          // distance from centre: in → contact (R+120) → out
          const inT = clamp(t / 14);
          const outT = clamp((t - 14) / 24);
          const dist = t < 14 ? 1100 - (1100 - (R + 150)) * easeOutExpo(inT) * 0 - (1100 - (R + 150)) * (1 - Math.pow(1 - inT, 2)) : R + 150 + 750 * easeOutExpo(outT);
          const spin = outT * (i % 2 ? 1 : -1) * 120;
          const sc = t < 14 ? 1 : 1 - outT * 0.4;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: CX + dx * dist - 190,
                top: CY + dy * dist - 45,
                width: 380,
                height: 90,
                borderRadius: 26,
                background: i % 2 ? C.cream : C.red,
                color: i % 2 ? C.ink : '#fff',
                fontFamily: F.mono,
                fontWeight: 800,
                fontSize: 29,
                display: 'flex',
                alignItems: 'center',
                padding: '0 26px',
                boxSizing: 'border-box',
                transform: `rotate(${spin + (t < 14 ? (rnd(i) - 0.5) * 20 : 0)}deg) scale(${sc})`,
                opacity: 1 - clamp((t - 30) / 10),
              }}
            >
              {MSG[i % MSG.length]}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
