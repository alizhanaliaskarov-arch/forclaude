import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeOutExpo, ip, pop, punch, shake} from '../theme';
import {Fill, Line, Sheet} from '../components';

const MONTHS = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
const PLANS: [string, number][] = [
  ['СПОРТЗАЛ', 51],
  ['АНГЛИЙСКИЙ', 76],
  ['СВОЁ ДЕЛО', 104],
];

// 2.5–7 s: a year of Mondays, then three plans get struck out
export const S2Year: React.FC<{f: number}> = ({f}) => {
  const part2 = f >= 49;
  const cam = punch(f, 0.025);
  const sh = part2 ? PLANS.map(([, s]) => shake(f, s, 26, 8)).reduce((a, b) => ({x: a.x + b.x, y: a.y + b.y})) : {x: 0, y: 0};
  return (
    <Fill bg={part2 ? C.ink : C.blue}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px,${sh.y}px) scale(${cam})`}}>
        {!part2 && (
          <>
            {/* twelve month sheets tumble past */}
            {MONTHS.map((m, i) => {
              const t = f - i * 4;
              if (t < 0) return null;
              const x = 90 + ((i * 337) % 720);
              const y = -420 + t * 62;
              return (
                <div
                  key={m}
                  style={{position: 'absolute', left: x, top: y, transform: `rotate(${(i % 2 ? 1 : -1) * (8 + t * 1.6)}deg)`, opacity: 0.9}}
                >
                  <Sheet w={250} label={m} big="ПН" head={C.ink} />
                </div>
              );
            })}
            <div style={{position: 'absolute', top: 420, left: 0, width: '100%', height: 640, background: 'rgba(43,75,255,.82)'}} />
            <Line top={450} size={150} style={{transform: `translateX(${(1 - pop(f, 3, 7)) * -900}px)`}}>
              ТЫ ГОВОРИШЬ
            </Line>
            <Line top={620} size={150} style={{transform: `translateX(${(1 - pop(f, 13, 7)) * 900}px)`}}>
              ЭТО УЖЕ
            </Line>
            <Line
              top={790}
              size={230}
              font="display"
              weight={900}
              color={C.yellow}
              spacing="-0.03em"
              style={{transform: `scale(${pop(f, 26, 8) * punch(f, 0.05)})`}}
            >
              ГОД.
            </Line>
          </>
        )}
        {part2 && (
          <>
            <Line top={330} size={62} color={C.grey} spacing="0.16em" weight={500}>
              ПЛАНЫ НА ПОНЕДЕЛЬНИК
            </Line>
            {PLANS.map(([word, s], i) => {
              if (f < s) return null;
              const p = pop(f, s, 7);
              const strike = clamp((f - s - 9) / 6);
              const dead = strike > 0.99;
              return (
                <div
                  key={word}
                  style={{
                    position: 'absolute',
                    top: 470 + i * 270,
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    transform: `rotate(${[-3, 2, -2][i]}deg) scale(${1.5 - 0.5 * p})`,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      background: dead ? '#C9CAD6' : C.white,
                      color: C.ink,
                      fontFamily: F.cond,
                      fontWeight: 700,
                      fontSize: 150,
                      lineHeight: '190px',
                      padding: '0 46px',
                      borderRadius: 18,
                      letterSpacing: '0.03em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {word}
                    <div
                      style={{
                        position: 'absolute',
                        left: -30,
                        top: 82,
                        height: 26,
                        width: `calc(${easeOutExpo(strike) * 100}% + ${easeOutExpo(strike) * 60}px)`,
                        background: C.pink,
                        transform: 'rotate(-2deg)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </AbsoluteFill>
      {/* whip to black at the end */}
      <div
        style={{position: 'absolute', left: 0, width: '100%', bottom: 0, height: ip(f, [129, 135], [0, 1920]), background: C.ink}}
      />
    </Fill>
  );
};
