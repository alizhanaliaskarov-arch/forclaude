import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeInExpo, ip, pop, punch, rnd, shake} from '../theme';
import {Fill, Line} from '../components';

const SLICES = 7;

// 7–10 s: "it's not laziness" — the word shatters, SYSTEM assembles
export const S3System: React.FC<{f: number}> = ({f}) => {
  const BREAK = 45;
  const broke = f >= BREAK;
  const t = clamp((f - BREAK) / 14);
  const sh = shake(f, BREAK, 46, 10);
  const grid = clamp((f - BREAK) / 20);
  const big: React.CSSProperties = {
    position: 'absolute',
    top: 610,
    left: 0,
    width: '100%',
    textAlign: 'center',
    fontFamily: F.display,
    fontWeight: 900,
    fontSize: 270,
    lineHeight: '300px',
    letterSpacing: '-0.04em',
    color: C.pink,
  };
  return (
    <Fill bg={C.ink}>
      {/* the "system" grid draws itself in */}
      <AbsoluteFill style={{opacity: 0.22 * grid}}>
        {Array.from({length: 9}).map((_, i) => (
          <div key={'v' + i} style={{position: 'absolute', left: i * 135, top: 0, width: 3, height: 1920 * grid, background: C.yellow}} />
        ))}
        {Array.from({length: 15}).map((_, i) => (
          <div key={'h' + i} style={{position: 'absolute', top: i * 135, left: 0, height: 3, width: 1080 * grid, background: C.yellow}} />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sh.x}px,${sh.y}px)`}}>
        {!broke && (
          <>
            <Line top={470} size={104} style={{transform: `translateY(${(1 - pop(f, 4, 7)) * -80}px)`, opacity: f >= 4 ? 1 : 0}}>
              ПРОБЛЕМА НЕ В
            </Line>
            <div style={{...big, transform: `scale(${pop(f, 16, 8) * (1 + (f > 36 ? (rnd(f) - 0.5) * 0.04 : 0))})`}}>ЛЕНИ</div>
          </>
        )}
        {broke &&
          t < 1 &&
          Array.from({length: SLICES}).map((_, i) => {
            const dir = i % 2 ? 1 : -1;
            const y0 = (i / SLICES) * 100;
            const y1 = ((i + 1) / SLICES) * 100;
            return (
              <div
                key={i}
                style={{
                  ...big,
                  clipPath: `polygon(0 ${y0}%, 100% ${y0}%, 100% ${y1}%, 0 ${y1}%)`,
                  transform: `translate(${dir * easeInExpo(t) * 1300 + dir * t * 90}px, ${(rnd(i) - 0.5) * t * 160}px)`,
                  opacity: 1 - t * 0.4,
                }}
              >
                ЛЕНИ
              </div>
            );
          })}
        {f >= BREAK + 3 && (
          <>
            <Line top={520} size={128} style={{transform: `scale(${1.5 - 0.5 * pop(f, BREAK + 3, 7)})`}}>
              У ТЕБЯ НЕТ
            </Line>
            <Line
              top={700}
              size={148}
              font="display"
              weight={900}
              color={C.yellow}
              spacing="-0.03em"
              style={{transform: `scale(${pop(f, BREAK + 10, 8) * punch(f, 0.04)})`, opacity: f >= BREAK + 10 ? 1 : 0}}
            >
              СИСТЕМЫ.
            </Line>
          </>
        )}
      </AbsoluteFill>
      {/* yellow wipe up into the drop */}
      <div style={{position: 'absolute', left: 0, width: '100%', bottom: 0, height: ip(f, [84, 90], [0, 1920], easeInExpo), background: C.yellow}} />
    </Fill>
  );
};
