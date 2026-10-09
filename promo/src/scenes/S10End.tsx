import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeOutBack, easeOutExpo, ip, punch} from '../theme';
import {LOGO_BOX, LOGO_FS, LOGO_W, Wordmark} from '../components';

export const END_LOGO_TOP = 440;

// 22-25s: clean closing frame.
export const S10End: React.FC<{f: number}> = ({f}) => {
  const flash = f < 2 ? 1 : 1 - clamp((f - 1) / 5);
  const slam = easeOutBack(clamp(f / 10));
  const breathe = 1 + Math.sin(f * 0.07) * 0.006;
  const tg = easeOutBack(clamp((f - 12) / 10));
  const cta = easeOutBack(clamp((f - 31) / 10));
  const chips = easeOutExpo(clamp((f - 42) / 12));
  const ringRot = f * 0.4;
  const dotDrop = clamp((f - 4) / 16);
  const dotY = (1 - easeOutBack(dotDrop)) * -700;

  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      {/* slow orbit ring */}
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(540 ${END_LOGO_TOP + 144}) rotate(${ringRot})`} opacity={0.28 * clamp(f / 20)}>
          <circle r="560" fill="none" stroke={C.cream} strokeWidth="2" strokeDasharray="4 22" />
          <circle r="16" cx="0" cy="-560" fill={C.orange} stroke="none" />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (1080 - LOGO_W) / 2,
          top: END_LOGO_TOP,
          transform: `scale(${(1.35 - 0.35 * slam) * breathe})`,
          transformOrigin: '50% 50%',
          opacity: f >= 0 ? 1 : 0,
        }}
      >
        <Wordmark
          color={C.cream}
          dotColor={C.orange}
          dotStyle={{transform: `translateY(${dotY}px)`, opacity: f >= 4 ? 1 : 0}}
        />
      </div>

      <div style={{position: 'absolute', top: 780, width: '100%', textAlign: 'center', height: 170, overflow: 'hidden'}}>
        <div
          style={{
            fontFamily: F.cond,
            fontWeight: 700,
            fontSize: 128,
            lineHeight: '170px',
            color: C.cream,
            letterSpacing: '0.04em',
            transform: `translateY(${(1 - tg) * 190}px)`,
          }}
        >
          СДЕЛАЙ <span style={{color: C.orange}}>ОДНО.</span>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 960,
          width: '100%',
          textAlign: 'center',
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 38,
          lineHeight: '52px',
          color: C.grey,
          letterSpacing: '0.04em',
          opacity: tg,
        }}
      >
        фокус-приложение для тех,
        <br />
        у кого 47 дел
      </div>

      {/* CTA */}
      <div style={{position: 'absolute', top: 1120, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${cta * (1 + 0.012 * Math.sin(f * 0.18))})`,
            opacity: f >= 31 ? 1 : 0,
            background: C.orange,
            color: C.ink,
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 66,
            letterSpacing: '-0.01em',
            padding: '40px 78px',
            borderRadius: 999,
            boxShadow: `0 0 0 ${10 * cta}px rgba(255,74,28,.22)`,
          }}
        >
          Скачай ОДИН
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1320,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          opacity: chips,
          transform: `translateY(${(1 - chips) * 30}px)`,
        }}
      >
        {['iOS', 'Android'].map((p) => (
          <div
            key={p}
            style={{
              fontFamily: F.display,
              fontWeight: 500,
              fontSize: 36,
              color: C.cream,
              border: `3px solid rgba(243,238,227,.55)`,
              borderRadius: 999,
              padding: '18px 44px',
            }}
          >
            {p}
          </div>
        ))}
      </div>
      {/* flash from the hit */}
      <AbsoluteFill style={{background: C.cream, opacity: flash * 0.9, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
