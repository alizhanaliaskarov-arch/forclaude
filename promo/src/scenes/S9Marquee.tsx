import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeInExpo, easeOutBack, ip, punch} from '../theme';

const ROWS = 9;

// 20-22s: orange wall of type, "ХВАТИТ ЖОНГЛИРОВАТЬ" / "НАЧНИ С ОДНОГО"
export const S9Marquee: React.FC<{f: number}> = ({f}) => {
  const cam = punch(f, 0.03, 4) * (1 + ip(f, [0, 60], [0, 0.08]));
  const a1 = easeOutBack(clamp(f / 7));
  const a2 = easeOutBack(clamp((f - 30) / 7));
  const out = clamp((f - 52) / 8);

  return (
    <AbsoluteFill style={{background: C.orange, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${cam}) rotate(-9deg)`, transformOrigin: '50% 50%'}}>
        {Array.from({length: ROWS}).map((_, i) => {
          const dir = i % 2 ? 1 : -1;
          const x = dir * f * (26 + (i % 3) * 8) - 900;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: 90 + i * 215,
                whiteSpace: 'nowrap',
                fontFamily: F.cond,
                fontWeight: 700,
                fontSize: 250,
                lineHeight: '250px',
                color: i % 3 === 1 ? C.ink : 'transparent',
                WebkitTextStroke: i % 3 === 1 ? '0' : `4px ${C.ink}`,
                opacity: i % 3 === 1 ? 0.9 : 0.55,
                letterSpacing: '0.02em',
              }}
            >
              {'ОДНО · ОДНО · ОДНО · ОДНО · ОДНО · ОДНО · ОДНО · ОДНО · '}
            </div>
          );
        })}
      </AbsoluteFill>
      {/* foreground statement */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 1 - out,
        }}
      >
        {f < 30 ? (
          <div style={{transform: `scale(${0.5 + 0.5 * a1}) rotate(-3deg)`, background: C.ink, padding: '34px 44px', textAlign: 'center'}}>
            <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 230, lineHeight: '230px', color: C.cream}}>ХВАТИТ</div>
            <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 124, lineHeight: '140px', color: C.orange}}>ЖОНГЛИРОВАТЬ.</div>
          </div>
        ) : (
          <div style={{transform: `scale(${0.5 + 0.5 * a2}) rotate(3deg)`, background: C.cream, padding: '34px 44px', textAlign: 'center'}}>
            <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 150, lineHeight: '160px', color: C.ink}}>НАЧНИ С</div>
            <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 220, lineHeight: '230px', color: C.orange}}>ОДНОГО.</div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
