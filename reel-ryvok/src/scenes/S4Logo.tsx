import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, TAGLINE, ip, pop, punch, shake} from '../theme';
import {Fill, Line, Wordmark} from '../components';

// 10–13 s: the drop — brand reveal
export const S4Logo: React.FC<{f: number}> = ({f}) => {
  const sh = shake(f, 0, 36, 9);
  const cam = punch(f, 0.035) * (1 + ip(f, [0, 90], [0, 0.05]));
  return (
    <Fill bg={f < 2 ? C.yellow : C.blue}>
      {/* rising streaks */}
      {Array.from({length: 9}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 40 + i * 125,
            top: 1920 - ((f * (46 + (i % 4) * 14) + i * 520) % 2600),
            width: 8,
            height: 300 + (i % 3) * 120,
            background: i % 3 === 0 ? C.yellow : 'rgba(255,255,255,.35)',
          }}
        />
      ))}
      <AbsoluteFill style={{transform: `translate(${sh.x}px,${sh.y}px) scale(${cam})`, transformOrigin: '50% 42%'}}>
        <div style={{position: 'absolute', top: 560, left: 0, width: '100%'}}>
          <Wordmark size={176} f={f} />
        </div>
        <Line top={835} size={70} spacing="0.04em" style={{transform: `translateY(${(1 - pop(f, 30, 8)) * 90}px)`, opacity: f >= 30 ? 1 : 0}}>
          {TAGLINE}
        </Line>
        <div
          style={{
            position: 'absolute',
            top: 980,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            transform: `rotate(-4deg) scale(${pop(f, 66, 8)})`,
          }}
        >
          <div
            style={{
              background: C.yellow,
              color: C.ink,
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 104,
              lineHeight: '170px',
              padding: '0 56px',
              borderRadius: 90,
              letterSpacing: '-0.02em',
              boxShadow: '0 16px 0 rgba(11,11,16,.9)',
            }}
          >
            30 ДНЕЙ
          </div>
        </div>
      </AbsoluteFill>
    </Fill>
  );
};
