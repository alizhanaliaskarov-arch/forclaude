import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, clamp, easeOutBack, ip, pop, punch, rnd, shake} from '../theme';
import {Fill, Glitchy, Line, Sheet} from '../components';

// 0–2.5 s: the hook. The calendar sheet is on screen from frame 0.
export const S1Hook: React.FC<{f: number}> = ({f}) => {
  const flash = f < 2;
  const settle = clamp(f / 9);
  const sheetScale = 1.5 - 0.5 * easeOutBack(settle);
  const glitch = f < 12 ? 14 * (1 - f / 12) : f % 13 === 0 ? 7 : 0;
  const sh = shake(f, 0, 44, 10);
  const cam = 1 + ip(f, [0, 75], [0, 0.07]) + (punch(f, 0.03) - 1);
  const a = pop(f, 8, 7);
  const b = pop(f, 38, 7);
  return (
    <Fill bg={flash ? C.white : C.ink}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px,${sh.y}px) scale(${cam})`, transformOrigin: '50% 45%'}}>
        {/* speed streaks */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 60 + i * 180,
              top: ((f * (40 + i * 9) + i * 400) % 2400) - 400,
              width: 6,
              height: 260,
              background: i % 2 ? C.blue : C.pink,
              opacity: 0.55,
            }}
          />
        ))}
        <Line top={315} size={110} style={{transform: `translateY(${(1 - a) * -120}px)`, opacity: f >= 8 ? 1 : 0}}>
          ОПЯТЬ НАЧНЁШЬ
        </Line>
        <div
          style={{
            position: 'absolute',
            top: 480,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            transform: `rotate(${-5 + Math.sin(f / 9) * 1.2}deg) scale(${sheetScale})`,
          }}
        >
          <Glitchy amount={glitch}>
            <Sheet w={540} label="ПОНЕДЕЛЬНИК" big="ПН" />
          </Glitchy>
        </div>
        <Line
          top={1135}
          size={106}
          color={C.yellow}
          style={{transform: `scale(${0.6 + 0.4 * b})`, opacity: f >= 38 ? 1 : 0}}
        >
          С ПОНЕДЕЛЬНИКА?
        </Line>
      </AbsoluteFill>
      {/* tear into the next cut */}
      {f >= 70 &&
        [0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              top: 280 + i * 340 + rnd(f + i) * 40,
              height: 80 + rnd(f * 2 + i) * 90,
              background: i % 2 ? C.blue : C.yellow,
              transform: `translateX(${(rnd(f + i * 5) - 0.5) * 900}px)`,
            }}
          />
        ))}
    </Fill>
  );
};
