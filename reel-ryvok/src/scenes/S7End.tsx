import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, NICK, TAGLINE, clamp, ip, pop, shake} from '../theme';
import {Fill, Line, Wordmark} from '../components';

// 23–27 s: clean end frame with the call to action
export const S7End: React.FC<{f: number}> = ({f}) => {
  const sh = shake(f, 0, 30, 8);
  const BTN = 30;
  const pulse = f > BTN + 10 ? 1 + 0.035 * Math.sin((f - BTN) / 4.5) : 1;
  const ring = ((f - BTN - 10) % 36) / 36;
  return (
    <Fill bg={C.blue}>
      <div style={{position: 'absolute', left: -200, top: 300, width: 1480, height: 1480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.16), rgba(255,255,255,0) 62%)'}} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px,${sh.y}px) scale(${1 + ip(f, [0, 120], [0, 0.03])})`, transformOrigin: '50% 42%'}}>
        <div style={{position: 'absolute', top: 470, left: 0, width: '100%'}}>
          <Wordmark size={168} f={f} />
        </div>
        <Line top={735} size={50} spacing="0.06em" weight={500} style={{opacity: clamp((f - 14) / 8)}}>
          {TAGLINE} · 30 ДНЕЙ
        </Line>
        <div style={{position: 'absolute', top: 900, left: 0, width: '100%', display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'relative', transform: `scale(${pop(f, BTN, 8) * pulse})`}}>
            {f > BTN + 10 && (
              <div
                style={{
                  position: 'absolute',
                  inset: -ring * 46,
                  borderRadius: 120,
                  border: `6px solid ${C.yellow}`,
                  opacity: 1 - ring,
                }}
              />
            )}
            <div
              style={{
                background: C.yellow,
                color: C.ink,
                fontFamily: F.cond,
                fontWeight: 700,
                fontSize: 92,
                lineHeight: '176px',
                padding: '0 70px',
                borderRadius: 100,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                boxShadow: '0 16px 0 rgba(11,11,16,.9)',
              }}
            >
              ССЫЛКА В ПРОФИЛЕ
            </div>
          </div>
        </div>
        <Line top={1160} size={70} font="display" weight={500} spacing="0" style={{opacity: clamp((f - 44) / 8), transform: `translateY(${(1 - pop(f, 44, 8)) * 40}px)`}}>
          {NICK}
        </Line>
      </AbsoluteFill>
    </Fill>
  );
};
