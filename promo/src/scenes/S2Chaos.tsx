import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BEAT, C, F, clamp, easeOutBack, ip, punch, rnd} from '../theme';
import {CardPile} from './CardPile';

const BGS = [C.orange, C.ink, C.cream, C.ink, C.orange, C.ink, C.cream, C.ink];
const FGS = [C.ink, C.cream, C.ink, C.cream, C.cream, C.cream, C.ink, C.cream];
// slab (word background) and text colours per beat — always max contrast over the card pile
const SLAB = [C.ink, C.cream, C.ink, C.cream, C.ink, C.cream, C.ink, C.orange];
const INK = [C.cream, C.ink, C.cream, C.ink, C.cream, C.ink, C.orange, C.ink];
const WORDS = ['ПОЧТА.', 'ЧАТЫ.', 'ДЕДЛАЙНЫ.', 'СОЗВОНЫ.', 'ВСЁ', 'ВАЖНО.', 'ЗНАЧИТ', 'НИЧЕГО.'];

// 2-6s: an escalating wall of obligations. One word per beat.
export const S2Chaos: React.FC<{f: number}> = ({f}) => {
  const b = Math.min(7, Math.floor(f / BEAT));
  const lf = f - b * BEAT;
  const word = WORDS[b];
  const fs = Math.min(400, 820 / (word.length * 0.56));
  const t = clamp(lf / 6);
  const sc = 1.55 - 0.55 * easeOutBack(t);
  const intensity = f / 120;
  const shakeX = (rnd(f * 1.7) - 0.5) * 34 * intensity;
  const shakeY = (rnd(f * 2.9) - 0.5) * 34 * intensity;
  const rot = (rnd(f * 4.1) - 0.5) * 2.2 * intensity;
  const cam = punch(f, 0.06, 3.5) * (1 + ip(f, [0, 120], [0, 0.12]));
  const fg = FGS[b];
  const echo = [3, 2, 1];

  const badge = Math.floor(ip(f, [20, 118], [3, 99]));
  const badgeScale = 1 + ip(f, [20, 118], [0, 0.55]);
  const bigPhase = b >= 6;

  return (
    <AbsoluteFill style={{background: BGS[b], overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px,${shakeY}px) rotate(${rot}deg) scale(${cam})`,
          transformOrigin: '50% 50%',
        }}
      >
        <CardPile f={f} />
        {/* hard shadowed word */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 20,
          }}
        >
          <div style={{position: 'relative', transform: `scale(${sc}) rotate(${(b % 2 ? 1 : -1) * 2.5}deg)`}}>
            {/* hard offset shadow slab */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: 'translate(22px, 22px)',
                background: b === 7 ? C.cream : C.orange === BGS[b] ? C.cream : C.orange,
              }}
            />
            <div
              style={{
                position: 'relative',
                background: SLAB[b],
                color: INK[b],
                padding: '6px 38px 0',
                fontFamily: F.cond,
                fontWeight: 700,
                fontSize: fs,
                lineHeight: 1.12,
                whiteSpace: 'nowrap',
              }}
            >
              {word}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* notification badge */}
      <div
        style={{
          position: 'absolute',
          top: 300,
          right: 90,
          width: 190,
          height: 190,
          borderRadius: '50%',
          background: C.red,
          color: '#fff',
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 76,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${badgeScale}) rotate(${(rnd(f) - 0.5) * 6}deg)`,
          boxShadow: '0 12px 0 rgba(0,0,0,.25)',
          letterSpacing: '-0.04em',
        }}
      >
        {badge >= 99 ? '99+' : badge}
      </div>
    </AbsoluteFill>
  );
};
