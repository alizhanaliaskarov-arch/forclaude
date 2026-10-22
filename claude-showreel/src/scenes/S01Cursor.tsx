import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeIn, ip} from '../theme';
import {Dust} from '../components';

// 0–8 s. A single caret in the dark types "Привет." — then the camera dives into the caret.
const WORD = 'Привет.';
export const TYPE_AT = 36; // first key press (frame); one key every 6 frames — the soundtrack clicks on these
export const S01Cursor: React.FC<SceneProps> = ({f, dur}) => {
  const n = clamp(Math.floor((f - TYPE_AT) / 6) + 1, 0, WORD.length);
  const typing = f >= TYPE_AT && n < WORD.length;
  const blink = typing || Math.floor(f / 16) % 2 === 0;
  const dive = ip(f, [dur - 50, dur], [0, 1], easeIn);
  const scale = 1 + dive * 60;
  const textO = ip(f, [dur - 50, dur - 30], [1, 0]);
  const glow = ip(f, [0, 30], [0, 1]) * (0.6 + 0.4 * Math.sin(f / 10));
  return (
    <AbsoluteFill style={{background: C.night, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{opacity: ip(f, [60, 160], [0, 0.6])}}>
        <Dust f={f} n={40} color={C.amber} speed={0.25} size={2} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          transform: `scale(${scale})`,
          transformOrigin: `${50 + (n * 2.2)}% 50%`,
        }}
      >
        <span
          style={{
            fontFamily: F.display,
            fontWeight: 600,
            fontSize: 150,
            color: C.ivory,
            letterSpacing: '-0.02em',
            opacity: textO,
          }}
        >
          {WORD.slice(0, n)}
        </span>
        <span
          style={{
            width: 18,
            height: 170,
            marginLeft: 14,
            borderRadius: 4,
            background: C.coral,
            opacity: blink ? 1 : 0.1,
            boxShadow: `0 0 ${40 + 60 * glow}px ${C.coral}`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 170,
          fontFamily: F.mono,
          fontSize: 24,
          letterSpacing: '0.3em',
          color: C.mute,
          opacity: ip(f, [110, 140], [0, 1]) * textO,
        }}
      >
        ВСЁ НАЧИНАЕТСЯ С ОДНОГО СЛОВА
      </div>
    </AbsoluteFill>
  );
};
