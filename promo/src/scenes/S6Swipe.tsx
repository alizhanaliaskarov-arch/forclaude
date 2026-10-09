import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeInOut, easeOutBack, easeOutExpo, ip, punch, rnd} from '../theme';

const SHAPES = 46;

const Confetti: React.FC<{f: number; born: number}> = ({f, born}) => {
  const t = f - born;
  if (t < 0 || t > 45) return null;
  const cols = [C.ink, C.orange, C.cream, '#ffffff', C.ink];
  return (
    <>
      {Array.from({length: SHAPES}).map((_, i) => {
        const a = rnd(i * 1.7 + born) * Math.PI * 2;
        const v = 18 + rnd(i * 3.1) * 34;
        const x = 540 + Math.cos(a) * v * (1 - Math.pow(0.9, t)) * 9;
        const y = 900 + Math.sin(a) * v * (1 - Math.pow(0.9, t)) * 9 + t * t * 1.1;
        const sz = 22 + rnd(i * 9.1) * 34;
        const kind = i % 3;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - sz / 2,
              top: y - sz / 2,
              width: sz,
              height: sz,
              background: kind === 2 ? 'transparent' : cols[i % cols.length],
              borderRadius: kind === 1 ? '50%' : 4,
              borderLeft: kind === 2 ? `${sz / 2}px solid transparent` : undefined,
              borderRight: kind === 2 ? `${sz / 2}px solid transparent` : undefined,
              borderBottom: kind === 2 ? `${sz}px solid ${cols[i % cols.length]}` : undefined,
              transform: `rotate(${t * (rnd(i) - 0.5) * 40 + rnd(i * 4) * 360}deg)`,
              opacity: 1 - clamp((t - 30) / 15),
            }}
          />
        );
      })}
    </>
  );
};

// 12-14s: swipe → done → confetti → next card. Lime flood.
export const S6Swipe: React.FC<{f: number}> = ({f}) => {
  const flood = easeOutExpo(clamp(f / 9));
  const cam = punch(f - 1, 0.04, 4);
  // card 1 leaves to the right between f 4..16
  const sw = easeInOut(clamp((f - 4) / 12));
  const cardX = sw * 1200;
  const cardRot = sw * 22;
  const finger = f < 4 ? 0 : 1;
  const fingerX = 120 + sw * 1100;
  // check badge
  const chk = easeOutBack(clamp((f - 15) / 8));
  const chkDraw = clamp((f - 17) / 7);
  // card 2
  const c2 = easeOutBack(clamp((f - 30) / 12));
  const hidden = f < 17 ? 46 : f < 31 ? 45 : 44;
  const roll = (at: number) => clamp((f - at) / 5);
  const title1 = easeOutBack(clamp((f - 4) / 7));
  const title2 = easeOutBack(clamp((f - 30) / 7));

  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      {/* lime flood from the bottom */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 1900 * flood,
          top: 1700 - 1900 * flood,
          width: 3800 * flood,
          height: 3800 * flood,
          borderRadius: '50%',
          background: C.lime,
        }}
      />
      <AbsoluteFill style={{transform: `scale(${cam})`}}>
        {/* headline */}
        <div style={{position: 'absolute', top: 280, width: '100%', textAlign: 'center', height: 290, overflow: 'hidden'}}>
          {f < 30 ? (
            <div
              style={{
                fontFamily: F.cond,
                fontWeight: 700,
                fontSize: 250,
                lineHeight: '290px',
                color: C.ink,
                transform: `translateY(${(1 - title1) * 300}px)`,
              }}
            >
              СДЕЛАЛ.
            </div>
          ) : (
            <div
              style={{
                fontFamily: F.cond,
                fontWeight: 700,
                fontSize: 148,
                lineHeight: '290px',
                color: C.ink,
                transform: `translateY(${(1 - title2) * 300}px)`,
                letterSpacing: '0.01em',
              }}
            >
              СЛЕДУЮЩАЯ.
            </div>
          )}
        </div>

        {/* card 1 */}
        {f < 22 && (
          <div
            style={{
              position: 'absolute',
              left: 110,
              top: 700,
              width: 860,
              height: 520,
              borderRadius: 80,
              background: C.ink,
              color: C.cream,
              transform: `translateX(${cardX}px) rotate(${cardRot}deg)`,
              transformOrigin: '10% 100%',
              padding: 60,
              boxSizing: 'border-box',
              boxShadow: '0 40px 0 rgba(0,0,0,.18)',
            }}
          >
            <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 30, color: C.orange, letterSpacing: '0.12em'}}>● СЕЙЧАС</div>
            <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 138, lineHeight: '128px', marginTop: 30}}>
              ОТПРАВИТЬ
              <br />
              ОТЧЁТ
            </div>
          </div>
        )}
        {/* finger */}
        {finger === 1 && f < 22 && (
          <div
            style={{
              position: 'absolute',
              left: fingerX - 70,
              top: 1080,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'rgba(243,238,227,.35)',
              border: `6px solid ${C.cream}`,
              boxShadow: '0 0 0 14px rgba(12,12,15,.08)',
              transform: `scale(${1 - 0.15 * Math.sin(Math.min(1, f / 4) * Math.PI)})`,
            }}
          />
        )}
        {/* check badge */}
        {f >= 15 && (
          <div
            style={{
              position: 'absolute',
              left: 540 - 190,
              top: 900 - 190,
              width: 380,
              height: 380,
              borderRadius: '50%',
              background: C.orange,
              transform: `scale(${chk * (1 - clamp((f - 30) / 8))})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="230" height="230" viewBox="0 0 100 100">
              <path
                d="M20 53 L42 74 L82 28"
                fill="none"
                stroke={C.ink}
                strokeWidth="13"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="120"
                strokeDashoffset={120 * (1 - chkDraw)}
              />
            </svg>
          </div>
        )}
        <Confetti f={f} born={16} />
        <Confetti f={f} born={31} />

        {/* card 2 */}
        {f >= 30 && (
          <div
            style={{
              position: 'absolute',
              left: 110,
              top: 700,
              width: 860,
              height: 520,
              borderRadius: 80,
              background: C.ink,
              color: C.cream,
              transform: `translateY(${(1 - c2) * 900}px) rotate(${(1 - c2) * -8}deg)`,
              padding: 60,
              boxSizing: 'border-box',
              boxShadow: '0 40px 0 rgba(0,0,0,.18)',
            }}
          >
            <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 30, color: C.orange, letterSpacing: '0.12em'}}>● СЕЙЧАС</div>
            <div style={{fontFamily: F.cond, fontWeight: 700, fontSize: 138, lineHeight: '128px', marginTop: 30}}>
              ПОЗВОНИТЬ
              <br />
              МАМЕ
            </div>
          </div>
        )}

        {/* hidden counter */}
        <div
          style={{
            position: 'absolute',
            top: 1290,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 38, color: C.ink, letterSpacing: '0.08em'}}>СПРЯТАНО</div>
          <div
            style={{
              height: 110,
              width: 190,
              overflow: 'hidden',
              background: C.ink,
              borderRadius: 28,
              position: 'relative',
            }}
          >
            {[46, 45, 44].map((n, i) => {
              const at = i === 0 ? -99 : i === 1 ? 17 : 31;
              const nxt = i === 0 ? 17 : i === 1 ? 31 : 999;
              const inP = clamp((f - at) / 5);
              const outP = clamp((f - nxt) / 5);
              const y = i === 0 ? -outP * 120 : (1 - inP) * 120 - outP * 120;
              if (f < at || f > nxt + 6) return null;
              return (
                <div
                  key={n}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    textAlign: 'center',
                    fontFamily: F.display,
                    fontWeight: 900,
                    fontSize: 78,
                    lineHeight: '110px',
                    color: C.lime,
                    transform: `translateY(${y}px)`,
                  }}
                >
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
