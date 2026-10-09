import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeInExpo, easeOutBack, easeOutExpo, ip} from '../theme';
import {CardPile} from './CardPile';

// 6-8s: the pile is sucked into a point, silence, a heartbeat, a question.
export const S3Turn: React.FC<{f: number}> = ({f}) => {
  const collapse = clamp(f / 20);
  const beatPulse = (at: number) => Math.exp(-Math.max(0, f - at) / 4) * (f >= at ? 1 : 0);
  const pulse = beatPulse(30) + beatPulse(45);
  const dotR = f < 20 ? 0 : 10 + pulse * 26;
  const typed = 'а если'.slice(0, Math.max(0, Math.floor((f - 25) / 2)));
  const w1 = clamp((f - 40) / 6);
  const w2 = clamp((f - 47) / 6);
  // iris: orange circle expanding out of the question mark
  const iris = ip(f, [51, 59], [0, 1], easeInExpo);
  const irisR = 30 + iris * 1500;

  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      {f < 24 && (
        <div style={{opacity: 1 - collapse * 0.2}}>
          <CardPile f={120 + f} collapse={collapse} />
        </div>
      )}
      {/* heartbeat dot + ripple */}
      {f >= 20 && f < 40 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 540 - dotR,
              top: 960 - dotR,
              width: dotR * 2,
              height: dotR * 2,
              borderRadius: '50%',
              background: C.cream,
            }}
          />
          {[30].map((at) => (
            <div
              key={at}
              style={{
                position: 'absolute',
                left: 540 - 20 - Math.max(0, f - at) * 14,
                top: 960 - 20 - Math.max(0, f - at) * 14,
                width: 40 + Math.max(0, f - at) * 28,
                height: 40 + Math.max(0, f - at) * 28,
                borderRadius: '50%',
                border: `3px solid rgba(243,238,227,${f >= at ? Math.max(0, 0.7 - (f - at) * 0.07) : 0})`,
              }}
            />
          ))}
        </>
      )}
      <div
        style={{
          position: 'absolute',
          top: 640,
          width: '100%',
          textAlign: 'center',
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 70,
          color: C.grey,
          letterSpacing: '0.02em',
          opacity: f >= 25 ? 1 : 0,
        }}
      >
        {typed}
        {f >= 25 && f < 40 && f % 6 < 3 ? '▌' : ''}
      </div>
      <div style={{position: 'absolute', top: 760, width: '100%', textAlign: 'center'}}>
        <div style={{height: 230, overflow: 'hidden'}}>
          <div
            style={{
              fontFamily: F.cond,
              fontWeight: 700,
              fontSize: 230,
              lineHeight: '230px',
              color: C.cream,
              letterSpacing: '0.04em',
              transform: `translateY(${(1 - easeOutBack(w1)) * 240}px)`,
              opacity: f >= 40 ? 1 : 0,
            }}
          >
            ТОЛЬКО
          </div>
        </div>
        <div style={{height: 260, overflow: 'hidden'}}>
          <div
            style={{
              fontFamily: F.cond,
              fontWeight: 700,
              fontSize: 260,
              lineHeight: '260px',
              color: C.orange,
              letterSpacing: '0.04em',
              transform: `translateY(${(1 - easeOutBack(w2)) * 280}px)`,
              opacity: f >= 47 ? 1 : 0,
            }}
          >
            ОДНО?
          </div>
        </div>
      </div>
      {f >= 51 && (
        <div
          style={{
            position: 'absolute',
            left: 630 - irisR,
            top: 1040 - irisR,
            width: irisR * 2,
            height: irisR * 2,
            borderRadius: '50%',
            background: C.orange,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
