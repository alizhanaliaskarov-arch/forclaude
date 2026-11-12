import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, clamp, easeOutExpo, pop, punch, shake} from '../theme';
import {Fill, Line, Sheet} from '../components';

// 20–23 s: Monday is cancelled → TODAY (hit at 21.5 s)
export const S6Today: React.FC<{f: number}> = ({f}) => {
  const HIT = 45;
  if (f < HIT) {
    const x1 = clamp((f - 15) / 5);
    const x2 = clamp((f - 22) / 5);
    const sh1 = shake(f, 15, 30, 7);
    const sh2 = shake(f, 22, 30, 7);
    return (
      <Fill bg={C.ink}>
        <AbsoluteFill style={{transform: `translate(${sh1.x + sh2.x}px,${sh1.y + sh2.y}px)`}}>
          <Line top={320} size={126} style={{transform: `translateY(${(1 - pop(f, 3, 7)) * -100}px)`}}>
            ПОНЕДЕЛЬНИК
          </Line>
          <Line top={1130} size={126} color={C.pink} style={{transform: `scale(${pop(f, 24, 7)})`, opacity: f >= 24 ? 1 : 0}}>
            НЕ НАСТУПИТ.
          </Line>
          <div style={{position: 'absolute', top: 500, left: 270, width: 540, transform: `rotate(4deg) scale(${0.9 + 0.1 * pop(f, 0, 8)})`}}>
            <Sheet w={540} label="ПОНЕДЕЛЬНИК" big="ПН" head={C.grey} />
            {[x1, x2].map((x, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: -60,
                  top: 285,
                  width: 660 * easeOutExpo(x),
                  height: 34,
                  background: C.pink,
                  transformOrigin: '330px 17px',
                  transform: `rotate(${i ? -42 : 42}deg)`,
                }}
              />
            ))}
          </div>
        </AbsoluteFill>
      </Fill>
    );
  }
  const g = f - HIT;
  const sh = shake(g, 0, 50, 10);
  return (
    <Fill bg={g < 2 ? C.white : C.yellow}>
      {/* radiating bars */}
      {Array.from({length: 12}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 540,
            top: 800,
            width: 2200,
            height: 70,
            marginTop: -35,
            background: 'rgba(11,11,16,.07)',
            transformOrigin: '0 50%',
            transform: `rotate(${i * 30 + g * 0.8}deg)`,
          }}
        />
      ))}
      <AbsoluteFill style={{transform: `translate(${sh.x}px,${sh.y}px) scale(${punch(f, 0.05)})`, transformOrigin: '50% 42%'}}>
        <Line top={520} size={190} color={C.ink} style={{transform: `scale(${1.6 - 0.6 * pop(g, 0, 7)})`}}>
          НАЧНИ
        </Line>
        <Line top={740} size={158} font="display" weight={900} color={C.ink} spacing="-0.04em" style={{transform: `scale(${pop(g, 5, 8)})`}}>
          СЕГОДНЯ
        </Line>
        <div style={{position: 'absolute', top: 950, left: 130, height: 30, width: 820 * easeOutExpo(clamp((g - 12) / 8)), background: C.pink}} />
      </AbsoluteFill>
    </Fill>
  );
};
