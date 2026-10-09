import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeOutBack, ip, punch, rnd} from '../theme';
import {Glitchy} from '../components';

const SCRAMBLE = [92, 18, 63, 7, 81, 34, 59, 26];

// 0-2s: the hook. Giant "47" lands on frame 0 — no warm-up.
export const S1Hook: React.FC<{f: number}> = ({f}) => {
  const num = f < 8 ? SCRAMBLE[f] : 47;
  const flash = f < 2;
  const bg = flash ? C.cream : C.ink;
  const fg = flash ? C.ink : C.cream;
  const settle = clamp((f - 0) / 9);
  const numScale = 1.4 - 0.4 * easeOutBack(settle);
  const glitch = f < 12 ? 14 * (1 - f / 12) : (f % 11 === 0 ? 8 : 0);
  const cam = 1 + ip(f, [0, 60], [0, 0.1]) * 1 + (punch(f, 0.035) - 1);
  const shakeX = f < 10 ? (rnd(f) - 0.5) * 40 * (1 - f / 10) : 0;
  const shakeY = f < 10 ? (rnd(f + 9) - 0.5) * 40 * (1 - f / 10) : 0;

  const w1 = clamp((f - 15) / 6); // У ТЕБЯ
  const w2 = clamp((f - 30) / 6); // ЗАДАЧ
  const st = clamp((f - 45) / 5); // СДЕЛАНО: 0

  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{transform: `translate(${shakeX}px,${shakeY}px) scale(${cam})`, transformOrigin: '50% 48%'}}
      >
        {/* У ТЕБЯ */}
        <div
          style={{
            position: 'absolute',
            top: 490,
            width: '100%',
            textAlign: 'center',
            overflow: 'hidden',
            height: 150,
            opacity: f >= 15 ? 1 : 0,
          }}
        >
          <Glitchy
            amount={glitch * 0.5}
            style={{
              fontFamily: F.cond,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: '150px',
              color: fg,
              letterSpacing: '0.12em',
              transform: `translateY(${(1 - easeOutBack(w1)) * 160}px)`,
            }}
          >
            У ТЕБЯ
          </Glitchy>
        </div>

        {/* 47 */}
        <Glitchy
          amount={glitch}
          style={{
            position: 'absolute',
            top: 640,
            width: '100%',
            textAlign: 'center',
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 500,
            lineHeight: '500px',
            letterSpacing: '-0.05em',
            color: fg,
            transform: `scale(${numScale})`,
            transformOrigin: '50% 55%',
          }}
        >
          {num}
        </Glitchy>

        {/* ЗАДАЧ */}
        <div
          style={{
            position: 'absolute',
            top: 1150,
            width: '100%',
            textAlign: 'center',
            height: 190,
            overflow: 'hidden',
            opacity: f >= 30 ? 1 : 0,
          }}
        >
          <div
            style={{
              fontFamily: F.cond,
              fontWeight: 700,
              fontSize: 190,
              lineHeight: '190px',
              color: C.orange,
              letterSpacing: '0.06em',
              transform: `translateY(${-(1 - easeOutBack(w2)) * 200}px)`,
            }}
          >
            ЗАДАЧ.
          </div>
        </div>

        {/* stamp */}
        <div
          style={{
            position: 'absolute',
            top: 1365,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            opacity: f >= 45 ? 1 : 0,
            transform: `rotate(-5deg) scale(${1.6 - 0.6 * easeOutBack(st)})`,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 800,
              fontSize: 46,
              color: C.ink,
              background: C.cream,
              padding: '16px 34px',
              borderRadius: 10,
              letterSpacing: '0.04em',
            }}
          >
            СДЕЛАНО: <span style={{color: C.red}}>0</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* tear glitch into the next cut */}
      {f >= 54 && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                top: 300 + i * 330 + rnd(f + i) * 40,
                height: 70 + rnd(f * 2 + i) * 90,
                background: i % 2 ? C.orange : C.cream,
                transform: `translateX(${(rnd(f + i * 5) - 0.5) * 900}px)`,
                mixBlendMode: i % 2 ? 'normal' : 'difference',
              }}
            />
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
