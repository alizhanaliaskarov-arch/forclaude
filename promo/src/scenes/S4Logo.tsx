import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeInOut, easeOutBack, ip, punch} from '../theme';
import {LOGO_BOX, LOGO_DOT_DX, LOGO_DOT_DY, LOGO_FS, LOGO_W, Wordmark} from '../components';

export const LOGO_LEFT = (1080 - LOGO_W) / 2;
export const LOGO_TOP = 700;
export const DOT_CX = LOGO_LEFT + LOGO_BOX / 2 + LOGO_DOT_DX;
export const DOT_CY = LOGO_TOP + (LOGO_FS * 1.1) / 2 + LOGO_DOT_DY;

// 8-10s: the drop. ОДИН slams in letter by letter, then we fly through the dot inside the О.
export const S4Logo: React.FC<{f: number}> = ({f}) => {
  const zp = easeInOut(clamp((f - 36) / 23));
  const S = Math.exp(Math.log(60) * zp);
  const tx = (540 - DOT_CX) * zp;
  const ty = (960 - DOT_CY) * zp;
  const cam = punch(f, 0.045, 4);
  const tag = clamp((f - 16) / 8);

  return (
    <AbsoluteFill style={{background: C.orange, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px,${ty}px) scale(${S * (zp > 0 ? 1 : cam)})`,
          transformOrigin: `${DOT_CX}px ${DOT_CY}px`,
        }}
      >
        <div style={{position: 'absolute', left: LOGO_LEFT, top: LOGO_TOP}}>
          <Wordmark
            color={C.ink}
            dotColor={C.ink}
            letterStyle={(i) => {
              const st = i * 3;
              const t = clamp((f - st) / 9);
              const e = easeOutBack(t);
              return {
                transform: `translateY(${(1 - e) * 900}px) scaleY(${1 + (1 - t) * 0.6}) scaleX(${1 - (1 - t) * 0.2})`,
                transformOrigin: '50% 100%',
                opacity: f >= st ? 1 : 0,
              };
            }}
            dotStyle={{
              transform: `scale(${easeOutBack(clamp((f - 10) / 10))})`,
              opacity: f >= 10 ? 1 : 0,
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            top: 1080,
            textAlign: 'center',
            opacity: tag * (1 - clamp((f - 34) / 6)),
            transform: `translateY(${(1 - tag) * 40}px)`,
          }}
        >
          <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 86, lineHeight: '96px', color: C.ink, letterSpacing: '0.02em'}}>
            ПРИЛОЖЕНИЕ, КОТОРОЕ
          </div>
          <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 86, lineHeight: '96px', color: C.ink, letterSpacing: '0.02em'}}>
            ПОКАЗЫВАЕТ ТОЛЬКО
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 10,
              fontFamily: F.cond,
              fontWeight: 700,
              fontSize: 120,
              lineHeight: '150px',
              color: C.orange,
              background: C.ink,
              padding: '0 28px',
              letterSpacing: '0.02em',
            }}
          >
            ОДНУ ЗАДАЧУ
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
